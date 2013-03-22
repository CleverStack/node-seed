\set ON_ERROR_STOP on
\set QUIET on

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages to error;


-- Testing Seed Data

do language plpgsql
$$
	begin

		-- Test victims
		perform auth.save_user(null, 'mason@clevertech.biz', 'mason', 'Mason', 'Houtz');

	end;
$$;
