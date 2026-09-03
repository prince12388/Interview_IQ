import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.services.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

/* ================= SAFE JSON PARSE ================= */
const safeJSONParse = (text) => {
  try {
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanText);
  } catch (err) {
    console.log("❌ JSON Parse Error:", text);
    throw new Error("Invalid JSON from AI");
  }
};

/* ================= ANALYZE RESUME ================= */
export const analyzeResume = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }

    const filepath = req.file.path;

    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return ONLY raw JSON. Do not wrap in \`\`\`json

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}`
      },
      {
        role: "user",
        content: resumeText
      }
    ];

    const aiResponse = await askAi(messages);

    const parsed = safeJSONParse(aiResponse);

    fs.unlinkSync(filepath);

    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText
    });

  } catch (error) {
    console.log("❌ analyzeResume Error:", error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ message: error.message });
  }
};

/* ================= GENERATE QUESTIONS ================= */
export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({
        message: "Role, Experience and Mode are required."
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: "Not enough credits. Minimum 50 required."
      });
    }

    const projectText = Array.isArray(projects) && projects.length
      ? projects.join(", ")
      : "None";

    const skillsText = Array.isArray(skills) && skills.length
      ? skills.join(", ")
      : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
Role:${role}
Experience:${experience}
InterviewMode:${mode}
Projects:${projectText}
Skills:${skillsText}
Resume:${safeResume}
`;

    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer.

Generate exactly 5 questions.

Rules:
- 15–25 words each
- One per line
- No numbering
- No explanation
`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];

    const aiResponse = await askAi(messages);

    const questionsArray = aiResponse
      .split("\n")
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 5);

    if (!questionsArray.length) {
      return res.status(500).json({
        message: "AI failed to generate questions."
      });
    }

    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      }))
    });

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions
    });

  } catch (error) {
    console.log("❌ generateQuestion Error:", error.message);
    return res.status(500).json({
      message: `failed to create interview ${error.message}`
    });
  }
};

/* ================= SUBMIT ANSWER ================= */
export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);
    const question = interview.questions[questionIndex];

    if (!answer) {
      question.score = 0;
      question.feedback = "No answer provided.";
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded.";
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    const messages = [
      {
        role: "system",
        content: `
Return ONLY raw JSON.

{
 "confidence": number,
 "communication": number,
 "correctness": number,
 "finalScore": number,
 "feedback": "short feedback"
}`
      },
      {
        role: "user",
        content: `Q: ${question.question}\nA: ${answer}`
      }
    ];

    const aiResponse = await askAi(messages);

    const parsed = safeJSONParse(aiResponse);

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;

    await interview.save();

    return res.json({ feedback: parsed.feedback });

  } catch (error) {
    console.log("❌ submitAnswer Error:", error.message);
    return res.status(500).json({
      message: `failed to submit answer ${error.message}`
    });
  }
};

/* ================= FINISH INTERVIEW ================= */
export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(400).json({
        message: "Interview not found"
      });
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach(q => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    console.log("📊 Returning questions:", interview.questions.length, "questions with scores:", interview.questions.map(q => q.score));

    return res.json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions
    });

  } catch (error) {
    console.log("❌ finishInterview Error:", error.message);
    return res.status(500).json({
      message: `failed to finish interview ${error.message}`
    });
  }
};

export const getMyInterviews = async (req,res) => {
    try {
        const interviews = await Interview.find({userId:req.userId})
        .sort({ createdAt: -1 })
        .select("role experience mode finalScore status createdAt");

        return res.status(200).json(interviews)

    } catch (error) {
        return res.status(500).json({message:`failed to find currentUser 
            Interview ${error}`})
    }
}

export const getInterviewReport = async (req,res) => {
    try{
        const interview = await Interview.findById(req.params.id)

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const totalQuestions = interview.questions.length;

    
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach(q => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

     return res.json({
        finalScore: interview.finalScore,
        confidence: Number(avgConfidence.toFixed(1)),
        communication: Number(avgCommunication.toFixed(1)),
        correctness: Number(avgCorrectness.toFixed(1)),
        questionWiseScore: interview.questions
    });



    } catch (error) {
         return res.status(500).json({message:`failed to find currentUser 
            Interview report ${error}`})

    }
    
}