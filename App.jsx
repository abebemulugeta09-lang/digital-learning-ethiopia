
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "./firebase";

const categories = [
  { en: "Leadership & Management", am: "አመራርና አስተዳደር", om: "Hoggansa fi Bulchiinsa" },
  { en: "Digital Skills & Technology", am: "ዲጂታል ክህሎትና ቴክኖሎጂ", om: "Dandeettii Dijitaalaa fi Teeknooloojii" },
  { en: "Civic Education", am: "ሲቪክ ትምህርት", om: "Barnoota Lammummaa" },
  { en: "Professional Skills", am: "የሙያ ክህሎት", om: "Dandeettii Ogummaa" },
  { en: "Economy & Development", am: "ኢኮኖሚና ልማት", om: "Dinagdee fi Misooma" },
  { en: "Communication & Teamwork", am: "ግንኙነትና ቡድን ሥራ", om: "Walqunnamtii fi Hojii Garee" },
  { en: "Other", am: "ሌሎች", om: "Kan Biroo" }
];

const courses = [
  {
    id: "course-01",
    category: 0,
    en: "Leadership & Management Basics",
    am: "የአመራርና አስተዳደር መሠረታዊ ትምህርት",
    om: "Bu'uura Hoggansaa fi Bulchiinsaa",
    duration: "20 min"
  },
  {
    id: "course-02",
    category: 1,
    en: "Introduction to Digital Skills",
    am: "የዲጂታል ክህሎት መግቢያ",
    om: "Seensa Dandeettii Dijitaalaa",
    duration: "25 min"
  },
  {
    id: "course-03",
    category: 2,
    en: "Civic Responsibility & Participation",
    am: "ሲቪክ ኃላፊነትና ተሳትፎ",
    om: "Itti Gaafatamummaa fi Hirmaannaa Lammummaa",
    duration: "15 min"
  },
  {
    id: "course-04",
    category: 5,
    en: "Communication & Teamwork",
    am: "ግንኙነትና ቡድን ሥራ",
    om: "Walqunnamtii fi Hojii Garee",
    duration: "20 min"
  }
];

const words = {
  am: {
    title: "Digital Learning Ethiopia",
    subtitle: "የዲጂታል ትምህርትና ሰርተፍኬት ስርዓት",
    login: "ግባ",
    register: "አዲስ መመዝገብ",
    name: "ሙሉ ስም",
    email: "ኢሜይል",
    password: "የይለፍ ቃል",
    confirm: "መግቢያ",
    forgot: "የይለፍ ቃል ረሳሁ",
    home: "ዋና ገጽ",
    courses: "ትምህርቶች",
    results: "ውጤቶች",
    certificates: "ሰርተፍኬቶች",
    library: "ቤተ-መጻሕፍት",
    logout: "ውጣ",
    welcome: "እንኳን ወደ ትምህርት ስርዓቱ በደህና መጡ",
    categories: "የትምህርት ምድቦች",
    all: "ሁሉም",
    start: "ትምህርቱን ጀምር",
    duration: "የትምህርት ጊዜ",
    empty: "በአሁኑ ጊዜ ምንም መረጃ የለም።",
    loading: "በመጫን ላይ...",
    success: "በተሳካ ሁኔታ ተመዝግበዋል።",
    error: "ስህተት ተፈጥሯል። እንደገና ይሞክሩ።",
    account: "መለያ የለዎትም?",
    haveAccount: "መለያ አለዎት?",
    back: "ተመለስ",
    demo: "የትምህርት ስርዓት"
  },
  en: {
    title: "Digital Learning Ethiopia",
    subtitle: "Digital Learning and Certification System",
    login: "Sign In",
    register: "Create Account",
    name: "Full Name",
    email: "Email",
    password: "Password",
    confirm: "Sign In",
    forgot: "Forgot Password?",
    home: "Home",
    courses: "Courses",
    results: "Results",
    certificates: "Certificates",
    library: "Library",
    logout: "Log Out",
    welcome: "Welcome to the learning system",
    categories: "Course Categories",
    all: "All",
    start: "Start Course",
    duration: "Duration",
    empty: "No information available yet.",
    loading: "Loading...",
    success: "Registration successful.",
    error: "An error occurred. Please try again.",
    account: "Don't have an account?",
    haveAccount: "Already have an account?",
    back: "Back",
    demo: "Learning System"
  },
  om: {
    title: "Digital Learning Ethiopia",
    subtitle: "Sirna Barnootaa fi Ragaa Dijitaalaa",
    login: "Seeni",
    register: "Galmaa'i",
    name: "Maqaa Guutuu",
    email: "Imeelii",
    password: "Jecha Darbii",
    confirm: "Seeni",
    forgot: "Jecha darbii dagatte?",
    home: "Fuula Jalqabaa",
    courses: "Barnoota",
    results: "Bu'aa",
    certificates: "Ragaa",
    library: "Mana Kitaabaa",
    logout: "Ba'i",
    welcome: "Gara sirna barnootaa keenyaatti baga nagaan dhuftan",
    categories: "Ramaddii Barnootaa",
    all: "Hunda",
    start: "Barnoota Jalqabi",
    duration: "Yeroo Barnootaa",
    empty: "Ammaaf odeeffannoon hin jiru.",
    loading: "Fe'amaa jira...",
    success: "Galmeen milkaa'eera.",
    error: "Dogoggorri uumameera. Irra deebi'ii yaali.",
    account: "Akkaawuntii hin qabduu?",
    haveAccount: "Akkaawuntii qabdaa?",
    back: "Deebi'i",
    demo: "Sirna Barnootaa"
  }
};

