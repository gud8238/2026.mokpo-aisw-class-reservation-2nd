import {mkdir,cp,writeFile,readFile} from 'node:fs/promises';
await mkdir('dist/src',{recursive:true});
await cp('src','dist/src',{recursive:true});
await cp('index.html','dist/index.html');
const env=await readFile('.env','utf8').catch(()=>'');
const value=process.env.VITE_GAS_URL||env.match(/^VITE_GAS_URL=(.*)$/m)?.[1]?.trim()||'';
await writeFile('dist/config.js',`window.APP_CONFIG = ${JSON.stringify({gasUrl:value}).replace(/</g,'\\u003c')};\n`);
console.log('Built dist/',value?'GAS endpoint configured':'GAS endpoint missing');
