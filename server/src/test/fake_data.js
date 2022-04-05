import { faker } from '@faker-js/faker'

faker.seed(Math.floor(Math.random() * 1000))


// ============================================================================
// Utility functions to provide randomness on data generation
// ============================================================================

const randomBoolean = () => Math.random() < 0.5

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const randomIntArray = (min, max, length, exclude_int) => {
  const arr = []
  while (arr.length < length) {
    const int = randomInt(min, max)
    if (int === exclude_int) continue
    if (arr.indexOf(int) === -1) arr.push(int)
  }
  return arr
}

const randomDate = (min_year, max_year) => new Date(
    randomInt(min_year, max_year),
    randomInt(0, 11),
    randomInt(0, 28),
    randomInt(0, 23),
    randomInt(0, 59),
    randomInt(0, 59),
)

const randomText = (max_chars) => faker.lorem.text().substring(0, max_chars)

const randomKind = () => {
  switch (randomInt(1, 3)) {
    case 2: return PostKind.REPOST
    case 3: return PostKind.QUOTE
    default: return PostKind.ORIGINAL
  }
}

// ============================================================================
// Utility functions to generate random fake data and populate the db
// ============================================================================

const PostKind = {
  ORIGINAL: 'original',
  REPOST: 'repost',
  QUOTE: 'quote',
}

const generateUsers = async (pool, quantity) => {
  const usernames = [...Array(quantity)].map(() => faker.name.firstName().toLowerCase())

  const client = await pool.connect()
  try {
    const values = usernames.map(u => "('" + u + "')").join(', ')
    const sql = `INSERT INTO users (username) VALUES ${values} RETURNING id, username`
    const r = await client.query(sql)
    return r.rows
  } finally {
    client.release()
  }
}

const generateFollowings = async (pool, users) => {
  const client = await pool.connect()
  try {
    const followings = {}
    for (let u of users) {
      const followees = randomIntArray(1, users.length, randomInt(1, users.length - randomInt(users.length / 4, users.length / 2)), parseInt(u.id))
      followings[u.id] = followees
      const values = followees.map(id => `(${u.id}, ${id})`).join(', ')
      const sql = `INSERT INTO follows (follower_id, followee_id) VALUES ${values}`
      await client.query(sql)
    }
    return followings
  } finally {
    client.release()
  }
}

const generatePost = async (
    pool,
    user_id,
    kind = PostKind.ORIGINAL,
    content = randomText(77),
    datetime = randomDate(2020, 2022),
    parent_post_id = 'NULL') => {
  const client = await pool.connect()
  try {
    const values = `('${kind}', '${content}', '${datetime.toISOString()}', ${user_id}, ${parent_post_id || 'NULL'})`
    const sql = `INSERT INTO posts (kind, content, datetime, user_id, parent_post_id) VALUES ${values} RETURNING id, kind, content, datetime, user_id, parent_post_id`
    const r = await client.query(sql)
    return r.rows[0]
  } finally {
    client.release()
  }
}

const generateOriginalPosts = async (pool, users, max_posts, max_chars) => {
  const client = await pool.connect()
  let posts = []
  try {
    for (let u of users) {
      const contents = [...Array(max_posts)].map(() => randomText(max_chars))
      const values = contents.map(p => `('${PostKind.ORIGINAL}', '${p}', '${randomDate(2020, 2022).toISOString()}', ${u.id})`).join(', ')
      const sql = `INSERT INTO posts (kind, content, datetime, user_id) VALUES ${values} RETURNING id, user_id`
      const r = await client.query(sql)
      posts = posts.concat(r.rows)
    }
    return posts
  } finally {
    client.release()
  }
}

const generateQuotesAndReposts = async (pool, users, parent_posts, max_posts, max_chars) => {
  const client = await pool.connect()
  try {
    const parent_ids = randomIntArray(0, parent_posts.length - 1, randomInt(parent_posts.length / 2, parent_posts.length - 1))
    for (let p_id of parent_ids) {
      const levels = randomBoolean() ? 1 : randomInt(1, 7) // up to 7 nested levels
      let parent_post_id = parent_posts[p_id].id
      let parent_user_id = parent_posts[p_id].user_id
      for (let i = 0; i < levels; i++) {
        const users_ids = randomIntArray(1, users.length, randomInt(1, 10), parent_user_id) // up to 10 replies

        const values = users_ids.map(u_id => randomBoolean() ?
            `('${PostKind.REPOST}', NULL, '${randomDate(2020, 2022).toISOString()}', ${u_id}, ${parent_post_id})` :
            `('${PostKind.QUOTE}', '${randomText(faker, max_chars)}', '${randomDate(2020, 2022).toISOString()}', ${u_id}, ${parent_post_id})`
        ).join(', ')

        const sql = `INSERT INTO posts (kind, content, datetime, user_id, parent_post_id) VALUES ${values} RETURNING id`

        const r = await client.query(sql)

        const new_post = r.rows[randomInt(0, r.rows.length - 1)]
        parent_post_id = new_post.id
        parent_user_id = new_post.user_id
      }
    }
  } finally {
    client.release()
  }
}


// ============================================================================
// Main functions to execute data population
// ============================================================================

export default {
  randomBoolean,
  randomInt,
  randomDate,
  randomText,
  randomKind,
  PostKind,
  generateUsers,
  generateFollowings,
  generatePost,
  generateOriginalPosts,
  generateQuotesAndReposts,
}
