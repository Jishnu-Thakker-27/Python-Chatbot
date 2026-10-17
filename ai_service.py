import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

def generate_fallback_reply(message: str, display_name: str) -> str:
    """Provides a warm, mindful fallback response if Gemini API key is missing or offline."""
    lower_msg = message.lower()
    if any(greeting in lower_msg for greeting in ["hello", "hi", "hey", "morning"]):
        return f"Good morning, {display_name}! 🌅 The air is fresh and ready for new possibilities. How are you feeling as you step into your day?"
    elif any(word in lower_msg for word in ["focus", "study", "work", "task", "project"]):
        return f"Deep focus is all about setting gentle boundaries with distractions, {display_name}. Would you like to set a 25-minute Pomodoro timer, or should we break down your main goal first?"
    elif any(word in lower_msg for word in ["meditat", "breath", "calm", "anxious", "stress"]):
        return f"Let's take a slow breath together, {display_name}. Inhale deeply through your nose for 4 seconds, hold for 4, and softly release. Remember that every moment is a chance to reset. What's on your mind?"
    elif any(word in lower_msg for word in ["music", "sound", "spatial", "audio"]):
        return f"Sound has a powerful impact on our nervous system. I recommend gentle 432Hz ambient frequencies or rain sounds to ground your focus while studying or working!"
    else:
        return f"That's a thoughtful question, {display_name}. Let's explore that together. What aspect is most important to you right now?"

def get_ai_response(message: str, display_name: str = "Friend", history: list = None) -> tuple[str, str]:
    """
    Sends message + context to Google Gemini API.
    Returns: (reply_text, source) where source is 'gemini' or 'fallback'.
    """
    # Always reload .env so user changes take effect immediately without restarting server
    load_dotenv(override=True)
    api_key = os.getenv("GEMINI_API_KEY")

    # If no API key is provided, return intelligent fallback
    if not api_key or api_key == "your_gemini_api_key_here":
        print("[Gemini Notice] GEMINI_API_KEY not configured. Using fallback AI response.")
        return generate_fallback_reply(message, display_name), "fallback"

    try:
        client = genai.Client(api_key=api_key)

        system_instruction = (
            f"You are Aether, a smart, direct, and helpful AI companion. "
            f"The user's name is {display_name}.\n\n"
            f"Strict response guidelines:\n"
            f"1. Be crisp, concise, and straight to the point. Do not use filler introductions or conversational fluff.\n"
            f"2. NEVER mention phrases like 'as of my knowledge cutoff', 'according to my knowledge', 'as an AI', or date limits. State facts directly, clearly, and confidently.\n"
            f"3. For direct questions (e.g. facts, names, definitions), provide the exact answer in 1-2 sentences.\n"
            f"4. For recommendations or lists, provide short, clear bullet points without rambling.\n"
            f"5. Always finish your thoughts completely."
        )

        # Build prompt or conversation contents
        chat_contents = []
        if history:
            for item in history[-6:]:  # Keep last 6 exchanges for context
                role = "user" if item.get("role") == "user" else "model"
                text = item.get("content", "")
                chat_contents.append(f"{role}: {text}")

        chat_contents.append(f"user: {message}")
        full_prompt = "\n".join(chat_contents)

        # Active Gemini models recommended by Google
        candidate_models = [
            "gemini-3.8-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash"
        ]

        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=full_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.3,
                        max_output_tokens=1024,
                    ),
                )
                reply = response.text
                if reply and reply.strip():
                    return reply.strip(), "gemini"
            except Exception as model_err:
                print(f"[Gemini Notice] Model {model_name} failed: {model_err}. Trying next candidate...")
                continue
    except Exception as e:
        print(f"[Gemini API Error] {e}")

    # Fallback if API call encountered any error (e.g. invalid key or network issue)
    return generate_fallback_reply(message, display_name), "fallback"
