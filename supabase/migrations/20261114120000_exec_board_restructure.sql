-- Executive Board titles live in exec_role/exec_order so a VP can show in the
-- Executive Board AND in their own department (as Director) from a single row.
ALTER TABLE public.members
  ADD COLUMN exec_role text,
  ADD COLUMN exec_order integer;

-- Merge Finance + Human Resources into "Programul Național".
INSERT INTO public.departments (name, slug, description, order_index)
SELECT 'Programul Național', 'programul-national', 'Programul Național, Finance și HR', 5
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Programul Național');

UPDATE public.members SET department = 'Programul Național'
WHERE department IN ('Finance', 'Human Resources');

DELETE FROM public.departments WHERE name IN ('Finance', 'Human Resources');

-- Executive Board (matched by name; check each UPDATE affected 1 row).
UPDATE public.members SET exec_role = 'Președinte', exec_order = 1, department = 'Executive Board'
WHERE full_name ILIKE 'Dalia%Saro%';

UPDATE public.members SET exec_role = 'VP Program Național', exec_order = 2, department = 'Programul Național', role = 'Director'
WHERE full_name ILIKE 'Antonio%Lascu%';

UPDATE public.members SET exec_role = 'VP Marketing', exec_order = 3, department = 'Marketing', role = 'Director'
WHERE full_name ILIKE '%Miruna%Man%';

UPDATE public.members SET exec_role = 'VP Tech', exec_order = 4, department = 'Technology', role = 'Director'
WHERE full_name ILIKE 'Teodor%Constantin%';

UPDATE public.members SET exec_role = 'Secretar', exec_order = 5, department = 'Executive Board', role = 'Secretar'
WHERE full_name ILIKE 'Mario%Circiumaru%';
