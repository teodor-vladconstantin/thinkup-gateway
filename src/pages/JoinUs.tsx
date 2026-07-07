
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Send } from "lucide-react";

const DEFAULT_CLOSED_MESSAGE = "Recruitările sunt momentan închise. Revino mai târziu pentru o nouă deschidere.";

export default function JoinUs() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const applicationsOpen = siteSettings?.applications_open ?? true;
  const closedMessage = siteSettings?.applications_closed_message ?? DEFAULT_CLOSED_MESSAGE;
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    dob: "",
    phone: "",
    reason: "",
    source: "",
    school: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (settingsLoading) {
      toast({
        title: "Please wait",
        description: "We are checking whether recruitment is open.",
      });
      return;
    }

    if (!applicationsOpen) {
      toast({
        title: "Recruitments are closed",
        description: closedMessage,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const applicationData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        dob: formData.dob || null,
        phone: formData.phone,
        reason: formData.reason,
        source: formData.source,
        school: formData.school
    };

    const { error } = await supabase.from("applications").insert([applicationData]);
    
    setLoading(false);
    
    if (error) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Application Submitted!",
      description: "Welcome to the future. We will be in touch soon.",
    });
    
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      dob: "",
      phone: "",
      reason: "",
      source: "",
      school: "",
    });
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-[#1a0b2e] flex flex-col justify-center items-center py-24 px-4 font-sans">
        <div className="w-full max-w-3xl text-center text-white space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Join the <span className="font-serif italic text-purple-300">Academy</span>
          </h1>
          <p className="text-purple-100/70 text-lg">Checking application status...</p>
        </div>
      </div>
    );
  }

  if (!applicationsOpen) {
    return (
      <div className="min-h-screen bg-[#1a0b2e] flex flex-col justify-center items-center py-24 px-4 font-sans">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Join the <span className="font-serif italic text-purple-300">Academy</span>
            </h1>
            <p className="text-purple-100/70 text-lg">Applications are currently paused.</p>
          </div>

          <Alert className="border-amber-200 bg-amber-50 text-amber-950">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Recruitările sunt momentan închise</AlertTitle>
            <AlertDescription>{closedMessage}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0b2e] flex flex-col justify-center items-center py-24 px-4 font-sans">
      <div className="w-full max-w-3xl space-y-8">
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
             Join the <span className="font-serif italic text-purple-300">Academy</span>
          </h1>
          <p className="text-purple-100/70 text-lg">
            Start your journey with ThinkUp today.
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-purple-50 p-8 border-b border-purple-100 text-center">
            <CardTitle className="text-2xl font-bold text-purple-900">Application Form</CardTitle>
            <CardDescription className="text-purple-700/60">
              Please check your details before submitting.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Personal Info Group */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-purple-900/40 border-b border-purple-100 pb-2">Personal Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-gray-700">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      placeholder="Jane"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-gray-700">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane.doe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-gray-700">Date of Birth</Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Education Group */}
              <div className="space-y-6 pt-4">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-purple-900/40 border-b border-purple-100 pb-2">Background</h3>
                 
                 <div className="space-y-2">
                  <Label htmlFor="school" className="text-gray-700">Current School / Institution</Label>
                  <Input
                    id="school"
                    name="school"
                    placeholder="University of Innovation"
                    value={formData.school}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="reason" className="text-gray-700">Why do you want to join?</Label>
                   <Select onValueChange={(val) => handleSelectChange(val, 'reason')}>
                      <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="learn">To Learn & Grow</SelectItem>
                        <SelectItem value="contribute">To Contribute</SelectItem>
                        <SelectItem value="network">To Network</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                  
                  <div className="space-y-2">
                   <Label htmlFor="source" className="text-gray-700">How did you hear about us?</Label>
                   <Select onValueChange={(val) => handleSelectChange(val, 'source')}>
                      <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                        <SelectValue placeholder="Select a source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="friend">Friend / Colleague</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="search">Search Engine</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#1a0b2e] hover:bg-[#2d1b4e] text-white font-semibold py-6 text-lg transition-all duration-300 shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Submit Application <Send className="h-4 w-4" />
                    </span>
                  )}
                </Button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  By clicking Submit, you agree to our Terms and Privacy Policy.
                </p>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

