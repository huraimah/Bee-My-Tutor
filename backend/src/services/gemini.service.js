const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the Gemini Pro model
const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-pro' });
};

// Generate learning style assessment
const generateLearningStyleAssessment = async () => {
  const model = getGeminiModel();
  
  const prompt = `
    Create a learning style assessment with 20 multiple-choice questions to determine a student's learning style.
    The assessment should evaluate four learning styles: Visual, Auditory, Reading/Writing, and Kinesthetic.
    Each question should have 4 options, one for each learning style.
    Format the response as a JSON object with the following structure:
    {
      "title": "Learning Style Assessment",
      "description": "This assessment will help identify your preferred learning style.",
      "questions": [
        {
          "id": 1,
          "text": "Question text here",
          "options": [
            { "id": "a", "text": "Option text", "style": "visual" },
            { "id": "b", "text": "Option text", "style": "auditory" },
            { "id": "c", "text": "Option text", "style": "reading" },
            { "id": "d", "text": "Option text", "style": "kinesthetic" }
          ]
        }
      ]
    }
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Extract JSON from the response
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/) || [null, text];
  const jsonString = jsonMatch[1];
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON from Gemini response:', error);
    throw new Error('Failed to generate learning style assessment');
  }
};

// Analyze learning style based on assessment results
const analyzeLearningStyle = async (answers) => {
  const model = getGeminiModel();
  
  const counts = {
    visual: 0,
    auditory: 0,
    reading: 0,
    kinesthetic: 0
  };
  
  // Count the number of answers for each style
  answers.forEach(answer => {
    counts[answer.style]++;
  });
  
  const prompt = `
    Based on a learning style assessment, a student has the following scores:
    Visual: ${counts.visual}
    Auditory: ${counts.auditory}
    Reading/Writing: ${counts.reading}
    Kinesthetic: ${counts.kinesthetic}
    
    Analyze these results and provide:
    1. The dominant learning style
    2. A detailed explanation of what this learning style means
    3. 5 specific study strategies tailored to this learning style
    4. How to adapt other learning materials to better suit this style
    
    Format the response as a JSON object with the following structure:
    {
      "dominantStyle": "style name",
      "explanation": "detailed explanation",
      "strategies": ["strategy 1", "strategy 2", "strategy 3", "strategy 4", "strategy 5"],
      "adaptations": "how to adapt other materials"
    }
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Extract JSON from the response
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/) || [null, text];
  const jsonString = jsonMatch[1];
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON from Gemini response:', error);
    throw new Error('Failed to analyze learning style');
  }
};

// Generate a study plan based on materials and deadline
const generateStudyPlan = async (materials, examDate, learningStyle) => {
  const model = getGeminiModel();
  
  // Calculate days until exam
  const today = new Date();
  const exam = new Date(examDate);
  const daysUntilExam = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
  
  // Prepare materials summary
  const materialsSummary = materials.map(material => {
    return `
      Title: ${material.title}
      Description: ${material.description || 'N/A'}
      Subject: ${material.subject || 'N/A'}
      Key Points: ${material.keyPoints ? material.keyPoints.join(', ') : 'N/A'}
    `;
  }).join('\n');
  
  const prompt = `
    Create a comprehensive study plan for a student preparing for an exam in ${daysUntilExam} days.
    The student's dominant learning style is: ${learningStyle.dominantStyle}.
    
    Study Materials:
    ${materialsSummary}
    
    Create a day-by-day study plan that:
    1. Breaks down the material into manageable sessions
    2. Incorporates the student's learning style (${learningStyle.dominantStyle})
    3. Includes variety of activities (reading, practice, review, breaks)
    4. Gradually increases intensity as the exam approaches
    5. Includes regular review sessions and practice tests
    
    Format the response as a JSON object with the following structure:
    {
      "title": "Study Plan for [Exam Name]",
      "description": "A personalized study plan based on your learning style and materials",
      "sessions": [
        {
          "day": 1,
          "date": "YYYY-MM-DD",
          "title": "Session title",
          "description": "Session description",
          "duration": 120,
          "materials": [
            {
              "title": "Material title",
              "pages": "Pages to study",
              "sections": "Sections to focus on"
            }
          ],
          "activities": [
            {
              "type": "read",
              "description": "Activity description",
              "duration": 30
            }
          ]
        }
      ]
    }
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Extract JSON from the response
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/) || [null, text];
  const jsonString = jsonMatch[1];
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON from Gemini response:', error);
    throw new Error('Failed to generate study plan');
  }
};

// Generate a quiz based on study materials
const generateQuiz = async (materials, difficulty = 'medium', questionCount = 10) => {
  const model = getGeminiModel();
  
  // Prepare materials content
  const materialsContent = materials.map(material => {
    return `
      Title: ${material.title}
      Content: ${material.content.substring(0, 2000)}... (truncated)
      Key Points: ${material.keyPoints ? material.keyPoints.join(', ') : 'N/A'}
    `;
  }).join('\n');
  
  const prompt = `
    Create a quiz with ${questionCount} questions based on the following study materials.
    The quiz should be at ${difficulty} difficulty level.
    Include a mix of multiple-choice, true-false, and short-answer questions.
    
    Study Materials:
    ${materialsContent}
    
    Format the response as a JSON object with the following structure:
    {
      "title": "Quiz on [Subject]",
      "description": "Test your knowledge on [Subject]",
      "questions": [
        {
          "text": "Question text",
          "type": "multiple-choice",
          "options": [
            { "text": "Option A", "isCorrect": false },
            { "text": "Option B", "isCorrect": true },
            { "text": "Option C", "isCorrect": false },
            { "text": "Option D", "isCorrect": false }
          ],
          "explanation": "Explanation of the correct answer",
          "difficulty": "medium",
          "points": 1
        }
      ]
    }
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Extract JSON from the response
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/) || [null, text];
  const jsonString = jsonMatch[1];
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON from Gemini response:', error);
    throw new Error('Failed to generate quiz');
  }
};

