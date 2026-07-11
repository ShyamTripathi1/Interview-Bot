const { GoogleGenAI } = require('@google/generative-ai');

// Helper to check if API key exists and initialize Gemini
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "") {
  try {
    // Note: in modern versions of the library, it can be initialized with:
    // const { GoogleGenAI } = require('@google/generative-ai');
    // or sometimes: const { GoogleGenerativeAI } = require('@google/generative-ai');
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.error("Error initializing GoogleGenerativeAI:", err.message);
  }
}

const callGroq = async (messages, model = "llama-3.3-70b-versatile", responseFormat = null) => {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.trim() === "") {
    return null;
  }
  try {
    const body = {
      model,
      messages
    };
    if (responseFormat) {
      body.response_format = responseFormat;
    }
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    console.error("Groq API error response:", data);
    return null;
  } catch (err) {
    console.error("Error calling Groq API:", err.message);
    return null;
  }
};

// Fallback helper in case Gemini API key is missing or calls fail
const getFallbackInterviewQuestions = (role) => {
  return [
    `Can you describe your experience working with the core technologies required for a ${role} role?`,
    "Explain a challenging technical problem you faced recently and how you resolved it.",
    "How do you approach learning a new framework or programming language when starting a new project?",
    "Describe your experience collaborating with cross-functional teams (designers, PMs, QA) during a project lifecycle.",
    "Where do you see yourself in the next three years, and how does this role fit into your career progression?"
  ];
};

const getFallbackQuiz = (topic) => {
  return [
    {
      questionText: `Which of the following is a primary feature or characteristic of ${topic}?`,
      options: [
        "It is strictly used for database schemas.",
        "It offers high scalability and flexibility in modern application architectures.",
        "It runs exclusively on client-side environments.",
        "It has been deprecated in favor of older technologies."
      ],
      correctOptionIndex: 1,
      explanation: `${topic} is widely adopted because it provides flexibility and scalable architecture patterns.`
    },
    {
      questionText: `What is a common best practice when designing architectures with ${topic}?`,
      options: [
        "Hardcoding all credentials inside git repositories.",
        "Modularizing code and separating concerns appropriately.",
        "Avoiding any form of caching or session persistence.",
        "Avoiding testing until production deployment."
      ],
      correctOptionIndex: 1,
      explanation: "Separating concerns and modular design makes maintenance and testing easier."
    },
    {
      questionText: `How does ${topic} typically handle asynchronous workflows or operations?`,
      options: [
        "By blocking execution completely until tasks are done.",
        "Using Promises, async/await patterns, or event-driven models.",
        "By offloading all workloads to browser CSS execution.",
        "Asynchronous operations are not supported."
      ],
      correctOptionIndex: 1,
      explanation: "Most modern environments handle async processing using promise resolution and event queues."
    },
    {
      questionText: `Which utility or library is most commonly paired with ${topic} in MERN stack development?`,
      options: [
        "Pandas",
        "Mongoose / Express",
        "Laravel",
        "Django"
      ],
      correctOptionIndex: 1,
      explanation: "Mongoose and Express are core parts of the MERN stack."
    },
    {
      questionText: `What is the most effective way to debug issues related to ${topic}?`,
      options: [
        "Deleting the codebase and starting over.",
        "Using debugger tools, structured console logging, and inspecting network requests.",
        "Rebooting the operating system multiple times.",
        "Ignoring warnings since they never impact runtimes."
      ],
      correctOptionIndex: 1,
      explanation: "Debugger utilities, inspector endpoints, and network payloads are standard debugging vectors."
    }
  ];
};

/**
 * Clean json response helper
 */
function cleanJSON(text) {
  try {
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("Failed to parse JSON directly from Gemini text:", text);
    // Find the first [ and last ] or first { and last }
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      try {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1));
      } catch (e2) {
        throw new Error("Could not parse JSON response from LLM");
      }
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (e2) {
        throw new Error("Could not parse JSON response from LLM");
      }
    }
    throw e;
  }
}

/**
 * Service methods
 */
