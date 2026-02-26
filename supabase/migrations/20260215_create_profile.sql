-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('admin', 'manager', 'user')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Policy: Public profiles are viewable by everyone (or restricted to authenticated users if preferred)
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

-- Policy: Users can insert their own profile
create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Policy: Admins can do everything (This implementation depends on how you check for admins in RLS,
-- but often admins use the Service Role key which bypasses RLS.
-- For client-side admin checks, you'd need a policy like:
-- using (auth.uid() in (select id from profiles where role = 'admin'))
--)

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert a profile for the first user if they already exist (optional, for manual run)
-- insert into public.profiles (id, email, role)
-- select id, email, 'admin' from auth.users limit 1;
