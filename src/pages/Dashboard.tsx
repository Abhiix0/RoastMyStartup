import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { RetroUIBadge } from "@/components/retroui/badge";
import { RetroUIButton } from "@/components/retroui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Skull } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";

export default function Dashboard() {
  const user = getCurrentUser();
  const roastCount = user?.roastCount || 0;
  const hasReachedLimit = roastCount >= 6;
  
  // TODO: Replace with actual API call to fetch user's roasts
  const userRoasts: any[] = [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 flex-col lg:flex-row">
        <DashboardSidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Roast History</h1>
              <RetroUIBadge>{userRoasts.length} Roasts</RetroUIBadge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your collection of brutal truths and emotional damage.
            </p>
            {/* Usage Indicator */}
            <div className="mt-3">
              <p className="text-sm font-medium">
                Roasts used: <span className="font-bold">{roastCount} / 6</span>
              </p>
              {hasReachedLimit && (
                <p className="text-sm text-muted-foreground mt-1">
                  <Link to="/pricing" className="font-bold underline hover:text-yellow-600">
                    Upgrade to continue roasting 🔥
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <div className="bg-primary p-4 sm:p-6 border-2 border-foreground">
              <p className="text-xs sm:text-sm font-bold opacity-80">Total Roasts</p>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold">{roastCount}</p>
            </div>
            <div className="bg-secondary text-secondary-foreground p-4 sm:p-6 border-2 border-foreground">
              <p className="text-xs sm:text-sm font-bold opacity-80">Avg Score</p>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold">{roastCount > 0 ? "8.7" : "—"}</p>
            </div>
            <div className="bg-muted p-4 sm:p-6 border-2 border-foreground">
              <p className="text-xs sm:text-sm font-bold opacity-80">Tears Shed</p>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold">{roastCount > 0 ? "∞" : "0"}</p>
            </div>
          </div>

          {/* Empty State (centered) */}
          {userRoasts.length === 0 && (
            <div className="text-center py-16 sm:py-20">
              <Skull className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">No roasts yet.</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Your first startup roast is waiting to happen.
              </p>
              <Link to="/roast">
                <RetroUIButton size="lg" className="mb-3">
                  Roast a Startup
                </RetroUIButton>
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Takes less than a minute. Hurts forever.
              </p>
            </div>
          )}

          {/* Roast Grid (for future data) */}
          {userRoasts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
              {userRoasts.map((roast) => (
                <div
                  key={roast.id}
                  className="border-2 border-black retroui-shadow bg-white p-6"
                >
                  <h3 className="text-xl font-bold mb-2">{roast.startupName}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">{roast.date}</span>
                    <span className="text-sm font-bold">•</span>
                    <span className="text-sm font-bold">{roast.roastLevel}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {roast.preview}
                  </p>
                  <RetroUIButton variant="outline" size="sm" className="w-full">
                    View Roast
                  </RetroUIButton>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
