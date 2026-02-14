-- Add subscription tier and storage tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_limit_bytes BIGINT NOT NULL DEFAULT 104857600; -- 100 MB default for free tier

-- Add check constraint for valid tiers
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('free', 'plus', 'premium'));

-- Create index for tier lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);