const geminiService = {
  generateInterviewQuestions: async (role, jobDescription = "") => {
    const prompt = `You are an expert interviewer. Generate a list of exactly 5 relevant, challenging interview questions for the role of a "${role}". ${jobDescription ? `Take this job description into consideration: ${jobDescription}.` : ''} 
    Return the output as a valid JSON array of strings ONLY. Do not include markdown code block syntax or any prefix text. Format example: ["question 1", "question 2", ...]`;

    // Try Groq first for extreme speed
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== "") {
      try {
        const messages = [{ role: "user", content: prompt }];
        const resText = await callGroq(messages, "llama-3.3-70b-versatile");
        if (resText) return cleanJSON(resText);
      } catch (err) {
        console.error("Groq generateInterviewQuestions error:", err.message);
      }
    }

    if (!genAI) {
      return getFallbackInterviewQuestions(role);
    }
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return cleanJSON(text);
    } catch (err) {
      console.error("Gemini generateInterviewQuestions error:", err.message);
      return getFallbackInterviewQuestions(role);
    }
  },

  gradeInterviewAnswers: async (role, questions, answers, snapshots = []) => {
    const interviewData = questions.map((q, idx) => ({
      question: q,
      answer: answers[idx] || ""
    }));

    // Count how many real image snapshots we have
    const realSnapshotCount = snapshots.filter(s => s && s !== "camera_off" && s.startsWith("data:image")).length;
    console.log(`[Proctoring] Received ${snapshots.length} snapshots total, ${realSnapshotCount} are real images.`);

    const prompt = `You are a STRICT Senior Technical Recruiter AND an AI Proctoring System. You have TWO jobs:

JOB 1 — ANSWER EVALUATION:
Evaluate these interview responses for a "${role}" role.
Input Data: ${JSON.stringify(interviewData)}

For each question:
1. Give HIGHLY SPECIFIC, individualized feedback for EACH question based EXACTLY on the user's actual answer. DO NOT give generic or repetitive feedback (e.g., do not just say "Good explanation, provide examples"). If the user's answer is correct/okay, explicitly mention WHICH points they got right. If the userAnswer is empty or blank, provide ONLY a comprehensive, detailed correct answer to the question (do not say "Expected Answer:" or "No answer was provided.", just give the actual answer). If the user's answer is incorrect or incomplete, explicitly point out what specific concepts are wrong or missing, and provide the exact data they should add.
2. Rate the answer on a scale from 0 to 10 (integers only). If the userAnswer is empty, blank, or completely irrelevant, the score MUST be 0.

JOB 2 — STRICT PROCTORING (VERY IMPORTANT):
${realSnapshotCount > 0 ? `I am attaching ${realSnapshotCount} webcam snapshots, one for each question. You MUST carefully analyze EACH snapshot image for the following violations:

VIOLATION RULES (be STRICT — flag anything suspicious):
• "looking_away" — The candidate's eyes or face are NOT directed at the camera/screen. This includes: looking down, looking left, looking right, looking up, head turned to the side, eyes looking at something off-screen. If the candidate is NOT looking STRAIGHT at the camera, this IS a violation.
• "device_detected" — A phone, tablet, second monitor, book, paper notes, or any reference material is visible anywhere in the frame.
• "person_detected" — Another person is visible in the frame besides the candidate.

IMPORTANT: You must analyze the ACTUAL PIXEL CONTENT of each attached image. Even slight head turns or downward gazes count as "looking_away". Be very strict. Real proctoring systems flag even minor gaze deviations.

For each image, decide: Is the person looking DIRECTLY at the camera? If not, it's a violation.` : 'No webcam snapshots were provided. Skip proctoring analysis.'}

OUTPUT FORMAT — Return ONLY valid JSON (no markdown, no code blocks):
{
  "questions": [
    { "questionText": "...", "userAnswer": "...", "feedback": "...", "score": 8 }
  ],
  "violations": [
    { "questionIndex": 0, "type": "looking_away", "details": "Candidate's head was turned to the left, not looking at the camera." }
  ],
  "overallScore": 7,
  "overallFeedback": "Overall feedback summary"
}

If there are no violations, return "violations": [].
The violations array must contain one entry per detected issue per snapshot.`;

    const normalizeResult = (parsed) => {
      if (!parsed) return parsed;
      if (!parsed.violations) parsed.violations = [];
      
      if (parsed.questions) {
        parsed.questions.forEach((q, idx) => {
          if (q.score > 10) q.score = Math.round(q.score / 10);
          
          const ans = q.userAnswer || answers[idx] || "";
          if (ans.trim().length === 0) {
            q.score = 0;
            if (!q.feedback) {
              q.feedback = "Since no answer was provided, a strong response would explain key concepts, architecture details, and relevant past experience.";
            }
          }
        });
        
        // Recalculate overall score
        if (parsed.questions.length > 0) {
          const sum = parsed.questions.reduce((acc, q) => acc + q.score, 0);
          parsed.overallScore = Math.round(sum / parsed.questions.length);
        }
      }

      // Proctoring check for camera_off snapshots
      snapshots.forEach((snap, idx) => {
        if (!snap || snap === "camera_off") {
          const existing = parsed.violations.find(v => v.questionIndex === idx && v.type === "camera_off");
          if (!existing) {
            parsed.violations.push({
              questionIndex: idx,
              type: "camera_off",
              details: `Webcam was turned off during Question ${idx + 1}. Candidate must keep camera enabled.`
            });
          }
        }
      });

      console.log(`[Proctoring] Final violations count: ${parsed.violations.length}`);
      if (parsed.violations.length > 0) {
        console.log(`[Proctoring] Violations:`, JSON.stringify(parsed.violations));
      }

      return parsed;
    };

    // 1. Try Gemini with proper multimodal format
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        // Build parts array — all parts must be objects for multimodal
        const parts = [{ text: prompt }];
        snapshots.forEach((snap, idx) => {
          if (snap && snap !== "camera_off" && snap.startsWith("data:image")) {
            const base64Data = snap.replace(/^data:image\/[a-z]+;base64,/, "");
            parts.push({ text: `\n[Webcam Snapshot for Question ${idx + 1} — ANALYZE THIS IMAGE for proctoring violations]:` });
            parts.push({
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
              }
            });
          }
        });

        console.log(`[Proctoring] Sending ${parts.length} parts to Gemini (${parts.filter(p => p.inlineData).length} images)`);
        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();
        console.log(`[Proctoring] Gemini response length: ${text.length} chars`);
        const parsed = cleanJSON(text);
        return normalizeResult(parsed);
      } catch (err) {
        console.error("Gemini gradeInterviewAnswers error, trying Groq fallback:", err.message);
      }
    }

    // 2. Try Groq (as fallback or if Gemini API key not present)
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== "") {
      try {
        const content = [{ type: "text", text: prompt }];
        
        snapshots.forEach((snap, idx) => {
          if (snap && snap !== "camera_off" && snap.startsWith("data:image")) {
            content.push({ type: "text", text: `[Webcam Snapshot for Question ${idx + 1}]` });
            content.push({
              type: "image_url",
              image_url: { url: snap }
            });
          }
        });

        const messages = [
          { role: "system", content: "You are a helpful assistant that outputs only valid raw JSON. You MUST analyze all attached images for proctoring violations." },
          { role: "user", content }
        ];

        const resText = await callGroq(messages, "llama-3.2-11b-vision-preview", { type: "json_object" });
        if (resText) {
          const parsed = JSON.parse(resText);
          return normalizeResult(parsed);
        }
      } catch (groqErr) {
        console.error("Groq fallback vision grading failed:", groqErr.message);
      }
    }

    // 3. Fallback mock grading if all else fails
    const gradedQuestions = questions.map((q, idx) => {
      const ans = answers[idx] || "";
      const score = ans.trim().length === 0 ? 0 : (ans.length > 25 ? Math.min(8 + (Math.random() > 0.5 ? 1 : 0), 10) : 5 + Math.floor(Math.random() * 2));
      return {
        questionText: q,
        userAnswer: ans,
        feedback: ans.trim().length === 0
          ? "Here is the correct answer: A detailed engineering response should highlight core implementation methodologies, practical context, and resolution of constraints."
          : (ans.length > 25 
             ? "Good explanation. You touched on the main concepts. To improve further, provide concrete examples from your past projects." 
             : "The response was brief. Please expand on the technical details and clarify your role in the described scenarios."),
        score
      };
    });
    const avg = Math.round(gradedQuestions.reduce((acc, q) => acc + q.score, 0) / gradedQuestions.length);
    
    const parsedMock = {
      questions: gradedQuestions,
      violations: [],
      overallScore: avg,
      overallFeedback: "Evaluation completed successfully. (Using Mock Fallback)"
    };
    
    return normalizeResult(parsedMock);
  },

  generateQuiz: async (topic) => {
    const prompt = `Create a multiple-choice quiz about "${topic}" consisting of exactly 30 questions.
    For each question, provide 4 options, the 0-based index of the correct option, and a helpful explanation.
    
    Output MUST be a valid JSON array of objects matching this schema:
    [
      {
        "questionText": "Question text here?",
        "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
        "correctOptionIndex": 1,
        "explanation": "Why Option 1 is correct..."
      }
    ]
    No prefix text, no markdown. Just output raw JSON.`;

    // Try Groq first for extreme speed
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== "") {
      try {
        const messages = [{ role: "user", content: prompt }];
        const resText = await callGroq(messages, "llama-3.3-70b-versatile");
        if (resText) return cleanJSON(resText);
      } catch (err) {
        console.error("Groq generateQuiz error:", err.message);
      }
    }

    if (!genAI) {
      return getFallbackQuiz(topic);
    }
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return cleanJSON(text);
    } catch (err) {
      console.error("Gemini generateQuiz error:", err.message);
      return getFallbackQuiz(topic);
    }
  },

  generateQuizFeedback: async (topic, score, totalQuestions) => {
    if (!genAI) {
      return `You scored ${score}/${totalQuestions} on the ${topic} quiz. ${score >= 4 ? 'Excellent job! You have a solid grasp of this skill. Try exploring more advanced topics.' : 'Keep studying the fundamentals of this topic. Review the explanations for the questions you missed and try again!'}`;
    }
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `A student just scored ${score} out of ${totalQuestions} on a quiz about "${topic}". 
      Write a short, highly encouraging summary of their performance (max 3 sentences) and provide 3 specific, bulleted tips on what resources or topics they should review next to improve. Do not output JSON, just output direct text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.error("Gemini generateQuizFeedback error:", err.message);
      return `Keep practicing ${topic}! Focus on reviewing code structures, syntax details, and practical execution scenarios.`;
    }
  },

  enhanceResumeSummary: async (summary, role = "Software Engineer") => {
    if (!genAI) {
      return `${summary} (Optimized for ${role} role: Dynamic professional with demonstrated experience deploying frontend solutions, designing scalable backend systems, and collaborating in agile teams.)`;
    }
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `Rewrite and enhance the following professional resume summary to make it sound highly professional, metrics-driven, and tailored for a "${role}" role. Keep it concise (3-4 sentences max):
      "${summary}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.error("Gemini enhanceResumeSummary error:", err.message);
      return summary;
    }
  },

  enhanceExperienceBulletPoints: async (description, role = "Software Engineer") => {
    if (!genAI) {
      return `• Optimized: Spearheaded the implementation of high-performance backend APIs for ${role} features, improving request latency by 20%.\n• Designed and integrated relational databases, ensuring code security and 99.9% uptime.`;
    }
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `Enhance the following job description bullet points to sound professional, achievement-oriented, and action-verb centered for a "${role}" role. Use industry keywords and imply quantitative results where possible:
      "${description}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.error("Gemini enhanceExperienceBulletPoints error:", err.message);
      return description;
    }
  },

  chatWithCareerCoach: async (message, history = []) => {
    const systemInstruction = "You are a professional career coach named 'InterviewX Coach'. Help the user with job searching, resume advice, negotiation tips, behavioral interview structure (STAR method), and career growth advice. Keep responses clear, professional, and supportive. Use plain numbered lists (1. 2. 3.) when listing points. No markdown symbols.";

    // Strip markdown formatting from AI response
    const stripMarkdown = (text) => {
      return text
        .replace(/#{1,6}\s*/g, '')          // remove # headings
        .replace(/\*\*(.+?)\*\*/g, '$1')    // remove **bold**
        .replace(/\*(.+?)\*/g, '$1')        // remove *italic*
        .replace(/`(.+?)`/g, '$1')          // remove `code`
        .replace(/^\s*[-*+]\s+/gm, '')      // remove bullet points - * +
        .replace(/^\s*>\s+/gm, '')          // remove blockquotes
        .replace(/\n{3,}/g, '\n\n')         // collapse extra blank lines
        .trim();
    };

    // Build OpenAI-style messages array for Groq
    const messages = [
      { role: "system", content: systemInstruction },
      ...history.map(h => ({ role: h.role === "user" ? "user" : "assistant", content: h.content })),
      { role: "user", content: message }
    ];

    // Primary: Try Groq (Llama 3) — 14,400 req/day free tier
    const groqResponse = await callGroq(messages, "llama-3.3-70b-versatile");
    if (groqResponse) return stripMarkdown(groqResponse);

    // Fallback: Try Gemini if Groq fails
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-flash-latest",
          systemInstruction: systemInstruction 
        });
        const contents = history.map(h => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        }));
        contents.push({ role: "user", parts: [{ text: message }] });
        const result = await model.generateContent({ contents });
        return stripMarkdown(result.response.text());
      } catch (err) {
        console.error("Gemini chatWithCareerCoach fallback error:", err.message);
      }
    }

    return "I'm having trouble connecting right now. Please try again in a moment!";
  }
};

module.exports = geminiService;
