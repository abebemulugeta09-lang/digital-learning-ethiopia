
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
import Courses from "./Courses";

const languages = {
  am: {
    title: "Digital Learning Ethiopia",
    login: "ግባ",
    register: "ተመዝገብ",
    email: "ኢሜይል",
    password: "የይለፍ ቃል",
    name: "ሙሉ ስም",
    home: "መነሻ",
    courses: "ትምህርቶች",
    results: "ውጤቶች",
    certificates: "ሰርተፍኬቶች",
    admin: "አስተዳደር",
    logout: "ውጣ",
    loading: "በመጫን ላይ...",
    welcome: "እንኳን ወደ ትምህርት ስርዓታችን በደህና መጡ",
    show: "አሳይ",
    hide: "ደብቅ",
    forgot: "የይለፍ ቃል ረሳሁ",
    reset: "የይለፍ ቃል መቀየሪያ ላክ",
    switchRegister: "አዲስ መለያ ፍጠር",
    switchLogin: "መለያ አለኝ፤ ግባ",
    resetSent: "የይለፍ ቃል መቀየሪያ መልዕክት ተልኳል።",
    registered: "ምዝገባው ተሳክቷል።",
    invalid: "ኢሜይል ወይም የይለፍ ቃል ትክክል አይደለም።",
    emailRequired: "እባክህ ኢሜይል አስገባ።",
    passwordShort: "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች ይኑሩት።",
    student: "ተማሪ",
    noAccount: "መለያ የለህም?",
    haveAccount: "መለያ አለህ?",
    profile: "የእኔ መለያ",
    account: "የመለያ መረጃ",
    role: "የተጠቃሚ ሚና",
    adminPanel: "የአስተዳዳሪ መቆጣጠሪያ",
    studentPanel: "የተማሪ መቆጣጠሪያ",
    resultsInfo: "የፈተና ውጤቶችህ እዚህ ይታያሉ።",
    certificatesInfo: "ያገኘሃቸው ሰርተፍኬቶች እዚህ ይታያሉ።",
    profileError: "የመለያ መረጃ መጫን አልተቻለም።",
    networkError: "የኢንተርኔት ችግር አለ።",
    unexpected: "ያልታወቀ ስህተት ተፈጥሯል።",
    emailExists: "ይህ ኢሜይል ቀድሞ ተመዝግቧል።",
    invalidEmail: "ትክክለኛ ኢሜይል አስገባ።",
    accountCreated: "መለያህ ተፈጥሯል።",
    profileNotice: "የመለያ ሚናህ በዳታቤዝ ላይ መረጋገጥ አለበት።"
  },

  en: {
    title: "Digital Learning Ethiopia",
    login: "Sign in",
    register: "Register",
    email: "Email",
    password: "Password",
    name: "Full name",
    home: "Home",
    courses: "Courses",
    results: "Results",
    certificates: "Certificates",
    admin: "Administration",
    logout: "Sign out",
    loading: "Loading...",
    welcome: "Welcome to our learning platform",
    show: "Show",
    hide: "Hide",
    forgot: "Forgot password?",
    reset: "Send password reset email",
    switchRegister: "Create a new account",
    switchLogin: "Already have an account? Sign in",
    resetSent: "Password reset email sent.",
    registered: "Registration successful.",
    invalid: "Incorrect email or password.",
    emailRequired: "Please enter your email.",
    passwordShort: "Password must contain at least 6 characters.",
    student: "Student",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    profile: "My account",
    account: "Account information",
    role: "User role",
    adminPanel: "Administrator dashboard",
    studentPanel: "Student dashboard",
    resultsInfo: "Your exam results will appear here.",
    certificatesInfo: "Your earned certificates will appear here.",
    profileError: "Could not load your profile.",
    networkError: "Network error. Check your internet connection.",
    unexpected: "An unexpected error occurred.",
    emailExists: "This email is already registered.",
    invalidEmail: "Please enter a valid email address.",
    accountCreated: "Your account has been created.",
    profileNotice: "Your account role must be verified in the database."
  },

  om: {
    title: "Digital Learning Ethiopia",
    login: "Seeni",
    register: "Galmaa'i",
    email: "Imeelii",
    password: "Jecha darbii",
    name: "Maqaa guutuu",
    home: "Mana",
    courses: "Barnoota",
    results: "Bu'aa",
    certificates: "Ragaa",
    admin: "Bulchiinsa",
    logout: "Ba'i",
    loading: "Fe'amaa jira...",
    welcome: "Gara sirna barnootaa keenyaatti baga nagaan dhuftan",
    show: "Agarsiisi",
    hide: "Dhoksi",
    forgot: "Jecha darbii irraanfatte?",
    reset: "Ergaa jecha darbii jijjiiruu ergi",
    switchRegister: "Herrega haaraa bani",
    switchLogin: "Herrega qabda? Seeni",
    resetSent: "Ergaan jecha darbii jijjiiruu ergameera.",
    registered: "Galmeen milkaa'eera.",
    invalid: "Imeelii ykn jechi darbii sirrii miti.",
    emailRequired: "Maaloo imeelii galchi.",
    passwordShort: "Jechi darbii yoo xiqqaate qubee 6 qabaachuu qaba.",
    student: "Barataa",
    noAccount: "Herrega hin qabduu?",
    haveAccount: "Herrega qabdaa?",
    profile: "Herrega koo",
    account: "Odeeffannoo herregaa",
    role: "Gahee fayyadamaa",
    adminPanel: "Bulchiinsa",
    studentPanel: "Bulchiinsa barataa",
    resultsInfo: "Bu'aan qormaata kee asitti mul'ata.",
    certificatesInfo: "Ragaan kee asitti mul'ata.",
    profileError: "Odeeffannoon herregaa hin banamne.",
    networkError: "Rakkoon interneetii jira.",
    unexpected: "Dogoggorri hin beekamne uumameera.",
    emailExists: "Imeeliin kun duraan galmaa'eera.",
    invalidEmail: "Imeelii sirrii galchi.",
    accountCreated: "Herregni kee uumameera.",
    profileNotice: "Gaheen herrega kee kuusaa odeeffannoo keessatti mirkanaa'uu qaba."
  }
};

