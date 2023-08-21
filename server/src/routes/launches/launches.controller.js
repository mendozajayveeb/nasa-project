const {
    getAllLaunches,
    scheduleNewLaunch,
    removeLaunch,
    isLaunchExists,
    getOneLaunch,
} = require('../../models/launches.model')

const { getPagination } = require('../../services/query')

async function httpGetAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query)
    const launches = await getAllLaunches(skip, limit)
    return res.status(200).json(launches)
}

async function httpGetOneLaunch(req, res) {
    const id = req.params.id

    if (!(await isLaunchExists(id))) {
        return res.status(404).json({
            message: 'Mission not found',
        })
    }

    const launches = await getOneLaunch(id)
    return res.status(200).json(launches)
}

async function httpPostLaunches(req, res) {
    let request = req.body

    if (!request.mission || !request.rocket || !request.launchDate || !request.target ) {
        return res.status(400).json({
            message: "Invalid request"
        })
    }

    request.launchDate = new Date(request.launchDate)
    if(isNaN(request.launchDate)) {
        return res.status(400).json({
            message: 'Invalid request',
        })
    }

    const response = await scheduleNewLaunch(req.body)

    return res.status(201).json(response)
}

async function httpDeleteLaunches(req, res) {
    let request = req.params.id
    
    if(!await isLaunchExists(request)) {
        return res.status(404).json({
            message: 'Mission not found'
        })
    }

    return res.status(200).json(await removeLaunch(request))
}

module.exports = {
    httpGetAllLaunches,
    httpGetOneLaunch,
    httpPostLaunches,
    httpDeleteLaunches,
}