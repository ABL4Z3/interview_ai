import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useInterviewStore } from '../store/interviewStore';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { formatDate } from '../utils/formatters';

export function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser, getMe } = useAuthStore();
  const { interviewHistory, getHistory, loading } = useInterviewStore();
  const [selectedType, setSelectedType] = useState('frontend');
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    getMe();
    getHistory();
  }, []);

  const handleStartInterview = async () => {
    if (currentUser?.interviewsRemaining <= 0) {
      alert('You have no interviews remaining. Please upgrade your plan.');
      return;
    }

    setIsStarting(true);
    try {
      const response = await useInterviewStore.getState().startLiveInterview(selectedType, selectedLevel);
      navigate(`/live-interview/${response.interviewId}`, {
        state: {
          livekitUrl: response.livekitUrl,
          livekitToken: response.token,
          interviewType: selectedType,
          difficultyLevel: selectedLevel,
        },
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to start interview');
      setIsStarting(false);
    }
  };

  if (loading || !currentUser) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {currentUser.name}!
          </h1>
          <p className="text-xl text-gray-600">
            Ready to ace your next technical interview? Let's practice with IntervuAI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Start Interview Section */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Start New Interview</h2>

              <div className="space-y-6">
                {/* Interview Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Interview Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['frontend', 'backend', 'fullstack', 'devops'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`p-4 rounded-lg border-2 font-semibold capitalize transition ${
                          selectedType === type
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`p-4 rounded-lg border-2 font-semibold capitalize transition ${
                          selectedLevel === level
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={handleStartInterview}
                  disabled={isStarting || currentUser.interviewsRemaining <= 0}
                  className="w-full text-lg py-3"
                  size="lg"
                >
                  {isStarting ? 'Starting...' : 'Start Interview'}
                </Button>

                {currentUser.interviewsRemaining <= 0 && (
                  <div className="text-center space-y-3">
                    <p className="text-red-600 font-semibold">
                      No interviews remaining. Upgrade your plan to continue.
                    </p>
                    <Button
                      onClick={() => navigate('/pricing')}
                      variant="secondary"
                      size="md"
                    >
                      View Plans & Upgrade
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Interviews Remaining</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {currentUser.interviewsRemaining}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Interviews</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {interviewHistory.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Interviews */}
        {interviewHistory.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Interviews</h2>
            <div className="space-y-4">
              {interviewHistory.slice(0, 5).map((interview) => (
                <Card
                  key={interview._id}
                  className="cursor-pointer hover:shadow-lg transition"
                  onClick={() => navigate(`/results/${interview._id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">
                        {interview.interviewType} - {interview.difficultyLevel}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(interview.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      {interview.overallScore && (
                        <>
                          <p className="text-2xl font-bold text-blue-600">
                            {interview.overallScore}%
                          </p>
                          <p className="text-sm text-gray-600">Score</p>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
