import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';

const explicit=[
  process.env.PORTAL_RELEASE_SHA,
  process.env.GITHUB_SHA,
  process.env.SOURCE_COMMIT,
  process.env.COMMIT_SHA,
].find(value=>typeof value==='string'&&value.trim());

const builtAt=new Date().toISOString();
const buildId=explicit?.trim()||('build-'+Date.now());

await mkdir('public',{recursive:true});
await writeFile(
  'public/build-info.json',
  JSON.stringify({buildId,builtAt},null,2)+'\n',
  'utf8',
);
console.log(JSON.stringify({event:'build_marker_written',buildId}));
