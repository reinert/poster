import test from 'ava'
import base from '../test/test_base.js'
import PgUserRepository from "../pg_repository/user_repository.js";
import UserService from "./user_service.js";

const { before, after } = base

const TEST_DB = 'user_service_test'

before(test, TEST_DB, async t => {
    t.context.service = new UserService(new PgUserRepository(t.context.pool))
})

after(test)

test('addUserFailsWhenUsernameIsNonAlphanumeric', async t => {
    const username = '!@#!@%$!#$!'
    await t.throwsAsync(t.context.service.addUser(username))
})

test('followFailsWhenFollowerAndFolloweeAreEqual', async t => {
    const [ user ] = await t.context.service.addUser({ username: 'testuser' })
    await t.throwsAsync(t.context.service.follow(user.id, user.id))
})
