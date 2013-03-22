/**
 * Silly database installation script
 * 
 * Run me with psql:
 * 	psql -U yourname postgres
 *  \i 001.schema.sql
 * 
 * @author Mason Houtz <mason@clevertech.biz>
 */



---------------------------------------------------------------------
-- DBO and login role definition
-- Drop and recreate database and database owner account
-- Probably we should create separate dbo and access accounts
-- It's important to explicitly

\connect postgres
\set ON_ERROR_STOP on
\set QUIET on

drop database if exists ctstub;

drop role if exists ctstub_dbo;
drop role if exists ctstub_web;

create role ctstub_dbo
	superuser createdb createrole noreplication;

create role ctstub_web login 
	password 'ctstub_web' 
	superuser inherit noreplication;

comment on role ctstub_web is 'web app login account';

create database ctstub 
	with owner = ctstub_web 
	encoding = 'UTF8';


-- Connect as the database owner we just created

\connect ctstub ctstub_web;
\set ON_ERROR_STOP on
\set QUIET on

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages to error;




---------------------------------------------------------------------
-- ABSTRACT SCHEMA, base objects
-- Postgres is an amazing database platform. You can have tables
-- inherit from other tables, so I usually store "base class" types
-- of objects in a schema called "abstract"

drop schema if exists abstract cascade;
create schema abstract authorization ctstub_dbo;
comment on schema abstract is 'Abstract types and base objects';
grant usage on schema abstract to public;


-- inherited table tracks changes in created/modified dates or
-- whatever else you want in all your tables

create table abstract.base (
	created timestamp without time zone not null default current_timestamp,
	modified timestamp without time zone
);


-- Even if I assign this trigger to the abstract.base table, it won't
-- propogate to child tables later. We'll still have to create and assign
-- the trigger to the main tables manually. I still like to store the trigger
-- function here next to the fields it operates on.

create or replace function abstract.update_modified_column() 
returns trigger as $$
	begin
		new.modified := now();
		return new;
	end;
$$ language plpgsql;




---------------------------------------------------------------------
-- PUBLIC SCHEMAS
-- Set default owner to explicit dbo account

alter schema public owner to ctstub_dbo;


---------------------------------------------------------------------
-- CONTRIB SCHEMA
-- This is not mandatory, but it's traditional to put all 3rd
-- party extensions in a contrib schema. Notably pgcrypto for
-- password hashing

drop schema if exists contrib cascade;
create schema contrib authorization ctstub_dbo;
grant all on schema contrib to public;


-- Install pgcrypto for password encryption

create extension pgcrypto schema contrib;



---------------------------------------------------------------------
-- AUTH SCHEMA
-- There are advantages to keeping auth tables
-- in a separate schema so permissions can be applied in
-- different ways from the rest of the tables. It's just
-- the way I like to do it. You can just jam everything in
-- public if you prefer.

drop schema if exists auth cascade;
create schema auth authorization ctstub_dbo;
grant all on schema auth to public;


-- Functions to manage passwords, used in user-table triggers

create or replace function auth.generate_credentials() 
returns trigger as $$
	begin
		new.salt := contrib.gen_salt('bf');
		new.password := contrib.crypt(new.id || new.password, new.salt);
		return new;
	end;
$$ language plpgsql;


create or replace function auth.update_credentials()
returns trigger as $$
	begin
		new.salt := old.salt;
		new.password := contrib.crypt(new.id || new.password, old.salt);
		return new;
	end;
$$ language plpgsql;



---------------------------------------------------------------------
-- Searchpath for the two roles

ALTER ROLE ctstub_web SET search_path TO public,auth,contrib,abstract;
ALTER ROLE ctstub_dbo SET search_path TO public,auth,contrib,abstract;
