import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {validateProductionConfig} from '../lib/production-config.mjs';
test('produção exige HTTPS, banco e armazenamento configurados',()=>{
  assert.throws(()=>validateProductionConfig({}),/Configure/);
  const env={APP_URL:'https://example.test',DATABASE_URL:'postgresql://user@database/portal',DATABASE_SSL:'false',RATE_LIMIT_HMAC_SECRET:randomBytes(32).toString('hex'),S3_ENDPOINT:'https://storage.example.test',S3_BUCKET:'private',S3_ACCESS_KEY_ID:'example',S3_SECRET_ACCESS_KEY:'example'};
  assert.doesNotThrow(()=>validateProductionConfig(env));
  for(const change of [{APP_URL:'http://example.test'},{DATABASE_URL:'sqlite:///file'},{RATE_LIMIT_HMAC_SECRET:'short'},{S3_ENDPOINT:'http://storage.example.test'},{DATABASE_SSL:''}])assert.throws(()=>validateProductionConfig({...env,...change}));
});
