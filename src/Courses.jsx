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
import { getExamQuestions, submitExam } from "./examApi";

const OPTION_KEYS = ["A", "B", "C", "D"];

const words = {
  am: {
    courses: "ትምህርቶች", addCourse: "አዲስ ትምህርት ጨምር",
    title: "የአማርኛ ትምህርት ርዕስ", description: "የአማርኛ ትምህርት መግለጫ",
    titleEn: "የእንግሊዝኛ ርዕስ", descriptionEn: "የእንግሊዝኛ መግለጫ",
    titleOm: "የአፋን ኦሮሞ ርዕስ", descriptionOm: "የአፋን ኦሮሞ መግለጫ",
    save: "አስቀምጥ", update: "አስተካክል", edit: "አርም", delete: "አስወግድ",
    archive: "ወደ ማህደር አስገባ", cancel: "ተወው", open: "ክፈት", back: "ተመለስ",
    loading: "በመጫን ላይ...", empty: "ምንም ትምህርት አልተገኘም።",
    lessons: "የትምህርት ክፍሎች", lessonTitle: "የክፍሉ ርዕስ",
    content: "የትምህርት ይዘት", addLesson: "ክፍል ጨምር",
    noLessons: "ምንም የትምህርት ክፍል የለም።",
    selectLesson: "ከትምህርት ክፍል ጋር አያይዝ",
    allLessons: "ጠቅላላ ኮርስ (ያልተለየ)",
    linkedLesson: "የተያያዘ የትምህርት ክፍል",
    questions: "የፈተና ጥያቄዎች", addQuestion: "ጥያቄ ጨምር",
    question: "የፈተና ጥያቄ", questionEn: "የእንግሊዝኛ ጥያቄ",
    questionOm: "የአፋን ኦሮሞ ጥያቄ",
    optionA: "ምርጫ A", optionB: "ምርጫ B", optionC: "ምርጫ C", optionD: "ምርጫ D",
    optionsEn: "የእንግሊዝኛ ምርጫዎች", optionsOm: "የአፋን ኦሮሞ ምርጫዎች",
    correct: "ትክክለኛ መልስ", passing: "የማለፊያ ነጥብ (%)",
    myResults: "የእኔ ውጤቶች", noResults: "የፈተና ውጤት አልተገኘም።",
    result: "የፈተና ውጤት", score: "ያገኘኸው ነጥብ",
    passed: "አልፈሃል", failed: "አላለፍክም", certificate: "ሰርተፊኬት",
    student: "ተማሪ", date: "ቀን", correctCount: "ትክክለኛ መልሶች",
    totalQuestions: "ጠቅላላ ጥያቄዎች",
    confirmDelete: "ይህን ነገር ማስወገድ ትፈልጋለህ?",
    confirmArchive: "ይህን ኮርስ ወደ ማህደር ማስገባት ትፈልጋለህ?",
    added: "ተጨምሯል።", updated: "ተስተካክሏል።",
    deleted: "ተወግዷል።", archived: "ወደ ማህደር ገብቷል።",
    error: "ስህተት ተፈጥሯል።", required: "እባክህ አስፈላጊውን መረጃ ሙላ።",
    adminOnly: "የአስተዳዳሪ ፈቃድ ያስፈልጋል።", noName: "ተማሪ",
    retry: "እንደገና ሞክር",
    secureExam: "ፈተናው በደህንነት ምክንያት ለጊዜው ተዘግቷል።",
    adminQuestions: "የአስተዳዳሪ የጥያቄ አስተዳደር",
    noQuestions: "ጥያቄዎች አልተጨመሩም።", archivedList: "የተመዘገቡ ኮርሶች",
    downloadBackup: "📥 የጥያቄዎች JSON Backup አውርድ",
    duplicateWarn: "⚠️ ማስጠንቀቂያ፡ ተመሳሳይ ጥያቄ ቀድሞ ተመዝግቧል። አሁንም መጨመር ትፈልጋለህ?"
  },
  en: {
    courses: "Courses", addCourse: "Add New Course",
    title: "Amharic Course Title", description: "Amharic Course Description",
    titleEn: "English Course Title", descriptionEn: "English Course Description",
    titleOm: "Afaan Oromo Course Title", descriptionOm: "Afaan Oromo Course Description",
    save: "Save", update: "Update", edit: "Edit", delete: "Remove",
    archive: "Archive Course", cancel: "Cancel", open: "Open", back: "Back",
    loading: "Loading...", empty: "No courses found.", lessons: "Lessons",
    lessonTitle: "Lesson Title", content: "Lesson Content", addLesson: "Add Lesson",
    noLessons: "No lessons available.",
    selectLesson: "Link to Lesson",
    allLessons: "General Course (Unlinked)",
    linkedLesson: "Linked Lesson",
    questions: "Exam Questions",
    addQuestion: "Add Question", question: "Amharic Question",
    questionEn: "English Question", questionOm: "Afaan Oromo Question",
    optionA: "Option A (Amharic)", optionB: "Option B (Amharic)",
    optionC: "Option C (Amharic)", optionD: "Option D (Amharic)",
    optionsEn: "English Options", optionsOm: "Afaan Oromo Options",
    correct: "Correct Answer", passing: "Passing Score (%)",
    myResults: "My Results", noResults: "No exam results found.",
    result: "Exam Result", score: "Your Score", passed: "Passed",
    failed: "Failed", certificate: "Certificate", student: "Student",
    date: "Date", correctCount: "Correct Answers", totalQuestions: "Total Questions",
    confirmDelete: "Are you sure you want to remove this item?",
    confirmArchive: "Are you sure you want to archive this course?",
    added: "Added successfully.", updated: "Updated successfully.",
    deleted: "Removed successfully.", archived: "Course archived successfully.",
    error: "An error occurred.", required: "Please complete all required fields.",
    adminOnly: "Administrator permission is required.", noName: "Student",
    retry: "Retry",
    secureExam: "Exams are temporarily unavailable while secure exam services are being configured.",
    adminQuestions: "Administrator Question Management",
    noQuestions: "No questions have been added.", archivedList: "Archived courses",
    downloadBackup: "📥 Download JSON Backup",
    duplicateWarn: "⚠️ Warning: A similar question already exists. Do you still want to add it?"
  },
  om: {
    courses: "Barnoota", addCourse: "Barnoota haaraa dabali",
    title: "Mata duree barnootaa Afaan Amaaraa", description: "Ibsa barnootaa Afaan Amaaraa",
    titleEn: "Mata duree Afaan Ingilizii", descriptionEn: "Ibsa Afaan Ingilizii",
    titleOm: "Mata duree Afaan Oromoo", descriptionOm: "Ibsa Afaan Oromoo",
    save: "Olkaa'i", update: "Fooyyessi", edit: "Fooyyessi", delete: "Haqi",
    archive: "Kuusaa keessa kaa'i", cancel: "Dhiisi", open: "Bani", back: "Deebi'i",
    loading: "Fe'amaa jira...", empty: "Barnoonni hin argamne.",
    lessons: "Kutaalee barnootaa", lessonTitle: "Mata duree kutaa",
    content: "Qabiyyee barnootaa", addLesson: "Kutaa dabali",
    noLessons: "Kutaan barnootaa hin jiru.",
    selectLesson: "Kutaa barnootaatiin walqabsiisi",
    allLessons: "Barnoota waliigalaa",
    linkedLesson: "Kutaa walqabate",
    questions: "Gaaffilee qormaataa",
    addQuestion: "Gaaffii dabali", question: "Gaaffii Afaan Amaaraa",
    questionEn: "Gaaffii Afaan Ingilizii", questionOm: "Gaaffii Afaan Oromoo",
    optionA: "Filannoo A (Amaaraa)", optionB: "Filannoo B (Amaaraa)",
    optionC: "Filannoo C (Amaaraa)", optionD: "Filannoo D (Amaaraa)",
    optionsEn: "Filannoowwan Afaan Ingilizii", optionsOm: "Filannoowwan Afaan Oromoo",
    correct: "Deebii sirrii", passing: "Qabxii darbuuf (%)",
    myResults: "Bu'aawwan koo", noResults: "Bu'aan qormaataa hin argamne.",
    result: "Bu'aa qormaataa", score: "Qabxii kee", passed: "Darbiteetta",
    failed: "Hin darbine", certificate: "Ragaa", student: "Barataa",
    date: "Guyyaa", correctCount: "Deebii sirrii", totalQuestions: "Gaaffilee waliigalaa",
    confirmDelete: "Wanta kana haquu barbaaddaa?",
    confirmArchive: "Barnoota kana kuusaa keessa kaa'uu barbaaddaa?",
    added: "Milkaa'inaan dabalameera.", updated: "Milkaa'inaan fooyya'eera.",
    deleted: "Milkaa'inaan haqameera.", archived: "Kuusaa keessa galfameera.",
    error: "Dogoggorri uumameera.", required: "Maaloo odeeffannoo barbaachisaa guuti.",
    adminOnly: "Eeyyamni bulchiinsaa barbaachisa.", noName: "Barataa",
    retry: "Irra deebi'i", secureExam: "Qormaanni yeroo ammaa nageenyaaf cufameera.",
    adminQuestions: "Bulchiinsa gaaffilee", noQuestions: "Gaaffileen hin dabalamin.",
    archivedList: "Barnoota kuusaa keessa jiru",
    downloadBackup: "📥 JSON Backup Buufadhu",
    duplicateWarn: "⚠️ Akeekkachiisa: Gaaffiin walfakkaatu duraan galmaa'eera. Ammas dabaluu barbaaddaa?"
  }
};

