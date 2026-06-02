from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Gemini API Configuration
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"  # Updated to use available model

    # Supabase Configuration
    supabase_url: str
    supabase_key: str

    # Google OAuth Configuration (optional - only needed for auth endpoints)
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_redirect_uri: Optional[str] = None

    # JWT Configuration (optional - only needed for auth endpoints)
    jwt_secret_key: Optional[str] = None
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24

    # Frontend Configuration (optional - for OAuth redirects)
    frontend_base_url: str = "http://localhost:8080"

    # Application Configuration
    app_name: str = "RoastMyStartup API"
    debug: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Validate critical settings
        if not self.gemini_api_key:
            raise ValueError(
                "GEMINI_API_KEY is required but not found in environment variables. "
                "Please set GEMINI_API_KEY in your .env file or environment."
            )

        if not self.supabase_url or not self.supabase_key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_KEY are required but not found in environment variables. "
                "Please set SUPABASE_URL and SUPABASE_KEY in your .env file or environment."
            )


# Global settings instance
settings = Settings()
