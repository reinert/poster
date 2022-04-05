import pg from 'pg'

const { Pool } = pg

const before = (test, test_db, callback) => test.before(async t => {
    t.context.pool = new Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: test_db,
        password: process.env.PGPASSWORD
    })

    await callback(t)
})

const after = (test, callback) => test.after(async t => {
    if (callback) await callback(t)

    t.context.pool.end()
})

export default {
    before,
    after
}
