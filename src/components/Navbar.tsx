import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Menu, X } from "lucide-react";

const links = [
  { label: "Blog", to: "/blog" },
  { label: "Departments", to: "/departments" },
  { label: "Join Us", to: "/join-us" },
  { label: "Contact", to: "/contact" },
  { label: "Partners", to: "/#partners" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 text-foreground font-bold text-xl" style={{ fontFamily: "var(--font-heading)" }}>
          <Brain className="h-7 w-7 text-primary" />
          <span>thinkup</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-2">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
