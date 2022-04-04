import errors from "../errors.js"
import BaseService from "./base_service.js"


const { ValidationError } = errors


export default class PostService extends BaseService {

    constructor(repository) {
        super(repository)
    }

    async addPost(post) {
        const datePosts = await this.repository.getPostsByUserAndDate(post.user_id, post.datetime)

        if (datePosts.length > 5)
            throw new ValidationError('The user has already posted 5 times this day.')

        if (post.parent_post_id) {
            const parentPost = await this.repository.getPost(post.parent_post_id)
            if (parentPost.length && parentPost[0].user_id === `${post.user_id}`)
                throw new ValidationError('Cannot reference to an own post.')
        }

        return this.repository.addPost(post)
    }

    async getPost(post_id) {
        return this.repository.getPost(post_id)
    }

    async getPosts(limit = 10, offset = 0) {
        return this.repository.getPosts(limit, offset)
    }

    async getFollowingPosts(user_id, limit = 10, offset = 0) {
        return this.repository.getPostsByFollower(user_id, limit, offset)
    }

    async getUserPosts(user_id, limit = 10, offset = 0) {
        return this.repository.getPostsByUser(user_id, limit, offset)
    }

    async getUserPostsByDate(user_id, date) {
        return this.repository.getPostsByUserAndDate(user_id, date)
    }

    async searchPostsByContent(content) {
        return this.repository.searchPostsByContent(content)
    }
}
