// NO REAL NO HERE 멀티플레이 서버: 정적 파일 + WebSocket. 퍼즐/문/아이템 상태는 서버가 최종 결정한다.
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {WebSocketServer}=require('ws');const {Rules,LEVELS}=require('../shared/levels.js');
const PORT=+process.env.PORT||8080,MAXV=+process.env.MAX_SPEED||7,ROOT=path.join(__dirname,'..'),MAXP=+process.env.MAX_PLAYERS||4;
const MIME={'.html':'text/html;charset=utf-8','.css':'text/css','.js':'text/javascript','.md':'text/plain;charset=utf-8'};
const ALLOW=/^(index\.html|style\.css|src\/[\w.]+\.js|libs\/[\w.]+\.js|shared\/[\w.]+\.js)$/;
const server=http.createServer((req,res)=>{let u=decodeURIComponent((req.url||'/').split('?')[0]);if(u==='/health'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});return res.end(JSON.stringify({ok:true,service:'no-real-no-here',rooms:rooms.size,uptime:Math.floor(process.uptime())}));}if(u==='/')u='/index.html';const rel=u.replace(/^\/+/,'');
 if(!ALLOW.test(rel)){res.writeHead(404);return res.end('not found')}fs.readFile(path.join(ROOT,rel),(e,b)=>{if(e){res.writeHead(404);return res.end('not found')}res.writeHead(200,{'Content-Type':MIME[path.extname(rel)]||'application/octet-stream'});res.end(b)})});
