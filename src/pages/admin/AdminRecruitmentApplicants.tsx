import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchAnswersForApplications, fetchApplications, fetchCampaign, fetchQuestions, updateApplicationStatus } from '@/lib/recruitment';
import { applicationStatusLabels, type ApplicationStatus } from '@/types/recruitment';
import { isPrimar } from './access';
import { useAdmin } from './AdminLayout';

export default function AdminRecruitmentApplicants() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { role } = useAdmin();
  const readOnly = isPrimar(role);

  const { data: campaign } = useQuery({
    queryKey: ['admin-campaign', id],
    queryFn: () => fetchCampaign(id!),
    enabled: Boolean(id),
  });

  const { data: applications, isLoading } = useQuery({
    queryKey: ['campaign-applications', id],
    queryFn: () => fetchApplications(id!),
    enabled: Boolean(id),
  });

  const { data: questions } = useQuery({
    queryKey: ['campaign-questions', id],
    queryFn: () => fetchQuestions(id!),
    enabled: Boolean(id),
  });

  const applicationIds = applications?.map((application) => application.id) ?? [];
  const { data: answers } = useQuery({
    queryKey: ['campaign-application-answers', id, applicationIds],
    queryFn: () => fetchAnswersForApplications(applicationIds),
    enabled: applicationIds.length > 0,
  });

  const statusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) =>
      updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-applications', id] });
      toast({ title: 'Status actualizat' });
    },
    onError: (error: Error) => toast({ title: 'Actualizarea a eșuat', description: error.message, variant: 'destructive' }),
  });

  const exportCsv = () => {
    if (!applications?.length) return;
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const formatAnswer = (application: { id: string }, answer?: { value_text: string | null; file_path: string | null }) => {
      if (!answer) return '';
      if (answer.file_path) return `${window.location.origin}/admin/recruitment/${id}/applicants/${application.id}`;
      if (!answer.value_text) return '';
      try {
        const parsed = JSON.parse(answer.value_text);
        if (Array.isArray(parsed)) return parsed.join('; ');
      } catch {
        // not JSON, plain text value
      }
      return answer.value_text;
    };

    const header = ['Nume', 'Email', 'Telefon', 'Status', 'Data', ...(questions ?? []).map((q) => q.label)];
    const rows = applications.map((application) => {
      const applicationAnswers = (answers ?? []).filter((a) => a.application_id === application.id);
      return [
        application.applicant_name,
        application.applicant_email,
        application.applicant_phone ?? '',
        applicationStatusLabels[application.status],
        new Date(application.submitted_at).toLocaleDateString('ro-RO'),
        ...(questions ?? []).map((q) => formatAnswer(application, applicationAnswers.find((a) => a.question_id === q.id))),
      ];
    });
    const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aplicanti-${campaign?.slug ?? id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!campaign) {
    return <div className="p-6 text-gray-500">Se încarcă...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to={readOnly ? '/admin/ambassador-applicants' : '/admin/recruitment'}
            className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Toate campaniile
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Aplicanți — {campaign.title}</h1>
          <p className="mt-1 text-gray-500">{applications?.length ?? 0} aplicații primite.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!applications?.length} className="mt-1 shrink-0">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">Se încarcă...</TableCell>
                </TableRow>
              ) : !applications?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">Niciun aplicant încă.</TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium text-gray-900">{application.applicant_name}</TableCell>
                    <TableCell className="text-gray-600">{application.applicant_email}</TableCell>
                    <TableCell>
                      {readOnly ? (
                        <Badge variant="secondary">{applicationStatusLabels[application.status]}</Badge>
                      ) : (
                        <Select
                          value={application.status}
                          onValueChange={(status) =>
                            statusMutation.mutate({ applicationId: application.id, status: status as ApplicationStatus })
                          }
                        >
                          <SelectTrigger className="h-8 w-[150px]">
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
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(application.submitted_at).toLocaleDateString('ro-RO', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild title="Detalii">
                          <Link to={`/admin/recruitment/${campaign.id}/applicants/${application.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
