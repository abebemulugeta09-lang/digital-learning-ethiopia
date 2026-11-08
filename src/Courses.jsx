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
    passed: "አልፈሃል", failed: "አላለፍክም", certificate: "ሰርተፊኬት አውርድ / አትም",
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
    failed: "Failed", certificate: "Download / Print Certificate", student: "Student",
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
    failed: "Hin darbine", certificate: "Ragaa Buufadhu / Maxxansi", student: "Barataa",
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

function formatDate(value) {
  const time = getResultTime(value);
  return time ? new Date(time).toLocaleDateString() : new Date().toLocaleDateString();
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
src={https://qrserver.com{encodeURIComponent(\({window.location.origin}/?verify=\){activeCert.id})}}
alt="QR Verification Code"
width="130"
height="130"
style={{ border: "1px solid #cbd5e1", padding: "4px", borderRadius: "6px" }}
/>
<small style={{ color: "#475569" }}>Verification ID: {activeCert.id}



)}

);
}
