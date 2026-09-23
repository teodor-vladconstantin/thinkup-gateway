import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { fetchAllCampaigns, isoToLocalInput, updateCampaign, updateCampaignStatus } from '@/lib/recruitment';
import { campaignStatusLabels, campaignTypeLabels, type CampaignStatus, type CampaignType } from '@/types/recruitment';
import { Plus, Settings2, Eye, Users } from 'lucide-react';

export default function AdminRecruitmentList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<CampaignType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');

  const { data: campaigns, isLoading } = useQuery({ queryKey: ['admin-campaigns'], queryFn: fetchAllCampaigns });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CampaignStatus }) => updateCampaignStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast({ title: 'Status actualizat' });
    },
    onError: (error: Error) => toast({ title: 'Actualizarea a eșuat', description: error.message, variant: 'destructive' }),
  });

  const closesAtMutation = useMutation({
    mutationFn: ({ id, closes_at }: { id: string; closes_at: string | null }) => updateCampaign(id, { closes_at }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast({ title: 'Data de închidere actualizată' });
    },
    onError: (error: Error) => toast({ title: 'Actualizarea a eșuat', description: error.message, variant: 'destructive' }),
  });

  const filtered = useMemo(
    () =>
      (campaigns ?? []).filter(
        (campaign) => (typeFilter === 'all' || campaign.type === typeFilter) && (statusFilter === 'all' || campaign.status === statusFilter),
      ),
    [campaigns, typeFilter, statusFilter],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Recrutare</h1>
          <p className="mt-1 text-gray-500">Gestionează campaniile de recrutare pentru mentori și elevi ambasadori.</p>
        </div>
        <Button asChild>
          <Link to="/admin/recruitment/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Campanie nouă
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CampaignType | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tip campanie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate tipurile</SelectItem>
            <SelectItem value="mentor">{campaignTypeLabels.mentor}</SelectItem>
            <SelectItem value="ambassador">{campaignTypeLabels.ambassador}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CampaignStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate statusurile</SelectItem>
            <SelectItem value="draft">{campaignStatusLabels.draft}</SelectItem>
            <SelectItem value="published">{campaignStatusLabels.published}</SelectItem>
            <SelectItem value="closed">{campaignStatusLabels.closed}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Campanie</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Închidere</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">Se încarcă...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">Nicio campanie găsită.</TableCell>
                </TableRow>
              ) : (
                filtered.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{campaign.title}</span>
                        <span className="text-xs text-gray-500">/aplica/{campaign.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{campaignTypeLabels[campaign.type]}</TableCell>
                    <TableCell>
                      <Select
                        value={campaign.status}
                        onValueChange={(status) => statusMutation.mutate({ id: campaign.id, status: status as CampaignStatus })}
                      >
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">{campaignStatusLabels.draft}</SelectItem>
                          <SelectItem value="published">{campaignStatusLabels.published}</SelectItem>
                          <SelectItem value="closed">{campaignStatusLabels.closed}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <DateTimePicker
                        value={isoToLocalInput(campaign.closes_at)}
                        onChange={(value) => closesAtMutation.mutate({ id: campaign.id, closes_at: value || null })}
                        placeholder="Fără dată"
                        className="w-[240px]"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild title="Editor formular">
                          <Link to={`/admin/recruitment/${campaign.id}/builder`}><Settings2 className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild title="Previzualizare">
                          <Link to={`/admin/recruitment/${campaign.id}/preview`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild title="Aplicanți">
                          <Link to={`/admin/recruitment/${campaign.id}/applicants`}><Users className="h-4 w-4" /></Link>
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
