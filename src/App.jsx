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
    invalid: "Email ወይም Password ትክክል አይደለም።",
    emailRequired: "እባክህ Email አስገባ።",
    passwordShort: "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት።",
    student: "ተማሪ",
    noAccount: "መለያ የለህም?",
    haveAccount: "መለያ አለህ?"
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
    haveAccount: "Already have an account?"
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
    haveAccount: "Herrega qabdaa?"
  }
};

function getError(error, t) {
  if (
    error.code === "auth/invalid-credential" ||
    error.code === "auth/wrong-password" ||
    error.code === "auth/user-not-found"
  ) return t.invalid;

  if (error.code === "auth/email-already-in-use")
    return "This email is already registered.";

  if (error.code === "auth/weak-password")
    return t.passwordShort;

  if (error.code === "auth/invalid-email")
    return "Invalid email address.";

  if (error.code === "auth/network-request-failed")
    return "Network error. Check your internet connection.";

  return error.message || "An unexpected error occurred.";
}

export default function App() {
  const [language, setLanguage] = useState("am");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const t = languages[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

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
            setProfile(newProfile);
          }
        } catch (error) {
          setMessage(error.message);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage(t.passwordShort);
      return;
    }

    setBusy(true);

    try {
      if (isRegister) {
        const result = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await updateProfile(result.user, {
          displayName: fullName.trim()
        });

        const userRef = doc(db, "users", result.user.uid);

        const newProfile = {
          name: fullName.trim(),
          email: email.trim(),
          role: "student",
          createdAt: serverTimestamp()
        };

        await setDoc(userRef, newProfile);
        setProfile(newProfile);
        setMessage(t.registered);
      } else {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      }
    } catch (error) {
      setMessage(getError(error, t));
    } finally {
      setBusy(false);
    }
  }

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

  async function logout() {
    try {
      await signOut(auth);
      setPage("home");
      setMessage("");
    } catch (error) {
      setMessage(getError(error, t));
    }
  }

  if (loading) {
    return <main className="loading">{t.loading}</main>;
  }

  if (!user) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>{t.title}</h1>

          <select
            value={language}
            onChange={e => {
              setLanguage(e.target.value);
              setMessage("");
            }}
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
                onChange={e => setFullName(e.target.value)}
                placeholder={t.name}
                required
              />
            )}

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t.email}
              required
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t.password}
                required
                minLength={6}
              />

              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? t.hide : t.show}
              </button>
            </div>

            <button type="submit" disabled={busy}>
              {busy ? t.loading : isRegister ? t.register : t.login}
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
              setIsRegister(v => !v);
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

  return (
    <main className="app">
      <header>
        <h1>{t.title}</h1>

        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          <option value="am">አማርኛ</option>
          <option value="en">English</option>
          <option value="om">Afaan Oromoo</option>
        </select>

        <button onClick={logout}>{t.logout}</button>
      </header>

      <nav>
        <button onClick={() => setPage("home")}>{t.home}</button>
        <button onClick={() => setPage("courses")}>{t.courses}</button>
        <button onClick={() => setPage("results")}>{t.results}</button>
        <button onClick={() => setPage("certificates")}>
          {t.certificates}
        </button>

        {profile?.role === "admin" && (
          <button onClick={() => setPage("admin")}>{t.admin}</button>
        )}
      </nav>

      <section className="content">
        {page === "home" && (
          <>
            <h2>{t.welcome}</h2>
            <h3>{profile?.name || user.email}</h3>
            <p>{profile?.role === "admin" ? t.admin : t.student}</p>
          </>
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
            <p>{language === "am" ? "ውጤቶች እዚህ ይታያሉ።" :
              language === "om" ? "Bu'aan asitti mul'ata." :
              "Results will appear here."}</p>
          </section>
        )}

        {page === "certificates" && (
          <section>
            <h2>{t.certificates}</h2>
            <p>{language === "am" ? "ሰርተፍኬቶች እዚህ ይታያሉ።" :
              language === "om" ? "Ragaan asitti mul'ata." :
              "Certificates will appear here."}</p>
          </section>
        )}

        {page === "admin" && profile?.role === "admin" && (
          <section>
            <h2>{t.admin}</h2>
            <p>{language === "am" ? "የአስተዳዳሪ መቆጣጠሪያ" :
              language === "om" ? "Bulchiinsa" :
              "Administrator dashboard"}</p>
            <button onClick={() => setPage("courses")}>
              {t.courses}
            </button>
          </section>
        )}
      </section>
    </main>
  );
}
