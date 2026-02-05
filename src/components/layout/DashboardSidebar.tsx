import { Link, useLocation } from "react-router-dom";
import { Flame, History, Image, CreditCard, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const sidebarLinks = [
  { href: "/dashboard", label: "Roast History", icon: History, disabled: false },
  { href: "/dashboard/memes", label: "Saved Memes", icon: Image, disabled: true },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard, disabled: true },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, disabled: true },
];

export function DashboardSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-background border-r-2 border-foreground flex-col transition-all duration-200 hidden lg:flex ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="h-16 border-b-2 border-foreground flex items-center justify-between px-4">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 font-bold text-sm">
            <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-primary fill-primary" />
            <span className="hidden sm:inline">RoastMyStartup</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-muted border-2 border-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.href;

          if (link.disabled) {
            return (
              <div
                key={link.href}
                className="flex items-center gap-3 px-4 py-3 font-bold text-sm text-muted-foreground opacity-50 cursor-not-allowed"
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </div>
            );
          }

          return (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center gap-3 px-4 py-3 font-bold text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Banner */}
      {!collapsed && (
        <div className="p-4 border-t-2 border-foreground">
          <div className="bg-primary p-3 sm:p-4 border-2 border-foreground">
            <p className="font-bold text-xs sm:text-sm mb-2">Go Nuclear! 💀</p>
            <p className="text-xs mb-3">Unlock unlimited roasts</p>
            <Link
              to="/pricing"
              className="block text-center bg-secondary text-secondary-foreground py-2 px-3 sm:px-4 border-2 border-foreground font-bold text-xs sm:text-sm hover:translate-x-1 hover:translate-y-1 transition-transform"
            >
              UPGRADE
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
