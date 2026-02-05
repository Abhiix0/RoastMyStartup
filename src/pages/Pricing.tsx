import { PageLayout } from "@/components/layout/PageLayout";
import { PricingCard } from "@/components/roast/PricingCard";
import { RetroUICard, RetroUICardContent } from "@/components/retroui/card";
import { RetroUIBadge } from "@/components/retroui/badge";
import { Check } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "FREE",
    price: "Free",
    description: "Dip your toes in the roasting pool",
    features: [
      { text: "1 roast per day", included: true },
      { text: "Soft roast mode only", included: true },
      { text: "Basic feedback", included: true },
      { text: "PDF downloads", included: false },
      { text: "Meme generator", included: false },
      { text: "Investor feedback mode", included: false },
    ],
    buttonText: "Start Free",
    isPopular: false,
  },
  {
    name: "PRO",
    price: "$19",
    description: "For founders who can handle the heat",
    features: [
      { text: "Unlimited roasts", included: true },
      { text: "All roast levels including Nuclear ☢️", included: true },
      { text: "Detailed investor feedback", included: true },
      { text: "Pitch rewrite suggestions", included: true },
      { text: "PDF downloads", included: true },
      { text: "Meme generator", included: true },
    ],
    buttonText: "Go Nuclear 💀",
    isPopular: true,
  },
];

const faqs = [
  {
    question: "Will this actually help my startup?",
    answer: "If honest feedback helps, yes. If you need validation and hugs, probably not.",
  },
  {
    question: "Is the AI really that brutal?",
    answer: "On Nuclear mode? We've made VCs cry. And they don't have feelings.",
  },
  {
    question: "Can I get a refund if my feelings are hurt?",
    answer: "No, but you can get a better startup idea. That's worth more.",
  },
  {
    question: "Do you offer team plans?",
    answer: "Contact us if you need to roast an entire accelerator batch at once.",
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <section className="section-container py-12 sm:py-16 md:py-20">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 px-4">
          <RetroUIBadge className="mb-3 sm:mb-4">PRICING</RetroUIBadge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            Choose Your Pain Level
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Free roasts are nice. But real founders go Nuclear.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-12 sm:mb-16 md:mb-20">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} onSelect={() => navigate("/auth/login")} />
          ))}
        </div>

        {/* Comparison */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-16 md:mb-20 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8">
            Why Go Pro? 🔥
          </h2>
          <RetroUICard className="bg-muted">
            <RetroUICardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">Free</h3>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                    Like asking your mom for feedback. She'll say it's nice, but you know she's lying.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">Pro</h3>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                    Like having a brutally honest VC on speed dial. Painful, but you'll actually improve.
                  </p>
                </div>
              </div>
            </RetroUICardContent>
          </RetroUICard>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
            Questions? 🤔
          </h2>
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-2 border-foreground bg-background retroui-shadow"
              >
                <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-base sm:text-lg hover:no-underline hover:bg-muted/50 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-3 sm:pb-4 text-sm sm:text-base text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Money Back */}
        <div className="text-center mt-12 sm:mt-16 px-4">
          <RetroUICard className="inline-block bg-primary max-w-2xl">
            <RetroUICardContent className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
              <Check className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="font-bold text-sm sm:text-base">
                No money-back guarantee. Because growth doesn't come from comfort.
              </span>
            </RetroUICardContent>
          </RetroUICard>
        </div>
      </section>
    </PageLayout>
  );
}
