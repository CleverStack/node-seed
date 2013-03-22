\set ON_ERROR_STOP on
\set QUIET on

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages to error;


-- AUTH SCHEMA


-- basic user table

create table auth.user (
	id serial not null,
	email text not null,
	password text not null,
	salt text not null,
	firstname text,
	lastname text,
	primary key (id) ,
	unique (email)
) inherits (abstract.base);


-- modified field manages itself

create trigger tgr_user_update_modified 
	before update 
	on auth.user
	for each row 
	execute procedure abstract.update_modified_column();

-- when user is inserted, generate a new salt

create trigger tgr_user_generate_credentials
	before insert
	on auth.user
	for each row
	execute procedure auth.generate_credentials();

-- when user is updated, use old salt and transform password
-- makes sure salt cannot be changed after user creation

create trigger tgr_user_update_credentials
	before update
	on auth.user
	for each row
	execute procedure auth.update_credentials();



-- ACL roles table

create table auth.role (
	id serial not null,
	name text not null,
	description text,
	primary key (id) ,
	constraint uq_role_name unique (name)
) inherits (abstract.base);

create trigger tgr_coa_update_changes
	before update on auth.role
	for each row
	execute procedure abstract.update_modified_column();


-- ACL permissions table

create table auth.permission (
	id serial not null,
	name text not null,
	description text,
	primary key (id) ,
	constraint uq_permission_name unique (name)
) inherits (abstract.base);

create trigger tgr_coa_update_changes
	before update on auth.permission
	for each row
	execute procedure abstract.update_modified_column();


-- ACL user-role map

create table auth.user_role (
	role_id int not null,
	user_id int not null,
	primary key (role_id, user_id) 
);

alter table auth.user_role 
	add constraint "fk_user_role_role" 
	foreign key ("role_id") references auth.role ("id");

alter table auth.user_role 
	add constraint "fk_user_role_user" 
	foreign key ("user_id") references auth.user ("id");


-- ACL permission-role map

create table auth.role_permission (
	role_id int not null,
	permission_id int not null,
	primary key (role_id, permission_id) 
);

alter table auth.role_permission 
	add constraint "fk_role_permission_role" 
	foreign key ("role_id") references auth.role ("id");

alter table auth.role_permission 
	add constraint "fk_role_permission_permission" 
	foreign key ("permission_id") references auth.permission ("id");




---------------------------------------------------------------------------
-- CRUD Procs

-- Some guys don't like procs. Those guys work on simple projects. Procs can 
-- vastly reduce the amount of code you need to test in your application. Plus
-- it's just the right place to manage storage logic. Your application should
-- not care whether your "Product" is really stored in one table or 10, that's 
-- the responsibility of your data-platform, and it should be possible for a
-- DBA to change that storage  logic at a later time without impacting the
-- application code. If you do your data manipulation exclusively through procs, 
-- then that is possible.

-- Procs also allow for an additional level of database security. If necessary, 
-- we can restrict access to base storage tables and make them only available 
-- through views and procs to certain login accounts.

create or replace function auth.save_user (
	p_id int,
	p_email IN text,
	p_password IN text,
	p_firstname IN text,
	p_lastname IN text
)
returns "auth"."user" as
$$
	
	-- This is just a silly update/insert
	-- example, but still, it's one less set
	-- of actions and service methods that you
	-- have to define and test in your application.

	declare
		newuser "auth"."user"%rowtype;
	
	begin

		-- update
		update "auth"."user" set
			"email" = p_email,
			"password" = p_password,
			"firstname" = p_firstname,
			"lastname" = p_lastname
		where id = p_id
		returning * into newuser;

		if found then
			return newuser;
		end if;

		-- or insert
		insert into "auth"."user" (email, password, firstname, lastname)
		values (p_email, p_password, p_firstname, p_lastname)
		returning * into newuser;

		return newuser;

	end;

$$ language plpgsql volatile;