const wss=new WebSocketServer({server,maxPayload:2048});
const rooms=new Map(),A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let nid=1;
const newCode=()=>{for(;;){const b=crypto.randomBytes(6);let s='';for(const x of b)s+=A[x%32];if(!rooms.has(s))return s}};
const send=(ws,o)=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))};
const bc=(r,o,ex)=>{for(const p of r.players.values())if(p.ws&&p.id!==ex)send(p.ws,o)};
const clean=s=>String(s==null?'':s).replace(/[<>&"'`\u0000-\u001f]/g,'').trim().slice(0,12)||'Player';
const LV=r=>LEVELS[r.level],ST=r=>r.states[r.level];
const ensure=(r,id)=>r.states[id]||(r.states[id]=Rules.mkState(crypto.randomBytes(4).readUInt32BE()&0x7fffffff));
const view=r=>{const st=ST(r),texts={};st.notes.forEach(i=>texts[i]=Rules.noteText(LV(r),st,i));return{notes:st.notes,items:st.items,solved:st.solved,texts}};
const pub=p=>({id:p.id,name:p.name,slot:p.slot,online:!!p.ws,x:p.x,z:p.z,yaw:p.yaw,downed:!!p.downed});
const spawn=(r,p)=>{const s=Rules.startPt(LV(r));p.x=s[0]+(p.slot%2)*.8;p.z=s[1];p.yaw=LV(r).start.yaw;p.pt=Date.now()};
const dist=(p,q)=>Math.hypot(p.x-q[0],p.z-q[1]);
function joined(r,p,re){return{t:'joined',re:!!re,code:r.code,you:p.id,token:p.token,slot:p.slot,host:r.host,level:r.level,state:view(r),players:[...r.players.values()].map(q=>({...pub(q),host:q.id===r.host}))}}
function addPlayer(r,ws,name){const used=new Set([...r.players.values()].map(p=>p.slot));let slot=0;while(used.has(slot))slot++;
 const p={id:String(nid++),token:crypto.randomBytes(12).toString('hex'),name:clean(name),slot,ws,dc:0,bucket:60,bt:Date.now(),sub:0,wrong:0,lockUntil:0,downed:false};spawn(r,p);r.players.set(p.id,p);if(!r.host)r.host=p.id;return p}
function removePlayer(r,p){r.players.delete(p.id);bc(r,{t:'pleave',id:p.id});if(r.host===p.id){const n=r.players.keys().next().value||null;r.host=n;if(n)bc(r,{t:'phost',id:n})}if(!r.players.size)rooms.delete(r.code)}
wss.on('connection',ws=>{let room=null,pl=null;ws.on('error',()=>{});
 ws.on('message',buf=>{let m;try{m=JSON.parse(buf.toString())}catch(e){return}if(!m||typeof m!=='object'||typeof m.t!=='string')return;const now=Date.now();
  if(pl){pl.bucket=Math.min(60,pl.bucket+(now-pl.bt)/1000*40);pl.bt=now;if(--pl.bucket<0)return}
  if(!pl){ // 방 입장 전에 허용되는 메시지
   if(m.t==='create'){room={code:newCode(),level:'level0',states:{},players:new Map(),host:null,dead:0};rooms.set(room.code,room);ensure(room,'level0');pl=addPlayer(room,ws,m.name);send(ws,joined(room,pl))}
   else if(m.t==='join'){const r=typeof m.code==='string'&&/^[A-Z2-9]{6}$/.test(m.code)&&rooms.get(m.code);if(!r)return send(ws,{t:'err',msg:'잘못된 방 코드입니다'});
    if(r.players.size>=MAXP)return send(ws,{t:'err',msg:'방이 가득 찼습니다 (최대 '+MAXP+'명)'});room=r;pl=addPlayer(r,ws,m.name);send(ws,joined(r,pl));bc(r,{t:'pjoin',p:{...pub(pl),host:false}},pl.id)}
   else if(m.t==='rejoin'){const r=typeof m.code==='string'&&rooms.get(m.code),p=r&&[...r.players.values()].find(q=>typeof m.token==='string'&&q.token===m.token);
    if(!p)return send(ws,{t:'err',msg:'재접속할 수 없습니다 (방이 사라졌거나 시간이 지남)'});if(p.ws&&p.ws!==ws)try{p.ws.close()}catch(e){}room=r;pl=p;p.ws=ws;p.dc=0;send(ws,joined(r,p,true));bc(r,{t:'pstate',id:p.id,online:true},p.id)}
   return}
  const L=LV(room),st=ST(room);
  switch(m.t){
   case'chat':{if(typeof m.text!=='string')return;const text=m.text.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,180);if(!text)return;bc(room,{t:'chat',id:pl.id,name:pl.name,text,at:now});send(ws,{t:'chat',id:pl.id,name:pl.name,text,at:now});break}
   case'signal':{if(typeof m.to!=='string'||!room.players.has(m.to)||!m.data||typeof m.data!=='object')return;const target=room.players.get(m.to);if(target&&target.ws)send(target.ws,{t:'signal',from:pl.id,data:m.data});break}
   case'teleport':{if(pl.downed)return send(ws,{t:'err',msg:'쓰러진 동안에는 순간이동할 수 없다'});if(typeof m.target!=='string'||!room.players.has(m.target)||m.target===pl.id)return;const target=room.players.get(m.target);if(!target||!target.ws||target.downed)return;const x=target.x+((pl.slot%2)?1.1:-1.1),z=target.z+0.8;if(Rules.solidAt(L,st,x,z))return send(ws,{t:'err',msg:'팀원 주변에 안전한 공간이 없다'});pl.x=x;pl.z=z;pl.pt=now;send(ws,{t:'teleport',id:pl.id,x,z});bc(room,{t:'pos',p:[{id:pl.id,x,z,yaw:pl.yaw}]});break}
   case'downed':{if(pl.downed)return;pl.downed=true;pl.x=Number.isFinite(pl.x)?pl.x:0;const o={t:'downed',id:pl.id,x:pl.x,z:pl.z};bc(room,o,pl.id);send(ws,o);break}
   case'revive':{if(pl.downed)return send(ws,{t:'err',msg:'쓰러진 동안에는 십자가를 사용할 수 없다'});if(typeof m.target!=='string'||!room.players.has(m.target)||m.target===pl.id)return;const target=room.players.get(m.target);if(!target||!target.downed||!target.ws)return send(ws,{t:'err',msg:'부활이 필요한 쓰러진 팀원이 없다'});const sp=Rules.startPt(L);target.x=sp[0]+(target.slot%2)*.8;target.z=sp[1];target.yaw=L.start.yaw;target.pt=now;target.downed=false;const o={t:'revived',id:target.id,by:pl.id,x:target.x,z:target.z,health:65,stamina:45,sanity:35};send(target.ws,o);bc(room,o,target.id);break}
   case'pos':{if(pl.downed)return send(ws,{t:'snap',x:pl.x,z:pl.z});const x=m.x,z=m.z,y=m.yaw;if(![x,z,y].every(Number.isFinite)||Math.abs(x)>1000||Math.abs(z)>1000)return;const dt=Math.min(2000,Math.max(50,now-pl.pt));
    if(Rules.solidAt(L,st,x,z)||Math.hypot(x-pl.x,z-pl.z)>MAXV*dt/1000+1.5){return send(ws,{t:'snap',x:pl.x,z:pl.z})}pl.x=x;pl.z=z;pl.yaw=y;pl.pt=now;pl.dirty=true;break}
   case'note':{const i=m.i;if(!Number.isInteger(i)||i<0||i>=L.notes.length)return;if(dist(pl,Rules.cellPos(L.notes[i]))>3.8)return;
    const first=Rules.collectNote(L,st,i),o={t:'note',lv:room.level,i,text:Rules.noteText(L,st,i),by:pl.id};if(first)bc(room,o);else send(ws,{...o,dup:true});break}
   case'item':{const i=m.i;if(!Number.isInteger(i)||i<0||i>=L.items.length)return;if(dist(pl,Rules.cellPos(L.items[i]))>3.8)return;if(Rules.collectItem(L,st,i))bc(room,{t:'item',lv:room.level,i,by:pl.id});break}
   case'submit':{const p=L.puzzles.find(q=>q.id===m.pid);if(!p||p.type!=='code')return;if(dist(pl,Rules.puzzlePt(p))>4)return send(ws,{t:'wrong',pid:p.id,msg:'키패드에서 너무 멀다'});
    if(now<pl.lockUntil)return send(ws,{t:'wrong',pid:p.id,msg:'오답이 많아 잠시 입력할 수 없다'});if(now-pl.sub<500)return send(ws,{t:'wrong',pid:p.id,msg:'너무 빠르다'});pl.sub=now;
    const r=Rules.submit(L,st,p.id,m.ans);if(r==='ok')bc(room,{t:'solved',lv:room.level,pid:p.id,by:pl.id});else if(r==='already')send(ws,{t:'solved',lv:room.level,pid:p.id,by:pl.id});
    else{if(r==='wrong'&&++pl.wrong>=6){pl.wrong=0;pl.lockUntil=now+15000}send(ws,{t:'wrong',pid:p.id})}break}
   case'breaker':{const p=L.puzzles.find(q=>q.id===m.pid);if(!p||p.type!=='items')return;if(dist(pl,Rules.puzzlePt(p))>4)return;const r=Rules.useBreaker(L,st,p.id);
    if(r==='ok')bc(room,{t:'solved',lv:room.level,pid:p.id,by:pl.id});else if(r==='need')send(ws,{t:'need',pid:p.id,have:st.items.length,need:p.need});else if(r==='already')send(ws,{t:'solved',lv:room.level,pid:p.id,by:pl.id});break}
   case'exit':{if(!Rules.doorOpen(L,st,'exit')||dist(pl,Rules.exitPt(L))>5)return;if(!L.next)return bc(room,{t:'end'});
    room.level=L.next;ensure(room,room.level);for(const q of room.players.values())spawn(room,q);bc(room,{t:'level',id:room.level,state:view(room)});break}
   case'leave':removePlayer(room,pl);room=null;pl=null;break}});
 ws.on('close',()=>{if(room&&pl&&pl.ws===ws){pl.ws=null;pl.dc=Date.now();bc(room,{t:'pstate',id:pl.id,online:false})}})});
setInterval(()=>{for(const r of rooms.values()){const ch=[];for(const p of r.players.values())if(p.dirty){p.dirty=false;ch.push({id:p.id,x:+p.x.toFixed(2),z:+p.z.toFixed(2),yaw:+p.yaw.toFixed(2)})}if(ch.length)bc(r,{t:'pos',p:ch})}},100);
setInterval(()=>{const now=Date.now();for(const r of [...rooms.values()])for(const p of [...r.players.values()])if(!p.ws&&p.dc&&now-p.dc>30000)removePlayer(r,p)},5000);
if(require.main===module)server.listen(PORT,'0.0.0.0',()=>console.log('NO REAL NO HERE server on :'+PORT));
module.exports={server,wss,rooms};
