import process from 'node:process';
import {ensurePostgresMigrations} from '../lib/ensure-postgres-migrations.mjs';

const result=await ensurePostgresMigrations(process.env);
if(result.status==='error')process.exitCode=1;
