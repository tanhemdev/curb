-- Students only: reject sign-ups whose email isn't a .edu address, on the
-- server, before the account exists. Turn it on in the Supabase dashboard:
-- Authentication -> Hooks -> "Before User Created" -> public.hook_require_edu_email

create or replace function public.hook_require_edu_email(event jsonb)
returns jsonb
language plpgsql
as $$
declare
  email text := lower(coalesce(event -> 'user' ->> 'email', ''));
begin
  if email ~ '^[^@\s]+@([a-z0-9-]+\.)+edu$' then
    return '{}'::jsonb; -- allow
  end if;
  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Curb is for students: sign in with your .edu email.'
    )
  );
end;
$$;

grant execute on function public.hook_require_edu_email(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_require_edu_email(jsonb) from authenticated, anon, public;
