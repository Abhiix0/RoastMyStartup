import logging
from typing import Optional
from supabase import create_client, Client
from app.config.settings import settings
from app.schemas.roast import RoastRequest, RoastResponse

logger = logging.getLogger(__name__)


class DatabaseService:
    def __init__(self):
        try:
            self.supabase: Client = create_client(
                settings.supabase_url, settings.supabase_key
            )
            logger.info("✅ Supabase client initialized")
        except Exception as e:
            logger.error(f"❌ Supabase init failed: {e}")
            raise

    # ── Users ──────────────────────────────────────────────────────────────────

    def upsert_user(
        self,
        email: str,
        name: str,
        provider_id: str,
        picture: Optional[str] = None,
        provider: str = "google",
    ) -> Optional[str]:
        """Create or update a user. Returns the user's UUID."""
        try:
            result = (
                self.supabase.table("users")
                .upsert(
                    {
                        "email": email,
                        "name": name,
                        "provider_id": provider_id,
                        "picture": picture,
                        "provider": provider,
                        # last_login updated on every upsert — DB handles created_at
                        "last_login": "now()",
                    },
                    on_conflict="provider_id,provider",
                )
                .execute()
            )

            if result.data:
                user_id = result.data[0]["id"]
                logger.info(f"✅ User upserted: {email} → {user_id}")
                return user_id

            logger.error(f"❌ Upsert returned no data for {email}")
            return None

        except Exception as e:
            logger.error(f"❌ upsert_user failed for {email}: {e}")
            return None

    def get_user_roast_count(self, user_id: str) -> int:
        """Count active (non-deleted) roasts for a user."""
        if not user_id:
            return 0
        try:
            result = (
                self.supabase.table("roasts")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .is_("deleted_at", "null")
                .execute()
            )
            return result.count or 0
        except Exception as e:
            logger.error(f"❌ get_user_roast_count failed for {user_id}: {e}")
            return 0

    # ── Roasts ─────────────────────────────────────────────────────────────────

    def save_roast(
        self,
        request: RoastRequest,
        response: RoastResponse,
        user_id: Optional[str] = None,
    ) -> Optional[dict]:
        """
        Persist a roast to the database.
        Fail-safe: logs errors but never raises — user must get their roast.
        """
        try:
            result = (
                self.supabase.table("roasts")
                .insert(
                    {
                        "startup_name": request.startup_name,
                        "idea_description": request.idea_description,
                        "target_users": request.target_users,
                        "budget": request.budget,
                        "roast_level": request.roast_level,
                        "brutal_roast": response.brutal_roast,
                        "honest_feedback": response.honest_feedback,
                        "competitor_reality_check": response.competitor_reality_check,
                        "survival_tips": response.survival_tips,
                        "pitch_rewrite": response.pitch_rewrite,
                        "user_id": user_id,
                        # created_at is set by DB DEFAULT NOW() — don't send it
                    }
                )
                .execute()
            )

            if result.data:
                logger.info(
                    f"✅ Roast saved: {request.startup_name} (user: {user_id or 'anon'})"
                )
                return result.data[0]

            logger.error(f"❌ Insert returned no data for {request.startup_name}")
            return None

        except Exception as e:
            logger.error(f"❌ save_roast failed for {request.startup_name}: {e}")
            return None

    def get_roasts_by_user(self, user_id: str) -> list[dict]:
        """Get all active roasts for an authenticated user, newest first."""
        try:
            result = (
                self.supabase.table("roasts")
                .select("id, startup_name, roast_level, brutal_roast, created_at")
                .eq("user_id", user_id)
                .is_("deleted_at", "null")
                .order("created_at", desc=True)
                .execute()
            )
            return result.data or []
        except Exception as e:
            logger.error(f"❌ get_roasts_by_user failed for {user_id}: {e}")
            return []

    def get_roast_stats(self) -> Optional[dict]:
        """
        Return aggregate roast stats.
        Uses a single query + Python aggregation instead of 4 round trips.
        """
        try:
            # One query, count by level in Python — far more efficient
            result = (
                self.supabase.table("roasts")
                .select("roast_level")
                .is_("deleted_at", "null")
                .execute()
            )

            rows = result.data or []
            total = len(rows)
            by_level = {"Soft": 0, "Medium": 0, "Nuclear": 0}
            for row in rows:
                level = row.get("roast_level")
                if level in by_level:
                    by_level[level] += 1

            return {"total_roasts": total, "roast_levels": by_level}

        except Exception as e:
            logger.error(f"❌ get_roast_stats failed: {e}")
            return None

    # ── Auth / Audit ────────────────────────────────────────────────────────────

    def log_login_event(
        self,
        user_id: str,
        provider: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> None:
        """Log a login event. Never raises — must not block the login flow."""
        try:
            self.supabase.table("login_events").insert(
                {
                    "user_id": user_id,
                    "provider": provider,
                    "success": True,
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    # created_at is set by DB DEFAULT NOW()
                }
            ).execute()
            logger.info(f"✅ Login event logged for {user_id}")
        except Exception as e:
            logger.error(f"❌ log_login_event failed for {user_id}: {e}")

    # ── Health ─────────────────────────────────────────────────────────────────

    def health_check(self) -> bool:
        try:
            self.supabase.table("roasts").select("id").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"❌ Health check failed: {e}")
            return False


db_service = DatabaseService()
