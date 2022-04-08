const PgRepository = (Repository) => class extends Repository {

    constructor(pool) {
        super()
        this.pool = pool
    }

    async query({ name, text, values}) {
        // note: we don't try/catch this because if connecting throws an exception
        // we don't need to dispose of the client (it will be undefined)
        const client = await this.pool.connect()
        try {
            const r = await client.query({name, text, values})
            return r.rows
        } finally {
            client.release()
        }
    }

    async in_transaction(callback) {
        // note: we don't try/catch this because if connecting throws an exception
        // we don't need to dispose of the client (it will be undefined)
        const client = await this.pool.connect()
        try {
            await client.query('BEGIN')

            const result = await callback(client)

            await client.query('COMMIT')

            return result
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    }
}

export default PgRepository
