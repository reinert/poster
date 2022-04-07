CREATE TABLE users
(
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username varchar(14) NOT NULL,
  join_date timestamptz NOT NULL DEFAULT now(),

  -- Computed columns that will be updated according to new follows/unfollows
  nr_followers int NOT NULL DEFAULT 0,
  nr_following int NOT NULL DEFAULT 0,
  nr_posts int NOT NULL DEFAULT 0,

  -- Check username is alphanumeric
  CONSTRAINT users_username_ck CHECK (username ~ '^[[:alnum:]]+$'),

  -- Check username is unique
  CONSTRAINT users_username_uq UNIQUE (username)
);
