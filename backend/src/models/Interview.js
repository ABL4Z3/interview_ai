// Interview model
import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Interview metadata
    title: String,
    description: String,
    interviewType: {
      type: String,
      enum: ['frontend', 'backend', 'fullstack', 'devops', 'data-science', 'ai_ml_engineer', 'gen_ai_engineer', 'mlops_engineer', 'data_engineer', 'data_scientist'],
      default: 'fullstack',
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    
    // Interview status
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'cancelled'],
      default: 'not_started',
    },
    startedAt: Date,
    completedAt: Date,
    
    // Interview content
    questions: [
      {
        questionNumber: Number,
        questionText: String,
        generatedAt: Date,
        candidateResponse: String,
        responseReceivedAt: Date,
        aiEvaluation: {
          score: Number, // 0-100
          feedback: String,
          followUpQuestion: String,
        },
      },
    ],
    
    // Interview results
    totalQuestions: {
      type: Number,
      default: 0,
    },
    questionsAnswered: {
      type: Number,
      default: 0,
    },
    overallScore: Number,
    summary: String,
    
    // Audio & transcription
    audioRecordings: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        audioUrl: String,
        transcript: String,
      },
    ],
    
    // Payment & billing
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentId: String,
    amountPaid: Number,

    // Live interview (LiveKit)
    isLiveInterview: {
      type: Boolean,
      default: false,
    },
    liveTranscript: [
      {
        role: String,
        text: String,
        timestamp: Number,
      },
    ],
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

interviewSchema.index({ userId: 1, createdAt: -1 });

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
