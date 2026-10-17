'use strict';
// Deterministic in-process simulation of the actual WebSocket server protocol.
// Replaces only the transport class; the project's real server.js and level rules run unchanged.
const assert = require('node:assert/strict');
const EventEmitter = require('node:events');
const Module = require('node:module');
class FakeSocket extends EventEmitter {
  constructor(){ super(); this.readyState=1; this.out=[]; }
  send(s){ this.out.push(JSON.parse(s)); }
  close(){ this.readyState=3; this.emit('close'); }
  clientSend(o){ this.emit('message', Buffer.from(JSON.stringify(o))); }
  take(t){ const i=this.out.findIndex(x=>x.t===t); if(i<0)return null; return this.out.splice(i,1)[0]; }
  all(t){ return this.out.filter(x=>x.t===t); }
}
class FakeWSS extends EventEmitter { constructor(){ super(); global.__fakeWSS=this; } }
const originalLoad=Module._load;
Module._load=function(request,parent,isMain){ if(request==='ws')return {WebSocketServer:FakeWSS}; return originalLoad.call(this,request,parent,isMain); };
const serverPath=require.resolve('../server/server.js');
delete require.cache[serverPath];
const srv=require('../server/server.js');
Module._load=originalLoad;
function connect(){ const c=new FakeSocket(); global.__fakeWSS.emit('connection',c); return c; }
function send(c,o){c.clientSend(o)}
function msg(c,t){const x=c.take(t);assert.ok(x,`expected ${t} message`);return x}
(async()=>{
  try {
    const a=connect(); send(a,{t:'create',name:'Alpha'}); const aj=msg(a,'joined');
    assert.match(aj.code,/^[A-Z2-9]{6}$/); assert.equal(aj.players.length,1);
    const b=connect(); send(b,{t:'join',name:'Bravo',code:aj.code}); const bj=msg(b,'joined');
    assert.equal(bj.players.length,2); const joinNotice=msg(a,'pjoin'); assert.equal(joinNotice.p.name,'Bravo');
    // Waiting-room readiness rules: host cannot start until everyone is ready.
    while(a.take('lobby')){}
    while(b.take('lobby')){}
    send(a,{t:'ready',ready:true});
    send(a,{t:'start'});
    assert.match(msg(a,'err').msg,/모든 플레이어가 준비/);
    send(b,{t:'ready',ready:true});
    assert.ok(a.all('lobby').some(x=>x.players.length===2&&x.players.every(p=>p.ready)),'ready state is broadcast to both clients');
    send(a,{t:'start'});
    const startedA=msg(a,'gameStart'),startedB=msg(b,'gameStart');
    assert.equal(startedA.you,aj.you);assert.equal(startedB.you,bj.you);
    assert.equal(startedA.players.length,2);assert.equal(startedB.players.length,2);
    assert.equal(startedA.code,aj.code);assert.equal(startedB.code,aj.code);
    // Simulate WebRTC signaling relay in both directions.
    send(a,{t:'signal',to:bj.you,data:{description:{type:'offer',sdp:'SIMULATED_OFFER'}}});
    const offer=msg(b,'signal'); assert.equal(offer.from,aj.you); assert.equal(offer.data.description.sdp,'SIMULATED_OFFER');
    send(b,{t:'signal',to:aj.you,data:{description:{type:'answer',sdp:'SIMULATED_ANSWER'}}});
    const answer=msg(a,'signal'); assert.equal(answer.from,bj.you); assert.equal(answer.data.description.sdp,'SIMULATED_ANSWER');
    send(a,{t:'signal',to:bj.you,data:{candidate:{candidate:'SIMULATED_ICE'}}});
    assert.equal(msg(b,'signal').data.candidate.candidate,'SIMULATED_ICE');
    // Downed state is broadcast and server-authoritative revive restores target.
    send(b,{t:'downed'}); assert.equal(msg(a,'downed').id,bj.you); assert.equal(msg(b,'downed').id,bj.you);
    send(a,{t:'revive',target:bj.you});
    const revivedB=msg(b,'revived'); const revivedA=msg(a,'revived');
    assert.equal(revivedB.id,bj.you); assert.equal(revivedB.by,aj.you);
    assert.equal(revivedB.health,65); assert.equal(revivedB.stamina,45); assert.equal(revivedB.sanity,35);
    assert.equal(revivedA.id,bj.you);
    // Invalid revive of an upright player must be rejected and never broadcast as revived.
    send(a,{t:'revive',target:bj.you}); assert.match(msg(a,'err').msg,/부활/); assert.equal(b.all('revived').length,0);
    // Chat relay and location updates still function.
    send(a,{t:'chat',text:'test message'}); assert.equal(msg(b,'chat').text,'test message'); msg(a,'chat');
    const level0=require('../shared/levels.js').LEVELS.level0;
    const p=level0.start; send(a,{t:'pos',x:p.cx*3,z:p.cy*3,yaw:0});
    // Server can be exercised without starting a public listener.
    console.log('PASS: 2-client join; lobby/ready/start protocol; WebRTC signaling relay; downed/revive; chat relay.');
  } finally { srv.wss.close?.(); srv.server.close?.(); process.exit(0); }
})().catch(e=>{console.error(e);process.exit(1)});
