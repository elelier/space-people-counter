#!/bin/bash
# Script para limpiar el caché de Next.js después del build
# Requerido para Cloudflare Pages (límite de 25 MiB)

CACHE_DIR=".next/cache"

if [ -d "$CACHE_DIR" ]; then
  echo "Cleaning $CACHE_DIR directory..."
  rm -rf "$CACHE_DIR"
  echo "✓ Cache directory cleaned successfully"
else
  echo "No cache directory found"
fi

echo "Build completed successfully"
