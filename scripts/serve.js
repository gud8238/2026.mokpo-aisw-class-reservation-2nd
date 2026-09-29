import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve} from 'node:path';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
http.createServer(async(req,res)=>{
  const path=resolve('dist','.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!path.startsWith(resolve('dist')+'/')&&path!==resolve('dist')){res.writeHead(403).end();return}
  try{const content=await readFile(path.endsWith('/dist')?resolve('dist/index.html'):path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'}).end(content)}catch{res.writeHead(404).end('Not found')}
}).listen(4173,'0.0.0.0',()=>console.log('Preview: http://localhost:4173'));
