// Shared types for ai-teacher (frontend + backend)

export type Role = "teacher" | "student";

export interface User {
  id: string;
  email: string;
  role: Role;
  displayName?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
}

export interface Class {
  id: string;
  name: string;
  subjectId: string;
  teacherId: string;
}

export interface Enrollment {
  id: string;
  classId: string;
  studentId: string;
}

// Chat: prepared for RAG and future TTS/avatar
export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string; // ISO
  // Future: sourceChunks?, audioUrl?, avatarSessionId?
}

// Streaming: chunk shape for SSE/fetch streams (RAG responses)
export interface StreamChunk {
  type: "text" | "done" | "error";
  data?: string;
}
