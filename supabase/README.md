# Supabase setup

Run these SQL files **in order** in the Supabase SQL editor
(**Dashboard → SQL Editor → New query**).

| File | What it does |
|------|--------------|
| `migrations/01_tables.sql` | Creates all five tables |
| `migrations/02_helpers.sql` | Creates `is_super_admin()` and `is_station_staff()` helper functions |
| `migrations/03_trigger.sql` | Creates and attaches the `stations_before_write` trigger |
| `migrations/04_rls.sql` | Enables RLS on every table, creates all policies, creates `stations_public` view |
| `migrations/05_seed.sql` | Seeds the six fuel brands; contains the super-admin bootstrap snippet |

## After running the SQL

1. **Get the super-admin UUID:**
   - Go to **Supabase Dashboard → Authentication → Users**
   - Click **"Add user" → "Create new user"**
   - Enter the admin's email and a strong password, click **Create user**
   - The user appears in the list — click on their row
   - Copy the **UUID** shown at the top (looks like `a1b2c3d4-...`)
   - Open `migrations/05_seed.sql`, uncomment the INSERT line, paste the UUID, and run it

   This is the only way to create a super-admin. No code path can do it.

2. Fill in `.env.local` with your project's URL, anon key, and service-role key.

3. In the Supabase Dashboard:
   - **Auth → Providers → Email** → disable "Allow new users to sign up"
   - Set **Site URL** and allowed **Redirect URLs**
   - Enable email confirmation, leaked-password protection, min password length ≥ 10

## These files are for manual execution only

The application never runs migrations automatically. Do not give the
`SUPABASE_SERVICE_ROLE_KEY` permission to run DDL in production.
