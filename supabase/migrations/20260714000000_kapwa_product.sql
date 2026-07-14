-- ============================================================================
-- KAPWA is the product. Replace the 9 separate operator seeds with the
-- KAPWA product: 3 subscription tiers (Essential / Full / Enterprise) + the
-- one-time Mission Control setup. The 8 specialist capabilities are bundled
-- as modules inside KAPWA, not sold separately.
-- ============================================================================

-- Clear old per-operator seeds so the catalog reflects the single product.
DELETE FROM public.operators
WHERE id IN (
  'guest-concierge-ai','booking-assistant-ai','lead-generation-ai',
  'social-media-operator','review-manager-ai','menu-ordering-ai',
  'revenue-followup-ai','kapwa-resort-backoffice'
);

INSERT INTO public.operators
  (id, kind, name, icon, tagline, category, badges, price,
   human_approval_required, agent_readable, featured, top_rated,
   deployment_scope, included_services, active, display_order)
VALUES
('kapwa-essential','operator','KAPWA — Essential','Sparkles',
 'The all-in-one AI back office for resorts: guest service + booking assistance.',
 'hospitality',
 '[{"label":"The main operator","tone":"gold"},{"label":"AI-agent readable","tone":"gold"}]'::jsonb,
 '{"amount":3999,"currency":"PHP","model":"monthly_subscription","suffix":"/ mo"}'::jsonb,
 true,true,true,true,
 '["1 Resort","Multi-channel","English + Tagalog","24/7 Coverage","Human approval workflows"]'::jsonb,
 '["Guest Concierge","Booking Assistant","AI Agent Setup & Training","Knowledge Base Configuration","Channel Integrations (Web, WhatsApp, FB)","Human Approval & Safety Review"]'::jsonb,
 true,0),
('kapwa-full','operator','KAPWA — Full','Sparkles',
 'KAPWA with growth + reputation: lead gen, social, reviews, revenue follow-up.',
 'hospitality',
 '[{"label":"The main operator","tone":"gold"},{"label":"AI-agent readable","tone":"gold"}]'::jsonb,
 '{"amount":7999,"currency":"PHP","model":"monthly_subscription","suffix":"/ mo"}'::jsonb,
 true,true,false,false,
 '["1 Resort","Multi-channel","English + Tagalog","24/7 Coverage","Human approval workflows"]'::jsonb,
 '["Guest Concierge","Booking Assistant","Lead Generation","Social Media","Review Manager","Revenue Follow-up","Performance Dashboard","Human Approval & Safety Review"]'::jsonb,
 true,1),
('kapwa-enterprise','operator','KAPWA — Enterprise','Sparkles',
 'Full plus menu/ordering, multi-property, custom integrations. Custom quote.',
 'hospitality',
 '[{"label":"Custom quote","tone":"gold"},{"label":"All modules","tone":"gold"}]'::jsonb,
 '{"amount":0,"currency":"PHP","model":"custom_quote","suffix":"custom quote"}'::jsonb,
 true,true,false,false,
 '["Multi-property","Custom integrations","English + Tagalog","24/7 Coverage"]'::jsonb,
 '["All Full modules","Menu & Ordering","Mission Control dashboards","Multi-property support","Custom system integrations","Dedicated onboarding"]'::jsonb,
 true,2),
('mission-control-setup','setup','Mission Control Setup','Gauge',
 'Onboard your property, connect systems, and activate real-time performance visibility.',
 'mission-control',
 '[{"label":"One-time setup","tone":"gold"},{"label":"Human approval required","tone":"crimson"}]'::jsonb,
 '{"amount":19999,"currency":"PHP","model":"one_time_setup","suffix":"one-time"}'::jsonb,
 true,true,true,false,
 '["1 Property","Systems onboarding","Dashboards & alerts"]'::jsonb,
 '["Property Onboarding","Systems & Data Connection","Dashboard Configuration","Team Training"]'::jsonb,
 true,3);
