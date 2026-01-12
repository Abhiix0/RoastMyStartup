/**
 * API client for RoastMyStartup backend
 */

export interface RoastRequest {
  startup_name: string;
  idea_description: string;
  target_users: string;
  budget: string;
  roast_level: "Soft" | "Medium" | "Nuclear";
}

export interface RoastResponse {
  brutal_roast: string;
  honest_feedback: string;
  competitor_reality_check: string;
  pitch_rewrite: string;
  survival_tips: string[];
}

const API_BASE_URL = "https://roast-my-startup-api.onrender.com";

/**
 * Generate a roast for a startup idea
 * @param request - The roast request data
 * @returns Promise resolving to the roast response
 * @throws Error if the API call fails
 */
export async function generateRoast(
  request: RoastRequest
): Promise<RoastResponse> {
  const response = await fetch(`${API_BASE_URL}/roast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to generate roast: ${response.status} ${response.statusText}. ${errorText}`
    );
  }

  return response.json();
}