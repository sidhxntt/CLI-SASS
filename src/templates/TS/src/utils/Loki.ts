import { createLogger, transports } from "winston";
import LokiTransport from "winston-loki";

const logger = createLogger({
    transports: [
      new LokiTransport({
        host: "http://grafana-loki:3100",
        json: true,
        onConnectionError: (err) => console.error(err),
      }),
      new transports.Console(),
    ],
  });

export default logger;