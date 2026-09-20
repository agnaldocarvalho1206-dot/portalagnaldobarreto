import {validateProductionConfig} from '../lib/production-config.mjs';
try {validateProductionConfig();console.log('Configuração de produção válida. Valores não exibidos.');}
catch(error){console.error(error.message);process.exitCode=1;}
