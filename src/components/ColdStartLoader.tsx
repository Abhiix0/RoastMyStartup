import { useState, useEffect } from "react";
import { RetroUICard } from "@/components/retroui/card";
import { Flame } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface ColdStartLoaderProps {
  onReady: () => void;
}

export function ColdStartLoader({ onReady }: ColdStartLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [backendReady, setBackendReady] = useState(false);

  // Backend health check
  useEffect(() => {
    const checkBackendHealth = async () => {
      while (!backendReady) {
        try {
          const response = await fetch(`${API_BASE_URL}/health`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === "alive") {
              setBackendReady(true);
              return;
            }
          }
        } catch (error) {
          // Silent retry - no error shown to user
        }
        
        // Wait 2 seconds before next attempt
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    };

    checkBackendHealth();
  }, [backendReady]);

  // Progress bar animation
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!backendReady) {
      // Fast phase: 0% → 90% (quick)
      if (progress < 90) {
        interval = setInterval(() => {
          setProgress((prev) => {
            const increment = Math.random() * 8 + 5; // 5-13% jumps
            const next = prev + increment;
            return next >= 90 ? 90 : next;
          });
        }, 300); // Fast updates
      }
      // Slow phase: 90% → 99% (crawl)
      else if (progress < 99) {
        interval = setInterval(() => {
          setProgress((prev) => {
            const increment = Math.random() * 0.5 + 0.2; // 0.2-0.7% tiny jumps
            const next = prev + increment;
            return next >= 99 ? 99 : next;
          });
        }, 1500); // Slow updates
      }
    } else {
      // Backend ready: jump to 100%
      setProgress(100);
      
      // Wait 300ms then render app
      setTimeout(() => {
        onReady();
      }, 300);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [progress, backendReady, onReady]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <RetroUICard className="w-full max-w-md text-center">
        <div className="py-12 px-6">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="bg-yellow-400 border-2 border-black p-4 retroui-shadow">
              <Flame className="h-12 w-12 text-black animate-pulse" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Warming up the roast engine… 
          </h1>

          {/* Subtext */}
          <p className="text-gray-600 font-medium mb-8">
            This won't take long. Probably.
          </p>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="w-full bg-white border-2 border-black h-8 retroui-shadow overflow-hidden">
              <div
                className="h-full bg-yellow-400 border-r-2 border-black transition-all duration-300 flex items-center justify-center"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && (
                  <span className="text-xs font-bold text-black">
                    {Math.floor(progress)}%
                  </span>
                )}
              </div>
            </div>

            {/* Percentage Display */}
            <p className="text-2xl font-bold">
              {Math.floor(progress)}%
            </p>

            {/* Status Messages */}
            <div className="text-sm font-medium text-gray-600 min-h-[20px]">
              {progress < 30 && "Initializing roast protocols..."}
              {progress >= 30 && progress < 60 && "Loading brutal honesty module..."}
              {progress >= 60 && progress < 90 && "Calibrating sarcasm levels..."}
              {progress >= 90 && progress < 100 && "Almost ready to destroy dreams..."}
              {progress === 100 && "Ready to roast! 🔥"}
            </div>
          </div>
        </div>
      </RetroUICard>
    </div>
  );
}
