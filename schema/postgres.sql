create or replace function public.generate_credentials() 
returns trigger as $$
	begin
		new.salt := contrib.gen_salt('bf');
		new.password := contrib.crypt(new.global_id || new.password, new.salt);
		return new;
	end;
$$ language plpgsql;

create or replace function public.update_credentials()
returns trigger as $$
	begin
		new.salt := old.salt;
		new.password := contrib.crypt(new.global_id || new.password, old.salt);
		return new;
	end;
$$ language plpgsql;