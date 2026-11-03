
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { auth } from "./firebase";

const translations = {
  am: {
    subtitle: "የኢትዮጵያ ዲጂታል የትምህርትና ሰርተፍኬት መድረክ",
    welcome: "እንኳን ወደ Digital Learning Ethiopia በደህና መጡ",
    desc: "ትምህርቶችን ይከታተሉ፣ ፈተናዎችን ይውሰዱ፣ ውጤትዎን ይመልከቱ።",
    login: "ይግቡ",
    register: "አዲስ መለያ ይፍጠሩ",
    name: "ሙሉ ስም",
    email: "ኢሜይል",
    password: "የይለፍ ቃል",
    submitLogin: "ግባ",
    submitRegister: "መለያ ፍጠር",
    switchLogin: "መለያ አለዎት? ይግቡ",
    switchRegister: "መለያ የለዎትም? ይመዝገቡ",
    dashboard: "የተማሪ ዳሽቦርድ",
    signed: "በትክክል ገብተዋል።",
    courses: "ትምህርቶች",
    results: "ውጤቶች",
    certificates: "ሰርተፍኬቶች",
    coming: "ይህ ክፍል በሚቀጥለው የልማት ደረጃ ይጨመራል።",
    logout: "ውጣ",
    loading: "እባክዎ ይጠብቁ...",
    error: "ስህተት"
  },
  om: {
    subtitle: "Waltajjii Barnootaa fi Ragaa Dijitaalaa Itoophiyaa",
    welcome: "Baga gara Digital Learning Ethiopia dhuftan",
    desc: "Barnoota hordofaa, qormaata fudhadhaa, bu'aa keessan ilaalaa.",
    login: "Seeni",
    register: "Herrega haaraa bani",
    name: "Maqaa guutuu",
    email: "Imeelii",
    password: "Jecha darbii",
    submitLogin: "Seeni",
    submitRegister: "Herrega bani",
    switchLogin: "Herrega qabduu? Seeni",
    switchRegister: "Herrega hin qabduu? Galmaa'i",
    dashboard: "Daashboordii barataa",
    signed: "Milkaa'inaan seentan.",
    courses: "Koorsiiwwan",
    results: "Bu'aawwan",
    certificates: "Ragaawwan",
    coming: "Kutaan kun sadarkaa misooma itti aanu keessatti dabalama.",
    logout: "Ba'i",
    loading: "Maaloo eegaa...",
    error: "Dogoggora"
  },
  en: {
    subtitle: "Ethiopia's Digital Learning and Certification Platform",
    welcome: "Welcome to Digital Learning Ethiopia",
    desc: "Take courses, complete assessments, and track your learning progress.",
    login: "Sign in",
    register: "Create account",
    name: "Full name",
    email: "Email",
    password: "Password",
    submitLogin: "Sign in",
    submitRegister: "Create account",
    switchLogin: "Already have an account? Sign in",
    switchRegister: "New here? Create an account",
    dashboard: "Student dashboard",
    signed: "You are signed in.",
    courses: "Courses",
    results: "Results",
    certificates: "Certificates",
    coming: "This section will be added in a later development stage.",
    logout: "Sign out",
    loading: "Please wait...",
    error: "Error"
  }
};

export default function App() {
  const [language, setLanguage] = useState("am");
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(auth.currentUser);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const t = translations[language];

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      if (mode === "register") {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        if (name.trim()) {
          await updateProfile(credential.user, {
            displayName: name.trim()
          });
        }

        setUser(credential.user);
      } else {
        const credential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        setUser(credential.user);
      }
    } catch (error) {
      const messages = {
        "auth/email-already-in-use": "ይህ ኢሜይል ቀድሞ ተመዝግቧል።",
        "auth/invalid-email": "የኢሜይል አጻጻፍ ትክክል አይደለም።",
        "auth/weak-password": "የይለፍ ቃሉ ቢያንስ 6 ቁምፊዎች ይኑሩት።",
        "auth/invalid-credential": "ኢሜይሉ ወይም የይለፍ ቃሉ ትክክል አይደለም።",
        "auth/network-request-failed": "የኢንተርኔት ግንኙነትን ያረጋግጡ።"
      };

      setMessage(messages[error.code] || `${t.error}: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
    setPassword("");
    setMessage("");
  }

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand-mark">DL</div>

        <div className="brand-copy">
          <strong>Digital Learning Ethiopia</strong>
          <span>{t.subtitle}</span>
        </div>

        <select
          aria-label="Language"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          <option value="am">አማ</option>
          <option value="om">Oromoo</option>
          <option value="en">English</option>
        </select>
      </header>

      {!user ? (
        <section className="auth-layout">
          <div className="intro">
            <span className="eyebrow">LEARN • GROW • ACHIEVE</span>
            <h1>{t.welcome}</h1>
            <p>{t.desc}</p>

            <div className="feature-row">
              <span>📚 {t.courses}</span>
              <span>📊 {t.results}</span>
              <span>🏅 {t.certificates}</span>
            </div>
          </div>

          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="tabs">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
              >
                {t.login}
              </button>

              <button
                type="button"
                className={mode === "register" ? "active" : ""}
                onClick={() => {
                  setMode("register");
                  setMessage("");
                }}
              >
                {t.register}
              </button>
            </div>

            {mode === "register" && (
              <label>
                {t.name}
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label>
              {t.email}
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label>
              {t.password}
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength="6"
                required
              />
            </label>

            {message && (
              <div className="notice" role="alert">
                {message}
              </div>
            )}

            <button className="primary" type="submit" disabled={busy}>
              {busy
                ? t.loading
                : mode === "login"
                ? t.submitLogin
                : t.submitRegister}
            </button>

            <button
              className="text-button"
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage("");
              }}
            >
              {mode === "login" ? t.switchRegister : t.switchLogin}
            </button>

            <p className="small-note">
              Use an email address you can access. Passwords are handled by
              Firebase Authentication.
            </p>
          </form>
        </section>
      ) : (
        <section className="dashboard">
          <div className="dashboard-head">
            <div>
              <span className="eyebrow">DIGITAL LEARNING ETHIOPIA</span>
              <h1>{t.dashboard}</h1>
              <p>
                {t.signed} {user.displayName || user.email}
              </p>
            </div>

            <button className="outline" onClick={handleLogout}>
              {t.logout}
            </button>
          </div>

          <div className="tiles">
            {[
              ["📚", t.courses],
              ["📊", t.results],
              ["🏅", t.certificates]
            ].map(([icon, title]) => (
              <article className="tile" key={title}>
                <span className="tile-icon">{icon}</span>
                <h2>{title}</h2>
                <p>{t.coming}</p>
              </article>
            ))}
          </div>

          <p className="small-note">
            Account sign-in is connected. Course management, exams, scoring,
            and certificate issuance are not yet implemented.
          </p>
        </section>
      )}

      <footer>
        © {new Date().getFullYear()} Digital Learning Ethiopia
      </footer>
    </main>
  );
}
