UPDATE public.members SET exec_role = replace(exec_role, 'VP ', 'Vicepreședinte ') WHERE exec_role LIKE 'VP %';
