import ATS from "@/components/ATS";
import Details from "@/components/details";
import Summary from "@/components/summary";
import { db } from "@/db";
import { resumeUploads } from "@/db/schema";
import { requireAuth } from "@/lib/auth-utils";
import { Feedback } from "@/types";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userSession = await requireAuth();

  const { id } = await params;

  const [resume] = await db
    .select()
    .from(resumeUploads)
    .where(
      and(
        eq(resumeUploads.id, id),
        eq(resumeUploads.userId, userSession.user.id)
      )
    );

  if (!resume) {
    throw new Error("bhai baad me aana");
  }

  const feedback = resume.feedback as Feedback;

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation */}
        <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Homepage</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Resume Preview - Left Column */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent overflow-auto flex items-center justify-center p-2">
                    <a
                      href={resume.resumeImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src="https://ppk3tiiw3l.ufs.sh/f/WlIZ2PKEKgz9nLkpMqZgZ5O2umrcXNix7apEJMdFb6ezl3sh"
                        alt="Resume preview"
                        className="max-w-full h-auto object-contain rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback - Right Column */}
            <div className="lg:col-span-3 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">Resume Review</h1>
                <p className="text-muted-foreground">
                  Detailed AI-powered analysis of your resume
                </p>
              </div>

              <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                <Summary feedback={feedback} />
                <ATS
                  score={feedback.ATS.score || 0}
                  suggestions={feedback.ATS.tips || []}
                />
                <Details feedback={feedback} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
