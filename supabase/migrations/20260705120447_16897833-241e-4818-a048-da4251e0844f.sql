
CREATE TABLE public.operators (
  id text PRIMARY KEY,
  kind text NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  tagline text NOT NULL,
  category text NOT NULL,
  badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  price jsonb NOT NULL,
  human_approval_required boolean NOT NULL DEFAULT true,
  agent_readable boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  top_rated boolean NOT NULL DEFAULT false,
  deployment_scope jsonb NOT NULL DEFAULT '[]'::jsonb,
  included_services jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.operators TO anon;
GRANT SELECT ON public.operators TO authenticated;
GRANT ALL ON public.operators TO service_role;

ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "operators: public read active"
  ON public.operators FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE TRIGGER set_operators_updated_at
  BEFORE UPDATE ON public.operators
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.operators (id, kind, name, icon, tagline, category, badges, price, human_approval_required, agent_readable, featured, top_rated, deployment_scope, included_services, active, display_order) VALUES
('kapwa-resort-backoffice','operator','KAPWA','Sparkles','An all-around AI back office for resorts — guest service, bookings, follow-up, reviews, marketing, reporting, and daily operations in one coordinated system.','hospitality',
 '[{"label":"All-around resort back office","tone":"gold"},{"label":"Featured","tone":"gold"}]'::jsonb,
 '{"amount":0,"currency":"PHP","model":"custom_quote","suffix":"custom quote"}'::jsonb,
 true,true,true,true,
 '["1 Resort","Multi-channel","Management dashboard","Human approval workflows"]'::jsonb,
 '["Guest inquiries and concierge support","Booking and availability assistance","Lead and booking follow-up","Review monitoring and reply drafting","Social media planning and content support","Operations reminders and task coordination","Management summaries and performance reporting","Human approval for sensitive actions"]'::jsonb,
 true,0),
('guest-concierge-ai','operator','Guest Concierge AI','BellRing','Delight guests 24/7 with instant answers, recommendations, and seamless service.','hospitality',
 '[{"label":"Best for Resorts","tone":"gold"},{"label":"AI-agent readable","tone":"gold"}]'::jsonb,
 '{"amount":3999,"currency":"PHP","model":"monthly_subscription","suffix":"/ mo"}'::jsonb,
 true,true,true,true,
 '["1 Property","Multi-channel","English + Tagalog","24/7 Coverage"]'::jsonb,
 '["AI Agent Setup & Training","Knowledge Base Configuration","Channel Integrations (Web, WhatsApp, FB)","Performance Dashboard","Mission Control Tracking","Human Approval & Safety Review"]'::jsonb,
 true,1),
('booking-assistant-ai','operator','Booking Assistant AI','CalendarCheck','Handle inquiries, check availability, and confirm bookings — accurately.','booking',
 '[{"label":"Best for Resorts","tone":"gold"},{"label":"Human approval required","tone":"crimson"}]'::jsonb,
 '{"amount":4499,"currency":"PHP","model":"monthly_subscription","suffix":"/ mo"}'::jsonb,
 true,true,true,false,
 '["1 Property","Calendar sync","Multi-channel"]'::jsonb,
 '["AI Agent Setup & Training","Availability & Calendar Integration","Booking Confirmation Workflow","Human Approval & Safety Review"]'::jsonb,
 true,2),
('lead-generation-ai','operator','Lead Generation AI','Target','Find, qualify, and nurture high-value leads across channels that convert.','lead-gen',
 '[{"label":"Best for Growth","tone":"gold"},{"label":"AI-agent readable","tone":"gold"}]'::jsonb,
 '{"amount":5499,"currency":"PHP","model":"monthly_subscription","suffix":"/ mo"}'::jsonb,
 true,true,true,false,
 '["Multi-channel","CRM sync","Lead scoring"]'::jsonb,
 '["Lead Capture & Scoring","Channel Integrations","Nurture Sequences","Human Approval & Safety Review"]'::jsonb,
 true,3),
('social-media-operator','operator','Social Media Operator','Share2','Plan, create, and publish content that grows engagement and brand presence.','marketing',
 '[{"label":"Best for Marketing","tone":"gold"},{"label":"AI-agent readable","tone":"crimson"}]'::jsonb,
 '{"amount":4299,"currency":"PHP","model":"monthly_subscription","suffix":"/ mo"}'::jsonb,
 true,true,false,false,
 '["Multi-platform","Content calendar","Human posting approval"]'::jsonb,
 '["Content Strategy & Calendar","Draft Generation","Human Approval Before Posting","Performance Reporting"]'::jsonb,
 true,4),
('review-manager-ai','operator','Review Manager AI','Star','Monitor reviews, draft replies, and protect your reputation across platforms.','operations',
 '[{"label":"Best for Reputation","tone":"gold"},{"label":"AI-agent readable","tone":"gold"}]'::jsonb,
 '{"amount":2999,"currency":"PHP","model":"monthly_subscription","suffix":"/ mo"}'::jsonb,
 true,true,false,false,
 '["Multi-platform","Sentiment alerts","Reply drafting"]'::jsonb,
 '["Review Monitoring","Reply Drafting","Sentiment Alerts","Human Approval & Safety Review"]'::jsonb,
 true,5),
('menu-ordering-ai','operator','Menu & Ordering AI','UtensilsCrossed','Smart menu recommendations, upsells, and order automation across channels.','hospitality',
 '[{"label":"Best for F&B","tone":"gold"},{"label":"Human approval required","tone":"crimson"}]'::jsonb,
 '{"amount":4799,"currency":"PHP","model":"monthly_subscription","suffix":"/ mo"}'::jsonb,
 true,true,false,false,
 '["1 Venue","POS sync","Multi-channel ordering"]'::jsonb,
 '["Menu Digitisation","Upsell Logic","Order Routing","Human Approval & Safety Review"]'::jsonb,
 true,6),
('mission-control-setup','setup','Mission Control Setup','Gauge','Onboard your property, connect systems, and activate real-time performance visibility.','mission-control',
 '[{"label":"One-time setup","tone":"gold"},{"label":"Human approval required","tone":"crimson"}]'::jsonb,
 '{"amount":19999,"currency":"PHP","model":"one_time_setup","suffix":"one-time"}'::jsonb,
 true,true,true,false,
 '["1 Property","Systems onboarding","Dashboards & alerts"]'::jsonb,
 '["Property Onboarding","Systems & Data Connection","Dashboard Configuration","Team Training"]'::jsonb,
 true,7),
('revenue-followup-ai','operator','Revenue Follow-up AI','Receipt','Recover lost bookings and drive repeat stays with intelligent, timely follow-ups.','operations',
 '[{"label":"Best for Revenue","tone":"gold"},{"label":"AI-agent readable","tone":"gold"}]'::jsonb,
 '{"amount":4999,"currency":"PHP","model":"monthly_subscription","suffix":"/ mo"}'::jsonb,
 true,true,false,false,
 '["Multi-channel","CRM sync","Automated sequences"]'::jsonb,
 '["Abandoned Booking Recovery","Repeat-Stay Campaigns","Timing Optimisation","Human Approval & Safety Review"]'::jsonb,
 true,8);
