const Player={x:0,z:0,yaw:0,pitch:0,vx:0,vz:0,keys:{},mv:{x:0,y:0},run:false,crouch:false,bob:0,sd:0,jumpY:0,jumpV:0,
 spawn(x,z,yaw){Object.assign(this,{x,z,yaw:yaw||0,pitch:0,vx:0,vz:0,jumpY:0,jumpV:0,jumpBoost:false,crouch:false})},
 clampP(p){return Math.max(-1.3,Math.min(1.3,p))},
 init(){
  addEventListener('keydown',e=>{if(e.code==='Tab'){if(Game.state==='play'||Game.cluesOpen){e.preventDefault();if(Game.state==='play')Game.clues();else Game.closeUI()}return}if(e.code==='Escape'&&Game.state==='ui'&&Game.uiC){Game.closeUI();return}this.keys[e.code]=true;if(e.code==='Space'&&!e.repeat&&Game.state==='play'&&this.jumpY<=0.001){e.preventDefault();this.jumpV=(this.keys.ShiftLeft||this.keys.ShiftRight||this.run)?6.7:5.1;this.jumpBoost=(this.keys.ShiftLeft||this.keys.ShiftRight||this.run)&&!this.crouch}if(e.code==='KeyE'&&!e.repeat&&Game.state==='play')Interact.trigger();if(e.code==='KeyC'&&!e.repeat&&Game.state==='play')this.crouch=!this.crouch});
  const rs=()=>{this.keys={};this.mv.x=this.mv.y=0;this.run=false};addEventListener('blur',rs);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){rs();if(Game.state==='play')Game.pause()}});
  addEventListener('keyup',e=>this.keys[e.code]=false);
  addEventListener('mousemove',e=>{if(document.pointerLockElement){const k=.0022*Save.data.settings.sensPC;this.yaw-=e.movementX*k;this.pitch=this.clampP(this.pitch-e.movementY*k)}});
  const st=UI.$('stick'),kn=UI.$('knob');let sid=null;
  const mv=e=>{if(e.pointerId!==sid)return;const r=st.getBoundingClientRect(),R=r.width/2;let dx=e.clientX-r.left-R,dy=e.clientY-r.top-R;const l=Math.hypot(dx,dy);if(l>R){dx*=R/l;dy*=R/l}kn.style.transform=`translate(${dx}px,${dy}px)`;this.mv.x=dx/R;this.mv.y=dy/R};
  const up=e=>{if(e.pointerId!==sid)return;sid=null;this.mv.x=this.mv.y=0;kn.style.transform=''};
  st.addEventListener('pointerdown',e=>{sid=e.pointerId;st.setPointerCapture(sid);mv(e)});
  st.addEventListener('pointermove',mv);st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);st.addEventListener('lostpointercapture',up);
  const zr=UI.$('zr');let lid=null,lx=0,ly=0;
  zr.addEventListener('pointerdown',e=>{lid=e.pointerId;zr.setPointerCapture(lid);lx=e.clientX;ly=e.clientY});
  zr.addEventListener('pointermove',e=>{if(e.pointerId!==lid)return;const k=.005*Save.data.settings.sensMob;this.yaw-=(e.clientX-lx)*k;this.pitch=this.clampP(this.pitch-(e.clientY-ly)*k);lx=e.clientX;ly=e.clientY});
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>zr.addEventListener(n,e=>{if(e.pointerId===lid)lid=null}));
  const bc=UI.$('bCrouch');if(bc){bc.addEventListener('pointerdown',()=>{this.crouch=!this.crouch;bc.textContent=this.crouch?'웅크리는 중':'웅크리기'});}
  const rb=UI.$('bRun');rb.addEventListener('pointerdown',()=>this.run=true);['pointerup','pointercancel','pointerleave'].forEach(n=>rb.addEventListener(n,()=>this.run=false));
  UI.$('bAct').addEventListener('pointerdown',()=>{if(Game.state==='play')Interact.trigger()});const cross=document.createElement('button');cross.id='bCross';cross.className='touch-only';cross.textContent='십자가';cross.style.cssText='position:fixed;right:12px;bottom:100px;z-index:8';cross.addEventListener('pointerdown',()=>Game.useCross());document.getElementById('hud').appendChild(cross);const jumpBtn=document.createElement('button');jumpBtn.id='bJump';jumpBtn.className='touch-only';jumpBtn.textContent='점프';jumpBtn.style.cssText='position:fixed;right:90px;bottom:100px;z-index:8';jumpBtn.addEventListener('pointerdown',()=>{if(Game.state==='play'&&this.jumpY<=.001){this.jumpBoost=(this.run||this.keys.ShiftLeft||this.keys.ShiftRight)&&!this.crouch;this.jumpV=this.jumpBoost?6.7:5.1}});document.getElementById('hud').appendChild(jumpBtn);addEventListener('keydown',e=>{if(e.code==='KeyX'&&!e.repeat&&Game.state==='play')Game.useCross()})},
 hit(x,z){const r=.35;return Levels.solid(x-r,z-r)||Levels.solid(x+r,z-r)||Levels.solid(x-r,z+r)||Levels.solid(x+r,z+r)},
 update(dt,cam){if(Game.mode==='mp'&&Game.mpDowned){this.vx=this.vz=0;cam.position.set(this.x,0.35,this.z);cam.rotation.set(this.pitch,this.yaw,0,'YXZ');if(Game.updateSurvivalUI)Game.updateSurvivalUI();return}const k=this.keys;let fx=(k.KeyD?1:0)-(k.KeyA?1:0)+this.mv.x,fz=(k.KeyS?1:0)-(k.KeyW?1:0)+this.mv.y;
  const n=Math.hypot(fx,fz),l=Math.min(1,n);if(n>0){fx/=n;fz/=n}
  const wantsRun=k.ShiftLeft||k.ShiftRight||this.run,stats=Game.stats||{stamina:100},run=!this.crouch&&wantsRun&&l>.05&&stats.stamina>0,sp=(this.crouch?1.05:run?4.8:2.5)*l,s=Math.sin(this.yaw),c=Math.cos(this.yaw),a=Math.min(1,dt*9);
  // 달리면서 점프하면 공중에서 잠깐 추가 가속을 얻는다.
  this.jumpV-=14*dt;this.jumpY=Math.max(0,this.jumpY+this.jumpV*dt);if(this.jumpY===0)this.jumpV=0;/* Hard ceiling guard: keep the eye/camera below the room ceiling even if jump input repeats or dt spikes. */const ceilingY=(typeof WH==='number'?WH:5.85);const maxJump=Math.max(.55,Math.min(1.45,ceilingY-(this.crouch?1.05:1.7)-.45));if(this.jumpY>maxJump){this.jumpY=maxJump;this.jumpV=Math.min(0,this.jumpV)}const jumpRun=this.jumpY>0&&this.jumpBoost;const jumpMul=jumpRun?1.38:1; if(this.jumpY===0)this.jumpBoost=false;
  this.vx+=((fx*c+fz*s)*sp*jumpMul-this.vx)*a;this.vz+=((-fx*s+fz*c)*sp*jumpMul-this.vz)*a;
  const nx=this.x+this.vx*dt,nz=this.z+this.vz*dt;if(!this.hit(nx,this.z))this.x=nx;if(!this.hit(this.x,nz))this.z=nz;
  this.run=run;const v=Math.hypot(this.vx,this.vz);if(Game.stats){if(run)Game.stats.stamina=Math.max(0,Game.stats.stamina-20*dt);else Game.stats.stamina=Math.min(150,Game.stats.stamina+22*dt);if(Game.stats.sanity<25)Game.stats.stamina=Math.max(0,Game.stats.stamina-2*dt)}this.uiTick=(this.uiTick||0)+dt;if(this.uiTick>=.1){this.uiTick=0;if(Game.updateSurvivalUI)Game.updateSurvivalUI()}this.sd+=v*dt;this.bob+=v*dt*2.4;
  if(this.sd>(run?1.8:1.3)&&v>.5){this.sd=0;Aud.step(run)}
  const S=Save.data.settings,sm=Math.min(1,v/2),sh=Save.data.acc.shake?1:0;const eyeH=this.crouch?1.05:1.7;const bobY=Math.sin(this.bob)*.035*sm*sh;const safeCeiling=(typeof WH==='number'?WH:5.85)-.28;cam.position.set(this.x,Math.min(safeCeiling,Math.max(eyeH-.08,eyeH+this.jumpY+bobY)),this.z);cam.rotation.set(this.pitch,this.yaw,Math.sin(this.bob*.5)*.004*sm*sh,'YXZ');
  const tf=S.fov+(run&&v>2?6:0);if(Math.abs(cam.fov-tf)>.05){cam.fov+=(tf-cam.fov)*Math.min(1,dt*6);cam.updateProjectionMatrix()}}};
