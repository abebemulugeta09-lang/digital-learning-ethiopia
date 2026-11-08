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

function formatDate(value) {
  if (!value) return "—";
  const date = typeof value?.toDate === "function"
    ? value.toDate()
    : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const collectionNames = [
        ["students", "users"],
        ["courses", "courses"],
        ["results", "results"],
        ["certificates", "certificates"]
      ];

      const [countValues, resultSnapshot] = await Promise.all([
        Promise.all(collectionNames.map(async ([key, collectionName]) => {
          const snapshot = await getCountFromServer(collection(db, collectionName));
          return [key, snapshot.data().count];
        })),
        getDocs(collection(db, "results"))
      ]);

      setCounts(Object.fromEntries(countValues));

      const rawResults = resultSnapshot.docs.map(resultDoc => ({
        id: resultDoc.id,
        ...resultDoc.data()
      }));

      rawResults.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime() || 0;
        const dateB = new Date(b.createdAt || 0).getTime() || 0;
        return dateB - dateA;
      });

      const userIds = [...new Set(rawResults.map(item => item.userId).filter(Boolean))];
      const userProfiles = await Promise.all(userIds.map(async userId => {
        try {
          const userSnapshot = await getDoc(doc(db, "users", userId));
          if (!userSnapshot.exists()) return [userId, null];
          return [userId, userSnapshot.data()];
        } catch (userError) {
          console.warn("Could not load student profile:", userError);
          return [userId, null];
        }
      }));

      const profileMap = Object.fromEntries(userProfiles);
      setExamResults(rawResults.map(item => {
        const studentProfile = profileMap[item.userId] || {};
        return {
          ...item,
          studentName:
            studentProfile.name ||
            studentProfile.displayName ||
            studentProfile.fullName ||
            studentProfile.email ||
            t.unknownStudent
        };
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
    </section>
  );
}
