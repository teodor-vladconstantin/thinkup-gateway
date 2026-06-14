ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'blog_editor';

CREATE OR REPLACE FUNCTION public.can_manage_blog(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'director', 'ceo', 'vicepresident', 'blog_editor')
  )
$$;

CREATE POLICY "Blog users can read all posts" ON public.posts
  FOR SELECT TO authenticated
  USING (public.can_manage_blog(auth.uid()));

CREATE POLICY "Blog users can insert posts" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_blog(auth.uid()));

CREATE POLICY "Blog users can update posts" ON public.posts
  FOR UPDATE TO authenticated
  USING (public.can_manage_blog(auth.uid()));

CREATE POLICY "Blog users can delete posts" ON public.posts
  FOR DELETE TO authenticated
  USING (public.can_manage_blog(auth.uid()));

CREATE POLICY "Blog users can upload blog media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND name LIKE 'blog/%' AND public.can_manage_blog(auth.uid()));

CREATE POLICY "Blog users can update blog media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND name LIKE 'blog/%' AND public.can_manage_blog(auth.uid()));

CREATE POLICY "Blog users can delete blog media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND name LIKE 'blog/%' AND public.can_manage_blog(auth.uid()));
