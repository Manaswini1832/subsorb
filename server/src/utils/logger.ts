import pino, { Logger } from "pino";

const logger: Logger = pino({
  level: "debug",
});

export default logger;
