import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { documentUploadMetaSchema } from "@/lib/validation/schemas";
import { validatePdfBuffer } from "@/features/pdf-processing/validator";
import { extractPdfTextPages } from "@/features/pdf-processing/text-extractor";
import { dispatchDocumentProcessingJob } from "@/features/pdf-processing/job-dispatcher";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured yet." },
      { status: 503 }
    );
  }

  const { supabase, auth } = await getAuthenticatedContext();
  if (!supabase || !auth) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const rate = checkRateLimit({
    key: `doc-upload:${auth.userId}`,
    limit: 12,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Upload rate limit reached. Try again in one minute." },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "");
  const language = String(formData.get("language") ?? "en");

  const parsedMeta = documentUploadMetaSchema.safeParse({
    courseId,
    title,
    language,
  });

  if (!parsedMeta.success) {
    return NextResponse.json(
      { error: "Invalid document metadata.", details: parsedMeta.error.flatten() },
      { status: 400 }
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Select a PDF file before submitting." },
      { status: 400 }
    );
  }

  // Resolve course identifier: supports both UUID and slug (e.g. "cs-201" -> "CS 201")
  let targetCourseId = parsedMeta.data.courseId;
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      targetCourseId
    );

  if (!isUuid) {
    const normalizedCode = targetCourseId.toUpperCase().replace("-", " ");
    const { data: dbCourse } = await supabase
      .from("courses")
      .select("id")
      .ilike("code", `%${normalizedCode}%`)
      .maybeSingle();

    if (dbCourse) {
      targetCourseId = dbCourse.id;
    } else {
      return NextResponse.json(
        {
          error: `Mata kuliah '${targetCourseId}' tidak ditemukan di database Supabase. Jalankan script seed_courses_data.sql di Supabase SQL Editor untuk menghubungkan katalog mata kuliah.`,
        },
        { status: 400 }
      );
    }
  }

  const dbClient = isSupabaseAdminConfigured()
    ? (createAdminSupabaseClient() ?? supabase)
    : supabase;

  // Ensure user belongs to the selected course, or auto-enroll them as student/volunteer
  const { data: membership } = await dbClient
    .from("course_members")
    .select("id")
    .eq("course_id", targetCourseId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (!membership && !auth.roles.includes("admin")) {
    const { error: enrollErr } = await dbClient.from("course_members").insert({
      course_id: targetCourseId,
      user_id: auth.userId,
      member_role: "student",
    });
    if (enrollErr) {
      console.warn("[Upload Route] Auto-enrollment info:", enrollErr.message);
    }
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const validation = validatePdfBuffer({
    buffer,
    filename: file.name,
    mimeType: file.type,
  });

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Duplicate detection inside the course
  const { data: duplicate } = await dbClient
    .from("documents")
    .select("id, title, review_status")
    .eq("course_id", targetCourseId)
    .eq("file_hash", validation.fileHash)
    .maybeSingle();

  if (duplicate) {
    return NextResponse.json(
      {
        duplicate: true,
        documentId: duplicate.id,
        title: duplicate.title,
        reviewStatus: duplicate.review_status,
        message:
          "This exact PDF has already been processed for this course. Redirecting to the existing accessible version.",
      },
      { status: 200 }
    );
  }

  const safeSlug = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${targetCourseId}/${nanoid(12)}-${safeSlug}`;

  const { error: uploadError } = await dbClient.storage
    .from("course-documents")
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    console.error("[Upload Route] Storage upload error:", uploadError);
    return NextResponse.json(
      {
        error: `Storage upload failed: ${uploadError.message}. Pastikan migrasi 0010_fix_storage_and_upload_rls.sql telah dijalankan di Supabase SQL Editor.`,
      },
      { status: 500 }
    );
  }

  // Intelligently detect real document title from PDF content if user didn't customize it
  let finalTitle = parsedMeta.data.title;
  const isGenericFilename =
    finalTitle === file.name ||
    finalTitle === file.name.replace(/\.pdf$/i, "") ||
    finalTitle.toLowerCase().endsWith(".pdf");

  if (isGenericFilename) {
    try {
      const pages = await extractPdfTextPages(new Uint8Array(buffer));
      const firstPage = pages[0]?.rawText;
      if (firstPage) {
        const lines = firstPage.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const headingLine = lines.find(
          (l) =>
            l.length > 3 &&
            l.length < 90 &&
            (l.match(/^(bab|modul|chapter|bagian|section|\d+[\.\)])/i) ||
              (l.toUpperCase() === l && l.length > 5 && !l.includes("=")))
        );
        if (headingLine) {
          finalTitle = headingLine;
        } else if (lines[0] && lines[0].length > 3 && lines[0].length < 90) {
          finalTitle = lines[0];
        }
      }
    } catch (pdfTitleErr) {
      console.warn("[Upload Route] PDF text title detection skipped:", pdfTitleErr);
    }
  }

  const { data: createdDoc, error: docErr } = await dbClient
    .from("documents")
    .insert({
      course_id: targetCourseId,
      uploaded_by: auth.userId,
      title: finalTitle,
      original_filename: file.name,
      storage_path: storagePath,
      file_hash: validation.fileHash,
      file_size_bytes: validation.sizeBytes,
      language: parsedMeta.data.language,
      processing_status: "queued",
      review_status: "unreviewed",
    })
    .select("id")
    .single();

  if (docErr || !createdDoc) {
    return NextResponse.json(
      { error: docErr?.message ?? "Failed to create document record." },
      { status: 500 }
    );
  }

  const { data: version, error: verErr } = await dbClient
    .from("document_versions")
    .insert({
      document_id: createdDoc.id,
      version_number: 1,
      source_storage_path: storagePath,
      change_summary: "Initial PDF upload",
      created_by: auth.userId,
    })
    .select("id")
    .single();

  if (verErr || !version) {
    return NextResponse.json(
      { error: verErr?.message ?? "Failed to create initial document version." },
      { status: 500 }
    );
  }

  await dbClient
    .from("documents")
    .update({ current_version_id: version.id })
    .eq("id", createdDoc.id);

  const { data: job, error: jobErr } = await dbClient
    .from("processing_jobs")
    .insert({
      document_id: createdDoc.id,
      version_id: version.id,
      status: "queued",
      current_stage: "validate",
      progress_percent: 5,
      logs: [
        {
          timestamp: new Date().toISOString(),
          stage: "validate",
          status: "queued",
          message: "PDF validated and queued for background accessibility conversion.",
        },
      ],
    })
    .select("id")
    .single();

  if (jobErr || !job) {
    return NextResponse.json(
      { error: jobErr?.message ?? "Failed to register processing job." },
      { status: 500 }
    );
  }

  const dispatchResult = await dispatchDocumentProcessingJob({
    documentId: createdDoc.id,
    versionId: version.id,
    jobId: job.id,
    courseId: targetCourseId,
    storagePath,
    language: parsedMeta.data.language,
    uploadedBy: auth.userId,
  });

  await dbClient.from("audit_logs").insert({
    actor_id: auth.userId,
    action: "document.uploaded",
    entity_type: "document",
    entity_id: createdDoc.id,
    metadata: {
      courseId: targetCourseId,
      sizeBytes: validation.sizeBytes,
      dispatchMode: dispatchResult.mode,
    },
  });

  return NextResponse.json(
    {
      documentId: createdDoc.id,
      versionId: version.id,
      jobId: job.id,
      dispatched: dispatchResult.dispatched,
      mode: dispatchResult.mode,
    },
    { status: 201 }
  );
}
