
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getCountFromServer,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { unlockStudentCourse } from "./examApi";

const translations = {
  am: {
    title: "የአስተዳዳሪ መቆጣጠሪያ",
    students: "ተማሪዎች",
    courses: "ትምህርቶች",
    results: "የፈተና ውጤቶች",
    certificates: "ሰርተፊኬቶች",
    certificateReport: "የሰርተፍኬት ሪፖርት",
    unlockCourse: "ኮርሱን እንደገና ክፈት",
    unlockSuccess: "ኮርሱ እንደገና ተከፍቷል።",
    certificateCode: "የሰርተፍኬት ቁጥር",
    issuedDate: "የተሰጠበት ቀን",
    noCertificates: "እስካሁን ሰርተፍኬት አልተሰጠም።",
    downloadCertificates: "⬇ የሰርተፍኬት ሪፖርት አውርድ",
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
    unknownStudent: "የተማሪ ስም አልተገኘም",
    progress: "የተማሪዎች የትምህርት ክትትል",
    completed: "የጨረሱት ክፍሎች",
    percentage: "እድገት",
    lastAccess: "መጨረሻ የተከታተሉበት"
  },
  en: {
    title: "Administrator Dashboard",
    students: "Students",
    courses: "Courses",
    results: "Exam Results",
    certificates: "Certificates",
    certificateReport: "Certificate Report",
    unlockCourse: "Reopen course",
    unlockSuccess: "Course reopened successfully.",
    certificateCode: "Certificate number",
    issuedDate: "Issue date",
    noCertificates: "No certificates have been issued yet.",
    downloadCertificates: "⬇ Download Certificate Report",
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
    unknownStudent: "Student name not available",
    progress: "Student Learning Progress",
    completed: "Completed lessons",
    percentage: "Progress",
    lastAccess: "Last accessed"
  },
  om: {
    title: "Bulchiinsa",
    students: "Barattoota",
    courses: "Barnoota",
    results: "Bu'aa Qormaataa",
    certificates: "Ragaa",
    certificateReport: "Gabaasa Ragaa",
    unlockCourse: "Barnoota irra deebi'i bani",
    unlockSuccess: "Barnoonni irra deebi'ee banameera.",
    certificateCode: "Lakkoofsa ragaa",
    issuedDate: "Guyyaa kenname",
    noCertificates: "Ammaaf ragaan hin kennamne.",
    downloadCertificates: "⬇ Gabaasa ragaa buusi",
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
    unknownStudent: "Maqaan barataa hin argamne",
    progress: "Hordoffii Barnoota Barattootaa",
    completed: "Barnoota xumurame",
    percentage: "Guddina",
    lastAccess: "Yeroo dhumaa"
  }
};

function asDate(value) {
  if (!value) return null;

  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : typeof value?.seconds === "number"
        ? new Date(value.seconds * 1000)
        : typeof value?._seconds === "number"
          ? new Date(value._seconds * 1000)
          : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = asDate(value);
  return date ? date.toLocaleString() : "—";
}

