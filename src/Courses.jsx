
import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";

import { db } from "./firebase";

const words = {
  am: {
    courses: "ትምህርቶች",
    addCourse: "አዲስ ትምህርት ጨምር",
    title: "የትምህርት ርዕስ",
    description: "የትምህርት መግለጫ",
    save: "አስቀምጥ",
    update: "አስተካክል",
    edit: "አርም",
    delete: "ሰርዝ",
    cancel: "ተወው",
    open: "ክፈት",
    back: "ተመለስ",
    loading: "በመጫን ላይ...",
    empty: "ምንም ትምህርት አልተገኘም።",
    lessons: "የትምህርት ክፍሎች",
    lessonTitle: "የክፍሉ ርዕስ",
    content: "የትምህርት ይዘት",
    addLesson: "ክፍል ጨምር",
    noLessons: "ምንም የትምህርት ክፍል የለም።",
    exam: "ፈተና",
    questions: "የፈተና ጥያቄዎች",
    addQuestion: "ጥያቄ ጨምር",
    question: "የፈተና ጥያቄ",
    optionA: "ምርጫ A",
    optionB: "ምርጫ B",
    optionC: "ምርጫ C",
    optionD: "ምርጫ D",
    correct: "ትክክለኛ መልስ",
    choose: "ትክክለኛውን ምረጥ",
    passing: "የማለፊያ ነጥብ (%)",
    startExam: "ፈተና ጀምር",
    submitExam: "ፈተናውን አስገባ",
    selectAnswer: "መልስ ምረጥ",
    noQuestions: "የፈተና ጥያቄዎች ገና አልተዘጋጁም።",
    result: "የፈተና ውጤት",
    score: "ያገኘኸው ነጥብ",
    passed: "አልፈሃል",
    failed: "አላለፍክም",
    certificate: "ሰርተፍኬት",
    certificateReady: "ሰርተፍኬትህ ተመዝግቧል።",
    noCertificate: "የማለፊያ ነጥቡን ስላላሟላህ ሰርተፍኬት አልተሰጠም።",
    myResults: "የእኔ ውጤቶች",
    noResults: "የፈተና ውጤት አልተገኘም።",
    confirmDelete: "ይህን ነገር መሰረዝ ትፈልጋለህ?",
    confirmSubmit: "ፈተናውን ማስገባት ትፈልጋለህ?",
    added: "ተጨምሯል።",
    updated: "ተስተካክሏል።",
    deleted: "ተሰርዟል።",
    error: "ስህተት ተፈጥሯል።",
    required: "እባክህ ሁሉንም አስፈላጊ መረጃዎች ሙላ።",
    questionNumber: "ጥያቄ",
    correctCount: "ትክክለኛ መልሶች",
    totalQuestions: "ጠቅላላ ጥያቄዎች",
    student: "ተማሪ",
    date: "ቀን",
    adminOnly: "ይህን ለማድረግ የአስተዳዳሪ ፈቃድ ያስፈልጋል።",
    noName: "ተማሪ",
    retry: "እንደገና ሞክር",
    yourAnswer: "የእርስዎ መልስ"
  },

  en: {
    courses: "Courses",
    addCourse: "Add New Course",
    title: "Course Title",
    description: "Course Description",
    save: "Save",
    update: "Update",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    open: "Open",
    back: "Back",
    loading: "Loading...",
    empty: "No courses found.",
    lessons: "Lessons",
    lessonTitle: "Lesson Title",
    content: "Lesson Content",
    addLesson: "Add Lesson",
    noLessons: "No lessons available.",
    exam: "Exam",
    questions: "Exam Questions",
    addQuestion: "Add Question",
    question: "Exam Question",
    optionA: "Option A",
    optionB: "Option B",
    optionC: "Option C",
    optionD: "Option D",
    correct: "Correct Answer",
    choose: "Choose the correct answer",
    passing: "Passing Score (%)",
    startExam: "Start Exam",
    submitExam: "Submit Exam",
    selectAnswer: "Select an answer",
    noQuestions: "No exam questions have been added yet.",
    result: "Exam Result",
    score: "Your Score",
    passed: "Passed",
    failed: "Failed",
    certificate: "Certificate",
    certificateReady: "Your certificate has been recorded.",
    noCertificate: "You did not meet the passing score. No certificate was issued.",
    myResults: "My Results",
    noResults: "No exam results found.",
    confirmDelete: "Are you sure you want to delete this item?",
    confirmSubmit: "Are you sure you want to submit your exam?",
    added: "Added successfully.",
    updated: "Updated successfully.",
    deleted: "Deleted successfully.",
    error: "An error occurred.",
    required: "Please complete all required fields.",
    questionNumber: "Question",
    correctCount: "Correct Answers",
    totalQuestions: "Total Questions",
    student: "Student",
    date: "Date",
    adminOnly: "Administrator permission is required.",
    noName: "Student",
    retry: "Try again",
    yourAnswer: "Your answer"
  },

  om: {
    courses: "Barnoota",
    addCourse: "Barnoota haaraa dabali",
    title: "Mata duree barnootaa",
    description: "Ibsa barnootaa",
    save: "Olkaa'i",
    update: "Fooyyessi",
    edit: "Fooyyessi",
    delete: "Haqi",
    cancel: "Dhiisi",
    open: "Bani",
    back: "Deebi'i",
    loading: "Fe'amaa jira...",
    empty: "Barnoonni hin argamne.",
    lessons: "Kutaalee barnootaa",
    lessonTitle: "Mata duree kutaa",
    content: "Qabiyyee barnootaa",
    addLesson: "Kutaa dabali",
    noLessons: "Kutaan barnootaa hin jiru.",
    exam: "Qormaata",
    questions: "Gaaffilee qormaataa",
    addQuestion: "Gaaffii dabali",
    question: "Gaaffii qormaataa",
    optionA: "Filannoo A",
    optionB: "Filannoo B",
    optionC: "Filannoo C",
    optionD: "Filannoo D",
    correct: "Deebii sirrii",
    choose: "Deebii sirrii filadhu",
    passing: "Qabxii darbuuf (%)",
    startExam: "Qormaata jalqabi",
    submitExam: "Qormaata galchi",
    selectAnswer: "Deebii filadhu",
    noQuestions: "Gaaffileen qormaataa hin dabalamin.",
    result: "Bu'aa qormaataa",
    score: "Qabxii kee",
    passed: "Darbiteetta",
    failed: "Hin darbine",
    certificate: "Ragaa",
    certificateReady: "Ragaan kee galmaa'eera.",
    noCertificate: "Qabxii darbuu waan hin guunneef ragaan hin kennamne.",
    myResults: "Bu'aawwan koo",
    noResults: "Bu'aan qormaataa hin argamne.",
    confirmDelete: "Wanta kana haquu barbaaddaa?",
    confirmSubmit: "Qormaata galchuu barbaaddaa?",
    added: "Milkaa'inaan dabalameera.",
    updated: "Milkaa'inaan fooyya'eera.",
    deleted: "Milkaa'inaan haqameera.",
    error: "Dogoggorri uumameera.",
    required: "Maaloo odeeffannoo barbaachisaa hunda guuti.",
    questionNumber: "Gaaffii",
    correctCount: "Deebii sirrii",
    totalQuestions: "Gaaffilee waliigalaa",
    student: "Barataa",
    date: "Guyyaa",
    adminOnly: "Eeyyamni bulchiinsaa barbaachisa.",
    noName: "Barataa",
    retry: "Irra deebi'i",
    yourAnswer: "Deebii kee"
  }
};

