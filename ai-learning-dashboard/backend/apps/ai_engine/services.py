"""
AI Engine Service — All AI features powered by OpenRouter.
OpenRouter provides a unified OpenAI-compatible API giving access to 200+ models
(Claude 3.5 Sonnet, GPT-4o, Gemini Flash, Llama 3, Mistral, etc.)

Docs: https://openrouter.ai/docs
"""
import json
from openai import OpenAI
from django.conf import settings


# ─── Client ──────────────────────────────────────────────────────────────────

def get_client() -> OpenAI:
    """Return a configured OpenAI client pointed at OpenRouter."""
    return OpenAI(
        api_key=settings.OPENROUTER_API_KEY,
        base_url=settings.OPENROUTER_BASE_URL,
        default_headers={
            # Recommended by OpenRouter for rankings/analytics
            "HTTP-Referer": settings.OPENROUTER_SITE_URL,
            "X-Title": settings.OPENROUTER_SITE_NAME,
        },
    )


def _get_model() -> str:
    return getattr(settings, "OPENROUTER_DEFAULT_MODEL", "anthropic/claude-3.5-sonnet")


def _parse_json(text: str):
    """Strip markdown fences, then parse JSON."""
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


def _chat(messages: list, max_tokens: int = 1500) -> str:
    """Send a chat request to OpenRouter and return the assistant's text."""
    client = get_client()
    response = client.chat.completions.create(
        model=_get_model(),
        max_tokens=max_tokens,
        messages=messages,
    )
    return response.choices[0].message.content


# ─── Feature Functions ────────────────────────────────────────────────────────

def summarize_notes(content: str) -> dict:
    """
    Generate a concise summary and extract key concepts from notes.

    Returns:
        {
            "summary": str,
            "key_concepts": [{"term": str, "definition": str}, ...],
            "tags": [str, ...]
        }
    """
    prompt = f"""You are an expert educational assistant. Analyze the following notes and provide:
1. A clear, concise summary (2-3 paragraphs)
2. A list of 5-10 key concepts/terms with brief definitions
3. 3-5 relevant topic tags

Notes content:
{content[:8000]}

Respond ONLY with a valid JSON object — no markdown fences, no preamble:
{{
  "summary": "Your summary here...",
  "key_concepts": [
    {{"term": "concept name", "definition": "brief definition"}},
    ...
  ],
  "tags": ["tag1", "tag2", "tag3"]
}}"""

    text = _chat([{"role": "user", "content": prompt}], max_tokens=1500)
    return _parse_json(text)


def generate_flashcards(content: str, count: int = 10) -> list:
    """
    Auto-generate flashcards from note content.

    Returns:
        [{"front": str, "back": str, "difficulty": "easy|medium|hard"}, ...]
    """
    prompt = f"""You are an expert educational assistant. Create {count} high-quality flashcards from the following notes.
Each flashcard should test understanding of important concepts.

Notes content:
{content[:8000]}

Respond ONLY with a valid JSON array — no markdown fences, no preamble:
[
  {{
    "front": "Question or concept to recall",
    "back": "Answer or explanation",
    "difficulty": "easy|medium|hard"
  }},
  ...
]

Vary question types: definitions, explanations, applications, comparisons."""

    text = _chat([{"role": "user", "content": prompt}], max_tokens=2000)
    return _parse_json(text)