function csvCell(value) {
  return '"' + String(value ?? "").replace(/"/g, '""') + '"';
}

function downloadCsv(filename, rows) {
  const csv =
    "\uFEFF" +
    rows.map(row => row.map(csvCell).join(",")).join("\r\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export default function Admin({
  profile,
  language = "am",
  onNavigate
}) {
  const t = translations[language] || translations.am;

  const [counts, setCounts] = useState({
    students: 0,
    courses: 0,
    results: 0,
    certificates: 0
  });

  const [examResults, setExamResults] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [learningProgress, setLearningProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unlockingId, setUnlockingId] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  async function handleUnlockCourse(item) {
    if (!item.userId || !item.courseId) {
      setError("Student ID or course ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Reopen "${item.courseTitle || item.courseId}" for ${item.studentName || item.userId}?`
    );
    if (!confirmed) return;

    const key = `${item.userId}_${item.courseId}`;
    setUnlockingId(key);
    setError("");
    setActionMessage("");

    try {
      await unlockStudentCourse(item.courseId, item.userId);
      setActionMessage(t.unlockSuccess);
    } catch (unlockError) {
      setError(unlockError.message || t.error);
    } finally {
      setUnlockingId("");
    }
  }

  async function loadDashboard() {
    if (profile?.role !== "admin") return;

    setLoading(true);
    setError("");

    try {
      // 1. Load exam results first.
      const resultSnapshot = await getDocs(
        collection(db, "results")
      );

      const rawResults = resultSnapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));

      rawResults.sort((a, b) => {
        return (
          (asDate(b.createdAt)?.getTime() || 0) -
          (asDate(a.createdAt)?.getTime() || 0)
        );
      });

      // Show results immediately, before loading other dashboard data.
      setExamResults(rawResults);

      setCounts(previous => ({
        ...previous,
        results: resultSnapshot.size
      }));

      // 2. Load learning progress.
      let rawProgress = [];

      try {
        const progressSnapshot = await getDocs(
          collection(db, "courseProgress")
        );

        rawProgress = progressSnapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }));
      } catch (progressError) {
        console.warn("Learning progress load error:", progressError);
      }

      // 3. Load issued certificates.
      const certificateSnapshot = await getDocs(
        collection(db, "certificates")
      );

      const rawCertificates = certificateSnapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));

      rawCertificates.sort((a, b) => {
        return (
          (asDate(b.issuedAt || b.createdAt)?.getTime() || 0) -
          (asDate(a.issuedAt || a.createdAt)?.getTime() || 0)
        );
      });

      // 4. Load dashboard counts.
      const collections = [
        ["students", "users"],
        ["courses", "courses"],
        ["certificates", "certificates"]
      ];

      const countResults = await Promise.all(
        collections.map(async ([key, collectionName]) => {
          try {
            const snapshot = await getCountFromServer(
              collection(db, collectionName)
            );

            return [key, snapshot.data().count];
          } catch (countError) {
            console.warn("Count error:", collectionName, countError);
            return [key, 0];
          }
        })
      );

      setCounts(previous => ({
        ...previous,
        ...Object.fromEntries(countResults),
        results: resultSnapshot.size
      }));

      // 5. Load student names.
      const userIds = [
        ...new Set([
          ...rawResults.map(item => item.userId),
          ...rawProgress.map(item => item.userId),
          ...rawCertificates.map(item => item.userId)
        ].filter(Boolean))
      ];

      const userProfiles = await Promise.all(
        userIds.map(async userId => {
          try {
            const snapshot = await getDoc(
              doc(db, "users", userId)
            );

            return [
              userId,
              snapshot.exists() ? snapshot.data() : null
            ];
          } catch (profileError) {
            console.warn("Student profile error:", profileError);
            return [userId, null];
          }
        })
      );

      const profileMap = Object.fromEntries(userProfiles);

      function getStudentName(userId) {
        const student = profileMap[userId] || {};

        return (
          student.name ||
          student.displayName ||
          student.fullName ||
          student.email ||
          userId ||
          t.unknownStudent
        );
      }

      // 6. Attach student names to exam results and certificates.
      setExamResults(
        rawResults.map(item => ({
          ...item,
          studentName: getStudentName(item.userId)
        }))
      );

      setCertificates(
        rawCertificates.map(item => ({
          ...item,
          studentName:
            item.userName || getStudentName(item.userId)
        }))
      );

      // 6. Prepare learning progress.
      rawProgress.sort((a, b) => {
        return (
          (asDate(b.lastAccessedAt || b.updatedAt)?.getTime() || 0) -
          (asDate(a.lastAccessedAt || a.updatedAt)?.getTime() || 0)
        );
      });

      setLearningProgress(
        rawProgress.map(item => {
          const completed = Array.isArray(item.completedLessonIds)
            ? item.completedLessonIds.length
            : 0;

          const total = Number(item.totalLessons) || 0;

          return {
            ...item,
            studentName: getStudentName(item.userId),
            completedLessons: completed,
            progressPercent: total
              ? Math.round((completed / total) * 100)
              : 0
          };
        })
      );

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
  }, [profile?.role]);

  if (profile?.role !== "admin") {
    return (
      <section className="admin-panel">
        <h2>{t.denied}</h2>
      </section>
    );
  }

  const cards = [
    {
      key: "students",
      label: t.students,
      value: counts.students
    },
    {
      key: "courses",
      label: t.courses,
      value: counts.courses,
      page: "courses"
    },
    {
      key: "results",
      label: t.results,
      value: counts.results,
      page: "results"
    },
    {
      key: "certificates",
      label: t.certificates,
      value: counts.certificates,
      page: "certificates"
    }
  ];

  return (
    <section className="admin-panel">
      <h2>{t.title}</h2>

      <p>{profile.name || profile.email || ""}</p>

      <button
        type="button"
        onClick={loadDashboard}
        disabled={loading}
      >
        {loading ? t.loading : t.refresh}
      </button>

      {error && (
        <p role="alert" className="error-message">
          {t.error} {error}
        </p>
      )}
      {actionMessage && <p role="status">{actionMessage}</p>}

      <div className="admin-dashboard-grid">
        {cards.map(card => (
          <article
            key={card.key}
            className="admin-stat-card"
          >
            <h3>{card.label}</h3>

            <strong>
              {loading ? "..." : card.value}
            </strong>

            {card.page && (
              <button
                type="button"
                onClick={() => onNavigate?.(card.page)}
              >
                {t.open}
              </button>
            )}
          </article>
        ))}
      </div>

      {/* EXAM RESULTS */}
      <div className="admin-results-section">
        <h3>{t.resultList}</h3>

        {!loading && examResults.length > 0 && (
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                "digital-learning-exam-results.csv",
                [
                  [
                    "Student",
                    "Student ID",
                    "Course",
                    "Score (%)",
                    "Correct answers",
                    "Total questions",
                    "Passed",
                    "Exam date"
                  ],
                  ...examResults.map(item => [
                    item.studentName || item.userId,
                    item.userId,
                    item.courseTitle || item.courseId,
                    item.score ?? 0,
                    item.correctAnswers ?? 0,
                    item.totalQuestions ?? 0,
                    item.passed ? "Yes" : "No",
                    formatDate(item.createdAt)
                  ])
                ]
              )
            }
          >
            ⬇ Excel – Exam Results (CSV)
          </button>
        )}

        {loading ? (
          <p>{t.loading}</p>
        ) : examResults.length === 0 ? (
          <p>{t.noResults}</p>
        ) : (
          <div className="admin-results-list">
            {examResults.map(item => (
              <article
                key={item.id}
                className="admin-stat-card admin-result-card"
              >
                <h4>
                  {item.studentName || t.unknownStudent}
                </h4>

                <p>
                  <strong>{t.course}:</strong>{" "}
                  {item.courseTitle || item.courseId || "—"}
                </p>

                <p>
                  <strong>{t.score}:</strong>{" "}
                  {item.score ?? 0}%
                </p>

                <p>
                  <strong>{t.correct}:</strong>{" "}
                  {item.correctAnswers ?? 0} /{" "}
                  {item.totalQuestions ?? 0}
                </p>

                <p>
                  <strong>{t.status}:</strong>{" "}
                  <span
                    className={
                      item.passed
                        ? "result-passed"
                        : "result-failed"
                    }
                  >
                    {item.passed ? t.passed : t.failed}
                  </span>
                </p>

                <p>
                  <strong>{t.date}:</strong>{" "}
                  {formatDate(item.createdAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* CERTIFICATE REPORT */}
      <div className="admin-results-section">
        <h3>{t.certificateReport}</h3>

        {!loading && certificates.length > 0 && (
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                "digital-learning-certificates.csv",
                [
                  ["Student", "Student ID", "Course", "Certificate number", "Issue date"],
                  ...certificates.map(item => [
                    item.studentName || item.userId,
                    item.userId,
                    item.courseTitle || item.courseId || "—",
                    item.certificateCode || item.id,
                    formatDate(item.issuedAt || item.createdAt)
                  ])
                ]
              )
            }
          >
            {t.downloadCertificates}
          </button>
        )}

        {loading ? (
          <p>{t.loading}</p>
        ) : certificates.length === 0 ? (
          <p>{t.noCertificates}</p>
        ) : (
          <div className="admin-results-list">
            {certificates.map(item => (
              <article
                key={item.id}
                className="admin-stat-card admin-result-card"
              >
                <h4>{item.studentName || t.unknownStudent}</h4>
                <p>
                  <strong>{t.course}:</strong>{" "}
                  {item.courseTitle || item.courseId || "—"}
                </p>
                <p>
                  <strong>{t.certificateCode}:</strong>{" "}
                  {item.certificateCode || item.id}
                </p>
                <p>
                  <strong>{t.issuedDate}:</strong>{" "}
                  {formatDate(item.issuedAt || item.createdAt)}
                </p>
                {item.userId && item.courseId && (
                  <button
                    type="button"
                    onClick={() => handleUnlockCourse(item)}
                    disabled={unlockingId === `${item.userId}_${item.courseId}`}
                  >
                    {unlockingId === `${item.userId}_${item.courseId}`
                      ? t.loading
                      : t.unlockCourse}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* LEARNING PROGRESS */}
      <div className="admin-results-section">
        <h3>{t.progress}</h3>

        {!loading && learningProgress.length > 0 && (
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                "digital-learning-progress.csv",
                [
                  [
                    "Student",
                    "Student ID",
                    "Course",
                    "Completed lessons",
                    "Total lessons",
                    "Progress (%)",
                    "Last accessed"
                  ],
                  ...learningProgress.map(item => [
                    item.studentName,
                    item.userId,
                    item.courseTitle || item.courseId,
                    item.completedLessons,
                    item.totalLessons ?? 0,
                    item.progressPercent,
                    formatDate(
                      item.lastAccessedAt || item.updatedAt
                    )
                  ])
                ]
              )
            }
          >
            ⬇ Excel – Learning Progress (CSV)
          </button>
        )}

        {loading ? (
          <p>{t.loading}</p>
        ) : learningProgress.length === 0 ? (
          <p>
            ገና የትምህርት ክትትል መረጃ የለም።
            ተማሪዎች ክፍሎችን ሲያጠናቅቁ እዚህ ይታያሉ።
          </p>
        ) : (
          learningProgress.map(item => (
            <article
              key={item.id}
              className="admin-stat-card admin-result-card"
            >
              <h4>{item.studentName}</h4>

              <p>
                <strong>{t.course}:</strong>{" "}
                {item.courseTitle || item.courseId || "—"}
              </p>

              <p>
                <strong>{t.completed}:</strong>{" "}
                {item.completedLessons} /{" "}
                {item.totalLessons ?? 0}
              </p>

              <p>
                <strong>{t.percentage}:</strong>{" "}
                {item.progressPercent}%
              </p>

              <p>
                <strong>{t.lastAccess}:</strong>{" "}
                {formatDate(
                  item.lastAccessedAt || item.updatedAt
                )}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
