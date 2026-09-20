import { revokeSession } from '../../../auth/session';
import { trustedOrigin, failure } from '../../../request-security';
export async function POST(req:Request) {
  if(!trustedOrigin(req)) return Response.json({error:'Origem não permitida.'},{status:403});
  try { await revokeSession(); return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}}); }
  catch(e) { return failure(e,'logout'); }
}
