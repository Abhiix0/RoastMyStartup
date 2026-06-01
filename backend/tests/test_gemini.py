#!/usr/bin/env python3
"""
Simple test script to test Gemini integration directly.
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.roast_service import roast_service
from app.schemas.roast import RoastRequest

async def test_gemini():
    """Test Gemini integration directly"""
    print("🔍 Testing Gemini integration...")
    
    # Create a test request
    test_request = RoastRequest(
        startup_name="TestStartup",
        idea_description="A simple app that helps people organize their daily tasks",
        target_users="Busy professionals",
        budget="$10k",
        roast_level="Soft"
    )
    
    try:
        print(f"📤 Sending request for: {test_request.startup_name}")
        result = await roast_service.analyze_startup(test_request)
        
        print("✅ Success! Generated roast:")
        print(f"Brutal Roast: {result.brutal_roast[:100]}...")
        print(f"Survival Tips Count: {len(result.survival_tips)}")
        print("🎉 Gemini integration working!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_gemini())