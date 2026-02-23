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
            "Explain the difference between let, const, and var in JavaScript.",
            "What is the purpose of CSS flexbox and how do you use it?",
            "How does event delegation work in JavaScript?",
            "What are semantic HTML elements and why do they matter?",
            "Explain the box model in CSS.",
        ],
        "intermediate": [
            "Describe how React's virtual DOM works and why it improves performance.",
            "What are closures in JavaScript? Provide a practical example.",
            "Explain the difference between call, apply, and bind methods.",
            "How does React state management work? Compare useState vs useReducer.",
            "What is the Critical Rendering Path and how would you optimize it?",
        ],
        "advanced": [
            "How would you implement a custom React hook for managing complex state logic?",
            "Explain the concept of memoization and how React.memo differs from useMemo.",
            "Describe micro-frontend architecture and when you'd use it.",
            "How does JavaScript's event loop work with microtasks and macrotasks?",
            "What strategies would you use for optimizing a React application's bundle size?",
        ],
    },
    "backend": {
        "beginner": [
            "What is the difference between SQL and NoSQL databases?",
            "Explain RESTful APIs and their main principles.",
            "What are middleware functions in Express.js?",
            "How does HTTP work? Explain the request-response cycle.",
            "What is the purpose of environment variables?",
        ],
        "intermediate": [
            "How would you handle authentication in a Node.js application?",
            "Explain database indexing and when you should use it.",
            "What is the difference between SQL joins: INNER, LEFT, RIGHT, FULL?",
            "How do you handle error handling in async/await code?",
            "Explain the concept of connection pooling in databases.",
        ],
        "advanced": [
            "Design a scalable architecture for handling 1 million concurrent users.",
            "Explain database replication and sharding strategies.",
            "How would you implement rate limiting and why is it important?",
            "Describe event-driven architecture and message queues.",
            "How would you handle distributed transactions across microservices?",
        ],
    },
    "fullstack": {
        "beginner": [
            "Explain the client-server architecture and how data flows between them.",
            "What is the purpose of APIs and how do they enable frontend-backend communication?",
            "Describe the basic flow of an HTTP request and response cycle.",
            "What is the difference between GET and POST requests?",
            "How does a web browser render a web page?",
        ],
        "intermediate": [
            "How would you secure sensitive data like passwords and API keys?",
            "Explain JWT and how authentication flows work in a full-stack app.",
            "What are the main differences between SSR and CSR?",
            "How would you implement real-time features in a web application?",
            "Explain CORS and why it exists.",
        ],
        "advanced": [
            "Design a real-time notification system for millions of users.",
            "How would you implement end-to-end encryption in a messaging app?",
            "Explain how you would handle caching at different layers of a web app.",
            "Describe how you'd design a CI/CD pipeline for a full-stack application.",
            "How would you migrate a monolith to microservices?",
        ],
    },
    "devops": {
        "beginner": [
            "What is containerization and why is Docker useful?",
            "Explain CI/CD pipelines and their importance.",
            "What is version control and why is Git important?",
            "What is the difference between a VM and a container?",
            "Explain what a reverse proxy does.",
        ],
        "intermediate": [
            "How would you set up a Kubernetes cluster?",
            "Explain Infrastructure as Code and its benefits.",
            "What strategies would you use for blue-green deployments?",
            "How do you implement monitoring and alerting for production systems?",
            "Explain the 12-factor app methodology.",
        ],
        "advanced": [
            "Design a highly available infrastructure for a SaaS application.",
            "How would you implement disaster recovery and backup strategies?",
            "Explain service mesh architecture and when you'd use it.",
            "How would you optimize cloud costs while maintaining performance?",
            "Describe chaos engineering and how you'd implement it.",
        ],
    },
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

        instructions = f"""You are a professional, friendly AI technical interviewer for IntervuAI.
Your goal is to conduct a natural, conversational technical interview.

INTERVIEW DETAILS:
- Interview Type: {interview_type.replace('-', ' ').title()}
- Difficulty Level: {difficulty_level.title()}
- Candidate Name: {user_name}

QUESTION BANK (use these as a starting point, but adapt based on responses):
{questions_text}

INTERVIEW RULES:
1. Start with a warm greeting. Introduce yourself as the AI interviewer from IntervuAI. Ask the candidate to introduce themselves briefly.
2. Ask questions one at a time from your question bank. Start easier and increase difficulty.
3. Listen carefully to answers. Ask relevant follow-up questions based on their responses.
4. After each answer, provide brief encouraging feedback before moving to the next question.
5. Keep the conversation natural and flowing. Do NOT list questions mechanically.
6. Ask approximately {self.max_questions} questions total including follow-ups.
7. All responses will be spoken aloud. Do NOT use markdown, bullet points, code blocks, or any formatting. Keep responses concise and conversational.
8. After the last question, thank the candidate warmly and tell them the interview is now complete and they can view their detailed results on their dashboard.
9. Be encouraging but honest. If an answer is weak, gently suggest improvement areas.
10. Keep each of your responses under 30 seconds of speaking time. Be concise."""

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
