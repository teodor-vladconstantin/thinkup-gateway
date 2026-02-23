import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Handshake, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from("partners")
          .select("id, name, logo_url, website_url")
          .eq("visible", true)
          .order("order_index", { ascending: true });

        if (error) {
          throw error;
        }
        setPartners(data || []);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  return (
    <div className="min-h-screen bg-[#1a0b2e] flex flex-col pt-32 pb-16 px-4 font-sans text-white">
      <div className="container mx-auto max-w-6xl space-y-12 text-center">
        
        <div className="space-y-6">
          <div className="bg-purple-500/10 p-4 rounded-full inline-block backdrop-blur-sm border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Handshake className="w-10 h-10 text-purple-300" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Our <span className="font-serif italic text-purple-300">Partners</span>
          </h1>
          
          <p className="text-xl text-purple-100/60 leading-relaxed font-light max-w-2xl mx-auto">
            We collaborate with leading institutions and organizations to provide exceptional opportunities for our students.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {partners.length > 0 ? (
              partners.map((partner) => (
                <a 
                  key={partner.id} 
                  href={partner.website_url || "#"} 
                  target={partner.website_url ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="group block h-full"
                >
                  <Card className="bg-white border-0 overflow-hidden hover:translate-y-[-4px] transition-all duration-300 h-48 flex items-center justify-center relative shadow-lg hover:shadow-purple-500/20 rounded-xl">
                    <CardContent className="p-6 flex items-center justify-center w-full h-full">
                      {partner.logo_url ? (
                        <img 
                          src={partner.logo_url} 
                          alt={partner.name} 
                          className="max-h-24 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-70 group-hover:opacity-100"
                        />
                      ) : (
                        <span className="text-xl font-bold text-slate-700 font-serif italic text-center">
                          {partner.name}
                        </span>
                      )}
                      {partner.website_url && (
                        <ExternalLink className="absolute top-3 right-3 w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </CardContent>
                  </Card>
                </a>
              ))
            ) : (
              <div className="col-span-full py-20 text-purple-200/40 text-lg">
                No partners to display at the moment.
              </div>
            )}
          </div>
        )}

        <div className="pt-12 border-t border-white/10 w-full max-w-md mx-auto">
          <p className="text-purple-200/50 text-sm mb-6 uppercase tracking-widest">Interested in partnering?</p>
           <Link to="/contact">
            <button className="px-8 py-4 bg-white text-[#1a0b2e] rounded-full font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1">
              Become a Partner
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
