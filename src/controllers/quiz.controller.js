const Quiz = require('../models/Quiz');
const StudyMaterial = require('../models/StudyMaterial');
const geminiService = require('../services/gemini.service');

// @desc    Generate a quiz based on study materials
// @route   POST /api/quiz
// @access  Private
exports.generateQuiz = async (req, res) => {
  try {
    const { title, description, materialIds, difficulty, questionCount } = req.body;
    
    if (!materialIds || !Array.isArray(materialIds) || materialIds.length === 0) {
      return res.status(400).json({ msg: 'At least one study material is required' });
    }
    
    // Get study materials
    const materials = await StudyMaterial.find({
      _id: { $in: materialIds },
      user: req.user.id
    });
    
    if (materials.length === 0) {
      return res.status(404).json({ msg: 'No valid study materials found' });
    }
    
    // Generate quiz using Gemini API
    const generatedQuiz = await geminiService.generateQuiz(
      materials,
      difficulty || 'medium',
      questionCount || 10
    );
    
    // Create questions from generated quiz
    const questions = generatedQuiz.questions.map(question => {
      return {
        text: question.text,
        type: question.type,
        options: question.options,
        correctAnswer: question.type === 'short-answer' ? question.correctAnswer : undefined,
        explanation: question.explanation,
        difficulty: question.difficulty,
        points: question.points
      };
    });
    
    // Create new quiz
    const newQuiz = new Quiz({
      user: req.user.id,
      title: title || generatedQuiz.title,
      description: description || generatedQuiz.description,
      materials: materialIds,
      questions,
      timeLimit: req.body.timeLimit || 30
    });
    
    // Save to database
    await newQuiz.save();
    
    res.json(newQuiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all user's quizzes
// @route   GET /api/quiz
// @access  Private
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user.id })
      .select('title description isSubmitted result.score result.percentage createdAt')
      .populate('materials', 'title')
      .sort({ createdAt: -1 });
    
    res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get a specific quiz
// @route   GET /api/quiz/:id
// @access  Private
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('materials', 'title description');
    
    // Check if quiz exists
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if user owns the quiz
    if (quiz.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // If quiz is not submitted, hide correct answers
    if (!quiz.isSubmitted) {
      const sanitizedQuiz = quiz.toObject();
      
      sanitizedQuiz.questions = sanitizedQuiz.questions.map(question => {
        // For multiple-choice and true-false, hide which option is correct
        if (question.options && question.options.length > 0) {
          question.options = question.options.map(option => {
            return {
              _id: option._id,
              text: option.text
            };
          });
        }
        
        // For short-answer, hide the correct answer
        if (question.correctAnswer) {
          delete question.correctAnswer;
        }
        
        // Hide explanation until after submission
        delete question.explanation;
        
        return question;
      });
      
      return res.json(sanitizedQuiz);
    }
    
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// @desc    Edit a quiz (before submission)
// @route   PUT /api/quiz/:id
// @access  Private
exports.editQuiz = async (req, res) => {
  try {
    const { title, description, timeLimit, questions } = req.body;
    
    const quiz = await Quiz.findById(req.params.id);
    
    // Check if quiz exists
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if user owns the quiz
    if (quiz.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Check if quiz has already been submitted
    if (quiz.isSubmitted) {
      return res.status(400).json({ msg: 'Cannot edit a submitted quiz' });
    }
    
    // Update fields
    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (timeLimit) quiz.timeLimit = timeLimit;
    
    // Update questions if provided
    if (questions && Array.isArray(questions)) {
      // Validate questions
      for (const question of questions) {
        if (!question.text) {
          return res.status(400).json({ msg: 'Question text is required' });
        }
        
        if (!question.type) {
          return res.status(400).json({ msg: 'Question type is required' });
        }
        
        if ((question.type === 'multiple-choice' || question.type === 'true-false') && 
            (!question.options || !Array.isArray(question.options) || question.options.length === 0)) {
          return res.status(400).json({ msg: 'Options are required for multiple-choice and true-false questions' });
        }
        
        if (question.type === 'short-answer' && !question.correctAnswer) {
          return res.status(400).json({ msg: 'Correct answer is required for short-answer questions' });
        }
      }
      
      quiz.questions = questions;
    }
    
    // Save changes
    await quiz.save();
    
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quiz/:id
// @access  Private
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    // Check if quiz exists
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if user owns the quiz
    if (quiz.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Delete from database
    await quiz.deleteOne();
    
    res.json({ msg: 'Quiz removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// @desc    Submit quiz answers for grading
// @route   POST /api/quiz/:id/submit
// @access  Private
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ msg: 'Answers are required' });
    }
    
    const quiz = await Quiz.findById(req.params.id);
    
    // Check if quiz exists
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if user owns the quiz
    if (quiz.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Check if quiz has already been submitted
    if (quiz.isSubmitted) {
      return res.status(400).json({ msg: 'Quiz has already been submitted' });
    }
    
    // Check if number of answers matches number of questions
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ msg: 'Number of answers does not match number of questions' });
    }
    
    // Grade the quiz
    let score = 0;
    const gradedAnswers = [];
    
    // Process multiple-choice and true-false questions
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const answer = answers[i];
      
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        // Find the selected option
        const selectedOption = question.options.find(option => option._id.toString() === answer);
        
        if (selectedOption) {
          const isCorrect = selectedOption.isCorrect;
          const points = isCorrect ? question.points : 0;
          
          gradedAnswers.push({
            question: question._id,
            selectedOption: selectedOption._id,
            isCorrect,
            points
          });
          
          score += points;
        } else {
          gradedAnswers.push({
            question: question._id,
            selectedOption: null,
            isCorrect: false,
            points: 0
          });
        }
      } else if (question.type === 'short-answer') {
        // For short-answer questions, we'll use Gemini API to grade them
        gradedAnswers.push({
          question: question._id,
          textAnswer: answer,
          isCorrect: false, // Will be updated after grading
          points: 0 // Will be updated after grading
        });
      }
    }
    
    // Grade short-answer questions using Gemini API
    const shortAnswerQuestions = quiz.questions.filter(q => q.type === 'short-answer');
    if (shortAnswerQuestions.length > 0) {
      const shortAnswerIndices = quiz.questions.map((q, index) => q.type === 'short-answer' ? index : -1).filter(i => i !== -1);
      const shortAnswers = shortAnswerIndices.map(index => answers[index]);
      
      const gradingResults = await geminiService.gradeShortAnswerQuestions(shortAnswerQuestions, shortAnswers);
      
      // Update graded answers with results
      for (let i = 0; i < gradingResults.length; i++) {
        const questionIndex = shortAnswerIndices[i];
        const result = gradingResults[i];
        
        gradedAnswers[questionIndex].isCorrect = result.isCorrect;
        gradedAnswers[questionIndex].points = result.points;
        
        score += result.points;
      }
    }
    
    // Calculate percentage
    const percentage = Math.round((score / quiz.totalPoints) * 100);
    
    // Create quiz result
    quiz.result = {
      answers: gradedAnswers,
      score,
      percentage,
      completedAt: Date.now()
    };
    
    quiz.isSubmitted = true;
    
    // Save changes
    await quiz.save();
    
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// @desc    Get all quiz results
// @route   GET /api/quiz/results
// @access  Private
exports.getQuizResults = async (req, res) => {
  try {
    const quizResults = await Quiz.find({
      user: req.user.id,
      isSubmitted: true
    })
      .select('title description result.score result.percentage result.completedAt totalPoints')
      .populate('materials', 'title')
      .sort({ 'result.completedAt': -1 });
    
    res.json(quizResults);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Predict exam grade based on quiz results
// @route   GET /api/quiz/predict
// @access  Private
exports.predictGrade = async (req, res) => {
  try {
    // Get user's quiz results
    const quizResults = await Quiz.find({
      user: req.user.id,
      isSubmitted: true
    }).select('title totalPoints result.score result.percentage result.completedAt');
    
    if (quizResults.length === 0) {
      return res.status(400).json({ msg: 'No quiz results found. Complete some quizzes first.' });
    }
    
    if (quizResults.length < 2) {
      return res.status(400).json({ msg: 'Not enough quiz results. Complete at least 2 quizzes for prediction.' });
    }
    
    // Get prediction from Gemini API
    const prediction = await geminiService.predictExamGrade(quizResults);
    
    res.json(prediction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};