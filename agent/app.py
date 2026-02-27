# IntervuAI LiveKit Agent
# Real-time AI interviewer using LiveKit, Cerebras, and Deepgram

import os
import sys
import json
import asyncio
import aiohttp
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions
from livekit.plugins import openai, silero, deepgram
from dotenv import load_dotenv
load_dotenv()

def check_environment_vars():
    required_vars = [
        "LIVEKIT_URL",
        "LIVEKIT_API_KEY",
        "LIVEKIT_API_SECRET",
        "DEEPGRAM_API_KEY",
        "CEREBRAS_API_KEY",
    ]
    missing = [v for v in required_vars if not os.environ.get(v)]
    if missing:
        print("Missing required environment variables:", file=sys.stderr)
        for v in missing:
            print(f"  - {v}", file=sys.stderr)
        sys.exit(1)
    print("All required API keys loaded.")

# Question banks by interview type and difficulty
QUESTION_BANKS = {
    "frontend": {
        "beginner": [
            "Could you walk me through your process of building a responsive layout from scratch?",
            "How do you usually decide between let, const, and var when writing JavaScript?",
            "Can you explain how you handle basic state and props in a React application?",
            "What's your approach to semantic HTML, and why do you think it matters?",
            "How would you explain the CSS box model to a junior developer?",
        ],
        "intermediate": [
            "If you noticed your React app was rendering slowly, what steps would you take to debug and fix it?",
            "Can you walk me through a practical scenario where you used closures to solve a problem?",
            "How do you usually handle complex state management? When would you reach for Redux or Context?",
            "What's your strategy for writing clean, maintainable, and reusable CSS in a large project?",
            "Tell me about a time you had to optimize the loading speed or Critical Rendering Path of a web page.",
        ],
        "advanced": [
            "Walk me through how you would design and implement a custom React hook for a complex data-fetching scenario.",
            "How do you approach managing a large-scale frontend architecture? Have you ever dealt with micro-frontends?",
            "Tell me about your strategy for optimizing the bundle size of a heavy, enterprise-level web app.",
            "Can you explain the JavaScript event loop and how you handle complex asynchronous operations?",
            "How do you ensure accessibility standards are met across a complex, dynamic web application?",
        ],
    },
    "backend": {
        "beginner": [
            "When starting a new project, how do you decide whether to use a SQL or NoSQL database?",
            "Can you walk me through how you design RESTful API endpoints?",
            "How do you use middleware in frameworks like Express.js? Can you give a practical example?",
            "Explain how you handle user input validation and basic security in your routes.",
            "What's your approach to managing environment variables and secrets in a project?",
        ],
        "intermediate": [
            "Walk me through how you handle user authentication and authorization in your applications.",
            "Tell me about a time a database query was bottlenecking your app. How did you optimize it?",
            "How do you structure your error handling in a complex backend service?",
            "Can you explain how you'd implement connection pooling and why it's necessary?",
            "What's your approach to writing automated tests for your backend endpoints?",
        ],
        "advanced": [
            "If our user base suddenly spiked to a million concurrent users, how would you architect the backend to handle the load?",
            "Tell me about your experience with implementing distributed transactions or event-driven architectures.",
            "How do you implement robust rate limiting to protect your APIs from abuse?",
            "Walk me through your strategies for database replication, sharding, and high availability.",
            "How do you handle asynchronous background processing for heavy, time-consuming tasks?",
        ],
    },
    "fullstack": {
        "beginner": [
            "How do you typically structure the communication between your frontend and backend?",
            "Can you walk me through the complete lifecycle of a user logging into an app, from the button click to the database?",
            "What's your approach to handling CORS issues when they pop up during development?",
            "How do you ensure data stays synchronized between the client and the server?",
            "What's your preferred workflow for debugging an issue that spans both the frontend and backend?",
        ],
        "intermediate": [
            "How do you approach securing sensitive data, like passwords and API keys, across the entire stack?",
            "Can you explain your strategy for implementing JWT securely?",
            "How would you design and implement a feature that requires real-time updates for the user, like a chat system?",
            "When building a new app, how do you decide between Server-Side Rendering and Client-Side Rendering?",
            "Walk me through how you handle caching at different layers to improve overall application performance.",
        ],
        "advanced": [
            "If you had to migrate a legacy monolithic application to a microservices architecture, what would be your first few steps?",
            "Design a real-time notification system architecture that needs to scale to millions of active users.",
            "How would you implement end-to-end encryption in a full-stack messaging application?",
            "Walk me through how you'd design a robust CI/CD pipeline for a complex full-stack application.",
            "How do you maintain observability, logging, and tracing across multiple full-stack services in production?",
        ],
    },
    "devops": {
        "beginner": [
            "How do you use Docker in your daily development workflow? What benefits does it bring you?",
            "Can you walk me through your ideal CI/CD pipeline setup for a standard web application?",
            "How do you approach version control and branching strategies in a team environment?",
            "Explain how you use reverse proxies like Nginx or HAProxy in your infrastructure.",
            "What's your standard process for safely applying updates or patches to a server?",
        ],
        "intermediate": [
            "Walk me through the steps you take when setting up a new Kubernetes cluster.",
            "How do you implement Infrastructure as Code? What tools do you prefer and why?",
            "Can you explain your strategy for executing zero-downtime deployments, like blue-green or canary?",
            "How do you set up monitoring and alerting to catch infrastructure issues before users notice them?",
            "What's your approach to managing and rotating secrets in a production environment?",
        ],
        "advanced": [
            "Walk me through your approach to disaster recovery. What happens if an entire availability zone goes down?",
            "How do you implement and enforce security policies across a large-scale Kubernetes cluster?",
            "Explain your experience with service mesh architectures. When do you think they become necessary?",
            "How do you optimize cloud infrastructure costs while maintaining high performance and availability?",
            "Tell me about your experience with chaos engineering. How do you intentionally break systems to make them more resilient?",
        ],
    },
    "ai_ml_engineer": {
        "beginner": [
            "Can you walk me through the basic steps of preparing a raw dataset for a machine learning model?",
            "How do you usually decide between using a classification algorithm versus a regression algorithm?",
            "Tell me about your approach to splitting data into training, validation, and test sets.",
            "How would you explain the concept of overfitting to someone who isn't technical?",
            "What standard metrics do you look at to evaluate the performance of a basic model?",
        ],
        "intermediate": [
            "Walk me through a time you had to deal with a highly imbalanced dataset. What techniques did you use?",
            "How do you approach feature engineering? Can you give an example of a feature you created that significantly improved a model?",
            "Tell me about your experience with deep learning frameworks like PyTorch or TensorFlow.",
            "How do you diagnose and fix a neural network that is suffering from vanishing or exploding gradients?",
            "Can you explain the trade-offs between using a complex ensemble model versus a simpler, interpretable model?",
        ],
        "advanced": [
            "How do you go about optimizing a large-scale machine learning model to reduce its inference latency in production?",
            "Walk me through your experience with distributed training across multiple GPUs or nodes.",
            "Tell me about a time you had to implement a custom loss function or neural network architecture from scratch.",
            "How do you approach continual learning or handling concept drift in models that have been in production for a while?",
            "Explain your strategy for compressing models, using techniques like quantization or pruning, for edge devices.",
        ],
    },
    "gen_ai_engineer": {
        "beginner": [
            "Can you walk me through how you typically integrate a Large Language Model API, like OpenAI's, into a basic application?",
            "How do you approach writing and structuring prompts to get reliable outputs from an LLM?",
            "Explain what vector embeddings are and how you've used them in your projects.",
            "What's your strategy for handling token limits and context window restrictions?",
            "Tell me about a basic chatbot or generative application you've built recently.",
        ],
        "intermediate": [
            "Walk me through the architecture of a Retrieval-Augmented Generation, or RAG, pipeline you've built.",
            "How do you evaluate the quality and accuracy of the responses generated by an LLM?",
            "Can you explain your approach to document chunking and indexing for semantic search?",
            "Tell me about your experience with fine-tuning open-source models versus using prompt engineering.",
            "How do you handle hallucinations in generative models to ensure users get factual information?",
        ],
        "advanced": [
            "Walk me through how you design and implement autonomous AI agents using frameworks like LangChain or AutoGen.",
            "How do you optimize a RAG pipeline for complex queries, involving techniques like query routing or re-ranking?",
            "Tell me about a time you had to deploy and serve a large open-weight model, like LLaMA, on your own infrastructure.",
            "How do you approach building robust memory systems for AI agents that need to maintain context over long periods?",
            "Explain your strategy for building multimodal generative systems that process both text and images.",
        ],
    },
    "mlops_engineer": {
        "beginner": [
            "How do you typically handle version control for your datasets and machine learning models?",
            "Can you walk me through the basic steps of taking a trained model and wrapping it in a Flask or FastAPI endpoint?",
            "What tools do you prefer for tracking model experiments and hyperparameters?",
            "How do you use Docker in the context of deploying machine learning models?",
            "Tell me about your approach to writing tests for machine learning code.",
        ],
        "intermediate": [
            "Walk me through how you set up a CI/CD pipeline specifically tailored for machine learning models.",
            "How do you monitor models in production to detect data drift or model degradation over time?",
            "Can you explain the concept of a Feature Store and how you would implement one?",
            "Tell me about your experience with orchestrating ML workflows using tools like Apache Airflow or Kubeflow.",
            "How do you manage the infrastructure scaling when your model endpoint receives sudden spikes in traffic?",
        ],
        "advanced": [
            "Walk me through the architecture of a fully automated model retraining and deployment pipeline.",
            "How do you handle A/B testing or shadow deployments for evaluating new machine learning models in production?",
            "Tell me about a time you had to optimize model serving infrastructure to achieve ultra-low latency.",
            "How do you ensure compliance, governance, and auditability of models deployed in an enterprise environment?",
            "Explain your strategy for managing GPU resources effectively across a large team of data scientists.",
        ],
    },
    "data_engineer": {
        "beginner": [
            "Can you walk me through the basic steps of building an ETL pipeline?",
            "How do you decide between using a relational database versus a document store for a new dataset?",
            "Tell me about your experience writing complex SQL queries. What are some functions you use frequently?",
            "How do you approach cleaning and transforming messy data before it goes into a warehouse?",
            "What tools do you typically use to schedule and monitor your data jobs?",
        ],
        "intermediate": [
            "Walk me through a scenario where you had to optimize a slow-running data pipeline or database query.",
            "How do you design a data warehouse schema? Do you prefer star schema, snowflake, or another approach?",
            "Can you explain the difference between batch processing and stream processing, and when you would use each?",
            "Tell me about your experience with distributed data processing frameworks like Apache Spark.",
            "How do you ensure data quality and handle pipeline failures gracefully?",
        ],
        "advanced": [
            "Walk me through how you would architect a real-time data lakehouse to handle petabytes of data.",
            "How do you approach data governance, security, and access control in a large organization?",
            "Tell me about a time you had to migrate a massive amount of data between different cloud providers or database systems.",
            "How do you design idempotent data pipelines that can recover from complex failure states without duplicating data?",
            "Explain your strategy for optimizing cloud computing costs associated with large-scale data processing.",
        ],
    },
    "data_scientist": {
        "beginner": [
            "Walk me through your typical process for exploratory data analysis when you get a brand new dataset.",
            "How do you identify and handle missing values or outliers in your data?",
            "Can you explain the difference between correlation and causation?",
            "Tell me about your approach to creating clear and actionable data visualizations.",
            "What statistical tests do you find yourself using most often in your day-to-day work?",
        ],
        "intermediate": [
            "Walk me through a time you designed and analyzed an A/B test. How did you determine statistical significance?",
            "How do you approach dimensionality reduction when working with datasets that have hundreds of features?",
            "Tell me about a complex predictive model you built. How did you select the features and validate the results?",
            "How do you handle situations where the data you need to solve a business problem isn't readily available?",
            "Can you explain how you communicate highly technical statistical findings to non-technical stakeholders?",
        ],
        "advanced": [
            "Walk me through your experience with causal inference techniques to determine the true impact of a business intervention.",
            "How do you design complex experiments when standard A/B testing is not feasible due to network effects or interference?",
            "Tell me about a time you had to use advanced statistical modeling, like Bayesian networks or Markov chains, to solve a problem.",
            "How do you quantify and communicate the uncertainty or confidence intervals of your model predictions?",
            "Explain your strategy for bridging the gap between a prototype analytical model and a scalable production system.",
        ],
    }
}