export default function Courses({
  user,
  profile,
  language = "am"
}) {
  const t = words[language] || words.am;
  const admin = profile?.role === "admin";

  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);

  const [view, setView] = useState("courses");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [passingScore, setPassingScore] = useState("70");
  const [editingCourse, setEditingCourse] = useState(null);

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");

  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");

  const [answers, setAnswers] = useState({});
  const [lastResult, setLastResult] = useState(null);

  // ------------------------------
  // LOAD COURSES
  // ------------------------------

  async function loadCourses() {
    setLoading(true);
    setMessage("");

    try {
      const snapshot = await getDocs(
        collection(db, "courses")
      );

      setCourses(
        snapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }))
      );
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  // ------------------------------
  // ADD COURSE
  // ------------------------------

  async function addCourse(event) {
    event.preventDefault();

    if (!admin || !user) {
      setMessage(t.adminOnly);
      return;
    }

    if (!courseTitle.trim()) {
      setMessage(t.required);
      return;
    }

    const score = Number(passingScore);

    if (!Number.isFinite(score) || score < 1 || score > 100) {
      setMessage(t.required);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const data = {
        title: courseTitle.trim(),
        description: courseDescription.trim(),
        passingScore: score,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const result = await addDoc(
        collection(db, "courses"),
        data
      );

      setCourses(previous => [
        ...previous,
        {
          id: result.id,
          ...data
        }
      ]);

      setCourseTitle("");
      setCourseDescription("");
      setPassingScore("70");
      setMessage(t.added);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------
  // EDIT COURSE
  // ------------------------------

  function startEditCourse(course) {
    setEditingCourse(course);
    setCourseTitle(course.title || "");
    setCourseDescription(course.description || "");
    setPassingScore(String(course.passingScore ?? 70));
    setMessage("");
  }

  async function updateCourse(event) {
    event.preventDefault();

    if (!admin || !editingCourse) return;

    const score = Number(passingScore);

    if (!courseTitle.trim() || score < 1 || score > 100) {
      setMessage(t.required);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const data = {
        title: courseTitle.trim(),
        description: courseDescription.trim(),
        passingScore: score,
        updatedAt: serverTimestamp()
      };

      await updateDoc(
        doc(db, "courses", editingCourse.id),
        data
      );

      setCourses(previous =>
        previous.map(course =>
          course.id === editingCourse.id
            ? { ...course, ...data }
            : course
        )
      );

      setEditingCourse(null);
      setCourseTitle("");
      setCourseDescription("");
      setPassingScore("70");
      setMessage(t.updated);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------
  // OPEN COURSE
  // ------------------------------

  async function openCourse(course) {
    setLoading(true);
    setMessage("");

    try {
      const lessonSnapshot = await getDocs(
        collection(db, "courses", course.id, "lessons")
      );

      const questionSnapshot = await getDocs(
        collection(db, "courses", course.id, "questions")
      );

      setLessons(
        lessonSnapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }))
      );

      setQuestions(
        questionSnapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }))
      );

      setSelected(course);
      setAnswers({});
      setLastResult(null);
      setView("course");
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------
  // ADD LESSON
  // ------------------------------

  async function addLesson(event) {
    event.preventDefault();

    if (!admin || !user || !selected) return;

    if (!lessonTitle.trim() || !lessonContent.trim()) {
      setMessage(t.required);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const data = {
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
        createdBy: user.uid,
        createdAt: serverTimestamp()
      };

      const result = await addDoc(
        collection(db, "courses", selected.id, "lessons"),
        data
      );

      setLessons(previous => [
        ...previous,
        { id: result.id, ...data }
      ]);

      setLessonTitle("");
      setLessonContent("");
      setMessage(t.added);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------
  // DELETE LESSON
  // ------------------------------

  async function removeLesson(lessonId) {
    if (!admin || !selected) return;

    if (!window.confirm(t.confirmDelete)) return;

    setSaving(true);

    try {
      await deleteDoc(
        doc(db, "courses", selected.id, "lessons", lessonId)
      );

      setLessons(previous =>
        previous.filter(item => item.id !== lessonId)
      );

      setMessage(t.deleted);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------
  // ADD EXAM QUESTION
  // ------------------------------

  async function addQuestion(event) {
    event.preventDefault();

    if (!admin || !user || !selected) return;

    const options = {
      A: optionA.trim(),
      B: optionB.trim(),
      C: optionC.trim(),
      D: optionD.trim()
    };

    if (
      !questionText.trim() ||
      Object.values(options).some(value => !value)
    ) {
      setMessage(t.required);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const data = {
        question: questionText.trim(),
        options,
        correctAnswer,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      };

      const result = await addDoc(
        collection(db, "courses", selected.id, "questions"),
        data
      );

      setQuestions(previous => [
        ...previous,
        { id: result.id, ...data }
      ]);

      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("A");

      setMessage(t.added);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------
  // DELETE QUESTION
  // ------------------------------

  async function removeQuestion(questionId) {
    if (!admin || !selected) return;

    if (!window.confirm(t.confirmDelete)) return;

    setSaving(true);

    try {
      await deleteDoc(
        doc(db, "courses", selected.id, "questions", questionId)
      );

      setQuestions(previous =>
        previous.filter(item => item.id !== questionId)
      );

      setMessage(t.deleted);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------
  // START EXAM
  // ------------------------------

  function startExam() {
    if (questions.length === 0) {
      setMessage(t.noQuestions);
      return;
    }

    setAnswers({});
    setLastResult(null);
    setMessage("");
    setView("exam");
  }

  // ------------------------------
  // SUBMIT AND MARK EXAM
  // ------------------------------

  async function submitExam(event) {
    event.preventDefault();

    if (!user || !selected || questions.length === 0) return;

    if (questions.some(question => !answers[question.id])) {
      setMessage(t.required);
      return;
    }

    if (!window.confirm(t.confirmSubmit)) return;

    setSaving(true);
    setMessage("");

    try {
      let correctCount = 0;

      questions.forEach(question => {
        if (answers[question.id] === question.correctAnswer) {
          correctCount++;
        }
      });

      const total = questions.length;
      const score = Math.round((correctCount / total) * 100);
      const requiredScore = Number(selected.passingScore ?? 70);
      const passed = score >= requiredScore;

      const resultData = {
        userId: user.uid,
        studentName:
          profile?.name ||
          user.displayName ||
          user.email ||
          t.noName,
        courseId: selected.id,
        courseTitle: selected.title,
        totalQuestions: total,
        correctAnswers: correctCount,
        score,
        passingScore: requiredScore,
        passed,
        answers,
        createdAt: serverTimestamp()
      };

      const resultRef = await addDoc(
        collection(db, "results"),
        resultData
      );

      let certificateId = null;

      if (passed) {
        const certificateData = {
          userId: user.uid,
          studentName: resultData.studentName,
          courseId: selected.id,
          courseTitle: selected.title,
          resultId: resultRef.id,
          score,
          certificateStatus: "issued",
          createdAt: serverTimestamp()
        };

        const certificateRef = await addDoc(
          collection(db, "certificates"),
          certificateData
        );

        certificateId = certificateRef.id;
      }

      setLastResult({
        ...resultData,
        id: resultRef.id,
        certificateId
      });

      setView("result");
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------
  // LOAD MY RESULTS
  // ------------------------------

  async function loadMyResults() {
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      const resultQuery = query(
        collection(db, "results"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(resultQuery);

      const list = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));

      list.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setResults(list);
      setView("results");
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------
  // DELETE COURSE
  // ------------------------------

  async function removeCourse(courseId) {
    if (!admin) return;

    if (!window.confirm(t.confirmDelete)) return;

    setSaving(true);
    setMessage("");

    try {
      const lessonSnapshot = await getDocs(
        collection(db, "courses", courseId, "lessons")
      );

      const questionSnapshot = await getDocs(
        collection(db, "courses", courseId, "questions")
      );

      for (const item of lessonSnapshot.docs) {
        await deleteDoc(
          doc(db, "courses", courseId, "lessons", item.id)
        );
      }

      for (const item of questionSnapshot.docs) {
        await deleteDoc(
          doc(db, "courses", courseId, "questions", item.id)
        );
      }

      await deleteDoc(doc(db, "courses", courseId));

      setCourses(previous =>
        previous.filter(course => course.id !== courseId)
      );

      if (selected?.id === courseId) {
        setSelected(null);
        setView("courses");
      }

      setMessage(t.deleted);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------
  // NAVIGATION
  // ------------------------------

  function goBack() {
    setMessage("");
    setView("courses");
    setSelected(null);
    setLastResult(null);
    setAnswers({});
    setEditingCourse(null);
    setCourseTitle("");
    setCourseDescription("");
    setPassingScore("70");
  }

  // ------------------------------
  // LOADING SCREEN
  // ------------------------------

  if (loading) {
    return (
      <section className="courses-section">
        <p>{t.loading}</p>
      </section>
    );
  }

  // ------------------------------
  // MAIN PAGE
  // ------------------------------

  return (
    <section className="courses-section">

      <div style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "20px"
      }}>
        <button onClick={goBack}>
          {t.courses}
        </button>

        <button onClick={loadMyResults}>
          {t.myResults}
        </button>

        <button onClick={loadCourses}>
          {t.retry}
        </button>
      </div>

      {message && (
        <p role="alert" style={{
          padding: "10px",
          background: "#fff0d9",
          color: "#713d00",
          borderRadius: "6px",
          overflowWrap: "anywhere"
        }}>
          {message}
        </p>
      )}

      {/* COURSE LIST */}

      {view === "courses" && (
        <>
          <h2>{t.courses}</h2>

          {admin && (
            <form
              onSubmit={
                editingCourse ? updateCourse : addCourse
              }
              style={{ marginBottom: "25px" }}
            >
              <h3>
                {editingCourse ? t.edit : t.addCourse}
              </h3>

              <input
                value={courseTitle}
                onChange={e => setCourseTitle(e.target.value)}
                placeholder={t.title}
                required
              />

              <textarea
                value={courseDescription}
                onChange={e => setCourseDescription(e.target.value)}
                placeholder={t.description}
                rows={3}
              />

              <label>{t.passing}</label>

              <input
                type="number"
                min="1"
                max="100"
                value={passingScore}
                onChange={e => setPassingScore(e.target.value)}
                required
              />

              <button type="submit" disabled={saving}>
                {saving ? t.loading : editingCourse ? t.update : t.save}
              </button>

              {editingCourse && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseTitle("");
                    setCourseDescription("");
                    setPassingScore("70");
                  }}
                >
                  {t.cancel}
                </button>
              )}
            </form>
          )}

          {courses.length === 0 && <p>{t.empty}</p>}

          {courses.map(course => (
            <article
              key={course.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "12px",
                borderRadius: "8px"
              }}
            >
              <h3>{course.title}</h3>
              <p>{course.description}</p>

              <p>
                {t.passing}: {course.passingScore ?? 70}%
              </p>

              <button onClick={() => openCourse(course)}>
                {t.open}
              </button>

              {admin && (
                <>
                  <button onClick={() => startEditCourse(course)}>
                    {t.edit}
                  </button>

                  <button
                    onClick={() => removeCourse(course.id)}
                    disabled={saving}
                  >
                    {t.delete}
                  </button>
                </>
              )}
            </article>
          ))}
        </>
      )}

      {/* COURSE DETAILS */}

      {view === "course" && selected && (
        <>
          <button onClick={goBack}>{t.back}</button>

          <h2>{selected.title}</h2>
          <p>{selected.description}</p>

          <h3>{t.lessons}</h3>

          {lessons.length === 0 && <p>{t.noLessons}</p>}

          {lessons.map(lesson => (
            <article
              key={lesson.id}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "8px"
              }}
            >
              <h4>{lesson.title}</h4>

              <p style={{ whiteSpace: "pre-wrap" }}>
                {lesson.content}
              </p>

              {admin && (
                <button
                  onClick={() => removeLesson(lesson.id)}
                  disabled={saving}
                >
                  {t.delete}
                </button>
              )}
            </article>
          ))}

          {admin && (
            <form onSubmit={addLesson}>
              <h3>{t.addLesson}</h3>

              <input
                value={lessonTitle}
                onChange={e => setLessonTitle(e.target.value)}
                placeholder={t.lessonTitle}
                required
              />

              <textarea
                value={lessonContent}
                onChange={e => setLessonContent(e.target.value)}
                placeholder={t.content}
                rows={6}
                required
              />

              <button type="submit" disabled={saving}>
                {saving ? t.loading : t.save}
              </button>
            </form>
          )}

          <hr />

          <h3>{t.questions}</h3>

          {questions.length === 0 && <p>{t.noQuestions}</p>}

          {questions.map((item, index) => (
            <article
              key={item.id}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "8px"
              }}
            >
              <strong>
                {t.questionNumber} {index + 1}: {item.question}
              </strong>

              {Object.entries(item.options || {}).map(([key, value]) => (
                <p key={key}>{key}. {value}</p>
              ))}

              {admin && (
                <button
                  onClick={() => removeQuestion(item.id)}
                  disabled={saving}
                >
                  {t.delete}
                </button>
              )}
            </article>
          ))}

          {admin && (
            <form onSubmit={addQuestion}>
              <h3>{t.addQuestion}</h3>

              <textarea
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                placeholder={t.question}
                rows={3}
                required
              />

              <input
                value={optionA}
                onChange={e => setOptionA(e.target.value)}
                placeholder={t.optionA}
                required
              />

              <input
                value={optionB}
                onChange={e => setOptionB(e.target.value)}
                placeholder={t.optionB}
                required
              />

              <input
                value={optionC}
                onChange={e => setOptionC(e.target.value)}
                placeholder={t.optionC}
                required
              />

              <input
                value={optionD}
                onChange={e => setOptionD(e.target.value)}
                placeholder={t.optionD}
                required
              />

              <label>{t.correct}</label>

              <select
                value={correctAnswer}
                onChange={e => setCorrectAnswer(e.target.value)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>

              <button type="submit" disabled={saving}>
                {saving ? t.loading : t.addQuestion}
              </button>
            </form>
          )}

          {!admin && questions.length > 0 && (
            <button onClick={startExam}>
              {t.startExam}
            </button>
          )}
        </>
      )}

      {/* STUDENT EXAM */}

      {view === "exam" && selected && (
        <>
          <button onClick={() => setView("course")}>
            {t.back}
          </button>

          <h2>{t.exam}: {selected.title}</h2>

          <p>
            {t.totalQuestions}: {questions.length}
          </p>

          <form onSubmit={submitExam}>
            {questions.map((item, index) => (
              <article
                key={item.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "15px",
                  borderRadius: "8px"
                }}
              >
                <h3>
                  {t.questionNumber} {index + 1}
                </h3>

                <p>{item.question}</p>

                {Object.entries(item.options || {}).map(([key, value]) => (
                  <label
                    key={key}
                    style={{
                      display: "block",
                      padding: "8px"
                    }}
                  >
                    <input
                      type="radio"
                      name={item.id}
                      value={key}
                      checked={answers[item.id] === key}
                      onChange={() =>
                        setAnswers(previous => ({
                          ...previous,
                          [item.id]: key
                        }))
                      }
                    />

                    {" "}{key}. {value}
                  </label>
                ))}
              </article>
            ))}

            <button type="submit" disabled={saving}>
              {saving ? t.loading : t.submitExam}
            </button>
          </form>
        </>
      )}

      {/* EXAM RESULT */}

      {view === "result" && lastResult && (
        <>
          <h2>{t.result}</h2>

          <h3>{lastResult.courseTitle}</h3>

          <p>
            {t.correctCount}: {lastResult.correctAnswers}
          </p>

          <p>
            {t.totalQuestions}: {lastResult.totalQuestions}
          </p>

          <h2>{t.score}: {lastResult.score}%</h2>

          <h3 style={{
            color: lastResult.passed ? "green" : "red"
          }}>
            {lastResult.passed ? t.passed : t.failed}
          </h3>

          {lastResult.passed ? (
            <p>
              {t.certificateReady}
              <br />
              {t.certificate}: {lastResult.certificateId}
            </p>
          ) : (
            <p>{t.noCertificate}</p>
          )}

          <button onClick={goBack}>
            {t.back}
          </button>
        </>
      )}

      {/* STUDENT RESULTS */}

      {view === "results" && (
        <>
          <h2>{t.myResults}</h2>

          <button onClick={goBack}>{t.back}</button>

          {results.length === 0 && <p>{t.noResults}</p>}

          {results.map(result => (
            <article
              key={result.id}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "8px"
              }}
            >
              <h3>{result.courseTitle}</h3>

              <p>{t.score}: {result.score}%</p>

              <p>
                {t.correctCount}: {result.correctAnswers}/
                {result.totalQuestions}
              </p>

              <strong style={{
                color: result.passed ? "green" : "red"
              }}>
                {result.passed ? t.passed : t.failed}
              </strong>
            </article>
          ))}
        </>
      )}

    </section>
  );
}
