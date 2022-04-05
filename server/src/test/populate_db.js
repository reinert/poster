import fake_data from "./fake_data.js";

const {
  generateUsers,
  generateFollowings,
  generateOriginalPosts,
  generateQuotesAndReposts
} = fake_data


// ============================================================================
// Parameters to control data population
// ============================================================================

// numbers greater than 32 may generate repeated data causing error
const TOTAL_USERS = 32

const MAX_POSTS_BY_KIND = 50

const MAX_POST_LENGTH = 77


// ============================================================================
// Main functions to execute data population
// ============================================================================

const checkPopulated = async (pool) => {
  const client = await pool.connect()
  try {
    const sql = `SELECT * FROM users LIMIT 1`
    const r = await client.query(sql)
    return r.rows.length > 0
  } catch (e) {
    console.error(e)
    return false
  } finally {
    client.release()
  }
}

const populate_db = async (pool) => {
  const isPopulated = await checkPopulated(pool)

  if (isPopulated) return

  console.info('Start populating database.')

  console.info('Generating users...')

  const users = await generateUsers(pool, TOTAL_USERS)

  console.info('Generating follows...')

  await generateFollowings(pool, users)

  console.info('Generating original posts...')

  const original_posts = await generateOriginalPosts(pool, users, MAX_POSTS_BY_KIND, MAX_POST_LENGTH)

  console.info('Generating quotes and reposts...')

  await generateQuotesAndReposts(pool, users, original_posts, MAX_POSTS_BY_KIND, MAX_POST_LENGTH)

  console.info('Database populated.')
}

export default populate_db
