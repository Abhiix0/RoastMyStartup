import { Link, useLocation } from "react-router-dom";
import { RetroUIButton } from "@/components/retroui";
import { Flame, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/auth/login", label: "Get Roasted" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b-2 border-black sticky top-0 z-50">
      <div className="section-container">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl">
            <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 fill-yellow-400" />
            <span className="hidden sm:inline">RoastMyStartup</span>
            <span className="sm:hidden">RMS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 lg:px-4 py-2 font-bold text-sm lg:text-base transition-colors ${
                  location.pathname === link.href
                    ? "bg-yellow-400 text-black"
                    : "hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
<<<<<<< Updated upstream
            <Link to="/roast">
              <RetroUIButton size="sm" className="text-sm lg:text-base">
=======
            <Link to="/auth/login">
              <RetroUIButton size="sm">
>>>>>>> Stashed changes
                ROAST ME 🔥
              </RetroUIButton>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 border-2 border-black retroui-shadow"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-white">
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-4 font-bold border-b-2 border-black text-sm ${
                  location.pathname === link.href
                    ? "bg-yellow-400 text-black"
                    : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="p-4">
              <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <RetroUIButton className="w-full">
                  ROAST ME 🔥
                </RetroUIButton>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
