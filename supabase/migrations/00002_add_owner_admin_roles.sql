-- Add owner and admin to app_role enum (extend existing roles)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin';
