import Navbar from "@/components/navbar";
import { db } from "@/db";
import { resumeUploads } from "@/db/schema";
import { requireAuth } from "@/lib/auth-utils";
import { Feedback } from "@/types";
import { eq } from "drizzle-orm";
import { Search } from "lucide-react";
import Link from "next/link";
import { inter } from "../layout";

export default async function Page() {
  const { user } = await requireAuth();

  const resumeReviews = await db
    .select()
    .from(resumeUploads)
    .where(eq(resumeUploads.userId, user.id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-24 my-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl text-center sm:text-5xl font-bold mb-4">
              Your Resume Reviews
            </h1>
            <p className="text-xl text-center text-muted-foreground">
              Track and manage all your AI-powered resume analyses
            </p>

            <div className="mt-6">
              {resumeReviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resumeReviews.map((review) => (
                    <Link
                      href={`/resume/${review.id}`}
                      key={review.id}
                      className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg group flex flex-col items-center text-center"
                    >
                      {/* Company Name */}
                      <h3 className="text-xl font-bold mb-2">
                        {review.companyName}
                      </h3>
                      {/* Job Title */}
                      <p className="text-sm text-muted-foreground mb-4">
                        {review.jobTitle}
                      </p>

                      <div className="mb-6">
                        <div className="text-sm text-muted-foreground mb-1">
                          ATS Score
                        </div>
                        <div
                          className={`${inter.className} text-3xl font-bold text-primary`}
                        >
                          {(review?.feedback as Feedback)?.ATS?.score || 0}%
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No reviews found
                  </h3>

                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-full hover:opacity-90 transition-opacity font-medium"
                  >
                    Upload a Resume
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
