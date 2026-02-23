import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interviewStore';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { formatDate, getScoreColor, getScoreBgColor } from '../utils/formatters';

export function ResultsPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { currentInterview, getInterview, loading } = useInterviewStore();

  useEffect(() => {
    getInterview(interviewId);
  }, [interviewId]);

  if (loading || !currentInterview) {
    return <Loading />;
  }

  const averageScore = currentInterview.overallScore || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Score Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Interview Complete!</h1>
          <p className="text-xl text-gray-600">Here's how you performed</p>
        </div>

        <Card className="mb-8 text-center">
          <div className={`inline-flex items-center justify-center w-40 h-40 rounded-full ${getScoreBgColor(averageScore)} mb-6`}>
            <span className={`text-6xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore}%
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Score</h2>
          <p className="text-gray-600 mb-4">
            {averageScore >= 80
              ? 'Excellent performance! 🎉'
              : averageScore >= 60
              ? 'Good effort! Keep practicing.'
              : 'Keep practicing to improve.'}
          </p>
          <p className="text-sm text-gray-500">
            Interview completed on {formatDate(currentInterview.createdAt)}
          </p>
        </Card>

        {/* Interview Details */}
        <Card className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Interview Details</h3>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-gray-600 text-sm mb-2">Type</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {currentInterview.interviewType}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-2">Difficulty</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {currentInterview.difficultyLevel}
              </p>
            </div>
          </div>

          {/* Questions & Answers */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Questions & Feedback</h4>
            <div className="space-y-6">
              {currentInterview.questions?.map((q, idx) => (
                <div key={idx} className="border-t pt-6">
                  <p className="text-gray-600 text-sm font-medium mb-2">Question {idx + 1}</p>
                  <p className="text-gray-900 font-semibold mb-3">{q.questionText}</p>

                  {q.candidateResponse && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-2">Your Answer:</p>
                      <p className="text-gray-800">{q.candidateResponse}</p>
                    </div>
                  )}

                  {q.aiEvaluation && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Feedback:</p>
                      <p className="text-gray-700 mb-3">{q.aiEvaluation.feedback}</p>

                      {q.aiEvaluation.score !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className={`text-lg font-bold ${getScoreColor(q.aiEvaluation.score)}`}>
                            {q.aiEvaluation.score}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Summary & Next Steps */}
        <Card className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">AI Summary</h3>
          <p className="text-gray-700 mb-6 whitespace-pre-line">
            {currentInterview.summary || 
              'Great job completing this interview! Review the feedback above to identify areas for improvement and consider scheduling another practice session.'}
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="primary"
              size="lg"
              className="flex-1"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              size="lg"
              className="flex-1"
            >
              Practice Again
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
