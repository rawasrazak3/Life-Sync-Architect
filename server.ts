import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client (lazy validation to avoid crashing startup if key is temporarily absent)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is is not set in secrets/env.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: Parse a raw natural language task using Gemini
app.post("/api/gemini/parse-task", async (req, res) => {
  try {
    const { text, currentDate } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Task text is required." });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Parse the following natural language task and categorize/extract properties:
Task string: "${text}"

Rules:
1. Standardize the clean task name (e.g. "Draft contract" instead of "Draft contract by EOD").
2. Categorize into exactly one of: "Work", "Personal", "Urgent".
3. Assign priority from "P1" (highest) to "P4" (lowest). If unspecified, choose a sensible priority based on tone/urgency.
4. Extract the deadline/due date. If relative like "by EOD", "tomorrow", "next Tuesday", compute the absolute date based on the current date: "${currentDate || "2026-05-22"}". Return the deadline as a clear human-readable string (e.g., "YYYY-MM-DD" or "Today", "Tomorrow"). If no deadline is specified, return null.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "The cleaned name of the task.",
            },
            category: {
              type: Type.STRING,
              description: "One of 'Work', 'Personal', or 'Urgent'.",
            },
            priority: {
              type: Type.STRING,
              description: "One of 'P1', 'P2', 'P3', 'P4'.",
            },
            deadline: {
              type: Type.STRING,
              description: "The formatted date string 'YYYY-MM-DD', or relative descriptor like 'Today'/'Tomorrow', or null.",
            },
          },
          required: ["name", "category", "priority"],
        },
      },
    });

    const resultText = response.text?.trim() || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in parse-task:", error);
    res.status(500).json({ error: error.message || "Failed to parse task using AI." });
  }
});

// API: Synthesize Daily Synchronized Snapshot Briefing
app.post("/api/gemini/briefing", async (req, res) => {
  try {
    const { tasks, medications, groceries, budgets, currentDate, userProfile, gymSessions } = req.body;
    const ai = getGeminiClient();

    // Estimate BMI if data available
    const heightInM = userProfile?.height ? userProfile.height / 100 : 0;
    const bmiVal = (heightInM > 0 && userProfile?.weight) ? (userProfile.weight / (heightInM * heightInM)).toFixed(1) : null;

    // Build standard prompt summarizing state
    const prompt = `Synthesize a highly customized and personal "Daily Snapshot" briefing based on the following personal ecosystem records:

User Profile:
- Name: ${userProfile?.name || "Valued User"}
- Gender: ${userProfile?.gender || "Not specified"}
- Weight: ${userProfile?.weight ? userProfile.weight + " kg" : "Not specified"}
- Height: ${userProfile?.height ? userProfile.height + " cm" : "Not specified"}
- Estimated BMI: ${bmiVal || "Unknown"}
- Listed Medical Conditions: ${userProfile?.conditions || "None listed"}
- Listed Fitness Goal: ${userProfile?.fitnessGoal || "General Wellness"}

Ecosystem Metrics:
- Current Date/Time: ${currentDate || "2026-05-22"}
- Tasks List (Active): ${JSON.stringify(tasks || [])}
- Medication / Symptom Log: ${JSON.stringify(medications || [])}
- Gym Exercise History / Check-ins: ${JSON.stringify(gymSessions || [])}
- Grocery Shopping List: ${JSON.stringify(groceries || [])}
- Small Daily Budget/Expenses (Recent): ${JSON.stringify(budgets || [])}

Required Daily Snapshot Contents:
1. Daily Greeting: A greeting specific to the time of day and user name (e.g., "Good morning, [Name]", "Good afternoon, [Name]"), with a supportive, concise, and proactive outlook.
2. Wellness & Medical Advisors: Personalized medical/wellness insights tailored to their profile (considering gender, BMI, listed conditions like high blood pressure, and active medication inventories). Mention hydration, target gym habits, or specific safety reminders based on their activities and profile. (Add a brief subtle standard wellness disclaimer).
3. The Top 3 Focus Tasks for today (or up-to-date most urgent tasks mapped based on Priority and Deadline).
4. Gym Progress Highlight: Briefly reinforce or encourage their workout consistency based on their gym check-ins and check-in frequency.
5. 2 Vital Medical Reminders (e.g., pills running low and needing a refill alert, medication schedules, dosage compliance, or symptom trends).
6. 1 Urgent Grocery Item that standardizes recurring essentials or items flagged as high priority.
7. Critical Conflicts Check: Identify if any task deadlines or planned work item timings explicitly clash or overlap with medical schedules/appointment reminders. Highly emphasize that the medical reminder/appointment is strictly prioritized.

Ensure the final output is written in standard, clean Markdown with stylish headings, elegant bullets, and bold markers. Maintain a highly supportive, concise, organized, and professional tone. Do not expose internal technical fields or DB IDs in the final text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ markdown: response.text });
  } catch (error: any) {
    console.error("Error generating briefing:", error);
    res.status(500).json({ error: error.message || "Failed to generate briefing using AI." });
  }
});

// Vite Middleware & SPA serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Live-Sync Architect server running on http://localhost:${PORT}`);
  });
}

setupServer();
