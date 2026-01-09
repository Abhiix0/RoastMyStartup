import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalBadge } from "@/components/ui/brutal-badge";
import { BrutalCard, BrutalCardContent } from "@/components/ui/brutal-card";
import { AlertTriangle, ArrowRight, Flame, Skull, Zap } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    icon: "⭐⭐⭐⭐⭐",
    text: "This hurt. But it helped.",
    rotate: "1" as const,
  },
  {
    icon: "💀",
    text: "My co-founder cried.",
    rotate: "-1" as const,
  },
  {
    icon: "🔥",
    text: "Better than my mentor.",
    rotate: "2" as const,
  },
];

const steps = [
  {
    number: "01",
    title: "Paste your idea",
    description: "Describe your startup in all its glory",
    icon: "📝",
  },
  {
    number: "02",
    title: "Choose roast level",
    description: "From gentle criticism to emotional devastation",
    icon: "🎚️",
  },
  {
    number: "03",
    title: "Cry → Improve → Win",
    description: "Turn brutal feedback into success",
    icon: "🏆",
  },
];

const roastLevels = [
  { name: "Soft Roast", emoji: "🌶️", description: "Constructive with a hint of sarcasm" },
  { name: "Medium Roast", emoji: "🔥", description: "Honest feedback, no sugarcoating" },
  { name: "Nuclear Roast", emoji: "☢️", description: "Prepare for emotional damage" },
];

export default function Index() {
  const [selectedLevel, setSelectedLevel] = useState(1);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="section-container py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <BrutalBadge variant="destructive" className="inline-flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Emotional Damage Guaranteed
            </BrutalBadge>
            <BrutalBadge variant="default" className="inline-flex items-center gap-2">
              🔥 NEW: Competitor Reality Check
            </BrutalBadge>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
            We destroy your startup idea{" "}
            <span className="bg-primary px-2">before investors do.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Brutally honest AI feedback. No sugarcoating. No mercy.
          </p>
          
          <p className="text-sm text-muted-foreground mb-10 max-w-xl mx-auto">
            We tell you who already beat you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/roast">
              <BrutalButton size="xl" className="w-full sm:w-auto">
                ROAST MY IDEA
                <Flame className="ml-2 h-6 w-6" />
              </BrutalButton>
            </Link>
            <Link to="/about">
              <BrutalButton variant="outline" size="xl" className="w-full sm:w-auto">
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </BrutalButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-muted border-y-4 border-foreground py-16">
        <div className="section-container">
          <h2 className="text-3xl font-bold text-center mb-12">
            What founders are saying 💀
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <BrutalCard key={index} rotate={testimonial.rotate}>
                <BrutalCardContent className="text-center py-8">
                  <p className="text-5xl mb-4">{testimonial.icon}</p>
                  <p className="text-lg font-bold">"{testimonial.text}"</p>
                </BrutalCardContent>
              </BrutalCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-container py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="inline-block bg-primary px-4 py-2 border-4 border-foreground mb-4">
                <span className="text-3xl font-bold">{step.number}</span>
              </div>
              <p className="text-6xl mb-4">{step.icon}</p>
              <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roast Level Preview */}
      <section className="bg-secondary text-secondary-foreground py-20">
        <div className="section-container">
          <h2 className="text-4xl font-bold text-center mb-12">
            Choose Your Pain Level
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {roastLevels.map((level, index) => (
              <button
                key={level.name}
                onClick={() => setSelectedLevel(index)}
                className={`px-6 py-4 border-4 border-secondary-foreground font-bold text-lg transition-transform hover:translate-x-1 hover:translate-y-1 ${
                  selectedLevel === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary-foreground text-secondary"
                }`}
              >
                {level.emoji} {level.name}
              </button>
            ))}
          </div>
          <div className="max-w-2xl mx-auto">
            <BrutalCard className="bg-background text-foreground">
              <BrutalCardContent className="text-center py-8">
                <p className="text-xl font-bold mb-2">
                  {roastLevels[selectedLevel].name}
                </p>
                <p className="text-muted-foreground">
                  {roastLevels[selectedLevel].description}
                </p>
              </BrutalCardContent>
            </BrutalCard>
          </div>
        </div>
      </section>

      {/* Sample Roast */}
      <section className="section-container py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Sample Roast 🔥
        </h2>
        <div className="max-w-3xl mx-auto">
          <div className="terminal-box font-mono">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <span className="w-3 h-3 bg-accent rounded-full" />
              <span className="w-3 h-3 bg-primary rounded-full" />
              <span className="w-3 h-3 bg-muted rounded-full" />
              <span className="ml-4">roast_output.txt</span>
            </div>
            <p className="text-primary text-lg leading-relaxed">
              &gt; Another AI SaaS? Groundbreaking.
              <br />
              &gt; Did you also invent water?
              <br />
              <br />
              &gt; Your TAM calculation assumes everyone on Earth
              <br />
              &gt; will pay $99/month for something ChatGPT does for free.
              <br />
              <br />
              &gt; "Disrupting" an industry you learned about
              <br />
              &gt; from a TikTok video is a bold strategy.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-20 border-y-4 border-foreground">
        <div className="section-container text-center">
          <Skull className="h-20 w-20 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to face the truth?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Your idea might be the next unicorn. Or it might be the next cautionary tale.
            Only one way to find out.
          </p>
          <Link to="/roast">
            <BrutalButton variant="secondary" size="xl">
              DESTROY MY STARTUP
              <Zap className="ml-2 h-6 w-6" />
            </BrutalButton>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
