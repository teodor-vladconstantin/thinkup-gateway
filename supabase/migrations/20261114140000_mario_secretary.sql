-- Mario already existed as "Mario-Daniel Cîrciumaru" (with photo) in Programul National.
-- Drop the photo-less duplicate and make the real row the Secretary.
DELETE FROM public.members WHERE full_name = 'Mario Circiumaru';
UPDATE public.members
SET department = 'Executive Board', role = 'Secretar', exec_role = 'Secretar', exec_order = 5
WHERE full_name ILIKE 'Mario%ciumaru%';
