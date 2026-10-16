'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { LEVELS } = require('../shared/levels.js');
const ids = Object.keys(LEVELS);
assert.equal(ids.length, 35, 'expected 35 playable level definitions');
for (const [id, L] of Object.entries(LEVELS)) {
  assert.ok(Array.isArray(L.map) && L.map.length > 0, `${id}: map exists`);
  const H=L.map.length, W=L.map[0].length;
  assert.ok(W>0 && L.map.every(r=>r.length===W), `${id}: rectangular map`);
  const inside=(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<W&&y<H;
  const walk=(x,y)=>inside(x,y)&&!['#','P','D'].includes(L.map[y][x]);
  assert.ok(inside(L.start.cx,L.start.cy), `${id}: start in map`);
  assert.ok(walk(L.start.cx,L.start.cy), `${id}: start cell is walkable`);
  const q=[[L.start.cx,L.start.cy]], seen=new Set([L.start.cy*W+L.start.cx]);
  for(let i=0;i<q.length;i++){
    const [x,y]=q[i];
    for(const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){
      const k=ny*W+nx;if(walk(nx,ny)&&!seen.has(k)){seen.add(k);q.push([nx,ny]);}
    }
  }
  assert.ok(seen.has(L.exit.cy0*W+L.exit.cx)||seen.has(L.exit.cy1*W+L.exit.cx), `${id}: exit reachable`);
  for(const [kind, arr] of [['item',L.items||[]],['note',L.notes||[]]]) for(let i=0;i<arr.length;i++){
    const p=arr[i];assert.ok(inside(p.cx,p.cy),`${id}: ${kind} ${i} in map`);
    assert.ok(walk(p.cx,p.cy),`${id}: ${kind} ${i} walkable at ${p.cx},${p.cy}`);
    assert.ok(seen.has(p.cy*W+p.cx),`${id}: ${kind} ${i} reachable`);
  }
  for(const z of L.toxicZones||[]) for(let y=z.y1;y<=z.y2;y++)for(let x=z.x1;x<=z.x2;x++)assert.ok(inside(x,y)&&L.map[y][x]!=='#',`${id}: toxic zone must not be inside wall at ${x},${y}`);
}
assert.equal(LEVELS.level9.next,'level9b','Poolrooms floor 1 leads to floor 2');
assert.equal(LEVELS.level9b.next,'level10','Poolrooms floor 2 leads onward');
assert.equal(LEVELS.sanctuary.safe,true,'sanctuary must be safe');
assert.equal(LEVELS.glitchshop.safe,true,'glitch shop must not spawn entities');
const aiSource=fs.readFileSync(path.join(__dirname,'../src/levelManager.js'),'utf8');
for(const kind of ['stalker','blink','water','patrol','sound','shy','ambush'])assert.ok(aiSource.includes(`kind:'${kind}'`),`AI profile ${kind} exists`);
assert.ok(aiSource.includes("p.crouch?.38:p.run?1.65:1"),'crouch/run noise affects AI hearing');
assert.ok(aiSource.includes("ch!=='P'&&ch!=='D'"),'AI path planner routes around props');
const mainSource=fs.readFileSync(path.join(__dirname,'../src/main.js'),'utf8');
for(const id of ['true','alone','loop','sacrifice','guardian','truth','corrupt','fake'])assert.ok(mainSource.includes(`case'${id}'`),`ending gate ${id} exists`);
assert.ok(mainSource.includes('열쇠 메모 4개 이상'),'truth ending has a real collectible requirement');
assert.ok(mainSource.includes("if(!e){UI.toast('알 수 없는 엔딩입니다.'"),'unknown ending IDs are rejected instead of falling back to true ending');
assert.ok(mainSource.includes("const e=all[id];"),'ending lookup must use the requested ending ID only');
console.log(`PASS: ${ids.length} levels; map reachability, objective placement, toxic zones, AI profile variety, stealth noise, and all 8 ending gates validated.`);
