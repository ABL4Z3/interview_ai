// Cerebras Service - Phase 1 (Using gpt-oss-120b instead of GPT-4o-mini)
import env from '../config/env.js';
import { ApiError } from '../utils/apiResponse.js';

// Cerebras API endpoint
const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';

/**
 * Call Cerebras API for interview questions
 */
async function callCerebras(messages, maxTokens = 200) {
  try {
    const response = await fetch(CEREBRAS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-oss-120b',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cerebras API Error:', errorData);
      throw new Error(`Cerebras API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Cerebras API Call Error:', error);
    throw error;
  }
}

/**
 * Mock interview questions for different types and levels
 */
const mockQuestions = {
  frontend: {
    beginner: [
      "Explain the difference between let, const, and var in JavaScript.",
      "What is the purpose of CSS flexbox and how do you use it?",
      "How does event delegation work in JavaScript?",
    ],
    intermediate: [
      "Describe how React's virtual DOM works and why it exists for performance optimization.",
      "What are closures in JavaScript and can you provide a practical example?",
      "Explain the difference between call, apply, and bind methods in JavaScript.",
    ],
    advanced: [
      "How would you implement a custom React hook for managing complex state logic?",
      "Explain the concept of memoization and how React.memo differs from useMemo.",
      "Describe the differences between controlled and uncontrolled components in React.",
    ],
  },
  backend: {
    beginner: [
      "What is the difference between SQL and NoSQL databases?",
      "Explain the concept of RESTful API and its main principles.",
      "What are middleware functions and how do they work in Express.js?",
    ],
    intermediate: [
      "How would you handle authentication in a Node.js application?",
      "Explain the concept of database indexing and when you should use it.",
      "What is the difference between SQL joins (INNER, LEFT, RIGHT)?",
    ],
    advanced: [
      "Design a scalable architecture for handling 1 million concurrent users.",
      "Explain how you would implement database replication and sharding.",
      "How would you optimize a slow database query with millions of records?",
    ],
  },
  fullstack: {
    beginner: [
      "Explain the client-server architecture and how data flows between them.",
      "What is the purpose of APIs and how do they enable communication?",
      "Describe the basic flow of an HTTP request and response cycle.",
    ],
    intermediate: [
      "How would you secure sensitive data like passwords and API keys in a web application?",
      "Explain the concept of JWT (JSON Web Tokens) and how authentication flows work.",
      "What are the main differences between session-based and token-based authentication?",
    ],
    advanced: [
      "Design a real-time notification system for millions of users across multiple services.",
      "How would you implement end-to-end encryption in a messaging application?",
      "Explain how you would handle distributed transactions across microservices.",
    ],
  },
  devops: {
    beginner: [
      "What is containerization and why is Docker useful?",
      "Explain the difference between CI/CD pipelines and their importance.",
      "What is the purpose of configuration management tools?",
    ],
    intermediate: [
      "How would you set up a Kubernetes cluster and manage deployments?",
      "Explain Infrastructure as Code and its benefits.",
      "What strategies would you use for blue-green or canary deployments?",
    ],
    advanced: [
      "Design a highly available and scalable infrastructure for a SaaS application.",
      "How would you implement disaster recovery and backup strategies?",
      "Explain how you would monitor and observe a distributed system.",
    ],
  },
  'data-science': {
    beginner: [
      "Explain the difference between supervised and unsupervised learning.",
      "What is a confusion matrix and how do you interpret it?",
      "Describe the process of data preprocessing and why it's important.",
    ],
    intermediate: [
      "How would you handle imbalanced datasets in machine learning?",
      "Explain cross-validation and why it's important for model evaluation.",
      "What techniques would you use to reduce overfitting in a model?",
    ],
    advanced: [
      "Design an end-to-end machine learning pipeline for production deployment.",
      "How would you implement distributed training across multiple GPUs?",
      "Explain how you would handle concept drift in a live ML model.",
    ],
  },
};

/**
 * Get a random question from the mock pool
 */
function getRandomMockQuestion(interviewType, difficultyLevel) {
  const questions = mockQuestions[interviewType]?.[difficultyLevel] || 
                   mockQuestions.fullstack.intermediate;
  return questions[Math.floor(Math.random() * questions.length)];
}

/**
 * Generate initial technical interview question
 * @param {string} interviewType - frontend, backend, fullstack, devops, data-science
 * @param {string} difficultyLevel - beginner, intermediate, advanced
 * @returns {Promise<string>} - First question
 */
export const generateInitialQuestion = async (interviewType, difficultyLevel) => {
  try {
    const prompt = `You are a professional technical interviewer. Generate a single, clear technical question for a ${difficultyLevel} level ${interviewType} interview.

The question should:
1. Be open-ended but answerable in 2-3 minutes
2. Test core concepts in ${interviewType}
3. Be appropriate for ${difficultyLevel} level
4. Encourage detailed explanation

Return ONLY the question text, no additional formatting.`;

    const messages = [
      {
        role: 'system',
        content: 'You are a professional technical interviewer generating interview questions.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    console.log('🧠 Calling Cerebras API (gpt-oss-120b) for question generation...');
    const question = await callCerebras(messages);
    console.log('✅ Question generated by Cerebras');
    return question;
  } catch (error) {
    console.error('Question Generation Error:', error.message);
    // Fallback to mock on error
    console.log('⚠️ Falling back to mock questions');
    return getRandomMockQuestion(interviewType, difficultyLevel);
  }
};

/**
 * Mock evaluation for responses
 */
function getMockEvaluation(question, response) {
  const wordCount = response?.split(/\s+/).length || 0;
  let score = 65;
  let feedback = 'Good attempt. ';
  
  if (wordCount < 20) {
    score = 40;
    feedback = 'Response too brief. Provide more details and examples. ';
  } else if (wordCount > 100) {
    score = 75;
    feedback = 'Comprehensive response with good detail. ';
  } else {
    score = 65;
    feedback = 'Solid response with adequate explanation. ';
  }
  
  feedback += 'Consider adding real-world examples or tradeoffs. ';
  
  return {
    score,
    feedback,
    followUpQuestion: 'Can you explain how you would handle edge cases in your solution?'
  };
}

/**
 * Evaluate candidate response and generate follow-up question
 * @param {string} question - Original question asked
 * @param {string} response - Candidate's response
 * @param {Object} context - Interview context
 * @returns {Promise<{score: number, feedback: string, followUpQuestion: string}>}
 */
export const evaluateResponse = async (question, response, context = {}) => {
  try {
    const prompt = `You are a professional technical interviewer evaluating a candidate's response.

Question Asked: "${question}"

Candidate's Response: "${response}"

Interview Context:
- Interview Type: ${context.interviewType || 'general'}
- Difficulty Level: ${context.difficultyLevel || 'intermediate'}
- Question Number: ${context.questionNumber || 1}

Please evaluate the response and:
1. Score it from 0-100
2. Provide 2-3 sentence feedback (be constructive)
3. Generate an appropriate follow-up question that probes deeper

IMPORTANT: Return ONLY valid JSON with this exact structure, no markdown or extra text:
{
  "score": <number 0-100>,
  "feedback": "<constructive feedback>",
  "followUpQuestion": "<next question>"
}`;

    const messages = [
      {
        role: 'system',
        content: 'You are a professional technical interviewer. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    console.log('🧠 Calling Cerebras API for response evaluation...');
    const responseText = await callCerebras(messages, 300);
    const jsonResponse = JSON.parse(responseText);
    console.log('✅ Response evaluated by Cerebras');
    return jsonResponse;
  } catch (error) {
    console.error('Response Evaluation Error:', error.message);
    // Fallback to mock evaluation
    console.log('⚠️ Falling back to mock evaluation');
    return getMockEvaluation(question, response);
  }
};

/**
 * Generate interview summary after all questions
 * @param {Array} questionsData - Array of {question, response, score}
 * @param {Object} context - Interview context
 * @returns {Promise<string>} - Interview summary and overall feedback
 */
export const generateInterviewSummary = async (questionsData, context = {}) => {
  try {
    const questionsText = questionsData
      .map((q, i) => `Q${i + 1}: ${q.question}\nResponse: ${q.response}\nScore: ${q.score}`)
      .join('\n\n');

    const avgScore = Math.round(
      questionsData.reduce((sum, q) => sum + q.score, 0) / questionsData.length
    );

    const prompt = `You are a professional technical interviewer. Generate a concise interview summary.

Interview Details:
- Type: ${context.interviewType}
- Difficulty: ${context.difficultyLevel}
- Overall Score: ${avgScore}/100

Questions and Responses:
${questionsText}

Provide a professional 3-4 paragraph summary that:
1. Assesses overall technical knowledge
2. Highlights strengths observed
3. Suggests areas for improvement
4. Recommends next steps (hire/not hire/maybe)`;

    const messages = [
      {
        role: 'system',
        content: 'You are a professional technical interviewer creating interview summaries.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    console.log('🧠 Calling Cerebras API for interview summary...');
    const summary = await callCerebras(messages, 500);
    console.log('✅ Summary generated by Cerebras');
    return summary;
  } catch (error) {
    console.error('Summary Generation Error:', error.message);
    // Fallback to mock summary
    console.log('⚠️ Falling back to mock interview summary');
    return `Interview completed successfully. Average score: ${Math.round(questionsData.reduce((sum, q) => sum + q.score, 0) / questionsData.length)}/100`;
  }
};

/**
 * Check if response is complete enough for evaluation
 * @param {string} response - Candidate's response
 * @returns {boolean} - Whether response is substantial enough
 */
export const isResponseCompleteEnough = (response) => {
  const minWords = 20;
  const wordCount = response.trim().split(/\s+/).length;
  return wordCount >= minWords;
};

export default {
  generateInitialQuestion,
  evaluateResponse,
  generateInterviewSummary,
  isResponseCompleteEnough,
};
