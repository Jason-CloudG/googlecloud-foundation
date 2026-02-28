
ALTER TABLE public.submissions
  ADD COLUMN workspace_exists boolean DEFAULT false,
  ADD COLUMN primary_domain text,
  ADD COLUMN super_admin_confirmed boolean DEFAULT false;
