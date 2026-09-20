import { checkProductionDb } from '../../../../db/postgres';
import { checkStorage } from '../../../storage/s3';
export const dynamic='force-dynamic';
export async function GET(){
  try{await Promise.all([checkProductionDb(),checkStorage()]);return Response.json({status:'ready'},{headers:{'Cache-Control':'no-store'}});}
  catch{return Response.json({status:'unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
