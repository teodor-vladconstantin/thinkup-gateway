import { supabase } from '@/integrations/supabase/client';
import type {
  Application,
  ApplicationAnswer,
  ApplicationStatus,
  Campaign,
  CampaignQuestion,
  CampaignStatus,
  CampaignType,
} from '@/types/recruitment';

// ---- Campaigns -------------------------------------------------------

export async function fetchAllCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('recruitment_campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Campaign[];
}

export async function fetchCampaign(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase.from('recruitment_campaigns').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Campaign | null;
}

export async function fetchCampaignBySlug(slug: string): Promise<Campaign | null> {
  const { data, error } = await supabase.from('recruitment_campaigns').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data as Campaign | null;
}

export async function fetchPublishedCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('recruitment_campaigns')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Campaign[];
}

export type CreateCampaignInput = {
  type: CampaignType;
  title: string;
  slug: string;
  description?: string | null;
  opens_at?: string | null;
  closes_at?: string | null;
};

export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('recruitment_campaigns')
    .insert({
      type: input.type,
      title: input.title,
      slug: input.slug,
      description: input.description || null,
      opens_at: input.opens_at || null,
      closes_at: input.closes_at || null,
      created_by: user?.id ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Campaign;
}

export async function updateCampaign(id: string, patch: Partial<CreateCampaignInput>): Promise<void> {
  const { error } = await supabase.from('recruitment_campaigns').update(patch).eq('id', id);
  if (error) throw error;
}

export async function updateCampaignStatus(id: string, status: CampaignStatus): Promise<void> {
  const { error } = await supabase.from('recruitment_campaigns').update({ status }).eq('id', id);
  if (error) throw error;
}

// ---- Questions ---------------------------------------------------------

export async function fetchQuestions(campaignId: string): Promise<CampaignQuestion[]> {
  const { data, error } = await supabase
    .from('recruitment_campaign_questions')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return (data ?? []) as CampaignQuestion[];
}

export type UpsertQuestionInput = {
  campaign_id: string;
  type: CampaignQuestion['type'];
  label: string;
  help_text?: string | null;
  options?: string[];
  is_required: boolean;
  order_index: number;
};

export async function createQuestion(input: UpsertQuestionInput): Promise<CampaignQuestion> {
  const { data, error } = await supabase
    .from('recruitment_campaign_questions')
    .insert({ ...input, options: input.options ?? [] })
    .select('*')
    .single();
  if (error) throw error;
  return data as CampaignQuestion;
}

export async function updateQuestion(id: string, patch: Partial<UpsertQuestionInput>): Promise<void> {
  const { error } = await supabase.from('recruitment_campaign_questions').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from('recruitment_campaign_questions').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderQuestions(questions: { id: string; order_index: number }[]): Promise<void> {
  await Promise.all(
    questions.map(({ id, order_index }) =>
      supabase.from('recruitment_campaign_questions').update({ order_index }).eq('id', id),
    ),
  );
}

// ---- Public submission ---------------------------------------------------------

export type SubmitApplicationInput = {
  campaignId: string;
  questions: CampaignQuestion[];
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  values: Record<string, string | string[]>;
  files: Record<string, File>;
};

export async function submitApplication(input: SubmitApplicationInput): Promise<string> {
  const applicationId = crypto.randomUUID();

  const { error: applicationError } = await supabase.from('recruitment_applications').insert({
    id: applicationId,
    campaign_id: input.campaignId,
    applicant_name: input.applicantName,
    applicant_email: input.applicantEmail,
    applicant_phone: input.applicantPhone || null,
  });
  if (applicationError) throw applicationError;

  const answers: {
    application_id: string;
    question_id: string;
    value_text: string | null;
    file_path: string | null;
  }[] = [];

  for (const question of input.questions) {
    if (question.type === 'file_upload') {
      const file = input.files[question.id];
      if (!file) continue;

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${input.campaignId}/${applicationId}/${question.id}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage.from('recruitment-uploads').upload(filePath, file);
      if (uploadError) throw uploadError;

      answers.push({ application_id: applicationId, question_id: question.id, value_text: null, file_path: filePath });
      continue;
    }

    const value = input.values[question.id];
    const isEmpty = value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
    if (isEmpty) continue;

    answers.push({
      application_id: applicationId,
      question_id: question.id,
      value_text: Array.isArray(value) ? JSON.stringify(value) : String(value),
      file_path: null,
    });
  }

  if (answers.length > 0) {
    const { error: answersError } = await supabase.from('recruitment_application_answers').insert(answers);
    if (answersError) throw answersError;
  }

  return applicationId;
}

// ---- Admin: applications & answers ---------------------------------------------------------

export async function fetchApplications(campaignId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('recruitment_applications')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Application[];
}

export async function fetchApplication(id: string): Promise<Application | null> {
  const { data, error } = await supabase.from('recruitment_applications').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Application | null;
}

export async function fetchAnswers(applicationId: string): Promise<ApplicationAnswer[]> {
  const { data, error } = await supabase
    .from('recruitment_application_answers')
    .select('*')
    .eq('application_id', applicationId);
  if (error) throw error;
  return (data ?? []) as ApplicationAnswer[];
}

export async function fetchAnswersForApplications(applicationIds: string[]): Promise<ApplicationAnswer[]> {
  if (applicationIds.length === 0) return [];
  const { data, error } = await supabase
    .from('recruitment_application_answers')
    .select('*')
    .in('application_id', applicationIds);
  if (error) throw error;
  return (data ?? []) as ApplicationAnswer[];
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<void> {
  const { error } = await supabase.from('recruitment_applications').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function updateApplicationNotes(id: string, internal_notes: string): Promise<void> {
  const { error } = await supabase.from('recruitment_applications').update({ internal_notes }).eq('id', id);
  if (error) throw error;
}

export async function getSignedFileUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from('recruitment-uploads').createSignedUrl(filePath, 60);
  if (error || !data?.signedUrl) throw error ?? new Error('Could not create signed URL');
  return data.signedUrl;
}


const DIACRITICS_PATTERN = new RegExp('[̀-ͯ]', 'g');

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_PATTERN, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
