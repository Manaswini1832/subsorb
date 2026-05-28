import express from 'express';
import client from 'prom-client'
import dotenv from 'dotenv';
import logger from './logger.js'
dotenv.config();

const app = express();

export const restResponseTimeHistogram = new client.Histogram({
    name : 'rest_response_time_duration_seconds',
    help : 'REST API response time in seconds',
    labelNames : ['method', 'route', 'statusCode']
})

export const databaseResponseTimeHistogram = new client.Histogram({
    name : 'database_response_time_duration_seconds',
    help : 'Database response time in seconds',
    labelNames : ['operation', 'success']
})

export function metricsServer(){

    const collectDefaultMetrics = client.collectDefaultMetrics;
    collectDefaultMetrics();

    app.get('/metrics', async(req, res) => {
        res.set("Content-type", client.register.contentType)
        return res.send(
            await client.register.metrics()
        )
    })

    app.listen(process.env.SERVER_METRICS_PORT, "127.0.0.1", () => {
        logger.info('Metrics server up and running')
    })
}