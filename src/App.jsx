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
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { auth, db } from "./firebase";

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
    loading: "በመጫን ላይ..."
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
    loading: "Loading..."
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
    loading: "Fe'amaa jira..."
  }
};

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
  const [message, setMessage] = useState("");

  const t = languages[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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

    try {
      if (isRegister) {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(result.user, {
          displayName: fullName
        });

        const userRef = doc(db, "users", result.user.uid);

        await setDoc(userRef, {
          name: fullName,
          email,
          role: "student",
          createdAt: serverTimestamp()
        });

        setMessage("Registration successful");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function resetPassword() {
    if (!email) {
      setMessage("Enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function logout() {
    await signOut(auth);
    setPage("home");
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
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="am">አማርኛ</option>
            <option value="en">English</option>
            <option value="om">Afaan Oromoo</option>
          </select>

          <h2>{isRegister ? t.register : t.login}</h2>

          <form onSubmit={handleAuth}>
            {isRegister && (
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.name}
                required
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.email}
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
              required
            />

            <button type="submit">
              {isRegister ? t.register : t.login}
            </button>
          </form>

          <button onClick={resetPassword}>
            Forgot password?
          </button>

          <button onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? t.login : t.register}
          </button>

          {message && <p>{message}</p>}
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
          onChange={(e) => setLanguage(e.target.value)}
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
            <h2>Welcome, {profile?.name || user.email}</h2>
            <p>Digital Learning Ethiopia</p>
          </>
        )}

        {page === "courses" && (
          <h2>{t.courses}</h2>
        )}

        {page === "results" && (
          <h2>{t.results}</h2>
        )}

        {page === "certificates" && (
          <h2>{t.certificates}</h2>
        )}

        {page === "admin" && profile?.role === "admin" && (
          <h2>{t.admin}</h2>
        )}
      </section>
    </main>
  );
}
