
-- Departments (7)
INSERT INTO public.departments (name, slug, description, order_index) VALUES
('Executive Board', 'executive-board', 'Strategic leadership and decision making', 1),
('Operations', 'operations', 'Streamlining processes and efficiency', 2),
('Marketing', 'marketing', 'Brand awareness and communication', 3),
('Technology', 'technology', 'Software development and IT infrastructure', 4),
('Human Resources', 'human-resources', 'Talent acquisition and culture', 5),
('Finance', 'finance', 'Budgeting and financial planning', 6),
('Events', 'events', 'Planning and executing organization events', 7);

-- Partners (5)
INSERT INTO public.partners (name, website_url, visible) VALUES
('TechCorp', 'https://example.com', true),
('InnovateHub', 'https://example.com', true),
('EduFuture', 'https://example.com', true),
('GlobalReach', 'https://example.com', true),
('CommunityFirst', 'https://example.com', true);

-- Members (42)
INSERT INTO public.members (full_name, role, department, visible, order_index)
SELECT
  'Member ' || i,
  CASE WHEN (i % 7) = 0 THEN 'Director' ELSE 'Member' END,
  (ARRAY['Executive Board', 'Operations', 'Marketing', 'Technology', 'Human Resources', 'Finance', 'Events'])[1 + (i - 1) % 7],
  true,
  i
FROM generate_series(1, 42) AS i;

-- Posts (11)
INSERT INTO public.posts (title, slug, excerpt, content, published, author_id)
SELECT
  'Blog Post ' || i,
  'blog-post-' || i,
  'This is an excerpt for blog post ' || i || '. It touches on important topics.',
  'Full content for blog post ' || i || '. Here we discuss the details of the topic in depth.',
  true,
  NULL
FROM generate_series(1, 11) AS i;