function getError(error, t) {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return t.invalid;

    case "auth/email-already-in-use":
      return t.emailExists;

    case "auth/weak-password":
      return t.passwordShort;

    case "auth/invalid-email":
      return t.invalidEmail;

    case "auth/network-request-failed":
      return t.networkError;

    default:
      return error?.message || t.unexpected;
  }
}

export default function App() {
  const [language, setLanguage] = useState("am");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const [page, setPage] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const t = languages[language];

  // Authentication and user profile
  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      if (!active) return;

      setUser(currentUser);
      setProfile(null);
      setMessage("");

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setProfileLoading(true);

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!active) return;

        if (userSnap.exists()) {
          setProfile(userSnap.data());
        } else {
          const newProfile = {
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            role: "student",
            createdAt: serverTimestamp()
          };

          await setDoc(userRef, newProfile);

          if (!active) return;

          setProfile(newProfile);
        }
      } catch (error) {
        if (active) {
          setMessage(error.message || t.profileError);
          setProfile(null);
        }
      } finally {
        if (active) {
          setProfileLoading(false);
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Login and registration
  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage(t.emailRequired);
      return;
    }

    if (password.length < 6) {
      setMessage(t.passwordShort);
      return;
    }

    if (isRegister && !fullName.trim()) {
      setMessage(t.name);
      return;
    }

    setBusy(true);

    try {
      if (isRegister) {
        const result = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

        await updateProfile(result.user, {
          displayName: fullName.trim()
        });

        const newProfile = {
          name: fullName.trim(),
          email: cleanEmail,
          role: "student",
          createdAt: serverTimestamp()
        };

        await setDoc(
          doc(db, "users", result.user.uid),
          newProfile
        );

        setProfile(newProfile);
        setMessage(t.registered);
        setPage("home");
      } else {
        await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );
      }
    } catch (error) {
      setMessage(getError(error, t));
    } finally {
      setBusy(false);
    }
  }

  // Password reset
  async function resetPassword() {
    setMessage("");

    if (!email.trim()) {
      setMessage(t.emailRequired);
      return;
    }

    setBusy(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage(t.resetSent);
    } catch (error) {
      setMessage(getError(error, t));
    } finally {
      setBusy(false);
    }
  }

  // Sign out
  async function logout() {
    setBusy(true);

    try {
      await signOut(auth);
      setPage("home");
      setPassword("");
      setMessage("");
    } catch (error) {
      setMessage(getError(error, t));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="loading">
        <h2>{t.loading}</h2>
      </main>
    );
  }

  // Login and registration page
  if (!user) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>{t.title}</h1>

          <select
            value={language}
            onChange={event => {
              setLanguage(event.target.value);
              setMessage("");
            }}
            aria-label="Language"
          >
            <option value="am">አማርኛ</option>
            <option value="en">English</option>
            <option value="om">Afaan Oromoo</option>
          </select>

          <h2>{isRegister ? t.register : t.login}</h2>

          <form onSubmit={handleAuth}>
            {isRegister && (
              <input
                type="text"
                value={fullName}
                onChange={event => setFullName(event.target.value)}
                placeholder={t.name}
                autoComplete="name"
                required
              />
            )}

            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder={t.email}
              autoComplete="email"
              required
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder={t.password}
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={6}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
              >
                {showPassword ? t.hide : t.show}
              </button>
            </div>

            <button type="submit" disabled={busy}>
              {busy
                ? t.loading
                : isRegister
                  ? t.register
                  : t.login}
            </button>
          </form>

          {!isRegister && (
            <button
              type="button"
              onClick={resetPassword}
              disabled={busy}
            >
              {t.forgot}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsRegister(value => !value);
              setMessage("");
              setPassword("");
              setShowPassword(false);
            }}
          >
            {isRegister ? t.switchLogin : t.switchRegister}
          </button>

          {message && <p role="alert">{message}</p>}
        </section>
      </main>
    );
  }

  const isAdmin = profile?.role === "admin";

  // Main application
  return (
    <main className="app">
      <header className="app-header">
        <h1>{t.title}</h1>

        <select
          value={language}
          onChange={event => setLanguage(event.target.value)}
          aria-label="Language"
        >
          <option value="am">አማርኛ</option>
          <option value="en">English</option>
          <option value="om">Afaan Oromoo</option>
        </select>

        <button onClick={logout} disabled={busy}>
          {busy ? t.loading : t.logout}
        </button>
      </header>

      <nav className="main-nav">
        <button
          className={page === "home" ? "active" : ""}
          onClick={() => setPage("home")}
        >
          {t.home}
        </button>

        <button
          className={page === "courses" ? "active" : ""}
          onClick={() => setPage("courses")}
        >
          {t.courses}
        </button>

        <button
          className={page === "results" ? "active" : ""}
          onClick={() => setPage("results")}
        >
          {t.results}
        </button>

        <button
          className={page === "certificates" ? "active" : ""}
          onClick={() => setPage("certificates")}
        >
          {t.certificates}
        </button>

        {isAdmin && (
          <button
            className={page === "admin" ? "active" : ""}
            onClick={() => setPage("admin")}
          >
            {t.admin}
          </button>
        )}
      </nav>

      <section className="content">

        {profileLoading && <p>{t.loading}</p>}

        {page === "home" && (
          <section className="dashboard">
            <h2>{t.welcome}</h2>

            <h3>{profile?.name || user.displayName || user.email}</h3>

            <p>
              {t.role}: {isAdmin ? t.admin : t.student}
            </p>

            <div className="dashboard-links">
              <button onClick={() => setPage("courses")}>
                {t.courses}
              </button>

              <button onClick={() => setPage("results")}>
                {t.results}
              </button>

              <button onClick={() => setPage("certificates")}>
                {t.certificates}
              </button>
            </div>
          </section>
        )}

        {page === "courses" && (
          <Courses
            user={user}
            profile={profile}
            language={language}
          />
        )}

        {page === "results" && (
          <section>
            <h2>{t.results}</h2>
            <p>{t.resultsInfo}</p>
          </section>
        )}

        {page === "certificates" && (
          <section>
            <h2>{t.certificates}</h2>
            <p>{t.certificatesInfo}</p>
          </section>
        )}

        {page === "admin" && isAdmin && (
          <section>
            <h2>{t.adminPanel}</h2>

            <p>{profile?.name || user.email}</p>

            <button onClick={() => setPage("courses")}>
              {t.courses}
            </button>
          </section>
        )}

        {!profile && !profileLoading && message && (
          <p role="alert">{message}</p>
        )}
      </section>
    </main>
  );
}
