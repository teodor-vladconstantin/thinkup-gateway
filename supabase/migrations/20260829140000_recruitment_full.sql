-- Full recruitment module per product brief: campaigns -> questions -> applications -> answers.
-- Replaces the earlier 2-table draft (recruitment_programs / recruitment_applications with
-- everything flattened into JSONB blobs). That draft was never committed to this repo, but since
-- this database is a real remote project we can't be certain it was never applied by hand, so we
-- RENAME the old tables into a backup instead of dropping them -- preserves any real data that
-- might already be there instead of destroying it. Safe to clean up the *_legacy_backup tables
-- once you've confirmed there was nothing worth keeping in them.

-- Only drops the *policies* (who may read/write) -- the bucket itself and anything already
-- uploaded to it, if it exists, are left untouched.
DROP POLICY IF EXISTS "Applicants can upload to open recruitment programs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read recruitment documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete recruitment documents" ON storage.objects;

ALTER TABLE IF EXISTS public.recruitment_applications RENAME TO recruitment_applications_legacy_backup;
ALTER TABLE IF EXISTS public.recruitment_programs RENAME TO recruitment_programs_legacy_backup;
DROP FUNCTION IF EXISTS public.set_recruitment_updated_at() CASCADE;

-- Enums

CREATE TYPE public.recruitment_campaign_type AS ENUM ('mentor', 'ambassador');
CREATE TYPE public.recruitment_campaign_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE public.recruitment_question_type AS ENUM (
  'short_text', 'long_text', 'single_choice', 'multiple_choice', 'dropdown',
  'file_upload', 'date', 'email', 'phone', 'number', 'scale'
);
CREATE TYPE public.recruitment_application_status AS ENUM ('new', 'in_review', 'interview', 'accepted', 'rejected');

CREATE OR REPLACE FUNCTION public.set_recruitment_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Campaigns

-- Constraint/index names below are explicit (not left to Postgres's default <table>_pkey /
-- <table>_<col>_idx convention) because this database already had an old, same-named
-- recruitment_applications table with default-named indexes (recruitment_applications_pkey,
-- recruitment_applications_status_idx) from a previously-applied draft migration -- renaming
-- that table doesn't rename its indexes, so the defaults would collide with the new table's.

CREATE TABLE public.recruitment_campaigns (
  id UUID DEFAULT gen_random_uuid(),
  type public.recruitment_campaign_type NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  status public.recruitment_campaign_status NOT NULL DEFAULT 'draft',
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_recruitment_campaigns PRIMARY KEY (id),
  CONSTRAINT uq_recruitment_campaigns_slug UNIQUE (slug)
);
ALTER TABLE public.recruitment_campaigns ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER recruitment_campaigns_updated_at
  BEFORE UPDATE ON public.recruitment_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_recruitment_updated_at();

-- Questions

CREATE TABLE public.recruitment_campaign_questions (
  id UUID DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.recruitment_campaigns(id) ON DELETE CASCADE,
  type public.recruitment_question_type NOT NULL,
  label TEXT NOT NULL,
  help_text TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT false,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_recruitment_campaign_questions PRIMARY KEY (id)
);
ALTER TABLE public.recruitment_campaign_questions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER recruitment_campaign_questions_updated_at
  BEFORE UPDATE ON public.recruitment_campaign_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_recruitment_updated_at();

-- Applications

CREATE TABLE public.recruitment_applications (
  id UUID DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.recruitment_campaigns(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  status public.recruitment_application_status NOT NULL DEFAULT 'new',
  internal_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_recruitment_applications PRIMARY KEY (id)
);
ALTER TABLE public.recruitment_applications ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER recruitment_applications_updated_at
  BEFORE UPDATE ON public.recruitment_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_recruitment_updated_at();

-- Answers

CREATE TABLE public.recruitment_application_answers (
  id UUID DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.recruitment_applications(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.recruitment_campaign_questions(id) ON DELETE CASCADE,
  value_text TEXT,
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_recruitment_application_answers PRIMARY KEY (id)
);
ALTER TABLE public.recruitment_application_answers ENABLE ROW LEVEL SECURITY;

-- Indexes (idx_ prefix, see note above on explicit naming)

CREATE INDEX idx_recruitment_campaigns_slug ON public.recruitment_campaigns (slug);
CREATE INDEX idx_recruitment_campaigns_type_status ON public.recruitment_campaigns (type, status);
CREATE INDEX idx_recruitment_campaign_questions_campaign_id ON public.recruitment_campaign_questions (campaign_id, order_index);
CREATE INDEX idx_recruitment_applications_campaign_id ON public.recruitment_applications (campaign_id);
CREATE INDEX idx_recruitment_applications_status ON public.recruitment_applications (status);
CREATE INDEX idx_recruitment_application_answers_application_id ON public.recruitment_application_answers (application_id);
CREATE INDEX idx_recruitment_application_answers_question_id ON public.recruitment_application_answers (question_id);

-- RLS: campaigns — public can read published AND closed campaigns (so the public apply page can
-- show a proper "this closed" message with the real title instead of a bare 404); drafts stay
-- hidden until an admin publishes them. Admins manage everything regardless of status.

CREATE POLICY "Published and closed campaigns are publicly readable" ON public.recruitment_campaigns
  FOR SELECT USING (status IN ('published', 'closed'));

CREATE POLICY "Admins can manage campaigns" ON public.recruitment_campaigns
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS: questions — public can read questions of published campaigns, admins manage everything

CREATE POLICY "Questions of published campaigns are publicly readable" ON public.recruitment_campaign_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recruitment_campaigns c
      WHERE c.id = campaign_id AND c.status = 'published'
    )
  );

