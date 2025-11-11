import { NextResponse } from "next/server";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { resumeUploads } from "@/db/schema";
import { generateFeedback } from "@/components/ai-utils";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { companyName, jobTitle, jobDescription, resumeImageUrl } = body;

    if (!companyName || !jobTitle || !jobDescription || !resumeImageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save in db
    const [record] = await db
      .insert(resumeUploads)
      .values({
        companyName,
        jobTitle,
        jobDescription,
        resumeImageUrl,
        userId: session.user.id,
      })
      .returning();

    // Generate AI feedback

    const feedback = await generateFeedback({ jobTitle, jobDescription });

    await db
      .update(resumeUploads)
      .set({ feedback })
      .where(eq(resumeUploads.id, record.id));

    // Return response
    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("AI feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
