export type CampaignType = 'mentor' | 'ambassador';
export type CampaignStatus = 'draft' | 'published' | 'closed';
export type ApplicationStatus = 'new' | 'in_review' | 'interview' | 'accepted' | 'rejected';

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'dropdown'
  | 'file_upload'
  | 'date'
  | 'email'
  | 'phone'
  | 'number'
  | 'scale';

export type Campaign = {
  id: string;
  type: CampaignType;
  title: string;
  slug: string;
  description: string | null;
  status: CampaignStatus;
  opens_at: string | null;
  closes_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CampaignQuestion = {
  id: string;
  campaign_id: string;
  type: QuestionType;
  label: string;
  help_text: string | null;
  options: string[];
  is_required: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  campaign_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  status: ApplicationStatus;
  internal_notes: string | null;
  submitted_at: string;
  updated_at: string;
};

export type ApplicationAnswer = {
  id: string;
  application_id: string;
  question_id: string;
  value_text: string | null;
  file_path: string | null;
  created_at: string;
};

export const campaignTypeLabels: Record<CampaignType, string> = {
  mentor: 'Mentor',
  ambassador: 'Elev Ambasador',
};

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: 'Ciornă',
  published: 'Publicată',
  closed: 'Închisă',
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  new: 'Nou',
  in_review: 'În evaluare',
  interview: 'Interviu',
  accepted: 'Acceptat',
  rejected: 'Respins',
};

export const questionTypeLabels: Record<QuestionType, string> = {
  short_text: 'Text scurt',
  long_text: 'Text lung',
  single_choice: 'Alegere unică',
  multiple_choice: 'Alegere multiplă',
  dropdown: 'Listă derulantă',
  file_upload: 'Fișier',
  date: 'Dată',
  email: 'Email',
  phone: 'Telefon',
  number: 'Număr',
  scale: 'Scală (1-10)',
};

export const questionTypesWithOptions: QuestionType[] = ['single_choice', 'multiple_choice', 'dropdown'];
