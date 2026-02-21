import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function JoinUs() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", dob: "", phone: "", reason: "", source: "", school: "" });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) { toast({ title: "Please accept the privacy policy", variant: "destructive" }); return; }
    setLoading(true);
    const { error } = await supabase.from("applications").insert([form]);
    setLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Application submitted!", description: "We'll be in touch soon." });
    setForm({ first_name: "", last_name: "", email: "", dob: "", phone: "", reason: "", source: "", school: "" });
    setAccepted(false);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-lg mx-auto bg-card rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-extrabold text-card-foreground mb-6 text-center">Join Us</h1>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-card-foreground">First name</Label><Input value={form.first_name} onChange={set("first_name")} required /></div>
            <div><Label className="text-card-foreground">Last name</Label><Input value={form.last_name} onChange={set("last_name")} required /></div>
          </div>
          <div><Label className="text-card-foreground">Email</Label><Input type="email" value={form.email} onChange={set("email")} required /></div>
          <div><Label className="text-card-foreground">Date of Birth</Label><Input type="date" value={form.dob} onChange={set("dob")} /></div>
          <div><Label className="text-card-foreground">Phone Number</Label><Input value={form.phone} onChange={set("phone")} /></div>
          <div>
            <Label className="text-card-foreground">Why do you wish to sign up?</Label>
            <Select value={form.reason} onValueChange={(v) => setForm((f) => ({ ...f, reason: v }))}>
              <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Why not">Why not</SelectItem>
                <SelectItem value="I want to">I want to</SelectItem>
                <SelectItem value="Don't wanna tell u">Don't wanna tell u</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-card-foreground">How did you find out about us?</Label><Input value={form.source} onChange={set("source")} /></div>
          <div><Label className="text-card-foreground">Your school's name</Label><Input value={form.school} onChange={set("school")} /></div>
          <div className="flex items-center gap-2">
            <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} id="privacy" />
            <label htmlFor="privacy" className="text-sm text-card-foreground">By continuing, you accept the privacy policy</label>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground rounded-full hover:opacity-90">
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </div>
    </section>
  );
}
