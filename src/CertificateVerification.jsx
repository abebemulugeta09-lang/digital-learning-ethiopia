import { useEffect, useState } from "react";

const API_BASE =
  "https://digital-learning-ethiopia-exam-api.abebemulugeta09.workers.dev";

const labels = {
  am: {
    title: "የሰርተፊኬት ማረጋገጫ",
    checking: "ሰርተፊኬቱን በማረጋገጥ ላይ...",
    valid: "ትክክለኛ ሰርተፊኬት ነው",
    invalid: "ይህ ሰርተፊኬት አልተገኘም ወይም ትክክለኛ አይደለም።",
    code: "የሰርተፊኬት ቁጥር",
    course: "የትምህርት ስም",
    date: "የተሰጠበት ቀን",
    back: "ወደ መነሻ ተመለስ",
    error: "ማረጋገጫው አልተሳካም። እባክህ ቆይተህ እንደገና ሞክር።"
  },
  en: {
    title: "Certificate Verification",
    checking: "Verifying certificate...",
    valid: "This is a valid certificate",
    invalid: "This certificate was not found or is not valid.",
    code: "Certificate number",
    course: "Course",
    date: "Issue date",
    back: "Return to home",
    error: "Verification failed. Please try again later."
  },
  om: {
    title: "Mirkaneessa Ragaa",
    checking: "Ragaan mirkanaa'aa jira...",
    valid: "Ragaan kun sirrii dha",
    invalid: "Ragaan kun hin argamne ykn sirrii miti.",
    code: "Lakkoofsa ragaa",
    course: "Maqaa barnootaa",
    date: "Guyyaa kenname",
    back: "Gara jalqabaatti deebi'i",
    error: "Mirkaneessuun hin milkoofne. Maaloo irra deebi'ii yaali."
  }
};

export default function CertificateVerification({ code, language = "am" }) {
  const [status, setStatus] = useState("loading");
  const [certificate, setCertificate] = useState(null);
  const t = labels[language] || labels.am;

  useEffect(() => {
    let active = true;

    async function verify() {
      setStatus("loading");
      try {
        const response = await fetch(
          `${API_BASE}/api/certificates/verify/${encodeURIComponent(code)}`
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Verification service unavailable.");
        }

        if (active && data.valid && data.certificate) {
          setCertificate(data.certificate);
          setStatus("valid");
        } else if (active) {
          setCertificate(null);
          setStatus("invalid");
        }
      } catch (error) {
        console.error("Certificate verification error:", error);
        if (active) setStatus("error");
      }
    }

    if (code) verify();
    else setStatus("invalid");

    return () => {
      active = false;
    };
  }, [code]);

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(
      language === "am" ? "am-ET" : language === "om" ? "om-ET" : "en"
    );
  }

  return (
    <main style={{ maxWidth: "620px", margin: "35px auto", padding: "22px", fontFamily: "Arial, sans-serif" }}>
      <section style={{ border: "1px solid #dbe2ea", borderRadius: "14px", padding: "24px", textAlign: "center", boxShadow: "0 5px 20px rgba(0,0,0,.06)" }}>
        <h1>Digital Learning Ethiopia</h1>
        <h2>{t.title}</h2>
        {status === "loading" && <p>{t.checking}</p>}
        {status === "valid" && certificate && (
          <>
            <div style={{ color: "#15803d", fontSize: "20px", fontWeight: "bold", margin: "22px 0" }}>
              ✓ {t.valid}
            </div>
            <p>{t.code}: <strong>{certificate.certificateCode}</strong></p>
            <p>{t.course}: <strong>{certificate.courseTitle || "—"}</strong></p>
            <p>{t.date}: <strong>{formatDate(certificate.issuedAt)}</strong></p>
          </>
        )}
        {status === "invalid" && <p role="alert" style={{ color: "#b91c1c" }}>{t.invalid}</p>}
        {status === "error" && <p role="alert">{t.error}</p>}
        <button type="button" onClick={() => { window.location.href = window.location.origin; }} style={{ marginTop: "18px", padding: "10px 18px", borderRadius: "8px", border: 0, cursor: "pointer" }}>
          {t.back}
        </button>
      </section>
    </main>
  );
}
