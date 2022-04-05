import PostRepository from "../repository/post_repository.js"
import CacheRepository from "./cache_repository.js"


// ============================================================================
// TTLs (in seconds)
// ============================================================================

const POSTS_BY_ID_TTL = 60

const POSTS_BY_FOLLOWER_TTL = 300

const POSTS_BY_USER_TTL = 300

const POSTS_BY_USER_AND_DATE_TTL = 300

const POSTS_BY_SEARCH_TTL = 60


// ============================================================================
// Keys
// ============================================================================

const getPostsByIdKey = (post_id) => `posts.id.${post_id}`

const getPostsByFollowerKey = (follower_id) => `posts.follower.${follower_id}`

const getPostsByUserKey = (user_id) => `posts.user.${user_id}`

const getPostsByUserAndDateKey = (user_id, date) => `posts.user.${user_id}.${date.getYear()}${date.getMonth().toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`

const getPostsBySearchKey = (content) => `posts.search.${content}`


// ============================================================================
// Repository
// ============================================================================

export default class CachePostRepository extends CacheRepository(PostRepository) {

    constructor(cache, repository) {
        super(cache, repository)
    }

    async addPost(post) {
        // Delegate to the persistent repository
        return this.repository.addPost(post)
    }

    async getPost(post_id) {
        return this.tryCache(
            getPostsByIdKey(post_id),
            POSTS_BY_ID_TTL,
            'getPost',
            post_id,
        )
    }

    async getPosts(limit = 10, offset = 0) {
        // Bypass cache since it doesn't worth caching
        return this.repository.getPosts(limit, offset)
    }

    async getPostsByFollower(follower_id, limit = 10, offset = 0) {
        return this.tryCacheLimitOffset(
            limit,
            offset,
            getPostsByFollowerKey(follower_id),
            POSTS_BY_FOLLOWER_TTL,
            'getPostsByFollower',
            follower_id
        )
    }

    async getPostsByUser(user_id, limit = 10, offset = 0) {
        return this.tryCacheLimitOffset(
            limit,
            offset,
            getPostsByUserKey(user_id),
            POSTS_BY_USER_TTL,
            'getPostsByUser',
            user_id
        )
    }

    async getPostsByUserAndDate(user_id, date) {
        return this.tryCache(
            getPostsByUserAndDateKey(user_id, new Date(date)),
            POSTS_BY_USER_AND_DATE_TTL,
            'getPostsByUserAndDate',
            user_id,
            date,
        )
    }

    async searchPostsByContent(content, limit = 10, offset = 0) {
        return this.tryCacheLimitOffset(
            limit,
            offset,
            getPostsBySearchKey(content),
            POSTS_BY_SEARCH_TTL,
            'searchPostsByContent',
            content
        )
    }
}
