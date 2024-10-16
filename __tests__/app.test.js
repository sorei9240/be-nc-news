const request = require('supertest');
const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js')
const data = require('../db/data/test-data/index.js')
const endpoints = require('../endpoints.json');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('GET /api/topics', () => {
    it('responds with a 200 status and an array of objects', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .then((response) => {
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body.topics)).toBe(true)
                response.body.topics.forEach((topic) => {
                    expect(topic).toEqual(expect.objectContaining({
                        slug: expect.any(String), description: expect.any(String)
                    }))
                })
            })
    })
})
describe('GET /api', () => {
    it('responds with an object containing all available endpoints', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then(({ body }) => {
                expect(body.endpoints).toEqual(endpoints)
            })
    })
})

describe('GET /api/articles/:article_id', () => {
    it('responds with the appropriate article object', () => {
        return request(app)
            .get('/api/articles/1')
            .expect(200)
            .then(({ body }) => {
                expect(body.article).toEqual({
                    article_id: 1,
                    title: 'Living in the shadow of a great man',
                    topic: 'mitch',
                    author: 'butter_bridge',
                    body: 'I find this existence challenging',
                    created_at: '2020-07-09T20:11:00.000Z',
                    votes: 100,
                    article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
                })
            })
    })
    it('responds with a 404 error when a valid, but non-existent id is requested', () => {
        return request(app)
            .get('/api/articles/9999')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('Not found')
            })
    })
    it('responds with a 400 error when an invalid id is requested', () => {
        return request(app)
            .get('/api/articles/not-an-id')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid Id')
            })
    })
})

describe('GET /api/articles', () => {
    it('responds with an array of article objects sorted by date, with comment_count added, and body property removed', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({ body }) => {
                expect(body.articles.length).toBe(13);
                expect(body.articles).toBeSortedBy('created_at', { descending: true });
                body.articles.forEach((article) => {
                    expect(article).toEqual(expect.objectContaining({
                        author: expect.any(String),
                        title: expect.any(String),
                        article_id: expect.any(Number),
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        votes: expect.any(Number),
                        article_img_url: expect.any(String),
                        comment_count: expect.any(Number)
                    }))
                })
            })
    })
    it('returns an array of all articles sorted by the requested property and in the requested order', () => {
        return request(app)
            .get('/api/articles?sort_by=comment_count&order=asc')
            .expect(200)
            .then(({ body }) => {
                console.log(body)
                expect(body.articles.length).toBe(13);
                expect(body.articles).toBeSortedBy('comment_count', { descending: false });
            })
    })

})

describe('GET /api/articles/:article_id/comments', () => {
    it('GET:200 responds with comments on the article matching the given id, sorted by date in descending order', () => {
        return request(app)
            .get('/api/articles/9/comments')
            .expect(200)
            .then(({ body }) => {
                expect(body.comments).toHaveLength(2);
                expect(body.comments).toBeSortedBy('created_at', { descending: true});
                body.comments.forEach((comment) => {
                    expect(comment).toEqual(expect.objectContaining({
                        comment_id: expect.any(Number),
                        votes: expect.any(Number),
                        created_at: expect.any(String),
                        author: expect.any(String),
                        body: expect.any(String),
                        article_id: 9,
                    }))
                })
            })
    })
    it('GET:200 returns an empty array when passed a valid article_id with no associated comments', () => {
        return request(app)
            .get('/api/articles/2/comments')
            .expect(200)
            .then(({ body }) => {
                expect(body.comments).toHaveLength(0);
            })
    })
    it('GET:404 returns an error when a valid, but nonexistent id is passed', () => {
        return request(app)
        .get('/api/articles/9999/comments')
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Not found')
        })
    })
    it('GET:400 responds with an error when an invalid id is requested', () => {
        return request(app)
            .get('/api/articles/abc/comments')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid Id')
            })
    })
})

