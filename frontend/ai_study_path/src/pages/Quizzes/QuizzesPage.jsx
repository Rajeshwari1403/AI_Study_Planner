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

    console.log("quizId:", quizId);
    console.log(quizId.length);
    
    if (!quizId || quizId === 'undefined') {
      toast.error('Invalid Quiz ID');
      setLoading(false);
      return;
    }

    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);

        setQuiz(response.data);
      } catch (error) {
        toast.error('Failed to fetch quiz');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

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
        <div className=''>
          <div className='' />
          <span className=''>Question {currentQuestionIndex + 1}</span>
        </div>

        <h3 className=''>
          {currentQuestion.question}
        </h3>


      </div>
    </div>
  )
}

export default QuizzesPage