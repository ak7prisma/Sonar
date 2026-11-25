import { NextResponse } from "next/server";
import { loadWorkspaceSnapshot } from "@/lib/data/workspace";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  try {
    const snapshot = await loadWorkspaceSnapshot();
    const courses = snapshot.courses || [];
    const documents = snapshot.documents || [];

    if (!q) {
      // Return top courses and documents if query is empty
      return NextResponse.json({
        courses: courses.slice(0, 5).map((c) => ({
          id: c.id,
          code: c.code,
          title: c.title,
          discipline: c.discipline,
        })),
        documents: documents.slice(0, 6).map((d) => ({
          id: d.id,
          title: d.title,
          courseId: d.course_id,
          status: d.review_status,
        })),
      });
    }

    const matchedCourses = courses
      .filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.discipline.toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((c) => ({
        id: c.id,
        code: c.code,
        title: c.title,
        discipline: c.discipline,
      }));

    const matchedDocuments = documents
      .filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.original_filename && d.original_filename.toLowerCase().includes(q))
      )
      .slice(0, 10)
      .map((d) => ({
        id: d.id,
        title: d.title,
        courseId: d.course_id,
        status: d.review_status,
      }));

    return NextResponse.json({
      courses: matchedCourses,
      documents: matchedDocuments,
    });
  } catch (err) {
    console.error("[Search API] Error searching:", err);
    return NextResponse.json(
      { courses: [], documents: [] },
      { status: 200 }
    );
  }
}
