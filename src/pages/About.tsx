import { PageLayout } from "@/components/layout/PageLayout";
import { RetroUICard, RetroUICardContent, RetroUIBadge, RetroUIButton } from "@/components/retroui";
import { Flame, Heart, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";

const team = [
  {
    name: "Vedik",
    role: "Chief Destruction Officer",
    bio: "Former VC who got tired of being nice.",
  },
  {
    name: "Abhinav",
    role: "Head of Brutal Honesty",
    bio: "Killed 47 startups with feedback alone.",
  },
  {
    name: "Abhishek",
    role: "Lead Reality Check Engineer",
    bio: "Makes founders cry for a living.",
  },
  {
    name: "Mahesh",
    role: "Strategic Delusion Breaker",
    bio: "Exposes the one flaw founders pretend isn't real.",
  },
];

const values = [
  {
    icon: Target,
    title: "Brutal Honesty",
    description: "We tell you what your friends, family, and mentors are too nice to say.",
  },
  {
    icon: Heart,
    title: "Tough Love",
    description: "We hurt your feelings because we care about your success.",
  },
  {
    icon: Flame,
    title: "Constructive Destruction",
    description: "We tear down bad ideas so you can build better ones.",
  },
];

export default function About() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="section-container py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <RetroUIBadge className="mb-4 sm:mb-6">ABOUT US</RetroUIBadge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            We built this because mentors lie.
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600">
            Sometimes you need brutal honesty. Your accelerator mentor won't give it to you. 
            Your co-founder is too invested. Your mom thinks everything you do is amazing.
            <br /><br />
            We're here to be the honest friend you never had.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-yellow-400 py-12 sm:py-16 md:py-20">
        <div className="section-container">
          <div className="max-w-4xl mx-auto px-4">
            <RetroUICard className="bg-white brutal-rotate-neg-1">
              <RetroUICardContent className="text-center py-6 sm:py-8 md:py-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Our Mission</h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl">
                  To save founders from wasting years on doomed ideas 
                  by giving them the feedback they desperately need 
                  but are too afraid to ask for.
                </p>
              </RetroUICardContent>
            </RetroUICard>
          </div>
        </div>
      </section>

      {/* Why Brutal Feedback */}
      <section className="section-container py-12 sm:py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 px-4">
          Why Brutal Feedback Matters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <RetroUICard key={index} rotate={index === 1 ? "-1" : "1"}>
                <RetroUICardContent className="text-center py-6 sm:py-8">
                  <div className="inline-block bg-yellow-400 p-3 sm:p-4 border-2 border-black mb-3 sm:mb-4 retroui-shadow">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{value.title}</h3>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600">{value.description}</p>
                </RetroUICardContent>
              </RetroUICard>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-black text-white py-12 sm:py-16">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center px-4">
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-400">50K+</p>
              <p className="text-xs sm:text-sm mt-2">Ideas Roasted</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-400">89%</p>
              <p className="text-xs sm:text-sm mt-2">Pivoted Successfully</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-400">$0</p>
              <p className="text-xs sm:text-sm mt-2">Wasted on Bad Ideas</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-400">∞</p>
              <p className="text-xs sm:text-sm mt-2">Egos Destroyed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-container py-12 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4 px-4">
          The Roast Masters
        </h2>
        <p className="text-center text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12 px-4">
          Professional dream crushers at your service.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto px-4">
          {team.map((member, index) => (
            <RetroUICard key={index} className="text-center">
              <RetroUICardContent className="py-6 sm:py-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 border-2 border-black mx-auto mb-3 sm:mb-4 flex items-center justify-center retroui-shadow">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{member.name}</h3>
                <p className="text-yellow-600 font-bold text-xs sm:text-sm mb-2">
                  {member.role}
                </p>
                <p className="text-gray-600 text-xs sm:text-sm">{member.bio}</p>
              </RetroUICardContent>
            </RetroUICard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-100 py-12 sm:py-16 md:py-20">
        <div className="section-container text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Ready to face the truth?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Your startup idea is probably not as good as you think. 
            Let us help you find out.
          </p>
<<<<<<< Updated upstream
          <Link to="/roast">
            <RetroUIButton size="xl" className="text-base sm:text-lg md:text-xl h-14 sm:h-16">
=======
          <Link to="/auth/login">
            <RetroUIButton size="xl">
>>>>>>> Stashed changes
              GET ROASTED NOW 🔥
            </RetroUIButton>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
