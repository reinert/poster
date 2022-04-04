import UserRepository from "../repository/user_repository.js"
import PgRepository from "./pg_repository.js"


// ============================================================================
// QUERIES
// ============================================================================

const ADD_USER =
    `INSERT INTO users (username) VALUES ($1) RETURNING id, username, join_date, nr_followers, nr_following, nr_posts`

const ADD_FOLLOW =
    `INSERT INTO follows (follower_id, followee_id) VALUES ($1, $2) RETURNING follower_id, followee_id, nr_posts`

const DEL_FOLLOW =
    `DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2 RETURNING follower_id, followee_id, nr_posts`

const GET_USER =
    `SELECT * from users WHERE id = $1`

const HAS_FOLLOW =
    `SELECT exists(SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2)`

const GET_USERS_BY_FOLLOWEE =
    `SELECT u.id, u.username, u.join_date, u.nr_followers, u.nr_following, u.nr_posts FROM follows f 
 JOIN users u ON u.id = f.follower_id
 WHERE followee_id = $1
 ORDER BY datetime DESC
 LIMIT $2 OFFSET $3`

const GET_USERS_BY_FOLLOWER =
    `SELECT u.id, u.username, u.join_date, u.nr_followers, u.nr_following, u.nr_posts FROM follows f 
 JOIN users u ON u.id = f.followee_id
 WHERE follower_id = $1
 ORDER BY datetime DESC
 LIMIT $2 OFFSET $3`


// ============================================================================
// REPOSITORY
// ============================================================================

export default class PgUserRepository extends PgRepository(UserRepository) {

    constructor(pool) {
        super(pool)
    }

    async addUser({ username }) {
        return this.query({
            name: 'ADD_USER',
            text: ADD_USER,
            values: [username]
        })
    }

    async addFollow(follower_id, followee_id) {
        return this.query({
            name: 'ADD_FOLLOW',
            text: ADD_FOLLOW,
            values: [follower_id, followee_id]
        })
    }

    async delFollow(follower_id, followee_id) {
        return this.query({
            name: 'DEL_FOLLOW',
            text: DEL_FOLLOW,
            values: [follower_id, followee_id]
        })
    }

    async hasFollow(follower_id, followee_id) {
        return this.query({
            name: 'HAS_FOLLOW',
            text: HAS_FOLLOW,
            values: [follower_id, followee_id]
        })
    }

    async getUser(user_id) {
        return this.query({
            name: 'GET_USER',
            text: GET_USER,
            values: [user_id]
        })
    }

    async getUsersByFollowee(followee_id, limit = 10, offset = 0) {
        return this.query({
            name: 'GET_USERS_BY_FOLLOWEE',
            text: GET_USERS_BY_FOLLOWEE,
            values: [followee_id, limit, offset]
        })
    }

    async getUsersByFollower(follower_id, limit = 10, offset = 0) {
        return this.query({
            name: 'GET_USERS_BY_FOLLOWER',
            text: GET_USERS_BY_FOLLOWER,
            values: [follower_id, limit, offset]
        })
    }
}
