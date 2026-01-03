import { AIResponseFormat } from "@/constants";
import { aiClient } from "./ai-client";

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
}: {
  jobTitle: string;
  jobDescription: string;
}) =>
  `   You are an expert in ATS (Applicant Tracking System) and resume analysis.
      Please analyze and rate this resume and suggest how to improve it.
      The rating can be low if the resume is bad.
      Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
      If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
      If available, use the job description for the job user is applying to to give more detailed feedback.
      If provided, take the job description into consideration.
      The job title is: ${jobTitle}
      The job description is: ${jobDescription}
      Provide the feedback using the following format:
      ${AIResponseFormat}
      Return the analysis as an JSON object, without any other text and without the backticks.
      Do not include any other text or comments.`;

export const generateFeedback = async ({
  jobTitle,
  jobDescription,
  imageUrl,
}: {
  jobTitle: string;
  jobDescription: string;
  imageUrl: string;
}) => {
  const instructions = prepareInstructions({
    jobTitle,
    jobDescription,
  });

  const response = await aiClient.chat.completions.create({
    model: "gemini-2.5-flash",
    temperature: 0.3,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: instructions },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],

    response_format: {
      type: "json_object",
    },
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty AI response");
  }

  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error("Failed to parse AI response");
  }
};