CREATE POLICY "Admins can manage questions" ON public.recruitment_campaign_questions
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS: applications — public can only insert against a published campaign, admins read/manage

CREATE POLICY "Anyone can apply to published campaigns" ON public.recruitment_applications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recruitment_campaigns c
      WHERE c.id = campaign_id AND c.status = 'published'
    )
  );

CREATE POLICY "Admins can read applications" ON public.recruitment_applications
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update applications" ON public.recruitment_applications
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete applications" ON public.recruitment_applications
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- RLS: answers — public can only insert answers tied to a published-campaign application, admins read

-- Joins through recruitment_campaign_questions (publicly readable for published campaigns)
-- rather than recruitment_applications (admin-only SELECT) -- an anon role can't see rows
-- through a table it has no SELECT policy on, even inside another policy's subquery.
CREATE POLICY "Anyone can submit answers for a published campaign" ON public.recruitment_application_answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recruitment_campaign_questions q
      JOIN public.recruitment_campaigns c ON c.id = q.campaign_id
      WHERE q.id = question_id AND c.status = 'published'
    )
  );

CREATE POLICY "Admins can read answers" ON public.recruitment_application_answers
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- Storage bucket for uploads (CV, portfolio, etc). Private: applicants can only write, admins
-- read via signed URL. Client uploads to `{campaign_id}/{application_id}/{question_id}-{filename}`.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recruitment-uploads',
  'recruitment-uploads',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Applicants can upload to published campaigns" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'recruitment-uploads'
    AND EXISTS (
      SELECT 1 FROM public.recruitment_campaigns c
      WHERE c.id::text = (storage.foldername(name))[1] AND c.status = 'published'
    )
  );

CREATE POLICY "Admins can read recruitment uploads" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'recruitment-uploads' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete recruitment uploads" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'recruitment-uploads' AND public.is_admin(auth.uid()));

-- Seed data: carry forward the two campaigns from the earlier draft, as drafts so an admin has
-- to deliberately publish them (nothing becomes publicly visible/applicable by default).

INSERT INTO public.recruitment_campaigns (type, title, slug, description, status) VALUES
  ('mentor', 'Recrutare Mentori', 'mentor', 'Susține și ghidează următoarea generație de constructori și gânditori.', 'draft'),
  ('ambassador', 'Recrutare Elevi Ambasadori', 'ambassador', 'Reprezintă ThinkUp Academy în comunitatea ta și ajută la extinderea rețelei noastre.', 'draft');

DO $$
DECLARE
  mentor_id UUID;
  ambassador_id UUID;
BEGIN
  SELECT id INTO mentor_id FROM public.recruitment_campaigns WHERE slug = 'mentor';
  SELECT id INTO ambassador_id FROM public.recruitment_campaigns WHERE slug = 'ambassador';

  INSERT INTO public.recruitment_campaign_questions (campaign_id, type, label, is_required, order_index) VALUES
    (mentor_id, 'short_text', 'Școală / Instituție', true, 0),
    (mentor_id, 'long_text', 'De ce vrei să devii mentor?', true, 1);

  INSERT INTO public.recruitment_campaign_questions (campaign_id, type, label, options, is_required, order_index) VALUES
    (ambassador_id, 'short_text', 'Școală / Instituție', '[]'::jsonb, true, 0),
    (ambassador_id, 'dropdown', 'Ce ai vrea să promovezi?', '["Evenimente","Creșterea comunității","Parteneriate","Conținut și promovare"]'::jsonb, true, 1);
END $$;
