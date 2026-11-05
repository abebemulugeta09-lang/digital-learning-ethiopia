
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
  where,
  writeBatch
} from "firebase/firestore";

import { db } from "./firebase";

const words = {
  am: {
    courses: "ትምህርቶች",
    addCourse: "አዲስ ትምህርት ጨምር",
    title: "የአማርኛ ትምህርት ርዕስ",
    description: "የአማርኛ ትምህርት መግለጫ",
    titleEn: "የእንግሊዝኛ ርዕስ",
    descriptionEn: "የእንግሊዝኛ መግለጫ",
    titleOm: "የአፋን ኦሮሞ ርዕስ",
    descriptionOm: "የአፋን ኦሮሞ መግለጫ",
    save: "አስቀምጥ",
    update: "አስተካክል",
    edit: "አርም",
    delete: "አስወግድ",
    archive: "ወደ ማህደር አስገባ",
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
    questions: "የፈተና ጥያቄዎች",
    addQuestion: "ጥያቄ ጨምር",
    question: "የፈተና ጥያቄ",
    optionA: "ምርጫ A",
    optionB: "ምርጫ B",
    optionC: "ምርጫ C",
    optionD: "ምርጫ D",
    correct: "ትክክለኛ መልስ",
    passing: "የማለፊያ ነጥብ (%)",
    myResults: "የእኔ ውጤቶች",
    noResults: "የፈተና ውጤት አልተገኘም።",
    result: "የፈተና ውጤት",
    score: "ያገኘኸው ነጥብ",
    passed: "አልፈሃል",
    failed: "አላለፍክም",
    certificate: "ሰርተፊኬት",
    student: "ተማሪ",
    date: "ቀን",
    correctCount: "ትክክለኛ መልሶች",
    totalQuestions: "ጠቅላላ ጥያቄዎች",
    confirmDelete: "ይህን ነገር ማስወገድ ትፈልጋለህ?",
    confirmArchive: "ይህን ኮርስ ወደ ማህደር ማስገባት ትፈልጋለህ?",
    added: "ተጨምሯል።",
    updated: "ተስተካክሏል።",
    deleted: "ተወግዷል።",
    archived: "ወደ ማህደር ገብቷል።",
    error: "ስህተት ተፈጥሯል።",
    required: "እባክህ አስፈላጊውን መረጃ ሙላ።",
    adminOnly: "የአስተዳዳሪ ፈቃድ ያስፈልጋል።",
    noName: "ተማሪ",
    retry: "እንደገና ሞክር",
    secureExam: "ፈተናው በደህንነት ምክንያት ለጊዜው ተዘግቷል።",
    adminQuestions: "የአስተዳዳሪ የጥያቄ አስተዳደር",
    noQuestions: "ጥያቄዎች አልተጨመሩም።",
    archivedList: "የተመዘገቡ ኮርሶች"
  },

  en: {
    courses: "Courses",
    addCourse: "Add New Course",
    title: "Amharic Course Title",
    description: "Amharic Course Description",
    titleEn: "English Course Title",
    descriptionEn: "English Course Description",
    titleOm: "Afaan Oromo Course Title",
    descriptionOm: "Afaan Oromo Course Description",
    save: "Save",
    update: "Update",
    edit: "Edit",
    delete: "Remove",
    archive: "Archive Course",
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
    questions: "Exam Questions",
    addQuestion: "Add Question",
    question: "Exam Question",
    optionA: "Option A",
    optionB: "Option B",
    optionC: "Option C",
    optionD: "Option D",
    correct: "Correct Answer",
    passing: "Passing Score (%)",
    myResults: "My Results",
    noResults: "No exam results found.",
    result: "Exam Result",
    score: "Your Score",
    passed: "Passed",
    failed: "Failed",
    certificate: "Certificate",
    student: "Student",
    date: "Date",
    correctCount: "Correct Answers",
    totalQuestions: "Total Questions",
    confirmDelete: "Are you sure you want to remove this item?",
    confirmArchive: "Are you sure you want to archive this course?",
    added: "Added successfully.",
    updated: "Updated successfully.",
    deleted: "Removed successfully.",
    archived: "Course archived successfully.",
    error: "An error occurred.",
    required: "Please complete all required fields.",
    adminOnly: "Administrator permission is required.",
    noName: "Student",
    retry: "Retry",
    secureExam: "Exams are temporarily unavailable while secure exam services are being configured.",
    adminQuestions: "Administrator Question Management",
    noQuestions: "No questions have been added.",
    archivedList: "Archived courses"
  },

  om: {
    courses: "Barnoota",
    addCourse: "Barnoota haaraa dabali",
    title: "Mata duree barnootaa Afaan Amaaraa",
    description: "Ibsa barnootaa Afaan Amaaraa",
    titleEn: "Mata duree Afaan Ingilizii",
    descriptionEn: "Ibsa Afaan Ingilizii",
    titleOm: "Mata duree Afaan Oromoo",
    descriptionOm: "Ibsa Afaan Oromoo",
    save: "Olkaa'i",
    update: "Fooyyessi",
    edit: "Fooyyessi",
    delete: "Haqi",
    archive: "Kuusaa keessa kaa'i",
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
    questions: "Gaaffilee qormaataa",
    addQuestion: "Gaaffii dabali",
    question: "Gaaffii qormaataa",
    optionA: "Filannoo A",
    optionB: "Filannoo B",
    optionC: "Filannoo C",
    optionD: "Filannoo D",
    correct: "Deebii sirrii",
    passing: "Qabxii darbuuf (%)",
    myResults: "Bu'aawwan koo",
    noResults: "Bu'aan qormaataa hin argamne.",
    result: "Bu'aa qormaataa",
    score: "Qabxii kee",
    passed: "Darbiteetta",
    failed: "Hin darbine",
    certificate: "Ragaa",
    student: "Barataa",
    date: "Guyyaa",
    correctCount: "Deebii sirrii",
    totalQuestions: "Gaaffilee waliigalaa",
    confirmDelete: "Wanta kana haquu barbaaddaa?",
    confirmArchive: "Barnoota kana kuusaa keessa kaa'uu barbaaddaa?",
    added: "Milkaa'inaan dabalameera.",
    updated: "Milkaa'inaan fooyya'eera.",
    deleted: "Milkaa'inaan haqameera.",
    archived: "Kuusaa keessa galfameera.",
    error: "Dogoggorri uumameera.",
    required: "Maaloo odeeffannoo barbaachisaa guuti.",
    adminOnly: "Eeyyamni bulchiinsaa barbaachisa.",
    noName: "Barataa",
    retry: "Irra deebi'i",
    secureExam: "Qormaanni yeroo ammaa nageenyaaf cufameera.",
    adminQuestions: "Bulchiinsa gaaffilee",
    noQuestions: "Gaaffileen hin dabalamin.",
    archivedList: "Barnoota kuusaa keessa jiru"
  }
};

