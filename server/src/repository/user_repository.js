export default class UserRepository {

    async addUser(user) {
        throw new Error('Not implemented yet.')
    }

    async addFollow(follower_id, followee_id) {
        throw new Error('Not implemented yet.')
    }

    async delFollow(follower_id, followee_id) {
        throw new Error('Not implemented yet.')
    }

    async hasFollow(follower_id, followee_id) {
        throw new Error('Not implemented yet.')
    }

    async getUser(user_id) {
        throw new Error('Not implemented yet.')
    }

    async getUsersByFollowee(follower_id, limit = 10, offset = 0) {
        throw new Error('Not implemented yet.')
    }

    async getUsersByFollower(follower_id, limit = 10, offset = 0) {
        throw new Error('Not implemented yet.')
    }
}