def get_questions_for_interview(interview_type, difficulty_level):
    """Get the question bank for the given type and level."""
    type_questions = QUESTION_BANKS.get(interview_type, QUESTION_BANKS["fullstack"])
    return type_questions.get(difficulty_level, type_questions["intermediate"])


class InterviewerAgent(Agent):
    def __init__(self, interview_type="fullstack", difficulty_level="intermediate",
                 interview_id=None, user_name="Candidate"):
        self.interview_type = interview_type
        self.difficulty_level = difficulty_level
        self.interview_id = interview_id
        self.user_name = user_name
        self.conversation_log = []
        self.question_count = 0
        self.max_questions = 8

        questions = get_questions_for_interview(interview_type, difficulty_level)
        questions_text = json.dumps(questions, indent=2)

        llm = openai.LLM.with_cerebras(model="gpt-oss-120b")
        stt = deepgram.STT()
        tts = deepgram.TTS()
        vad = silero.VAD.load()

        instructions = f"""You are a conversational and adaptive AI technical interviewer for IntervuAI, acting like a real human engineering manager. Your goal is to conduct a natural, engaging interview that responds dynamically to the candidate's actual experience.

INTERVIEW DETAILS:
- Interview Type: {interview_type.replace('-', ' ').title()}
- Difficulty Level: {difficulty_level.title()}
- Candidate Name: {user_name}

TECHNICAL QUESTION BANK (Use as a conceptual guide, not a strict script):
{questions_text}

INTERVIEW FLOW & RULES:
1. The Introduction: Start warmly. Introduce yourself and ask {user_name} to introduce themselves, including their recent experience and a project they enjoyed working on.
2. Experience Deep-Dive: Listen closely to their introduction. Your next 1-2 questions MUST be directly based on the specific projects, roles, or technologies they just mentioned. Ask about their specific contributions or challenges faced.
3. Seamless Transitions: Bridge their personal experience into the technical questions. (e.g., "Since you mentioned working heavily with APIs, let's talk about...")
4. Natural Follow-ups: Never just read the next question on the list. React to their answers with conversational fillers like "That makes sense," or "Interesting approach." Ask *why* they chose a specific method, or what trade-offs they considered.
5. General & Behavioral Questions: Include 1-2 standard interviewer questions, such as "Tell me about a time you had to debug a really tough issue," or "How do you approach learning a new technology?"
6. Pacing & Format: Ask exactly ONE question at a time. Ask a total of {self.max_questions} questions.
7. Speech Constraints: You are speaking aloud via TTS. Strictly NO markdown, bullet points, or code formatting. Keep every response conversational and under 30 seconds of speaking time.
8. Conclusion: Wrap up warmly, mention one specific thing you liked about their answers, and inform them they can view detailed feedback on their dashboard."""

        super().__init__(
            instructions=instructions,
            stt=stt, llm=llm, tts=tts, vad=vad
        )

    async def on_enter(self):
        self.session.generate_reply(
            user_input=f"Start the interview. Give a short friendly greeting, introduce yourself as the AI interviewer from IntervuAI for a {self.difficulty_level} level {self.interview_type} interview, and ask {self.user_name} to introduce themselves."
        )


