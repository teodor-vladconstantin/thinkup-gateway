import { Link } from "react-router-dom";
import { ArrowLeft, HandHeart } from "lucide-react";

export default function Contribute() {
  return (
    <div className="min-h-screen bg-[#1a0b2e] flex items-center justify-center p-4 font-sans text-white">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="bg-purple-500/10 p-6 rounded-full inline-block backdrop-blur-sm">
          <HandHeart className="w-16 h-16 text-purple-300" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Contribute to <span className="font-serif italic text-purple-300">ThinkUp</span>
        </h1>
        
        <p className="text-xl text-purple-100/60 leading-relaxed font-light">
          We are currently building our contribution platform. Soon you'll be able to support student projects directly.
        </p>

        <div className="pt-8">
           <Link to="/contact">
            <button className="px-8 py-4 bg-white text-[#1a0b2e] rounded-full font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-purple-500/20">
              Get in Touch to Help
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
