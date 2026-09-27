import { checkProductionDb } from '../../../../db/postgres';
import { checkStorage } from '../../../storage/s3';
import { checkSupabaseAuth } from '../../../../lib/supabase/health';
import { classifyDatabaseFailure, classifyStorageFailure, describeStorageEndpoint } from '../../../../lib/health-diagnostics';

export const dynamic='force-dynamic';

export async function GET(){
  const results=await Promise.allSettled([
    checkProductionDb(),
    checkStorage(),
    checkSupabaseAuth(),
  ]);

  const checks={
    database:results[0].status==='fulfilled'?'ok':'unavailable',
    storage:results[1].status==='fulfilled'?'ok':'unavailable',
    auth:results[2].status==='fulfilled'?'ok':'unavailable',
  } as const;

  const diagnostics={
    database:results[0].status==='fulfilled'?'ok':classifyDatabaseFailure(results[0].reason),
    storage:results[1].status==='fulfilled'?'ok':classifyStorageFailure(results[1].reason),
    auth:results[2].status==='fulfilled'?'ok':'unavailable',
  } as const;

  const ready=Object.values(checks).every(value=>value==='ok');
  return Response.json(
    {status:ready?'ready':'unavailable',checks,diagnostics,storageEndpoint:describeStorageEndpoint(process.env.S3_ENDPOINT)},
    {status:ready?200:503,headers:{'Cache-Control':'no-store'}},
  );
}
