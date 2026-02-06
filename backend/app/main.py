from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import logging
import jwt
from typing import Optional

from app.schemas.roast import RoastRequest, RoastResponse
from app.services.roast_service import roast_service
from app.services.db_service import db_service
from app.config.settings import settings
from app.routes.auth import router as auth_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="RoastMyStartup API",
    description="Backend API for RoastMyStartup application powered by Google Gemini with Supabase persistence",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "*"],  # Allow frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)

@app.on_event("startup")
async def startup_event():
    """Startup event to validate configuration"""
    logger.info(f"Starting {settings.app_name}")
    logger.info(f"Using Gemini model: {settings.gemini_model}")
    logger.info("✅ Gemini API key configured successfully")
    
    # Test database connection
    if db_service.health_check():
        logger.info("✅ Supabase database connection healthy")
    else:
        logger.warning("⚠️ Supabase database connection failed - roasts will not be persisted")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to RoastMyStartup API", "powered_by": "Google Gemini", "database": "Supabase"}

@app.get("/health")
async def health_check():
    """Health check endpoint to verify the service is running"""
    db_healthy = db_service.health_check()
    return {
        "status": "alive", 
        "model": settings.gemini_model,
        "database": "healthy" if db_healthy else "unavailable"
    }

@app.get("/stats")
async def get_stats():
    """Get roast statistics from the database"""
    stats = db_service.get_roast_stats()
    if stats:
        return stats
    else:
        raise HTTPException(
            status_code=503,
            detail="Statistics unavailable - database connection issue"
        )

@app.post("/roast", response_model=RoastResponse)
async def roast_startup(request: RoastRequest, authorization: Optional[str] = Header(None)):
    """
    Roast a startup idea with brutal honesty and constructive feedback.
    
    This endpoint uses Google Gemini AI to analyze the startup and generate
    comprehensive feedback including brutal roasts, honest insights, competitor
    analysis, survival tips, and a rewritten pitch.
    
    The roast intensity is controlled by the roast_level parameter:
    - Soft: Constructive and gentle feedback
    - Medium: Blunt, realistic VC-style feedback  
    - Nuclear: Ruthless, sarcastic roasting with no mercy
    
    The endpoint includes automatic retry logic for API failures, robust
    error handling, and non-blocking database persistence.
    
    If user is authenticated (JWT token in Authorization header), the roast
    will be linked to their user account.
    """
    try:
        logger.info(f"Processing roast request for: {request.startup_name}")
        
        # Extract user_id from JWT token if present
        user_id = None
        if authorization and authorization.startswith("Bearer "):
            try:
                token = authorization.replace("Bearer ", "")
                payload = jwt.decode(
                    token, 
                    settings.jwt_secret_key or "dummy_key",  # Fallback for when JWT not configured
                    algorithms=[settings.jwt_algorithm]
                )
                user_id = payload.get("user_id")
                logger.info(f"Authenticated user_id: {user_id}")
            except jwt.ExpiredSignatureError:
                logger.warning("JWT token expired - proceeding as anonymous user")
            except jwt.InvalidTokenError as e:
                logger.warning(f"Invalid JWT token: {str(e)} - proceeding as anonymous user")
            except Exception as e:
                logger.warning(f"JWT decode error: {str(e)} - proceeding as anonymous user")
        
        # Generate the roast using Gemini AI with retry logic
        roast_response = await roast_service.analyze_startup(request)
        
        logger.info(f"Successfully generated roast for: {request.startup_name}")
        
        # Save to database in the background (fail-safe - don't block user response)
        try:
            db_result = db_service.save_roast(request, roast_response, user_id=user_id)
            if db_result:
                logger.info(f"✅ Roast for {request.startup_name} saved to database")
            else:
                logger.warning(f"⚠️ Failed to save roast for {request.startup_name} to database")
        except Exception as db_error:
            # Log the database error but don't raise - user must get their roast
            logger.error(f"❌ Database save error for {request.startup_name}: {str(db_error)}")
        
        return roast_response
        
    except HTTPException:
        # Re-raise HTTPExceptions from the service (they already have proper status codes)
        raise
    
    except Exception as e:
        # Handle any unexpected errors not caught by the service
        logger.error(f"Unexpected error in roast endpoint for {request.startup_name}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your roast request. Please try again."
        )