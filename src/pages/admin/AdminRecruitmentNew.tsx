import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createCampaign, slugify } from '@/lib/recruitment';
import { campaignTypeLabels, type CampaignType } from '@/types/recruitment';

export default function AdminRecruitmentNew() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [type, setType] = useState<CampaignType>('mentor');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: (campaign) => {
      toast({ title: 'Campanie creată', description: `${campaign.title} a fost creată ca ciornă.` });
      navigate(`/admin/recruitment/${campaign.id}/builder`);
    },
    onError: (error: Error) => toast({ title: 'Crearea a eșuat', description: error.message, variant: 'destructive' }),
  });

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !slug.trim()) {
      toast({ title: 'Date lipsă', description: 'Titlul și slug-ul sunt obligatorii.', variant: 'destructive' });
      return;
    }

    createMutation.mutate({
      type,
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      opens_at: opensAt || null,
      closes_at: closesAt || null,
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Campanie nouă</h1>
        <p className="mt-1 text-gray-500">Campania va porni ca ciornă — nu va fi vizibilă public până nu o publici.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalii campanie</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Tip campanie</Label>
              <Select value={type} onValueChange={(value) => setType(value as CampaignType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mentor">{campaignTypeLabels.mentor}</SelectItem>
                  <SelectItem value="ambassador">{campaignTypeLabels.ambassador}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titlu</Label>
              <Input id="title" value={title} onChange={(event) => handleTitleChange(event.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL public: /aplica/{slug || '...'})</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descriere</Label>
              <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deschidere (opțional)</Label>
                <DateTimePicker value={opensAt} onChange={setOpensAt} placeholder="Fără dată" />
              </div>
              <div className="space-y-2">
                <Label>Închidere (opțional)</Label>
                <DateTimePicker value={closesAt} onChange={setClosesAt} placeholder="Fără dată" />
              </div>
            </div>

            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? 'Se creează...' : 'Creează campania'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
