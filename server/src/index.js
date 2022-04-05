import pg from 'pg'
import fastify_factory from 'fastify'
import populate_db from './test/populate_db.js'

import errors from "./errors.js"

import PgUserRepository from "./pg_repository/user_repository.js"
import UserResource from "./resource/user_resource.js"
import UserService from "./service/user_service.js"

import CachePostRepository from "./cache_repository/post_repository.js"
import PgPostRepository from "./pg_repository/post_repository.js"
import PostResource from "./resource/post_resource.js"
import PostService from "./service/post_service.js"
import NodeCache from "node-cache"


const { ValidationError } = errors
const { Pool } = pg

const fastify = fastify_factory({
  logger: {
    level: 'info',
    file: process.env.LOG
  }
})

const pool = new Pool()


// ============================================================================
// Hooks
// ============================================================================

fastify.addHook('onError', async (request, reply, error) => {
  if (error instanceof ValidationError) {
    // Set the response as Bad Request in case of ValidationError
    reply.statusCode = 400
    return
  }

  if (error.constraint) {
    if (error.constraint === 'users_username_ck') {
      error.message = 'Username must be alphanumeric and 14 chars at most'
      reply.statusCode = 400
      return
    }

    if (error.constraint === 'follows_follower_followee_ck') {
      error.message = 'Cannot follow yourself'
      reply.statusCode = 400
      return
    }

    if (error.constraint === 'posts_content_ck') {
      error.message = 'Reposts cannot have content and Posts/Quotes must have content'
      reply.statusCode = 400
      return
    }

    if (error.constraint === 'posts_parent_ck') {
      error.message = 'Original posts cannot reference another post and Reposts/Quotes must reference others'
      reply.statusCode = 400
      return
    }

    if (error.constraint.endsWith('_pk')) {
      error.message = 'The record already exists. Cannot duplicate it.'
      reply.statusCode = 400
    }
  }
})

fastify.addHook('onClose', async (instance) => {
  await pool.end()
})


// ============================================================================
// Resources
// ============================================================================

const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 600,
  useClones: false,
  deleteOnExpire: true
})

const pgUserRepository = new PgUserRepository(pool)
const pgPostRepository = new PgPostRepository(pool)

const userResource = UserResource(new UserService(pgUserRepository))
const postResource = PostResource(new PostService(new CachePostRepository(cache, pgPostRepository, pgUserRepository)))

for (const route of userResource) fastify.route(route)
for (const route of postResource) fastify.route(route)


// ============================================================================
// Server
// ============================================================================

const start = async () => {
  try {
    await populate_db(pool)
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
  } catch (e) {
    fastify.log.error(e)
    await pool.end()
    process.exit(1)
  }
}

start()
