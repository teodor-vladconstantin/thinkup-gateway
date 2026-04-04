import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Lightbulb, Rocket, Users } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#1A0B2E]">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393798-38e43269d877?q=80&w=2938&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1A0B2E] via-[#1A0B2E]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1A0B2E]/80 to-[#1A0B2E]" />

        {/* Circular Graphic Element */}
        <div className="absolute -right-[10%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 blur-[100px] pointer-events-none" />
        
        <div className="container px-4 md:px-6 mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center pt-20">
          <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Welcome to
              </h1>
              <div className="text-6xl md:text-7xl lg:text-8xl font-serif font-black italic tracking-tighter text-[#d3c6de]">
                ThinkUp <br className="hidden md:block" /> Academy
              </div>
            </div>

            <p className="text-lg md:text-xl text-purple-100/80 font-light max-w-[600px] leading-relaxed border-l-4 border-purple-400/50 pl-6">
              "We turn good ideas into great ideas, and great ideas into reality."
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link to="/join-us">
                <Button size="lg" className="bg-white text-[#1A0B2E] hover:bg-purple-50 px-5 text-sm h-10 font-semibold rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105">
                  Join Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-5 text-lg h-10 rounded-lg backdrop-blur-sm">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          {/* Abstract Graphic / Empty space for balance on desktop */}
          <div className="hidden lg:block relative h-full min-h-[400px]">
             {/* We can place floating elements or just keep it clean for the typographic focus */}
          </div>
        </div>
      </section>

      {/* Cards Section - High Contrast White Cards */}
      <section className="relative py-24 z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A0B2E] to-slate-50/10 h-1/2 pointer-events-none" />
        <div className="container px-4 md:px-6 mx-auto relative">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Create */}
            <Card className="border-0 shadow-2xl bg-white hover:-translate-y-2 transition-transform duration-300 rounded-2xl overflow-hidden group h-full">
              <CardHeader className="text-left pb-4 pt-8 px-8">
                <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors shadow-sm">
                  <Lightbulb className="h-8 w-8 text-purple-700" />
                </div>
                <CardTitle className="text-3xl font-bold text-slate-900 font-serif italic">Create</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 text-slate-600 size-lg leading-relaxed">
                <p>Brainstorm, ideate, and shape your initial concepts into viable project proposals with our expert guidance.</p>
              </CardContent>
            </Card>

            {/* Implement */}
            <Card className="border-0 shadow-2xl bg-white hover:-translate-y-2 transition-transform duration-300 rounded-2xl overflow-hidden group h-full">
              <CardHeader className="text-left pb-4 pt-8 px-8">
                <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors shadow-sm">
                  <Rocket className="h-8 w-8 text-indigo-700" />
                </div>
                <CardTitle className="text-3xl font-bold text-slate-900 font-serif italic">Implement</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 text-slate-600 size-lg leading-relaxed">
                <p>Put plans into action. We provide technical resources, management strategies, and development support.</p>
              </CardContent>
            </Card>

            {/* Express */}
            <Card className="border-0 shadow-2xl bg-white hover:-translate-y-2 transition-transform duration-300 rounded-2xl overflow-hidden group h-full">
              <CardHeader className="text-left pb-4 pt-8 px-8">
                <div className="bg-pink-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-100 transition-colors shadow-sm">
                  <Users className="h-8 w-8 text-pink-700" />
                </div>
                <CardTitle className="text-3xl font-bold text-slate-900 font-serif italic">Express</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 text-slate-600 size-lg leading-relaxed">
                <p>Share your success. Learn to present your project effectively and connect with our wider community.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Section - Clean White/Light Grey */}
      <section className="py-24 bg-slate-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full font-bold text-xs tracking-widest uppercase">
                Our Mission
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                Empowering the Next Generation of <span className="font-serif italic text-purple-600">Innovators</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                ThinkUp Academy is dedicated to guiding teens to develop entrepreneurial projects. 
                We provide the platform and resources necessary for young minds to innovate and lead.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "Expert mentoring sessions to refine your vision",
                  "Networking with like-minded peers and professionals",
                  "Real-world project implementation support"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="bg-purple-100 rounded-full p-1 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                    </div>
                    <span className="text-slate-700 font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-50 rounded-bl-[100px] -mr-12 -mt-12 transition-all group-hover:bg-purple-100 duration-500" />
                <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900">Why Join?</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    We believe in the power of youth-led innovation. Whether you have a fully formed idea or just a spark of curiosity, ThinkUp Academy is the place to grow.
                  </p>
                  <Link to="/join-us">
                    <Button variant="link" className="p-0 h-auto text-purple-600 font-semibold text-lg hover:text-purple-800">
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section - Dark with Gradient */}
      <section className="py-24 md:py-32 bg-[#1A0B2E] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none"></div>
        <div className="container px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-10 relative">
             {/* Glow effects */}
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-500/20 blur-[120px] rounded-full -z-10" />
             
             <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
               Ready to start your <span className="font-serif italic text-purple-300">journey?</span>
             </h2>
             <p className="text-purple-100/70 max-w-2xl mx-auto text-xl font-light">
               Join a community of young changemakers and turn your ideas into reality.
             </p>
             <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/join-us">
                  <Button className="bg-white text-[#1A0B2E] hover:bg-purple-50 px-5 py-2 text-sm h-auto font-bold rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all hover:-translate-y-1">
                    Apply Now
                  </Button>
                </Link>
                <Link to="/contact">
                   <Button variant="outline" className="border-purple-500/30 text-purple-100 hover:bg-white/10 px-5 py-2 text-sm h-auto rounded-lg backdrop-blur-sm transition-all hover:-translate-y-1">
                    Talk to Us
                  </Button>
                </Link>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
