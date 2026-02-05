import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { RetroUIButton } from "@/components/retroui/button";
import { RetroUIInput } from "@/components/retroui/input";
import { RetroUITextarea } from "@/components/retroui/textarea";
import { RetroUICard, RetroUICardContent, RetroUICardHeader, RetroUICardTitle } from "@/components/retroui/card";
import { Download, Share2, ImageIcon, Flame, Skull, Heart, Lightbulb, PenLine, Target, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateRoast, type RoastResponse } from "@/lib/api";
import { hasReachedRoastLimit, incrementRoastCount, getCurrentUser } from "@/lib/auth";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer";

const roastLevels = [
  { id: "soft", name: "Soft", emoji: "🌶️", description: "Gentle feedback" },
  { id: "medium", name: "Medium", emoji: "🔥", description: "No sugarcoating" },
  { id: "nuclear", name: "Nuclear", emoji: "☢️", description: "Maximum damage" },
];

const tabs = [
  { id: "roast", label: "Brutal Roast", icon: Skull },
  { id: "feedback", label: "Honest Feedback", icon: Heart },
  { id: "competitors", label: "Competitor Reality Check", icon: Target },
  { id: "tips", label: "Survival Tips", icon: Lightbulb },
  { id: "rewrite", label: "Pitch Rewrite", icon: PenLine },
];


