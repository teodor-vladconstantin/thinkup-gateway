import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchApplications, fetchCampaign, updateApplicationStatus } from '@/lib/recruitment';
import { applicationStatusLabels, type ApplicationStatus } from '@/types/recruitment';

export default function AdminRecruitmentApplicants() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const statusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) =>
      updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-applications', id] });
      toast({ title: 'Status actualizat' });
    },
    onError: (error: Error) => toast({ title: 'Actualizarea a eșuat', description: error.message, variant: 'destructive' }),
  });

  if (!campaign) {
    return <div className="p-6 text-gray-500">Se încarcă...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <Link to="/admin/recruitment" className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Toate campaniile
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Aplicanți — {campaign.title}</h1>
        <p className="mt-1 text-gray-500">{applications?.length ?? 0} aplicații primite.</p>
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