// Grade a quiz with short-answer questions
const gradeShortAnswerQuestions = async (questions, answers) => {
  const model = getGeminiModel();
  
  const gradingPromises = questions.map(async (question, index) => {
    if (question.type !== 'short-answer') {
      return null; // Skip non-short-answer questions
    }
    
    const userAnswer = answers[index];
    
    const prompt = `
      Grade this short answer question response:
      
      Question: ${question.text}
      Correct Answer: ${question.correctAnswer}
      Student's Answer: ${userAnswer}
      
      Evaluate the student's answer and provide:
      1. Whether the answer is correct (true/false)
      2. A score from 0 to ${question.points} points
      3. Feedback explaining the evaluation
      
      Format the response as a JSON object:
      {
        "isCorrect": true/false,
        "points": number,
        "feedback": "feedback text"
      }
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/) || [null, text];
    const jsonString = jsonMatch[1];
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON from Gemini response:', error);
      return {
        isCorrect: false,
        points: 0,
        feedback: 'Error grading answer'
      };
    }
  });
  
  const results = await Promise.all(gradingPromises);
  return results.filter(result => result !== null);
};

// Predict exam grade based on quiz results
const predictExamGrade = async (quizResults, examTotalPoints = 100) => {
  const model = getGeminiModel();
  
  // Format quiz results
  const formattedResults = quizResults.map(result => {
    return `
      Quiz: ${result.title}
      Score: ${result.score}/${result.totalPoints} (${result.percentage}%)
      Date: ${new Date(result.completedAt).toISOString().split('T')[0]}
    `;
  }).join('\n');
  
  const prompt = `
    Based on the following quiz results, predict a student's performance on an upcoming exam worth ${examTotalPoints} points.
    
    Quiz Results:
    ${formattedResults}
    
    Analyze these results and provide:
    1. A predicted score for the exam (out of ${examTotalPoints})
    2. A predicted letter grade (A, B, C, D, F)
    3. A confidence level for this prediction (low, medium, high)
    4. Areas of strength based on the quiz results
    5. Areas that need improvement
    6. Specific recommendations to improve the predicted grade
    
    Format the response as a JSON object with the following structure:
    {
      "predictedScore": number,
      "predictedPercentage": number,
      "predictedGrade": "letter grade",
      "confidence": "confidence level",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
    }
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Extract JSON from the response
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/) || [null, text];
  const jsonString = jsonMatch[1];
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON from Gemini response:', error);
    throw new Error('Failed to predict exam grade');
  }
};

// Extract content from study materials
const extractContentFromMaterial = async (text, fileType) => {
  const model = getGeminiModel();
  
  const prompt = `
    Analyze this ${fileType} content and extract:
    1. A concise summary (max 200 words)
    2. 5-10 key points or important concepts
    3. Relevant tags or keywords
    4. The subject area
    5. The difficulty level (beginner, intermediate, advanced)
    
    Content:
    ${text.substring(0, 10000)}... (truncated)
    
    Format the response as a JSON object with the following structure:
    {
      "summary": "concise summary",
      "keyPoints": ["key point 1", "key point 2", ...],
      "tags": ["tag1", "tag2", ...],
      "subject": "subject area",
      "difficulty": "difficulty level"
    }
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text2 = response.text();
  
  // Extract JSON from the response
  const jsonMatch = text2.match(/```json\n([\s\S]*?)\n```/) || text2.match(/```([\s\S]*?)```/) || [null, text2];
  const jsonString = jsonMatch[1];
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON from Gemini response:', error);
    throw new Error('Failed to extract content from material');
  }
};

module.exports = {
  generateLearningStyleAssessment,
  analyzeLearningStyle,
  generateStudyPlan,
  generateQuiz,
  gradeShortAnswerQuestions,
  predictExamGrade,
  extractContentFromMaterial
};