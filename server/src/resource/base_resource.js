export default {
    notFoundIfEmpty: (result) => {
        if (result && result.length > 0)
            return result
        throw { statusCode: 404 }
    }
}