export default function App() {
  const [language, setLanguage] = useState("am");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState(-1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const t = words[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setProfile(userSnap.data());
        } else {
          const newProfile = {
            uid: currentUser.uid,
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            role: "student",
            language,
            createdAt: serverTimestamp()
          };

          await setDoc(userRef, newProfile);
          setProfile({
            ...newProfile,
            createdAt: new Date()
          });
        }
      } catch (error) {
        console.error("Profile loading error:", error);
        setMessage("Profile could not be loaded. Check Firestore rules.");
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");

    if (!name.trim() || !email.trim() || password.length < 6) {
      setMessage("Enter your name, a valid email, and a password of at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(result.user, {
        displayName: name.trim()
      });

      const userData = {
        uid: result.user.uid,
        name: name.trim(),
        email: email.trim(),
        role: "student",
        language,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", result.user.uid), userData);

      setProfile(userData);
      setMessage(t.success);
      setIsRegister(false);
      setName("");
      setPassword("");
    } catch (error) {
      console.error(error);
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword("");
    } catch (error) {
      console.error(error);
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setMessage("Please enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      setMessage(error.message || t.error);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      setPage("home");
      setMessage("");
    } catch (error) {
      setMessage(error.message || t.error);
    }
  }

  const visibleCourses = courses.filter((course) => {
    return selectedCategory === -1 ||
      course.category === selectedCategory;
  });

  if (!user) {
    return (
      <main style={styles.authPage}>
        <section style={styles.authCard}>
          <h1 style={styles.logo}>🎓 {t.title}</h1>
          <p style={styles.subtitle}>{t.subtitle}</p>

          <div style={styles.languageRow}>
            <button onClick={() => setLanguage("am")}>አማርኛ</button>
            <button onClick={() => setLanguage("om")}>Afaan Oromoo</button>
            <button onClick={() => setLanguage("en")}>English</button>
          </div>

          <h2>{isRegister ? t.register : t.login}</h2>

          <form
            onSubmit={isRegister ? handleRegister : handleLogin}
            style={styles.form}
          >
            {isRegister && (
              <input
                style={styles.input}
                type="text"
                placeholder={t.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              style={styles.input}
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              style={styles.input}
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              required
            />

            <button style={styles.primaryButton} disabled={loading}>
              {loading ? t.loading : isRegister ? t.register : t.login}
            </button>
          </form>

          {!isRegister && (
            <button style={styles.textButton} onClick={handleForgotPassword}>
              {t.forgot}
            </button>
          )}

          <p style={styles.switchText}>
            {isRegister ? t.haveAccount : t.account}
          </p>

          <button
            style={styles.secondaryButton}
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
          >
            {isRegister ? t.login : t.register}
          </button>

          {message && <p style={styles.message}>{message}</p>}
        </section>
      </main>
    );
  }

  function pageContent() {
    if (page === "courses") {
      return (
        <>
          <h2>{t.courses}</h2>

          <div style={styles.categoryList}>
            <button
              style={styles.categoryButton}
              onClick={() => setSelectedCategory(-1)}
            >
              {t.all}
            </button>

            {categories.map((category, index) => (
              <button
                key={index}
                style={styles.categoryButton}
                onClick={() => setSelectedCategory(index)}
              >
                {category[language]}
              </button>
            ))}
          </div>

          <div style={styles.courseGrid}>
            {visibleCourses.map((course) => (
              <article key={course.id} style={styles.courseCard}>
                <h3>{course[language]}</h3>
                <p>{categories[course.category][language]}</p>
                <p>{t.duration}: {course.duration}</p>
                <button
                  style={styles.primaryButton}
                  onClick={() => setSelectedCourse(course)}
                >
                  {t.start}
                </button>
              </article>
            ))}
          </div>

          {selectedCourse && (
            <section style={styles.panel}>
              <button
                style={styles.textButton}
                onClick={() => setSelectedCourse(null)}
              >
                ← {t.back}
              </button>
              <h2>{selectedCourse[language]}</h2>
              <p>{t.empty}</p>
              <p>
                Course lessons and exams will be added in the next development step.
              </p>
            </section>
          )}
        </>
      );
    }

    if (page === "results") {
      return (
        <section style={styles.panel}>
          <h2>{t.results}</h2>
          <p>{t.empty}</p>
        </section>
      );
    }

    if (page === "certificates") {
      return (
        <section style={styles.panel}>
          <h2>{t.certificates}</h2>
          <p>{t.empty}</p>
        </section>
      );
    }

    if (page === "library") {
      return (
        <section style={styles.panel}>
          <h2>{t.library}</h2>
          <p>{t.empty}</p>
        </section>
      );
    }

    return (
      <>
        <h2>{t.welcome}</h2>
        <section style={styles.panel}>
          <h3>{profile?.name || user.displayName || user.email}</h3>
          <p>{user.email}</p>
          <p>{t.demo}</p>
        </section>

        <h2>{t.categories}</h2>
        <div style={styles.courseGrid}>
          {categories.map((category, index) => (
            <button
              key={index}
              style={styles.categoryCard}
              onClick={() => {
                setSelectedCategory(index);
                setPage("courses");
              }}
            >
              {category[language]}
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <main style={styles.dashboard}>
      <header style={styles.header}>
        <h2>🎓 {t.title}</h2>

        <select
          style={styles.languageSelect}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="am">አማርኛ</option>
          <option value="om">Afaan Oromoo</option>
          <option value="en">English</option>
        </select>
      </header>

      <nav style={styles.nav}>
        {[
          ["home", t.home],
          ["courses", t.courses],
          ["results", t.results],
          ["certificates", t.certificates],
          ["library", t.library]
        ].map(([key, label]) => (
          <button
            key={key}
            style={page === key ? styles.activeNav : styles.navButton}
            onClick={() => {
              setPage(key);
              setSelectedCourse(null);
            }}
          >
            {label}
          </button>
        ))}

        <button style={styles.logoutButton} onClick={handleLogout}>
          {t.logout}
        </button>
      </nav>

      {message && <p style={styles.message}>{message}</p>}

      <section style={styles.content}>
        {pageContent()}
      </section>

      <footer style={styles.footer}>
        {t.title} © {new Date().getFullYear()}
      </footer>
    </main>
  );
}

const styles = {
  authPage: {
    minHeight: "100vh",
    background: "#eef3f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif"
  },
  authCard: {
    background: "white",
    padding: "28px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "430px",
    boxShadow: "0 5px 25px rgba(0,0,0,0.08)",
    textAlign: "center"
  },
  logo: {
    color: "#123d68",
    fontSize: "25px"
  },
  subtitle: {
    color: "#64748b"
  },
  languageRow: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "8px",
    margin: "20px 0"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "13px"
  },
  input: {
    padding: "14px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box"
  },
  primaryButton: {
    background: "#14528a",
    color: "white",
    padding: "13px 18px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px"
  },
  secondaryButton: {
    background: "#e7eef7",
    color: "#123d68",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%"
  },
  textButton: {
    border: "none",
    background: "transparent",
    color: "#14528a",
    padding: "10px",
    cursor: "pointer"
  },
  switchText: {
    color: "#64748b",
    marginTop: "20px"
  },
  message: {
    background: "#fff4d6",
    color: "#765500",
    padding: "12px",
    borderRadius: "8px",
    overflowWrap: "anywhere"
  },
  dashboard: {
    minHeight: "100vh",
    background: "#f4f7fb",
    fontFamily: "Arial, sans-serif",
    color: "#1e293b"
  },
  header: {
    background: "#123d68",
    color: "white",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px"
  },
  languageSelect: {
    padding: "9px",
    borderRadius: "7px"
  },
  nav: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    padding: "12px",
    background: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
  },
  navButton: {
    padding: "10px 13px",
    border: "none",
    borderRadius: "7px",
    background: "#edf2f7",
    cursor: "pointer"
  },
  activeNav: {
    padding: "10px 13px",
    border: "none",
    borderRadius: "7px",
    background: "#14528a",
    color: "white",
    cursor: "pointer"
  },
  logoutButton: {
    padding: "10px 13px",
    border: "none",
    borderRadius: "7px",
    background: "#a52a2a",
    color: "white",
    cursor: "pointer",
    marginLeft: "auto"
  },
  content: {
    padding: "22px",
    maxWidth: "1150px",
    margin: "auto"
  },
  panel: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    margin: "18px 0",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
  },
  categoryList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    margin: "15px 0"
  },
  categoryButton: {
    padding: "10px 13px",
    background: "#e3edf8",
    color: "#123d68",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  courseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
    marginTop: "18px"
  },
  courseCard: {
    background: "white",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },
  categoryCard: {
    padding: "20px",
    background: "white",
    border: "1px solid #dbe5f0",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    color: "#123d68"
  },
  footer: {
    textAlign: "center",
    padding: "25px",
    color: "#64748b"
  }
};
