import pg from 'pg'
import test_dbs from './test_dbs.js'

const { Client } = pg

let client = new Client()

try {
    client.connect()
    for (let test_db of test_dbs) {
        console.log(">>", `Creating test database ${test_db}`)
        await client.query(`DROP DATABASE IF EXISTS ${test_db}`)
        await client.query(`CREATE DATABASE ${test_db} WITH TEMPLATE ${process.env.PGDATABASE} OWNER ${process.env.PGUSER}`)
    }
} finally {
    client.end()
}
