import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("messages").insert([form]);
    setLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-lg mx-auto bg-card rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-extrabold text-card-foreground mb-6 text-center">Contact Us</h1>
        <form onSubmit={submit} className="space-y-4">
          <div><Label className="text-card-foreground">Your name</Label><Input value={form.name} onChange={set("name")} required /></div>
          <div><Label className="text-card-foreground">Your email</Label><Input type="email" value={form.email} onChange={set("email")} required /></div>
          <div><Label className="text-card-foreground">Subject</Label><Input value={form.subject} onChange={set("subject")} required /></div>
          <div><Label className="text-card-foreground">Your message (optional)</Label><Textarea value={form.message} onChange={set("message")} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground rounded-full hover:opacity-90">
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </section>
  );
}
