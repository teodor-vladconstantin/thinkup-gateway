import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#1a0b2e] pt-24 pb-12 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Privacy <span className="font-serif italic text-purple-300">Policy</span>
          </h1>
          <p className="text-purple-100/70 text-lg max-w-2xl mx-auto">
            How we collect, use, and protect your data.
          </p>
        </div>

        <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm text-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-white">1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-purple-100/80 leading-relaxed">
            <p>
              We collect information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Apply for our programs or membership.</li>
                <li>Fill out contact forms on our website.</li>
                <li>Subscribe to our newsletters or updates.</li>
                <li>Participate in our events or workshops.</li>
            </ul>
            <p>
              This information may include your name, email address, phone number, educational background, and other details relevant to your application or inquiry.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm text-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-white">2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-purple-100/80 leading-relaxed">
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process and evaluate your applications.</li>
                <li>Communicate with you about our programs, events, and updates.</li>
                <li>Improve our educational services and website functionality.</li>
                <li>Respond to your inquiries and support requests.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm text-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-white">3. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-purple-100/80 leading-relaxed">
            <p>
              We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm text-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-white">4. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-purple-100/80 leading-relaxed">
            <p>
              We may use third-party services (such as Supabase for database management or analytics tools) that process data on our behalf. These service providers are bound by confidentiality agreements and are restricted from using your data for other purposes.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-sm text-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-white">5. Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-purple-100/80 leading-relaxed">
            <p>
              You have the right to request access to, correction of, or deletion of your personal data held by us. If you wish to exercise these rights, please contact us at <a href="mailto:contact@think-up.academy" className="text-purple-300 hover:text-white transition-colors">contact@think-up.academy</a>.
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
