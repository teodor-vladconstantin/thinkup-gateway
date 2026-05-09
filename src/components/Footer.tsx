import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A0B2E] text-white border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4 col-span-1 md:col-span-1">
            <Link to="/" className="inline-block group">
              <h2 className="text-2xl font-bold tracking-tight">
                ThinkUp <span className="font-serif italic text-purple-300 group-hover:text-white transition-colors">Academy</span>
              </h2>
            </Link>
            <p className="text-purple-200/60 text-sm leading-relaxed max-w-xs">
              Empowering the Next Generation of Leaders to turn good ideas into reality.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-300/80">Discover</h3>
            <ul className="space-y-2">
              <li><Link to="/departments" className="text-purple-100/60 hover:text-white transition-colors text-sm">Departments</Link></li>
              <li><Link to="/blog" className="text-purple-100/60 hover:text-white transition-colors text-sm">Blog</Link></li>
              <li><Link to="/partners" className="text-purple-100/60 hover:text-white transition-colors text-sm">Partners</Link></li>
              <li><Link to="/join-us" className="text-purple-100/60 hover:text-white transition-colors text-sm">Join Us</Link></li>
            </ul>
          </div>

           {/* Legal/Contact */}
           <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-300/80">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-purple-100/60 hover:text-white transition-colors text-sm">Contact Us</Link></li>
              <li><Link to="/contribute" className="text-purple-100/60 hover:text-white transition-colors text-sm">Contribute</Link></li>
              <li><Link to="/privacy" className="text-purple-100/60 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-purple-100/60 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
             <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-300/80">Contact</h3>
             <div className="space-y-2 text-sm text-purple-100/60">
                <p>Aleea Băișoara 2a</p>
                <p>Cluj-Napoca 400394, Romania</p>
                <p className="pt-2"><a href="tel:+40747045744" className="hover:text-white transition-colors">+40 747 045 744</a></p>
                <p><a href="mailto:contact@think-up.academy" className="hover:text-white transition-colors">contact@think-up.academy</a></p>
             </div>
             <div className="flex gap-4 pt-2">
                <a href="https://www.instagram.com/thinkup.academy/" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2 rounded-full hover:bg-white/10 hover:text-purple-300 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
             </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-purple-200/40">
            &copy; {currentYear} ThinkUp Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
