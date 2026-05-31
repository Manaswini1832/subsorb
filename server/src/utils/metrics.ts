import express, { Request, Response } from "express";
import client from "prom-client";
import dotenv from "dotenv";
import logger from "./logger.js";
dotenv.config();

const app = express();

export const restResponseTimeHistogram = new client.Histogram({
  name: "rest_response_time_duration_seconds",
  help: "REST API response time in seconds",
  labelNames: ["method", "route", "statusCode"],
});

export const databaseResponseTimeHistogram = new client.Histogram({
  name: "database_response_time_duration_seconds",
  help: "Database response time in seconds",
  labelNames: ["operation", "success"],
});

export function metricsServer(): void {
  client.collectDefaultMetrics();

  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", client.register.contentType);

    const metrics = await client.register.metrics();
    res.send(metrics);
  });

  const port = process.env.SERVER_METRICS_PORT
    ? Number(process.env.SERVER_METRICS_PORT)
    : 9100;

  app.listen(port, () => {
    logger.info(`Metrics server up and running on ${port}`);
  });
}
