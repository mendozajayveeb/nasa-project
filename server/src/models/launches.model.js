const axios = require('axios')

const launchesDb = require('./launches.mongo')
const planetsDb = require('./planets.mongo')

const defaultFlightNumber = 100
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches() {
    console.log('Downloading launches...')
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1,
                    },
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1,
                    },
                },
            ],
        },
    })

    if(response.status !== 200) {
        console.log('Failed to download launches data.')
        throw new Error('Download launches data failed.')
    }

    const launchDocs = response.data.docs

    for (const launchDoc of launchDocs) {
        const payloads = launchDoc.payloads
        const customers = payloads.flatMap((payload) => payload.customers)

        const launch = {
            flightNumber: launchDoc.flight_number,
            mission: launchDoc.name,
            rocket: launchDoc.rocket.name,
            launchDate: launchDoc.date_local,
            upcoming: launchDoc.upcoming,
            success: launchDoc.success,
            customers,
        }
        
        await saveLaunch(launch)
    }
}

async function findLaunch(filter) {
    return await launchesDb.findOne(filter)
}

async function loadLaunchesData() {
    const firstLaunch = await findLaunch({ 
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    })

    if(firstLaunch) {
        console.log('Launches data has already been loaded.')
    }
    else {
        await populateLaunches()
    }

}

async function isLaunchExists(id) {
    // console.log(id)
    return await findLaunch({ flightNumber: id })
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDb
        .findOne({})
        .sort('-flightNumber')

    if(!latestLaunch) {
        return defaultFlightNumber
    }

    return latestLaunch.flightNumber
}

async function getAllLaunches(skip, limit) {
    return await launchesDb
        .find({}, { _id: 0, __v: 0 })
        .skip(skip)
        .limit(limit)
        .sort({ flightNumber: 1})
}

async function getOneLaunch(id) {
    const query = {
        flightNumber: id,
    }

    return await findLaunch(query)
}

async function saveLaunch(launch) {
    return await launchesDb.findOneAndUpdate(
        {
            flightNumber: launch.flightNumber,
        },
        launch,
        {
            upsert: true,
        }
    )
}

async function scheduleNewLaunch(launch) {
    // Validate if planet from request body exists in planet db
    const planet = await planetsDb.findOne({ keplerName: launch.target })
    
    if (!planet) {
        throw new Error('No matching planets found.')
    }

    const flightNumber = await getLatestFlightNumber() + 1

    const newLaunch = Object.assign(launch, {
        flightNumber,
        success: true,
        upcoming: true,
        customers: ['Zero To Mastery', 'NASA']
    })

    await saveLaunch(newLaunch)

    // const launches = await launchesDb.find({}, { '_id': 0, '__v': 0 })

    const response = {
        message: 'Successfully added',
        data: launch
    }

    return response
}

async function removeLaunch(id) {
    await launchesDb.findOneAndUpdate({ flightNumber: id }, { upcoming: false, success: false })

    const abortedLaunch = await launchesDb.findOne({ flightNumber: id }, { '_id': 0, '__v': 0 })

    return abortedLaunch
}

module.exports = {
    loadLaunchesData,
    isLaunchExists,
    getAllLaunches,
    scheduleNewLaunch,
    removeLaunch,
    getOneLaunch,
}