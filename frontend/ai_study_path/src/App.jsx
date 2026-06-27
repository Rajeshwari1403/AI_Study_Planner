import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Auth/LoginPage.jsx'
import RegisterPage from './pages/Auth/RegisterPage.jsx'
import NotFoundpage from './pages/NotFoundPage'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import DashboardPage from './pages/DashBoard/DashBoardPage.jsx'
import DocumentListPage from './pages/Documents/DocumentListPage.jsx'
import DocumentDetailPage from './pages/Documents/DocumentsDetailsPage.jsx'
import FlashcardListPage from './pages/Flashcard/FlashCardListPage.jsx'
import FlashCardPage from './pages/Flashcard/FlashCardPage.jsx'
import QuizzesPage from './pages/Quizzes/QuizzesPage.jsx'
import QuizResultsPage from './pages/Quizzes/QuizResultPage.jsx'
import ProfilePage from './pages/Profile/ProfilePage.jsx'
import { useAuth } from './context/AuthContext.jsx'

const App = () => {
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    const originalTitle = "StudyPilot AI";

    const messages = [
      "👀 Hey! Come Back!",
      "📚 Your Notes Miss You!",
      "🧠 Your AI is Waiting...",
      "🚀 Continue Your Learning!"
    ];

    let interval;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        let index = 0;
        document.title = messages[index];

        interval = setInterval(() => {
          index = (index + 1) % messages.length;
          document.title = messages[index];
        }, 1500);
      } else {
        clearInterval(interval);
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
           path="/"
           element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/flashcards" element={<FlashcardListPage />} />
          <Route path="/documents/:id/flashcards" element={<FlashCardPage />} />
          <Route path="/quizzes/:quizId" element={<QuizzesPage />} />
          <Route path="/quizzes/:quizId/results" element={<QuizResultsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundpage />} />
      </Routes>
    </Router>
  )
}

export default App