function getCourseTitle(course, language) {
  if (!course) return "";
  if (language === "en") return course.titleEn || course.title || "";
  if (language === "om") return course.titleOm || course.title || "";
  return course.title || "";
}

function getCourseDescription(course, language) {
  if (!course) return "";
  if (language === "en") return course.descriptionEn || course.description || "";
  if (language === "om") return course.descriptionOm || course.description || "";
  return course.description || "";
}

function getQuestionText(item, language) {
  if (language === "en") return item.questionEn || item.question || "";
  if (language === "om") return item.questionOm || item.question || "";
  return item.question || "";
}

function normalizeOptions(optionsMap) {
  const source = optionsMap || {};
  return {
    A: source.A || "",
    B: source.B || "",
    C: source.C || "",
    D: source.D || ""
  };
}

function getQuestionOptions(item, language) {
  const source = language === "en"
    ? (item.optionsEn || item.options || {})
    : language === "om"
      ? (item.optionsOm || item.options || {})
      : (item.options || {});
  return normalizeOptions(source);
}

function normalizeTextForCheck(str) {
  return (str || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function getResultTime(value) {
  if (!value) return 0;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  return 0;
}

function parseBulkQuestions(text) {
  const blocks = text.trim().split(/\r?\n\s*\r?\n/).filter(Boolean);
  if (!blocks.length) throw new Error("ምንም ጥያቄ አልተገኘም።");

  return blocks.map((block, index) => {
    const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

    function getValue(label) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const line = lines.find(item =>
        new RegExp("^" + escaped + "\\s*:", "i").test(item)
      );
      return line ? line.replace(/^[^:]+:/, "").trim() : "";
    }

    const question = getValue("Question");
    const questionEn = getValue("QuestionEn");
    const questionOm = getValue("QuestionOm");
    const options = { A: getValue("A"), B: getValue("B"), C: getValue("C"), D: getValue("D") };
    const optionsEn = { A: getValue("AEn"), B: getValue("BEn"), C: getValue("CEn"), D: getValue("DEn") };
    const optionsOm = { A: getValue("AOm"), B: getValue("BOm"), C: getValue("COm"), D: getValue("DOm") };
    const correctAnswer = getValue("Correct").toUpperCase();

    const allOptions = [
      ...Object.values(options),
      ...Object.values(optionsEn),
      ...Object.values(optionsOm)
    ];

     if (!question || !questionEn || !questionOm ||
      allOptions.some(value => !value) ||
      !OPTION_KEYS.includes(correctAnswer)) {
      throw new Error(
        `ጥያቄ ${index + 1}: በሶስቱም ቋንቋዎች ጥያቄዎችንና ምርጫዎችን ሙላ።`
      );
    }

    return { question, questionEn, questionOm, options, optionsEn, optionsOm, correctAnswer };
  });
}

export default function Courses({ user, profile, language = "am" }) {
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
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [bulkLessonId, setBulkLessonId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionTextEn, setQuestionTextEn] = useState("");
  const [questionTextOm, setQuestionTextOm] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [optionAEn, setOptionAEn] = useState("");
  const [optionBEn, setOptionBEn] = useState("");
  const [optionCEn, setOptionCEn] = useState("");
  const [optionDEn, setOptionDEn] = useState("");
  const [optionAOm, setOptionAOm] = useState("");
  const [optionBOm, setOptionBOm] = useState("");
  const [optionCOm, setOptionCOm] = useState("");
  const [optionDOm, setOptionDOm] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [bulkText, setBulkText] = useState("");
  const [bulkQuestions, setBulkQuestions] = useState([]);
  const [bulkError, setBulkError] = useState("");
  const [examQuestions, setExamQuestions] = useState([]);
  const [examAnswers, setExamAnswers] = useState({});
  const [examResult, setExamResult] = useState(null);
  const [examError, setExamError] = useState("");
  const [examSaving, setExamSaving] = useState(false);

  function clearCourseForm() {
    setCourseTitle(""); setCourseDescription("");
    setCourseTitleEn(""); setCourseDescriptionEn("");
    setCourseTitleOm(""); setCourseDescriptionOm("");
    setPassingScore("70"); setEditingCourse(null);
  }

  function clearQuestionForm() {
    setQuestionText(""); setQuestionTextEn(""); setQuestionTextOm("");
    setOptionA(""); setOptionB(""); setOptionC(""); setOptionD("");
    setOptionAEn(""); setOptionBEn(""); setOptionCEn(""); setOptionDEn("");
    setOptionAOm(""); setOptionBOm(""); setOptionCOm(""); setOptionDOm("");
    setCorrectAnswer("A");
    setSelectedLessonId("");
  }

  function isDuplicateQuestion(qAm, qEn, qOm) {
    const nAm = normalizeTextForCheck(qAm);
    const nEn = normalizeTextForCheck(qEn);
    const nOm = normalizeTextForCheck(qOm);
    return questions.some(existing => {
      const eAm = normalizeTextForCheck(existing.question);
      const eEn = normalizeTextForCheck(existing.questionEn);
      const eOm = normalizeTextForCheck(existing.questionOm);
      return (nAm && eAm === nAm) || (nEn && eEn === nEn) || (nOm && eOm === nOm);
    });
  }

  function downloadQuestionsBackup() {
    if (!selected || !questions.length) return;
    const backupPayload = {
      exportedAt: new Date().toISOString(),
      courseId: selected.id,
      courseTitle: selected.title,
      totalQuestions: questions.length,
      questions: questions.map(q => ({
        id: q.id,
        lessonId: q.lessonId || null,
        lessonTitle: q.lessonTitle || null,
        question: q.question || "",
        questionEn: q.questionEn || "",
        questionOm: q.questionOm || "",
        options: normalizeOptions(q.options),
        optionsEn: normalizeOptions(q.optionsEn),
        optionsOm: normalizeOptions(q.optionsOm),
        correctAnswer: q.correctAnswer || "A"
      }))
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = (selected.titleEn || selected.title || "course").replace(/[^a-zA-Z0-9_-]/g, "_");
    link.href = url;
    link.download = `${safeTitle}_questions_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function linkExistingQuestionToLesson(questionId, newLessonId) {
    if (!admin || !selected) return;
    const lessonObj = lessons.find(l => l.id === newLessonId);
    const updateData = {
      lessonId: lessonObj ? lessonObj.id : null,
      lessonTitle: lessonObj ? lessonObj.title : null,
      updatedAt: serverTimestamp()
    };
    setSaving(true);
    try {
      await updateDoc(doc(db, "courses", selected.id, "questions", questionId), updateData);
      setQuestions(previous => previous.map(q =>
        q.id === questionId
          ? { ...q, lessonId: updateData.lessonId, lessonTitle: updateData.lessonTitle }
          : q
      ));
      setMessage(t.updated);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  async function loadCourses() {
    setLoading(true); setMessage("");
    try {
      const snapshot = await getDocs(collection(db, "courses"));
      setCourses(snapshot.docs.map(item => ({ id: item.id, ...item.data() })));
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCourses(); }, []);

  async function saveCourse(event) {
    event.preventDefault();
    if (!admin || !user) { setMessage(t.adminOnly); return; }
    if (!courseTitle.trim() || !courseTitleEn.trim() || !courseTitleOm.trim()) {
      setMessage(t.required); return;
    }
    const score = Number(passingScore);
    if (!Number.isFinite(score) || score < 1 || score > 100) {
      setMessage(t.required); return;
    }
    setSaving(true); setMessage("");
    const data = {
      title: courseTitle.trim(), description: courseDescription.trim(),
      titleEn: courseTitleEn.trim(), descriptionEn: courseDescriptionEn.trim(),
      titleOm: courseTitleOm.trim(), descriptionOm: courseDescriptionOm.trim(),
      passingScore: score, isArchived: false, updatedAt: serverTimestamp()
    };
    try {
      if (editingCourse) {
        await updateDoc(doc(db, "courses", editingCourse.id), data);
        setCourses(previous => previous.map(course =>
          course.id === editingCourse.id ? { ...course, ...data } : course
        ));
        setMessage(t.updated);
      } else {
        const newData = { ...data, createdBy: user.uid, createdAt: serverTimestamp() };
        const result = await addDoc(collection(db, "courses"), newData);
        setCourses(previous => [...previous, { id: result.id, ...newData }]);
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
    setCourseTitle(course.title || ""); setCourseDescription(course.description || "");
    setCourseTitleEn(course.titleEn || ""); setCourseDescriptionEn(course.descriptionEn || "");
    setCourseTitleOm(course.titleOm || ""); setCourseDescriptionOm(course.descriptionOm || "");
    setPassingScore(String(course.passingScore ?? 70));
    setMessage(""); setView("courses");
  }

  async function openCourse(course) {
    setLoading(true); setMessage("");
    try {
      const lessonSnapshot = await getDocs(collection(db, "courses", course.id, "lessons"));
      setLessons(lessonSnapshot.docs.map(item => ({ id: item.id, ...item.data() })));
      setExamQuestions([]); setExamAnswers({}); setExamResult(null); setExamError("");
      if (admin) {
        const questionSnapshot = await getDocs(collection(db, "courses", course.id, "questions"));
        setQuestions(questionSnapshot.docs.map(item => ({ id: item.id, ...item.data() })));
      } else {
        setQuestions([]);
        try {
          const examData = await getExamQuestions(course.id);
          setExamQuestions(Array.isArray(examData.questions) ? examData.questions : []);
        } catch (examError) {
          setExamError(examError.message || t.secureExam);
        }
      }
      setSelected(course); setView("course");
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExamSubmit(event) {
    event.preventDefault();
    if (!selected || admin || examSaving) return;
    if (examQuestions.some(question => !examAnswers[question.id])) {
      setExamError(language === "en" ? "Please answer every question." : language === "om" ? "Maaloo gaaffii hunda deebisi." : "እባክህ ሁሉንም ጥያቄዎች መልስ።");
      return;
    }
    setExamSaving(true); setExamError("");
    try {
አሁን የተፈጠረው ስህተት የእኔ የአማርኛ ማብራሪያ ጽሑፍ ("በስልክዎ ላይ በእጅዎ ኮፒ ሲያደርጉ...") በስህተት ኮድዎ ውስጥ መስመር 221 ላይ ስለተለጠፈ ነው!
የመጀመሪያውን የላኩልዎትን ፋይል መሰረት በማድረግ፣ አሁን ከመስመር 219 ጀምሮ ያለውን የቀረውን ክፍል ብቻ በአጭሩ እልክልዎታለሁ።

እባክዎ ይህን በጥንቃቄ ያድርጉ (መስመር 219-222ን ለማስተካከል)፦

1. በ src/Courses.jsx ፋይል ውስጥ ወደ መስመር 219 ይሂዱ።
2. ከመስመር 219 ጀምሮ እስከ ፋይሉ መጨረሻ ድረስ ያለውን ሁሉንም ጽሑፍ ያጥፉት (ከመስመር 1 እስከ 218 ያለውን አይንኩት)።
3. ከዚህ በታች ያለውን ንጹህ ኮድ ብቻ (ከሳጥኑ ውስጥ ያለውን ብቻ፣ ከሳጥኑ ውጭ ያለውን የአማርኛ ጽሑፍ ሳይጨምሩ) ኮፒ አድርገው እዚያው መስመር 219 ላይ Paste ያድርጉ፦
jsx
    if (!question || !questionEn || !questionOm ||
      allOptions.some(value => !value) ||
      !OPTION_KEYS.includes(correctAnswer)) {
      throw new Error(
        `ጥያቄ ${index + 1}: በሶስቱም ቋንቋዎች ጥያቄዎችንና ምርጫዎችን ሙላ።`
      );
    }

    return { question, questionEn, questionOm, options, optionsEn, optionsOm, correctAnswer };
  });
}

export default function Courses({ user, profile, language = "am" }) {
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
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [bulkLessonId, setBulkLessonId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionTextEn, setQuestionTextEn] = useState("");
  const [questionTextOm, setQuestionTextOm] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [optionAEn, setOptionAEn] = useState("");
  const [optionBEn, setOptionBEn] = useState("");
  const [optionCEn, setOptionCEn] = useState("");
  const [optionDEn, setOptionDEn] = useState("");
  const [optionAOm, setOptionAOm] = useState("");
  const [optionBOm, setOptionBOm] = useState("");
  const [optionCOm, setOptionCOm] = useState("");
  const [optionDOm, setOptionDOm] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [bulkText, setBulkText] = useState("");
  const [bulkQuestions, setBulkQuestions] = useState([]);
  const [bulkError, setBulkError] = useState("");
  const [examQuestions, setExamQuestions] = useState([]);
  const [examAnswers, setExamAnswers] = useState({});
  const [examResult, setExamResult] = useState(null);
  const [examError, setExamError] = useState("");
  const [examSaving, setExamSaving] = useState(false);

  function clearCourseForm() {
    setCourseTitle(""); setCourseDescription("");
    setCourseTitleEn(""); setCourseDescriptionEn("");
    setCourseTitleOm(""); setCourseDescriptionOm("");
    setPassingScore("70"); setEditingCourse(null);
  }

  function clearQuestionForm() {
    setQuestionText(""); setQuestionTextEn(""); setQuestionTextOm("");
    setOptionA(""); setOptionB(""); setOptionC(""); setOptionD("");
    setOptionAEn(""); setOptionBEn(""); setOptionCEn(""); setOptionDEn("");
    setOptionAOm(""); setOptionBOm(""); setOptionCOm(""); setOptionDOm("");
    setCorrectAnswer("A");
    setSelectedLessonId("");
  }

  function isDuplicateQuestion(qAm, qEn, qOm) {
    const nAm = normalizeTextForCheck(qAm);
    const nEn = normalizeTextForCheck(qEn);
    const nOm = normalizeTextForCheck(qOm);
    return questions.some(existing => {
      const eAm = normalizeTextForCheck(existing.question);
      const eEn = normalizeTextForCheck(existing.questionEn);
      const eOm = normalizeTextForCheck(existing.questionOm);
      return (nAm && eAm === nAm) || (nEn && eEn === nEn) || (nOm && eOm === nOm);
    });
  }

  function downloadQuestionsBackup() {
    if (!selected || !questions.length) return;
    const backupPayload = {
      exportedAt: new Date().toISOString(),
      courseId: selected.id,
      courseTitle: selected.title,
      totalQuestions: questions.length,
      questions: questions.map(q => ({
        id: q.id,
        lessonId: q.lessonId || null,
        lessonTitle: q.lessonTitle || null,
        question: q.question || "",
        questionEn: q.questionEn || "",
        questionOm: q.questionOm || "",
        options: normalizeOptions(q.options),
        optionsEn: normalizeOptions(q.optionsEn),
        optionsOm: normalizeOptions(q.optionsOm),
        correctAnswer: q.correctAnswer || "A"
      }))
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = (selected.titleEn || selected.title || "course").replace(/[^a-zA-Z0-9_-]/g, "_");
    link.href = url;
    link.download = `${safeTitle}_questions_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function linkExistingQuestionToLesson(questionId, newLessonId) {
    if (!admin || !selected) return;
    const lessonObj = lessons.find(l => l.id === newLessonId);
    const updateData = {
      lessonId: lessonObj ? lessonObj.id : null,
      lessonTitle: lessonObj ? lessonObj.title : null,
      updatedAt: serverTimestamp()
    };
    setSaving(true);
    try {
      await updateDoc(doc(db, "courses", selected.id, "questions", questionId), updateData);
      setQuestions(previous => previous.map(q =>
        q.id === questionId
          ? { ...q, lessonId: updateData.lessonId, lessonTitle: updateData.lessonTitle }
          : q
      ));
      setMessage(t.updated);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setSaving(false);
    }
  }

  async function loadCourses() {
    setLoading(true); setMessage("");
    try {
      const snapshot = await getDocs(collection(db, "courses"));
      setCourses(snapshot.docs.map(item => ({ id: item.id, ...item.data() })));
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCourses(); }, []);

  async function saveCourse(event) {
    event.preventDefault();
    if (!admin || !user) { setMessage(t.adminOnly); return; }
    if (!courseTitle.trim() || !courseTitleEn.trim() || !courseTitleOm.trim()) {
      setMessage(t.required); return;
    }
    const score = Number(passingScore);
    if (!Number.isFinite(score) || score < 1 || score > 100) {
      setMessage(t.required); return;
    }
    setSaving(true); setMessage("");
    const data = {
      title: courseTitle.trim(), description: courseDescription.trim(),
      titleEn: courseTitleEn.trim(), descriptionEn: courseDescriptionEn.trim(),
      titleOm: courseTitleOm.trim(), descriptionOm: courseDescriptionOm.trim(),
      passingScore: score, isArchived: false, updatedAt: serverTimestamp()
    };
    try {
      if (editingCourse) {
        await updateDoc(doc(db, "courses", editingCourse.id), data);
        setCourses(previous => previous.map(course =>
          course.id === editingCourse.id ? { ...course, ...data } : course
        ));
        setMessage(t.updated);
      } else {
        const newData = { ...data, createdBy: user.uid, createdAt: serverTimestamp() };
        const result = await addDoc(collection(db, "courses"), newData);
        setCourses(previous => [...previous, { id: result.id, ...newData }]);
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
    setCourseTitle(course.title || ""); setCourseDescription(course.description || "");
    setCourseTitleEn(course.titleEn || ""); setCourseDescriptionEn(course.descriptionEn || "");
    setCourseTitleOm(course.titleOm || ""); setCourseDescriptionOm(course.descriptionOm || "");
    setPassingScore(String(course.passingScore ?? 70));
    setMessage(""); setView("courses");
  }

  async function openCourse(course) {
    setLoading(true); setMessage("");
    try {
      const lessonSnapshot = await getDocs(collection(db, "courses", course.id, "lessons"));
      setLessons(lessonSnapshot.docs.map(item => ({ id: item.id, ...item.data() })));
      setExamQuestions([]); setExamAnswers({}); setExamResult(null); setExamError("");
      if (admin) {
        const questionSnapshot = await getDocs(collection(db, "courses", course.id, "questions"));
        setQuestions(questionSnapshot.docs.map(item => ({ id: item.id, ...item.data() })));
      } else {
        setQuestions([]);
        try {
          const examData = await getExamQuestions(course.id);
          setExamQuestions(Array.isArray(examData.questions) ? examData.questions : []);
        } catch (examError) {
          setExamError(examError.message || t.secureExam);
        }
      }
      setSelected(course); setView("course");
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExamSubmit(event) {
    event.preventDefault();
    if (!selected || admin || examSaving) return;
    if (examQuestions.some(question => !examAnswers[question.id])) {
      setExamError(language === "en" ? "Please answer every question." : language === "om" ? "Maaloo gaaffii hunda deebisi." : "እባክህ ሁሉንም ጥያቄዎች መልስ።");
      return;
    }
    setExamSaving(true); setExamError("");
    try {
Use code with caution.
const result = await submitExam(selected.id, examAnswers, language);
setExamResult(result);
setMessage("");
} catch (error) {
setExamError(error.message || t.error);
} finally {
setExamSaving(false);
}
}
async function addLesson(event) {
event.preventDefault();
if (!admin || !user || !selected) { setMessage(t.adminOnly); return; }
if (!lessonTitle.trim() || !lessonContent.trim()) { setMessage(t.required); return; }
setSaving(true); setMessage("");
try {
const data = {
title: lessonTitle.trim(), content: lessonContent.trim(),
createdBy: user.uid, createdAt: serverTimestamp()
};
const result = await addDoc(collection(db, "courses", selected.id, "lessons"), data);
setLessons(previous => [...previous, { id: result.id, ...data }]);
setLessonTitle(""); setLessonContent(""); setMessage(t.added);
} catch (error) {
setMessage(error.message || t.error);
} finally {
setSaving(false);
}
}
async function removeLesson(lessonId) {
if (!admin || !selected || !window.confirm(t.confirmDelete)) return;
setSaving(true);
try {
await deleteDoc(doc(db, "courses", selected.id, "lessons", lessonId));
setLessons(previous => previous.filter(item => item.id !== lessonId));
setMessage(t.deleted);
} catch (error) {
setMessage(error.message || t.error);
} finally {
setSaving(false);
}
}
async function addQuestion(event) {
event.preventDefault();
if (!admin || !user || !selected) { setMessage(t.adminOnly); return; }
const options = { A: optionA.trim(), B: optionB.trim(), C: optionC.trim(), D: optionD.trim() };
const optionsEn = { A: optionAEn.trim(), B: optionBEn.trim(), C: optionCEn.trim(), D: optionDEn.trim() };
const optionsOm = { A: optionAOm.trim(), B: optionBOm.trim(), C: optionCOm.trim(), D: optionDOm.trim() };
if (!questionText.trim() || !questionTextEn.trim() || !questionTextOm.trim() ||
[...Object.values(options), ...Object.values(optionsEn), ...Object.values(optionsOm)].some(v => !v)) {
setMessage(t.required); return;
}
if (isDuplicateQuestion(questionText, questionTextEn, questionTextOm)) {
if (!window.confirm(t.duplicateWarn)) return;
}
const linkedLesson = lessons.find(l => l.id === selectedLessonId);
setSaving(true); setMessage("");
try {
const data = {
question: questionText.trim(), questionEn: questionTextEn.trim(), questionOm: questionTextOm.trim(),
options, optionsEn, optionsOm, correctAnswer,
lessonId: linkedLesson ? linkedLesson.id : null,
lessonTitle: linkedLesson ? linkedLesson.title : null,
createdBy: user.uid, createdAt: serverTimestamp()
};
const result = await addDoc(collection(db, "courses", selected.id, "questions"), data);
setQuestions(previous => [...previous, { id: result.id, ...data }]);
clearQuestionForm(); setMessage(t.added);
} catch (error) {
setMessage(error.message || t.error);
} finally {
setSaving(false);
}
}
function previewBulkQuestions() {
setBulkError(""); setBulkQuestions([]);
try {
const parsed = parseBulkQuestions(bulkText).map(item => ({
...item,
isDuplicate: isDuplicateQuestion(item.question, item.questionEn, item.questionOm)
}));
setBulkQuestions(parsed);
} catch (error) {
setBulkError(error.message || t.error);
}
}
async function importBulkQuestions() {
if (!admin || !user || !selected) { setBulkError(t.adminOnly); return; }
if (!bulkQuestions.length) { setBulkError("ከመጀመሪያ Preview አድርግ።"); return; }
if (bulkQuestions.length > 450) {
setBulkError("በአንድ ጊዜ ከ450 በላይ ጥያቄዎችን ማስገባት አይቻልም።"); return;
}
const duplicateCount = bulkQuestions.filter(q => q.isDuplicate).length;
const confirmMsg = duplicateCount > 0
? ⚠️ ከነዚህ ውስጥ ${duplicateCount} ተመሳሳይ ጥያቄዎች ተገኝተዋል። አሁንም ${bulkQuestions.length} ጥያቄዎችን ማስገባት ትፈልጋለህ?
: ${bulkQuestions.length} ጥያቄዎችን ወደዚህ ኮርስ ማስገባት ትፈልጋለህ?;
if (!window.confirm(confirmMsg)) return;
const linkedLesson = lessons.find(l => l.id === bulkLessonId);
setSaving(true); setBulkError(""); setMessage("");
try {
const batch = writeBatch(db);
bulkQuestions.forEach(item => {
const questionRef = doc(collection(db, "courses", selected.id, "questions"));
batch.set(questionRef, {
question: item.question, questionEn: item.questionEn, questionOm: item.questionOm,
options: item.options, optionsEn: item.optionsEn, optionsOm: item.optionsOm,
correctAnswer: item.correctAnswer,
lessonId: linkedLesson ? linkedLesson.id : null,
lessonTitle: linkedLesson ? linkedLesson.title : null,
createdBy: user.uid, createdAt: serverTimestamp()
});
});
await batch.commit();
const snapshot = await getDocs(collection(db, "courses", selected.id, "questions"));
setQuestions(snapshot.docs.map(item => ({ id: item.id, ...item.data() })));
const count = bulkQuestions.length;
setBulkText(""); setBulkQuestions([]); setBulkLessonId("");
setMessage(${count} ጥያቄዎች በተሳካ ሁኔታ ተጨምረዋል።);
} catch (error) {
setBulkError(error.message || t.error);
} finally {
setSaving(false);
}
}
async function removeQuestion(questionId) {
if (!admin || !selected || !window.confirm(t.confirmDelete)) return;
setSaving(true);
try {
await deleteDoc(doc(db, "courses", selected.id, "questions", questionId));
setQuestions(previous => previous.filter(item => item.id !== questionId));
setMessage(t.deleted);
} catch (error) {
setMessage(error.message || t.error);
} finally {
setSaving(false);
}
}
async function archiveCourse(courseId) {
if (!admin || !window.confirm(t.confirmArchive)) return;
setSaving(true); setMessage("");
try {
await updateDoc(doc(db, "courses", courseId), { isArchived: true, updatedAt: serverTimestamp() });
setCourses(previous => previous.map(course =>
course.id === courseId ? { ...course, isArchived: true } : course
));
if (selected?.id === courseId) { setSelected(null); setView("courses"); }
setMessage(t.archived);
} catch (error) {
setMessage(error.message || t.error);
} finally {
setSaving(false);
}
}
async function restoreCourse(courseId) {
if (!admin) return;
setSaving(true); setMessage("");
try {
await updateDoc(doc(db, "courses", courseId), { isArchived: false, updatedAt: serverTimestamp() });
setCourses(previous => previous.map(course =>
course.id === courseId ? { ...course, isArchived: false } : course
));
setMessage(t.updated);
} catch (error) {
setMessage(error.message || t.error);
} finally {
setSaving(false);
}
}
async function loadMyResults() {
if (!user) return;
setLoading(true); setMessage("");
try {
const resultQuery = query(collection(db, "results"), where("userId", "==", user.uid));
const snapshot = await getDocs(resultQuery);
const list = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
list.sort((a, b) => getResultTime(b.createdAt) - getResultTime(a.createdAt));
setResults(list); setView("results");
} catch (error) {
setMessage(error.message || t.error);
} finally {
setLoading(false);
}
}
function goBack() {
setMessage(""); setView("courses"); setSelected(null);
setBulkText(""); setBulkQuestions([]); setBulkError(""); setBulkLessonId("");
setExamQuestions([]); setExamAnswers({}); setExamResult(null); setExamError("");
clearCourseForm(); clearQuestionForm();
}
const visibleCourses = courses.filter(course =>
showArchived ? course.isArchived === true : course.isArchived !== true
);
const fieldStyle = {
width: "100%", boxSizing: "border-box", padding: "11px",
margin: "5px 0 12px", border: "1px solid #cbd5e1",
borderRadius: "7px", fontSize: "15px"
};
const sectionStyle = {
border: "1px solid #dbe2ea", padding: "15px",
margin: "18px 0", borderRadius: "10px"
};
if (loading) {
return {t.loading};
}
return (

<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
{t.courses}
{user && {t.myResults}}
{t.retry}
{message && (
<p role="alert" style={{
padding: "10px", background: "#fff0d9", color: "#713d00",
borderRadius: "6px", overflowWrap: "anywhere"
}}>
{message}

)}
{view === "courses" && (
<>
{t.courses}
{admin && (
<form onSubmit={saveCourse} style={{ ...sectionStyle, marginBottom: "25px" }}>
{editingCourse ? t.edit : t.addCourse}
{t.title}
<input style={fieldStyle} value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder={t.title} required />
<textarea style={fieldStyle} value={courseDescription} onChange={e => setCourseDescription(e.target.value)} placeholder={t.description} rows={3} />
{t.titleEn}
<input style={fieldStyle} value={courseTitleEn} onChange={e => setCourseTitleEn(e.target.value)} placeholder={t.titleEn} required />
<textarea style={fieldStyle} value={courseDescriptionEn} onChange={e => setCourseDescriptionEn(e.target.value)} placeholder={t.descriptionEn} rows={3} />
{t.titleOm}
<input style={fieldStyle} value={courseTitleOm} onChange={e => setCourseTitleOm(e.target.value)} placeholder={t.titleOm} required />
<textarea style={fieldStyle} value={courseDescriptionOm} onChange={e => setCourseDescriptionOm(e.target.value)} placeholder={t.descriptionOm} rows={3} />
{t.passing}
<input style={fieldStyle} type="number" min="1" max="100" value={passingScore} onChange={e => setPassingScore(e.target.value)} required />
<div style={{ display: "flex", gap: "10px" }}>
{saving ? t.loading : editingCourse ? t.update : t.save}
{editingCourse && {t.cancel}}


)}
{admin && (
<div style={{ marginBottom: "15px" }}>
<button type="button" onClick={() => setShowArchived(value => !value)}>
{showArchived ? t.courses : t.archivedList}


)}
{visibleCourses.length === 0 && {t.empty}}
{visibleCourses.map(course => (

{getCourseTitle(course, language)}
{getCourseDescription(course, language)}
{t.passing}: {course.passingScore ?? 70}%
<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
<button type="button" onClick={() => openCourse(course)}>{t.open}
{admin && !showArchived && (
<>
<button type="button" onClick={() => startEditCourse(course)}>{t.edit}
<button type="button" onClick={() => archiveCourse(course.id)} disabled={saving}>{t.archive}
</>
)}
{admin && showArchived && (
<button type="button" onClick={() => restoreCourse(course.id)} disabled={saving}>{t.update}
)}


))}
</>
)}
{view === "course" && selected && (
<>
{t.back}
{getCourseTitle(selected, language)}
{getCourseDescription(selected, language)}
{t.lessons}
{lessons.length === 0 && {t.noLessons}}
{lessons.map(lesson => (

{lesson.title}
<p style={{ whiteSpace: "pre-wrap" }}>{lesson.content}
{admin && <button type="button" onClick={() => removeLesson(lesson.id)} disabled={saving}>{t.delete}}

))}
{admin && (

{t.addLesson}
<input style={fieldStyle} value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder={t.lessonTitle} required />
<textarea style={fieldStyle} value={lessonContent} onChange={e => setLessonContent(e.target.value)} placeholder={t.content} rows={6} required />
{saving ? t.loading : t.save}

)}
{admin && (
<>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginTop: "25px" }}>
{t.adminQuestions} ({questions.length})
{questions.length > 0 && (
<button
type="button"
onClick={downloadQuestionsBackup}
style={{ background: "#0f766e", color: "#fff", padding: "10px 15px", border: "none", borderRadius: "8px", cursor: "pointer" }}
>
{t.downloadBackup}

)}
{questions.length === 0 && {t.noQuestions}}
{questions.map((item, index) => {
const optsAm = normalizeOptions(item.options);
const optsEn = normalizeOptions(item.optionsEn);
const optsOm = normalizeOptions(item.optionsOm);
return (

{index + 1}. {item.question}
<div style={{ margin: "8px 0" }}>
📚 {t.linkedLesson}:{" "}
<select
value={item.lessonId || ""}
disabled={saving}
onChange={e => linkExistingQuestionToLesson(item.id, e.target.value)}
style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
>
-- {t.allLessons} --
{lessons.map(lesson => (
{lesson.title}
))}


English: {item.questionEn || "(not translated)"}
Afaan Oromo: {item.questionOm || "(not translated)"}
Amharic options:

{OPTION_KEYS.map(key => {key}. {optsAm[key]})}

English options:

{OPTION_KEYS.map(key => {key}. {optsEn[key]})}

Afaan Oromo options:

{OPTION_KEYS.map(key => {key}. {optsOm[key]})}

{t.correct}: {item.correctAnswer}
<button type="button" onClick={() => removeQuestion(item.id)} disabled={saving}>{t.delete}

);
})}
<div style={{
border: "2px solid #2563eb", background: "#f5f8ff", color: "#172554",
padding: "18px", margin: "25px 0", borderRadius: "12px"
}}>
📥 Bulk Import Questions – 3 Languages
እያንዳንዱ ጥያቄ በሶስቱም ቋንቋዎች መሞላት አለበት። ጥያቄዎቹን ከታች ባለው ቅርጸት አስገባ፣ Preview አድርግ፣ ከመረመርክ በኋላ Import All ተጫን።
{t.selectLesson}
<select style={{ ...fieldStyle, background: "#fff" }} value={bulkLessonId} onChange={e => setBulkLessonId(e.target.value)}>
-- {t.allLessons} --
{lessons.map(lesson => (
{lesson.title}
))}

<textarea
value={bulkText}
onChange={e => { setBulkText(e.target.value); setBulkQuestions([]); setBulkError(""); }}
placeholder={Question: አመራር ምን ማለት ነው?\nQuestionEn: What is leadership?\nQuestionOm: Hoggansi jechuun maali?\nA: ሌሎችን በግድ ማዘዝ\nB: ሰዎችን ወደ ጋራ ግብ መምራት\nC: የግል ጥቅምን ማስቀደም\nD: ውሳኔን ብቻውን መወሰን\nAEn: Forcing others to obey\nBEn: Guiding people toward a shared goal\nCEn: Putting personal interest first\nDEn: Making decisions alone\nAOm: Namoota dirqisiisuu\nBOm: Namoota gara galma waliinii qajeelchuu\nCOm: Faayidaa dhuunfaa dursuu\nDOm: Murtii kophaa kennuu\nCorrect: B}
rows={20}
style={{ ...fieldStyle, background: "#fff", color: "#111827" }}
/>
<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
<button type="button" onClick={previewBulkQuestions} disabled={saving || !bulkText.trim()}>👁 Preview Questions
<button type="button" onClick={() => { setBulkText(""); setBulkQuestions([]); setBulkError(""); setBulkLessonId(""); }} disabled={saving}>Clear
{bulkError && <p role="alert" style={{ color: "#b91c1c", background: "#fee2e2", padding: "10px", borderRadius: "6px", overflowWrap: "anywhere", marginTop: "10px" }}>{bulkError}}
{bulkQuestions.length > 0 && (
<div style={{ marginTop: "20px" }}>
<h4 style={{ color: "#15803d" }}>✓ Preview ready – {bulkQuestions.length}
{bulkQuestions.map((item, index) => (
<article
key={index}
style={{
background: item.isDuplicate ? "#fef2f2" : "#fff",
color: "#111827",
border: item.isDuplicate ? "2px solid #dc2626" : "1px solid #cbd5e1",
padding: "12px", marginBottom: "10px", borderRadius: "8px"
}}
>
{item.isDuplicate && (
<p style={{ color: "#dc2626", fontWeight: "bold", margin: "0 0 6px" }}>
⚠️ ማስጠንቀቂያ፡ ይህ ጥያቄ ቀድሞ ተመዝግቧል!

)}
{index + 1}. {item.question}
English: {item.questionEn}
Afaan Oromo: {item.questionOm}
Amharic options:

{OPTION_KEYS.map(key => {key}. {item.options[key]})}

English options:

{OPTION_KEYS.map(key => {key}. {item.optionsEn[key]})}

Afaan Oromo options:

{OPTION_KEYS.map(key => {key}. {item.optionsOm[key]})}

Correct Answer: {item.correctAnswer}

))}
<button type="button" onClick={importBulkQuestions} disabled={saving} style={{ background: "#15803d", color: "#fff", padding: "12px 20px", border: "none", borderRadius: "8px", fontWeight: "bold" }}>
{saving ? "በመመዝገብ ላይ..." : ✓ Import All ${bulkQuestions.length} Questions}


)}
{t.addQuestion} – 3 Languages
{t.selectLesson}
<select style={fieldStyle} value={selectedLessonId} onChange={e => setSelectedLessonId(e.target.value)}>
-- {t.allLessons} --
{lessons.map(lesson => (
{lesson.title}
))}
{t.question}
<textarea style={fieldStyle} value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder={t.question} rows={3} required />
{t.questionEn}
<textarea style={fieldStyle} value={questionTextEn} onChange={e => setQuestionTextEn(e.target.value)} placeholder={t.questionEn} rows={3} required />
{t.questionOm}
<textarea style={fieldStyle} value={questionTextOm} onChange={e => setQuestionTextOm(e.target.value)} placeholder={t.questionOm} rows={3} required />
Amharic options
<input style={fieldStyle} value={optionA} onChange={e => setOptionA(e.target.value)} placeholder="A – አማርኛ" required />
<input style={fieldStyle} value={optionB} onChange={e => setOptionB(e.target.value)} placeholder="B – አማርኛ" required />
<input style={fieldStyle} value={optionC} onChange={e => setOptionC(e.target.value)} placeholder="C – አማርኛ" required />
<input style={fieldStyle} value={optionD} onChange={e => setOptionD(e.target.value)} placeholder="D – አማርኛ" required />
{t.optionsEn}
<input style={fieldStyle} value={optionAEn} onChange={e => setOptionAEn(e.target.value)} placeholder="A – English" required />
<input style={fieldStyle} value={optionBEn} onChange={e => setOptionBEn(e.target.value)} placeholder="B – English" required />
<input style={fieldStyle} value={optionCEn} onChange={e => setOptionCEn(e.target.value)} placeholder="C – English" required />
<input style={fieldStyle} value={optionDEn} onChange={e => setOptionDEn(e.target.value)} placeholder="D – English" required />
{t.optionsOm}
<input style={fieldStyle} value={optionAOm} onChange={e => setOptionAOm(e.target.value)} placeholder="A – Afaan Oromo" required />
<input style={fieldStyle} value={optionBOm} onChange={e => setOptionBOm(e.target.value)} placeholder="B – Afaan Oromo" required />
<input style={fieldStyle} value={optionCOm} onChange={e => setOptionCOm(e.target.value)} placeholder="C – Afaan Oromo" required />
<input style={fieldStyle} value={optionDOm} onChange={e => setOptionDOm(e.target.value)} placeholder="D – Afaan Oromo" required />
{t.correct}
<select style={fieldStyle} value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)}>
A
B
C
D
{saving ? t.loading : t.addQuestion}

</>
)}
{!admin && (
{language === "en" ? "Secure Exam" : language === "om" ? "Qormaata nageenya qabu" : "ደህንነቱ የተጠበቀ ፈተና"}
{examError && (
<div role="alert" style={{ color: "#b91c1c", background: "#fee2e2", padding: "10px", borderRadius: "6px", overflowWrap: "anywhere", marginBottom: "10px" }}>
{examError}
<button type="button" onClick={async () => {
setExamError(""); setExamQuestions([]); setExamAnswers({}); setExamResult(null);
try {
const examData = await getExamQuestions(selected.id);
setExamQuestions(Array.isArray(examData.questions) ? examData.questions : []);
if (!Array.isArray(examData.questions) || examData.questions.length === 0) {
setExamError(t.noQuestions);
}
} catch (error) {
setExamError(error.message || t.secureExam);
}
}}>{t.retry}

)}
{examQuestions.length === 0 && !examError && {t.loading}}
{examResult ? (

{language === "en" ? "Exam result" : language === "om" ? "Bu'aa qormaataa" : "የፈተና ውጤት"}
{t.score}: {examResult.score}%
{t.correctCount}: {examResult.correctAnswers}/{examResult.totalQuestions}
<strong style={{ color: examResult.passed ? "green" : "red" }}>{examResult.passed ? t.passed : t.failed}

) : examQuestions.length > 0 ? (

{language === "en" ? "Answer all questions, then submit once." : language === "om" ? "Gaaffii hunda deebisi, achiis yeroo tokko ergi." : "ሁሉንም ጥያቄዎች መልሰህ አንድ ጊዜ አስገባ።"}
{examQuestions.map((item, index) => {
const studentOpts = getQuestionOptions(item, language);
return (
<article key={item.id} style={{ ...sectionStyle, margin: "12px 0" }}>
{index + 1}. {getQuestionText(item, language)}
{OPTION_KEYS.map(key => (
<div
key={key}
onClick={() => setExamAnswers(previous => ({ ...previous, [item.id]: key }))}
style={{
display: "flex",
flexDirection: "row",
alignItems: "center",
justifyContent: "flex-start",
gap: "10px",
padding: "10px 6px",
cursor: "pointer",
textAlign: "left"
}}
>
<input
type="radio"
name={exam-${item.id}}
value={key}
checked={examAnswers[item.id] === key}
onChange={() => setExamAnswers(previous => ({ ...previous, [item.id]: key }))}
style={{
width: "18px",
height: "18px",
minWidth: "18px",
margin: 0,
display: "inline-block"
}}
/>
<span style={{ display: "inline", lineHeight: "1.4" }}>
{key}. {studentOpts[key]}


))}

);
})}
{examSaving ? t.loading : t.save}

) : null}

)}
</>
)}
{view === "results" && (
<>
{t.back}
{t.myResults}
{results.length === 0 && {t.noResults}}
{results.map(res => (

{res.courseTitle || res.courseId}
{t.score}: {res.score}%
{t.correctCount}: {res.correctAnswers}/{res.totalQuestions}
<strong style={{ color: res.passed ? "green" : "red" }}>{res.passed ? t.passed : t.failed}

))}
</>
)}

);
}


    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
