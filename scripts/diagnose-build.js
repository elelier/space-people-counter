#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar que todo está listo para Cloudflare Pages
 * Uso: node scripts/diagnose-build.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico de construcción para Cloudflare Pages\n');

const checks = [
  {
    name: '.npmrc existe',
    check: () => fs.existsSync('.npmrc'),
    description: 'Archivo de configuración de npm para legacy-peer-deps'
  },
  {
    name: '.cfignore existe',
    check: () => fs.existsSync('.cfignore'),
    description: 'Archivo de ignore para Cloudflare Pages'
  },
  {
    name: 'public/ existe',
    check: () => fs.existsSync('public'),
    description: 'Directorio de assets estáticos'
  },
  {
    name: 'src/app/page.tsx existe',
    check: () => fs.existsSync('src/app/page.tsx'),
    description: 'Página principal'
  },
  {
    name: 'API routes configuradas',
    check: () => {
      const apiDir = 'src/app/api';
      return fs.existsSync(apiDir) && 
             fs.existsSync(path.join(apiDir, 'space-people')) &&
             fs.existsSync(path.join(apiDir, 'iss-location')) &&
             fs.existsSync(path.join(apiDir, 'health'));
    },
    description: '/api/space-people, /api/iss-location, /api/health'
  },
  {
    name: 'public/_headers existe',
    check: () => fs.existsSync('public/_headers'),
    description: 'Headers de seguridad para Cloudflare'
  },
  {
    name: 'rimraf instalado',
    check: () => fs.existsSync('node_modules/rimraf'),
    description: 'Para limpiar caché después del build'
  }
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  const result = check.check();
  const symbol = result ? '✅' : '❌';
  const status = result ? 'PASS' : 'FAIL';
  
  if (result) passed++;
  else failed++;
  
  console.log(`${symbol} ${check.name.padEnd(35)} | ${status}`);
  console.log(`   └─ ${check.description}\n`);
});

console.log(`\n📊 Resultados: ${passed} pasadas, ${failed} falló\n`);

if (failed === 0) {
  console.log('✨ ¡Todo listo para Cloudflare Pages!');
  process.exit(0);
} else {
  console.log('⚠️  Hay problemas que resolver');
  process.exit(1);
}