describe('POST /api/articles/:article_id/comments', () => {
    it('POST:201 returns the posted comment', () => {
        const testComment = { username: 'butter_bridge', body: 'I agree.'};

        return request(app)
        .post('/api/articles/10/comments')
        .send(testComment)
        .expect(201)
        .then(({ body }) => {
            expect(body.comment).toEqual(expect.objectContaining({
                comment_id: expect.any(Number),
                body: testComment.body,
                votes: 0,
                author: testComment.username,
                article_id: 10,
                created_at: expect.any(String)
            }))
        })
    })

    it('POST:400 returns an error when an attempt is made to post to an invalid id', () => {
        const testComment = { username: 'butter_bridge', body: 'I agree.'};

        return request(app)
        .post('/api/articles/abc/comments')
        .send(testComment)
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Invalid Id')
        })
    })
    it('POST:400 returns an error when the request is missing the body', () => {
        const testComment = { username: "butter_bridge"}
        return request(app)
        .post('/api/articles/1/comments')
        .send(testComment)
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Missing username or body')
        })
    })
    it('POST:400 returns an error when the request is missing a username', () => {
        const testComment = { body: 'I agree'}
        return request(app)
        .post('/api/articles/1/comments')
        .send(testComment)
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Missing username or body')
        })
    })
    it('POST:404 returns an error when an attempt is made to post to a valid but nonexistent id', () => {
        const testComment = { username: 'butter_bridge', body: 'I agree.'};

        return request(app)
        .post('/api/articles/9999/comments')
        .send(testComment)
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Not found')
        })
    })

    it('Returns an error when an invalid username is entered', () => {
        const testComment = { username: 'i_dont_exist', body: 'I agree.'};

        return request(app)
        .post('/api/articles/10/comments')
        .send(testComment)
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Invalid username')
        })
    })
})

describe('PATCH /api/articles/:article_id', () => {
    it('PATCH:200 updates the article votes by the specified amount', () => {
        const updateVotes = { inc_votes: 1};
        return request(app)
            .patch('/api/articles/1')
            .send(updateVotes)
            .expect(200)
            .then(({ body }) => {
                expect(body.article.article_id).toBe(1)
                expect(body.article.votes).toBe(101)
            })
    })
    it('PATCH:400 returns an error when an attempt is made to patch an invalid id', () => {
        const updateVotes = { inc_votes: 1};
        return request(app)
        .patch('/api/articles/abc')
        .send(updateVotes)
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Invalid Id')
        })
    })
    it('PATCH:404 returns an error when an attempt is made to patch a valid but nonexistent id', () => {
        const updateVotes = { inc_votes: 1};
        return request(app)
        .patch('/api/articles/9999')
        .send(updateVotes)
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Not found')
        })
    })
    it('PATCH:400 returns an error when an invalid inc_votes is entered', () => {
        const updateVotes = { inc_votes: 'not-a-num'};
        return request(app)
        .patch('/api/articles/1')
        .send(updateVotes)
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Invalid inc_votes')
        })
    })
    it('PATCH:400 returns an error when an empty inc_votes is entered', () => {
        const updateVotes = {};
        return request(app)
        .patch('/api/articles/1')
        .send(updateVotes)
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Invalid inc_votes')
        })
    })
})

describe('DELETE /api/comments/:comment_id', () => {
    it('DELETE:204 successfully deletes comment and returns 204', () => {
        return request(app)
        .delete('/api/comments/1')
        .expect(204)
    })
    it('DELETE:400 throws an error when an invalid id is entered', () => {
        return request(app)
        .delete('/api/comments/abc')
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Invalid Id')
        })
    })
    it('DELETE:404 throws an error when a valid but nonexistent id is entered', () => {
        return request(app)
        .delete('/api/comments/9999')
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Not found')
        })
    })
})

describe('GET /api/users', () => {
    it('returns an array of users with the expected properties', () => {
        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body }) => {
            expect(Array.isArray(body.users)).toBe(true)
            expect(body.users).toHaveLength(4)
            body.users.forEach((user) => {
                expect(user).toEqual(expect.objectContaining({
                    username: expect.any(String),
                    name: expect.any(String),
                    avatar_url: expect.any(String)
                }))
            })
        })
    })
})