import React, { useState } from 'react';

export default function App() {
  const [page, setPage] = useState('login');
  const [language, setLanguage] = useState('am');

  const words = {
    am: {
      title: 'ዲጂታል ትምህርት ኢትዮጵያ',
      subtitle: 'በእውቀት እንገንባ ኢትዮጵያን',
      login: 'ወደ መለያዬ ግባ',
      register: 'አዲስ ተማሪ ምዝገባ',
      name: 'ሙሉ ስም',
      email: 'ኢሜይል አድራሻ',
      password: 'የይለፍ ቃል',
      submit: 'ግባ',
      create: 'መለያ ፍጠር',
      switch: 'አዲስ መለያ የለህም?',
      back: 'መለያ አለህ?',
      courses: 'ትምህርቶች',
      library: 'ዲጂታል ቤተ-መጻሕፍት',
      exams: 'ፈተናዎች',
      certificates: 'ሰርተፍኬቶች'
    },
    en: {
      title: 'Digital Learning Ethiopia',
      subtitle: 'Building Ethiopia through Knowledge',
      login: 'Student Login',
      register: 'Student Registration',
      name: 'Full Name',
      email: 'Email Address',
      password: 'Password',
      submit: 'Login',
      create: 'Create Account',
      switch: "Don't have an account?",
      back: 'Already have an account?',
      courses: 'Courses',
      library: 'Digital Library',
      exams: 'Examinations',
      certificates: 'Certificates'
    },
    om: {
      title: 'Digital Learning Ethiopia',
      subtitle: 'Beekumsa keessatti Itoophiyaa ijaaruu',
      login: 'Seensa Barataa',
      register: 'Galmee Barataa',
      name: 'Maqaa Guutuu',
      email: 'Teessoo Imeelii',
      password: 'Jecha Darbii',
      submit: 'Seeni',
      create: 'Herrega Uumi',
      switch: 'Herrega hin qabduu?',
      back: 'Herrega qabdaa?',
      courses: 'Koorsiiwwan',
      library: 'Mana Kitaabaa Dijitaalaa',
      exams: 'Qormaata',
      certificates: 'Ragaa'
    }
  };

  const t = words[language];

  function handleSubmit(event) {
    event.preventDefault();
    alert(
      language === 'am'
        ? 'ይህ የሙከራ ገጽ ነው። ቀጣይ ደረጃ ላይ ከDatabase ጋር እናገናኘዋለን።'
        : 'Demo page. Database connection will be added in the next step.'
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">DLE</div>
        <div className="language">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="am">አማርኛ</option>
            <option value="om">Afaan Oromoo</option>
            <option value="en">English</option>
          </select>
        </div>
      </header>

      <main className="main">
        <section className="welcome">
          <div className="logo">📚</div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </section>

        <nav className="nav">
          <span>{t.courses}</span>
          <span>{t.library}</span>
          <span>{t.exams}</span>
          <span>{t.certificates}</span>
        </nav>

        <section className="form-card">
          <div className="tabs">
            <button
              className={page === 'login' ? 'active' : ''}
              onClick={() => setPage('login')}
            >
              {t.login}
            </button>
            <button
              className={page === 'register' ? 'active' : ''}
              onClick={() => setPage('register')}
            >
              {t.register}
            </button>
          </div>

          <h2>{page === 'login' ? t.login : t.register}</h2>

          <form onSubmit={handleSubmit}>
            {page === 'register' && (
              <label>
                {t.name}
                <input type="text" required placeholder={t.name} />
              </label>
            )}

            <label>
              {t.email}
              <input
                type="email"
                required
                placeholder="example@email.com"
              />
            </label>

            <label>
              {t.password}
              <input
                type="password"
                required
                minLength="6"
                placeholder={t.password}
              />
            </label>

            <button className="submit" type="submit">
              {page === 'login' ? t.submit : t.create}
            </button>
          </form>

          <p className="switch" onClick={() =>
            setPage(page === 'login' ? 'register' : 'login')
          }>
            {page === 'login' ? t.switch : t.back}
          </p>
        </section>

        <footer>
          © 2026 Digital Learning Ethiopia
        </footer>
      </main>
    </div>
  );
}
