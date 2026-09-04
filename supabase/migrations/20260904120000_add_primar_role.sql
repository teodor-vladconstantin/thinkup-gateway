-- Adds the "Primar" role: strictly scoped to viewing ambassador-recruitment applicants
-- (see 20260904120100_primar_ambassador_recruitment_access.sql for the RLS policies).
-- Split into its own migration/transaction because a newly added enum value cannot be
-- referenced (e.g. in a policy's USING clause) within the same transaction it was added in.

ALTER TYPE public.app_role ADD VALUE 'primar';
