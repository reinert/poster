export default class PostRepository {

    async addPost(post) {
        throw new Error('Not implemented yet.')
    }

    async getPost(post_id) {
        throw new Error('Not implemented yet.')
    }

    async getPosts(limit = 10, offset = 0) {
        throw new Error('Not implemented yet.')
    }

    async getPostsByFollower(follower_id, limit = 10, offset = 0) {
        throw new Error('Not implemented yet.')
    }

    async getPostsByUser(user_id, limit = 10, offset = 0) {
        throw new Error('Not implemented yet.')
    }

    async getPostsByUserAndDate(user_id, date) {
        throw new Error('Not implemented yet.')
    }

    async searchPostsByContent(content, limit = 10, offset = 0) {
        throw new Error('Not implemented yet.')
    }
}