def generate_quiz(content: str, topic: str = "", count: int = 5) -> dict:
    """
    Generate a multiple-choice quiz from note content.

    Returns:
        {
            "title": str,
            "description": str,
            "questions": [
                {
                    "id": int,
                    "question": str,
                    "options": [{"id": "A"|"B"|"C"|"D", "text": str}],
                    "correct_answer": "A"|"B"|"C"|"D",
                    "explanation": str
                }, ...
            ]
        }
    """
    topic_hint = f" on the topic of {topic}" if topic else ""
    prompt = f"""You are an expert educational assistant. Create a {count}-question multiple choice quiz{topic_hint} from these notes.

Notes content:
{content[:8000]}

Respond ONLY with a valid JSON object — no markdown fences, no preamble:
{{
  "title": "Quiz title",
  "description": "Brief description of what this quiz tests",
  "questions": [
    {{
      "id": 1,
      "question": "Question text here?",
      "options": [
        {{"id": "A", "text": "Option A"}},
        {{"id": "B", "text": "Option B"}},
        {{"id": "C", "text": "Option C"}},
        {{"id": "D", "text": "Option D"}}
      ],
      "correct_answer": "A",
      "explanation": "Why this is correct..."
    }}
  ]
}}"""

    text = _chat([{"role": "user", "content": prompt}], max_tokens=2500)
    return _parse_json(text)


def generate_study_plan(notes_summaries: list, user_goals: str = "", days: int = 7) -> dict:
    """
    Generate a personalized study plan based on the user's uploaded notes.

    Args:
        notes_summaries: [{"title": str, "summary": str}, ...]
        user_goals:      optional free-text learning objective
        days:            plan duration in days

    Returns structured study plan dict.
    """
    notes_text = "\n\n".join([
        f"Topic: {n.get('title', 'Untitled')}\nSummary: {n.get('summary', '')}"
        for n in notes_summaries[:10]
    ])
    goals_line = f"User goals: {user_goals}" if user_goals else ""

    prompt = f"""You are an expert learning coach. Create a {days}-day study plan based on these notes.
{goals_line}

Available study materials:
{notes_text}

Respond ONLY with a valid JSON object — no markdown fences, no preamble:
{{
  "title": "Study Plan Title",
  "goal": "What the student will achieve",
  "duration_days": {days},
  "daily_study_time": "30-60 minutes",
  "days": [
    {{
      "day": 1,
      "theme": "Day theme",
      "objectives": ["objective 1", "objective 2"],
      "activities": [
        {{
          "type": "review|flashcards|quiz|reading|practice",
          "title": "Activity title",
          "duration": "15 minutes",
          "description": "What to do",
          "note_id": null
        }}
      ]
    }}
  ],
  "tips": ["study tip 1", "study tip 2"]
}}"""

    text = _chat([{"role": "user", "content": prompt}], max_tokens=3000)
    return _parse_json(text)


def explain_concept(concept: str, context: str = "", level: str = "intermediate") -> dict:
    """
    Explain a concept at the requested depth level using the student's notes as context.

    Returns:
        {
            "concept": str,
            "explanation": str,
            "analogy": str,
            "examples": [str, ...],
            "related_concepts": [str, ...],
            "key_takeaway": str
        }
    """
    context_line = f"Context from the student's notes:\n{context[:2000]}" if context else ""
    prompt = f"""You are an expert tutor. Explain the concept "{concept}" at a {level} level.
{context_line}

Respond ONLY with a valid JSON object — no markdown fences, no preamble:
{{
  "concept": "{concept}",
  "explanation": "Clear explanation here...",
  "analogy": "A helpful analogy...",
  "examples": ["example 1", "example 2"],
  "related_concepts": ["related1", "related2"],
  "key_takeaway": "The most important thing to remember"
}}"""

    text = _chat([{"role": "user", "content": prompt}], max_tokens=1000)
    return _parse_json(text)


def chat_with_notes(messages: list, notes_content: str) -> str:
    """
    Multi-turn chat grounded in the student's notes.

    Args:
        messages:      [{"role": "user"|"assistant", "content": str}, ...]
        notes_content: concatenated note text used as system context

    Returns:
        Assistant reply string.
    """
    system_prompt = (
        "You are a helpful study assistant. Answer questions about the student's notes. "
        "Be concise, clear, and educational. If the answer isn't in the notes, say so.\n\n"
        f"Student's notes content:\n{notes_content[:6000]}"
    )

    api_messages = [{"role": "system", "content": system_prompt}] + [
        {"role": m["role"], "content": m["content"]}
        for m in messages
    ]

    return _chat(api_messages, max_tokens=800)
