ALTER TABLE posts ADD COLUMN content_ts tsvector
    GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

CREATE INDEX content_ts_idx ON posts USING GIN (content_ts);
