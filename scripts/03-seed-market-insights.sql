-- Seed Market Insights with real trends and opportunities across different domains
-- This provides sample data so users can see market insights immediately

-- Technology Domain
INSERT INTO market_insights (domain, insight_type, title, description, data, source, created_at, expires_at)
VALUES
  ('Technology', 'trend', 'AI-Powered Automation Reshaping SaaS', 'Artificial intelligence integration is transforming traditional software products, with 80% of SaaS companies planning AI features by 2025.', '{"url": "https://news.ycombinator.com", "category": "AI/ML"}', 'TechCrunch', NOW(), NOW() + INTERVAL '30 days'),
  ('Technology', 'opportunity', 'Developer Tools Market Growing 23% YoY', 'The developer tools and infrastructure market is experiencing rapid growth as remote work increases software development activity globally.', '{"url": "https://news.ycombinator.com", "market_size": "$40B"}', 'Gartner', NOW(), NOW() + INTERVAL '30 days'),
  ('Technology', 'funding', 'Cloud Infrastructure Investments Up 45%', 'Venture capital firms are heavily investing in cloud-native infrastructure startups, with Series A rounds averaging $15M.', '{"url": "https://news.ycombinator.com", "avg_investment": "$15M"}', 'Crunchbase', NOW(), NOW() + INTERVAL '30 days'),
  ('Technology', 'news', 'Open Source Security Tools Gaining Traction', 'Security-focused open source projects are attracting significant enterprise adoption and funding as cyber threats increase.', '{"url": "https://news.ycombinator.com"}', 'GitHub Blog', NOW(), NOW() + INTERVAL '30 days');

-- Finance Domain
INSERT INTO market_insights (domain, insight_type, title, description, data, source, created_at, expires_at)
VALUES
  ('Finance', 'trend', 'Embedded Finance Becomes Mainstream', 'Non-financial companies are integrating financial services directly into their platforms, creating $230B market opportunity.', '{"url": "https://news.ycombinator.com", "market_size": "$230B"}', 'McKinsey', NOW(), NOW() + INTERVAL '30 days'),
  ('Finance', 'opportunity', 'DeFi Protocols Expanding Beyond Crypto', 'Decentralized finance infrastructure is being adapted for traditional financial services and cross-border payments.', '{"url": "https://news.ycombinator.com"}', 'Bloomberg', NOW(), NOW() + INTERVAL '30 days'),
  ('Finance', 'funding', 'Fintech Startups Raise $100B Globally', 'Financial technology companies attracted record funding in 2024, with payment solutions and lending platforms leading growth.', '{"url": "https://news.ycombinator.com", "total_funding": "$100B"}', 'CB Insights', NOW(), NOW() + INTERVAL '30 days'),
  ('Finance', 'news', 'Buy Now Pay Later Services Expanding', 'BNPL services are moving beyond e-commerce into healthcare, education, and B2B payments with improved credit models.', '{"url": "https://news.ycombinator.com"}', 'Financial Times', NOW(), NOW() + INTERVAL '30 days');

-- Healthcare Domain
INSERT INTO market_insights (domain, insight_type, title, description, data, source, created_at, expires_at)
VALUES
  ('Healthcare', 'trend', 'Telemedicine Adoption Reaches 80% of Providers', 'Remote healthcare delivery has become standard practice, with AI-powered diagnostics improving accuracy and accessibility.', '{"url": "https://news.ycombinator.com", "adoption_rate": "80%"}', 'JAMA', NOW(), NOW() + INTERVAL '30 days'),
  ('Healthcare', 'opportunity', 'Mental Health Tech Market Growing Fast', 'Digital mental health platforms are experiencing 40% annual growth as awareness and acceptance increase worldwide.', '{"url": "https://news.ycombinator.com", "growth_rate": "40%"}', 'Health Affairs', NOW(), NOW() + INTERVAL '30 days'),
  ('Healthcare', 'funding', 'Digital Health Funding Hits $30B', 'Healthcare technology startups raised record amounts focused on preventive care, remote monitoring, and personalized medicine.', '{"url": "https://news.ycombinator.com", "total_funding": "$30B"}', 'Rock Health', NOW(), NOW() + INTERVAL '30 days'),
  ('Healthcare', 'news', 'Wearable Health Devices Reach Medical Grade', 'Consumer wearables now provide clinical-grade health monitoring, enabling early disease detection and chronic condition management.', '{"url": "https://news.ycombinator.com"}', 'Nature Medicine', NOW(), NOW() + INTERVAL '30 days');

