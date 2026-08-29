import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  fetchAnswers,
  fetchApplication,
  fetchQuestions,
  getSignedFileUrl,
  updateApplicationNotes,
  updateApplicationStatus,
} from '@/lib/recruitment';
import { applicationStatusLabels, type ApplicationStatus } from '@/types/recruitment';

export default function AdminRecruitmentApplicantDetail() {
  const { id: campaignId, applicationId } = useParams<{ id: string; applicationId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');

  const { data: application } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => fetchApplication(applicationId!),
    enabled: Boolean(applicationId),
  });

  const { data: answers } = useQuery({
    queryKey: ['application-answers', applicationId],
    queryFn: () => fetchAnswers(applicationId!),
    enabled: Boolean(applicationId),
  });

  const { data: questions } = useQuery({
    queryKey: ['campaign-questions', campaignId],
    queryFn: () => fetchQuestions(campaignId!),
    enabled: Boolean(campaignId),
  });

  useEffect(() => {
    setNotes(application?.internal_notes ?? '');
  }, [application?.internal_notes]);

  const questionsById = useMemo(() => new Map((questions ?? []).map((question) => [question.id, question])), [questions]);

  const statusMutation = useMutation({
    mutationFn: (status: ApplicationStatus) => updateApplicationStatus(applicationId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      toast({ title: 'Status actualizat' });
    },
    onError: (error: Error) => toast({ title: 'Actualizarea a eșuat', description: error.message, variant: 'destructive' }),
  });

  const notesMutation = useMutation({
    mutationFn: () => updateApplicationNotes(applicationId!, notes),
    onSuccess: () => toast({ title: 'Notițe salvate' }),
    onError: (error: Error) => toast({ title: 'Salvarea a eșuat', description: error.message, variant: 'destructive' }),
  });

  const openFile = async (filePath: string) => {
    try {
      const url = await getSignedFileUrl(filePath);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast({
        title: 'Fișierul nu a putut fi deschis',
        description: error instanceof Error ? error.message : 'Eroare necunoscută',
        variant: 'destructive',
      });
    }
  };

  if (!application) {
    return <div className="p-6 text-gray-500">Se încarcă...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Link to={`/admin/recruitment/${campaignId}/applicants`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Toți aplicanții
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{application.applicant_name}</h1>
          <p className="mt-1 text-gray-500">{application.applicant_email}{application.applicant_phone ? ` · ${application.applicant_phone}` : ''}</p>
          <p className="mt-1 text-xs text-gray-400">
            Trimis pe {new Date(application.submitted_at).toLocaleString('ro-RO')}
          </p>
        </div>
        <Select value={application.status} onValueChange={(status) => statusMutation.mutate(status as ApplicationStatus)}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(applicationStatusLabels) as ApplicationStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                {applicationStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Răspunsuri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!answers?.length ? (
            <p className="text-sm text-gray-500">Niciun răspuns suplimentar.</p>
          ) : (
            answers.map((answer) => {
              const question = questionsById.get(answer.question_id);
              let displayValue: string = answer.value_text ?? '';
              if (question?.type === 'multiple_choice' && answer.value_text) {
                try {
                  displayValue = (JSON.parse(answer.value_text) as string[]).join(', ');
                } catch {
                  displayValue = answer.value_text;
                }
              }

              return (
                <div key={answer.id} className="border-t border-gray-100 pt-3 first:border-t-0 first:pt-0">
                  <p className="text-sm font-medium text-gray-500">{question?.label ?? 'Întrebare ștearsă'}</p>
                  {answer.file_path ? (
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={() => openFile(answer.file_path!)}>
                      Deschide fișierul
                    </Button>
                  ) : (
                    <p className="text-gray-800">{displayValue || '—'}</p>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notițe interne</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="notes" className="sr-only">Notițe interne</Label>
          <Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-[120px]" />
          <div className="flex justify-end">
            <Button onClick={() => notesMutation.mutate()} disabled={notesMutation.isPending}>
              {notesMutation.isPending ? 'Se salvează...' : 'Salvează notițele'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
