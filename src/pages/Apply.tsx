import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { chunk, fetchCampaignBySlug, fetchQuestions, submitApplication } from '@/lib/recruitment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CampaignQuestionsForm, { type AnswerFiles, type AnswerValues } from '@/components/recruitment/CampaignQuestionsForm';
import StepperForm, { type FormStep } from '@/components/recruitment/StepperForm';
import { campaignTypeLabels } from '@/types/recruitment';

const QUESTIONS_PER_PAGE = 4;

const applicantSchema = z.object({
  applicantName: z.string().trim().min(1, 'Numele este obligatoriu'),
  applicantEmail: z.string().trim().email('Adresă de email invalidă'),
  applicantPhone: z.string().trim().optional(),
});

export default function Apply() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [values, setValues] = useState<AnswerValues>({});
  const [files, setFiles] = useState<AnswerFiles>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['apply-campaign', slug],
    queryFn: async () => {
      if (!slug) return { campaign: null, questions: [] };
      const campaign = await fetchCampaignBySlug(slug);
      if (!campaign || campaign.status !== 'published') return { campaign, questions: [] };
      const questions = await fetchQuestions(campaign.id);
      return { campaign, questions };
    },
    enabled: Boolean(slug),
  });

  const campaign = data?.campaign;
  const questions = useMemo(() => data?.questions ?? [], [data]);
  const questionPages = useMemo(() => chunk(questions, QUESTIONS_PER_PAGE), [questions]);

  const now = Date.now();
  const notYetOpen = campaign?.opens_at ? new Date(campaign.opens_at).getTime() > now : false;
  const alreadyClosed = campaign?.closes_at ? new Date(campaign.closes_at).getTime() < now : false;
  const isOpen = campaign?.status === 'published' && !notYetOpen && !alreadyClosed;

  const handleValueChange = (questionId: string, value: string | string[]) => {
    setValues((current) => ({ ...current, [questionId]: value }));
  };

  const handleFileChange = (questionId: string, file: File | null) => {
    setFiles((current) => {
      if (!file) {
        const next = { ...current };
        delete next[questionId];
        return next;
      }
      return { ...current, [questionId]: file };
    });
  };

  const steps: FormStep[] = useMemo(() => {
    const applicantStep: FormStep = {
      key: 'applicant',
      title: 'Datele tale',
      content: (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="applicantName" className="text-gray-700">
              Nume complet <span className="text-red-500">*</span>
            </Label>
            <Input
              id="applicantName"
              value={applicantName}
              onChange={(event) => setApplicantName(event.target.value)}
              className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicantEmail" className="text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="applicantEmail"
              type="email"
              value={applicantEmail}
              onChange={(event) => setApplicantEmail(event.target.value)}
              className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="applicantPhone" className="text-gray-700">Telefon</Label>
            <Input
              id="applicantPhone"
              type="tel"
              value={applicantPhone}
              onChange={(event) => setApplicantPhone(event.target.value)}
              className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
        </div>
      ),
      validate: () => {
        const result = applicantSchema.safeParse({ applicantName, applicantEmail, applicantPhone });
        return result.success ? null : (result.error.issues[0]?.message ?? 'Date invalide');
      },
    };

    const pageSteps: FormStep[] = questionPages.map((pageQuestions, index) => ({
      key: `page-${index}`,
      title: questionPages.length > 1 ? `Întrebări ${index + 1}/${questionPages.length}` : undefined,
      content: (
        <CampaignQuestionsForm
          questions={pageQuestions}
          values={values}
          files={files}
          onValueChange={handleValueChange}
          onFileChange={handleFileChange}
        />
      ),
      validate: () => {
        const missing = pageQuestions.find((question) => {
          if (!question.is_required) return false;
          if (question.type === 'file_upload') return !files[question.id];
          const value = values[question.id];
          return value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
        });
        return missing ? `${missing.label} este obligatoriu.` : null;
      },
    }));

    return [applicantStep, ...pageSteps];
  }, [questionPages, applicantName, applicantEmail, applicantPhone, values, files]);

  const handleSubmit = async () => {
    if (!campaign || !isOpen) return;

    const applicantResult = applicantSchema.safeParse({ applicantName, applicantEmail, applicantPhone });
    if (!applicantResult.success) return;

    setSubmitting(true);
    try {
      await submitApplication({
        campaignId: campaign.id,
        questions,
        applicantName: applicantResult.data.applicantName,
        applicantEmail: applicantResult.data.applicantEmail,
        applicantPhone: applicantResult.data.applicantPhone,
        values,
        files,
      });
      setSubmitted(true);
      toast({ title: 'Aplicație trimisă!', description: 'Îți mulțumim, te vom contacta în curând.' });
    } catch (error) {
      toast({
        title: 'Trimiterea a eșuat',
        description: error instanceof Error ? error.message : 'A apărut o eroare neașteptată.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a0b2e] flex flex-col justify-center items-center py-24 px-4 font-sans">
        <div className="w-full max-w-3xl text-center text-white space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Alătură-te <span className="font-serif italic text-purple-300">Academiei</span>
          </h1>
          <p className="text-purple-100/70 text-lg">Se încarcă formularul...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#1a0b2e] flex flex-col justify-center items-center py-24 px-4 font-sans">
        <div className="w-full max-w-3xl space-y-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Campanie negăsită</h1>
          <p className="text-purple-100/70 text-lg">Această campanie de recrutare nu există sau nu mai este disponibilă.</p>
          <Button asChild className="bg-white text-purple-900 hover:bg-purple-100">
            <Link to="/join-us">Vezi campaniile deschise</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    const message = campaign.status === 'closed' || alreadyClosed
      ? 'Această campanie de recrutare s-a încheiat. Revino mai târziu pentru o nouă deschidere.'
      : notYetOpen
        ? 'Această campanie nu a început încă. Revino la data deschiderii.'
        : 'Această campanie de recrutare nu este momentan disponibilă.';

    return (
      <div className="min-h-screen bg-[#1a0b2e] flex flex-col justify-center items-center py-24 px-4 font-sans">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{campaign.title}</h1>
          </div>
          <Alert className="border-amber-200 bg-amber-50 text-amber-950">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Recrutarea este momentan închisă</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0b2e] flex flex-col justify-center items-center py-24 px-4 font-sans">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-4">
          <p className="text-sm uppercase tracking-widest text-purple-300">{campaignTypeLabels[campaign.type]}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{campaign.title}</h1>
          {campaign.description && <p className="text-purple-100/70 text-lg">{campaign.description}</p>}
        </div>

        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">
          <CardHeader className="border-b border-purple-100 bg-purple-50 p-8 text-center">
            <CardTitle className="text-2xl font-bold text-purple-900">Formular de aplicare</CardTitle>
            <CardDescription className="text-purple-700/60">Completează toate câmpurile obligatorii.</CardDescription>
          </CardHeader>

          <CardContent className="p-8 md:p-10">
            {submitted ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center text-green-800">
                <p className="text-lg font-semibold">Aplicația a fost trimisă cu succes.</p>
                <p className="mt-2 text-sm">Vom analiza aplicația ta pentru {campaign.title.toLowerCase()} și te vom contacta.</p>
              </div>
            ) : (
              <StepperForm
                steps={steps}
                onSubmit={handleSubmit}
                submitLabel="Trimite aplicația"
                submitting={submitting}
                onValidationError={(message) =>
                  toast({ title: 'Date lipsă sau invalide', description: message, variant: 'destructive' })
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
