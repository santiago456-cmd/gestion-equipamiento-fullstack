import pino from "pino";
import { trace } from "@opentelemetry/api";
import { requestContext } from "../middlewares/requestContext.js";

const isProduction = process.env.NODE_ENV === "production";
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318";

const targets: pino.TransportTargetOptions[] = [
  isProduction
    ? { target: "pino/file", options: { destination: 1 }, level: process.env.LOG_LEVEL || "info" }
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname" },
        level: process.env.LOG_LEVEL || "debug",
      },
  {
    target: "pino-opentelemetry-transport",
    options: {
      logRecordProcessorOptions: {
        exporterOptions: {
          protocol: "http",
          url: `${otlpEndpoint}/v1/logs`,
        },
      },
    },
    level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  },
];

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  transport: { targets },
  mixin() {
    const store = requestContext.getStore();
    const spanContext = trace.getActiveSpan()?.spanContext();

    return {
      ...(store?.requestId ? { requestId: store.requestId } : {}),
      ...(spanContext ? { traceId: spanContext.traceId, spanId: spanContext.spanId } : {}),
    };
  },
});