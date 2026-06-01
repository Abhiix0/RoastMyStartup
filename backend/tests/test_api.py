#!/usr/bin/env python3
"""
Simple test script to demonstrate the RoastMyStartup API functionality.
Run this after starting the server to test both valid and invalid requests.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health check endpoint"""
    print("🔍 Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_valid_roast():
    """Test a valid roast request"""
    print("✅ Testing valid roast request...")
    
    valid_data = {
        "startup_name": "PetRock 2.0",
        "idea_description": "We're revolutionizing the pet industry with AI-powered rocks that provide emotional support to busy professionals",
        "target_users": "Millennials who want pets but can't commit to real animals",
        "budget": "$50k",
        "roast_level": "Nuclear"
    }
    
    response = requests.post(f"{BASE_URL}/roast", json=valid_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Brutal Roast: {result['brutal_roast'][:100]}...")
        print(f"Survival Tips Count: {len(result['survival_tips'])}")
        print("✅ Valid request successful!")
    else:
        print(f"❌ Unexpected error: {response.text}")
    print()

def test_invalid_roast_level():
    """Test invalid roast level validation"""
    print("❌ Testing invalid roast level...")
    
    invalid_data = {
        "startup_name": "TestStartup",
        "idea_description": "A revolutionary app that does something amazing",
        "target_users": "Everyone who needs this",
        "budget": "$10k",
        "roast_level": "Insane"  # Invalid - should be Soft, Medium, or Nuclear
    }
    
    response = requests.post(f"{BASE_URL}/roast", json=invalid_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 422:
        error = response.json()
        print(f"Validation Error: {error['detail'][0]['msg']}")
        print("✅ Validation working correctly!")
    else:
        print(f"❌ Expected 422 validation error, got: {response.status_code}")
    print()

def test_missing_fields():
    """Test missing required fields validation"""
    print("❌ Testing missing required fields...")
    
    incomplete_data = {
        "startup_name": "TestStartup",
        # Missing other required fields
    }
    
    response = requests.post(f"{BASE_URL}/roast", json=incomplete_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 422:
        error = response.json()
        missing_fields = [detail['loc'][-1] for detail in error['detail']]
        print(f"Missing fields detected: {missing_fields}")
        print("✅ Required field validation working!")
    else:
        print(f"❌ Expected 422 validation error, got: {response.status_code}")
    print()

if __name__ == "__main__":
    print("🚀 RoastMyStartup API Test Suite")
    print("=" * 50)
    
    try:
        test_health_endpoint()
        test_valid_roast()
        test_invalid_roast_level()
        test_missing_fields()
        
        print("🎉 All tests completed!")
        print("\n📖 API Documentation available at: http://localhost:8000/docs")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server.")
        print("Make sure the server is running: uvicorn app.main:app --reload")