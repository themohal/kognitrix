-- Add SEO Optimizer Service
-- Migration to add the 7th AI service

INSERT INTO services (name, slug, description, short_description, category, credit_cost, icon, endpoint) VALUES
('AI SEO Optimizer', 'seo-optimizer', 'Full SEO audit tool: analyze URLs or content for keyword optimization, meta tag suggestions, content structure scoring, and actionable SEO recommendations. Powered by GPT-4o to evaluate content against current SEO best practices.', 'SEO audit, keyword optimization, meta tags & recommendations', 'seo', 12, 'Search', '/api/v1/generate/seo');
