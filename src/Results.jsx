
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "./firebase";

const text = {
  am: {
    title: "የፈተና ውጤቶች",
    loading: "ውጤቶች በመጫን ላይ...",
    empty: "እስካሁን የፈተና ውጤት የለም።",
    course: "ትምህርት",
    score: "ውጤት",
    correct: "ትክክለኛ መልሶች",
    status: "ሁኔታ",
    passed: "አልፈዋል",
    failed: "አላለፉም",
    date: "የፈተና ቀን",
    error: "ውጤቶችን መጫን አልተቻለም።"
  },
  en: {
    title: "Exam Results",
    loading: "Loading results...",
    empty: "No exam results yet.",
    course: "Course",
    score: "Score",
    correct: "Correct answers",
    status: "Status",
    passed: "Passed",
    failed: "Failed",
    date: "Exam date",
    error: "Could not load results."
  },
  om: {
    title: "Bu'aa Qormaataa",
    loading: "Bu'aan fe'amaa jira...",
    empty: "Ammaaf bu'aan qormaataa hin jiru.",
    course: "Barnoota",
    score: "Bu'aa",
    correct: "Deebii sirrii",
    status: "Haala",
    passed: "Darban",
    failed: "Hin darbne",
    date: "Guyyaa qormaataa",
    error: "Bu'aa fe'uun hin danda'amne."
  }
};

function getDateValue(value) {
  if (!value) return null;

  let date;

  if (typeof value === "string" || typeof value === "number") {
    date = new Date(value);
  } else if (typeof value.toDate === "function") {
    date = value.toDate();
  } else if (typeof value.seconds === "number") {
    date = new Date(value.seconds * 1000);
  } else if (typeof value._seconds === "number") {
    date = new Date(value._seconds * 1000);
  } else {
    return null;
  }

  return Number.isNaN(date.getTime()) ? null : date;
}

export default function Results({ user, language = "am" }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = text[language] || text.am;

  useEffect(() => {
    let active = true;

    async function loadResults() {
      if (!user?.uid) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const q = query(
          collection(db, "results"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const items = snapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }));

        items.sort((a, b) => {
          const dateA = getDateValue(a.createdAt)?.getTime() || 0;
          const dateB = getDateValue(b.createdAt)?.getTime() || 0;
          return dateB - dateA;
        });

        if (active) {
          setResults(items);
        }
      } catch (err) {
        console.error("Results error:", err);
        if (active) setError(t.error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResults();

    return () => {
      active = false;
    };
  }, [user?.uid, language]);

  function formatDate(value) {
    const date = getDateValue(value);

    if (!date) return "—";

    try {
      const locale =
        language === "am" ? "am-ET" :
        language === "om" ? "om-ET" : "en-GB";

      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Africa/Addis_Ababa"
      }).format(date);
    } catch {
      return date.toLocaleString();
    }
  }

  return (
    <section className="results-page">
      <h2>{t.title}</h2>

      {loading && <p>{t.loading}</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && results.length === 0 && (
        <p>{t.empty}</p>
      )}

      {!loading && !error && results.map(result => (
        <article className="result-card" key={result.id}>
          <h3>{result.courseTitle || t.course}</h3>

          <p>
            <strong>{t.score}:</strong>{" "}
            {result.score ?? 0}%
          </p>

          <p>
            <strong>{t.correct}:</strong>{" "}
            {result.correctAnswers ?? 0} / {result.totalQuestions ?? 0}
          </p>

          <p>
            <strong>{t.status}:</strong>{" "}
            <span className={result.passed ? "passed" : "failed"}>
              {result.passed ? t.passed : t.failed}
            </span>
          </p>

          <p>
            <strong>{t.date}:</strong>{" "}
            {formatDate(result.createdAt)}
          </p>
        </article>
      ))}
    </section>
  );
}
