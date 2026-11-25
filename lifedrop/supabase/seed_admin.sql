-- Make an existing account an administrator.
-- 1) Register normally in the app.  2) Replace the email and run this in the SQL editor.
insert into public.admin_roles (user_id)
select id from auth.users where email = 'you@example.com'
on conflict do nothing;
