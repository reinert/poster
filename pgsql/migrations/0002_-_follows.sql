CREATE TABLE follows
(
  follower_id bigint,
  followee_id bigint,
  datetime timestamptz NOT NULL DEFAULT now(),

  -- Check that users cannot follow themselves
  CONSTRAINT follows_follower_followee_ck CHECK (follower_id <> followee_id),

  CONSTRAINT follows_pk PRIMARY KEY (follower_id, followee_id),

  CONSTRAINT follows_users_follower_fk FOREIGN KEY (follower_id)
        REFERENCES users (id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION,

  CONSTRAINT follows_users_followee_fk FOREIGN KEY (followee_id)
        REFERENCES users (id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Index to query followees by follower
CREATE INDEX follows_follower_datetime_idx ON follows (follower_id, datetime);

-- Index to query followers by followee
CREATE INDEX follows_followee_datetime_idx ON follows (followee_id, datetime);

-- Trigger to increment nr_followers and nr_following on users when a new follow happens
CREATE OR REPLACE FUNCTION inc_follows()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS
$$
BEGIN
	UPDATE users SET nr_followers = nr_followers + 1 WHERE id = NEW.followee_id;
	UPDATE users SET nr_following = nr_following + 1 WHERE id = NEW.follower_id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER inc_follows_trigger
    AFTER INSERT
    ON follows
    FOR EACH ROW
    EXECUTE PROCEDURE inc_follows();

-- Trigger to decrement nr_followers and nr_following on users when an unfollow happens
CREATE OR REPLACE FUNCTION dec_follows()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS
$$
BEGIN
    UPDATE users SET nr_followers = nr_followers - 1 WHERE id = OLD.followee_id;
    UPDATE users SET nr_following = nr_following - 1 WHERE id = OLD.follower_id;

    RETURN OLD;
END;
$$;

CREATE TRIGGER dec_follows_trigger
    AFTER DELETE
    ON follows
    FOR EACH ROW
    EXECUTE PROCEDURE dec_follows();