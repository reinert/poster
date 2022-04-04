import base from "./base_resource.js";

export default (service) => [
    {
        method: 'GET',
        url: '/users/:user_id/following',
        handler: async (req) => {
            return service.getFollowingUsers(req.params.user_id, req.query.limit, req.query.offset)
        }
    },
    {
        method: 'POST',
        url: '/users/:user_id/following/:followee_id',
        handler: async (req) => {
            return base.notFoundIfEmpty(await service.follow(req.params.user_id, req.params.followee_id))
        }
    },
    {
        method: 'DELETE',
        url: '/users/:user_id/following/:followee_id',
        handler: async (req) => {
            return base.notFoundIfEmpty(await service.unfollow(req.params.user_id, req.params.followee_id))
        }
    },
    {
        method: 'GET',
        url: '/users/:user_id/followers',
        handler: async (req) => {
            return service.getFollowerUsers(req.params.user_id, req.query.limit, req.query.offset)
        }
    },
    {
        method: 'GET',
        url: '/users/:user_id/followers/:follower_id',
        handler: async (req) => {
            const r = await service.isUserFollowedBy(req.params.user_id, req.params.follower_id)
            if (r[0].exists) return service.getUser(req.params.follower_id)
            // If the user is not followed by the follower it returns Not Found
            throw { statusCode: 404 }
        }
    },
    {
        method: 'GET',
        url: '/users/:user_id',
        handler: async (req) => {
            return base.notFoundIfEmpty(await service.getUser(req.params.user_id))
        }
    }
]
