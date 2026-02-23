import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#1a0b2e] pt-24 pb-12 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Terms and <span className="font-serif italic text-purple-300">Conditions</span>
          </h1>
          <p className="text-purple-100/70 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using our services.
          </p>
        </div>

        <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm text-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-white">1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-purple-100/80 leading-relaxed">
            <p>
              By accessing and using the ThinkUp Academy website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm text-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-white">2. Educational Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-purple-100/80 leading-relaxed">
            <p>
              ThinkUp Academy provides educational programs, workshops, and resources for young entrepreneurs and students. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
            </p>
            <p>
              While we strive to provide high-quality educational content, we make no guarantees regarding specific outcomes or results from participation in our programs.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm text-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-white">3. User Conduct</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-purple-100/80 leading-relaxed">
            <p>
              Users are expected to behave professionally and respectfully. Harassment, hate speech, or any form of disruptive behavior within our community or on our platforms will not be tolerated and may result in termination of access.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm text-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-white">4. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-purple-100/80 leading-relaxed">
            <p>
              All content provided by ThinkUp Academy, including but not limited to course materials, logos, and website content, is the property of ThinkUp Academy and is protected by copyright and other intellectual property laws.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm text-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-white">5. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-purple-100/80 leading-relaxed">
            <p>
              ThinkUp Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
            </p>
          </CardContent>
        </Card>

        <div className="text-center text-purple-200/40 text-sm mt-12">
            Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
