import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { QRCodeSVG } from "qrcode.react";

const translations = {
  am: {
    title: "የእኔ ሰርተፊኬቶች",
    loading: "በመጫን ላይ...",
    empty: "እስካሁን ሰርተፊኬት አላገኘህም።",
    print: "ሰርተፊኬቱን አትም",
    error: "ሰርተፊኬቶችን መጫን አልተቻለም።"
  },
  en: {
    title: "My Certificates",
    loading: "Loading...",
    empty: "You have not earned a certificate yet.",
    print: "Print certificate",
    error: "Could not load certificates."
  },
  om: {
    title: "Ragaa Koo",
    loading: "Fe'amaa jira...",
    empty: "Ammaaf ragaa hin arganne.",
    print: "Ragaa maxxansi",
    error: "Ragaa fe'uun hin danda'amne."
  }
};

function getDate(value, language = "en") {
  if (!value) return "—";
  let date;
  if (typeof value === "string" || typeof value === "number") date = new Date(value);
  else if (typeof value.toDate === "function") date = value.toDate();
  else if (typeof value.seconds === "number") date = new Date(value.seconds * 1000);
  else if (typeof value._seconds === "number") date = new Date(value._seconds * 1000);
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(language === "am" ? "am-ET" : language === "om" ? "om-ET" : "en", {
    day: "2-digit", month: "long", year: "numeric"
  });
}

export default function Certificates({ user, language = "am" }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const t = translations[language] || translations.am;

  function printCertificate(event) {
    const card = event.currentTarget.closest(".certificate-card");
    if (!card) return;

    document.querySelectorAll(".certificate-card.printing").forEach(item => {
      item.classList.remove("printing");
    });

    card.classList.add("printing");
    document.body.classList.add("print-single-certificate");

    const cleanup = () => {
      card.classList.remove("printing");
      document.body.classList.remove("print-single-certificate");
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.print();
  }

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
        const q = query(collection(db, "certificates"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
        const millis = value => {
          if (!value) return 0;
          if (typeof value === "string" || typeof value === "number") return new Date(value).getTime() || 0;
          if (typeof value.toMillis === "function") return value.toMillis();
          if (typeof value.seconds === "number") return value.seconds * 1000;
          return 0;
        };
        items.sort((a, b) => millis(b.issuedAt || b.createdAt) - millis(a.issuedAt || a.createdAt));
        if (active) setCertificates(items);
      } catch (err) {
        console.error("Certificate loading error:", err);
        if (active) setError(t.error);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadCertificates();
    return () => { active = false; };
  }, [user?.uid, language]);

  return (
    <section className="certificates-page">
      <h2 className="certificates-heading">{t.title}</h2>
      {loading && <p>{t.loading}</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && certificates.length === 0 && <p>{t.empty}</p>}

      <div className="certificate-list">
        {certificates.map(certificate => {
          const code = certificate.certificateCode || certificate.id;
          const verifyUrl = `${window.location.origin}/?verify=${encodeURIComponent(code)}`;
          return (
            <article className="certificate-card" key={certificate.id}>
              <div className="certificate-content">
                <div className="certificate-brand">DIGITAL LEARNING ETHIOPIA</div>
                <div className="certificate-rule" />
                <p className="certificate-eyebrow">CERTIFICATE OF COMPLETION</p>
                <p className="certificate-presented">THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>
                <h1 className="certificate-student">{certificate.userName || user?.displayName || "Learner"}</h1>
                <p className="certificate-for">FOR SUCCESSFULLY COMPLETING</p>
                <h2 className="certificate-course">{certificate.courseTitle || "Course"}</h2>
                <p className="certificate-platform">COURSE ON THE DIGITAL LEARNING ETHIOPIA PLATFORM</p>
                <div className="certificate-footer">
                  <div className="certificate-details">
                    <p><strong>DATE:</strong> {getDate(certificate.issuedAt || certificate.createdAt, "en")}</p>
                    <p><strong>UNIQUE CERTIFICATE ID:</strong> {code}</p>
                  </div>
                  <div className="certificate-qr">
                    <QRCodeSVG value={verifyUrl} size={112} level="H" includeMargin title="Scan to verify this certificate" />
                    <span>SCAN TO VERIFY</span>
                  </div>
                </div>
                <div className="certificate-rule certificate-bottom-rule" />
              </div>
              <button type="button" className="certificate-print-button" onClick={printCertificate}>
                {t.print}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