async def save_interview_results(interview_id, transcript_data, backend_url, api_key):
    """Post interview results back to the Node.js backend."""
    if not interview_id or not backend_url:
        print("No interview ID or backend URL, skipping save.")
        return

    url = f"{backend_url}/api/interview/{interview_id}/save-live-results"
    headers = {
        "Content-Type": "application/json",
        "x-agent-api-key": api_key or "",
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=transcript_data, headers=headers) as resp:
                if resp.status == 200:
                    print(f"Interview results saved for {interview_id}")
                else:
                    text = await resp.text()
                    print(f"Failed to save results: {resp.status} - {text}")
    except Exception as e:
        print(f"Error saving interview results: {e}")


async def entrypoint(ctx: JobContext):
    await ctx.connect()

    # Extract interview metadata from room metadata
    room = ctx.room
    metadata = {}
    try:
        if room.metadata:
            metadata = json.loads(room.metadata)
    except (json.JSONDecodeError, TypeError):
        pass

    interview_type = metadata.get("interviewType", "fullstack")
    difficulty_level = metadata.get("difficultyLevel", "intermediate")
    interview_id = metadata.get("interviewId", None)
    user_name = metadata.get("userName", "Candidate")

    print(f"Starting interview: type={interview_type}, level={difficulty_level}, id={interview_id}")

    agent = InterviewerAgent(
        interview_type=interview_type,
        difficulty_level=difficulty_level,
        interview_id=interview_id,
        user_name=user_name,
    )

    session = AgentSession()

    # Collect transcript for saving
    transcript_entries = []

    @session.on("agent_speech_committed")
    def on_agent_speech(msg):
        transcript_entries.append({
            "role": "interviewer",
            "text": msg.content if hasattr(msg, 'content') else str(msg),
            "timestamp": asyncio.get_event_loop().time(),
        })

    @session.on("user_speech_committed")
    def on_user_speech(msg):
        transcript_entries.append({
            "role": "candidate",
            "text": msg.content if hasattr(msg, 'content') else str(msg),
            "timestamp": asyncio.get_event_loop().time(),
        })

    await session.start(room=room, agent=agent)

    # Wait for participant to disconnect or timeout (20 min max)
    try:
        await asyncio.sleep(1200)  # 20 min max
    except asyncio.CancelledError:
        pass

    # Save results when session ends
    backend_url = os.environ.get("BACKEND_URL", "http://localhost:3000")
    agent_api_key = os.environ.get("AGENT_API_KEY", "")

    if interview_id and transcript_entries:
        await save_interview_results(
            interview_id,
            {
                "transcript": transcript_entries,
                "interviewType": interview_type,
                "difficultyLevel": difficulty_level,
            },
            backend_url,
            agent_api_key,
        )


if __name__ == "__main__":
    check_environment_vars()
    opts = WorkerOptions(entrypoint_fnc=entrypoint)
    print("Starting IntervuAI Agent Worker...")
    agents.cli.run_app(opts)
