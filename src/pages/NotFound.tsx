import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#1a0b2e] flex items-center justify-center p-4 font-sans text-white">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-serif font-black italic text-purple-300/20 select-none">404</h1>
        <div className="relative -mt-20 z-10 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Page Not Found</h2>
          <p className="text-xl text-purple-100/60 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          <div className="pt-4">
             <Link to="/">
              <button className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#1a0b2e] rounded-full font-bold hover:bg-purple-50 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Return Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
