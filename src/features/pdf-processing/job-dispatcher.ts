import "server-only";

import { inngest, type DocumentUploadedEventData } from "@/features/pdf-processing/inngest-client";
import { isInngestConfigured } from "@/lib/env";

export async function dispatchDocumentProcessingJob(
  data: DocumentUploadedEventData
): Promise<{ dispatched: boolean; mode: "inngest" | "queued_local" }> {
  if (!isInngestConfigured()) {
    return { dispatched: false, mode: "queued_local" };
  }

  await inngest.send({
    name: "sonar/document.uploaded",
    data,
  });

  return { dispatched: true, mode: "inngest" };
}
