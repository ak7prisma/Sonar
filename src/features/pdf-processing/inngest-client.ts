import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "sonar-accessibility",
});

export interface DocumentUploadedEventData {
  documentId: string;
  versionId: string;
  jobId: string;
  courseId: string;
  storagePath: string;
  language: "en" | "id";
  uploadedBy: string;
}
