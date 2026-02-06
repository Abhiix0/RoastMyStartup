"""
Google OAuth authentication routes for RoastMyStartup API

This module handles server-side Google OAuth flow:
1. /auth/google - Initiates OAuth flow by redirecting to Google
2. /auth/google/callback - Handles Google's callback, exchanges code for token,
   creates JWT, and redirects user back to frontend with token
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Optional
import requests
import jwt
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse

# Configure logging
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/auth", tags=["authentication"])

# Google OAuth configuration from environment variables
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

# JWT configuration from environment variables
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

# Frontend base URL from environment variables
# Defaults to localhost for local development if not set
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:8080")

# Construct frontend callback URL
FRONTEND_CALLBACK_URL = f"{FRONTEND_BASE_URL}/auth/callback"

# Google OAuth endpoints
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


def validate_oauth_config():
    """Validate that all required OAuth environment variables are set"""
    missing_vars = []
    
    if not GOOGLE_CLIENT_ID:
        missing_vars.append("GOOGLE_CLIENT_ID")
    if not GOOGLE_CLIENT_SECRET:
        missing_vars.append("GOOGLE_CLIENT_SECRET")
    if not GOOGLE_REDIRECT_URI:
        missing_vars.append("GOOGLE_REDIRECT_URI")
    if not JWT_SECRET_KEY:
        missing_vars.append("JWT_SECRET_KEY")
    
    if missing_vars:
        error_msg = f"Missing required OAuth environment variables: {', '.join(missing_vars)}"
        logger.error(error_msg)
        raise ValueError(error_msg)


def create_jwt_token(user_id: str, email: str, name: str, provider: str = "google") -> str:
    """
    Create a JWT token for an authenticated user
    
    Args:
        user_id: User's UUID from database
        email: User's email address
        name: User's full name
        provider: OAuth provider
        
    Returns:
        JWT token string
    """
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    
    payload = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "provider": provider,
        "exp": expiration
    }
    
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


@router.get("/google")
async def google_login():
    """
    Initiate Google OAuth flow
    
    Redirects the user to Google's OAuth consent screen.
    After user grants permission, Google redirects back to /auth/google/callback
    """
    try:
        # Validate configuration
        validate_oauth_config()
        
        # Build Google OAuth URL
        params = {
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "online",
            "prompt": "select_account"
        }
        
        # Construct the authorization URL
        auth_url = f"{GOOGLE_AUTH_URL}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
        
        logger.info("Redirecting user to Google OAuth consent screen")
        return RedirectResponse(url=auth_url)
        
    except ValueError as e:
        logger.error(f"OAuth configuration error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="OAuth configuration error. Please contact support."
        )
    except Exception as e:
        logger.error(f"Error initiating Google OAuth: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to initiate Google login. Please try again."
        )


@router.get("/google/callback")
async def google_callback(request: Request, code: Optional[str] = None, error: Optional[str] = None):
    """
    Handle Google OAuth callback
    
    This endpoint:
    1. Receives the authorization code from Google
    2. Exchanges the code for an access token
    3. Fetches user profile information (email, name)
    4. Generates a JWT token
    5. Redirects user back to frontend with the JWT token
    
    Args:
        code: Authorization code from Google
        error: Error message if OAuth failed
    """
    try:
        # Check if Google returned an error
        if error:
            logger.error(f"Google OAuth error: {error}")
            error_url = f"{FRONTEND_CALLBACK_URL}?error=oauth_failed"
            return RedirectResponse(url=error_url)
        
        # Validate that we received a code
        if not code:
            logger.error("No authorization code received from Google")
            error_url = f"{FRONTEND_CALLBACK_URL}?error=no_code"
            return RedirectResponse(url=error_url)
        
        # Validate configuration
        validate_oauth_config()
        
        logger.info("Exchanging authorization code for access token")
        
        # Exchange authorization code for access token
        token_data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }
        
        token_response = requests.post(GOOGLE_TOKEN_URL, data=token_data, timeout=10)
        
        if token_response.status_code != 200:
            logger.error(f"Failed to exchange code for token: {token_response.text}")
            error_url = f"{FRONTEND_CALLBACK_URL}?error=token_exchange_failed"
            return RedirectResponse(url=error_url)
        
        token_json = token_response.json()
        access_token = token_json.get("access_token")
        
        if not access_token:
            logger.error("No access token in Google response")
            error_url = f"{FRONTEND_CALLBACK_URL}?error=no_access_token"
            return RedirectResponse(url=error_url)
        
        logger.info("Successfully obtained access token, fetching user profile")
        
        # Fetch user profile information
        headers = {"Authorization": f"Bearer {access_token}"}
        userinfo_response = requests.get(GOOGLE_USERINFO_URL, headers=headers, timeout=10)
        
        if userinfo_response.status_code != 200:
            logger.error(f"Failed to fetch user info: {userinfo_response.text}")
            error_url = f"{FRONTEND_CALLBACK_URL}?error=userinfo_failed"
            return RedirectResponse(url=error_url)
        
        user_info = userinfo_response.json()
        email = user_info.get("email")
        name = user_info.get("name", "")
        provider_id = user_info.get("id")
        picture = user_info.get("picture")
        
        if not email or not provider_id:
            logger.error("No email or provider ID in user info response")
            error_url = f"{FRONTEND_CALLBACK_URL}?error=no_email"
            return RedirectResponse(url=error_url)
        
        logger.info(f"Successfully authenticated user: {email} (provider_id: {provider_id})")
        
        # Persist user to database (upsert to handle returning users)
        try:
            from app.services.db_service import db_service
            user_id = db_service.upsert_user(
                email=email, 
                name=name, 
                provider_id=provider_id,
                picture=picture,
                provider="google"
            )
            logger.info(f"User {email} persisted to database with ID: {user_id}")
            
            # Log the login event
            db_service.log_login_event(
                user_id=user_id,
                provider="google",
                ip_address=request.client.host if hasattr(request, 'client') else None,
                user_agent=request.headers.get("user-agent")
            )
        except Exception as db_error:
            # Log but don't block login if DB fails
            logger.error(f"Failed to persist user {email} to database: {str(db_error)}")
        
        # Generate JWT token
        jwt_token = create_jwt_token(user_id=user_id, email=email, name=name, provider="google")
        
        # Redirect to frontend with token
        callback_url = f"{FRONTEND_CALLBACK_URL}?token={jwt_token}"
        
        logger.info(f"Redirecting user {email} to frontend with JWT token")
        return RedirectResponse(url=callback_url)
        
    except requests.RequestException as e:
        logger.error(f"Network error during OAuth callback: {str(e)}")
        error_url = f"{FRONTEND_CALLBACK_URL}?error=network_error"
        return RedirectResponse(url=error_url)
        
    except ValueError as e:
        logger.error(f"OAuth configuration error: {str(e)}")
        error_url = f"{FRONTEND_CALLBACK_URL}?error=config_error"
        return RedirectResponse(url=error_url)
        
    except Exception as e:
        logger.error(f"Unexpected error in OAuth callback: {str(e)}")
        error_url = f"{FRONTEND_CALLBACK_URL}?error=unexpected_error"
        return RedirectResponse(url=error_url)
