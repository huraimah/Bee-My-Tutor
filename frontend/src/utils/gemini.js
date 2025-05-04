import { GoogleGenerativeAI } from "@google/generative-ai";

// Make sure you have the API key in your .env file
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateLearningStyleAssessment = async () => {
  try {
    const model = getGeminiModel();
    const prompt = `Create a learning style assessment with 10 multiple choice questions to determine if someone is a Visual, Auditory, Reading/Writing, or Kinesthetic learner.

    Format the response as a JSON object with this structure:
    {
      "questions": [
        {
          "id": number,
          "text": "question text",
          "options": [
            {
              "id": "unique_id",
              "text": "option text",
              "style": "visual|auditory|reading|kinesthetic"
            }
          ]
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Learning Style Assessment Generation Error:", error);
    throw error;
  }
};

export const analyzeLearningStyle = async (answers) => {
  try {
    const model = getGeminiModel();
    const prompt = `Analyze these learning style assessment answers: ${JSON.stringify(answers)}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Learning Style Analysis Error:", error);
    throw error;
  }
};

export const generateQuizFromContent = async (content, params) => {
  try {
    // Use gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

    const prompt = `
      Create a multiple choice quiz based on this content:
      ${content}

      Requirements:
      - Generate exactly ${params.questionCount} questions
      - Each question must have 4 options labeled A through D
      - Include explanation for each correct answer
      - Match this difficulty level: ${params.difficulty}

      Return ONLY a JSON object in this exact format:
      {
        "questions": [
          {
            "text": "Question text",
            "options": ["A) First", "B) Second", "C) Third", "D) Fourth"],
            "correctAnswer": "A) First",
            "explanation": "Explanation text"
          }
        ]
      }`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse and validate response
    const parsedResponse = JSON.parse(text);
    return parsedResponse;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message);
  }
};