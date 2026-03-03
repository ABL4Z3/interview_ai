import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interviewStore';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { formatDate, getScoreColor, getScoreBgColor } from '../utils/formatters';

// CSS-only radar chart using clip-path polygon
function RadarChart({ categories }) {
  // categories: [{label, score}] — 5 items
  const padding = 40; // extra space for labels
  const chartSize = 200;
  const totalSize = chartSize + padding * 2;
  const center = totalSize / 2;
  const maxRadius = 75;
  const levels = [20, 40, 60, 80, 100];
  const angleStep = (2 * Math.PI) / categories.length;
  const startAngle = -Math.PI / 2; // Start from top

  const getPoint = (index, value) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 100) * maxRadius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const gridPolygons = levels.map((level) => {
    const points = categories.map((_, i) => {
      const p = getPoint(i, level);
      return `${p.x},${p.y}`;
    }).join(' ');
    return points;
  });

  const dataPoints = categories.map((c, i) => getPoint(i, c.score));
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${totalSize} ${totalSize}`} className="w-64 h-64" overflow="visible">
        {/* Grid lines */}
        {gridPolygons.map((points, i) => (
          <polygon key={i} points={points} fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="0.5" />
        ))}
        {/* Axis lines */}
        {categories.map((_, i) => {
          const p = getPoint(i, 100);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="0.5" />;
        })}
        {/* Data polygon */}
        <polygon points={dataPolygon} fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" />
        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
        ))}
        {/* Labels — placed further out with padding space */}
        {categories.map((c, i) => {
          const labelPoint = getPoint(i, 130);
          return (
            <text key={i} x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle"
              className="fill-gray-700 dark:fill-gray-300" fontSize="9" fontWeight="600">
              {c.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// Score bar component
function ScoreBar({ label, score, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
  };
  const barColor = score >= 80 ? colorMap.green : score >= 60 ? colorMap.blue : score >= 40 ? colorMap.yellow : colorMap.red;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
        <span className={`font-bold ${score >= 80 ? 'text-green-600 dark:text-green-400' : score >= 60 ? 'text-blue-600 dark:text-blue-400' : score >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
          {score}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div className={`${barColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function ResultsPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { currentInterview, getInterview, loading } = useInterviewStore();

  useEffect(() => {
    getInterview(interviewId);
  }, [interviewId]);

  // Calculate aggregate category scores
  const categoryAverages = useMemo(() => {
    if (!currentInterview?.questions?.length) return null;
    const evaluatedQuestions = currentInterview.questions.filter(q => q.aiEvaluation);
    if (!evaluatedQuestions.length) return null;

    // Check if category scores exist (new system)
    const hasCategories = evaluatedQuestions.some(q => q.aiEvaluation.technicalAccuracy !== undefined);
    if (!hasCategories) return null;

    const sum = { technicalAccuracy: 0, communicationClarity: 0, problemSolving: 0, depthOfKnowledge: 0, practicalExperience: 0 };
    let count = 0;

    evaluatedQuestions.forEach(q => {
      const e = q.aiEvaluation;
      if (e.technicalAccuracy !== undefined) {
        sum.technicalAccuracy += e.technicalAccuracy || 0;
        sum.communicationClarity += e.communicationClarity || 0;
        sum.problemSolving += e.problemSolving || 0;
        sum.depthOfKnowledge += e.depthOfKnowledge || 0;
        sum.practicalExperience += e.practicalExperience || 0;
        count++;
      }
    });

    if (count === 0) return null;

    return {
      technicalAccuracy: Math.round(sum.technicalAccuracy / count),
      communicationClarity: Math.round(sum.communicationClarity / count),
      problemSolving: Math.round(sum.problemSolving / count),
      depthOfKnowledge: Math.round(sum.depthOfKnowledge / count),
      practicalExperience: Math.round(sum.practicalExperience / count),
    };
  }, [currentInterview]);

  if (loading || !currentInterview) {
    return <Loading />;
  }

  const averageScore = currentInterview.overallScore || 0;
  const analysisType = currentInterview.analysisType || 'basic';
  const isPremium = analysisType === 'premium';
  const isDetailed = analysisType === 'detailed' || isPremium;

  const radarCategories = categoryAverages ? [
    { label: 'Technical', score: categoryAverages.technicalAccuracy },
    { label: 'Communication', score: categoryAverages.communicationClarity },
    { label: 'Problem Solving', score: categoryAverages.problemSolving },
    { label: 'Depth', score: categoryAverages.depthOfKnowledge },
    { label: 'Experience', score: categoryAverages.practicalExperience },
  ] : null;

  // Find strongest and weakest categories
  const strengths = categoryAverages ? Object.entries(categoryAverages)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim()) : [];

  const weaknesses = categoryAverages ? Object.entries(categoryAverages)
    .sort(([,a], [,b]) => a - b)
    .slice(0, 2)
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim()) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Interview Complete!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {currentInterview.interviewType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} — {currentInterview.difficultyLevel?.replace(/\b\w/g, l => l.toUpperCase())}
          </p>
          {isPremium && (
            <span className="inline-block mt-2 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-full">
              Premium Analysis
            </span>
          )}
          {isDetailed && !isPremium && (
            <span className="inline-block mt-2 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
              Detailed Analysis
            </span>
          )}
        </div>

        {/* Score + Radar */}
        <div className={`grid ${radarCategories ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8 mb-8`}>
          {/* Overall Score */}
          <Card className="text-center flex flex-col items-center justify-center">
            <div className={`inline-flex items-center justify-center w-36 h-36 rounded-full ${getScoreBgColor(averageScore)} mb-4`}>
              <span className={`text-5xl font-bold ${getScoreColor(averageScore)}`}>
                {averageScore}%
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Overall Score</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              {averageScore >= 80
                ? 'Excellent performance! 🎉'
                : averageScore >= 60
                ? 'Good effort! Keep practicing.'
                : 'Keep practicing to improve.'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {formatDate(currentInterview.createdAt)} • {currentInterview.questions?.length || 0} questions
            </p>
          </Card>

          {/* Radar Chart */}
          {radarCategories && (
            <Card className="flex flex-col items-center justify-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Skills Radar</h3>
              <RadarChart categories={radarCategories} />
            </Card>
          )}
        </div>

        {/* Category Score Bars */}
        {categoryAverages && (
          <Card className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Category Breakdown</h3>
            <div className="space-y-4">
              <ScoreBar label="Technical Accuracy" score={categoryAverages.technicalAccuracy} />
              <ScoreBar label="Communication Clarity" score={categoryAverages.communicationClarity} />
              <ScoreBar label="Problem Solving" score={categoryAverages.problemSolving} />
              <ScoreBar label="Depth of Knowledge" score={categoryAverages.depthOfKnowledge} />
              <ScoreBar label="Practical Experience" score={categoryAverages.practicalExperience} />
            </div>

            {/* Strengths & Weaknesses pills */}
            <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Top Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {strengths.map(s => (
                    <span key={s} className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium px-2.5 py-1 rounded-full capitalize">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2">Focus Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {weaknesses.map(w => (
                    <span key={w} className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs font-medium px-2.5 py-1 rounded-full capitalize">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* AI Summary */}
        <Card className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {isPremium ? 'Expert Analysis Report' : isDetailed ? 'Detailed Analysis' : 'AI Summary'}
            </h3>
          </div>
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {currentInterview.summary || 
              'Great job completing this interview! Review the feedback below to identify areas for improvement.'}
          </div>
        </Card>

        {/* Questions & Answers */}
        <Card className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Question-by-Question Breakdown</h3>
          <div className="space-y-8">
            {currentInterview.questions?.map((q, idx) => (
              <div key={idx} className={idx > 0 ? 'border-t border-gray-200 dark:border-gray-700 pt-8' : ''}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Question {idx + 1}</span>
                    {q.aiEvaluation?.estimatedLevel && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded">{q.aiEvaluation.estimatedLevel} level</span>
                    )}
                  </div>
                  {q.aiEvaluation?.score !== undefined && (
                    <span className={`text-xl font-bold ${getScoreColor(q.aiEvaluation.score)}`}>
                      {q.aiEvaluation.score}%
                    </span>
                  )}
                </div>
                <p className="text-gray-900 dark:text-white font-semibold mb-4">{q.questionText}</p>

                {q.candidateResponse && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wide">Your Answer</p>
                    <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{q.candidateResponse}</p>
                  </div>
                )}

                {q.aiEvaluation && (
                  <div className="space-y-4">
                    {/* Mini category bars for this question */}
                    {q.aiEvaluation.technicalAccuracy !== undefined && (
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { label: 'Tech', score: q.aiEvaluation.technicalAccuracy },
                          { label: 'Comm', score: q.aiEvaluation.communicationClarity },
                          { label: 'Problem', score: q.aiEvaluation.problemSolving },
                          { label: 'Depth', score: q.aiEvaluation.depthOfKnowledge },
                          { label: 'Exp', score: q.aiEvaluation.practicalExperience },
                        ].map(({ label, score }) => (
                          <div key={label} className="text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
                            <div className={`text-sm font-bold ${
                              score >= 80 ? 'text-green-600 dark:text-green-400' : 
                              score >= 60 ? 'text-blue-600 dark:text-blue-400' : 
                              score >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {score}
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                              <div className={`h-1 rounded-full ${
                                score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} style={{ width: `${score}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Feedback text */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1 uppercase tracking-wide">Feedback</p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{q.aiEvaluation.feedback}</p>
                    </div>

                    {/* Improvement tip (premium/detailed) */}
                    {q.aiEvaluation.improvementTip && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-100 dark:border-amber-800">
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mb-1">💡 Improvement Tip</p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{q.aiEvaluation.improvementTip}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <Card>
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
