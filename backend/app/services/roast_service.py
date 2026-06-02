import json
import logging
import google.generativeai as genai
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
from fastapi import HTTPException

from app.config.settings import settings
from app.schemas.roast import RoastRequest, RoastResponse

# Configure logging
logger = logging.getLogger(__name__)


class RoastService:
    """Service for generating startup roasts using Google Gemini with robust error handling"""

    def __init__(self):
        """Initialize the Gemini client with refined safety settings"""
        # Configure Gemini API
        genai.configure(api_key=settings.gemini_api_key)

        # Initialize the model with generation configuration
        generation_config = {
            "temperature": 0.7,  # Slightly more controlled for JSON output
            "top_p": 0.9,
            "top_k": 40,
            "max_output_tokens": 4096,  # Increased for longer responses
        }

        # Refined safety settings to allow "Nuclear" roasts while blocking harmful content
        safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_ONLY_HIGH",  # Allow roast-style mean humor
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_ONLY_HIGH",  # Allow sarcasm but block actual hate speech
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",  # Standard blocking
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",  # Block dangerous content
            },
        ]

        self.model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            generation_config=generation_config,
            safety_settings=safety_settings,
        )

    def _get_roast_tone_instruction(self, roast_level: str) -> str:
        """Get the tone instruction based on roast level"""
        tone_instructions = {
            "Soft": """
            Be constructive and gentle in your feedback. Use light humor and encouraging language.
            Focus on potential and growth opportunities. Be supportive while still being honest.
            Avoid harsh criticism and maintain a mentoring tone throughout.
            """,
            "Medium": """
            Be blunt and realistic, like standard VC feedback. Be direct about problems but professional.
            Use business terminology and focus on market realities. Be honest about challenges
            while providing actionable insights. Strike a balance between criticism and guidance.
            """,
            "Nuclear": """
            Roast them alive with brutal honesty and sharp wit. Be ruthlessly sarcastic and expose 
            every flaw with cutting observations. Use humor and exaggeration to make your points.
            Channel your inner Simon Cowell meets Gordon Ramsay in startup mode. Be savage but clever,
            not hateful. Focus on the business idea, not personal attacks. Make it entertaining while
            being devastatingly accurate about their startup's problems.
            """,
        }
        return tone_instructions.get(roast_level, tone_instructions["Medium"])

    def _build_prompt(self, request: RoastRequest) -> str:
        """Build the complete prompt for Gemini"""
        tone_instruction = self._get_roast_tone_instruction(request.roast_level)

        prompt = f"""
You are an expert startup advisor and investor with 20+ years of experience. You've seen thousands of startups, 
from unicorns to spectacular failures. Your job is to analyze this startup idea and provide comprehensive feedback.

TONE INSTRUCTION: {tone_instruction}

STARTUP DETAILS:
- Name: {request.startup_name}
- Idea: {request.idea_description}
- Target Users: {request.target_users}
- Budget: {request.budget}
- Requested Roast Level: {request.roast_level}

CRITICAL: You must respond with ONLY a valid JSON object. No markdown, no explanations, just pure JSON.

The JSON must have exactly these fields:
- brutal_roast: Your {request.roast_level.lower()} roast (max 300 words)
- honest_feedback: Constructive analysis (max 250 words)
- competitor_reality_check: Market analysis (max 200 words)
- survival_tips: Array of exactly 7 short, actionable tips
- pitch_rewrite: Improved pitch (max 150 words)

Keep each field concise to ensure valid JSON output. Reference their specific details: {request.startup_name}, their idea, {request.target_users}, and {request.budget}.

JSON Response:
"""
        return prompt

    def _clean_json_response(self, response_text: str) -> str:
        """
        Robust JSON cleaning to handle various markdown formatting issues

        Args:
            response_text: Raw response from Gemini

        Returns:
            Cleaned JSON string
        """
        # Strip whitespace
        cleaned = response_text.strip()

        # Remove markdown code fences
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]

        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

        # Remove any leading/trailing text that's not JSON
        # Find the first { and last }
        start_idx = cleaned.find("{")
        end_idx = cleaned.rfind("}")

        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            cleaned = cleaned[start_idx : end_idx + 1]

        # Fix common JSON issues
        # Replace smart quotes with regular quotes
        cleaned = cleaned.replace('"', '"').replace('"', '"')
        cleaned = cleaned.replace(""", "'").replace(""", "'")

        return cleaned.strip()

    def _validate_response_structure(self, response_data: dict) -> None:
        """
        Validate that the AI response has all required fields

        Args:
            response_data: Parsed JSON response

        Raises:
            ValueError: If required fields are missing or invalid
        """
        required_fields = [
            "brutal_roast",
            "honest_feedback",
            "competitor_reality_check",
            "survival_tips",
            "pitch_rewrite",
        ]
        missing_fields = [
            field for field in required_fields if field not in response_data
        ]

        if missing_fields:
            raise ValueError(f"AI response missing required fields: {missing_fields}")

        # Ensure survival_tips is a list
        if not isinstance(response_data["survival_tips"], list):
            raise ValueError("survival_tips must be a list of strings")

        # Ensure we have exactly 7 survival tips
        if len(response_data["survival_tips"]) != 7:
            logger.warning(
                f"Expected 7 survival tips, got {len(response_data['survival_tips'])}"
            )
            # Pad or truncate to exactly 7 tips
            tips = response_data["survival_tips"]
            if len(tips) < 7:
                # Pad with generic tips
                generic_tips = [
                    "Focus on customer validation before building features",
                    "Keep your burn rate low and runway long",
                    "Build a minimum viable product first",
                    "Get paying customers as soon as possible",
                    "Network with other entrepreneurs and mentors",
                    "Track your key metrics religiously",
                    "Be prepared to pivot based on market feedback",
                ]
                tips.extend(generic_tips[: 7 - len(tips)])
            else:
                tips = tips[:7]
            response_data["survival_tips"] = tips

    @retry(
        stop=stop_after_attempt(2),  # Retry exactly 1 time (2 total attempts)
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(
            (json.JSONDecodeError, ValueError, ConnectionError)
        ),
        reraise=True,
    )
    async def _generate_roast_with_retry(self, prompt: str, startup_name: str) -> dict:
        """
        Generate roast content with retry logic for API failures and JSON parsing errors

        Args:
            prompt: The formatted prompt for Gemini
            startup_name: Name of the startup for logging

        Returns:
            Parsed and validated response data

        Raises:
            Various exceptions that will be caught by the retry decorator
        """
        logger.info(f"Attempting to generate roast for: {startup_name}")

        try:
            # Generate content using Gemini
            response = self.model.generate_content(prompt)

            # Check if response was blocked by safety filters
            if not response.text:
                logger.error(f"Gemini response was blocked for {startup_name}")
                raise ValueError("Content generation was blocked by safety filters")

            # Clean and parse the JSON response
            cleaned_response = self._clean_json_response(response.text)

            try:
                response_data = json.loads(cleaned_response)
            except json.JSONDecodeError as e:
                logger.error(f"JSON parsing failed for {startup_name}: {e}")
                logger.error(f"Raw response: {response.text[:500]}...")
                logger.error(f"Cleaned response: {cleaned_response[:500]}...")
                raise  # This will trigger a retry

            # Validate the response structure
            self._validate_response_structure(response_data)

            logger.info(
                f"Successfully generated and validated roast for {startup_name}"
            )
            return response_data

        except Exception as e:
            logger.error(
                f"Error in roast generation attempt for {startup_name}: {str(e)}"
            )
            raise  # Re-raise to trigger retry logic

    async def analyze_startup(self, request: RoastRequest) -> RoastResponse:
        """
        Analyze a startup and generate a comprehensive roast with robust error handling

        Args:
            request: The startup details to analyze

        Returns:
            RoastResponse: The generated roast and feedback

        Raises:
            HTTPException: If all retry attempts fail
        """
        try:
            # Build the prompt
            prompt = self._build_prompt(request)

            # Generate roast with retry logic
            response_data = await self._generate_roast_with_retry(
                prompt, request.startup_name
            )

            # Create and validate the final response object
            roast_response = RoastResponse(**response_data)

            logger.info(
                f"Successfully completed roast analysis for {request.startup_name}"
            )
            return roast_response

        except Exception as e:
            # After all retries have failed, raise a user-friendly HTTP exception
            logger.error(
                f"All retry attempts failed for {request.startup_name}: {str(e)}"
            )

            # Determine the appropriate error message based on the exception type
            if "safety filters" in str(e).lower():
                error_msg = "Content generation was blocked due to safety restrictions. Please try a different startup idea or reduce the roast intensity."
            elif "json" in str(e).lower():
                error_msg = "AI response formatting error. Our roasting AI is having trouble expressing its thoughts coherently. Please try again."
            elif "missing" in str(e).lower() or "required fields" in str(e).lower():
                error_msg = "AI response validation failed. The roasting AI didn't provide complete feedback. Please try again."
            else:
                error_msg = "Our roasting AI is temporarily overwhelmed. Please try again in a moment."

            raise HTTPException(
                status_code=500, detail=f"Failed to generate startup roast: {error_msg}"
            )


# Global service instance
roast_service = RoastService()
