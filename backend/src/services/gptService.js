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
  const analysisType = context.analysisType || 'basic';

  try {
    let prompt;

    if (analysisType === 'premium') {
      prompt = `You are an elite technical interviewer and career coach conducting a premium-tier evaluation.

Question Asked: "${question}"

Candidate's Response: "${response}"

Interview Context:
- Interview Type: ${context.interviewType || 'general'}
- Difficulty Level: ${context.difficultyLevel || 'intermediate'}
- Question Number: ${context.questionNumber || 1}

Provide an EXPERT-LEVEL evaluation with multi-dimensional scoring. Evaluate across 5 dimensions:
1. Technical Accuracy (0-100): Is their answer technically correct? Do they demonstrate real understanding?
2. Communication Clarity (0-100): Did they explain their thought process clearly? Could a team understand them?
3. Problem Solving (0-100): Do they show structured thinking? Do they consider trade-offs and alternatives?
4. Depth of Knowledge (0-100): Do they go beyond surface-level? Do they understand the "why" behind concepts?
5. Practical Experience (0-100): Do they sound like they've done this in real life, or is it purely theoretical?

Also provide:
- Detailed feedback (5-7 sentences: what they did well, what was incorrect or missing, what an ideal answer would include)
- A specific improvement tip they can act on immediately
- Estimated experience level based on this answer (junior/mid/senior)
- A follow-up question that probes their weakest dimension

IMPORTANT: Return ONLY valid JSON with this exact structure, no markdown:
{
  "score": <weighted average 0-100>,
  "technicalAccuracy": <0-100>,
  "communicationClarity": <0-100>,
  "problemSolving": <0-100>,
  "depthOfKnowledge": <0-100>,
  "practicalExperience": <0-100>,
  "feedback": "<detailed 5-7 sentence feedback>",
  "improvementTip": "<one specific actionable tip>",
  "estimatedLevel": "<junior|mid|senior>",
  "followUpQuestion": "<probing follow-up>"
}`;
    } else if (analysisType === 'detailed') {
      prompt = `You are a senior technical interviewer providing detailed evaluation.

Question Asked: "${question}"

Candidate's Response: "${response}"

Interview Context:
- Interview Type: ${context.interviewType || 'general'}
- Difficulty Level: ${context.difficultyLevel || 'intermediate'}
- Question Number: ${context.questionNumber || 1}

Evaluate across 5 dimensions:
1. Technical Accuracy (0-100): Correctness of the answer
2. Communication Clarity (0-100): How clearly they explained concepts
3. Problem Solving (0-100): Structured thinking and trade-off awareness
4. Depth of Knowledge (0-100): Beyond surface-level understanding
5. Practical Experience (0-100): Real-world application evidence

Also provide:
- Detailed feedback (3-4 sentences: strengths, weaknesses, and what to improve)
- A follow-up question

IMPORTANT: Return ONLY valid JSON, no markdown:
{
  "score": <weighted average 0-100>,
  "technicalAccuracy": <0-100>,
  "communicationClarity": <0-100>,
  "problemSolving": <0-100>,
  "depthOfKnowledge": <0-100>,
  "practicalExperience": <0-100>,
  "feedback": "<3-4 sentence detailed feedback>",
  "followUpQuestion": "<next question>"
}`;
    } else {
      // Basic tier — still has category scores for consistent schema
      prompt = `You are a professional technical interviewer evaluating a candidate's response.

Question Asked: "${question}"

Candidate's Response: "${response}"

Interview Context:
- Interview Type: ${context.interviewType || 'general'}
- Difficulty Level: ${context.difficultyLevel || 'intermediate'}
- Question Number: ${context.questionNumber || 1}

Evaluate the response:
1. Overall score (0-100)
2. Rate each dimension (0-100): Technical Accuracy, Communication Clarity, Problem Solving, Depth of Knowledge, Practical Experience
3. Brief feedback (2-3 sentences)
4. A follow-up question

IMPORTANT: Return ONLY valid JSON, no markdown:
{
  "score": <0-100>,
  "technicalAccuracy": <0-100>,
  "communicationClarity": <0-100>,
  "problemSolving": <0-100>,
  "depthOfKnowledge": <0-100>,
  "practicalExperience": <0-100>,
  "feedback": "<2-3 sentence feedback>",
  "followUpQuestion": "<follow-up question>"
}`;
    }

    const maxTokens = analysisType === 'premium' ? 600 : analysisType === 'detailed' ? 450 : 300;

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

    console.log(`🧠 Calling Cerebras API for ${analysisType} evaluation...`);
    const responseText = await callCerebras(messages, maxTokens);
    const jsonResponse = JSON.parse(responseText);
    console.log(`✅ Response evaluated (${analysisType} tier)`);
    return jsonResponse;
  } catch (error) {
    console.error('Response Evaluation Error:', error.message);
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
  const analysisType = context.analysisType || 'basic';

  try {
    const questionsText = questionsData
      .map((q, i) => `Q${i + 1}: ${q.question}\nResponse: ${q.response}\nScore: ${q.score}`)
      .join('\n\n');

    const avgScore = Math.round(
      questionsData.reduce((sum, q) => sum + q.score, 0) / questionsData.length
    );

    let prompt;

    if (analysisType === 'premium') {
      prompt = `You are a senior engineering hiring manager providing a premium-tier interview debrief.

Interview Details:
- Type: ${context.interviewType}
- Difficulty: ${context.difficultyLevel}
- Overall Score: ${avgScore}/100

Questions and Responses:
${questionsText}

Provide a comprehensive, actionable interview report:

1. EXECUTIVE SUMMARY (2-3 sentences): Quick verdict with hire/strong-hire/maybe/no-hire recommendation.

2. TOP STRENGTHS (2-3 specific strengths): Reference actual answers the candidate gave. Quote specific things they said.

3. CRITICAL GAPS (2-3 areas): Be specific about what was weak. Reference the actual questions where they struggled.

4. SKILL-BY-SKILL BREAKDOWN: For each major topic covered, give a one-line assessment.

5. PERSONALIZED LEARNING ROADMAP: Give 3-5 specific resources, topics, or exercises they should focus on next. Be specific (e.g., "Read Chapter 5 of Designing Data-Intensive Applications" not just "study system design").

6. COMPARISON TO MARKET: How would this candidate compare to the average ${context.difficultyLevel} level ${context.interviewType} candidate in today's market?

Use clear headings (plain text, no markdown). Write professionally but warmly.`;
    } else if (analysisType === 'detailed') {
      prompt = `You are a professional technical interviewer providing detailed feedback.

Interview Details:
- Type: ${context.interviewType}
- Difficulty: ${context.difficultyLevel}
- Overall Score: ${avgScore}/100

Questions and Responses:
${questionsText}

Provide a detailed summary with:
1. Overall performance assessment (2-3 sentences)
2. Key strengths demonstrated (reference specific answers)
3. Areas for improvement (be specific about what was weak)
4. Recommended topics to study next (3-4 specific suggestions)
5. Final verdict: hire/maybe/not-ready

Write in clear paragraphs.`;
    } else {
      prompt = `You are a professional technical interviewer. Generate a concise interview summary.

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
4. Gives a quick verdict`;
    }

    const maxTokens = analysisType === 'premium' ? 900 : analysisType === 'detailed' ? 600 : 400;

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

    console.log(`🧠 Calling Cerebras API for ${analysisType} summary...`);
    const summary = await callCerebras(messages, maxTokens);
    console.log(`✅ Summary generated (${analysisType} tier)`);
    return summary;
  } catch (error) {
    console.error('Summary Generation Error:', error.message);
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
