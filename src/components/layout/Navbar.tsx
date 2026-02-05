import { Link, useLocation, useNavigate } from "react-router-dom";
import { RetroUIButton } from "@/components/retroui";
import { Flame, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { getRoastNavigationPath } from "@/lib/navigation";
import { isAuthenticated, getCurrentUser, clearAuthData } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "dynamic-roast", label: "Get Roasted" }, // Special marker for dynamic routing
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const roastPath = getRoastNavigationPath();
  const isLoggedIn = isAuthenticated();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearAuthData();
    navigate("/");
  };

  // Add Dashboard to nav links if logged in
  const displayNavLinks = isLoggedIn
    ? [
        { href: "/", label: "Home" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "dynamic-roast", label: "Get Roasted" },
        { href: "/pricing", label: "Pricing" },
        { href: "/about", label: "About" },
      ]
    : navLinks;

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
            {displayNavLinks.map((link) => {
              const href = link.href === "dynamic-roast" ? roastPath : link.href;
              const isActive = link.href === "dynamic-roast" 
                ? location.pathname === "/roast" || location.pathname.startsWith("/auth")
                : location.pathname === link.href;
              
              return (
                <Link
                  key={link.label}
                  to={href}
                  className={`px-3 lg:px-4 py-2 font-bold text-sm lg:text-base transition-colors ${
                    isActive
                      ? "bg-yellow-400 text-black"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 border-2 border-black bg-white retroui-shadow hover:translate-x-0.5 hover:translate-y-0.5 transition-transform">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-2 border-black retroui-shadow bg-white">
                  <div className="px-3 py-2">
                    <p className="font-bold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-black h-0.5" />
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-muted-foreground mb-1">Current Plan</p>
                    <div className="inline-block px-2 py-0.5 bg-gray-100 border border-black text-xs font-bold">
                      Free
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-black h-0.5" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer font-bold focus:bg-red-100 hover:bg-red-100 focus:text-red-600 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to={roastPath}>
                <RetroUIButton size="sm" className="text-sm lg:text-base">
                  ROAST ME 🔥
                </RetroUIButton>
              </Link>
            )}
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
            {displayNavLinks.map((link) => {
              const href = link.href === "dynamic-roast" ? roastPath : link.href;
              const isActive = link.href === "dynamic-roast"
                ? location.pathname === "/roast" || location.pathname.startsWith("/auth")
                : location.pathname === link.href;
              
              return (
                <Link
                  key={link.label}
                  to={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-4 font-bold border-b-2 border-black text-sm ${
                    isActive
                      ? "bg-yellow-400 text-black"
                      : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {isLoggedIn && user ? (
              <>
                <div className="px-4 py-4 border-b-2 border-black">
                  <p className="font-bold text-sm mb-1">{user.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{user.email}</p>
                  <div className="inline-block px-2 py-1 bg-gray-100 border border-black text-xs font-bold">
                    Free Plan
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-4 font-bold border-b-2 border-black text-sm text-left flex items-center gap-2 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="p-4">
                <Link to={roastPath} onClick={() => setMobileMenuOpen(false)}>
                  <RetroUIButton className="w-full">
                    ROAST ME 🔥
                  </RetroUIButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
