const PgRepository = (Repository) => class extends Repository {

    constructor(pool) {
        super()
        this.pool = pool
    }

    async query({ name, text, values}) {
        const client = await this.pool.connect()
        try {
            const r = await client.query({name, text, values})
            return r.rows
        } finally {
            client.release()
        }
    }
}

export default PgRepository
