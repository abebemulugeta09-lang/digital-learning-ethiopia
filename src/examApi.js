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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not load exam questions.");
  }

  return data;
}

export async function submitExam(courseId, answers) {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE}/api/exams/${encodeURIComponent(courseId)}/submit`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ answers }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not submit exam.");
  }

  return data;
}
