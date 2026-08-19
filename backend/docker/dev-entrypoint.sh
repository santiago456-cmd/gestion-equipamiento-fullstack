#!/bin/sh
set -e

echo "🔨 Compilación inicial de TypeScript..."
pnpm exec tsc

echo "👀 Iniciando tsc --watch en segundo plano..."
pnpm exec tsc --watch --preserveWatchOutput &

echo "🚀 Iniciando servidor con hot-reload..."
exec node --watch --import ./dist/instrumentation.js ./dist/app.js