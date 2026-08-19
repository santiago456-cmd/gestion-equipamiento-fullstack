import 'dotenv/config'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
    ATTR_DEPLOYMENT_ENVIRONMENT_NAME
} from '@opentelemetry/semantic-conventions'

console.log('[instrumentation.ts] Este archivo se está ejecutando');

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318'

const sdk = new NodeSDK({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: process.env.APP_NAME || 'api-solicitudes-equipamientos',
        [ATTR_SERVICE_VERSION]: '1.0.0',
        [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.NODE_ENV || 'development',
    }),
    traceExporter: new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`
    }),
    instrumentations: [
        getNodeAutoInstrumentations({
            // el instrumentador de filesistem genera mucho ruido, es por eso que lo desactivamos para no saturar las trazas con basura
            '@opentelemetry/instrumentation-fs': {enabled: false}
        })
    ]
})

sdk.start()

process.on('SIGTERM', () => {
    sdk.shutdown().finally(() => process.exit(0))
})