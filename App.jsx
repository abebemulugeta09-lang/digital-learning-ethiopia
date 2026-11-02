import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, GraduationCap, Award, Globe2, Menu, X } from 'lucide-react'
import { isSupabaseConfigured } from './supabase'

const courses = [
  {key:'digital', icon:BookOpen, detail:'Computer basics, internet safety and practical digital tools.', time:'4 lessons'},
  {key:'leadership', icon:GraduationCap, detail:'Communication, teamwork and responsible leadership.', time:'5 lessons'},
  {key:'languages', icon:Globe2, detail:'Language learning resources for multilingual participation.', time:'6 lessons'},
  {key:'professional', icon:Award, detail:'Workplace skills, planning and continuous development.', time:'4 lessons'}
]
export default function App() {
  const {t, i18n} = useTranslation()
  const [menu,setMenu] = useState(false)
  const [tab,setTab] = useState('courses')
  const [email,setEmail] = useState('')
  const [notice,setNotice] = useState('')
  const changeLang = e => i18n.changeLanguage(e.target.value)
  const requestDemo = e => { e.preventDefault(); setNotice('This starter does not yet create accounts. Connect Supabase and enable the approved registration workflow.') }
  return <div>
    <header className="top"><a className="brand" href="#"><span className="mark">DL</span>{t('brand')}</a>
      <button className="mobile" onClick={()=>setMenu(!menu)} aria-label="Menu">{menu?<X/>:<Menu/>}</button>
      <nav className={menu?'show':''}><a href="#home">{t('home')}</a><a href="#courses">{t('courses')}</a><a href="#library">{t('library')}</a><a href="#exams">{t('exams')}</a><a href="#certificates">{t('certificates')}</a></nav>
      <select aria-label="Language" value={i18n.language} onChange={changeLang}><option value="am">አማርኛ</option><option value="om">Afaan Oromoo</option><option value="en">English</option></select>
    </header>
    <main>
      <section className="hero" id="home"><div className="hero-inner"><span className="eyebrow">LEARN • GROW • ACHIEVE</span><h1>{t('hero')}</h1><p>{t('sub')}</p><a className="cta" href="#courses">{t('explore')}</a></div><div className="hero-art"><div className="circle"><GraduationCap size={92}/></div><span className="float f1">📚</span><span className="float f2">✦</span></div></section>
      <section className="features"><div><BookOpen/><b>{t('courses')}</b><small>Structured learning</small></div><div><Globe2/><b>{t('library')}</b><small>Resources in multiple languages</small></div><div><Award/><b>{t('certificates')}</b><small>Completion recognition</small></div></section>
      <section className="section" id="courses"><div className="section-head"><div><span className="eyebrow">LEARNING PATHWAYS</span><h2>{t('featured')}</h2></div><span className="tag">4 learning areas</span></div><div className="grid">{courses.map(({key,icon:Icon,detail,time})=><article className="course" key={key}><div className="course-icon"><Icon/></div><h3>{t(key)}</h3><p>{detail}</p><div className="course-foot"><span>{time}</span><button onClick={()=>setTab(key)}>View overview →</button></div></article>)}</div></section>
      <section className="split" id="library"><div><span className="eyebrow">LEARNING RESOURCES</span><h2>{t('library')}</h2><p>Organized learning materials, PDF documents and reference resources can be added by authorized instructors and administrators after backend setup.</p></div><div className="resource"> <BookOpen size={36}/><b>Digital resource collection</b><span>PDF • Documents • Study guides</span></div></section>
      <section className="section lower" id="exams"><h2>{t('exams')} & {t('certificates')}</h2><p>Planned features include course assessments, configurable passing scores, learner results, and certificates with QR-based verification.</p><div className="notice">{t('planned')}</div></section>
      <section className="join"><div><span className="eyebrow">GET STARTED</span><h2>Learning that moves forward</h2><p>Registration and learner accounts will be enabled after secure backend configuration.</p></div><form onSubmit={requestDemo}><label htmlFor="email">Email address (demo only)</label><div className="formrow"><input id="email" type="email" required placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/><button>Continue</button></div>{notice&&<small>{notice}</small>}</form></section>
      <section className="section lower" id="certificates"><h2>Trust, access and accountability</h2><p>Role-based access, privacy controls, secure authentication and public verification of limited certificate details are planned for the production release.</p></section>
    </main>
    <footer><a className="brand" href="#"><span className="mark">DL</span>{t('brand')}</a><p>{t('footer')}</p><small>Project proposal and starter interface. Not an officially endorsed or deployed institutional system.</small><small className="status">Backend: {isSupabaseConfigured?'Supabase credentials detected':'Demo mode — Supabase not configured'}</small></footer>
  </div>
}