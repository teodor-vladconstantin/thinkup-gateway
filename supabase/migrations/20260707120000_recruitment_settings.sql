-- Singleton settings row for recruitment availability
CREATE TABLE public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  applications_open BOOLEAN NOT NULL DEFAULT true,
  applications_closed_message TEXT NOT NULL DEFAULT 'Recruitările sunt momentan închise. Revino mai târziu pentru o nouă deschidere.'
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.site_settings (id, applications_open, applications_closed_message)
VALUES (1, true, 'Recruitările sunt momentan închise. Revino mai târziu pentru o nouă deschidere.')
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Site settings publicly readable" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert site settings" ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) AND id = 1);

CREATE OR REPLACE FUNCTION public.reject_application_if_closed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings_row public.site_settings%ROWTYPE;
BEGIN
  SELECT *
  INTO settings_row
  FROM public.site_settings
  WHERE id = 1;

  IF settings_row.id IS NOT NULL AND NOT settings_row.applications_open THEN
    RAISE EXCEPTION USING MESSAGE = settings_row.applications_closed_message, ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_application_when_closed
  BEFORE INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.reject_application_if_closed();