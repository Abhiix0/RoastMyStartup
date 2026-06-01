import { Link, useSearchParams } from "react-router-dom";
import { RetroUIButton } from "@/components/retroui/button";
import { RetroUIInput } from "@/components/retroui/input";
import { RetroUICard, RetroUICardContent, RetroUICardHeader, RetroUICardTitle } from "@/components/retroui/card";
import { OAUTH_ENDPOINTS } from "@/lib/api";

const Signup = () => {
  const [searchParams] = useSearchParams();
  
  const handleGoogleSignup = () => {
    // Get redirect parameter if it exists
    const redirect = searchParams.get("redirect");
    
    // Store redirect in sessionStorage so we can retrieve it after OAuth callback
    if (redirect) {
      sessionStorage.setItem("auth_redirect", redirect);
    }
    
    // Redirect to backend OAuth endpoint (same as login)
    window.location.href = OAUTH_ENDPOINTS.googleLogin;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <RetroUICard>
          <RetroUICardHeader>
            <RetroUICardTitle className="text-3xl md:text-4xl text-center mb-2">
              Before we roast your startup…
            </RetroUICardTitle>
          </RetroUICardHeader>

          <RetroUICardContent>
            <div className="space-y-4">
              {/* OAuth Buttons */}
              <div className="space-y-3">
                <RetroUIButton
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3"
                  onClick={handleGoogleSignup}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </RetroUIButton>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-black"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white font-bold">OR</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold mb-2">
                    Email
                  </label>
                  <RetroUIInput
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-bold mb-2">
                    Password
                  </label>
                  <RetroUIInput
                    id="password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-bold mb-2">
                    Confirm Password
                  </label>
                  <RetroUIInput
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>



                <RetroUIButton
                  variant="default"
                  className="w-full"
                  onClick={() => console.log("Signup (UI only)")}
                >
                  Create Account
                </RetroUIButton>
              </div>

              {/* Footer Links */}
              <div className="text-center text-sm space-y-2 pt-2">
                <p className="font-medium">
                  Already have an account?{" "}
                  <Link to="/auth/login" className="font-bold underline hover:text-yellow-600">
                    Login
                  </Link>
                </p>
                <p>
                  <Link to="/" className="font-bold underline hover:text-yellow-600">
                    Back to home
                  </Link>
                </p>
              </div>
            </div>
          </RetroUICardContent>
        </RetroUICard>
      </div>
    </div>
  );
};

export default Signup;
