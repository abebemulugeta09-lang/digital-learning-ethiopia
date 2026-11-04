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

export default function Courses({ user, profile, language = "am" }) {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const admin = profile?.role === "admin";

  const words = {
    am: {
      courses: "ትምህርቶች",
      add: "አዲስ ትምህርት ጨምር",
      title: "የትምህርት ርዕስ",
      description: "መግለጫ",
      save: "አስቀምጥ",
      lessons: "ትምህርት ክፍሎች",
      lessonTitle: "የLesson ርዕስ",
      content: "የLesson ይዘት",
      open: "ክፈት",
      delete: "ሰርዝ",
      back: "ተመለስ",
      empty: "ምንም ትምህርት አልተገኘም"
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
      empty: "No courses found"
    },
    om: {
      courses: "Barnoota",
      add: "Barnoota haaraa dabali",
      title: "Mata duree barnootaa",
      description: "Ibsa",
      save: "Olkaa'i",
      lessons: "Barnoota keessaa",
      lessonTitle: "Mata duree kutaa",
      content: "Qabiyyee kutaa",
      open: "Bani",
      delete: "Haqi",
      back: "Deebi'i",
      empty: "Barnoonni hin argamne"
    }
  };

  const t = words[language] || words.am;

  async function loadCourses() {
    try {
      const snapshot = await getDocs(collection(db, "courses"));
      setCourses(snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      })));
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

    if (!admin) return;

    try {
      const result = await addDoc(collection(db, "courses"), {
        title,
        description,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });

      setCourses(previous => [
        ...previous,
        {
          id: result.id,
          title,
          description
        }
      ]);

      setTitle("");
      setDescription("");
      setMessage("Course added successfully");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addLesson(event) {
    event.preventDefault();

    if (!admin || !selected) return;

    try {
      await addDoc(
        collection(db, "courses", selected.id, "lessons"),
        {
          title: lessonTitle,
          content: lessonContent,
          createdAt: serverTimestamp()
        }
      );

      setLessonTitle("");
      setLessonContent("");
      setMessage("Lesson added successfully");
      await openCourse(selected);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function openCourse(course) {
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
    }
  }

  async function removeCourse(courseId) {
    if (!admin) return;

    const confirmed = window.confirm("Delete this course?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "courses", courseId));
      setCourses(previous =>
        previous.filter(course => course.id !== courseId)
      );
      setSelected(null);
      setMessage("Course deleted");
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (loading) return <p>Loading courses...</p>;

  if (selected) {
    return (
      <section>
        <button onClick={() => setSelected(null)}>
          {t.back}
        </button>

        <h2>{selected.title}</h2>
        <p>{selected.description}</p>
        <h3>{t.lessons}</h3>

        {selected.lessons?.map(lesson => (
          <article key={lesson.id}>
            <h4>{lesson.title}</h4>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {lesson.content}
            </p>
          </article>
        ))}

        {admin && (
          <form onSubmit={addLesson}>
            <h3>Add Lesson</h3>

            <input
              value={lessonTitle}
              onChange={event => setLessonTitle(event.target.value)}
              placeholder={t.lessonTitle}
              required
            />

            <textarea
              value={lessonContent}
              onChange={event => setLessonContent(event.target.value)}
              placeholder={t.content}
              required
              rows="6"
            />

            <button type="submit">{t.save}</button>
          </form>
        )}
      </section>
    );
  }

  return (
    <section>
      <h2>{t.courses}</h2>

      {admin && (
        <form onSubmit={addCourse}>
          <h3>{t.add}</h3>

          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder={t.title}
            required
          />

          <textarea
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder={t.description}
            rows="3"
          />

          <button type="submit">{t.save}</button>
        </form>
      )}

      {courses.length === 0 && <p>{t.empty}</p>}

      {courses.map(course => (
        <article key={course.id}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>

          <button onClick={() => openCourse(course)}>
            {t.open}
          </button>

          {admin && (
            <button onClick={() => removeCourse(course.id)}>
              {t.delete}
            </button>
          )}
        </article>
      ))}

      {message && <p>{message}</p>}
    </section>
  );
}
