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

export const generateQuizFromContent = async (content, params) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Create a quiz based on the following content. The quiz should:
      - Have ${params.questionCount || 5} multiple choice questions
      - Include 4 options for each question
      - Provide explanations for correct answers
      - Focus on key concepts and understanding
      - Be at ${params.difficulty} difficulty level
      
      Content: ${content}
      
      Return the quiz in the following JSON format:
      {
        "questions": [
          {
            "text": "question text",
            "options": ["option1", "option2", "option3", "option4"],
            "correctAnswer": "correct option",
            "explanation": "explanation for the answer"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};