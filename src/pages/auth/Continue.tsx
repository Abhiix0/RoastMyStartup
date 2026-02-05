import { useEffect, useState } from "react";
import { RetroUICard, RetroUICardContent, RetroUICardHeader, RetroUICardTitle } from "@/components/retroui/card";

const Continue = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <RetroUICard className="text-center">
          <RetroUICardHeader>
            <RetroUICardTitle className="text-3xl md:text-4xl mb-4">
              Preparing the roast…
            </RetroUICardTitle>
            <p className="text-lg font-bold text-gray-700">
              Buckle up. We're sharpening the knives.
            </p>
          </RetroUICardHeader>

          <RetroUICardContent className="py-8">
            {/* Animated Loader */}
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Knife Animation */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-4 border-black bg-yellow-400 animate-spin" style={{ animationDuration: "2s" }}>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-2 bg-black"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-16 bg-black"></div>
                  </div>
                </div>
              </div>

              {/* Loading Text */}
              <div className="h-8">
                <p className="text-xl font-bold">
                  Loading{dots}
                </p>
              </div>

              {/* Progress Bars */}
              <div className="w-full space-y-3">
                <div className="w-full bg-white border-2 border-black h-4 retroui-shadow overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 border-r-2 border-black animate-pulse"
                    style={{ width: "75%", animationDuration: "1.5s" }}
                  ></div>
                </div>
                <div className="w-full bg-white border-2 border-black h-4 retroui-shadow overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 border-r-2 border-black animate-pulse"
                    style={{ width: "45%", animationDuration: "2s" }}
                  ></div>
                </div>
                <div className="w-full bg-white border-2 border-black h-4 retroui-shadow overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 border-r-2 border-black animate-pulse"
                    style={{ width: "90%", animationDuration: "1s" }}
                  ></div>
                </div>
              </div>

              {/* Status Messages */}
              <div className="space-y-2 text-sm font-bold text-gray-600">
                <p className="animate-pulse">→ Analyzing your startup...</p>
                <p className="animate-pulse" style={{ animationDelay: "0.3s" }}>→ Finding weak spots...</p>
                <p className="animate-pulse" style={{ animationDelay: "0.6s" }}>→ Preparing brutal honesty...</p>
              </div>
            </div>
          </RetroUICardContent>
        </RetroUICard>
      </div>
    </div>
  );
};

export default Continue;
