# Supabase setup guide (ai-teacher)

Follow these steps to connect your app to Supabase.

---

## 1. Get your project keys

1. Open [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Go to **Project Settings** (gear) → **API**.
3. Copy:
   - **Project URL**
   - **anon public** key (safe to use in the browser)

You’ll use these in the frontend. For backend-only operations (e.g. admin or RAG) you can later use the **service_role** key — never expose it in the frontend.

---

## 2. Environment variables

**Frontend**

In `frontend/` copy the example env file and fill in your values:

```bash
cp frontend/.env.example frontend/.env
```

Then edit `frontend/.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace with your actual URL and anon key. Vite only exposes variables prefixed with `VITE_` to the client.

**Optional – Backend**

If your backend will call Supabase (e.g. with the service role for RAG):

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## 3. Run the database migration

1. In the Supabase Dashboard go to **SQL Editor**.
2. Open `supabase/migrations/00001_initial_schema.sql` in this repo.
3. Copy its contents into the SQL Editor and run it.

This creates:

- **profiles** – extends Supabase Auth with `role`, `first_name`, and `last_name` (one row per user).
- **subjects** – teacher-owned subjects.
- **classes** – linked to a subject and teacher.
- **enrollments** – which students are in which class.
- **chat_messages** – messages per user/class for future RAG.

It also enables Row Level Security (RLS) and adds policies so users only see their own or relevant data.

---

## 4. Enable Auth (optional but recommended)

1. In the Dashboard go to **Authentication** → **Providers**.
2. **Email** is usually enabled by default. Configure “Confirm email” if you want.
3. (Optional) Add **Google** or other providers under Providers.

Your app will use Supabase Auth for login/signup; the `profiles` table stores app-specific fields (`role`, `first_name`, `last_name`) and is kept in sync via a trigger when a user signs up.

---

## 5. Install the Supabase client (frontend)

From the repo root:

```bash
pnpm --filter frontend add @supabase/supabase-js
```

The frontend already has a Supabase client helper at `frontend/src/lib/supabase.ts` that reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Use it anywhere you need to call Supabase (auth or data).

---

## 6. Next steps in code

- **Auth**: Use `supabase.auth.signInWithPassword()`, `signUp()`, `signOut()`, and `onAuthStateChange()` to replace the placeholder login/signup and to show the real user in the header/dashboard.
- **Data**: Use `supabase.from('profiles').select()`, `.from('classes').select()`, etc., or React Query with the client for caching and loading states.
- **RLS**: Policies in the migration allow:
  - Users to read/update their own profile.
  - Teachers to manage their subjects and classes; students to read classes they’re enrolled in.
  - Chat messages readable by the owning user (and later you can add class-scoped rules for RAG).

If you want, we can wire Auth into the existing Login/Signup pages and load the current user into the layout next.

---

## 7. Teacher accounts and Admin (Edge Function)

- **Dashboard** is only available to users with role **teacher**. Students are redirected to Account if they try to open `/dashboard`.
- **Teachers** are created via the **Admin** page (`/admin`), which is only visible and accessible to existing teachers. Normal signup (`/signup`) always creates **student** accounts.

**Deploy the create-teacher Edge Function**

From the project root, with the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and linked to your project:

```bash
supabase functions deploy create-teacher
```

The function checks that the caller is a teacher (via JWT), then creates a new auth user and sets their profile role to `teacher`. The frontend calls it from the Admin page when a teacher submits the “Register new teacher” form.

**Creating the first teacher**

Because only teachers can access `/admin`, the first teacher must be created outside the app:

1. Sign up a user via the normal **Sign up** page (they get role `student`).
2. In Supabase Dashboard → **SQL Editor**, run:

```sql
UPDATE public.profiles
SET role = 'teacher'
WHERE id = 'THE_USER_UUID_HERE';
```

(Replace `THE_USER_UUID_HERE` with the user’s id from **Authentication** → **Users** in the dashboard.)

3. That user can then log in, open **Admin**, and register more teachers.
