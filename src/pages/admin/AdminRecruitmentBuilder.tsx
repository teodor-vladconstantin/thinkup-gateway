import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  createQuestion,
  deleteQuestion,
  fetchCampaign,
  fetchQuestions,
  updateCampaign,
  updateCampaignStatus,
  updateQuestion,
} from '@/lib/recruitment';
import {
  campaignStatusLabels,
  questionTypeLabels,
  questionTypesWithOptions,
  type CampaignQuestion,
  type CampaignStatus,
  type QuestionType,
} from '@/types/recruitment';
import { ArrowLeft, ArrowUp, ArrowDown, Eye, Plus, Trash2, Users } from 'lucide-react';

const isTempId = (id: string) => id.startsWith('temp-');
const questionTypes = Object.keys(questionTypeLabels) as QuestionType[];

export default function AdminRecruitmentBuilder() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<CampaignQuestion[]>([]);
  const [titleDraft, setTitleDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [optionsText, setOptionsText] = useState<Record<string, string>>({});

  const { data: campaign } = useQuery({
    queryKey: ['admin-campaign', id],
    queryFn: () => fetchCampaign(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (campaign) {
      setTitleDraft(campaign.title);
      setDescriptionDraft(campaign.description ?? '');
    }
  }, [campaign]);

  const { data: fetchedQuestions } = useQuery({
    queryKey: ['campaign-questions', id],
    queryFn: () => fetchQuestions(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (fetchedQuestions) {
      setDraft(fetchedQuestions);
      setOptionsText(Object.fromEntries(fetchedQuestions.map((q) => [q.id, (q.options ?? []).join(', ')])));
    }
  }, [fetchedQuestions]);

  const statusMutation = useMutation({
    mutationFn: (status: CampaignStatus) => updateCampaignStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast({ title: 'Status actualizat' });
    },
    onError: (error: Error) => toast({ title: 'Actualizarea a eșuat', description: error.message, variant: 'destructive' }),
  });

  const detailsMutation = useMutation({
    mutationFn: () => updateCampaign(id!, { title: titleDraft.trim(), description: descriptionDraft.trim() || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast({ title: 'Detalii campanie salvate' });
    },
    onError: (error: Error) => toast({ title: 'Salvarea a eșuat', description: error.message, variant: 'destructive' }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const originalIds = new Set((fetchedQuestions ?? []).map((question) => question.id));
      const draftIds = new Set(draft.filter((question) => !isTempId(question.id)).map((question) => question.id));

      const toDelete = [...originalIds].filter((questionId) => !draftIds.has(questionId));
      await Promise.all(toDelete.map((questionId) => deleteQuestion(questionId)));

      const reindexed = draft.map((question, index) => ({ ...question, order_index: index }));

      await Promise.all(
        reindexed.map((question) =>
          isTempId(question.id)
            ? createQuestion({
                campaign_id: id!,
                type: question.type,
                label: question.label,
                help_text: question.help_text || null,
                options: question.options,
                is_required: question.is_required,
                order_index: question.order_index,
              })
            : updateQuestion(question.id, {
                type: question.type,
                label: question.label,
                help_text: question.help_text || null,
                options: question.options,
                is_required: question.is_required,
                order_index: question.order_index,
              }),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-questions', id] });
      toast({ title: 'Formular salvat', description: 'Întrebările au fost actualizate.' });
    },
    onError: (error: Error) => toast({ title: 'Salvarea a eșuat', description: error.message, variant: 'destructive' }),
  });

  const addQuestion = () => {
    const newId = `temp-${crypto.randomUUID()}`;
    setOptionsText((current) => ({ ...current, [newId]: '' }));
    setDraft((current) => [
      ...current,
      {
        id: newId,
        campaign_id: id!,
        type: 'short_text',
        label: 'Întrebare nouă',
        help_text: null,
        options: [],
        is_required: false,
        order_index: current.length,
        created_at: '',
        updated_at: '',
      },
    ]);
  };

  const updateDraft = (questionId: string, patch: Partial<CampaignQuestion>) => {
    setDraft((current) => current.map((question) => (question.id === questionId ? { ...question, ...patch } : question)));
  };

  const removeDraft = (questionId: string) => {
    setDraft((current) => current.filter((question) => question.id !== questionId));
  };

  const moveDraft = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  if (!campaign) {
    return <div className="p-6 text-gray-500">Se încarcă...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/admin/recruitment" className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Toate campaniile
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{campaign.title}</h1>
          <p className="mt-1 text-gray-500">/aplica/{campaign.slug}</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={campaign.status} onValueChange={(value) => statusMutation.mutate(value as CampaignStatus)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{campaignStatusLabels.draft}</SelectItem>
              <SelectItem value="published">{campaignStatusLabels.published}</SelectItem>
              <SelectItem value="closed">{campaignStatusLabels.closed}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/recruitment/${campaign.id}/preview`} className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Previzualizare
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/recruitment/${campaign.id}/applicants`} className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Aplicanți
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalii campanie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Titlu</Label>
            <Input value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descriere</Label>
            <Textarea value={descriptionDraft} onChange={(event) => setDescriptionDraft(event.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => detailsMutation.mutate()}
              disabled={detailsMutation.isPending || (titleDraft === campaign.title && descriptionDraft === (campaign.description ?? ''))}
            >
              {detailsMutation.isPending ? 'Se salvează...' : 'Salvează detaliile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Întrebări formular</CardTitle>
          <Button onClick={addQuestion} variant="outline" size="sm">
            <Plus className="mr-1 h-4 w-4" /> Adaugă întrebare
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.length === 0 && (
            <p className="text-sm text-gray-500">Niciun câmp încă. Numele, emailul și telefonul aplicantului sunt colectate automat — adaugă aici doar întrebările suplimentare.</p>
          )}

          {draft.map((question, index) => (
            <div key={question.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Întrebarea #{index + 1}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => moveDraft(index, -1)} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => moveDraft(index, 1)} disabled={index === draft.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeDraft(question.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Întrebare</Label>
                  <Input value={question.label} onChange={(event) => updateDraft(question.id, { label: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tip răspuns</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) =>
                      updateDraft(question.id, {
                        type: value as QuestionType,
                        options: value === 'scale' ? ['1', '5'] : [],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {questionTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Text ajutător (opțional)</Label>
                  <Input
                    value={question.help_text ?? ''}
                    onChange={(event) => updateDraft(question.id, { help_text: event.target.value })}
                  />
                </div>
              </div>

              {questionTypesWithOptions.includes(question.type) && (
                <div className="mt-4 space-y-2">
                  <Label>Opțiuni (separate prin virgulă)</Label>
                  <Input
                    value={optionsText[question.id] ?? (question.options ?? []).join(', ')}
                    onChange={(event) => {
                      const text = event.target.value;
                      setOptionsText((current) => ({ ...current, [question.id]: text }));
                      updateDraft(question.id, {
                        options: text.split(',').map((value) => value.trim()).filter(Boolean),
                      });
                    }}
                  />
                </div>
              )}

              {question.type === 'scale' && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minim</Label>
                    <Input
                      type="number"
                      value={question.options?.[0] ?? '1'}
                      onChange={(event) => updateDraft(question.id, { options: [event.target.value, question.options?.[1] ?? '5'] })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maxim</Label>
                    <Input
                      type="number"
                      value={question.options?.[1] ?? '5'}
                      onChange={(event) => updateDraft(question.id, { options: [question.options?.[0] ?? '1', event.target.value] })}
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">Obligatoriu</span>
                <Switch
                  checked={question.is_required}
                  onCheckedChange={(checked) => updateDraft(question.id, { is_required: checked })}
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Se salvează...' : 'Salvează formularul'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
