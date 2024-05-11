-- Drop the sequence along with all dependent objects
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;

-- Drop the table if it exists
DROP TABLE IF EXISTS public.users;

-- Create the sequence
CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create the table
CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    reset_token character varying(40) COLLATE pg_catalog."default",
    reset_token_expires timestamp without time zone,
    email_verified boolean NOT NULL DEFAULT false,
    verification_token character varying(255) COLLATE pg_catalog."default",
    email_subscribed boolean NOT NULL DEFAULT false,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
);

-- Set the owner and grant permissions
ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

GRANT ALL ON TABLE public.users TO acpoc;
GRANT ALL ON TABLE public.users TO postgres;

-- Drop the table if it exists
DROP TABLE IF EXISTS public.refresh_tokens;

-- Create the table
CREATE TABLE IF NOT EXISTS public.refresh_tokens
(
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    refresh_token TEXT NOT NULL,
    device_info TEXT,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
            REFERENCES public.users (id)
            ON DELETE CASCADE
);

-- Set the owner and grant permissions
ALTER TABLE IF EXISTS public.refresh_tokens
    OWNER TO postgres;

GRANT ALL ON TABLE public.refresh_tokens TO acpoc;
GRANT ALL ON TABLE public.refresh_tokens TO postgres;
