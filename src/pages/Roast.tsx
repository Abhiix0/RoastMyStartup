import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/brutal-card";
import { Download, Share2, ImageIcon, Flame, Skull, Heart, Lightbulb, PenLine, Target, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

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

const competitorData = [
  {
    name: "Stripe",
    description: "Payments infrastructure",
    whyBetter: ["Massive trust", "Global reach", "Deep integrations"],
    whyStruggle: ["No brand", "No money", "No partnerships"],
  },
  {
    name: "Notion",
    description: "All-in-one workspace",
    whyBetter: ["Cult following", "Feature-rich", "Enterprise ready"],
    whyStruggle: ["Late to market", "No differentiation", "Smaller team"],
  },
  {
    name: "Figma",
    description: "Collaborative design tool",
    whyBetter: ["Industry standard", "Adobe backing", "Real-time collab"],
    whyStruggle: ["No design cred", "Massive switching costs", "No community"],
  },
  {
    name: "Slack",
    description: "Team communication",
    whyBetter: ["Network effects", "Integrations ecosystem", "Brand recognition"],
    whyStruggle: ["Users hate change", "Enterprise contracts", "No distribution"],
  },
];

export default function Roast() {
  const [formData, setFormData] = useState({
    startupName: "",
    description: "",
    targetUsers: "",
    budget: "",
    roastLevel: "medium",
  });
  const [activeTab, setActiveTab] = useState("roast");
  const [hasRoast, setHasRoast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder - would trigger roast generation
    setHasRoast(true);
  };

  const placeholderContent = {
    roast: `💀 OH BOY, HERE WE GO...

"${formData.startupName || "Your Startup"}" - really? That's the name you went with?

Let me get this straight: You want to solve a problem that ${formData.targetUsers || "some imaginary users"} don't know they have, with a budget of ${formData.budget || "$0"}, in a market dominated by companies with actual resources.

Your idea description reads like you asked ChatGPT to generate "startup idea" and hit enter without reading the output.

The only thing disrupting here is your delusion disrupting reality.`,
    feedback: `📊 HONEST ASSESSMENT

Market Viability: 4/10
Your target market exists, but you haven't validated if they'd actually pay for this.

Differentiation: 3/10
You're competing with established players without a clear USP.

Execution Risk: High
The scope seems ambitious for your current resources.

Recommendation: Start smaller. Validate with 10 paying customers before building anything else.`,
    tips: `🛟 SURVIVAL GUIDE

1. Talk to 50 potential customers before writing another line of code
2. Find one specific problem you can solve exceptionally well
3. Your MVP should take 2 weeks, not 2 years
4. Revenue > Vanity metrics
5. Your co-founder's enthusiasm is not market validation`,
    rewrite: `✍️ PITCH REWRITE

Instead of: "${formData.description || "Your current pitch"}"

Try: "We help [specific user] solve [specific problem] by [unique approach], resulting in [measurable outcome]. We've already [traction/validation]."

Remember: Investors see 100 pitches a week. You have 30 seconds to not be forgettable.`,
  };

  const renderCompetitorCheck = () => {
    if (!hasRoast) {
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
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          Who already killed your idea? 😈
        </h3>

        <div className="grid gap-4">
          {competitorData.map((competitor, index) => (
            <div
              key={index}
              className="bg-background border-4 border-foreground p-4"
            >
              <div className="mb-3">
                <h4 className="text-lg font-bold">{competitor.name}</h4>
                <p className="text-muted-foreground text-sm">{competitor.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-sm mb-2">Why they're better:</p>
                  <ul className="text-sm space-y-1">
                    {competitor.whyBetter.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-sm mb-2">Why you'll struggle:</p>
                  <ul className="text-sm space-y-1">
                    {competitor.whyStruggle.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Warning Box */}
        <div className="border-4 border-accent bg-background p-4">
          <div className="flex items-center gap-2 font-bold text-accent">
            <AlertTriangle className="h-5 w-5" />
            Reality check: You're late to this market.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <BrutalButton variant="outline" size="sm">
            Find My Niche
          </BrutalButton>
          <BrutalButton variant="outline" size="sm">
            Generate Pivot Ideas
          </BrutalButton>
          <BrutalButton variant="outline" size="sm">
            Cry & Continue
          </BrutalButton>
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <section className="section-container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get Your Startup Roasted 🔥
          </h1>
          <p className="text-xl text-muted-foreground">
            Fill in the details. Brace for impact.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Panel */}
          <BrutalCard>
            <BrutalCardHeader>
              <BrutalCardTitle className="flex items-center gap-2">
                <Flame className="h-6 w-6" />
                Your Startup Details
              </BrutalCardTitle>
            </BrutalCardHeader>
            <BrutalCardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-bold mb-2">Startup Name</label>
                  <BrutalInput
                    placeholder="e.g., UberForDogs"
                    value={formData.startupName}
                    onChange={(e) =>
                      setFormData({ ...formData, startupName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">
                    Idea Description
                  </label>
                  <BrutalTextarea
                    placeholder="Describe your billion-dollar idea..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Target Users</label>
                  <BrutalInput
                    placeholder="e.g., Busy professionals aged 25-40"
                    value={formData.targetUsers}
                    onChange={(e) =>
                      setFormData({ ...formData, targetUsers: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Budget</label>
                  <BrutalInput
                    placeholder="e.g., $10,000"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block font-bold mb-4">Roast Level</label>
                  <div className="grid grid-cols-3 gap-4">
                    {roastLevels.map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, roastLevel: level.id })
                        }
                        className={`p-4 border-4 border-foreground text-center transition-transform hover:translate-x-1 hover:translate-y-1 ${
                          formData.roastLevel === level.id
                            ? "bg-primary"
                            : "bg-background"
                        }`}
                      >
                        <span className="text-2xl block mb-1">
                          {level.emoji}
                        </span>
                        <span className="font-bold text-sm">{level.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <BrutalButton type="submit" size="lg" className="w-full">
                  ROAST ME 😈
                </BrutalButton>
              </form>
            </BrutalCardContent>
          </BrutalCard>

          {/* Output Panel */}
          <BrutalCard className="bg-muted">
            <BrutalCardHeader>
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 border-4 border-foreground font-bold text-sm transition-transform ${
                        activeTab === tab.id
                          ? "bg-primary"
                          : "bg-background hover:translate-x-0.5 hover:translate-y-0.5"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </BrutalCardHeader>
            <BrutalCardContent>
              <div className="terminal-box min-h-[300px]">
                {activeTab === "competitors" ? (
                  renderCompetitorCheck()
                ) : hasRoast ? (
                  <pre className="whitespace-pre-wrap text-primary text-sm leading-relaxed">
                    {placeholderContent[activeTab as keyof typeof placeholderContent]}
                  </pre>
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
              <div className="flex flex-wrap gap-4 mt-6">
                <BrutalButton variant="outline" size="sm" disabled={!hasRoast}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Generate Meme
                </BrutalButton>
                <BrutalButton variant="outline" size="sm" disabled={!hasRoast}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </BrutalButton>
                <BrutalButton variant="outline" size="sm" disabled={!hasRoast}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </BrutalButton>
                <BrutalButton 
                  variant="outline" 
                  size="sm" 
                  disabled={!hasRoast}
                  onClick={() => setActiveTab("competitors")}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Reality Check
                </BrutalButton>
              </div>

              {hasRoast && (
                <div className="mt-6 pt-6 border-t-4 border-foreground">
                  <Link to="/result">
                    <BrutalButton className="w-full">
                      View Full Results
                    </BrutalButton>
                  </Link>
                </div>
              )}
            </BrutalCardContent>
          </BrutalCard>
        </div>
      </section>
    </PageLayout>
  );
}
