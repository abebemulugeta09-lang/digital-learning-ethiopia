import { useEffect, useState } from "react";
import {
  collection,
  getCountFromServer,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";

const translations = {
  am: {
    title: "የአስተዳዳሪ መቆጣጠሪያ",
    students: "ተማሪዎች",
    courses: "ትምህርቶች",
    results: "የፈተና ውጤቶች",
    certificates: "ሰርተፊኬቶች",
    loading: "መረጃ በመጫን ላይ...",
    refresh: "እንደገና ጫን",
    open: "ክፈት",
    error: "መረጃውን መጫን አልተቻለም።",
    denied: "ይህን ገጽ ለማየት የአስተዳዳሪ ፈቃድ ያስፈልጋል።",
    resultList: "የተማሪዎች የፈተና ውጤት ዝርዝር",
    student: "የተማሪ ስም",
    course: "ኮርስ",
    score: "ውጤት",
    correct: "ትክክለኛ መልሶች",
    total: "ጥያቄዎች",
    status: "ውጤት",
    passed: "አልፏል",
    failed: "አላለፈም",
    date: "ቀን",
    noResults: "እስካሁን የፈተና ውጤት የለም።",
    unknownStudent: "የተማሪ ስም አልተገኘም"
  },
  en: {
    title: "Administrator Dashboard",
    students: "Students",
    courses: "Courses",
    results: "Exam Results",
    certificates: "Certificates",
    loading: "Loading data...",
    refresh: "Refresh",
    open: "Open",
    error: "Could not load dashboard data.",
    denied: "Administrator permission is required.",
    resultList: "Student Exam Results",
    student: "Student",
    course: "Course",
    score: "Score",
    correct: "Correct answers",
    total: "Questions",
    status: "Status",
    passed: "Passed",
    failed: "Failed",
    date: "Date",
    noResults: "No exam results have been submitted yet.",
    unknownStudent: "Student name not available"
  },
  om: {
    title: "Bulchiinsa",
    students: "Barattoota",
    courses: "Barnoota",
    results: "Bu'aa Qormaataa",
    certificates: "Ragaa",
    loading: "Odeeffannoon fe'amaa jira...",
    refresh: "Irra deebi'i fe'i",
    open: "Bani",
    error: "Odeeffannoo fe'uun hin danda'amne.",
    denied: "Hayyamni bulchiinsaa barbaachisa.",
    resultList: "Bu'aa Qormaata Barattootaa",
    student: "Barataa",
    course: "Barnoota",
    score: "Qabxii",
    correct: "Deebii sirrii",
    total: "Gaaffilee",
    status: "Haala",
    passed: "Darbeera",
    failed: "Hin dabarre",
    date: "Guyyaa",
    noResults: "Ammaaf bu'aan qormaataa hin jiru.",
    unknownStudent: "Maqaan barataa hin argamne"
  }
};

function asDate(value) {
  if (!value) return null;
  const date = typeof value?.toDate === "function" ? value.toDate()
    : typeof value?.seconds === "number" ? new Date(value.seconds * 1000)
    : typeof value?._seconds === "number" ? new Date(value._seconds * 1000)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function formatDate(value) {
  const date = asDate(value);
  return date ? date.toLocaleString() : "—";
}
function csvCell(value) {
  return '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"';
}
function downloadCsv(filename, rows) {
  const csv = "\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  URL.revokeObjectURL(url);
}

export default function Admin({ profile, language = "am", onNavigate }) {
  const t = translations[language] || translations.am;
  const [counts, setCounts] = useState({
    students: 0,
    courses: 0,
    results: 0,
    certificates: 0
  });
  const [examResults, setExamResults] = useState([]);
  const [learningProgress, setLearningProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const resultSnapshot = await getDocs(collection(db, "results"));
      let progressSnapshot = { docs: [] };
      try {
        progressSnapshot = await getDocs(collection(db, "courseProgress"));
      } catch (progressError) {
        console.warn("Could not load course progress:", progressError);
      }

      const countEntries = await Promise.all([
        ["students", "users"], ["courses", "courses"],
        ["results", "results"], ["certificates", "certificates"]
      ].map(async ([key, collectionName]) => {
        try {
          const snapshot = await getCountFromServer(collection(db, collectionName));
          return [key, snapshot.data().count];
        } catch (countError) {
          console.warn("Could not count " + collectionName + ":", countError);
          return [key, key === "results" ? resultSnapshot.size : 0];
        }
      }));
      setCounts(Object.fromEntries(countEntries));

      const rawResults = resultSnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
      rawResults.sort((a, b) => (asDate(b.createdAt)?.getTime() || 0) - (asDate(a.createdAt)?.getTime() || 0));
      const rawProgress = progressSnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
      rawProgress.sort((a, b) =>
        (asDate(b.lastAccessedAt || b.updatedAt)?.getTime() || 0) -
        (asDate(a.lastAccessedAt || a.updatedAt)?.getTime() || 0)
      );

      const userIds = [...new Set([
        ...rawResults.map(item => item.userId), ...rawProgress.map(item => item.userId)
      ].filter(Boolean))];
      const userProfiles = await Promise.all(userIds.map(async userId => {
        try {
          const snap = await getDoc(doc(db, "users", userId));
          return [userId, snap.exists() ? snap.data() : null];
        } catch (error) {
          console.warn("Could not load student profile:", error);
          return [userId, null];
        }
      }));
      const profileMap = Object.fromEntries(userProfiles);
      const getStudentName = userId => {
        const p = profileMap[userId] || {};
        return p.name || p.displayName || p.fullName || p.email || userId || t.unknownStudent;
      };
      setExamResults(rawResults.map(item => ({ ...item, studentName: getStudentName(item.userId) })));
      setLearningProgress(rawProgress.map(item => {
        const completed = Array.isArray(item.completedLessonIds) ? item.completedLessonIds.length : 0;
        const total = Number(item.totalLessons) || 0;
        return { ...item, studentName: getStudentName(item.userId),
          completedLessons: completed, progressPercent: total ? Math.round(completed / total * 100) : 0 };
      }));
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (profile?.role === "admin") {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [profile]);

  if (profile?.role !== "admin") {
    return (
      <section className="admin-panel">
        <h2>{t.denied}</h2>
      </section>
    );
  }

  const cards = [
    { key: "students", label: t.students, value: counts.students },
    { key: "courses", label: t.courses, value: counts.courses, page: "courses" },
    { key: "results", label: t.results, value: counts.results, page: "results" },
    { key: "certificates", label: t.certificates, value: counts.certificates, page: "certificates" }
  ];

  return (
    <section className="admin-panel">
      <h2>{t.title}</h2>
      <p>{profile.name || profile.email || ""}</p>

      <button type="button" onClick={loadDashboard} disabled={loading}>
        {t.refresh}
      </button>

      {loading && <p>{t.loading}</p>}
      {error && <p role="alert" className="error-message">{t.error} {error}</p>}

      <div className="admin-dashboard-grid">
        {cards.map(card => (
          <article key={card.key} className="admin-stat-card">
            <h3>{card.label}</h3>
            <strong>{loading ? "..." : card.value}</strong>
            {card.page && (
              <button type="button" onClick={() => onNavigate?.(card.page)}>
                {t.open}
              </button>
            )}
          </article>
        ))}
      </div>

      <div className="admin-results-section">
        <h3>{t.resultList}</h3>
        {!loading && examResults.length > 0 && (
          <button type="button" onClick={() => downloadCsv("digital-learning-exam-results.csv", [
            ["Student", "Student ID", "Course", "Score (%)", "Correct answers", "Total questions", "Passed", "Exam date"],
            ...examResults.map(item => [item.studentName, item.userId, item.courseTitle || item.courseId,
              item.score ?? 0, item.correctAnswers ?? 0, item.totalQuestions ?? 0,
              item.passed ? "Yes" : "No", formatDate(item.createdAt)])
          ])}>⬇ Excel – Exam Results (CSV)</button>
        )}
        {loading ? (
          <p>{t.loading}</p>
        ) : examResults.length === 0 ? (
          <p>{t.noResults}</p>
        ) : (
          <div className="admin-results-list">
            {examResults.map(item => (
              <article key={item.id} className="admin-stat-card admin-result-card">
                <h4>{item.studentName}</h4>
                <p><strong>{t.course}:</strong> {item.courseTitle || item.courseId || "—"}</p>
                <p><strong>{t.score}:</strong> {item.score ?? 0}%</p>
                <p><strong>{t.correct}:</strong> {item.correctAnswers ?? 0} / {item.totalQuestions ?? 0}</p>
                <p>
                  <strong>{t.status}:</strong>{" "}
                  <span className={item.passed ? "result-passed" : "result-failed"}>
                    {item.passed ? t.passed : t.failed}
                  </span>
                </p>
                <p><strong>{t.date}:</strong> {formatDate(item.createdAt)}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="admin-results-section">
        <h3>የተማሪዎች የትምህርት ክትትል</h3>
        {!loading && learningProgress.length > 0 && (
          <button type="button" onClick={() => downloadCsv("digital-learning-progress.csv", [
            ["Student", "Student ID", "Course", "Completed lessons", "Total lessons", "Progress (%)", "Last accessed"],
            ...learningProgress.map(item => [item.studentName, item.userId, item.courseTitle || item.courseId,
              item.completedLessons, item.totalLessons ?? 0, item.progressPercent,
              formatDate(item.lastAccessedAt || item.updatedAt)])
          ])}>⬇ Excel – Learning Progress (CSV)</button>
        )}
        {loading ? <p>{t.loading}</p> : learningProgress.length === 0 ? (
          <p>ገና የትምህርት ክትትል መረጃ የለም። ተማሪዎች ክፍሎችን ሲያጠናቅቁ እዚህ ይታያሉ።</p>
        ) : learningProgress.map(item => (
          <article key={item.id} className="admin-stat-card admin-result-card">
            <h4>{item.studentName}</h4>
            <p><strong>ኮርስ:</strong> {item.courseTitle || item.courseId || "—"}</p>
            <p><strong>የጨረሱት ክፍሎች:</strong> {item.completedLessons} / {item.totalLessons ?? 0}</p>
            <p><strong>እድገት:</strong> {item.progressPercent}%</p>
            <p><strong>መጨረሻ የተከታተሉበት:</strong> {formatDate(item.lastAccessedAt || item.updatedAt)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
