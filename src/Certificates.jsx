
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "./firebase";

const translations = {
  am: {
    title: "የእኔ ሰርተፊኬቶች",
    loading: "በመጫን ላይ...",
    empty: "እስካሁን ሰርተፊኬት አላገኘህም።",
    student: "የተማሪ ስም",
    course: "የትምህርት ስም",
    code: "የሰርተፊኬት ቁጥር",
    date: "የተሰጠበት ቀን",
    print: "ሰርተፊኬቱን አትም",
    error: "ሰርተፊኬቶችን መጫን አልተቻለም።",
    issued: "የተሳካ ምስክር ወረቀት",
    organization: "Digital Learning Ethiopia"
  },
  en: {
    title: "My Certificates",
    loading: "Loading...",
    empty: "You have not earned a certificate yet.",
    student: "Student name",
    course: "Course title",
    code: "Certificate number",
    date: "Issue date",
    print: "Print certificate",
    error: "Could not load certificates.",
    issued: "Certificate of Achievement",
    organization: "Digital Learning Ethiopia"
  },
  om: {
    title: "Ragaa Koo",
    loading: "Fe'amaa jira...",
    empty: "Ammaaf ragaa hin arganne.",
    student: "Maqaa barataa",
    course: "Maqaa barnootaa",
    code: "Lakkoofsa ragaa",
    date: "Guyyaa kenname",
    print: "Ragaa maxxansi",
    error: "Ragaa fe'uun hin danda'amne.",
    issued: "Ragaa Milkaa'inaa",
    organization: "Digital Learning Ethiopia"
  }
};

export default function Certificates({ user, language = "am" }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = translations[language] || translations.am;

  useEffect(() => {
    let active = true;

    async function loadCertificates() {
      if (!user?.uid) {
        setCertificates([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const q = query(
          collection(db, "certificates"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const items = snapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }));

        function getTimestamp(value) {
          if (!value) return 0;
          if (typeof value === "string" || typeof value === "number") {
            const parsed = new Date(value).getTime();
            return Number.isFinite(parsed) ? parsed : 0;
          }
          if (typeof value.toMillis === "function") return value.toMillis();
          if (typeof value.seconds === "number") return value.seconds * 1000;
          if (typeof value._seconds === "number") return value._seconds * 1000;
          return 0;
        }

        items.sort((a, b) => {
          const dateA = getTimestamp(a.issuedAt || a.createdAt);
          const dateB = getTimestamp(b.issuedAt || b.createdAt);
          return dateB - dateA;
        });

        if (active) setCertificates(items);
      } catch (err) {
        console.error("Certificate loading error:", err);
        if (active) setError(t.error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCertificates();

    return () => {
      active = false;
    };
  }, [user?.uid, language]);

  function formatDate(certificate) {
    const timestamp = certificate.issuedAt || certificate.createdAt;
    if (!timestamp) return "—";

    let date;
    if (typeof timestamp === "string" || typeof timestamp === "number") {
      date = new Date(timestamp);
    } else if (typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (typeof timestamp.seconds === "number") {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp._seconds === "number") {
      date = new Date(timestamp._seconds * 1000);
    } else {
      return "—";
    }

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString(
      language === "am" ? "am-ET" :
      language === "om" ? "om-ET" : "en"
    );
  }

  return (
    <section className="certificates-page">
      <h2>{t.title}</h2>

      {loading && <p>{t.loading}</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && certificates.length === 0 && (
        <p>{t.empty}</p>
      )}

      <div className="certificate-list">
        {certificates.map(certificate => (
          <article
            className="certificate-card"
            key={certificate.id}
          >
            <div className="certificate-content">
              <h2>{t.organization}</h2>
              <h3>{t.issued}</h3>

              <p>
                {t.student}:{" "}
                <strong>{certificate.userName || user?.displayName || "—"}</strong>
              </p>

              <p>
                {t.course}:{" "}
                <strong>{certificate.courseTitle || "—"}</strong>
              </p>

              <p>
                {t.code}:{" "}
                <strong>
                  {certificate.certificateCode || certificate.id}
                </strong>
              </p>

              <p>
                {t.date}: {formatDate(certificate)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
            >
              {t.print}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
