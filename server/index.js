import express from 'express'

import {router as channelRoutes} from './routes/channelRoutes.js'
import {router as collectionRoutes} from './routes/collectionRoutes.js'

const app = express()
app.use(express.json())
app.use('/api/v1/channels', channelRoutes)
app.use('/api/v1/collections', collectionRoutes)

app.listen(process.env.SERVER_PORT, () => {
    console.log("App listening")
}) 