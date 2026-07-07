-- Close recruitment for now and use an English-language message
ALTER TABLE public.site_settings
  ALTER COLUMN applications_closed_message
  SET DEFAULT 'Recruitment is currently closed. Please check back later for the next opening.';

UPDATE public.site_settings
SET
  applications_open = false,
  applications_closed_message = 'Recruitment is currently closed. Please check back later for the next opening.'
WHERE id = 1;
