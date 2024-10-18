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
                    comment_count: 11,
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
                expect(body.msg).toBe('Invalid Request')
            })
    })
    it('returns a comment_count of 0 when an article has no comments', () => {
        return request(app)
        .get('/api/articles/2')
        .expect(200)
        .then(({ body }) => {
            expect(body.article.comment_count).toBe(0)
        })
    })
})

describe('GET /api/articles', () => {
    it('responds with an array of article objects sorted by date, with comment_count added, and body property removed', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({ body }) => {
                expect(body.totalCount).toBe(13);
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
    it('returns an array of all articles with the requested limit, sorted by the requested property and in the requested order', () => {
        return request(app)
            .get('/api/articles?sort_by=comment_count&order=asc&limit=13')
            .expect(200)
            .then(({ body }) => {
                expect(body.articles.length).toBe(13);
                expect(body.articles).toBeSortedBy('comment_count', { descending: false });
            })
    })
    it('returns the second page of results when a limit and page are entered', () => {
        return request(app)
            .get('/api/articles?limit=1&p=2')
            .expect(200)
            .then(({ body }) => {
                expect(body.articles.length).toBe(1)
                expect(body.articles[0]).toEqual(expect.objectContaining({
                    article_id: 6,
                    title: 'A',
                    topic: 'mitch',
                    author: 'icellusedkars',
                    created_at: expect.any(String),
                    votes: 0,
                    article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
                    comment_count: 1
                }))
            })
    })
    it('returns an error if an invalid sort_by is entered', () => {
        return request(app)
        .get('/api/articles?sort_by=invalid')
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Invalid sort_by')
        })
    })
    it('returns an error if an invalid order is entered', () => {
        return request(app)
        .get('/api/articles?order=abc')
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Invalid order')
        })
    })
    it('returns an array of all articles of the requested topic', () => {
        return request(app)
            .get('/api/articles?topic=cats')
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toHaveLength(1)
                body.articles.forEach((article) => {
                    expect(article.topic).toBe('cats')
                })
            })
    })
    it('returns 404 if a topic with no matching articles is entered', () => {
        return request(app)
        .get('/api/articles?topic=potatoes')
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('No articles found')
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
                expect(body.msg).toBe('Invalid Request')
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
            expect(body.msg).toBe('Invalid Request')
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
            expect(body.msg).toBe('Invalid Request')
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
            expect(body.msg).toBe('Invalid Request')
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

describe('GET /api/users/:username', () => {
    it('returns the requested user object with all associated properties', () => {
        return request(app)
        .get('/api/users/lurker')
        .expect(200)
        .then(({ body }) => {
            expect(typeof body.user).toBe('object')
            expect(body.user).toEqual(expect.objectContaining({
                username: 'lurker',
                name: 'do_nothing',
                avatar_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png'
            }))
        })
    })
    it('returns a 404 error when the requested user does not exist', () => {
        return request(app)
        .get('/api/users/i_dont_exist')
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('User Not Found')
        })
    })
})

describe('PATCH /api/comments/:comment_id', () => {
    it('PATCH:200 updates the comment votes by the specified amount', () => {
        const updateVotes = { inc_votes: -1};
        return request(app)
            .patch('/api/comments/1')
            .send(updateVotes)
            .expect(200)
            .then(({ body }) => {
                expect(body.comment.comment_id).toBe(1)
                expect(body.comment.votes).toBe(15)
            })
    })
    it('PATCH:400 returns an error when an attempt is made to patch an invalid id', () => {
        const updateVotes = { inc_votes: 1};
        return request(app)
        .patch('/api/comments/abc')
        .send(updateVotes)
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Invalid Request')
        })
    })
    it('PATCH:404 returns an error when an attempt is made to patch a valid but nonexistent id', () => {
        const updateVotes = { inc_votes: 1};
        return request(app)
        .patch('/api/comments/9999')
        .send(updateVotes)
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Not found')
        })
    })
    it('PATCH:400 returns an error when an invalid inc_votes is entered', () => {
        const updateVotes = { inc_votes: 'not-a-num'};
        return request(app)
        .patch('/api/comments/1')
        .send(updateVotes)
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Invalid inc_votes')
        })
    })
    it('PATCH:400 returns an error when an empty inc_votes is entered', () => {
        const updateVotes = {};
        return request(app)
        .patch('/api/comments/1')
        .send(updateVotes)
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Invalid inc_votes')
        })
    })
})

describe('POST /api/articles', () => {
    it('POST:201 returns the posted article', () => {
        const testArticle = { 
            title: "They're not exactly cats, are they?",
            topic: "mitch",
            author: "butter_bridge",
            body: "Well? Think about it.",
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };

        return request(app)
        .post('/api/articles')
        .send(testArticle)
        .expect(201)
        .then(({ body }) => {
            expect(body.article).toEqual(expect.objectContaining({
                article_id: 14,
                title: testArticle.title,
                topic: testArticle.topic,
                author: testArticle.author,
                body: testArticle.body,
                article_img_url: testArticle.article_img_url,
                votes: 0,
                created_at: expect.any(String),
                comment_count: 0
            }))
        })
    })
    it('POST:201 successfully posts article when missing an image URL', () => {
        const testArticle = { 
            title: "They're not exactly cats, are they?",
            topic: "mitch",
            author: "butter_bridge",
            body: "Well? Think about it.",
        };

        return request(app)
        .post('/api/articles')
        .send(testArticle)
        .expect(201)
        .then(({ body }) => {
            expect(body.article).toEqual(expect.objectContaining({
                article_id: 14,
                title: testArticle.title,
                topic: testArticle.topic,
                author: testArticle.author,
                body: testArticle.body,
                article_img_url: 'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700',
                votes: 0,
                created_at: expect.any(String),
                comment_count: 0
            }))
        })
    })
    it('POST:400 returns an error when the request is missing required fields', () => {
        const testArticle = { 
            title: "They're not exactly cats, are they?",
            topic: "mitch",
            author: "butter_bridge",
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };
        return request(app)
        .post('/api/articles')
        .send(testArticle)
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Missing or invalid fields')
        })
    })
    it('Returns an error when an invalid username is entered', () => {
        const testArticle = { 
            title: "They're not exactly cats, are they?",
            topic: "mitch",
            author: "i_dont_exist",
            body: "Well? Think about it.",
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };

        return request(app)
        .post('/api/articles')
        .send(testArticle)
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Username or topic not found')
        })
    })
})