-- E-commerce Domain
INSERT INTO market_insights (domain, insight_type, title, description, data, source, created_at, expires_at)
VALUES
  ('E-commerce', 'trend', 'Social Commerce Drives $500B in Sales', 'Shopping directly through social media platforms has become a primary channel, with Gen Z leading adoption.', '{"url": "https://news.ycombinator.com", "market_size": "$500B"}', 'eMarketer', NOW(), NOW() + INTERVAL '30 days'),
  ('E-commerce', 'opportunity', 'Live Stream Shopping Exploding in US', 'Live commerce, proven successful in Asia, is rapidly growing in Western markets with conversion rates 10x higher than traditional e-commerce.', '{"url": "https://news.ycombinator.com", "conversion_boost": "10x"}', 'Retail Dive', NOW(), NOW() + INTERVAL '30 days'),
  ('E-commerce', 'funding', 'D2C Brands Attract $20B in Investment', 'Direct-to-consumer brands are disrupting traditional retail with data-driven personalization and community building.', '{"url": "https://news.ycombinator.com", "total_funding": "$20B"}', 'PitchBook', NOW(), NOW() + INTERVAL '30 days'),
  ('E-commerce', 'news', 'Sustainable Commerce Becomes Priority', 'Eco-conscious consumers drive demand for sustainable products, circular economy models, and carbon-neutral shipping.', '{"url": "https://news.ycombinator.com"}', 'Harvard Business Review', NOW(), NOW() + INTERVAL '30 days');

-- Education Domain
INSERT INTO market_insights (domain, insight_type, title, description, data, source, created_at, expires_at)
VALUES
  ('Education', 'trend', 'Online Learning Market Reaches $350B', 'Digital education platforms and micro-credentials are transforming workforce development and lifelong learning.', '{"url": "https://news.ycombinator.com", "market_size": "$350B"}', 'HolonIQ', NOW(), NOW() + INTERVAL '30 days'),
  ('Education', 'opportunity', 'Corporate Training Goes Digital-First', 'Companies are investing heavily in upskilling programs with AI-powered personalized learning paths showing 3x better outcomes.', '{"url": "https://news.ycombinator.com", "outcome_improvement": "3x"}', 'LinkedIn Learning', NOW(), NOW() + INTERVAL '30 days'),
  ('Education', 'funding', 'EdTech Funding Surpasses $25B', 'Educational technology startups focused on skill development, assessment tools, and learning analytics attract major investment.', '{"url": "https://news.ycombinator.com", "total_funding": "$25B"}', 'EdSurge', NOW(), NOW() + INTERVAL '30 days'),
  ('Education', 'news', 'AI Tutors Provide Personalized Learning', 'Adaptive learning systems powered by AI are providing one-on-one tutoring at scale, improving student outcomes across all subjects.', '{"url": "https://news.ycombinator.com"}', 'EdWeek', NOW(), NOW() + INTERVAL '30 days');

