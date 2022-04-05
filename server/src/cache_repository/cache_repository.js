const CacheRepository = (Repository) => class extends Repository {

    constructor(cache, repository) {
        super()
        this.cache = cache
        this.repository = repository
    }

    async tryCache(key, ttl, method, ...args) {
        // Try retrieving posts from cache
        const cached = this.cache.get(key)
        if (cached) {
            console.log(`>> Cache hit: ${key}`)
            return cached
        }

        // If it's not cached, retrieve and cache it
        const result = await this.repository[method](...args)
        this.cache.set(key, result, ttl)

        return result
    }

    async tryCacheLimitOffset(limit, offset, key, ttl, method, ...args) {
        limit = parseInt(limit)
        offset = parseInt(offset)

        const fromIdx = offset
        const toIdx = limit + offset

        // Try retrieving posts from cache
        let cached = this.cache.get(key)
        if (cached) {
            const slice = cached.slice(fromIdx, toIdx - 1)
            if (!slice.includes(undefined)) {
                console.log(`>> Cache hit: ${key} [${limit}, ${offset}]`)
                return slice
            }
        }

        // If it's not cached, retrieve and cache it
        const result = await this.repository[method](...args, limit, offset)

        if (!cached) cached = []

        let k = 0
        for (let i = fromIdx; i < toIdx; i++) {
            const el = result[k++]
            if (el != null) cached[i] = el
        }

        this.cache.set(key, cached, ttl)

        return result
    }
}

export default CacheRepository
