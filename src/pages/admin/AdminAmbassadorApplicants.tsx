import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { fetchAllCampaigns } from '@/lib/recruitment';
import { campaignStatusLabels } from '@/types/recruitment';

// Read-only landing page for the "Primar" role: lists ambassador-recruitment campaigns and
// links into the existing applicants view. RLS (see 20260904120100_primar_ambassador_recruitment_access.sql)
// already restricts what this role can actually fetch to ambassador campaigns -- the client-side
// type filter below is just so a published/closed mentor campaign (publicly readable by title)
// never shows up in this list.
export default function AdminAmbassadorApplicants() {
  const { data: campaigns, isLoading } = useQuery({ queryKey: ['ambassador-campaigns'], queryFn: fetchAllCampaigns });
  const ambassadorCampaigns = (campaigns ?? []).filter((campaign) => campaign.type === 'ambassador');

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Aplicanți — Elevi Ambasadori</h1>
        <p className="mt-1 text-gray-500">Vezi aplicanții la campaniile de recrutare pentru elevi ambasadori.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Campanie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aplicanți</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-gray-500">Se încarcă...</TableCell>
                </TableRow>
              ) : !ambassadorCampaigns.length ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-gray-500">Nicio campanie găsită.</TableCell>
                </TableRow>
              ) : (
                ambassadorCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-semibold text-gray-900">{campaign.title}</TableCell>
                    <TableCell className="text-gray-600">{campaignStatusLabels[campaign.status]}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/recruitment/${campaign.id}/applicants`} className="flex items-center gap-2">
                          <Users className="h-4 w-4" /> Vezi aplicanții
                        </Link>
                      </Button>
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
