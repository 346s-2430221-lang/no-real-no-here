const CS=3,WH=2.6,Rules=NRNH.Rules,DCH=Rules.DCH;
const Levels={defs:NRNH.LEVELS,scene:null,grp:null,lights:[],nl:5,panels:[],map:[],open:{},id:null,def:null,st:null,pI:null,dm:{},im:[],nm:[],coinMeshes:[],entity:null,_c:null,
 tex(w,draw,rx,ry){const c=document.createElement('canvas');c.width=c.height=w;draw(c.getContext('2d'),w);const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.anisotropy=Math.min(4,Game.R.capabilities.getMaxAnisotropy());return t},
 unload(){if(!this.grp)return;this.scene.remove(this.grp);this.grp.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)[].concat(o.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})});
  this.grp=null;this.panels=[];this.lights=[];this.pI=null;this.dm={};this.nm=[];this.im=[];this.coinMeshes=[];this.entity=null;this.open={}},
 load(id,scene){const d=this.defs[id];if(!d)throw new Error('level '+id);this.unload();this.scene=scene;this.id=id;this.def=d;this.st=Game.stateFor(id);const st=this.st;
  st.notes=st.notes.filter(i=>Number.isInteger(i)&&i>=0&&i<d.notes.length);st.items=st.items.filter(i=>Number.isInteger(i)&&i>=0&&i<d.items.length);
  this.grp=new THREE.Group();scene.add(this.grp);Interact.clear();this.map=d.map;const th=Rules.THEMES[d.theme||'yellow'];if(th){scene.background.setHex(th.fog);Game.fog.color.setHex(th.fog);Game.amb.color.set(th.amb);Game.hemi.color.set(th.ceil||0xd6d0a0);Game.hemi.groundColor.set(th.floor||0x24200e)}this.build(d,this.grp);this.refresh()},
 cell(x,z){const cx=Math.floor(x/CS),cz=Math.floor(z/CS);return[cx,cz,(this.map[cz]||'')[cx]||'#']},
 blocks(x,z){const c=this.cell(x,z)[2];return c==='#'||(!!DCH[c]&&!this.open[DCH[c]])},
 solid(x,z){const[cx,cz,c]=this.cell(x,z);if(c==='#')return true;if(DCH[c])return!this.open[DCH[c]];const dx=Math.abs(x-(cx+.5)*CS),dz=Math.abs(z-(cz+.5)*CS);
  if(c==='P')return dx<.6&&dz<.6;if(c==='D')return dx<.95&&dz<.55;return false},
 los(x0,z0,x1,z1){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/.25),tx=Math.floor(x1/CS),tz=Math.floor(z1/CS);
  for(let i=1;i<n;i++){const t=i/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;if(Math.floor(x/CS)===tx&&Math.floor(z/CS)===tz)continue;if(this.blocks(x,z))return false}return true},
 pathStep(x,z,tx,tz){
  const m=this.map,H=m.length,W=m[0]?m[0].length:0;if(!W||!H)return{x:tx,z:tz};
  const clamp=(v,max)=>Math.max(0,Math.min(max-1,v));
  const sx=clamp(Math.floor(x/CS),W),sy=clamp(Math.floor(z/CS),H),gx=clamp(Math.floor(tx/CS),W),gy=clamp(Math.floor(tz/CS),H);
  // Props are obstacles too; unlocked doors remain walkable. Permit the start cell in case the player/entity is standing at a prop edge.
  const walk=(cx,cy)=>{if(cx<0||cy<0||cx>=W||cy>=H)return false;const ch=(m[cy]||'')[cx]||'#';return ch!=='#'&&ch!=='P'&&ch!=='D'&&(!DCH[ch]||this.open[DCH[ch]])};
  const N=W*H,prev=new Int32Array(N);prev.fill(-2);const start=sy*W+sx,q=[start];prev[start]=-1;
  let best=start,bestD=(sx-gx)**2+(sy-gy)**2,goal=walk(gx,gy)?gy*W+gx:-1;
  for(let qi=0;qi<q.length;qi++){
   const id=q[qi],cx=id%W,cy=Math.floor(id/W),dd=(cx-gx)**2+(cy-gy)**2;
   if(dd<bestD){bestD=dd;best=id}if(id===goal)break;
   for(const [nx,ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]){
    if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(prev[ni]!==-2||(!walk(nx,ny)&&ni!==goal))continue;prev[ni]=id;q.push(ni);
   }
  }
  let target=goal>=0&&prev[goal]!==-2?goal:best;
  if(target===start){if(sx===gx&&sy===gy)return{x:tx,z:tz};return{x:(sx+.5)*CS,z:(sy+.5)*CS}}
  let cur=target;while(prev[cur]!==start&&prev[cur]>=0)cur=prev[cur];
  return{x:((cur%W)+.5)*CS,z:(Math.floor(cur/W)+.5)*CS};
 },
 zone(x,z){const c=this.cell(x,z);return this.def.zone(c[0],c[1])},
 dimMul(){const d=this.def;return d&&d.dim&&this.st?Math.max(.2,1-d.dim*this.st.notes.length):1},
 off(z){const w=Game.world();return!!(w&&w.env&&w.env['off_'+z])},
 refresh(){const d=this.def,st=this.st;for(const id of['d1','d2','x1','exit'])this.open[id]=Rules.doorOpen(d,st,id,Game.world());if(d.safe||d.id==='glitchshop')this.open.exit=true;
  for(const id in this.dm)this.dm[id].forEach(m=>m.visible=!this.open[id]);
  this.nm.forEach((m,i)=>m.material.emissive.setHex(st.notes.includes(i)?0:0x555533));this.im.forEach((m,i)=>m.visible=!st.items.includes(i));this.coinMeshes.forEach((m,i)=>m.visible=!(st.coins||[]).includes(i))},
 setShadows(size){const on=size>0;this.lights.forEach((l,i)=>{l.castShadow=on&&i===0;if(on&&i===0){l.shadow.mapSize.set(size,size);if(l.shadow.map){l.shadow.map.dispose();l.shadow.map=null}}});
  if(this.grp)this.grp.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)})},
 build(d,g){const m=this.map,W=m[0].length,D=m.length,st=this.st,L=this;this._c=new THREE.Color();
  const sp=(c,w,col,n,s)=>{c.fillStyle=col;for(let i=0;i<n;i++)c.fillRect(Math.random()*w,Math.random()*w,1+Math.random()*s,1+Math.random()*s)};
  const blot=(c,w,col,n,r)=>{for(let i=0;i<n;i++){const x=Math.random()*w,y=Math.random()*w,q=r*(.4+Math.random()),gr=c.createRadialGradient(x,y,0,x,y,q);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(x-q,y-q,2*q,2*q)}};
  const wallT=()=>this.tex(256,(c,w)=>{c.fillStyle='#a39a45';c.fillRect(0,0,w,w);
   for(let x=0;x<w;x+=24){c.fillStyle='rgba(70,60,10,.10)';c.fillRect(x,0,8,w)}for(let y=6;y<w;y+=24)for(let x=4;x<w;x+=24){c.fillStyle='rgba(120,110,50,.08)';c.fillRect(x,y,6,6)}
   blot(c,w,'rgba(70,50,0,.25)',9,48);blot(c,w,'rgba(150,150,70,.17)',7,60);sp(c,w,'rgba(50,40,0,.12)',900,2);
   for(let y=0;y<w;y+=64){c.fillStyle='rgba(40,32,0,.055)';c.fillRect(0,y,w,2)}
   let gr=c.createLinearGradient(0,0,0,w);[[0,.25],[.12,0],[.8,0],[.9,.4],[1,.7]].forEach(a=>gr.addColorStop(a[0],'rgba(20,12,0,'+a[1]+')'));c.fillStyle=gr;c.fillRect(0,0,w,w);
   gr=c.createLinearGradient(0,0,w,0);[[0,.2],[.08,0],[.92,0],[1,.2]].forEach(a=>gr.addColorStop(a[0],'rgba(0,0,0,'+a[1]+')'));c.fillStyle=gr;c.fillRect(0,0,w,w)});
  const ft=this.tex(512,(c,w)=>{c.fillStyle='#665a2c';c.fillRect(0,0,w,w);sp(c,w,'rgba(25,18,0,.38)',7000,2);sp(c,w,'rgba(150,135,70,.2)',4200,2);blot(c,w,'rgba(30,20,0,.34)',15,60);blot(c,w,'rgba(120,110,50,.18)',12,70);for(let i=0;i<24;i++){c.strokeStyle='rgba(20,15,0,.07)';c.beginPath();let x=Math.random()*w,y=Math.random()*w;c.moveTo(x,y);c.lineTo(x+(Math.random()-.5)*24,y+Math.random()*36);c.stroke()}},W*CS/6,D*CS/6);
  const ct=this.tex(256,(c,w)=>{c.fillStyle='#c4c096';c.fillRect(0,0,w,w);c.strokeStyle='rgba(80,70,40,.5)';for(let i=0;i<=w;i+=64){c.strokeRect(0,i,w,2);c.strokeRect(i,0,2,w)}blot(c,w,'rgba(90,70,20,.2)',6,40)},W*.75,D*.75);
  const st0=this.tex(128,c=>{const gr=c.createRadialGradient(64,64,0,64,64,60);gr.addColorStop(0,'rgba(25,15,0,.5)');gr.addColorStop(1,'rgba(25,15,0,0)');c.fillStyle=gr;c.fillRect(0,0,128,128)});
  const M=t=>new THREE.MeshLambertMaterial({map:t,vertexColors:false});
  // 바닥/천장: 정점 색으로 넓은 범위의 명암 변화를 주어 텍스처 반복이 덜 보이게 한다
  const plane=(tex,rot,y)=>{const geo=new THREE.PlaneGeometry(W*CS,D*CS,Math.ceil(W/2),Math.ceil(D/2)),n=geo.attributes.position.count,a=new Float32Array(n*3);
   for(let i=0;i<n;i++){const v=.8+Math.random()*.2;a[i*3]=v;a[i*3+1]=v;a[i*3+2]=v*.96}geo.setAttribute('color',new THREE.BufferAttribute(a,3));
   const mat=M(tex);mat.vertexColors=true;const p=new THREE.Mesh(geo,mat);p.rotation.x=rot;p.position.set(W*CS/2,y,D*CS/2);return p};
  const fl=plane(ft,-Math.PI/2,0);fl.receiveShadow=true;g.add(fl);g.add(plane(ct,Math.PI/2,WH));
  // Repeated ceiling conduits create a more readable industrial silhouette without expensive extra lights.
  if(d.theme==='water'||d.theme==='red'){const pipeMat=new THREE.MeshStandardMaterial({color:d.theme==='water'?0x34474a:0x3d2523,metalness:.48,roughness:.56});const pipeGeo=new THREE.CylinderGeometry(.075,.075,2.7,8);for(let y=2;y<D-2;y+=4)for(let x=2;x<W-2;x+=5){if((m[y]||'')[x]!=='.')continue;const pipe=new THREE.Mesh(pipeGeo,pipeMat);pipe.rotation.z=Math.PI/2;pipe.position.set((x+.5)*CS,WH-.22,(y+.5)*CS);g.add(pipe)}}
  const ws=[[],[],[]],floor=[],pil=[],des=[],dc={'1':[],'2':[],'3':[]};
  m.forEach((r,y)=>[...r].forEach((c,x)=>{const cx=(x+.5)*CS,cz=(y+.5)*CS;
   if(c==='#'){ws[Math.floor(Math.random()*3)].push([cx,cz]);return}if(c==='E')return;if(c==='1'||c==='2'||c==='3'){dc[c].push([cx,cz]);return}
   floor.push([cx,cz]);if(c==='P')pil.push([cx,cz]);if(c==='D')des.push([cx,cz])}));
  // Surface details are generated only after floor cells exist (prevents temporal-dead-zone errors).
  if(d.theme==='water'||d.theme==='red'){const wetMat=new THREE.MeshStandardMaterial({color:d.theme==='water'?0x24454a:0x28100e,metalness:.22,roughness:.18,transparent:true,opacity:d.theme==='water'?.38:.2,depthWrite:false});const wetGeo=new THREE.CircleGeometry(1,20);const used=[];for(let i=0;i<Math.min(64,floor.length);i++){const q=floor[(i*37+11)%floor.length];if(!q||used.some(a=>Math.hypot(a[0]-q[0],a[1]-q[1])<2.4))continue;used.push(q);const wet=new THREE.Mesh(wetGeo,wetMat);wet.rotation.x=-Math.PI/2;wet.position.set(q[0],.018,q[1]);const sc=.35+((i*17)%100)/100*1.1;wet.scale.set(sc,sc*.65,sc);g.add(wet)}}
  // Toxic green bacteria pools: clearly visible patches with a green emissive surface.
  if(d.toxicZones&&d.toxicZones.length){const toxicMat=new THREE.MeshStandardMaterial({color:0x3caa32,emissive:0x1d5c0b,emissiveIntensity:.65,transparent:true,opacity:.78,roughness:.2,metalness:.05,side:THREE.DoubleSide});
   d.toxicZones.forEach((z,zi)=>{const cx=(z.x1+z.x2+1)*CS/2,cz=(z.y1+z.y2+1)*CS/2,w=(z.x2-z.x1+1)*CS,h=(z.y2-z.y1+1)*CS;const water=new THREE.Mesh(new THREE.PlaneGeometry(w,h,8,8),toxicMat);water.rotation.x=-Math.PI/2;water.position.set(cx,.055,cz);g.add(water);
   for(let i=0;i<7;i++){const bubble=new THREE.Mesh(new THREE.SphereGeometry(.09+(i%3)*.025,8,6),new THREE.MeshBasicMaterial({color:0x8cff46}));bubble.position.set(cx+Math.sin(i*4.1)*w*.35,.11+(i%3)*.035,cz+Math.cos(i*2.7)*h*.35);g.add(bubble)}})}
  if(d.poolFloor===2){const railMat=new THREE.MeshStandardMaterial({color:0x8a9b98,metalness:.65,roughness:.35});for(let x=8;x<70;x+=6){const rail=new THREE.Mesh(new THREE.BoxGeometry(.07,.08,CS*13),railMat);rail.position.set(x*CS,1.05,27*CS);g.add(rail)}const sign=new THREE.Mesh(new THREE.BoxGeometry(2.2,.8,.08),new THREE.MeshStandardMaterial({color:0x174c4b,emissive:0x062322}));sign.position.set(12*CS,2,20*CS);g.add(sign)}
  // Theme-specific environmental models for the new large levels. Props occupy marked D cells,
  // so their visual locations match collision cells rather than floating in corridors.
  if(d.id && /^level([7-9]|1[0-9]|2[0-9]|30)$/.test(d.id)){
    const rackMat=new THREE.MeshStandardMaterial({color:d.theme==='red'?0x392321:d.theme==='water'?0x34494b:0x4a493f,metalness:.25,roughness:.7});
    const accentMat=new THREE.MeshStandardMaterial({color:d.theme==='red'?0xa52b24:d.theme==='water'?0x4aa6b8:0x8b865a,emissive:d.theme==='red'?0x300500:d.theme==='water'?0x062026:0x171606});
    des.forEach((p,i)=>{const x=p[0],z=p[1];let obj;
      if(/hospital|school|shelter/i.test(d.name)){obj=new THREE.Group();const base=new THREE.Mesh(new THREE.BoxGeometry(1.6,.18,2.4),rackMat);base.position.y=.65;obj.add(base);const mattress=new THREE.Mesh(new THREE.BoxGeometry(1.45,.14,2.15),new THREE.MeshStandardMaterial({color:0xb9b7ad,roughness:.95}));mattress.position.y=.8;obj.add(mattress);for(const xx of[-.65,.65]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.65,6),rackMat);leg.position.set(xx,.32,.9);obj.add(leg)}}
      else if(/server|factory|archive|library/i.test(d.name)){obj=new THREE.Group();const rack=new THREE.Mesh(new THREE.BoxGeometry(1.1,2.05,.65),rackMat);rack.position.y=1.03;obj.add(rack);for(let k=0;k<5;k++){const bar=new THREE.Mesh(new THREE.BoxGeometry(.82,.08,.035),accentMat);bar.position.set(0,.35+k*.34,-.34);obj.add(bar)}}
      else if(/train|station|city|suburbs|mall/i.test(d.name)){obj=new THREE.Group();const seat=new THREE.Mesh(new THREE.BoxGeometry(1.7,.18,.55),rackMat);seat.position.y=.65;obj.add(seat);const back=new THREE.Mesh(new THREE.BoxGeometry(1.7,.75,.12),accentMat);back.position.set(0,1.02,.23);obj.add(back);for(const xx of[-.65,.65]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.08,.62,.08),rackMat);leg.position.set(xx,.31,0);obj.add(leg)}}
      else if(/forest/i.test(d.name)){obj=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.26,2.8,7),rackMat);trunk.position.y=1.4;obj.add(trunk);const crown=new THREE.Mesh(new THREE.ConeGeometry(.9,2.1,7),accentMat);crown.position.y=2.8;obj.add(crown)}
      else {obj=new THREE.Group();const cabinet=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.6,.55),rackMat);cabinet.position.y=.8;obj.add(cabinet);for(let k=0;k<3;k++){const line=new THREE.Mesh(new THREE.BoxGeometry(.9,.035,.025),accentMat);line.position.set(0,.35+k*.4,-.29);obj.add(line)}}
      obj.position.set(x,0,z);obj.rotation.y=(i%4)*Math.PI/2;g.add(obj);
    });
  }
  const o=new THREE.Object3D(),col=new THREE.Color();
  const inst=(geo,mat,arr,y,cast)=>{if(!arr.length)return null;const im=new THREE.InstancedMesh(geo,mat,arr.length);arr.forEach((p,i)=>{o.position.set(p[0],y,p[1]);o.updateMatrix();im.setMatrixAt(i,o.matrix)});im.castShadow=!!cast;im.receiveShadow=true;g.add(im);return im};
  const wg=new THREE.BoxGeometry(CS,WH,CS);
  ws.forEach(a=>{if(!a.length)return;const im=inst(wg,M(wallT()),a,WH/2,false);a.forEach((p,i)=>{const v=.86+Math.random()*.14;col.setRGB(v,v,v*.96);im.setColorAt(i,col)});im.instanceColor.needsUpdate=true});
  const pM=new THREE.MeshLambertMaterial({color:0x8a8038}),tM=new THREE.MeshLambertMaterial({color:0x5d5526}),dM=new THREE.MeshLambertMaterial({color:0x5a4528}),dT=new THREE.MeshLambertMaterial({color:0x6b5a38});
  inst(new THREE.BoxGeometry(1.2,WH,1.2),pM,pil,WH/2,true);const bg=new THREE.BoxGeometry(1.5,.14,1.5);inst(bg,tM,pil,.07,false);inst(bg,tM,pil,WH-.07,false);
  inst(new THREE.BoxGeometry(1.8,.8,1),dM,des,.4,true);inst(new THREE.BoxGeometry(1.95,.06,1.15),dT,des,.83,true);
  const sm=new THREE.MeshBasicMaterial({map:st0,transparent:true,depthWrite:false}),sg=new THREE.PlaneGeometry(1.4,1.4);
  for(let i=0;i<12&&floor.length;i++){const p=floor[Math.floor(Math.random()*floor.length)],s=new THREE.Mesh(sg,sm);s.rotation.x=-Math.PI/2;s.position.set(p[0]+Math.random()-.5,.012,p[1]+Math.random()-.5);g.add(s)}
  // 형광등: 인스턴스 메쉬 하나(+ 어두운 테두리 하나)
  const pts=[];floor.forEach(p=>{const x=Math.floor(p[0]/CS),y=Math.floor(p[1]/CS);if(d.lit(x,y)&&(x*5+y*3)%8===0)pts.push(p)});
  const pg=new THREE.PlaneGeometry(1.6,.5);pg.rotateX(Math.PI/2);const fg=new THREE.PlaneGeometry(1.85,.75);fg.rotateX(Math.PI/2);
  const frame=inst(fg,new THREE.MeshBasicMaterial({color:0x2c2a18}),pts,WH-.012,false);
  if(pts.length){this.pI=inst(pg,new THREE.MeshBasicMaterial(),pts,WH-.02,false);pts.forEach((p,i)=>{this.pI.setColorAt(i,col.setRGB(.93,.96,.68));L.panels.push({z:d.zone(Math.floor(p[0]/CS),Math.floor(p[1]/CS)),x:p[0],pz:p[1],i,bad:Math.random()<.18,r:5+Math.random()*8,ph:Math.random()*9,f:1,d:0,u:false,hold:0})});this.pI.instanceColor.needsUpdate=true}
  // 문
  const doorM=new THREE.MeshLambertMaterial({color:0x2f4a35});
  for(const id of['1','2','3']){const did=DCH[id];if(!dc[id].length)continue;this.dm[did]=dc[id].map(p=>{const b=new THREE.Mesh(new THREE.BoxGeometry(CS-.04,WH-.02,CS-.04),doorM);b.position.set(p[0],WH/2,p[1]);g.add(b);return b});
   const q=dc[id][0];const sp=did==='x1';Interact.add({x:q[0],z:q[1],r:3.6,hide:()=>!sp&&L.open[did],label:()=>sp&&L.open[did]?'[E] 벌어진 틈 속으로':sp?'[E] 벽의 틈':'[E] 잠긴 문',act:()=>{if(sp&&L.open[did])Game.enterSpecial(d.doors[did].to);else{Aud.burst(300,.2,.4);UI.toast(d.doors[did].lockedMsg)}}})}
  const ex=d.exit,ez=(ex.cy0+ex.cy1+1)/2*CS,len=(ex.cy1-ex.cy0+1)*CS,ed=new THREE.Mesh(new THREE.BoxGeometry(.3,WH,len),doorM);ed.position.set((ex.cx+.6)*CS,WH/2,ez);g.add(ed);this.dm.exit=[ed];
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(len,WH),new THREE.MeshBasicMaterial({color:0xfff6dd}));gl.rotation.y=-Math.PI/2;gl.position.set((ex.cx+.95)*CS,WH/2,ez);g.add(gl);
  const xp=Rules.exitPt(d);Interact.add({x:xp[0],z:xp[1],r:3.2,label:()=>L.open.exit?'[E] 출구로 나간다':'[E] 출구 (잠김)',act:()=>{if(L.open.exit){if(d.id==='glitchshop'||d.id==='sanctuary')Game.returnFromHub();else Game.exitLevel()}else{Aud.burst(300,.2,.4);UI.toast(d.doors.exit.lockedMsg)}}});
  // 메모, 퓨즈
  d.notes.forEach((n,i)=>{const mm=new THREE.Mesh(new THREE.BoxGeometry(.4,.02,.3),new THREE.MeshLambertMaterial({color:0xeeeedd,emissive:0x555533}));mm.position.set((n.cx+.5)*CS,.03,(n.cy+.5)*CS);mm.rotation.y=i*1.7;g.add(mm);this.nm[i]=mm;
   Interact.add({x:mm.position.x,z:mm.position.z,r:2,label:()=>'[E] 메모 #'+(i+1)+(st.notes.includes(i)?' 다시 읽기':' 읽기'),act:()=>Game.useNote(i)})});
  d.items.forEach((it,i)=>{const f=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.4),new THREE.MeshLambertMaterial({color:0xddcc55,emissive:0x665500}));f.rotation.z=Math.PI/2;f.position.set((it.cx+.5)*CS,.12,(it.cy+.5)*CS);g.add(f);this.im[i]=f;
   Interact.add({x:f.position.x,z:f.position.z,r:2,hide:()=>st.items.includes(i),label:()=>'[E] 퓨즈 줍기',act:()=>Game.useItem(i)})});
  // 맵별 탐험 코인 6개. 수집 상태는 저장 슬롯에 기록한다.
  if(!Array.isArray(st.coins))st.coins=[];
  const coinCells=[];
  for(let y=1;y<D-1;y++)for(let x=1;x<W-1;x++)if(m[y][x]==='.'){
    const dist=Math.hypot(x-d.start.cx,y-d.start.cy);
    if(dist>5&&(x*13+y*7)%11===0)coinCells.push({x,y,score:dist+((x*17+y*29)%13)});
  }
  coinCells.sort((a,b)=>b.score-a.score);const chosen=[];
  for(const c of coinCells){if(chosen.every(q=>Math.hypot(q.x-c.x,q.y-c.y)>4)){chosen.push(c);if(chosen.length>=6)break}}
  chosen.forEach((c,i)=>{const mesh=new THREE.Mesh(new THREE.TorusGeometry(.18,.055,8,16),new THREE.MeshStandardMaterial({color:0xe6bd48,metalness:.72,roughness:.25,emissive:0x4b3200}));mesh.position.set((c.x+.5)*CS,.65,(c.y+.5)*CS);mesh.rotation.x=Math.PI/2;mesh.castShadow=true;g.add(mesh);this.coinMeshes[i]=mesh;
    Interact.add({x:mesh.position.x,z:mesh.position.z,r:2,hide:()=>((st.coins||[]).includes(i)),label:()=>'[E] 탐험 코인 줍기',act:()=>Game.useCoin(i)});
  });
  // 오리지널 추격형 실루엣 엔티티: 특정 상용 게임의 모델을 복제하지 않는다.
  if(d.id!=='level0'&&!d.safe){
    let target=null,best=-1;for(let y=1;y<D-1;y++)for(let x=1;x<W-1;x++)if(m[y][x]==='.') {const dist=Math.hypot(x-d.start.cx,y-d.start.cy);if(dist>best){best=dist;target={x,y}}}
    if(target){const eg=new THREE.Group(),dark=new THREE.MeshStandardMaterial({color:0x050605,roughness:.98,metalness:.02}),edge=new THREE.MeshStandardMaterial({color:0x111510,roughness:.9}),eye=new THREE.MeshBasicMaterial({color:d.theme==='red'?0xff3b25:0xd5c65a});
      const body=new THREE.Mesh(new THREE.CylinderGeometry(.3,.42,1.45,8),dark);body.position.y=1.03;eg.add(body);
      const chest=new THREE.Mesh(new THREE.BoxGeometry(.48,.72,.3),dark);chest.position.set(0,1.18,-.025);chest.rotation.z=.04;eg.add(chest);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.24,12,10),dark);head.scale.set(.8,1.25,.8);head.position.y=1.92;eg.add(head);
      const neck=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,.25,7),edge);neck.position.y=1.68;eg.add(neck);
      const armGeo=new THREE.CylinderGeometry(.065,.13,1.05,7);for(const side of[-1,1]){const a=new THREE.Mesh(armGeo,dark);a.position.set(side*.42,1.02,-.02);a.rotation.z=side*.22;eg.add(a);const hand=new THREE.Mesh(new THREE.SphereGeometry(.12,7,6),edge);hand.scale.set(.7,1.4,.65);hand.position.set(side*.48,.48,-.03);eg.add(hand)}
      const legGeo=new THREE.CylinderGeometry(.11,.075,.9,7);for(const side of[-1,1]){const leg=new THREE.Mesh(legGeo,dark);leg.position.set(side*.17,.35,.02);eg.add(leg)}
      const e1=new THREE.Mesh(new THREE.SphereGeometry(.028,6,6),eye),e2=e1.clone();e1.position.set(-.07,1.94,-.19);e2.position.set(.07,1.94,-.19);eg.add(e1,e2);
      eg.position.set((target.x+.5)*CS,0,(target.y+.5)*CS);g.add(eg);this.entity={g:eg,alert:0,spawn:{x:eg.position.x,z:eg.position.z},wander:0,tx:eg.position.x,tz:eg.position.z,profile:this.aiProfile(d),state:'patrol',think:0,pathThink:0,pathX:eg.position.x,pathZ:eg.position.z,attackCooldown:0,blinkCooldown:5,search:0,lastSeen:{x:eg.position.x,z:eg.position.z},phase:Math.random()*6.28};
    }
  }
  // 50% chance of a persistent, level-specific glitch shop portal. Never spawns in safe hubs.
  if(!d.safe && d.id!=='glitchshop' && d.id!=='sanctuary' && Game.mode==='sp'){
    if(!st.glitchShop){const candidates=[];for(let yy=2;yy<D-2;yy++)for(let xx=2;xx<W-2;xx++)if(m[yy][xx]==='.'&&Math.hypot(xx-d.start.cx,yy-d.start.cy)>7)candidates.push({x:xx,y:yy});
      const exists=Math.random()<.5&&candidates.length>0;const pick=exists?candidates[Math.floor(Math.random()*candidates.length)]:null;st.glitchShop={exists,x:pick&&pick.x,y:pick&&pick.y};}
    if(st.glitchShop.exists){const q=st.glitchShop,x=(q.x+.5)*CS,z=(q.y+.5)*CS;const gm=new THREE.MeshStandardMaterial({color:0xff27d5,emissive:0x8b00aa,emissiveIntensity:1.4,wireframe:true});const glitch=new THREE.Mesh(new THREE.IcosahedronGeometry(.75,1),gm);glitch.position.set(x,1.35,z);g.add(glitch);const glow=new THREE.PointLight(0xd52bff,1.5,8);glow.position.set(x,1.5,z);g.add(glow);
      Interact.add({x,z,r:3,label:()=>'[E] 열^#(쇠 가 — GL!TCH SHOP',act:()=>Game.enterShop()});}
  }
  // GL!TCH SHOP: 상품을 실제 3D 진열대로 보여주고 가까이 가면 구매 메뉴를 연다.
  if(d.id==='glitchshop'){
    const x=12*CS,z=11*CS;
    const sm=new THREE.MeshStandardMaterial({color:0x64f4ff,emissive:0x087b88,emissiveIntensity:1.1});
    const portal=new THREE.Mesh(new THREE.TorusGeometry(1.05,.12,8,24),sm);
    portal.position.set(x,1.5,z);g.add(portal);
    Interact.add({x,z,r:3,label:()=>'[E] 안전 레벨로 이동',act:()=>Game.enterSafeLevel()});

    const stock=[['응급 회복',12,'체력 +35'],['정신 안정제',15,'정신력 +35'],['스태미나 음료',8,'스태미나 +50']];
    const products=[
      {name:'응급 회복',cost:12,color:0xe74c3c,shape:'box'},
      {name:'정신 안정제',cost:15,color:0x9b59b6,shape:'bottle'},
      {name:'스태미나 음료',cost:8,color:0x2ecc71,shape:'can'},
      {name:'팀원 순간이동기',cost:22,color:0x3498db,shape:'cube'},
      {name:'팀원 나침반',cost:18,color:0xf1c40f,shape:'compass'},
      {name:'부활 십자가',cost:35,color:0xff5555,shape:'cross'},
      {name:'워키토키',cost:30,color:0x555b66,shape:'radio'}
    ];
    const spots=[[7,6],[12,6],[17,6],[22,6],[7,15],[12,15],[17,15]];
    products.forEach((p,i)=>{
      const [cx,cy]=spots[i],px=(cx+.5)*CS,pz=(cy+.5)*CS;
      const standMat=new THREE.MeshStandardMaterial({color:0x373747,metalness:.55,roughness:.4});
      const stand=new THREE.Mesh(new THREE.CylinderGeometry(.48,.58,.22,12),standMat);
      stand.position.set(px,.55,pz);g.add(stand);
      const mat=new THREE.MeshStandardMaterial({color:p.color,emissive:p.color,emissiveIntensity:.18,metalness:.25,roughness:.35});
      const item=new THREE.Group();
      if(p.shape==='box'||p.shape==='cube'){
        const body=new THREE.Mesh(new THREE.BoxGeometry(.48,.48,.38),mat);item.add(body);
        if(p.shape==='box'){const band=new THREE.Mesh(new THREE.BoxGeometry(.12,.5,.4),new THREE.MeshStandardMaterial({color:0xf5f5f5}));item.add(band)}
      }else if(p.shape==='bottle'){
        const body=new THREE.Mesh(new THREE.CylinderGeometry(.17,.2,.42,12),mat);body.position.y=-.02;item.add(body);
        const cap=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.1,10),new THREE.MeshStandardMaterial({color:0xdddddd}));cap.position.y=.24;item.add(cap);
      }else if(p.shape==='can'){
        const body=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.48,16),mat);item.add(body);
        const top=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.025,16),new THREE.MeshStandardMaterial({color:0xcbd5dc,metalness:.7}));top.position.y=.25;item.add(top);
      }else if(p.shape==='compass'){
        const body=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.1,20),mat);item.add(body);
        const needle=new THREE.Mesh(new THREE.ConeGeometry(.07,.27,4),new THREE.MeshStandardMaterial({color:0xfff3b0}));needle.position.y=.1;needle.rotation.z=Math.PI;item.add(needle);
      }else if(p.shape==='cross'){
        const a=new THREE.Mesh(new THREE.BoxGeometry(.16,.52,.12),mat),b=new THREE.Mesh(new THREE.BoxGeometry(.48,.16,.12),mat);b.position.y=.05;item.add(a,b);
      }else if(p.shape==='radio'){
        const body=new THREE.Mesh(new THREE.BoxGeometry(.42,.38,.2),mat);item.add(body);
        const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.28,6),new THREE.MeshStandardMaterial({color:0xaaaaaa}));antenna.position.set(.12,.31,0);antenna.rotation.z=-.18;item.add(antenna);
        const dial=new THREE.Mesh(new THREE.SphereGeometry(.045,8,8),new THREE.MeshStandardMaterial({color:0x75e6ff,emissive:0x277f99}));dial.position.set(-.1,.06,.12);item.add(dial);
      }
      item.position.set(px,1.05,pz);g.add(item);
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;
      const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(8,8,16,.88)';ctx.fillRect(0,0,512,96);
      ctx.strokeStyle='#7df9ff';ctx.lineWidth=4;ctx.strokeRect(3,3,506,90);
      ctx.fillStyle='#ffffff';ctx.font='bold  thirtypx sans-serif'.replace('thirty','30px');ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(p.name+' · '+p.cost+' 코인',256,48);
      const tex=new THREE.CanvasTexture(canvas);const label=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
      label.scale.set(2.1,.4,1);label.position.set(px,1.95,pz);label.renderOrder=12;g.add(label);
      Interact.add({x:px,z:pz,r:2.7,label:()=> '[E] '+p.name+' 확인 / 구매',act:()=>Game.shopMenu(stock)});
    });
    // 중앙 카운터에서도 전체 상품 목록을 열 수 있다.
    const bx=17*CS,bz=11*CS;Interact.add({x:bx,z:bz,r:3,label:()=>'[E] 전체 상점 목록',act:()=>Game.shopMenu(stock)});
  }
  // 퍼즐 장치(키패드/분전함): 벽에 붙여 배치
  d.puzzles.forEach(p=>{if(!p.at)return;const c=Rules.cellPos(p.at),dr=Rules.wallDir(p.at.wall),horiz=dr[0]!==0,code=p.type==='code';
   const b=new THREE.Mesh(new THREE.BoxGeometry(horiz?.15:(code?.5:.7),code?.7:.9,horiz?(code?.5:.7):.15),new THREE.MeshLambertMaterial({color:code?0x222222:0x333a33,emissive:code?0x112211:0x0a1a0a}));
   b.position.set(c[0]+dr[0]*1.42,1.25,c[1]+dr[1]*1.42);g.add(b);const pt=Rules.puzzlePt(p);
   Interact.add({x:pt[0],z:pt[1],r:2.2,label:()=>st.solved[p.id]?(code?'키패드 (해제됨)':'분전함 (전원 켜짐)'):code?'[E] 키패드':'[E] 분전함 ('+st.items.length+'/'+p.need+')',act:()=>Game.usePuzzle(p)})});
  (d.switches||[]).forEach(sw=>{const c=Rules.cellPos(sw),dr=Rules.wallDir(sw.wall),hz=dr[0]!==0,b=new THREE.Mesh(new THREE.BoxGeometry(hz?.12:.35,.45,hz?.35:.12),new THREE.MeshLambertMaterial({color:0x555044,emissive:0x221a08}));b.position.set(c[0]+dr[0]*1.45,1.3,c[1]+dr[1]*1.45);g.add(b);
   const pt=[c[0]+dr[0]*.8,c[1]+dr[1]*.8];Interact.add({x:pt[0],z:pt[1],r:2.2,label:()=>'[E] '+sw.label+(Game.world().env['off_'+sw.zone]?' (꺼짐)':' (켜짐)'),act:()=>Game.toggleSwitch(sw)})});
  for(let i=0;i<5;i++){const l=new THREE.PointLight(0xf2f0a0,1,10,2);this.lights.push(l);g.add(l)}},
 aiProfile(d){
  const n=(d.name||'').toLowerCase(),th=d.theme||'yellow';
  const base={kind:'stalker',sight:22,hearing:12,alertRate:.42,searchTime:3.8,patrolSpeed:.52,chaseSpeed:1.8,searchSpeed:.95,retreatSpeed:1.2,wanderMin:1.8,wanderExtra:2.8,roam:12,attackRange:1.3,attackCooldown:4,damage:12,sanityDamage:8,attackText:'무언가가 너를 붙잡았다. 정신을 차렸을 때 시작 지점으로 돌아와 있었다.'};
  if(/red|mirror|clockwork|threshold/.test(n)||th==='red')return {...base,kind:'blink',sight:26,hearing:14,alertRate:.6,searchTime:5,patrolSpeed:.65,chaseSpeed:2.05,searchSpeed:1.1,wanderMin:1.2,wanderExtra:2,roam:17,blinkCooldown:11,blinkRange:2.8,blinkSide:1.6,attackCooldown:3.2,damage:16,sanityDamage:12,attackText:'붉은 형체가 눈앞에서 번쩍이며 너를 덮쳤다.'};
  if(/pool|flood|water/.test(n)||th==='water')return {...base,kind:'water',sight:18,hearing:15,alertRate:.34,searchTime:5.5,patrolSpeed:.36,chaseSpeed:1.55,searchSpeed:.72,wanderMin:3,wanderExtra:4,roam:10,attackRange:1.5,attackCooldown:4.5,damage:10,sanityDamage:10,attackText:'물속의 형체가 다리를 붙잡고 끌어당겼다.'};
  if(/school|hospital|library|archive/.test(n)||th==='white')return {...base,kind:'patrol',sight:16,hearing:20,alertRate:.52,searchTime:7,patrolSpeed:.72,chaseSpeed:1.65,searchSpeed:1.25,wanderMin:2,wanderExtra:2,roam:20,attackRange:1.25,attackCooldown:4.5,damage:11,sanityDamage:14,attackText:'복도 순찰자가 네 앞길을 막아섰다.'};
  if(/blackout|server|bunker|last signal/.test(n)||th==='void')return {...base,kind:'sound',sight:11,hearing:27,alertRate:.5,searchTime:6,patrolSpeed:.28,chaseSpeed:2.2,searchSpeed:1.05,wanderMin:3,wanderExtra:4,roam:8,attackRange:1.35,attackCooldown:3.5,damage:14,sanityDamage:13,attackText:'어둠 속 엔티티가 소리를 따라와 너를 덮쳤다.'};
  if(/forest|suburbs|shelter/.test(n))return {...base,kind:'shy',sight:20,hearing:14,alertRate:.28,searchTime:3,patrolSpeed:.6,chaseSpeed:1.35,searchSpeed:.8,retreatSpeed:1.05,wanderMin:2.5,wanderExtra:4,roam:22,attackRange:1.1,attackCooldown:5,damage:8,sanityDamage:16,attackText:'도망치던 형체가 갑자기 뒤돌아 너를 덮쳤다.'};
  if(/funhouse|smiler|party/.test(n))return {...base,kind:'ambush',sight:20,hearing:16,alertRate:.48,searchTime:5,patrolSpeed:.45,chaseSpeed:2.25,searchSpeed:1.05,wanderMin:2,wanderExtra:3,roam:15,ambushRange:13,attackRange:1.3,attackCooldown:3.3,damage:15,sanityDamage:18,attackText:'웃는 얼굴이 가까이 다가와 시야를 집어삼켰다.'};
  return base;
 },
 update(t,px,pz,dt){const P=this.panels;const k=Math.min(1,dt*18),dm=this.dimMul();let ch=false;
  for(const p of P){const off=this.off(p.z);if(p.bad||off||p.f<1){let tg=1;if(p.bad){const s=Math.sin(t*p.r+p.ph)*Math.sin(t*p.r*2.3+1);tg=s>.5?.45:1;if(p.hold>0){p.hold-=dt;tg=.2}else if(Math.random()<.002)p.hold=.08}
    if(off)tg=.03;const nf=p.f+(tg-p.f)*k;if(Math.abs(nf-p.f)>.004){p.f=nf;this.pI.setColorAt(p.i,this._c.setRGB(.93*nf,.96*nf,.68*nf));ch=true}}
   p.d=(p.x-px)**2+(p.pz-pz)**2;p.u=false}
  if(ch&&this.pI)this.pI.instanceColor.needsUpdate=true;
  let near=null;for(let i=0;i<this.lights.length;i++){const l=this.lights[i];let b=null;if(i<this.nl)for(const p of P)if(!p.u&&(!b||p.d<b.d))b=p;
   if(b){b.u=true;if(!i)near=b;l.position.set(b.x,WH-.3,b.pz);l.intensity=1.5*b.f*dm}else l.intensity=0}
  Aud.buzz(near&&near.d<20?near.f:.2);
  const E=this.entity;if(E&&Game.state==='play'&&Game.mode==='sp'){
    const p=Player,ex=E.g.position.x,ez=E.g.position.z,dx=px-ex,dz=pz-ez,dist=Math.hypot(dx,dz),P=E.profile;
    E.attackCooldown=Math.max(0,E.attackCooldown-dt);E.blinkCooldown-=dt;E.think-=dt;
    const canSee=dist<P.sight&&this.los(ex,ez,px,pz);
    const playerNoise=(p.crouch?.38:p.run?1.65:1)+(Game.stats.stamina<30?-.12:0);
    const detected=canSee || (dist<P.hearing*playerNoise);
    if(detected){E.lastSeen={x:px,z:pz};E.search=P.searchTime;E.alert=Math.min(1,E.alert+dt*(canSee?P.alertRate:P.alertRate*.55));if(E.state==='patrol'||E.state==='search')E.state='hunt'}
    else if(E.search>0){E.search-=dt;E.state='search'}else{E.alert=Math.max(0,E.alert-dt*.12);if(E.alert<.08)E.state='patrol'}
    if(E.think<=0){E.think=.25+Math.random()*.18;
      if(P.kind==='blink'&&E.blinkCooldown<=0&&dist>6&&dist<18&&canSee){
        const a=Math.atan2(pz-ez,px-ex),side=Math.random()<.5?-1:1;let tx=px-Math.cos(a)*P.blinkRange+Math.sin(a)*side*P.blinkSide,tz=pz-Math.sin(a)*P.blinkRange-Math.cos(a)*side*P.blinkSide;
        if(!this.solid(tx,tz)){E.g.position.set(tx,0,tz);E.blinkCooldown=P.blinkCooldown;E.state='ambush';E.alert=.8;UI.toast('복도 끝의 형체가 눈앞에 나타났다.',1800)}
      }
      if(P.kind==='ambush'&&E.state==='patrol'&&dist< P.ambushRange&&dist>4){E.state='ambush';E.alert=.75}
    }
    let tx=E.spawn.x,tz=E.spawn.z,speed=P.patrolSpeed;
    if(E.state==='hunt'){
      tx=E.lastSeen.x;tz=E.lastSeen.z;speed=P.chaseSpeed*(P.kind==='sound'&&p.run?1.35:1)*(P.kind==='water'&&dist>5?.72:1);
      if(P.kind==='shy'&&canSee&&dist<8){tx=ex-dx;tz=ez-dz;speed=P.retreatSpeed;E.state='retreat'}
    }else if(E.state==='search'||E.state==='ambush'){
      tx=E.lastSeen.x;tz=E.lastSeen.z;speed=P.searchSpeed;
      if(E.state==='ambush'&&dist> P.ambushRange*1.8)E.state='hunt';
    }else if(E.state==='retreat'){
      tx=ex-dx*2;tz=ez-dz*2;speed=P.retreatSpeed;if(dist>10)E.state='search';
    }else{
      E.wander-=dt;if(E.wander<=0){E.wander=P.wanderMin+Math.random()*P.wanderExtra;let found=false;for(let tries=0;tries<8&&!found;tries++){const ax=E.spawn.x+(Math.random()-.5)*P.roam,az=E.spawn.z+(Math.random()-.5)*P.roam;if(!this.solid(ax,az)){E.tx=ax;E.tz=az;found=true}}}
      tx=E.tx;tz=E.tz;
    }
    E.pathThink-=dt;
    if(E.pathThink<=0||Math.hypot(E.pathX-ex,E.pathZ-ez)<.55){const wp=this.pathStep(ex,ez,tx,tz);E.pathX=wp.x;E.pathZ=wp.z;E.pathThink=.32}
    const vx=E.pathX-ex,vz=E.pathZ-ez,vd=Math.hypot(vx,vz);
    if(vd>.18){const step=Math.min(vd,speed*dt),nx=ex+vx/(vd||1)*step,nz=ez+vz/(vd||1)*step;
      if(!this.solid(nx,ez))E.g.position.x=nx;else {E.pathThink=0;if(E.state==='hunt')E.state='search'}
      if(!this.solid(E.g.position.x,nz))E.g.position.z=nz;else {E.pathThink=0;if(E.state==='hunt')E.state='search'}
      E.g.rotation.y=Math.atan2(vx,vz);
    }
    E.g.position.y=Math.sin(t*(E.state==='hunt'?11:4)+E.phase)*.035;
    const close=dist<(P.attackRange||1.25);
    if(close&&E.attackCooldown<=0&&!(Game.mode==='mp'&&Game.mpDowned)){E.attackCooldown=P.attackCooldown;UI.toast(P.attackText,2600);Aud.burst(P.kind==='blink'?65:90,.8,.72);E.alert=0;E.search=0;E.state='patrol';if(Game.stats){Game.stats.health=Math.max(0,Game.stats.health-P.damage);Game.stats.sanity=Math.max(0,Game.stats.sanity-P.sanityDamage)}if(Game.mode==='mp'&&Game.stats&&Game.stats.health<=0){Game.mpDowned=true;Game.stats.health=0;Net.send({t:'downed'});UI.toast('쓰러졌다! 팀원에게 부활 십자가를 사용해 달라고 요청해!',4000)}else if(Game.mode!=='mp'&&Game.stats&&Game.stats.health<=0){const sp=Rules.startPt(this.def);Player.spawn(sp[0],sp[1],this.def.start.yaw);Game.stats.health=65;Game.stats.stamina=50;Game.stats.sanity=Math.max(20,Game.stats.sanity-15);E.g.position.set(E.spawn.x,0,E.spawn.z);UI.toast('체력이 바닥났다. 시작 구역에서 정신을 차렸다.',2600)} }
  }
 }};

