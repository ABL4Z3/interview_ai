import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { InterviewRoomPage } from './pages/InterviewRoomPage';
import { LiveInterviewPage } from './pages/LiveInterviewPage';
import { ResultsPage } from './pages/ResultsPage';
import { PricingPage } from './pages/PricingPage';

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const { token, currentUser, getMe } = useAuthStore();

  useEffect(() => {
    if (token && !currentUser) {
      getMe();
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/interview/:interviewId"
          element={
            <PrivateRoute>
              <InterviewRoomPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/live-interview/:interviewId"
          element={
            <PrivateRoute>
              <LiveInterviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/results/:interviewId"
          element={
            <PrivateRoute>
              <ResultsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
