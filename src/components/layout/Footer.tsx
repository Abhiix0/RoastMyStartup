import { Link } from "react-router-dom";
import { Flame, Twitter, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white border-t-2 border-black">
      <div className="section-container py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl mb-3 sm:mb-4">
              <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 fill-yellow-400" />
              <span>RoastMyStartup</span>
            </Link>
            <p className="text-sm sm:text-base text-gray-300 max-w-md">
              Brutally honest AI feedback for startup ideas. 
              Because your friends are too nice to tell you the truth.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Product</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <Link to="/auth/login" className="hover:text-yellow-400 transition-colors">
                  Get Roasted
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-yellow-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-yellow-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Company</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <Link to="/about" className="hover:text-yellow-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t-2 border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-gray-400 text-center md:text-left">
            © 2024 RoastMyStartup. All feelings hurt intentionally.
          </p>
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="#"
              className="p-2 border-2 border-gray-700 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors retroui-shadow"
            >
              <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a
              href="#"
              className="p-2 border-2 border-gray-700 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors retroui-shadow"
            >
              <Github className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
