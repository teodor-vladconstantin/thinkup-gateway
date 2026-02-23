
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("messages").insert([formData]);

    setLoading(false);
    if (error) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Message sent!",
      description: "We will get back to you as soon as possible.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#1a0b2e] flex flex-col items-center justify-center p-4 md:p-8 pt-24 font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start pt-12">
         {/* Left Side: Info */}
        <div className="space-y-8 text-white">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Get in <span className="font-serif italic text-purple-300">Touch</span>
            </h1>
            <p className="text-lg text-purple-100/70 leading-relaxed font-light">
              Have a question, an idea, or just want to say hello? 
              We would love to hear from you. Fill out the form and our team will get back to you shortly.
            </p>
          </div>
          
          <div className="space-y-6 pt-8 border-t border-white/10">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-white/5 rounded-full text-purple-300">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Email Us</h3>
                <p className="text-purple-200/60">contact@think-up.academy</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-4 bg-white/5 rounded-full text-purple-300">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Call Us</h3>
                <p className="text-purple-200/60">+40 747 045 744</p>
                <p className="text-purple-200/60">Mon-Fri, 9am - 5pm EET</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-4 bg-white/5 rounded-full text-purple-300">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Visit Us</h3>
                <p className="text-purple-200/60">Aleea Băișoara 2a</p>
                <p className="text-purple-200/60">Cluj-Napoca 400394, Romania</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden self-start">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Send us a message</CardTitle>
            <CardDescription className="text-gray-500">
              We usually respond within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-gray-700">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-700">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  className="min-h-[140px] bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#1a0b2e] hover:bg-[#2d1b4e] text-white font-semibold py-6 text-lg transition-all duration-300 shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Message <Send className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

