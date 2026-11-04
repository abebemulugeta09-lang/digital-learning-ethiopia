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
    welcome: "እንኳን ወደ ትምህርት ስርዓታችን በደህና መጡ"
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
    welcome: "Welcome to our learning platform"
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
    welcome: "Gara sirna barnootaa keenyaatti baga nagaan dhuftan"
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
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");

  const t = languages[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);

        if (currentUser) {
          try {
            const userRef = doc(
              db,
              "users",
              currentUser.uid
            );

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
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");

    try {
      if (isRegister) {
        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        await updateProfile(result.user, {
          displayName: fullName
        });

        const userRef = doc(
          db,
          "users",
          result.user.uid
        );

        await setDoc(userRef, {
          name: fullName,
          email: email,
          role: "student",
          createdAt: serverTimestamp()
        });

        setMessage("Registration successful");
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function resetPassword() {
    if (!email) {
      setMessage("Please enter your email first.");
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
    try {
      await signOut(auth);
      setPage("home");
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (loading) {
    return (
      <main className="loading">
        {t.loading}
      </main>
    );
  }

  if (!user) {
    return (
      <main className="auth-page">
        <section className="auth-card">

          <h1>{t.title}</h1>

          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value)
            }
          >
            <option value="am">አማርኛ</option>
            <option value="en">English</option>
            <option value="om">Afaan Oromoo</option>
          </select>

          <h2>
            {isRegister ? t.register : t.login}
          </h2>

          <form onSubmit={handleAuth}>

            {isRegister && (
              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder={t.name}
                required
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder={t.email}
              required
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder={t.password}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button type="submit">
              {isRegister ? t.register : t.login}
            </button>

          </form>

          {!isRegister && (
            <button onClick={resetPassword}>
              Forgot password?
            </button>
          )}

          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
          >
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
          onChange={(event) =>
            setLanguage(event.target.value)
          }
        >
          <option value="am">አማርኛ</option>
          <option value="en">English</option>
          <option value="om">Afaan Oromoo</option>
        </select>

        <button onClick={logout}>
          {t.logout}
        </button>
      </header>

      <nav>
        <button onClick={() => setPage("home")}>
          {t.home}
        </button>

        <button onClick={() => setPage("courses")}>
          {t.courses}
        </button>

        <button onClick={() => setPage("results")}>
          {t.results}
        </button>

        <button onClick={() => setPage("certificates")}>
          {t.certificates}
        </button>

        {profile?.role === "admin" && (
          <button onClick={() => setPage("admin")}>
            {t.admin}
          </button>
        )}
      </nav>

      <section className="content">

        {page === "home" && (
          <>
            <h2>
              {t.welcome}
            </h2>

            <h3>
              {profile?.name || user.email}
            </h3>

            <p>{t.title}</p>
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
            <p>Results will appear here.</p>
          </section>
        )}

        {page === "certificates" && (
          <section>
            <h2>{t.certificates}</h2>
            <p>Certificates will appear here.</p>
          </section>
        )}

        {page === "admin" &&
          profile?.role === "admin" && (
            <section>
              <h2>{t.admin}</h2>
              <p>Welcome, Administrator.</p>
              <p>You can manage courses and lessons.</p>
            </section>
          )}

      </section>

      {message && (
        <p className="app-message">{message}</p>
      )}

    </main>
  );
}
