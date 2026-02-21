import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { data: partners, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data } = await supabase.from("partners").select("*").eq("visible", true).order("order_index");
      return data ?? [];
    },
  });

  return (
    <>
      {/* Hero */}
      <section className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Welcome to{" "}
            <span className="italic text-primary" style={{ fontFamily: "var(--font-accent)" }}>
              ThinkUp Academy
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            We turn good ideas into great ideas, and great ideas into reality.
          </p>
          <Link to="/join-us" className="inline-block mt-8 px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity">
            Join Us
          </Link>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground mb-4">Our mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              We guide Romanian teens to develop entrepreneurial projects through weekly mentoring sessions,
              access to a quality network of professionals, and a supportive community that believes in the power of youth-led innovation.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-foreground mb-4">How do we make it easier</h2>
            <p className="text-muted-foreground leading-relaxed">
              Through the ThinkUp guidebook, dedicated mentor support, and sponsor funding for successful projects,
              we remove the barriers that stand between a student's idea and its real-world impact.
            </p>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-foreground mb-6">Our achievements</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We are a hardworking team of students passionate about making a difference.
            The International Youth Summit of Transylvania is the first international conference
            organised by high school students for students — and it's just the beginning.
          </p>
        </div>
      </section>

      {/* Vision statements */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          {[
            { word: "Create.", desc: "Bring your input, gather a team, and plan." },
            { word: "Implement.", desc: "See how your projects improve the world you live in." },
            { word: "Express.", desc: "Your perspective and ideas. Share with us your thoughts." },
          ].map((item) => (
            <div key={item.word} className="text-center">
              <h3 className="text-5xl sm:text-6xl font-extrabold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                {item.word}
              </h3>
              <p className="mt-3 text-xl text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-card rounded-2xl p-10 shadow-lg">
          <h2 className="text-3xl font-extrabold text-card-foreground text-center mb-8">Our partners</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          ) : partners && partners.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
              {partners.map((p) => (
                <a key={p.id} href={p.website_url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-4 hover:opacity-80 transition-opacity">
                  {p.logo_url ? (
                    <img src={p.logo_url} alt={p.name} className="max-h-16 object-contain" />
                  ) : (
                    <span className="text-card-foreground font-semibold">{p.name}</span>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No partners to display yet.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-secondary">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-extrabold text-secondary-foreground mb-4">Become a member</h2>
            <p className="text-secondary-foreground/80 mb-6">
              Join our community of ambitious students and start building your future today.
            </p>
            <Link to="/join-us" className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity">
              Apply Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
