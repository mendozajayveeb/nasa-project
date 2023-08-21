const express = require('express')

const {
    httpGetAllLaunches,
    httpPostLaunches,
    httpDeleteLaunches,
} = require('./launches.controller')

const launchesRouter = express.Router()

launchesRouter.get('/', httpGetAllLaunches)
launchesRouter.post('/', httpPostLaunches)
launchesRouter.delete('/:id', httpDeleteLaunches)

module.exports = launchesRouter