export default function Roast() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startupName: "",
    description: "",
    targetUsers: "",
    budget: "",
    roastLevel: "medium",
  });
  const [activeTab, setActiveTab] = useState("roast");
  const [roastData, setRoastData] = useState<RoastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isResultReady, setIsResultReady] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const user = getCurrentUser();
  const hasReachedLimit = hasReachedRoastLimit();

  // Check if form is valid
  const checkFormValidity = () => {
    const isValid = formData.startupName.trim() !== "" && 
                   formData.description.trim() !== "" && 
                   formData.targetUsers.trim() !== "" && 
                   formData.budget.trim() !== "";
    setIsFormValid(isValid);
    return isValid;
  };

  // Helper function to update form data and check validity
  const updateFormData = (updates: Partial<typeof formData>) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    
    // Check validity with new data
    const isValid = newFormData.startupName.trim() !== "" && 
                   newFormData.description.trim() !== "" && 
                   newFormData.targetUsers.trim() !== "" && 
                   newFormData.budget.trim() !== "";
    setIsFormValid(isValid);
  };

  // Clear all form fields
  const handleClearForm = () => {
    setFormData({
      startupName: "",
      description: "",
      targetUsers: "",
      budget: "",
      roastLevel: "medium",
    });
    setIsFormValid(false);
    setRoastData(null);
    setError(null);
    setActiveTab("roast");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has reached roast limit
    if (hasReachedLimit) {
      setShowLimitWarning(true);
      return;
    }
    
    checkFormValidity();
  };

  const handleRoastGeneration = async () => {
    // Double-check limit before generating
    if (hasReachedLimit) {
      setShowLimitWarning(true);
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingProgress(0);
    setIsResultReady(false);

    // Animate progress bar with honest progression
    const animateProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        setLoadingProgress((currentProgress) => {
          // Don't go beyond 99% until result is ready
          if (currentProgress >= 99) {
            return 99;
          }

          if (currentProgress < 80) {
            // Fast progress from 0 to 80%
            progress = currentProgress + (Math.random() * 6 + 3); // Random increment between 3-9
            return Math.min(progress, 80);
          } else if (currentProgress < 90) {
            // Slow down from 80 to 90%
            progress = currentProgress + (Math.random() * 1.5 + 0.5); // Random increment between 0.5-2
            return Math.min(progress, 90);
          } else {
            // Very slow from 90 to 99%
            progress = currentProgress + (Math.random() * 0.5 + 0.2); // Random increment between 0.2-0.7
            return Math.min(progress, 99);
          }
        });
      }, 200);
      
      return interval;
    };

    const progressInterval = animateProgress();

    try {
      // Map roast level from form format to API format
      const roastLevelMap: Record<string, "Soft" | "Medium" | "Nuclear"> = {
        soft: "Soft",
        medium: "Medium",
        nuclear: "Nuclear",
      };

      const response = await generateRoast({
        startup_name: formData.startupName,
        idea_description: formData.description,
        target_users: formData.targetUsers,
        budget: formData.budget,
        roast_level: roastLevelMap[formData.roastLevel] || "Medium",
      });

      // API response received - mark result as ready
      setIsResultReady(true);
      setRoastData(response);
      
      // Increment roast count (temporary - backend will handle this)
      incrementRoastCount();
      
      // Now complete the progress to 100%
      setLoadingProgress(100);
      
      // Immediately stop loading (no artificial delay)
      clearInterval(progressInterval);
      setLoading(false);
      setLoadingProgress(0);
      
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Failed to generate roast");
      console.error("Roast generation error:", err);
      setLoading(false);
      setLoadingProgress(0);
      setIsResultReady(false);
    }
  };


  const renderCompetitorCheck = () => {
    if (!roastData) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <div className="text-center">
            <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="font-bold">No competitors found.</p>
            <p className="text-sm mt-2">Which probably means nobody wants this.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <pre className="whitespace-pre-wrap text-primary text-sm leading-relaxed">
          {roastData.competitor_reality_check}
        </pre>
      </div>
    );
  };

  const renderSurvivalTips = () => {
    if (!roastData) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <div className="text-center">
            <Lightbulb className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="font-bold">No tips available yet.</p>
            <p className="text-sm mt-2">Generate a roast to see survival tips.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {roastData.survival_tips.map((tip, index) => (
          <div
            key={index}
            className="bg-background border-2 border-foreground p-4"
          >
            <p className="text-primary text-sm leading-relaxed">
              {index + 1}. {tip}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (!roastData) {
      return null;
    }

    switch (activeTab) {
      case "roast":
        return (
          <pre className="whitespace-pre-wrap text-primary text-sm leading-relaxed">
            {roastData.brutal_roast}
          </pre>
        );
      case "feedback":
        return (
          <pre className="whitespace-pre-wrap text-primary text-sm leading-relaxed">
            {roastData.honest_feedback}
          </pre>
        );
      case "competitors":
        return renderCompetitorCheck();
      case "tips":
        return renderSurvivalTips();
      case "rewrite":
        return (
          <pre className="whitespace-pre-wrap text-primary text-sm leading-relaxed">
            {roastData.pitch_rewrite}
          </pre>
        );
      default:
        return null;
    }
  };


  return (
    <PageLayout>
      <section className="section-container py-8 sm:py-10 md:py-12">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            Get Your Startup Roasted 🔥
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Fill in the details. Brace for impact.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {/* Form Panel */}
          <RetroUICard>
            <RetroUICardHeader>
              <div className="flex items-center justify-between w-full">
                <RetroUICardTitle className="flex items-center gap-2">
                  <Flame className="h-6 w-6" />
                  Your Startup Details
                </RetroUICardTitle>
                <RetroUIButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearForm}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </RetroUIButton>
              </div>
              {/* Usage Indicator */}
              {user && (
                <div className="mt-3 text-sm">
                  <span className="font-medium">
                    Roasts remaining: <span className="font-bold">{6 - user.roastCount} / 6</span>
                  </span>
                  {hasReachedLimit && (
                    <span className="ml-2 text-muted-foreground">
                      (Limit reached)
                    </span>
                  )}
                </div>
              )}
            </RetroUICardHeader>
            <RetroUICardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block font-bold mb-2">Startup Name</label>
                  <RetroUIInput
                    placeholder="e.g., UberForDogs"
                    value={formData.startupName}
                    onChange={(e) =>
                      updateFormData({ startupName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">
                    Idea Description
                  </label>
                  <RetroUITextarea
                    placeholder="Describe your billion-dollar idea..."
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData({ description: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Target Users</label>
                  <RetroUIInput
                    placeholder="e.g., Busy professionals aged 25-40"
                    value={formData.targetUsers}
                    onChange={(e) =>
                      updateFormData({ targetUsers: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Budget</label>
                  <RetroUIInput
                    placeholder="e.g., $10,000"
                    value={formData.budget}
                    onChange={(e) =>
                      updateFormData({ budget: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block font-bold mb-4">Roast Level</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {roastLevels.map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() =>
                          updateFormData({ roastLevel: level.id })
                        }
                        className={`p-3 sm:p-4 border-2 border-foreground text-center transition-transform hover:translate-x-1 hover:translate-y-1 ${
                          formData.roastLevel === level.id
                            ? "bg-primary"
                            : "bg-background"
                        }`}
                      >
                        <span className="text-xl sm:text-2xl block mb-1">
                          {level.emoji}
                        </span>
                        <span className="font-bold text-xs sm:text-sm">{level.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Drawer>
                  <DrawerTrigger asChild>
                    <RetroUIButton 
                      type="submit" 
                      size="lg" 
                      className="w-full" 
                      disabled={loading || !isFormValid}
                    >
                      {loading ? "ROASTING..." : "ROAST ME 😈"}
                    </RetroUIButton>
                  </DrawerTrigger>
                  <DrawerContent className="border-2 border-foreground [&>div:first-child]:hidden">
                    {/* Custom handle - black, centered, properly positioned */}
                    <div className="mx-auto mt-4 h-1 w-[100px] rounded-full bg-foreground" />
                    
                    <DrawerHeader className="text-center px-6 py-8">
                      <DrawerTitle className="text-2xl font-bold mb-6 text-center">
                        ⚠️ Are you absolutely sure?
                      </DrawerTitle>
                      <DrawerDescription className="text-lg mb-4 max-w-md mx-auto text-center text-justify">
                        You're about to receive unfiltered, brutally honest feedback on your startup. 
                        This is not validation. This is not encouragement. Some lines may sting. 
                        Some may hurt a lot.
                      </DrawerDescription>
                      <p className="text-sm text-muted-foreground text-center">
                        Once you proceed, there's no undo. Screenshots last forever.
                      </p>
                    </DrawerHeader>
                    <DrawerFooter className="px-6 pb-8">
                      <div className="flex gap-4 justify-center items-center">
                        <DrawerClose asChild>
                          <RetroUIButton 
                            onClick={handleRoastGeneration}
                            size="lg"
                            disabled={loading}
                          >
                            🔥 Roast Me Anyway
                          </RetroUIButton>
                        </DrawerClose>
                        <DrawerClose asChild>
                          <RetroUIButton variant="outline" size="lg">
                            😌 I'm Not Ready Yet
                          </RetroUIButton>
                        </DrawerClose>
                      </div>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
                {error && (
                  <div className="bg-destructive/10 border-2 border-destructive p-4 text-destructive font-bold">
                    {error}
                  </div>
                )}
              </form>
            </RetroUICardContent>
          </RetroUICard>

          {/* Output Panel */}
          <RetroUICard className="bg-muted">
            <RetroUICardHeader>
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 border-2 border-foreground font-bold text-xs sm:text-sm transition-transform ${
                        activeTab === tab.id
                          ? "bg-primary"
                          : "bg-background hover:translate-x-0.5 hover:translate-y-0.5"
                      }`}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </RetroUICardHeader>
            <RetroUICardContent>
              <div className={`terminal-box min-h-[300px] transition-opacity duration-200 ${loading ? 'opacity-100' : 'opacity-100'}`}>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="w-full max-w-md px-6">
                      <div className="text-center mb-6">
                        <Flame className="h-12 w-12 mx-auto mb-3 text-yellow-400 animate-pulse" />
                        <p className="font-bold text-xl mb-2 text-white">Preparing emotional damage...</p>
                        <p className="text-sm text-gray-300 font-medium">This won't take long</p>
                      </div>
                      
                      {/* Animated Progress Bar */}
                      <div className="relative">
                        <div className="w-full h-8 bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 transition-all duration-200 ease-out flex items-center justify-end pr-2"
                            style={{ width: `${loadingProgress}%` }}
                          >
                            {loadingProgress > 15 && (
                              <span className="text-xs font-bold text-black">
                                {Math.round(loadingProgress)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <span className="text-sm font-semibold text-gray-200">
                            {loadingProgress < 30 && "Analyzing your idea..."}
                            {loadingProgress >= 30 && loadingProgress < 60 && "Finding flaws..."}
                            {loadingProgress >= 60 && loadingProgress < 85 && "Crafting brutal honesty..."}
                            {loadingProgress >= 85 && loadingProgress < 99 && "Almost done..."}
                            {loadingProgress >= 99 && "Finalizing roast..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : roastData ? (
                  <div className="animate-in fade-in duration-300">
                    {renderContent()}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <div className="text-center">
                      <Skull className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="font-bold">Your roast will appear here...</p>
                      <p className="text-sm mt-2">Fill in the form and submit to get roasted</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-6">
                <RetroUIButton variant="outline" size="sm" disabled className="flex-1 sm:flex-none text-xs sm:text-sm">
                  <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Generate Meme</span>
                  <span className="sm:hidden">Meme</span>
                </RetroUIButton>
                <RetroUIButton variant="outline" size="sm" disabled className="flex-1 sm:flex-none text-xs sm:text-sm">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </RetroUIButton>
                <RetroUIButton variant="outline" size="sm" disabled className="flex-1 sm:flex-none text-xs sm:text-sm">
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Share
                </RetroUIButton>
              </div>

              {roastData && (
                <div className="mt-6 pt-6 border-t-2 border-foreground">
                  <RetroUIButton
                    className="w-full"
                    onClick={() =>
                      navigate("/result", { state: { roast: roastData } })
                    }
                  >
                    View Analysis Dashboard
                  </RetroUIButton>
                </div>
              )}
            </RetroUICardContent>
          </RetroUICard>
        </div>
      </section>

      {/* Roast Limit Warning Drawer */}
      <Drawer open={showLimitWarning} onOpenChange={setShowLimitWarning}>
        <DrawerContent className="border-2 border-foreground [&>div:first-child]:hidden">
          {/* Custom handle - black, centered, properly positioned */}
          <div className="mx-auto mt-4 h-1 w-[100px] rounded-full bg-foreground" />
          
          <DrawerHeader className="text-center px-6 py-8">
            <DrawerTitle className="text-2xl font-bold mb-6 text-center">
              🔒 Roast limit reached
            </DrawerTitle>
            <DrawerDescription className="text-lg mb-4 max-w-md mx-auto text-center">
              You've used all 6 free roasts.
              <br />
              That's enough emotional damage for now.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="px-6 pb-8">
            <div className="flex flex-col gap-3 justify-center items-center">
              <RetroUIButton 
                onClick={() => {
                  setShowLimitWarning(false);
                  navigate("/pricing");
                }}
                size="lg"
              >
                Upgrade Your Plan
              </RetroUIButton>
              <RetroUIButton 
                variant="outline" 
                size="lg"
                onClick={() => {
                  setShowLimitWarning(false);
                  navigate("/pricing");
                }}
              >
                View Pricing
              </RetroUIButton>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </PageLayout>
  );
}
