
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from "firebase/auth";
import { auth } from "./firebase";

const words = {
  am: {
    subtitle: "የዲጂታል ትምህርትና ሰርተፍኬት ስርዓት",
    login: "ግባ",
    register: "አዲስ መለያ ፍጠር",
    name: "ሙሉ ስም",
    email: "ኢሜይል",
    password: "የይለፍ ቃል",
    forgot: "የይለፍ ቃል ረሳሁ",
    courses: "ትምህርቶች",
    results: "ውጤቶች",
    certificates: "ሰርተፍኬቶች",
    library: "ዲጂታል ቤተ-መጻሕፍት",
    logout: "ውጣ",
    welcome: "እንኳን ወደ መማሪያ ስርዓታችን በደህና መጡ",
    categories: "የትምህርት ዘርፎች",
    all: "ሁሉንም አሳይ",
    back: "ተመለስ",
    duration: "የትምህርት ጊዜ",
    start: "ኮርሱን ክፈት",
    empty: "በዚህ ክፍል ውስጥ መረጃ ገና አልተጨመረም።",
    loading: "እባክዎ ይጠብቁ...",
    noAccount: "መለያ የለዎትም?",
    haveAccount: "መለያ አለዎት?",
    success: "የመመለሻ መልዕክት ወደ ኢሜይልዎ ተልኳል።"
  },
  om: {
    subtitle: "Sirna Barnootaa fi Ragaa Dijitaalaa",
    login: "Seeni",
    register: "Herrega Haaraa Uumi",
    name: "Maqaa Guutuu",
    email: "Imeelii",
    password: "Jecha Darbii",
    forgot: "Jecha darbii dagadhe",
    courses: "Koorsiiwwan",
    results: "Bu'aa",
    certificates: "Ragaa",
    library: "Mana Kitaabaa Dijitaalaa",
    logout: "Ba'i",
    welcome: "Baga gara sirna barnootaa keenya dhuftan",
    categories: "Ramaddii Barnootaa",
    all: "Hunda Agarsiisi",
    back: "Duubatti",
    duration: "Yeroo Barnootaa",
    start: "Koorsii Bani",
    empty: "Kutaa kana keessatti odeeffannoon hin jiru.",
    loading: "Mee eeggadhaa...",
    noAccount: "Herrega hin qabduu?",
    haveAccount: "Herrega qabduu?",
    success: "Ergaan deebisuu gara imeelii keessaniitti ergameera."
  },
  en: {
    subtitle: "Digital Learning and Certification System",
    login: "Sign In",
    register: "Create Account",
    name: "Full Name",
    email: "Email Address",
    password: "Password",
    forgot: "Forgot password?",
    courses: "Courses",
    results: "Results",
    certificates: "Certificates",
    library: "Digital Library",
    logout: "Logout",
    welcome: "Welcome to our learning platform",
    categories: "Course Categories",
    all: "Show All",
    back: "Back",
    duration: "Duration",
    start: "Open Course",
    empty: "No information has been added here yet.",
    loading: "Please wait...",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    success: "Password reset email sent."
  }
};

const categories = [
  {
    id: 1,
    icon: "📊",
    am: "አመራርና አስተዳደር",
    om: "Hoggansa fi Bulchiinsa",
    en: "Leadership & Management"
  },
  {
    id: 2,
    icon: "💻",
    am: "ዲጂታል ክህሎትና ቴክኖሎጂ",
    om: "Dandeettii Dijitaalaa",
    en: "Digital Skills & Technology"
  },
  {
    id: 3,
    icon: "🏛️",
    am: "ሲቪክ ትምህርት",
    om: "Barnoota Siivikii",
    en: "Civic Education"
  },
  {
    id: 4,
    icon: "🎓",
    am: "የሙያ ክህሎት",
    om: "Dandeettii Ogummaa",
    en: "Professional Skills"
  },
  {
    id: 5,
    icon: "📈",
    am: "ኢኮኖሚና ልማት",
    om: "Diinagdee fi Misooma",
    en: "Economy & Development"
  },
  {
    id: 6,
    icon: "🤝",
    am: "ግንኙነትና ቡድን ሥራ",
    om: "Walqunnamtii fi Hojii Garee",
    en: "Communication & Teamwork"
  },
  {
    id: 7,
    icon: "📚",
    am: "ሌሎች",
    om: "Kan Biroo",
    en: "Other"
  }
];

