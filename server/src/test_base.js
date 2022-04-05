import { faker } from '@faker-js/faker'
import pg from 'pg'
import fake_data from "./fake_data.js";

faker.seed(Math.floor(Math.random() * 1000))

const { Client, Pool } = pg

const { randomBoolean, randomInt } = fake_data

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const before = (test, test_db, callback) => test.before(async t => {
    let client = new Client({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD
    })

    try {
        await client.connect()
        await client.query(`DROP DATABASE IF EXISTS ${test_db}`)

        try {
            await client.query(`CREATE DATABASE ${test_db} WITH TEMPLATE ${process.env.PGDATABASE} OWNER ${process.env.PGUSER}`)
        } catch (e) {
            await client.end()
            client = new Client({
                user: process.env.PGUSER,
                host: process.env.PGHOST,
                database: process.env.PGDATABASE,
                password: process.env.PGPASSWORD
            })
            let ms = randomInt(randomBoolean() ? 10 : 200, randomBoolean ? 2000 : 4000)
            console.log(`>>> Test db '${test_db}' creation failed. Trying to recreate the test db in ${ms}ms...`)
            await sleep(ms)
            if (randomBoolean()) {
                ms = randomInt(randomBoolean() ? 10 : 200, randomBoolean ? 2000 : 4000);
                console.log(`>>> Delaying test db creation for more ${ms}ms...`)
                await sleep(ms)
            }
            await client.connect()
            await client.query(`CREATE DATABASE ${test_db} WITH TEMPLATE ${process.env.PGDATABASE} OWNER ${process.env.PGUSER}`)
        }

        t.context.pool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: test_db,
            password: process.env.PGPASSWORD
        })

        await callback(t)
    } finally {
        client.end()
    }
})

const after = (test, test_db, callback) => test.after(async t => {
    if (callback) await callback(t)

    t.context.pool.end()

    const client = new Client({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD
    })

    try {
        await client.connect()
        await client.query(`DROP DATABASE ${test_db}`)
    } finally {
        client.end()
    }
})

export default {
    before,
    after
}