import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';

const logBuildTime = () => ({
  name: 'log-build-time',
  writeBundle() {
    const time = new Date().toLocaleTimeString();
    console.log(`\x1b[32m[${time}] Build completata con successo!\x1b[0m`);
  }
});

export default {
  input: 'src/simple-inventory-enhanced-card.js', // Il tuo file sorgente entry point
  output: {
    file: 'dist/simple-inventory-enhanced-card.js',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    json(),
    resolve(),
    terser({
      mangle: true,
      compress: true
    }),
    // Copia il file appena compilato in un'altra cartella
    copy({
      targets: [
        { 
          src: 'dist/simple-inventory-enhanced-card.js', 
          dest: '../config/www/community/simple-inventory-enhanced-card' // Modifica con il percorso reale
        }
      ],
      hook: 'writeBundle' // Esegue la copia solo dopo che il file finale è stato creato
    }),
    logBuildTime()
  ]
};