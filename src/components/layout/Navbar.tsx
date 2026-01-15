import { Link, useLocation } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Flame, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/roast", label: "Get Roasted" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-background border-b-4 border-foreground sticky top-0 z-50">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Flame className="h-8 w-8 text-primary fill-primary" />
            <span className="hidden sm:inline">RoastMyStartup</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 font-bold transition-colors ${
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link to="/roast">
              <BrutalButton size="sm">
                ROAST ME 🔥
              </BrutalButton>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 border-4 border-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-4 border-foreground bg-background">
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-4 font-bold border-b-4 border-foreground ${
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="p-4">
              <Link to="/roast" onClick={() => setMobileMenuOpen(false)}>
                <BrutalButton className="w-full">
                  ROAST ME 🔥
                </BrutalButton>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
