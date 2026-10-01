import fs from 'node:fs/promises';import http from 'node:http';
const file=new URL('../pl-platform-questions.html',import.meta.url);
http.createServer(async(req,res)=>{if(!['/','/pl-platform-questions.html'].includes(req.url)){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(await fs.readFile(file));}).listen(8845,'127.0.0.1');
