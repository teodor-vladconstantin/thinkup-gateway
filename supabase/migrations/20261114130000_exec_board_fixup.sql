-- Fixup: keep the pre-existing "Programul National" dept, drop the duplicate,
-- point Teodor at "TechUp", and add Mario (secretary) which did not exist.
UPDATE public.members SET department = 'Programul National' WHERE department = 'Programul Național';
DELETE FROM public.departments WHERE name = 'Programul Național';
UPDATE public.members SET exec_role = 'VP Program Național' WHERE full_name ILIKE 'Antonio%Lascu%';
UPDATE public.members SET department = 'TechUp' WHERE full_name ILIKE 'Teodor%Constantin%';

INSERT INTO public.members (full_name, role, department, exec_role, exec_order, visible, order_index)
SELECT 'Mario Circiumaru', 'Secretar', 'Executive Board', 'Secretar', 5, true, 5
WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE full_name ILIKE 'Mario%Circiumaru%');
