-- Primar: read-only access to ambassador-campaign applicants, their answers, and their
-- uploaded files. No access to mentor-campaign applications/answers/uploads, and none of
-- the broader is_admin() surface (members, departments, blog, partners, messages, settings).
-- Deliberately no INSERT/UPDATE/DELETE policies -- this role only sees applicants.

CREATE POLICY "Primar can read ambassador campaigns" ON public.recruitment_campaigns
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'primar') AND type = 'ambassador');

CREATE POLICY "Primar can read ambassador campaign questions" ON public.recruitment_campaign_questions
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'primar')
    AND EXISTS (
      SELECT 1 FROM public.recruitment_campaigns c
      WHERE c.id = campaign_id AND c.type = 'ambassador'
    )
  );

CREATE POLICY "Primar can read ambassador applications" ON public.recruitment_applications
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'primar')
    AND EXISTS (
      SELECT 1 FROM public.recruitment_campaigns c
      WHERE c.id = campaign_id AND c.type = 'ambassador'
    )
  );

-- Joins through recruitment_applications (which primar can now read for ambassador
-- campaigns via the policy above) rather than re-checking campaign type directly, same
-- reasoning as the public-submission policies in the base recruitment migration.
CREATE POLICY "Primar can read ambassador application answers" ON public.recruitment_application_answers
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'primar')
    AND EXISTS (
      SELECT 1 FROM public.recruitment_applications a
      JOIN public.recruitment_campaigns c ON c.id = a.campaign_id
      WHERE a.id = application_id AND c.type = 'ambassador'
    )
  );

CREATE POLICY "Primar can read ambassador recruitment uploads" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'recruitment-uploads'
    AND public.has_role(auth.uid(), 'primar')
    AND EXISTS (
      SELECT 1 FROM public.recruitment_campaigns c
      WHERE c.id::text = (storage.foldername(name))[1] AND c.type = 'ambassador'
    )
  );
