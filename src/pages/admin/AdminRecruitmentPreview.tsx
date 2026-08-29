import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Info } from 'lucide-react';
import { chunk, fetchCampaign, fetchQuestions } from '@/lib/recruitment';
import CampaignQuestionsForm, { type AnswerFiles, type AnswerValues } from '@/components/recruitment/CampaignQuestionsForm';
import StepperForm, { type FormStep } from '@/components/recruitment/StepperForm';
import { useToast } from '@/hooks/use-toast';

const QUESTIONS_PER_PAGE = 4;

export default function AdminRecruitmentPreview() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [values, setValues] = useState<AnswerValues>({});
  const [files, setFiles] = useState<AnswerFiles>({});

  const { data: campaign } = useQuery({
    queryKey: ['admin-campaign', id],
    queryFn: () => fetchCampaign(id!),
    enabled: Boolean(id),
  });

  const { data: questions } = useQuery({
    queryKey: ['campaign-questions', id],
    queryFn: () => fetchQuestions(id!),
    enabled: Boolean(id),
  });

  const questionPages = useMemo(() => chunk(questions ?? [], QUESTIONS_PER_PAGE), [questions]);

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
            <Label>Nume complet *</Label>
            <Input disabled placeholder="Colectat automat" className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input disabled placeholder="Colectat automat" className="bg-gray-100" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Telefon</Label>
            <Input disabled placeholder="Colectat automat" className="bg-gray-100" />
          </div>
        </div>
      ),
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
    }));

    return [applicantStep, ...pageSteps];
  }, [questionPages, values, files]);

  if (!campaign) {
    return <div className="p-6 text-gray-500">Se încarcă...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Link to={`/admin/recruitment/${campaign.id}/builder`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Înapoi la editor
      </Link>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Mod previzualizare</AlertTitle>
        <AlertDescription>Așa va arăta formularul public la /aplica/{campaign.slug}. Nimic din ce completezi aici nu se salvează.</AlertDescription>
      </Alert>

      <Card className="overflow-hidden rounded-2xl border-0 shadow-2xl">
        <CardHeader className="border-b border-purple-100 bg-purple-50 p-8 text-center">
          <CardTitle className="text-2xl font-bold text-purple-900">{campaign.title}</CardTitle>
          {campaign.description && <CardDescription className="text-purple-700/60">{campaign.description}</CardDescription>}
        </CardHeader>
        <CardContent className="p-8 md:p-10">
          <StepperForm
            steps={steps}
            submitLabel="Trimite aplicația"
            onSubmit={() =>
              toast({ title: 'Previzualizare', description: 'Aceasta este doar o previzualizare — nu se trimite nimic.' })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