const courses = [
  {
    id: 1,
    category: 1,
    icon: "📊",
    am: "የአመራር መሠረታዊ እውቀት",
    om: "Bu'uura Hoggansaa",
    en: "Leadership Fundamentals",
    duration: "30 min"
  },
  {
    id: 2,
    category: 2,
    icon: "💻",
    am: "የዲጂታል ክህሎት መግቢያ",
    om: "Seensa Dandeettii Dijitaalaa",
    en: "Introduction to Digital Skills",
    duration: "45 min"
  },
  {
    id: 3,
    category: 3,
    icon: "🏛️",
    am: "የዜግነት ኃላፊነት",
    om: "Itti Gaafatamummaa Lammummaa",
    en: "Civic Responsibility",
    duration: "25 min"
  },
  {
    id: 4,
    category: 4,
    icon: "🎓",
    am: "የሙያ እድገት",
    om: "Guddina Ogummaa",
    en: "Professional Development",
    duration: "35 min"
  },
  {
    id: 5,
    category: 5,
    icon: "📈",
    am: "የኢኮኖሚ መሠረታዊ እውቀት",
    om: "Bu'uura Diinagdee",
    en: "Economic Fundamentals",
    duration: "40 min"
  },
  {
    id: 6,
    category: 6,
    icon: "🤝",
    am: "የግንኙነት ክህሎት",
    om: "Dandeettii Walqunnamtii",
    en: "Communication Skills",
    duration: "35 min"
  }
];

const buttonStyle = {
  border: "none",
  borderRadius: 10,
  padding: "12px 16px",
  cursor: "pointer",
  fontWeight: 700
};

