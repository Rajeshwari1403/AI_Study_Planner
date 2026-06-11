import React, {useState, useEffect} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import quizService from '../../services/quizService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'

const QuizzesPage = () => {

  const { quizId } = useParams();
  const navigate = useNavigate();
  const [ quiz, setQuiz ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex ] = useState(0);
  const [ selectedAnswers, setSelectedAnswers ] = useState({});
  const [ submitting, setSubmitting ] = useState(false);

  useEffect(() => {
    // 1. Silent Guard: If React Router hasn't processed the URL parameters yet on frame 1, do nothing
    if (!quizId) return;
    
    // 2. Error Guard: If the URL literally spells out the text string 'undefined', stop safely
    if (quizId === 'undefined') {
      toast.error('Invalid Quiz ID');
      setLoading(false);
      return;
    }

    // 3. Define the structural API handler wrapper
    const fetchQuiz = async () => {
      try {
        console.log("Firing API call for Quiz ID:", quizId);
        const response = await quizService.getQuizById(quizId);
        console.log("Successfully fetched quiz response data:", response.data);
        
        setQuiz(response.data);
      } catch (error) {
        toast.error('Failed to fetch quiz');
        console.error("API error encountered:", error);
      } finally {
        setLoading(false); // ✅ Safe to drop loading flag here when processing finishes
      }
    };

    // 4. Force state to true ONCE right before executing our API call
    setLoading(true);
    fetchQuiz();
  }, [quizId]);

  const handleOptionChange = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if(quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = Object.keys(selectedAnswers).map(questionId => {
        const question = quiz.questions.find(q => q._id === questionId);
        const questionIndex = quiz.questions.findIndex(q => q._id === questionId);
        const optionIndex = selectedAnswers[questionId];
        const selectedAnswer = question.options[optionIndex];
        return { questionIndex, selectedAnswer };
      });

      await quizService.submitQuiz(quizId, formattedAnswers);
      toast.success('Quiz submitted successfully');
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      toast.error(error.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Spinner />
      </div>
    )
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <p className='text-slate-600 text-lg'>Quiz not found or has no questions.</p>
        </div>
      </div>
    );
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers.hasOwnProperty(currentQuestion._id);
  const answeredCount = Object.keys(selectedAnswers).length;
  return (
    <div className='max-w-4xl mx-auto'>
      <PageHeader title={quiz.title || 'Take Quiz'} />

      {/* Progress Bar */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-semibold text-slate-700'>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className='text-sm font-medium text-slate-500'>
            {answeredCount} answered
          </span>
        </div>
        <div className='relative h-2 bg-slate-100 rounded-full overflow-hidden'>
          <div 
            className='absolute inset-y-0 left-0 bg-linear-to-r from-[#8686AC] to-[#434161] rounded-full transition-all duration-500 ease-out' 
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }} 
          />
        </div>
      </div>

      {/* Question Card */}
      <div className='bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-6 mb-4'>
        <div className='inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#8686AC] to-[#434161] border border-slate-400 rounded-xl mb-6'>
          <div className='w-2 h-2 bg-slate-400 rounded-full animate-pulse' />
          <span className='text-sm font-semibold text-slate-100'>Question {currentQuestionIndex + 1}</span>
        </div>

        <h3 className='text-lg font-semibold text-slate-900 mb-6 leading-relaxed'>
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className='space-y-3'>
          {currentQuestion.options?.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion._id] === index;
            return (
              <label 
               key={index} 
               className={`group relative flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                isSelected 
                     ? 'border-emerald-500 bg-emerald-50/40 shadow-lg shadow-emerald-300/60' 
                     : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <input 
                   type="radio"
                   name={`question-${currentQuestion._id}`}
                   value={index}
                   checked={isSelected}
                   onChange={() => handleOptionChange(currentQuestion._id, index)}
                   className='sr-only'
                />

                {/* Custom Radio Button */}
                <div className={`shrink-0 w-5 h-5 rounded-full border-3 transition-all duration-200 flex items-center justify-center
                  ${ isSelected 
                      ? 'border-emerald-600 bg-white'
                      : 'border-slate-300 bg-white group-hover:border-slate-500'
                    }`}
                >
                  {isSelected && (
                    <div className='w-full h-full flex items-center justify-center'>
                    <div className='w-2 h-2 bg-emerald-600 rounded-full' />
                    </div>
                  )}
                </div>

                {/* Option Text */}
                <span className={`ml-4 text-sm font-medium transition-colors duration-200
                  ${ isSelected ? 'text-emerald-900' : 'text-slate-700 group-hover:text-slate-900'
                }`}>
                  {option}
                </span>

                {/* Selected Checkmark */}
                {isSelected && (
                  <CheckCircle2 className='ml-auto w-5 h-5 text-emerald-700' strokeWidth={2.5} />
                )}
                </label>
            );
          })}
        </div>
      </div>

      {/* Navigation Button */}
      <div className='flex items-center justify-between gap-4'>
        <Button 
           onClick={handlePreviousQuestion}
           disabled={currentQuestionIndex === 0 || submitting}
           variant='secondary'
           className='bg-slate-300 text-slate-700'
        >
          <ChevronLeft className='w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200' strokeWidth={2.5} />
          <span>Previous</span>
        </Button> 

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button 
             onClick={handleSubmitQuiz}
             disabled={submitting}
             className='group relative px-8 h-12 bg-linear-to-r from-black to-[#434161] hover:from-black hover:to-[#434161] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-slate-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 overflow-hidden'
          >
            <span className='relative z-10 flex items-center justify-center gap-2'>
              {submitting ? (
                <>
                  <div className='w-6 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className='w-4 h-4' strokeWidth={2.5} />
                  Submit Quiz
                </>
              )}
            </span>
            <div className='absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
          </button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={submitting}
            >
              Next
              <ChevronRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200' strokeWidth={2.5} />
            </Button>
          )}
      </div>

      {/* Question Navigation */}
      <div className='mt-0 flex items-center justify-center gap-2 flex-wrap'>
        {quiz.questions.map((_, index) => {
          const isAnsweredQuestion = selectedAnswers.hasOwnProperty(quiz.questions[index]._id)
          const isCurrent = index === currentQuestionIndex;

          return (
            <button
               key={index}
               onClick={() => setCurrentQuestionIndex(index)}
               disabled={submitting}
               className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all duration-200 ${
                isCurrent
                  ? 'bg-linear-to-r from-slate-300 to-slate-700 text-white shadow-lg shadow-slate-600 scale-110'
                  : isAnsweredQuestion
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
               }  disabled:opacity-50 disabled:cursor-not-allowed `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  )
}

export default QuizzesPage