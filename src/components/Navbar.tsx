import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const leftLinks = [
  { label: "Blog", to: "/blog" },
  { label: "Departments", to: "/departments" },
  { label: "Join Us", to: "/join-us" },
];

const rightLinks = [
  { label: "Contribute", to: "/contribute" },
  { label: "Contact", to: "/contact" },
  { label: "Partners", to: "/partners" },
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
    setOpen(false);
  }, [location]);

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-[#1a0b2e]/80 backdrop-blur-md border-b border-white/10 shadow-sm"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="w-full h-20 flex items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        
        {/* Left Links (Desktop) */}
        <div className="hidden md:flex items-center justify-start flex-1 gap-8">
          {leftLinks.map((l) => (
            <Link 
              key={l.to} 
              to={l.to} 
              className="text-sm font-medium uppercase tracking-widest text-white hover:text-purple-300 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Center Logo */}
        <div className="flex-0 flex justify-center">
          <Link to="/">
            <img 
              src="/logos/logo-dark.png" 
              alt="ThinkUp Logo" 
              className="h-10 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        {/* Right Links (Desktop) */}
        <div className="hidden md:flex items-center justify-end flex-1 gap-8">
          {rightLinks.map((l) => (
            <Link 
              key={l.to} 
              to={l.to} 
              className="text-sm font-medium uppercase tracking-widest text-white hover:text-purple-300 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-white transition-colors hover:text-purple-300"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#1a0b2e] flex flex-col pt-24 px-6 gap-6 overflow-y-auto">
          {[...leftLinks, ...rightLinks].map((l) => (
            <Link 
              key={l.to} 
              to={l.to} 
              onClick={() => setOpen(false)}
              className="text-2xl font-bold uppercase tracking-widest text-white hover:text-purple-300 transition-colors border-b border-white/10 pb-4"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

