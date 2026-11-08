
import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
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
    denied: "ይህን ገጽ ለማየት የአስተዳዳሪ ፈቃድ ያስፈልጋል።"
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
    denied: "Administrator permission is required."
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
    denied: "Hayyamni bulchiinsaa barbaachisa."
  }
};

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const collections = [
        ["students", "users"],
        ["courses", "courses"],
        ["results", "results"],
        ["certificates", "certificates"]
      ];

      const values = await Promise.all(
        collections.map(async ([key, collectionName]) => {
          const snapshot = await getCountFromServer(
            collection(db, collectionName)
          );

          return [key, snapshot.data().count];
        })
      );

      setCounts(Object.fromEntries(values));
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
    {
      key: "students",
      label: t.students,
      value: counts.students,
      page: null
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

      <p>
        {profile.name || profile.email || ""}
      </p>

      <button
        type="button"
        onClick={loadDashboard}
        disabled={loading}
      >
        {t.refresh}
      </button>

      {loading && <p>{t.loading}</p>}

      {error && (
        <p role="alert" className="error-message">
          {t.error} {error}
        </p>
      )}

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
    </section>
  );
}
