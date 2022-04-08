import PostRepository from "../repository/post_repository.js"
import pg_repository from "./pg_repository.js"

const { PgRepository, format_query } = pg_repository

// ============================================================================
// QUERIES
// ============================================================================

const ADD_POST =
    `INSERT INTO posts (kind, content, datetime, user_id, parent_post_id)
 VALUES ($1, $2, $3, $4, $5)
 RETURNING id, kind, content, datetime, user_id, parent_post_id`

const GET_POST =
    `SELECT id, kind, content, datetime, user_id, parent_post_id from posts WHERE id = $1`

const GET_POSTS =
    `SELECT id, kind, content, datetime, user_id, parent_post_id FROM posts
 ORDER BY datetime DESC
 LIMIT $1 OFFSET $2`

const GET_POSTS_BY_FOLLOWER =
    `SELECT id, kind, content, datetime, user_id, parent_post_id FROM posts
 WHERE user_id IN (SELECT followee_id FROM follows WHERE follower_id = $1)
 ORDER BY datetime DESC
 LIMIT $2 OFFSET $3`

const GET_POSTS_BY_USER =
    `SELECT id, kind, content, datetime, user_id, parent_post_id
 FROM posts WHERE user_id = $1
 ORDER BY datetime DESC
 LIMIT $2 OFFSET $3`

const GET_POSTS_BY_DATE =
    `SELECT id, kind, content, datetime, user_id, parent_post_id FROM posts
 WHERE user_id = $1 AND datetime::date = $2::date
 ORDER BY datetime DESC`

const SEARCH_POSTS_BY_CONTENT =
    `SELECT id, kind, content, datetime, user_id, parent_post_id FROM posts
 WHERE kind <> 'repost' AND content_ts @@ to_tsquery('english', $1)
 ORDER BY datetime DESC
 LIMIT $2 OFFSET $3`


// ============================================================================
// REPOSITORY
// ============================================================================

const _ = format_query

export default class PgPostRepository extends PgRepository(PostRepository) {

    constructor(pool) {
        super(pool)
    }

    async addPost({ kind, content, datetime, user_id, parent_post_id }) {
        return this.query(_({
            ADD_POST,
            kind,
            content,
            datetime,
            user_id,
            parent_post_id
        }))
    }

    async getPost(post_id) {
        return this.query(_({
            GET_POST,
            post_id
        }))
    }

    async getPosts(limit = 10, offset = 0) {
        return this.query(_({
            GET_POSTS,
            limit,
            offset
        }))
    }

    async getPostsByFollower(follower_id, limit = 10, offset = 0) {
        return this.query(_({
            GET_POSTS_BY_FOLLOWER,
            follower_id,
            limit,
            offset
        }))
    }

    async getPostsByUser(user_id, limit = 10, offset = 0) {
        return this.query(_({
            GET_POSTS_BY_USER,
            user_id,
            limit,
            offset
        }))
    }

    async getPostsByUserAndDate(user_id, date) {
        return this.query(_({
            GET_POSTS_BY_DATE,
            user_id,
            date
        }))
    }

    async searchPostsByContent(content, limit = 10, offset = 0) {
        return this.query(_({
            SEARCH_POSTS_BY_CONTENT,
            content,
            limit,
            offset
        }))
    }
}
