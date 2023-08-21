const request = require('supertest')
const app = require('../../app')
const { mongoConnection, mongoDisconnect } = require('../../services/mongo')
const { loadPlanetsData } = require('../../models/planets.model')
const { getLatestFlightNumber } = require('../../models/launches.model')

describe('Test Launches APIs', () => {
    // Run mongo connection before all test executions
    beforeAll(async () => {
        await mongoConnection()
        await loadPlanetsData() // Load planets data for running tests via cicd
    })

    // Disconnects to mongo after all test executions
    afterAll(async () => {
        await mongoDisconnect()
    })

    describe('Test GET /launches', () => {
        /* check response by calling the endpoint */
        test('It should respond with 200 success', async () => {
            await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200)
        })
    })

    describe('Test POST /launches', () => {
        let launchRequest = {
            mission: 'Kepler Expoloration XII',
            rocket: 'Explorer IS2',
            launchDate: 'July 15, 2024',
            target: 'Kepler-442 b',
        }

        /* check response by calling the endpoint */
        test('It should respond with 201 created', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchRequest)
                .expect('Content-Type', /json/)
                .expect(201)

            /* check if inserted request launch date matches response launch date (in different formatted) */
            const reqLaunchDate = new Date(launchRequest.launchDate).valueOf()
            const resLaunchDate = new Date(
                response.body.data.launchDate
            ).valueOf()

            expect(resLaunchDate).toEqual(reqLaunchDate)

            /* check if the request has been inserted in the data array in response body (removing the date as date have different formatting) */
            delete launchRequest.launchDate
            
            /* Matches objects of response vs object from the request */
            // expect(response.body.data[1]).toMatchObject(launchRequest)
        })

        test('It should catch missing required properties', async () => {
            delete launchRequest.launchDate

            const response = await request(app)
                .post('/v1/launches')
                .send(launchRequest)
                .expect('Content-Type', /json/)
                .expect(400)

            expect(response.body).toStrictEqual({
                message: 'Invalid request',
            })
        })
    })

    describe('Test DELETE /launches', () => {
        test('It should return 200 success', async () => {
            let latestLaunch = getLatestFlightNumber()
            let response = await request(app)
                .delete(`/v1/launches/${latestLaunch}`)
                .expect('Content-Type', /json/)
                .expect(200)

            expect(response.body).toMatchObject({
                upcoming: false,
                success: false,
            })
        })

        test('It should return 404 not found', async () => {
            await request(app)
                .delete('/v1/launches/123232323232223323')
                .expect('Content-Type', /json/)
                .expect(404)
        })
    })
})