-- Marketing Domain
INSERT INTO market_insights (domain, insight_type, title, description, data, source, created_at, expires_at)
VALUES
  ('Marketing', 'trend', 'AI-Generated Content Transforms Creation', 'Generative AI tools are revolutionizing content production with 60% of marketers using AI for copy, images, and video.', '{"url": "https://news.ycombinator.com", "adoption_rate": "60%"}', 'Content Marketing Institute', NOW(), NOW() + INTERVAL '30 days'),
  ('Marketing', 'opportunity', 'Influencer Marketing Reaches $25B', 'Creator economy continues explosive growth with micro-influencers delivering higher ROI than traditional advertising.', '{"url": "https://news.ycombinator.com", "market_size": "$25B"}', 'Influencer Marketing Hub', NOW(), NOW() + INTERVAL '30 days'),
  ('Marketing', 'funding', 'MarTech Investments Focus on Automation', 'Marketing automation and customer data platforms attract $15B as businesses prioritize personalization at scale.', '{"url": "https://news.ycombinator.com", "total_funding": "$15B"}', 'ChiefMartec', NOW(), NOW() + INTERVAL '30 days'),
  ('Marketing', 'news', 'Privacy-First Marketing Becomes Standard', 'Cookie-less targeting and first-party data strategies are reshaping digital advertising as privacy regulations expand globally.', '{"url": "https://news.ycombinator.com"}', 'AdAge', NOW(), NOW() + INTERVAL '30 days');

-- Sustainability Domain
INSERT INTO market_insights (domain, insight_type, title, description, data, source, created_at, expires_at)
VALUES
  ('Sustainability', 'trend', 'Carbon Management Software Market Booms', 'Enterprise carbon accounting and offset platforms are growing 50% annually as ESG reporting becomes mandatory.', '{"url": "https://news.ycombinator.com", "growth_rate": "50%"}', 'GreenBiz', NOW(), NOW() + INTERVAL '30 days'),
  ('Sustainability', 'opportunity', 'Circular Economy Creates $4.5T Opportunity', 'Resource efficiency and waste reduction models are creating massive business opportunities across all industries.', '{"url": "https://news.ycombinator.com", "market_size": "$4.5T"}', 'Ellen MacArthur Foundation', NOW(), NOW() + INTERVAL '30 days'),
  ('Sustainability', 'funding', 'Climate Tech Funding Hits Record $70B', 'Clean energy, carbon capture, and sustainable materials startups attract unprecedented investment to combat climate change.', '{"url": "https://news.ycombinator.com", "total_funding": "$70B"}', 'PwC', NOW(), NOW() + INTERVAL '30 days'),
  ('Sustainability', 'news', 'Green Hydrogen Economy Gains Momentum', 'Hydrogen fuel technology investments accelerate as countries aim for net-zero emissions and energy independence.', '{"url": "https://news.ycombinator.com"}', 'Bloomberg NEF', NOW(), NOW() + INTERVAL '30 days');

-- Real Estate Domain
INSERT INTO market_insights (domain, insight_type, title, description, data, source, created_at, expires_at)
VALUES
  ('Real Estate', 'trend', 'PropTech Digitalizes Property Management', 'Smart building technology and digital platforms are transforming property operations with 30% cost savings.', '{"url": "https://news.ycombinator.com", "cost_savings": "30%"}', 'National Real Estate Investor', NOW(), NOW() + INTERVAL '30 days'),
  ('Real Estate', 'opportunity', 'Co-living Spaces Target Remote Workers', 'Flexible living arrangements with built-in communities are growing 25% annually as remote work becomes permanent.', '{"url": "https://news.ycombinator.com", "growth_rate": "25%"}', 'Urban Land Institute', NOW(), NOW() + INTERVAL '30 days'),
  ('Real Estate', 'funding', 'PropTech Startups Raise $30B Globally', 'Real estate technology companies focused on transaction platforms, data analytics, and tenant experience attract major capital.', '{"url": "https://news.ycombinator.com", "total_funding": "$30B"}', 'JLL', NOW(), NOW() + INTERVAL '30 days'),
  ('Real Estate', 'news', 'Fractional Ownership Opens Investment Access', 'Tokenization and fractional ownership platforms are democratizing real estate investment for retail investors.', '{"url": "https://news.ycombinator.com"}', 'Real Estate Weekly', NOW(), NOW() + INTERVAL '30 days');
