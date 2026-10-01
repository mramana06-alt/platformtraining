import fs from 'node:fs/promises';import {parseEnv} from 'node:util';
const root=new URL('../',import.meta.url),env=parseEnv(await fs.readFile(new URL('.env',root),'utf8'));
const file='D:/ai/platformloops-r3/.env',old=await fs.readFile(file,'utf8');try{await fs.writeFile(new URL('.local/pl-env-before-training',root),old,{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;}
let next=old;for(const [key,value]of Object.entries({TRAINING_SERVICE_URL:'http://127.0.0.1:8840',TRAINING_SIGNING_SECRET:env.TRAINING_SIGNING_SECRET})){const re=new RegExp('^'+key+'=.*$','m');next=re.test(next)?next.replace(re,key+'='+value):next+'\n'+key+'='+value;}
await fs.writeFile(file,next+'\n');console.log('Configured private PL-to-training connection; secrets not displayed');
