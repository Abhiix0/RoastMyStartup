from typing import List, Literal
from pydantic import BaseModel, Field


class RoastRequest(BaseModel):
    """Request schema for startup roast submission"""

    startup_name: str = Field(
        ..., min_length=1, max_length=100, description="Name of the startup"
    )
    idea_description: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Description of the startup idea",
    )
    target_users: str = Field(
        ..., min_length=5, max_length=500, description="Target user base description"
    )
    budget: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Budget information (flexible format)",
    )
    roast_level: Literal["Soft", "Medium", "Nuclear"] = Field(
        ..., description="Intensity level of the roast"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "startup_name": "PetRock 2.0",
                "idea_description": "We're revolutionizing the pet industry with AI-powered rocks that provide emotional support",
                "target_users": "Millennials who want pets but can't commit to real animals",
                "budget": "$50k",
                "roast_level": "Medium",
            }
        }


class RoastResponse(BaseModel):
    """Response schema for startup roast results"""

    brutal_roast: str = Field(..., description="The harsh reality check")
    honest_feedback: str = Field(..., description="Constructive criticism and insights")
    competitor_reality_check: str = Field(
        ..., description="Analysis of competitive landscape"
    )
    survival_tips: List[str] = Field(
        ..., description="Actionable advice for improvement"
    )
    pitch_rewrite: str = Field(..., description="Improved version of the pitch")

    class Config:
        json_schema_extra = {
            "example": {
                "brutal_roast": "Your idea is basically selling rocks to people who think they're buying innovation...",
                "honest_feedback": "While the concept is creative, you need to focus on real value proposition...",
                "competitor_reality_check": "You're competing against actual pet stores, adoption centers, and therapy apps...",
                "survival_tips": [
                    "Pivot to actual pet care services",
                    "Focus on real emotional wellness solutions",
                    "Consider B2B applications for stress relief",
                ],
                "pitch_rewrite": "We provide mindfulness and stress-relief solutions through tactile meditation tools...",
            }
        }
