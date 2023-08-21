const express = require('express')

const {
    httpGetAllLaunches,
    httpPostLaunches,
    httpDeleteLaunches,
    httpGetOneLaunch,
} = require('./launches.controller')

const launchesRouter = express.Router()

launchesRouter.get('/', httpGetAllLaunches)
launchesRouter.post('/', httpPostLaunches)
launchesRouter.get('/:id', httpGetOneLaunch)
launchesRouter.delete('/:id', httpDeleteLaunches)

module.exports = launchesRouter

