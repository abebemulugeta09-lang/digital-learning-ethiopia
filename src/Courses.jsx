import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

const translations = {
  am: {
    courses: "ትምህርቶች",
    add: "አዲስ ትምህርት ጨምር",
    title: "የትምህርት ርዕስ",
    description: "መግለጫ",
    save: "አስቀምጥ",
    lessons: "የትምህርት ክፍሎች",
    lessonTitle: "የትምህርት ክፍል ርዕስ",
    content: "የትምህርት ይዘት",
    open: "ክፈት",
    delete: "ሰርዝ",
    back: "ተመለስ",
    empty: "ምንም ትምህርት አልተገኘም",
    loading: "በመጫን ላይ...",
    noLessons: "ምንም የትምህርት ክፍል የለም።",
    confirm: "ይህን ትምህርት መሰረዝ ትፈልጋለህ?",
    added: "ትምህርቱ ተጨምሯል።",
    lessonAdded: "የትምህርት ክፍሉ ተጨምሯል።",
    deleted: "ትምህርቱ ተሰርዟል።",
    error: "ስህተት ተፈጥሯል።"
  },
  en: {
    courses: "Courses",
    add: "Add New Course",
    title: "Course Title",
    description: "Description",
    save: "Save",
    lessons: "Lessons",
    lessonTitle: "Lesson Title",
    content: "Lesson Content",
    open: "Open",
    delete: "Delete",
    back: "Back",
    empty: "No courses found",
    loading: "Loading...",
    noLessons: "No lessons available.",
    confirm: "Are you sure you want to delete this course?",
    added: "Course added successfully.",
    lessonAdded: "Lesson added successfully.",
    deleted: "Course deleted.",
    error: "An error occurred."
  },
  om: {
    courses: "Barnoota",
    add: "Barnoota haaraa dabali",
    title: "Mata duree barnootaa",
    description: "Ibsa",
    save: "Olkaa'i",
    lessons: "Kutaa barnootaa",
    lessonTitle: "Mata duree kutaa",
    content: "Qabiyyee barnootaa",
    open: "Bani",
    delete: "Haqi",
    back: "Deebi'i",
    empty: "Barnoonni hin argamne",
    loading: "Fe'amaa jira...",
    noLessons: "Kutaan barnootaa hin jiru.",
    confirm: "Barnoota kana haquu barbaaddaa?",
    added: "Barnoonni milkaa'inaan dabalameera.",
    lessonAdded: "Kutaan barnootaa dabalameera.",
    deleted: "Barnoonni haqameera.",
    error: "Dogoggorri uumameera."
  }
};

export default function Courses({ user, profile, language = "am" }) {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const admin = profile?.role === "admin";
  const t = translations[language] || translations.am;

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
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function addCourse(event) {
    event.preventDefault();

    if (!admin || !user) return;

    setSaving(true);
    setMessage("");

    try {
      const result = await addDoc(collection(db, "courses"), {
        title: title.trim(),
        description: description.trim(),
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });

      setCourses(previous => [
        ...previous,
        {
          id: result.id,
          title: title.trim(),
          description: description.trim()
        }
      ]);

      setTitle("");
      setDescription("");
      setMessage(t.added);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function openCourse(course) {
    setLoading(true);
    setMessage("");

    try {
      const snapshot = await getDocs(
        collection(db, "courses", course.id, "lessons")
      );

      setSelected({
        ...course,
        lessons: snapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }))
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addLesson(event) {
    event.preventDefault();

    if (!admin || !selected) return;

    setSaving(true);
    setMessage("");

    try {
      await addDoc(
        collection(db, "courses", selected.id, "lessons"),
        {
          title: lessonTitle.trim(),
          content: lessonContent.trim(),
          createdBy: user.uid,
          createdAt: serverTimestamp()
        }
      );

      setLessonTitle("");
      setLessonContent("");

      setMessage(t.lessonAdded);

      await openCourse(selected);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeCourse(courseId) {
    if (!admin) return;

    if (!window.confirm(t.confirm)) return;

    setSaving(true);
    setMessage("");

    try {
      // Delete lessons before deleting the course.
      const lessonSnapshot = await getDocs(
        collection(db, "courses", courseId, "lessons")
      );

      for (const lesson of lessonSnapshot.docs) {
        await deleteDoc(
          doc(db, "courses", courseId, "lessons", lesson.id)
        );
      }

      await deleteDoc(doc(db, "courses", courseId));

      setCourses(previous =>
        previous.filter(course => course.id !== courseId)
      );

      setSelected(null);
      setMessage(t.deleted);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>{t.loading}</p>;
  }

  if (selected) {
    return (
      <section className="courses-section">
        <button onClick={() => setSelected(null)}>
          {t.back}
        </button>

        <h2>{selected.title}</h2>
        <p>{selected.description}</p>

        <h3>{t.lessons}</h3>

        {selected.lessons.length === 0 && (
          <p>{t.noLessons}</p>
        )}

        {selected.lessons.map(lesson => (
          <article key={lesson.id}>
            <h4>{lesson.title}</h4>

            <p style={{ whiteSpace: "pre-wrap" }}>
              {lesson.content}
            </p>
          </article>
        ))}

        {admin && (
          <form onSubmit={addLesson}>
            <h3>{t.lessonTitle}</h3>

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

        {message && <p role="alert">{message}</p>}
      </section>
    );
  }

  return (
    <section className="courses-section">
      <h2>{t.courses}</h2>

      {admin && (
        <form onSubmit={addCourse}>
          <h3>{t.add}</h3>

          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={t.title}
            required
          />

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t.description}
            rows={3}
          />

          <button type="submit" disabled={saving}>
            {saving ? t.loading : t.save}
          </button>
        </form>
      )}

      {courses.length === 0 && (
        <p>{t.empty}</p>
      )}

      {courses.map(course => (
        <article key={course.id}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>

          <button onClick={() => openCourse(course)}>
            {t.open}
          </button>

          {admin && (
            <button
              onClick={() => removeCourse(course.id)}
              disabled={saving}
            >
              {t.delete}
            </button>
          )}
        </article>
      ))}

      {message && <p role="alert">{message}</p>}
    </section>
  );
}
