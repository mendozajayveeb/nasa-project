const http = require('http')

require('dotenv').config()

const app = require('./app')
const { mongoConnection } = require('./services/mongo')
const { loadPlanetsData } = require('./models/planets.model')
const { loadLaunchesData } = require('./models/launches.model')

const PORT = process.env.PORT || 8000

const server = http.createServer(app)

const startServer = async () => {
    await mongoConnection()
    await loadPlanetsData()
    await loadLaunchesData()

    server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
}

startServer()


