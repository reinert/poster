import test from 'ava'
import base from '../test_base.js'
import fake_data from "../fake_data.js";
import PgPostRepository from "../pg_repository/post_repository.js";
import PostService from "./post_service.js";

const { before, after } = base

const { PostKind, generatePost, generateUsers } = fake_data

const TEST_DB = 'post_service_test'

before(test, TEST_DB, async t => {
    t.context.service = new PostService(new PgPostRepository(t.context.pool))
    const [ user ] = await generateUsers(t.context.pool, 1)
    t.context.user = user
})

after(test, TEST_DB)

test('addPostFailsWhenThereIsFivePostsInTheDay', async t => {
    const date = new Date();

    for (let i = 0; i < 5; i++) {
        await generatePost(t.context.pool, t.context.user.id, PostKind.ORIGINAL, 'anything', date)
    }

    await t.throwsAsync(t.context.service.addPost(PostKind.ORIGINAL, 'anything', date, t.context.user.id))
})

test('addPostFailsWhenRepostingAnOwnPost', async t => {
    const post = await generatePost(t.context.pool, t.context.user.id, PostKind.ORIGINAL, 'anything', new Date())

    await t.throwsAsync(t.context.service.addPost(PostKind.REPOST, null, new Date(), t.context.user.id, post.id))
})

test('addPostFailsWhenQuotingAnOwnPost', async t => {
    const post = await generatePost(t.context.pool, t.context.user.id, PostKind.ORIGINAL, 'anything', new Date())

    await t.throwsAsync(t.context.service.addPost(PostKind.QUOTE, 'anything', new Date(), t.context.user.id, post.id))
})

test('searchPostsSucceedsWithPartsOfContent', async t => {
    const content = 'anything something'

    const post = await generatePost(t.context.pool, t.context.user.id, PostKind.ORIGINAL, content, new Date())

    const [ searched ] = await t.context.service.searchPostsByContent('something')

    t.is(searched.id, post.id)
})
