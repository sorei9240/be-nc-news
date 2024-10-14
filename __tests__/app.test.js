const request = require('supertest');
const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js')
const data = require('../db/data/test-data/index.js')

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('GET /api/topics', () => {
    it('responds with a 200 status', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .then((response) => {
                expect(response.status).toBe(200);
            })
    })
    it('responds with an array of topic objects, containing slug and descirption properties', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .then(({ body }) => {
                expect(Array.isArray(body.topics)).toBe(true)
                body.topics.forEach((topic) => {
                    expect(typeof topic.slug).toBe('string')
                    expect(typeof topic.description).toBe('string')
                })
            })
    })
})