"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader } from "lucide-react";
import FileUploader from "@/components/file-uploader";
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { convertPdfToImage } from "@/lib/pdf2img";
import { uploadFiles } from "@/lib/uploadthing";
import { useAuthStore } from "@/store";

export default function ResumePage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("Analyzing your resume...");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);

    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file);

    if (!imageFile.file) {
      return setStatusText("Failed to convert PDF to image");
    }

    let imageUrl = "";

    try {
      setStatusText("Uploading the image...");
      const res = await uploadFiles("imageUploader", {
        files: [imageFile.file],
      });

      imageUrl = res[0].ufsUrl;

      setStatusText("Preparing data...");

      const feedbackRes = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName,
          jobTitle,
          jobDescription,
          resumeImageUrl: imageUrl,
        }),

        credentials: "include",
      });

      if (!feedbackRes.ok) {
        throw new Error("Failed to generate AI feedback");
      }

      const data = await feedbackRes.json();
      setStatusText("Analysis complete, redirecting...");

      router.push(`/resume/${data.id}`);
    } catch (err) {
      setStatusText("Something went wrong");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !companyName || !jobTitle || !jobDescription) {
      alert("Please fill in all fields");
      return;
    }

    handleAnalyze({ companyName, file, jobDescription, jobTitle });
  };

  useEffect(() => {
    if (!user) {
      router.replace("/sign-in");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-20 my-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold text-balance">
              {isProcessing
                ? "Analyzing Your Resume"
                : "Get Smart Resume Feedback"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isProcessing
                ? statusText
                : "Tell us about the job and upload your resume for instant AI-powered insights"}
            </p>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-6 mb-8">
              <div className="flex justify-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-linear-to-r from-primary to-primary/50 rounded-full blur opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader className="w-10 h-10 text-primary animate-spin" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold">{statusText}</p>
                <p className="text-muted-foreground">
                  This usually takes 10-30 seconds
                </p>
              </div>
              <div className="pt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Checking ATS compatibility</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Analyzing keyword optimization</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Generating personalized suggestions</span>
                </div>
              </div>
            </div>
          )}

          {!isProcessing && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
                <div>
                  <label
                    htmlFor="company-name"
                    className="block text-sm font-semibold mb-3"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company-name"
                    placeholder="e.g. Google, Microsoft, Startup Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background hover:border-primary/50 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="job-title"
                    className="block text-sm font-semibold mb-3"
                  >
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="job-title"
                    placeholder="e.g. Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background hover:border-primary/50 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="job-description"
                    className="block text-sm font-semibold mb-3"
                  >
                    Job Description
                  </label>
                  <textarea
                    id="job-description"
                    rows={5}
                    placeholder="Paste the full job description here. This helps us optimize your resume for this specific role."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background hover:border-primary/50 focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* File Upload Section */}
              <FileUploader onFileSelect={handleFileSelect} />

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Analyze My Resume
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
