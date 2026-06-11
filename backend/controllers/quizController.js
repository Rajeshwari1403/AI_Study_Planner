import Quiz from '../models/quiz.js';

// @desc  Get quizzes for a document
// @route GET /api/quizzes/:documentId
// @access Private
{/*export const getQuizzes = async (req, res, next) => {
  try {
    const  quizzes = await Quiz.find({ 
      userId: req.user._id,
      documentId: req.params.documentId 
    })
    .populate('documentId', 'title filename')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};*/}

export const getQuizzes = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    // ✅ Stop the execution if the ID is invalid before Mongoose runs its query
    if (!documentId || documentId === 'undefined') {
      return res.status(400).json({
        success: false,
        error: 'A valid Document ID parameter is required',
        statusCode: 400
      });
    }

    const quizzes = await Quiz.find({ 
      userId: req.user._id,
      documentId: documentId 
    })
    .populate('documentId', 'title filename')
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
    const quiz = await Quiz.findOne({
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
// @desc   Submit quiz answers
// @route  POST /api/quizzes/:id/submit
// @access Private
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers must be an array',
        statusCode: 400
      });
    }

    const quiz = await Quiz.findOne({
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

    let correctCount = 0;
    const userAnswers = [];

    quiz.questions.forEach((question, index) => {
      const submittedAnswer = answers.find(a => Number(a.questionIndex) === index);
      
      let isCorrect = false;
      let selectedAnswerText = 'Not Answered';

      if (submittedAnswer && submittedAnswer.selectedAnswer !== undefined) {
        selectedAnswerText = String(submittedAnswer.selectedAnswer).trim();

        const normSelectedText = selectedAnswerText.toLowerCase();
        const normDbCorrect = String(question.correctAnswer || '').trim().toLowerCase();

        // Strip structural prefixes (like "01.", "1.", "3. ")
        const cleanDbCorrect = normDbCorrect.replace(/^0*(\d+)\.?\s*/, '$1').replace(/^\w\.\s*/, '');
        const cleanSelectedText = normSelectedText.replace(/^0*(\d+)\.?\s*/, '$1').replace(/^\w\.\s*/, '');

        // Resolve absolute index mapping variants safely
        const rawZeroBasedIdx = question.options ? question.options.findIndex(opt => opt.trim() === selectedAnswerText) : -1;
        const stringZeroIndex = String(rawZeroBasedIdx);
        const stringOneIndex = String(rawZeroBasedIdx + 1);

        // ✅ MULTI-BASE LOGICAL EVALUATION BLOCK
        if (
          normSelectedText === normDbCorrect ||                           // Direct raw string match
          cleanSelectedText === cleanDbCorrect ||                         // Cleaned string match
          normSelectedText.includes(cleanDbCorrect) ||                    // Sub-string contains check
          normDbCorrect.includes(normSelectedText) ||                    // Counter sub-string contains check
          stringZeroIndex === normDbCorrect ||                            // Zero-based index match ("2" === "2")
          stringOneIndex === normDbCorrect ||                             // One-based index match ("3" === "3")
          stringZeroIndex === cleanDbCorrect ||                           // Cleaned zero-based index match
          stringOneIndex === cleanDbCorrect                               // Cleaned one-based index match
        ) {
          isCorrect = true;
        }
      }

      if (isCorrect) correctCount++;

      userAnswers.push({
        questionIndex: index,
        selectedAnswer: selectedAnswerText,
        isCorrect: Boolean(isCorrect),
        answeredAt: new Date()
      });
    });

    const totalQuizQuestions = quiz.questions.length || quiz.totalQuestions || 1;
    const score = Math.round((correctCount / totalQuizQuestions) * 100);

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
        totalQuestions: totalQuizQuestions,
        percentage: score,
        userAnswers
      },
      message: 'Quiz submitted successfully'
    });
  } catch (error) {
    console.error("Submission processing crashed:", error);
    next(error);
  }
};

// @desc  Get quiz results
// @route GET /api/quizzes/:id/results
// @access Private
export const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('documentId', 'title');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        statusCode: 404
      });
    }

    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: 'Quiz has not been submitted yet',
        statusCode: 400
      });
    }

    // Build detailed results
    const detailedResults = quiz.questions.map((question, index) => {
      const userAnswer = quiz.userAnswers.find(a => a.questionIndex === index);

      return {
        questionIndex: index,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer: userAnswer ?.selectedAnswer || null,
        isCorrect: userAnswer ?.isCorrect || false,
        explanation: question.explanation
      };
    });

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          document: quiz.documentId,
          score: quiz.score,
          totalQuestions: quiz.totalQuestions,
          completedAt: quiz.completedAt
        },
        results: detailedResults
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete quiz
// @route DELETE /api/quizzes/:id
// @access Private
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
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

    await quiz.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    next(error);    
  }
};