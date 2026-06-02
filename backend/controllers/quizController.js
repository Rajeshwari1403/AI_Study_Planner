import quiz from '../models/quiz.js';

// @desc  Get quizzes for a document
// @route GET /api/quizzes/:documentId
// @access Private
export const getQuizzes = async (req, res, next) => {
  try {
    const  quizzes = await quiz.find({ 
      userId: req.user._id,
      document: req.params.documentId 
    })
    .populate('document', 'title filename')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get quiz by ID
// @route GET /api/quizzes/quiz/:id
// @access Private
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await quiz.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Submit quiz answers
// @route POST /api/quizzes/:id/submit
// @access Private
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if(!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers must be an array',
        statusCode: 400
      });
    }

    const quiz = await quiz.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        statusCode: 404
      });
    }

    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: 'Quiz has already been submitted',
        statusCode: 400
      });
    }

    // Process answers and calculate score
    let correctCount = 0;
    const userAnswers = [];

    answers.forEach(answer => {
      const { questionIndex, selectedAnswer } = answer;

      if (questionIndex < quiz.questions.length) {
        const question = quiz.questions[questionIndex];
        const isCorrect = selectedAnswer === question.correctAnswer;

        if (isCorrect)  correctCount++;

        userAnswers.push({
          questionIndex,
          selectedAnswer,
          isCorrect,
          answeredAt: new Date()
         });
        }
    });

    // Calculate score as percentage
    const score = Math.round((correctCount / quiz.totalQuestions) * 100);

    // Update quiz with results
    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = new Date();

    await quiz.save();

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        score,
        correctCount,
        totalQuestions: quiz.totalQuestions,
        percentage: score,
        userAnswers
      },
      message: 'Quiz submitted successfully'
    });
  } catch (error) {
    next(error);
  } 
};

// @desc  Get quiz results
// @route GET /api/quizzes/:id/results
// @access Private
export const getQuizResults = async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
};

// @desc  Delete quiz
// @route DELETE /api/quizzes/:id
// @access Private
export const deleteQuiz = async (req, res, next) => {
  try {

  } catch (error) {
    next(error);    
  }
};