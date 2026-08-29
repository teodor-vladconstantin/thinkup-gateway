-- The old generic "Join Us" application flow (applications table + site_settings open/closed
-- gate) is fully superseded by the recruitment_campaigns/recruitment_applications module.
-- Nothing in the app writes to these anymore. Confirmed with the site owner there is nothing
-- worth keeping in them before dropping.

DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP FUNCTION IF EXISTS public.reject_application_if_closed() CASCADE;
