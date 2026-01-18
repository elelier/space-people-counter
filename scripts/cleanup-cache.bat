@echo off
REM Script para limpiar el caché de Next.js después del build
REM Requerido para Cloudflare Pages (límite de 25 MiB)

setlocal enabledelayedexpansion

set "CACHE_DIR=.next\cache"

if exist "%CACHE_DIR%" (
  echo Cleaning %CACHE_DIR% directory...
  rmdir /s /q "%CACHE_DIR%"
  echo √ Cache directory cleaned successfully
) else (
  echo No cache directory found
)

echo Build completed successfully
