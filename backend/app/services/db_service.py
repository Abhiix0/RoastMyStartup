import json
import logging
from datetime import datetime
from typing import Optional
from supabase import create_client, Client

from app.config.settings import settings
from app.schemas.roast import RoastRequest, RoastResponse

# Configure logging
logger = logging.getLogger(__name__)


class DatabaseService:
    """Service for persisting roast data to Supabase"""
    
    def __init__(self):
        """Initialize the Supabase client"""
        try:
            self.supabase: Client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
            logger.info("✅ Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {str(e)}")
            raise
    
    def upsert_user(self, email: str, name: str, provider_id: str, picture: Optional[str] = None, provider: str = "google") -> Optional[str]:
        """
        Create or update a user in the database (idempotent operation)
        
        Args:
            email: User's email address
            name: User's full name
            provider_id: Provider's unique user ID (required)
            picture: User's profile picture URL (optional)
            provider: OAuth provider (default: "google")
            
        Returns:
            str: The user's ID if successful, None if failed
            
        Note:
            Uses upsert to handle both new users and returning users.
            Unique constraint is (provider_id, provider) composite key.
        """
        try:
            user_data = {
                "provider_id": provider_id,
                "email": email,
                "name": name,
                "picture": picture,
                "provider": provider,
                "last_login": datetime.utcnow().isoformat(),
            }
            
            logger.info(f"Upserting user to database: {email} (provider: {provider}, provider_id: {provider_id})")
            
            # Upsert: insert if new, update if exists (based on provider_id + provider uniqueness)
            result = self.supabase.table("users").upsert(
                user_data,
                on_conflict="provider_id,provider"
            ).execute()
            
            if result.data:
                user_id = result.data[0].get("id")
                logger.info(f"✅ User {email} upserted successfully with ID: {user_id}")
                return user_id
            else:
                logger.error(f"❌ No data returned from user upsert for {email}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Failed to upsert user {email}: {str(e)}")
            return None
    
    def upsert_user(self, email: str, name: str, provider_id: str, picture: Optional[str] = None, provider: str = "google") -> Optional[str]:
        """
        Create or update a user in the database (idempotent operation)
        
        Args:
            email: User's email address
            name: User's full name
            provider_id: Provider's unique user ID (required)
            picture: User's profile picture URL (optional)
            provider: OAuth provider (default: "google")
            
        Returns:
            str: The user's ID if successful, None if failed
            
        Note:
            Uses upsert to handle both new users and returning users.
            Unique constraint is (provider_id, provider) composite key.
        """
        try:
            user_data = {
                "provider_id": provider_id,
                "email": email,
                "name": name,
                "picture": picture,
                "provider": provider,
                "last_login": datetime.utcnow().isoformat(),
            }
            
            logger.info(f"Upserting user to database: {email} (provider: {provider}, provider_id: {provider_id})")
            
            # Upsert: insert if new, update if exists (based on provider_id + provider uniqueness)
            result = self.supabase.table("users").upsert(
                user_data,
                on_conflict="provider_id,provider"
            ).execute()
            
            if result.data:
                user_id = result.data[0].get("id")
                logger.info(f"✅ User {email} upserted successfully with ID: {user_id}")
                return user_id
            else:
                logger.error(f"❌ No data returned from user upsert for {email}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Failed to upsert user {email}: {str(e)}")
            return None
    
    def log_login_event(self, user_id: str, provider: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> None:
        """
        Log a login event for audit trail
        
        Args:
            user_id: UUID of the user
            provider: OAuth provider (e.g., "google")
            ip_address: Client IP address (optional)
            user_agent: Client user agent string (optional)
            
        Note:
            This method should not raise exceptions - it logs errors but doesn't block login flow.
        """
        try:
            event_data = {
                "user_id": user_id,
                "provider": provider,
                "success": True,
                "timestamp": datetime.utcnow().isoformat(),
                "ip_address": ip_address,
                "user_agent": user_agent,
            }
            
            self.supabase.table("login_events").insert(event_data).execute()
            logger.info(f"✅ Login event logged for user {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to log login event for user {user_id}: {str(e)}")
    
    def get_user_by_email(self, email: str) -> Optional[dict]:
        """
        Retrieve a user by email address
        
        Args:
            email: User's email address
            
        Returns:
            dict: User record if found, None otherwise
        """
        try:
            result = self.supabase.table("users").select("*").eq("email", email).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            else:
                return None
                
        except Exception as e:
            logger.error(f"❌ Failed to get user by email {email}: {str(e)}")
            return None
    
    def save_roast(self, request: RoastRequest, response: RoastResponse, user_id: Optional[str] = None) -> Optional[dict]:
        """
        Save a roast generation to the database
        
        Args:
            request: The original roast request
            response: The generated roast response
            user_id: UUID of the authenticated user (optional)
            
        Returns:
            dict: The inserted record if successful, None if failed
            
        Note:
            This method should not raise exceptions - it logs errors and returns None
            to ensure the user still receives their roast even if DB save fails.
            
            If user_id is provided, links the roast to that user.
            If user_id is None, saves as anonymous roast (user_id = NULL).
        """
        try:
            # Prepare the data for insertion
            roast_data = {
                # Request fields
                "startup_name": request.startup_name,
                "idea_description": request.idea_description,
                "target_users": request.target_users,
                "budget": request.budget,
                "roast_level": request.roast_level,
                
                # Response fields
                "brutal_roast": response.brutal_roast,
                "honest_feedback": response.honest_feedback,
                "competitor_reality_check": response.competitor_reality_check,
                "survival_tips": response.survival_tips,  # This will be automatically converted to JSONB
                "pitch_rewrite": response.pitch_rewrite,
                
                # User linkage (can be NULL for anonymous roasts)
                "user_id": user_id,
                
                # Metadata
                "created_at": datetime.utcnow().isoformat(),
            }
            
            logger.info(f"Saving roast to database for startup: {request.startup_name} (user_id: {user_id or 'anonymous'})")
            
            # Insert the record into the roasts table
            result = self.supabase.table("roasts").insert(roast_data).execute()
            
            if result.data:
                logger.info(f"✅ Successfully saved roast for {request.startup_name} to database")
                return result.data[0]
            else:
                logger.error(f"❌ No data returned from database insert for {request.startup_name}")
                return None
                
        except Exception as e:
            # Log the error but don't raise - this is fail-safe behavior
            logger.error(f"❌ Failed to save roast for {request.startup_name} to database: {str(e)}")
            logger.error(f"   Request data: startup_name={request.startup_name}, roast_level={request.roast_level}")
            return None
    
    def get_roast_stats(self) -> Optional[dict]:
        """
        Get basic statistics about roasts in the database
        
        Returns:
            dict: Statistics if successful, None if failed
        """
        try:
            # Get total count
            total_result = self.supabase.table("roasts").select("id", count="exact").execute()
            total_count = total_result.count if total_result.count is not None else 0
            
            # Get count by roast level
            level_stats = {}
            for level in ["Soft", "Medium", "Nuclear"]:
                level_result = self.supabase.table("roasts").select("id", count="exact").eq("roast_level", level).execute()
                level_stats[level] = level_result.count if level_result.count is not None else 0
            
            return {
                "total_roasts": total_count,
                "roast_levels": level_stats,
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get roast statistics: {str(e)}")
            return None
    
    def health_check(self) -> bool:
        """
        Check if the database connection is healthy
        
        Returns:
            bool: True if healthy, False otherwise
        """
        try:
            # Simple query to test connection
            result = self.supabase.table("roasts").select("id").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"❌ Database health check failed: {str(e)}")
            return False


# Global database service instance
db_service = DatabaseService()