function getCourseTitle(course, language) {
  if (!course) return "";

  if (language === "en") {
    return course.titleEn || course.title || "";
  }

  if (language === "om") {
    return course.titleOm || course.title || "";
  }

  return course.title || "";
}

function getCourseDescription(course, language) {
  if (!course) return "";

  if (language === "en") {
    return course.descriptionEn || course.description || "";
  }

  if (language === "om") {
    return course.descriptionOm || course.description || "";
  }

  return course.description || "";
}

// Bulk import text parser
function parseBulkQuestions(text) {
  const blocks = text
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .filter(block => block.trim());

  if (!blocks.length) {
    throw new Error("ምንም ጥያቄ አልተገኘም።");
  }

  return blocks.map((block, index) => {
    const lines = block
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    function getValue(label) {
      const line = lines.find(item =>
        new RegExp("^" + label + "\\s*:", "i").test(item)
      );

      return line
        ? line.replace(/^[^:]+:/, "").trim()
        : "";
    }

    const question = getValue("Question");
    const A = getValue("A");
    const B = getValue("B");
    const C = getValue("C");
    const D = getValue("D");
    const correctAnswer = getValue("Correct").toUpperCase();

    if (
      !question ||
      !A ||
      !B ||
      !C ||
      !D ||
      !["A", "B", "C", "D"].includes(correctAnswer)
    ) {
      throw new Error(
        `በጥያቄ ${index + 1} ላይ ስህተት አለ። Question, A, B, C, D እና Correct መሙላት አለባቸው።`
      );
    }

    return {
      question,
      options: { A, B, C, D },
      correctAnswer
    };
  });
}

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

  const [showArchived, setShowArchived] = useState(false);

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseTitleEn, setCourseTitleEn] = useState("");
  const [courseDescriptionEn, setCourseDescriptionEn] = useState("");
  const [courseTitleOm, setCourseTitleOm] = useState("");
  const [courseDescriptionOm, setCourseDescriptionOm] = useState("");

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

  // Bulk import states
  const [bulkText, setBulkText] = useState("");
  const [bulkQuestions, setBulkQuestions] = useState([]);
  const [bulkError, setBulkError] = useState("");

  function clearCourseForm() {
    setCourseTitle("");
    setCourseDescription("");
    setCourseTitleEn("");
    setCourseDescriptionEn("");
    setCourseTitleOm("");
    setCourseDescriptionOm("");
    setPassingScore("70");
    setEditingCourse(null);
  }

  async function loadCourses() {
    setLoading(true);
    setMessage("");

    try {
      const snapshot = await getDocs(collection(db, "courses"));

      const list = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));

      setCourses(list);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function saveCourse(event) {
    event.preventDefault();

    if (!admin || !user) {
      setMessage(t.adminOnly);
      return;
    }

    if (
      !courseTitle.trim() ||
      !courseTitleEn.trim() ||
      !courseTitleOm.trim()
    ) {
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

    const data = {
      title: courseTitle.trim(),
      description: courseDescription.trim(),
      titleEn: courseTitleEn.trim(),
      descriptionEn: courseDescriptionEn.trim(),
      titleOm: courseTitleOm.trim(),
      descriptionOm: courseDescriptionOm.trim(),
      passingScore: score,
      isArchived: false,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingCourse) {
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

        setMessage(t.updated);
      } else {
        const newData = {
          ...data,
          createdBy: user.uid,
          createdAt: serverTimestamp()
        };

        const result = await addDoc(
          collection(db, "courses"),
          newData
        );

        setCourses(previous => [
          ...previous,
          { id: result.id, ...newData }
        ]);

        setMessage(t.added);
      }

      clearCourseForm();
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  function startEditCourse(course) {
    setEditingCourse(course);

    setCourseTitle(course.title || "");
    setCourseDescription(course.description || "");
    setCourseTitleEn(course.titleEn || "");
    setCourseDescriptionEn(course.descriptionEn || "");
    setCourseTitleOm(course.titleOm || "");
    setCourseDescriptionOm(course.descriptionOm || "");
    setPassingScore(String(course.passingScore ?? 70));

    setMessage("");
    setView("courses");
  }

  async function openCourse(course) {
    setLoading(true);
    setMessage("");

    try {
      const lessonSnapshot = await getDocs(
        collection(db, "courses", course.id, "lessons")
      );

      setLessons(
        lessonSnapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }))
      );

      // Correct answers are never downloaded to student devices.
      if (admin) {
        const questionSnapshot = await getDocs(
          collection(db, "courses", course.id, "questions")
        );

        setQuestions(
          questionSnapshot.docs.map(item => ({
            id: item.id,
            ...item.data()
          }))
        );
      } else {
        setQuestions([]);
      }

      setSelected(course);
      setView("course");
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function addLesson(event) {
    event.preventDefault();

    if (!admin || !user || !selected) {
      setMessage(t.adminOnly);
      return;
    }

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

  async function addQuestion(event) {
    event.preventDefault();

    if (!admin || !user || !selected) {
      setMessage(t.adminOnly);
      return;
    }

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

  // Prepare bulk questions for preview
  function previewBulkQuestions() {
    setBulkError("");
    setBulkQuestions([]);

    try {
      const parsed = parseBulkQuestions(bulkText);
      setBulkQuestions(parsed);
    } catch (error) {
      setBulkError(error.message || t.error);
    }
  }

  // Import all previewed questions in one Firestore batch
  async function importBulkQuestions() {
    if (!admin || !user || !selected) {
      setBulkError(t.adminOnly);
      return;
    }

    if (!bulkQuestions.length) {
      setBulkError("ከመጀመሪያ Preview አድርግ።");
      return;
    }

    if (bulkQuestions.length > 450) {
      setBulkError("በአንድ ጊዜ ከ450 በላይ ጥያቄዎችን ማስገባት አይቻልም።");
      return;
    }

    const confirmed = window.confirm(
      `${bulkQuestions.length} ጥያቄዎችን ወደዚህ ኮርስ ማስገባት ትፈልጋለህ?`
    );

    if (!confirmed) return;

    setSaving(true);
    setBulkError("");
    setMessage("");

    try {
      const batch = writeBatch(db);

      bulkQuestions.forEach(item => {
        const questionRef = doc(
          collection(db, "courses", selected.id, "questions")
        );

        batch.set(questionRef, {
          question: item.question,
          options: item.options,
          correctAnswer: item.correctAnswer,
          createdBy: user.uid,
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();

      const snapshot = await getDocs(
        collection(db, "courses", selected.id, "questions")
      );

      setQuestions(
        snapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }))
      );

      const importedCount = bulkQuestions.length;

      setBulkText("");
      setBulkQuestions([]);
      setMessage(
        `${importedCount} ጥያቄዎች በተሳካ ሁኔታ ተጨምረዋል።`
      );
    } catch (error) {
      setBulkError(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

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

  async function archiveCourse(courseId) {
    if (!admin) return;
    if (!window.confirm(t.confirmArchive)) return;

    setSaving(true);
    setMessage("");

    try {
      await updateDoc(doc(db, "courses", courseId), {
        isArchived: true,
        updatedAt: serverTimestamp()
      });

      setCourses(previous =>
        previous.map(course =>
          course.id === courseId
            ? { ...course, isArchived: true }
            : course
        )
      );

      if (selected?.id === courseId) {
        setSelected(null);
        setView("courses");
      }

      setMessage(t.archived);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  async function restoreCourse(courseId) {
    if (!admin) return;

    setSaving(true);
    setMessage("");

    try {
      await updateDoc(doc(db, "courses", courseId), {
        isArchived: false,
        updatedAt: serverTimestamp()
      });

      setCourses(previous =>
        previous.map(course =>
          course.id === courseId
            ? { ...course, isArchived: false }
            : course
        )
      );

      setMessage(t.updated);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

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

      list.sort((a, b) =>
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
      );

      setResults(list);
      setView("results");
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setMessage("");
    setView("courses");
    setSelected(null);
    setBulkText("");
    setBulkQuestions([]);
    setBulkError("");
    clearCourseForm();
  }

  const visibleCourses = courses.filter(course =>
    showArchived
      ? course.isArchived === true
      : course.isArchived !== true
  );

  if (loading) {
    return (
      <section className="courses-section">
        <p>{t.loading}</p>
      </section>
    );
  }

  return (
    <section className="courses-section">

      <div style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "20px"
      }}>
        <button onClick={goBack}>{t.courses}</button>
        <button onClick={loadMyResults}>{t.myResults}</button>
        <button onClick={loadCourses}>{t.retry}</button>
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

      {view === "courses" && (
        <>
          <h2>{t.courses}</h2>

          {admin && (
            <form
              onSubmit={saveCourse}
              style={{ marginBottom: "25px" }}
            >
              <h3>
                {editingCourse ? t.edit : t.addCourse}
              </h3>

              <h4>{t.title}</h4>
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

              <h4>{t.titleEn}</h4>
              <input
                value={courseTitleEn}
                onChange={e => setCourseTitleEn(e.target.value)}
                placeholder={t.titleEn}
                required
              />

              <textarea
                value={courseDescriptionEn}
                onChange={e => setCourseDescriptionEn(e.target.value)}
                placeholder={t.descriptionEn}
                rows={3}
              />

              <h4>{t.titleOm}</h4>
              <input
                value={courseTitleOm}
                onChange={e => setCourseTitleOm(e.target.value)}
                placeholder={t.titleOm}
                required
              />

              <textarea
                value={courseDescriptionOm}
                onChange={e => setCourseDescriptionOm(e.target.value)}
                placeholder={t.descriptionOm}
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
                  onClick={clearCourseForm}
                >
                  {t.cancel}
                </button>
              )}
            </form>
          )}

          {admin && (
            <div style={{ marginBottom: "15px" }}>
              <button
                type="button"
                onClick={() => setShowArchived(value => !value)}
              >
                {showArchived ? t.courses : t.archivedList}
              </button>
            </div>
          )}

          {visibleCourses.length === 0 && <p>{t.empty}</p>}

          {visibleCourses.map(course => (
            <article
              key={course.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "12px",
                borderRadius: "8px"
              }}
            >
              <h3>{getCourseTitle(course, language)}</h3>
              <p>{getCourseDescription(course, language)}</p>

              <p>
                {t.passing}: {course.passingScore ?? 70}%
              </p>

              <button onClick={() => openCourse(course)}>
                {t.open}
              </button>

              {admin && !showArchived && (
                <>
                  <button onClick={() => startEditCourse(course)}>
                    {t.edit}
                  </button>

                  <button
                    onClick={() => archiveCourse(course.id)}
                    disabled={saving}
                  >
                    {t.archive}
                  </button>
                </>
              )}

              {admin && showArchived && (
                <button
                  onClick={() => restoreCourse(course.id)}
                  disabled={saving}
                >
                  {t.update}
                </button>
              )}
            </article>
          ))}
        </>
      )}

      {view === "course" && selected && (
        <>
          <button onClick={goBack}>{t.back}</button>

          <h2>{getCourseTitle(selected, language)}</h2>
          <p>{getCourseDescription(selected, language)}</p>

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

          {admin && (
            <>
              <hr />

              <h3>{t.adminQuestions}</h3>

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
                    {index + 1}. {item.question}
                  </strong>

                  {Object.entries(item.options || {}).map(([key, value]) => (
                    <p key={key}>{key}. {value}</p>
                  ))}

                  <p>
                    {t.correct}: {item.correctAnswer}
                  </p>

                  <button
                    onClick={() => removeQuestion(item.id)}
                    disabled={saving}
                  >
                    {t.delete}
                  </button>
                </article>
              ))}

              {/* BULK IMPORT SECTION */}
              <div style={{
                border: "2px solid #2563eb",
                background: "#f5f8ff",
                color: "#172554",
                padding: "18px",
                margin: "25px 0",
                borderRadius: "12px"
              }}>
                <h3>📥 Bulk Import Questions</h3>

                <p>
                  ብዙ የፈተና ጥያቄዎችን በአንድ ጊዜ Copy & Paste አድርግ።
                  ከዚያ Preview አድርገህ ከመረመርክ በኋላ Import All ተጫን።
                </p>

                <textarea
                  value={bulkText}
                  onChange={e => {
                    setBulkText(e.target.value);
                    setBulkQuestions([]);
                    setBulkError("");
                  }}
                  placeholder={`Question: አመራር ምን ማለት ነው?
A: ሌሎችን በግድ ማዘዝ
B: ሰዎችን ወደ ጋራ ግብ መምራት
C: የግል ጥቅምን ማስቀደም
D: ውሳኔን ብቻውን መወሰን
Correct: B

Question: ጥሩ መሪ ምን ማሳየት አለበት?
A: ታማኝነት
B: አለመስማት
C: አለመተባበር
D: አለመጠያቀቅ
Correct: A`}
                  rows={14}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    border: "1px solid #94a3b8",
                    borderRadius: "8px",
                    fontSize: "15px",
                    marginBottom: "12px",
                    background: "#ffffff",
                    color: "#111827"
                  }}
                />

                <div style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap"
                }}>
                  <button
                    type="button"
                    onClick={previewBulkQuestions}
                    disabled={saving || !bulkText.trim()}
                  >
                    👁 Preview Questions
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBulkText("");
                      setBulkQuestions([]);
                      setBulkError("");
                    }}
                    disabled={saving}
                  >
                    Clear
                  </button>
                </div>

                {bulkError && (
                  <p role="alert" style={{
                    color: "#b91c1c",
                    background: "#fee2e2",
                    padding: "10px",
                    borderRadius: "6px",
                    overflowWrap: "anywhere"
                  }}>
                    {bulkError}
                  </p>
                )}

                {bulkQuestions.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <h4>
                      <span style={{ color: "#15803d" }}>
                        ✓ Preview ready
                      </span>
                    </h4>

                    <p>
                      በአጠቃላይ {bulkQuestions.length} ጥያቄዎች ተዘጋጅተዋል።
                    </p>

                    {bulkQuestions.map((item, index) => (
                      <article
                        key={index}
                        style={{
                          background: "#ffffff",
                          color: "#111827",
                          border: "1px solid #cbd5e1",
                          padding: "12px",
                          marginBottom: "10px",
                          borderRadius: "8px"
                        }}
                      >
                        <strong>
                          {index + 1}. {item.question}
                        </strong>

                        {Object.entries(item.options).map(([key, value]) => (
                          <p key={key}>{key}. {value}</p>
                        ))}

                        <p>
                          <strong>
                            Correct Answer: {item.correctAnswer}
                          </strong>
                        </p>
                      </article>
                    ))}

                    <button
                      type="button"
                      onClick={importBulkQuestions}
                      disabled={saving}
                      style={{
                        background: "#15803d",
                        color: "#ffffff",
                        padding: "12px 20px",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold"
                      }}
                    >
                      {saving
                        ? "በመመዝገብ ላይ..."
                        : `✓ Import All ${bulkQuestions.length} Questions`}
                    </button>
                  </div>
                )}
              </div>

              {/* SINGLE QUESTION FORM */}
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
            </>
          )}

          {!admin && (
            <p style={{
              padding: "12px",
              background: "#fff0d9",
              borderRadius: "8px"
            }}>
              {t.secureExam}
            </p>
          )}
        </>
      )}

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
