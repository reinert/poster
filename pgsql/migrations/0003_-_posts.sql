CREATE TYPE post_kind AS ENUM ('original', 'repost', 'quote');

CREATE TABLE posts
(
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind post_kind NOT NULL,
  content varchar(77),

  -- The datetime column is not default now() because the correct value is given when the user inputs the post
  datetime timestamptz NOT NULL,

  -- Owner of the post
  user_id bigint NOT NULL,

  -- Reference to the post that was replied (optional)
  parent_post_id bigint,

  -- Check that reposts have no content and original/quote posts have content
  CONSTRAINT posts_content_ck CHECK ((kind = 'repost' and content is null) or (kind <> 'repost' and content is not null)),

  -- Check that original posts have no parent and quotes/reposts have parent
  CONSTRAINT posts_parent_ck CHECK ((kind = 'original' and parent_post_id is null) or (kind <> 'original' and parent_post_id is not null)),

  CONSTRAINT posts_users_user_fk FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,

  CONSTRAINT posts_posts_parent_fk FOREIGN KEY (parent_post_id)
      REFERENCES posts (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Index to retrieve the posts in chronological order
CREATE INDEX posts_datetime_idx ON posts (datetime);

-- Index to retrieve the posts in chronological order by user
CREATE INDEX posts_user_datetime_idx ON posts (user_id, datetime);

-- Index to retrieve the posts in response to another post in chronological order
CREATE INDEX posts_parent_datetime_idx ON posts (parent_post_id, datetime);
