import BaseService from "./base_service.js"


export default class UserService extends BaseService {

    constructor(repository) {
        super(repository)
    }

    async addUser(user) {
        return this.repository.addUser(user)
    }

    async follow(user_id, followee_id) {
        return this.repository.addFollow(user_id, followee_id)
    }

    async unfollow(user_id, followee_id) {
        return this.repository.delFollow(user_id, followee_id)
    }

    async isUserFollowedBy(user_id, follower_id) {
        return this.repository.hasFollow(follower_id, user_id)
    }

    async getUser(user_id) {
        return this.repository.getUser(user_id)
    }

    async getFollowerUsers(user_id, limit = 10, offset = 0) {
        return this.repository.getUsersByFollowee(user_id, limit, offset)
    }

    async getFollowingUsers(user_id, limit = 10, offset = 0) {
        return this.repository.getUsersByFollower(user_id, limit, offset)
    }
}
