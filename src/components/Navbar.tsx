import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, BookOpen, Users, UserPlus, Heart, Mail, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

const leftLinks = [
  { label: "Blog", to: "/blog", icon: BookOpen },
  { label: "Departments", to: "/departments", icon: Users },
  { label: "Join Us", to: "/join-us", icon: UserPlus },
];

const rightLinks = [
  { label: "Contribute", to: "/contribute", icon: Heart },
  { label: "Contact", to: "/contact", icon: Mail },
  { label: "Partners", to: "/partners", icon: Handshake },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-500",
          scrolled
            ? "bg-gradient-to-r from-[#1a0b2e]/95 via-[#1a0b2e]/90 to-[#1a0b2e]/95 backdrop-blur-md border-b border-purple-500/20 shadow-lg shadow-purple-500/10"
            : "md:bg-transparent bg-[#1a0b2e]/80 md:border-transparent border-b border-white/10 backdrop-blur-sm"
        )}
      >
        <div className="w-full h-20 flex items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
          
          {/* Left Links (Desktop) */}
          <div className="hidden md:flex items-center justify-start flex-1 gap-8">
            {leftLinks.map((l) => (
              <Link 
                key={l.to}
                to={l.to}
                className="group flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-white hover:text-purple-300 transition-all duration-300 hover:scale-105"
              >
                <l.icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                {l.label}
              </Link>
            ))}
          </div>

          {/* Center Logo */}
          <div className="flex-0 flex justify-center">
            <Link to="/" className="transition-all duration-300 hover:scale-105">
              <img 
                src="/logos/logo-dark.png" 
                alt="ThinkUp Logo" 
                className="h-10 w-auto object-contain hover:brightness-110 transition-all duration-300"
              />
            </Link>
          </div>

          {/* Right Links (Desktop) */}
          <div className="hidden md:flex items-center justify-end flex-1 gap-8">
            {rightLinks.map((l) => (
              <Link 
                key={l.to} 
                to={l.to} 
                className={cn(
                  "flex items-center gap-2 text-sm font-medium uppercase tracking-widest transition-all duration-300",
                  l.label === "Partners" 
                    ? "bg-purple-600 text-white rounded-full px-4 py-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:bg-purple-700 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105" 
                    : "text-white hover:text-purple-300 hover:scale-105"
                )}
              >
                <l.icon className={cn("w-4 h-4", l.label === "Partners" ? "opacity-90" : "opacity-70 group-hover:opacity-100 transition-opacity")} />
                {l.label}
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden relative p-3 text-white transition-all duration-300 hover:text-purple-300 hover:bg-purple-500/20 rounded-xl hover:scale-110 shadow-lg hover:shadow-purple-500/25 border border-white/10 hover:border-purple-500/30"
            onClick={() => setOpen(!open)}
          >
            <div className="relative">
              <Menu className={cn("h-6 w-6 absolute inset-0 transition-all duration-300", open ? "opacity-0 rotate-180 scale-75" : "opacity-100 rotate-0 scale-100")} />
              <X className={cn("h-6 w-6 absolute inset-0 transition-all duration-300", open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-180 scale-75")} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <>
            <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
            <div className="md:hidden fixed inset-0 z-50 bg-[#1a0b2e] overflow-y-auto p-4"> 
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logos/logo-dark.png" alt="ThinkUp Logo" className="h-8" />
                  <span className="text-white font-bold">ThinkUp</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {[...leftLinks, ...rightLinks].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-lg transition-all duration-200",
                      l.label === "Partners"
                        ? "bg-purple-600 text-white"
                        : "text-white bg-white/5 hover:bg-purple-500/20"
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-white/60">
                Empowering the next generation of innovators
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Floating hamburger button - mobile only, appears on scroll */}
      {scrolled && !open && (
        <button
          className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-purple-600 text-white rounded-full shadow-lg shadow-purple-500/40 hover:bg-purple-700 transition-all duration-300"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      )}
    </>
  );
}

