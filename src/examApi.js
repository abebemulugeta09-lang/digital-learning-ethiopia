import { auth } from "./firebase";

const API_BASE =
  "https://digital-learning-ethiopia-exam-api.abebemulugeta09.workers.dev";

async function getAuthHeaders() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in first.");
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getExamQuestions(courseId) {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE}/api/exams/${encodeURIComponent(courseId)}`,
    { headers }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Could not load exam (${response.status}).`
    );
  }

  return data;
}

export async function submitExam(courseId, answers, language = "am") {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE}/api/exams/${encodeURIComponent(courseId)}/submit`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ answers, language }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Could not submit exam (${response.status}).`
    );
  }

  return data;
}


export async function getLockedCourseIds() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/courses/locks`, { headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Could not load course locks (${response.status}).`);
  }
  return Array.isArray(data.lockedCourseIds) ? data.lockedCourseIds : [];
}

export async function unlockStudentCourse(courseId, userId) {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE}/api/admin/courses/${encodeURIComponent(courseId)}/unlock`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ userId })
    }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Could not unlock course (${response.status}).`);
  }
  return data;
}
