import express from 'express'
import cors from 'cors'

import collectionRoutes from './routes/collectionRoutes.js'
import channelRoutes from './routes/channelRoutes.js'
import collectionChannelRoutes from './routes/collectionChannelRoutes.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/v1/collections', collectionRoutes)
app.use('/api/v1/channels', channelRoutes)
app.use('/api/v1/collection-channels', collectionChannelRoutes)

app.listen(process.env.SERVER_PORT, () => {
    console.log("App listening")
}) 