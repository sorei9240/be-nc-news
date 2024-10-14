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