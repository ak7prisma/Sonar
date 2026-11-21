import { serve } from "inngest/next";
import { inngest } from "@/features/pdf-processing/inngest-client";
import { inngestFunctions } from "@/features/pdf-processing/inngest-functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
