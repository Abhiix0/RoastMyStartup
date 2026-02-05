import { useLocation, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { RetroUIButton } from "@/components/retroui/button";
import { RetroUICard, RetroUICardContent } from "@/components/retroui/card";
import { RetroUIProgress } from "@/components/retroui/progress";
import { ScoreMeter } from "@/components/roast/ScoreMeter";
import { Share2, RotateCcw, Zap, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { RoastResponse } from "@/lib/api";
import { getRoastNavigationPath, getPricingCTAPath } from "@/lib/navigation";

// Generate random score between min and max
const generateRandomScore = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const metricLabels = [
  "Originality",
  "Market Fit",
  "Founder Sanity",
  "Investor Appeal",
  "Execution Feasibility",
];

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [roastData, setRoastData] = useState<RoastResponse | null>(null);
  const [metrics, setMetrics] = useState<
    Array<{ label: string; value: number; max: number }>
  >([]);
  const [roastScore, setRoastScore] = useState(0);

  useEffect(() => {
    // Get roast data from navigation state
    const state = location.state as { roast?: RoastResponse } | null;
    if (state?.roast) {
      setRoastData(state.roast);
      // Generate random scores
      const newMetrics = metricLabels.map((label) => ({
        label,
        value: generateRandomScore(1, 10),
        max: 10,
      }));
      setMetrics(newMetrics);
      // Calculate average score
      const average =
        newMetrics.reduce((sum, m) => sum + m.value, 0) / newMetrics.length;
      setRoastScore(Math.round(average * 10) / 10);
    } else {
      // If no data, redirect to roast page
      navigate("/roast", { replace: true });
    }
  }, [location.state, navigate]);

  // Show loading or redirect message if no data
  if (!roastData) {
    return (
      <PageLayout>
        <section className="section-container py-12">
          <div className="text-center">
            <p>Redirecting to roast page...</p>
          </div>
        </section>
      </PageLayout>
    );
  }

  // Extract quotes from roast data for display
  const extractQuotes = () => {
    const quotes: string[] = [];
    // Get first few sentences from brutal_roast as quotes
    const brutalLines = roastData.brutal_roast
      .split(/[.!?]\s+/)
      .filter((line) => line.trim().length > 20)
      .slice(0, 3);
    quotes.push(...brutalLines.map((q) => q.trim()));
    return quotes;
  };

  const savageQuotes = extractQuotes();

  return (
    <PageLayout>
      <section className="section-container py-8 sm:py-10 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            Your Roast Results 💀
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            The truth hurts. Here's yours.
          </p>
        </div>

        {/* Score */}
        <div className="mb-8 sm:mb-10 md:mb-12 px-4">
          <ScoreMeter score={roastScore} />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12 max-w-6xl mx-auto">
          {metrics.map((metric) => (
            <RetroUICard key={metric.label}>
              <RetroUICardContent>
                <RetroUIProgress
                  label={metric.label}
                  value={metric.value}
                  max={metric.max}
                />
              </RetroUICardContent>
            </RetroUICard>
          ))}
        </div>

        {/* Savage Quotes */}
        <div className="mb-8 sm:mb-10 md:mb-12 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center">
            Highlights from Your Roast 🔥
          </h2>
          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {savageQuotes.map((quote, index) => (
              <RetroUICard
                key={index}
                rotate={index % 2 === 0 ? "1" : "-1"}
                className="bg-muted"
              >
                <RetroUICardContent className="flex gap-3 sm:gap-4">
                  <Quote className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 text-primary" />
                  <p className="text-base sm:text-lg md:text-xl font-medium italic">"{quote}"</p>
                </RetroUICardContent>
              </RetroUICard>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <RetroUICard className="max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12 bg-primary">
          <RetroUICardContent className="text-center py-6 sm:py-8 md:py-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">The Verdict</h3>
            <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 whitespace-pre-wrap">
              {roastData.honest_feedback}
            </p>
            <div className="inline-block bg-secondary text-secondary-foreground px-4 sm:px-6 md:px-8 py-2 sm:py-3 border-2 border-foreground font-bold text-sm sm:text-base md:text-lg">
              Survival Chance: {Math.round((roastScore / 10) * 100)}%
            </div>
          </RetroUICardContent>
        </RetroUICard>

        {/* Detailed Sections */}
        <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto mb-8 sm:mb-10 md:mb-12 px-4">
          <RetroUICard>
            <RetroUICardContent className="py-4 sm:py-6 md:py-8">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                💀 Brutal Roast
              </h3>
              <p className="text-base sm:text-lg md:text-xl whitespace-pre-wrap">
                {roastData.brutal_roast}
              </p>
            </RetroUICardContent>
          </RetroUICard>

          <RetroUICard>
            <RetroUICardContent className="py-4 sm:py-6 md:py-8">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                🎯 Competitor Reality Check
              </h3>
              <p className="text-base sm:text-lg md:text-xl whitespace-pre-wrap">
                {roastData.competitor_reality_check}
              </p>
            </RetroUICardContent>
          </RetroUICard>

          <RetroUICard>
            <RetroUICardContent className="py-4 sm:py-6 md:py-8">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                🛟 Survival Tips
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {roastData.survival_tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 sm:gap-3">
                    <span className="font-bold text-primary">{index + 1}.</span>
                    <p className="text-base sm:text-lg md:text-xl">{tip}</p>
                  </li>
                ))}
              </ul>
            </RetroUICardContent>
          </RetroUICard>

          <RetroUICard>
            <RetroUICardContent className="py-4 sm:py-6 md:py-8">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                ✍️ Pitch Rewrite
              </h3>
              <p className="text-base sm:text-lg md:text-xl whitespace-pre-wrap">
                {roastData.pitch_rewrite}
              </p>
            </RetroUICardContent>
          </RetroUICard>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4">
          <RetroUIButton size="lg" className="w-full sm:w-auto">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Share Results
          </RetroUIButton>
          <Link to={getRoastNavigationPath()} className="w-full sm:w-auto">
            <RetroUIButton variant="outline" size="lg" className="w-full">
              <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Try Again
            </RetroUIButton>
          </Link>
          <Link to={getPricingCTAPath()} className="w-full sm:w-auto">
            <RetroUIButton variant="secondary" size="lg" className="w-full">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Upgrade for More
            </RetroUIButton>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
