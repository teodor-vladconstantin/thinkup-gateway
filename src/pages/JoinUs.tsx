import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchPublishedCampaigns } from '@/lib/recruitment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { campaignTypeLabels } from '@/types/recruitment';

export default function JoinUs() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['published-campaigns'],
    queryFn: fetchPublishedCampaigns,
  });

  return (
    <div className="min-h-screen bg-[#1a0b2e] flex flex-col justify-center items-center py-24 px-4 font-sans">
      <div className="w-full max-w-3xl space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Join the <span className="font-serif italic text-purple-300">Academy</span>
          </h1>
          <p className="text-purple-100/70 text-lg">Alege campania de recrutare la care vrei să aplici.</p>
        </div>

        {isLoading ? (
          <p className="text-center text-purple-100/70">Se încarcă...</p>
        ) : !campaigns?.length ? (
          <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">
            <CardContent className="p-10 text-center text-gray-600">
              Nu există recrutări deschise momentan. Revino mai târziu pentru o nouă deschidere.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">
                <CardHeader>
                  <p className="text-xs font-semibold uppercase tracking-widest text-purple-500">
                    {campaignTypeLabels[campaign.type]}
                  </p>
                  <CardTitle className="text-xl text-purple-900">{campaign.title}</CardTitle>
                  {campaign.description && <CardDescription>{campaign.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-[#1a0b2e] text-white hover:bg-[#2d1b4e]">
                    <Link to={`/aplica/${campaign.slug}`} className="flex items-center justify-center gap-2">
                      Aplică acum <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
