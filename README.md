# Posterr by Danilo Reinert

- https://github.com/reinert
- https://linkedin.com/in/daniloreinert
- https://youtube.com/daniloreinert


## Requirements

- Docker 17.12.0+


## Project specification

- Database: PostgreSQL (14.2)
- Web Server: Nginx (1.21.5)
- Application Server: NodeJS (17.8)
- Language: EcmaScript 6
- Dependencies:
  - Http/Rest: fastify (3.27.4)
  - Postgres: pg (8.7.3)
  - Cache: node-cache (5.1.2)
- Dev Dependencies:
  - Data faker: faker (6.1.1)
  - Parallel testing: ava (4.1.0)


## Setup for development

Initially we need to run a setup script to prepare for development.

In the project's root directory type:

```bash
./setup-for-dev.sh
```

Now the `http://localhost:8123` url will redirect to our application.


## Run the project

With the environment set, we can now run the services through docker.

In the project's root directory type:

```bash
docker-compose up
```

The following actions happens:

- The nginx server starts proxying localhost:8123 to the node server
- The pgsql server starts running the migration scripts
- The (node) server starts doing the following:
  - the dependencies are installed
  - the tests are executed (in parallel)
  - the database is populated with randomly generated data
  - the http server stats listening in the port 3000 (nginx proxies external 8123 calls)


## Project Structure

- nginx
  - conf
- pgsql
  - migrations
- server
  - src
    - repository
    - service
    - resource

NOTE: Tests are collocated near to the features they're testing with the '_test' suffix.
Particularly for this project, there were only two test files created in the service package.


## Architectural Design

Since the scope is restricted the application was built as a simple **monolith**.

The app structure is divided into three layers: (1) repository, (2) service, and (3) resource.

1. The **repository** describes the persistence contract.
    1. For each root entity, a **repository abstract class** is declared defining the persistence methods for the entity.
    2. A **pg-repository** implementation was created for each entity, providing the persistence to the pg database.
    3. A **cache-repository** implementation was created for the Post entity, demonstrating the integration of a cache mechanism over the pg-repository.
2. The **service** provides the application service logic (domain/business logic) for external services that may expose the app features.
    1. Since the business requirements are very restricted, the application service and domain layers were merged into one. It lets the codebase smaller and simpler to understand in this context.
3. The **resource** layer provides the REST api services.
    1. It exposes the applications services through the HTTP interface, following the REST principles.


## HTTP API

The api is locally available though the `http://localhost:8123` address. We should prepend it with the uris below.

### 1. Users

#### 1.1. GET /users/:user_id
Returns the user json corresponding to the user_id

#### 1.2. GET /users/:user_id/following
Returns the users that are followed by user_id

#### 1.3. POST /users/:user_id/following/:followee_id
The user_id starts following the followee_id

#### 1.4. DELETE /users/:user_id/following/:followee_id
The user_id unfollows the followee_id

#### 1.5. GET /users/:user_id/followers
Returns the users that are following user_id

#### 1.6. GET /users/:user_id/followers/:follower_id
Returns the follower_id json if she's following the user_id

### 2. Posts

#### 2.1. POST /posts
Creates a post, a repost or quote post, depending on the kind property

#### 2.2. GET /posts/:post_id
Returns the post json corresponding to the post_id

#### 2.3. GET /posts
Returns the queried posts.

The optional params are:
- `q`: searches posts according to the segment passed in this argument
- `user_id`: returns the posts created by the user_id
- `follower_id`: returns the posts from the users that are followed by follower_id

NOTE: All GET requests accept two query params for pagination: `limit` and `offset`.
By default, limit is 10 and offset is 0.

### Insomnia

The file `posterr-insomnia-v4.json` in the project's root is an insomnia exported document
that provides us all existing api calls when imported to the insomnia app.


## Planning

The Product Manager wants to implement a new feature called "reply-to-post" (it's a lot like Twitter's).
These are regular posts that use "@ mentioning" at the beginning to indicate that it is a reply directly to a post.
Reply posts should only be shown in a new, secondary feed on the user profile called "Posts and Replies" where all
original posts and reply posts are shown. They should not be shown in the homepage feed.

### Questions
- Can an user reply himself? (Suppose not)
- Is it possible to reply more than one user? (Suppose not)
- Can a reply have no content besides the mentioning? (Suppose yes)
- Is there a limit of replies by user or post in some timeframe? (Suppose not)

### Implementation plan
1. Create a new migration:
    1. Adding **'reply'** to the `post_kind` enum in the db.
    2. Adding the `replied_user_id` column to the `posts` table.
    3. Altering the `posts_content_ck` to accept posts of 'reply' kind with content as null (equal to 'repost').
    4. Adding a new `posts_parent_datetime_idx` index on `posts` table by (`parent_post_id`, `datetime`) to make it faster to query for a post's replies.
2. Do the following changes in the server app:
    1. Add the new field to the queries where it applies (the fields should be extracted into a constant to avoid repetition).
    2. Create a new method in the repository to get posts' replies.
    3. Create a new method in the service to get posts' replies with the appropriate validations.
    4. Add a new query param to the GET /posts resource endpoint called `replied_id` to retrieve the posts in reply to the replied_id post.


## Critique

#### What you would improve if you had more time?
- Implement more tests (both unit and integration)
- Implement a cache_user_repository
- Extract parts of the sql queries into constants to make it easier to modify and reuse them
- Implement the database level validations in application (server) level
- Improve the system logging
- Use Typescript to provide a better long-term maintainability to the codebase
- Implement security layers and verifications


### Write about scaling
#### If this project were to grow and have many users and posts, which parts do you think would fail first?
- The node server would suffer initially.
- The database would suffer subsequently. Or it could suffer before the node server if the resources like memory, storage and cpu are too limited.
- Finally, the nginx webserver would start to fail.

#### In a real-life situation, what steps would you take to scale this product?
- For the node server we could:
    - Upgrade the cache mechanism into a dedicated cache server that would handle the requests initially before delegating to the application server.
    - Seek for opportunities of caching or query optimization by reasoning about the domain logic and the common usage.
        - For example, an user that has many followers, and thus is very popular, would probably represent a good opportunity to have her posts cached for a longer time.
    - In case the domain logic grows, we'd need to break the monolith into dedicated micro-services for each subdomain, each one having it's own dedicated database and release process.
        - The micro-services scenario would require us to have a gateway server to coordinate the calls between them.
    - Lastly, we would replicate the node server (or micro-services) into many instances.
- For the database we could:
    - Upgrade the database server resources like memory, storage and cpu.
    - If the usage increases to a big data scale, we'd need to start using a distributed storage like hadoop.
- For the webserver we could:
    - Use a load balancer.
    - Replicate it into many instances.

#### What other types of technology and infrastructure might you need to use?
- Monitoring tools like zabbix are important to keep track of the bottlenecks.
- Backup tools are important to provide more reliance to the business.
- Code and data auditing tools are important to keep the system safe.
- Security tools are important to avoid hacker attacks and data leaks.