export default function App() {
  const [language, setLanguage] = useState("am");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("home");
  const [category, setCategory] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const t = words[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        const result = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await updateProfile(result.user, {
          displayName: name.trim()
        });

        setUser(result.user);
      } else {
        const result = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        setUser(result.user);
      }

      setPage("home");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (!email.trim()) {
      setMessage("Please enter your email address first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage(t.success);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      setPage("home");
      setCategory(null);
      setSelectedCourse(null);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const visibleCourses = courses.filter(
    (course) => category === null || course.category === category
  );

  if (!authReady) {
    return (
      <div style={styles.center}>
        <h2>{t.loading}</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.app}>
        <header style={styles.header}>
          <strong>📚 Digital Learning Ethiopia</strong>
          <select
            style={styles.select}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="am">አማርኛ</option>
            <option value="om">Afaan Oromoo</option>
            <option value="en">English</option>
          </select>
        </header>

        <section style={styles.authCard}>
          <div style={{ fontSize: 48 }}>🎓</div>
          <h1>{t.subtitle}</h1>

          <div style={styles.tabs}>
            <button
              style={{
                ...buttonStyle,
                background: mode === "login" ? "#075e48" : "#e8efec",
                color: mode === "login" ? "white" : "#24352f"
              }}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              {t.login}
            </button>

            <button
              style={{
                ...buttonStyle,
                background: mode === "register" ? "#075e48" : "#e8efec",
                color: mode === "register" ? "white" : "#24352f"
              }}
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
            >
              {t.register}
            </button>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {mode === "register" && (
              <label style={styles.label}>
                {t.name}
                <input
                  style={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
            )}

            <label style={styles.label}>
              {t.email}
              <input
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label style={styles.label}>
              {t.password}
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            {message && <p style={styles.error}>{message}</p>}

            <button
              type="submit"
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading ? t.loading : mode === "login" ? t.login : t.register}
            </button>
          </form>

          {mode === "login" && (
            <button
              style={styles.link}
              onClick={resetPassword}
              disabled={loading}
            >
              {t.forgot}
            </button>
          )}

          <p style={{ textAlign: "center" }}>
            {mode === "login" ? t.noAccount : t.haveAccount}
            <button
              style={styles.link}
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage("");
              }}
            >
              {mode === "login" ? t.register : t.login}
            </button>
          </p>
        </section>

        <footer style={styles.footer}>
          © 2026 Digital Learning Ethiopia
        </footer>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <strong>📚 Digital Learning Ethiopia</strong>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            {user.displayName || user.email}
          </div>
        </div>

        <div style={styles.headerRight}>
          <select
            style={styles.select}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="am">አማርኛ</option>
            <option value="om">Afaan Oromoo</option>
            <option value="en">English</option>
          </select>
          <button style={styles.logout} onClick={handleLogout}>
            {t.logout}
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <h1>{t.welcome}</h1>

        {page === "home" && (
          <>
            <h2>{t.categories}</h2>
            <div style={styles.grid}>
              {categories.map((item) => (
                <button
                  key={item.id}
                  style={styles.categoryCard}
                  onClick={() => {
                    setCategory(item.id);
                    setPage("courses");
                  }}
                >
                  <span style={{ fontSize: 30 }}>{item.icon}</span>
                  <strong>{item[language]}</strong>
                </button>
              ))}
            </div>

            <div style={styles.grid}>
              {[
                ["📘", t.courses, "courses"],
                ["📝", t.results, "results"],
                ["🏆", t.certificates, "certificates"],
                ["📚", t.library, "library"]
              ].map(([icon, label, target]) => (
                <button
                  key={target}
                  style={styles.menuCard}
                  onClick={() => {
                    setPage(target);
                    setCategory(null);
                  }}
                >
                  <span style={{ fontSize: 28 }}>{icon}</span>
                  <strong>{label}</strong>
                </button>
              ))}
            </div>
          </>
        )}

        {page === "courses" && (
          <section style={styles.panel}>
            <h2>{t.courses}</h2>

            <button
              style={styles.secondaryButton}
              onClick={() => setCategory(null)}
            >
              {t.all}
            </button>

            {visibleCourses.length === 0 && <p>{t.empty}</p>}

            {visibleCourses.map((course) => (
              <button
                key={course.id}
                style={styles.courseCard}
                onClick={() => {
                  setSelectedCourse(course);
                  setPage("course");
                }}
              >
                <span style={{ fontSize: 28 }}>{course.icon}</span>
                <span style={{ flex: 1, textAlign: "left" }}>
                  <strong>{course[language]}</strong>
                  <small style={{ display: "block", marginTop: 5 }}>
                    {t.duration}: {course.duration}
                  </small>
                </span>
                <span>›</span>
              </button>
            ))}

            <button
              style={styles.secondaryButton}
              onClick={() => setPage("home")}
            >
              {t.back}
            </button>
          </section>
        )}

        {page === "course" && selectedCourse && (
          <section style={styles.panel}>
            <div style={{ fontSize: 45 }}>{selectedCourse.icon}</div>
            <h2>{selectedCourse[language]}</h2>
            <p>{t.duration}: {selectedCourse.duration}</p>
            <p>{t.empty}</p>
            <button
              style={styles.secondaryButton}
              onClick={() => setPage("courses")}
            >
              {t.back}
            </button>
          </section>
        )}

        {["results", "certificates", "library"].includes(page) && (
          <section style={styles.panel}>
            <h2>
              {page === "results"
                ? t.results
                : page === "certificates"
                ? t.certificates
                : t.library}
            </h2>
            <p>{t.empty}</p>
            <button
              style={styles.secondaryButton}
              onClick={() => setPage("home")}
            >
              {t.back}
            </button>
          </section>
        )}
      </main>

      <footer style={styles.footer}>
        © 2026 Digital Learning Ethiopia
      </footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#f2f6f4",
    color: "#20332b",
    fontFamily: "Arial, sans-serif"
  },
  center: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center"
  },
  header: {
    background: "#075e48",
    color: "white",
    padding: "16px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  select: {
    padding: 9,
    borderRadius: 8,
    border: "none",
    maxWidth: 145
  },
  authCard: {
    background: "white",
    width: "min(92%, 430px)",
    margin: "45px auto",
    padding: 25,
    borderRadius: 18,
    boxShadow: "0 5px 25px #00000012",
    textAlign: "center",
    boxSizing: "border-box"
  },
  tabs: {
    display: "flex",
    gap: 10,
    margin: "22px 0"
  },
  form: {
    display: "grid",
    gap: 15,
    textAlign: "left"
  },
  label: {
    display: "grid",
    gap: 7,
    fontWeight: 600
  },
  input: {
    width: "100%",
    padding: 13,
    border: "1px solid #ccd8d1",
    borderRadius: 9,
    boxSizing: "border-box",
    fontSize: 16
  },
  primaryButton: {
    ...buttonStyle,
    background: "#075e48",
    color: "white",
    width: "100%",
    fontSize: 16
  },
  logout: {
    ...buttonStyle,
    background: "#ffffff",
    color: "#075e48"
  },
  link: {
    background: "none",
    border: "none",
    color: "#075e48",
    cursor: "pointer",
    padding: 8,
    fontWeight: 700
  },
  error: {
    background: "#fff0ef",
    color: "#a32920",
    padding: 10,
    borderRadius: 8,
    overflowWrap: "anywhere"
  },
  main: {
    width: "min(92%, 1050px)",
    margin: "25px auto",
    minHeight: "65vh"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
    gap: 13,
    margin: "18px 0 28px"
  },
  categoryCard: {
    ...buttonStyle,
    minHeight: 120,
    background: "white",
    color: "#20332b",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 2px 9px #0000000c"
  },
  menuCard: {
    ...buttonStyle,
    background: "#e0eee8",
    color: "#075e48",
    minHeight: 95,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  panel: {
    background: "white",
    padding: 22,
    borderRadius: 15,
    marginTop: 20,
    boxShadow: "0 2px 10px #0000000c"
  },
  courseCard: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 15,
    padding: 15,
    margin: "10px 0",
    background: "#f5f8f6",
    border: "1px solid #e1e9e4",
    borderRadius: 10,
    cursor: "pointer",
    color: "#20332b",
    textAlign: "left"
  },
  secondaryButton: {
    ...buttonStyle,
    background: "#e0eee8",
    color: "#075e48",
    margin: "12px 5px 5px 0"
  },
  footer: {
    textAlign: "center",
    padding: 20,
    color: "#66776e",
    fontSize: 13
  }
};
