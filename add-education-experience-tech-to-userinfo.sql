-- Migration: Add education/experience/tech columns to userinfo and update helper function
-- Run this in Supabase SQL editor (or psql) against the public schema

ALTER TABLE public.userinfo
  ADD COLUMN IF NOT EXISTS education TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS tech TEXT;

-- Drop any existing versions of the helper so we can recreate it with the new signature
DROP FUNCTION IF EXISTS update_userinfo_profile(
  UUID,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  BOOLEAN
);

DROP FUNCTION IF EXISTS update_userinfo_profile(
  UUID,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  BOOLEAN
);

CREATE OR REPLACE FUNCTION update_userinfo_profile(
  p_user_id UUID,
  p_username TEXT,
  p_photo_url TEXT DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_about TEXT DEFAULT NULL,
  p_education TEXT DEFAULT NULL,
  p_experience TEXT DEFAULT NULL,
  p_github_url TEXT DEFAULT NULL,
  p_linkedin_url TEXT DEFAULT NULL,
  p_twitter_url TEXT DEFAULT NULL,
  p_instagram_url TEXT DEFAULT NULL,
  p_facebook_url TEXT DEFAULT NULL,
  p_address_line1 TEXT DEFAULT NULL,
  p_address_line2 TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_postal_code TEXT DEFAULT NULL,
  p_tech TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT true
)
RETURNS userinfo
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result userinfo;
BEGIN
  -- Validate gender if provided
  IF p_gender IS NOT NULL AND p_gender NOT IN ('male', 'female', 'other', 'prefer_not_to_say') THEN
    RAISE EXCEPTION 'Invalid gender value: %', p_gender;
  END IF;

  INSERT INTO userinfo (
    user_id, username, photo_url, gender, email, phone,
    bio, about, education, experience, github_url, linkedin_url, twitter_url,
    instagram_url, facebook_url, address_line1, address_line2,
    city, state, country, postal_code, tech, is_public
  )
  VALUES (
    p_user_id, p_username, p_photo_url, p_gender, p_email, p_phone,
    p_bio, p_about, p_education, p_experience, p_github_url, p_linkedin_url, p_twitter_url,
    p_instagram_url, p_facebook_url, p_address_line1, p_address_line2,
    p_city, p_state, p_country, p_postal_code, p_tech, p_is_public
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    username = EXCLUDED.username,
    photo_url = EXCLUDED.photo_url,
    gender = EXCLUDED.gender,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    bio = EXCLUDED.bio,
    about = EXCLUDED.about,
    education = EXCLUDED.education,
    experience = EXCLUDED.experience,
    github_url = EXCLUDED.github_url,
    linkedin_url = EXCLUDED.linkedin_url,
    twitter_url = EXCLUDED.twitter_url,
    instagram_url = EXCLUDED.instagram_url,
    facebook_url = EXCLUDED.facebook_url,
    address_line1 = EXCLUDED.address_line1,
    address_line2 = EXCLUDED.address_line2,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    postal_code = EXCLUDED.postal_code,
    tech = EXCLUDED.tech,
    is_public = EXCLUDED.is_public,
    updated_at = NOW()
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION update_userinfo_profile TO anon, authenticated;
