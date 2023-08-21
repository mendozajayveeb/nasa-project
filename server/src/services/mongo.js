const mongoose = require('mongoose')

require('dotenv').config()

const MONGO_URL = process.env.MONGO_URL

mongoose.connection.once('open', () => console.log('MongoDB connection ready.'))
mongoose.connection.once('error', (err) => console.error(err))

async function mongoConnection() {
    await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
    await mongoose.disconnect()
}

module.exports = {
    mongoConnection,
    mongoDisconnect,
}