import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

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
    }

    Each question should have 4 options, one for each learning style.
    Questions should focus on learning preferences and study habits.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Gemini Assessment Generation Error:", error);
    throw error;
  }
};

export const analyzeLearningStyle = async (answers) => {
  try {
    const model = getGeminiModel();
    const prompt = `Analyze these learning style assessment answers:
    ${JSON.stringify(answers)}
    
    Calculate percentages for each style and determine the dominant one.
    Provide personalized recommendations.
    
    Return JSON with this structure:
    {
      "analysis": {
        "visual": number,
        "auditory": number,
        "reading": number,
        "kinesthetic": number,
        "dominantStyle": "string",
        "explanation": "string",
        "strategies": ["string"],
        "adaptations": "string"
      }
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};