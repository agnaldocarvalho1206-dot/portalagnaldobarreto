import {identity,rawDb,error} from '../../../server';
export async function GET(){
  const {admin}=await identity();
  if(!admin)return error('Acesso restrito.',403);
  const rows=await rawDb().prepare('SELECT email,created FROM subscribers ORDER BY created DESC LIMIT 10000').all();
  // Prefix spreadsheet formula triggers, including otherwise valid email local parts.
  const cell=(value:string)=>'"'+(/^[=+@\-\t\r]/.test(value)?"'":'')+value.replace(/"/g,'""')+'"';
  const csv='email;inscrito_em\r\n'+rows.results.map(r=>cell(r.email)+';'+cell(new Date(r.created).toISOString())).join('\r\n');
  return new Response('\uFEFF'+csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="inscritos.csv"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
