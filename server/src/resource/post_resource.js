import base from "./base_resource.js"

export default (service) => [
    {
        method: 'POST',
        url: '/posts',
        handler: async (req) => {
            return service.addPost(req.body)
        }
    },
    {
        method: 'GET',
        url: '/posts',
        handler: async (req) => {
            if (req.query.q)
                return service.searchPostsByContent(req.query.q, req.query.limit, req.query.offset)

            if (req.query.user_id)
                return service.getUserPosts(req.query.user_id, req.query.limit, req.query.offset)

            if (req.query.follower_id)
                return service.getFollowingPosts(req.query.follower_id, req.query.limit, req.query.offset)

            return service.getPosts(req.query.limit, req.query.offset)
        }
    },
    {
        method: 'GET',
        url: '/posts/:post_id',
        handler: async (req) => {
            return base.notFoundIfEmpty(await service.getPost(req.params.post_id))
        }
    }
]
