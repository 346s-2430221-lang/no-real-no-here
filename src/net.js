// 멀티플레이 클라이언트. 서버가 퍼즐/문/아이템의 최종 결정권을 가진다.
const Net={ws:null,on:false,leaving:false,me:null,code:null,token:null,host:null,url:'',roster:new Map(),av:new Map(),pend:{},grp:null,tick:0,last:null,chatOpen:false,voiceStream:null,voicePeers:new Map(),voiceOn:false,voiceCandidateQueues:new Map(),voiceConnected:new Set(),pendingRevive:false,
 esc:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 defUrl(){return/^https?:/.test(location.protocol)?(location.protocol==='https:'?'wss://':'ws://')+location.host:'ws://localhost:8080'},
 send(o){if(this.ws&&this.ws.readyState===1){this.ws.send(JSON.stringify(o));return true}return false},
 voicePrefs(){return Save&&Save.data&&Save.data.settings?Save.data.settings:Save.gs||{}},
 applyVoiceSettings(){const s=this.voicePrefs();const pt=document.getElementById('bPTT');if(pt)pt.style.display=this.voiceOn&&s.voicePTT?'block':'none';this.updateVoiceVolumes();if(this.voiceStream)this.voiceStream.getAudioTracks().forEach(t=>{t.enabled=!s.voiceMute&&(!s.voicePTT||!!this.pttHeld)});const b=UI.$('bVoice');if(b&&this.voiceOn)b.textContent=s.voiceMute?'🎙 마이크 음소거':'🎙 음성 끄기'},
 updateVoiceVolumes(){const s=this.voicePrefs(),base=Math.max(0,Math.min(1,Number.isFinite(+s.voiceOut)?+s.voiceOut:.85)),walkie=!!(Save&&Save.data&&Save.data.teamItems&&Save.data.teamItems.walkieTalkie);document.querySelectorAll('audio[id^="voice-"]').forEach(a=>{const id=a.id.slice(6),p=this.roster.get(id);let factor=1;if(!walkie&&p){const d=Math.hypot((p.x||0)-Player.x,(p.z||0)-Player.z);factor=d<=5?1:Math.max(.04,1-(d-5)/35)}a.volume=base*factor})},
 pttHeld:false,
 initVoiceControls(){if(this._pttInit)return;this._pttInit=true;const pt=document.createElement('button');pt.id='bPTT';pt.textContent='🎙 눌러서 말하기';pt.style.cssText='position:fixed;right:12px;top:142px;z-index:12;display:none;min-width:0;padding:9px 12px;background:#4d4825;color:#fff;border:1px solid #b7a95a;border-radius:8px;touch-action:none';document.body.appendChild(pt);const setPTT=down=>{this.pttHeld=down;if(this.voiceStream)this.applyVoiceSettings();pt.style.filter=down?'brightness(1.6)':'none'};pt.addEventListener('pointerdown',e=>{e.preventDefault();if(pt.setPointerCapture)pt.setPointerCapture(e.pointerId);setPTT(true)});['pointerup','pointercancel','lostpointercapture','pointerleave'].forEach(n=>pt.addEventListener(n,()=>setPTT(false)));const key=(e,down)=>{const s=this.voicePrefs();if(!s.voicePTT||e.code!==(s.voiceKey||'KeyV')||e.repeat&&down)return;if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement&&document.activeElement.tagName))return;this.pttHeld=down;if(this.voiceStream)this.applyVoiceSettings();if(down)e.preventDefault()};addEventListener('keydown',e=>key(e,true));addEventListener('keyup',e=>key(e,false));addEventListener('blur',()=>{this.pttHeld=false;this.applyVoiceSettings()});document.addEventListener('visibilitychange',()=>{if(document.hidden){this.pttHeld=false;this.applyVoiceSettings()}})},
 open(url,first,cb){let done=false,ws;try{ws=new WebSocket(url)}catch(e){cb(false,'서버 주소가 올바르지 않습니다');return}
  const to=setTimeout(()=>{if(!done){done=true;try{ws.close()}catch(e){}cb(false,'연결 시간 초과')}},6000);
  ws.onopen=()=>{clearTimeout(to);this.ws=ws;ws.send(JSON.stringify(first))};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}if(!done&&(m.t==='joined'||m.t==='err')){done=true;cb(m.t==='joined',m.msg,m)}this.msg(m)};
  ws.onerror=()=>{if(!done){done=true;clearTimeout(to);cb(false,'서버에 연결할 수 없습니다 (서버가 켜져 있는지 확인)')}};
  ws.onclose=()=>{clearTimeout(to);if(!done){done=true;cb(false,'연결이 닫혔습니다')}if(this.ws===ws)this.closed()}},
 menu(){const mp=Save.gs,$=id=>UI.$(id);
  UI.panel(`<h2>멀티플레이</h2><p>서버가 켜져 있어야 합니다. 서버 없이도 싱글플레이는 그대로 가능합니다.</p><label>닉네임<input id="mn" type="text" maxlength="12" value="${this.esc(mp.name)}"></label>
   <label>서버 주소<input id="mu" type="text" value="${this.esc(mp.srv||this.defUrl())}"></label><label>방 코드<input id="mc" type="text" maxlength="6" placeholder="6자리"></label>
   <button id="mcr">방 만들기</button><button id="mjn">방 참가</button><div id="mmsg"></div><button id="mbk">뒤로</button>`);
  const go=first=>{mp.name=($('mn').value||'').trim().slice(0,12);mp.srv=($('mu').value||'').trim();Save.save();first.name=mp.name||'Player'+Math.floor(Math.random()*90+10);
   $('mmsg').textContent='연결 중…';this.url=mp.srv;this.open(mp.srv,first,(ok,msg,m)=>{if(ok){if(m.started)Game.startMP(m);else this.showLobby(m)}else{const e=$('mmsg');if(e)e.textContent=msg||'실패'}})};
  $('mcr').onclick=()=>go({t:'create'});$('mjn').onclick=()=>{const c=($('mc').value||'').trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(c)){$('mmsg').textContent='방 코드는 6자리입니다';return}go({t:'join',code:c})};
  $('mbk').onclick=()=>UI.close()},
 showLobby(m){this.join(m);Game.state='lobby';Game.unlock();UI.menu(false);UI.hud(false);this.renderLobby(m);},
 renderLobby(m){const ps=[...this.roster.values()].map(p=>'<div class="slot"><b>'+this.esc(p.name)+'</b> '+(p.id===this.host?'👑 방장':'')+'<p>'+(p.ready?'🟢 준비 완료':'🟡 준비 중')+(p.id===this.me?' · 나':'')+(p.online===false?' · 연결 끊김':'')+'</p></div>').join('');const host=this.me===this.host;UI.panel('<h2>NO REAL NO HERE</h2><h3>멀티플레이 대기실</h3><p>방 코드</p><h1 style="font-size:38px;letter-spacing:.2em">'+this.esc(this.code||'------')+'</h1><p>친구에게 방 코드를 알려주고 모두 준비하면 시작할 수 있어.</p><p>플레이어 '+this.roster.size+'/4</p>'+ps+'<button id="lReady">'+(this.roster.get(this.me)?.ready?'준비 취소':'준비 완료')+'</button>'+(host?'<button id="lStart">게임 시작</button>':'<p>방장이 시작할 때까지 기다려줘.</p>')+'<button id="lLeave">방 나가기</button><div id="lMsg"></div>');UI.$('lReady').onclick=()=>this.send({t:'ready',ready:!this.roster.get(this.me)?.ready});if(host&&UI.$('lStart'))UI.$('lStart').onclick=()=>{const e=UI.$('lMsg');if(e)e.textContent='게임 시작 요청 중…';this.send({t:'start'})};UI.$('lLeave').onclick=()=>{this.leave();Game.toMenu()};},
 updateLobby(m){if(!m||!Array.isArray(m.players))return;this.roster.clear();m.players.forEach(p=>this.roster.set(p.id,p));this.host=m.host||this.host;this.renderLobby(m);},
 join(m,re){this.on=true;this.leaving=false;this.me=m.you;this.code=m.code;this.token=m.token;this.host=m.host;this.roster.clear();m.players.forEach(p=>this.roster.set(p.id,p));
  if(!this.grp){this.grp=new THREE.Group();Game.scene.add(this.grp)}this.clearAv();m.players.forEach(p=>{if(p.id!==this.me)this.av.set(p.id,this.mk(p))});this.hud();this.chatLine('시스템','방에 연결됨 · 코드 '+this.code);if(this.voiceOn)this.ensureVoicePeers()},
 mk(p){const g=new THREE.Group(),col=[0xcc5555,0x55aa77,0x5577cc,0xccaa44][(p.slot||0)%4];
  const b=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,1.1,10),new THREE.MeshLambertMaterial({color:col}));b.position.y=.65;
  const h=new THREE.Mesh(new THREE.SphereGeometry(.17,10,8),new THREE.MeshLambertMaterial({color:0xddd0b0}));h.position.y=1.43;
  const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.font='bold 30px sans-serif';x.textAlign='center';x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,8,256,48);x.fillStyle='#e8dc88';x.fillText(p.name,128,44);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));s.scale.set(1.3,.33,1);s.position.y=1.9;s.renderOrder=10;
  g.add(b,h,s);g.position.set(p.x||0,0,p.z||0);g.visible=p.online!==false;this.grp.add(g);return{g,tx:p.x||0,tz:p.z||0,ty:p.yaw||0}},
 clearAv(){this.av.forEach(a=>{this.grp.remove(a.g);a.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}})});this.av.clear()},
 rosterText(){return[...this.roster.values()].map(p=>p.name+(p.id===this.host?'(방장)':'')+(p.online===false?'(끊김)':'')+(p.id===this.me?' *':'')).join(', ')},
 hud(){UI.net(this.on?'방 '+this.code+' · '+this.rosterText():'')},
 update(dt){const k=1-Math.exp(-dt*10);this.updateVoiceVolumes();const compass=document.getElementById('teamCompass');if(compass){const peers=[...this.roster.values()].filter(p=>p.id!==this.me&&p.online!==false);if(!this.on||!peers.length)compass.textContent='팀원 나침반: 연결된 팀원 없음';else{const p=peers.sort((a,b)=>Math.hypot((a.x||0)-Player.x,(a.z||0)-Player.z)-Math.hypot((b.x||0)-Player.x,(b.z||0)-Player.z))[0];const dx=(p.x||0)-Player.x,dz=(p.z||0)-Player.z,ang=Math.atan2(dx,dz)-Player.yaw,dist=Math.round(Math.hypot(dx,dz));compass.textContent='🧭 '+p.name+' '+(Math.abs(ang)<.45?'↑':ang>0?'→':'←')+' · '+dist+'m'+(p.downed?' · 구조 필요':'')}}this.av.forEach(a=>{const p=a.g.position;p.x+=(a.tx-p.x)*k;p.z+=(a.tz-p.z)*k;let d=a.ty-a.g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));a.g.rotation.y+=d*k});
  if(this.on&&Game.state==='play'){this.tick+=dt;if(this.tick>=.1){this.tick=0;const q=[Player.x,Player.z,Player.yaw],l=this.last;if(!l||Math.abs(q[0]-l[0])+Math.abs(q[1]-l[1])+Math.abs(q[2]-l[2])>.01||this.idle++>10){this.idle=0;this.last=q;this.send({t:'pos',x:q[0],z:q[1],yaw:q[2]})}}}},idle:0,
 msg(m){const st=Levels.st;switch(m.t){
  case'joined':if(m.re)Game.resync(m);break;
  case'lobby':this.updateLobby(m);break;
  case'gameStart':Game.startMP(m);break;
  case'pjoin':this.roster.set(m.p.id,m.p);if(m.p.id!==this.me&&!this.av.has(m.p.id))this.av.set(m.p.id,this.mk(m.p));this.hud();if(Game.state==='lobby')this.updateLobby({players:[...this.roster.values()],host:this.host});this.chatLine('시스템',m.p.name+' 입장');if(this.voiceOn)this.ensureVoicePeer(m.p.id);this.voiceStatus();UI.toast(m.p.name+' 입장',1800);break;
  case'pleave':{const p=this.roster.get(m.id);this.roster.delete(m.id);const a=this.av.get(m.id);if(a){this.grp.remove(a.g);this.av.delete(m.id)}this.dropVoicePeer(m.id);this.hud();if(Game.state==='lobby')this.updateLobby({players:[...this.roster.values()],host:this.host});if(p)this.chatLine('시스템',p.name+' 퇴장');this.voiceStatus();if(p)UI.toast(p.name+' 퇴장',1800);break}
  case'pstate':{const p=this.roster.get(m.id),a=this.av.get(m.id);if(p)p.online=m.online;if(a)a.g.visible=m.online;this.hud();break}
  case'phost':this.host=m.id;this.hud();if(Game.state==='lobby')this.updateLobby({players:[...this.roster.values()],host:this.host});break;
  case'pos':for(const q of m.p){const a=this.av.get(q.id),rp=this.roster.get(q.id);if(rp){rp.x=q.x;rp.z=q.z;rp.yaw=q.yaw}if(a){a.tx=q.x;a.tz=q.z;a.ty=q.yaw}}break;
  case'teleport':if(m.id===this.me){Player.spawn(m.x,m.z,Player.yaw);this.last=null;UI.toast('팀원에게 순간이동했다!',1800)}break;
  case'downed':{const p=this.roster.get(m.id);if(p)p.downed=true;if(m.id===this.me){Game.mpDowned=true;Game.stats.health=0;UI.toast('쓰러졌다! 팀원이 십자가로 부활시킬 수 있어.',4000)}else UI.toast((p?p.name:'팀원')+'이(가) 쓰러졌다!',2600);this.hud();break}
  case'revived':{this.pendingRevive=false;if(m.by===this.me){Save.data.crossCharges=Math.max(0,(Save.data.crossCharges||0)-1);Save.save();UI.toast('부활 십자가 충전 1개를 사용했어.',1800)}const rp=this.roster.get(m.id);if(rp){rp.x=m.x;rp.z=m.z;rp.downed=false}const a=this.av.get(m.id);if(a){a.tx=m.x;a.tz=m.z}if(m.id===this.me){Game.recordAchievement(36,'십자가로 부활');Player.spawn(m.x,m.z,Player.yaw);Game.mpDowned=false;Game.stats.health=m.health||65;Game.stats.stamina=m.stamina||45;Game.stats.sanity=m.sanity||35;Save.data.health=Game.stats.health;Save.data.stamina=Game.stats.stamina;Save.data.sanity=Game.stats.sanity;Save.save();Game.updateSurvivalUI();UI.toast('십자가의 힘으로 부활했다!',2200)}else UI.toast((rp?rp.name:'팀원')+' 부활!',1800);this.hud();break}
  case'snap':Player.x=m.x;Player.z=m.z;Player.vx=Player.vz=0;break;
  case'note':{if(!st||m.lv!==Levels.id)break;if(!st.notes.includes(m.i))st.notes.push(m.i);st.texts[m.i]=m.text;Levels.refresh();UI.count();
   if(m.by===this.me)Game.note(m.i,m.text);else if(!m.dup){const p=this.roster.get(m.by);UI.toast((p?p.name:'동료')+'이(가) 메모 #'+(m.i+1)+'을 읽었다')}break}
  case'item':{if(!st||m.lv!==Levels.id)break;if(!st.items.includes(m.i))st.items.push(m.i);Aud.paper();Levels.refresh();UI.count();UI.toast('퓨즈 '+st.items.length+'/'+Levels.def.items.length);break}
  case'solved':{if(!st||m.lv!==Levels.id)break;const was=!!st.solved[m.pid];st.solved[m.pid]=true;Levels.refresh();const cb=this.pend[m.pid];if(cb){delete this.pend[m.pid];cb(true)}
   if(!was){Aud.solve();Aud.door();UI.toast('잠금이 해제되었다.');if(Game.kpPid===m.pid&&Game.state==='ui')Game.closeUI()}break}
  case'wrong':{const cb=this.pend[m.pid];if(cb){delete this.pend[m.pid];cb(false)}if(m.msg)UI.toast(m.msg);break}
  case'need':UI.toast('퓨즈가 부족하다 ('+m.have+'/'+m.need+')');break;
  case'level':Game.mpLevel(m);break;
  case'end':Game.mpEnd();break;
  case'chat':this.chatLine(m.name||'Player',m.text||'',m.id===this.me);break;
  case'signal':this.voiceSignal(m.from,m.data);break;
  case'err':if(this.pendingRevive){this.pendingRevive=false;UI.toast('부활 실패: 십자가 충전은 사용되지 않았어.',2500)}UI.toast(m.msg||'오류',2500);break}},
 closed(){if(!this.on||this.leaving)return;UI.net('연결 끊김 — 재접속 중…');this.retry(1)},
 retry(n){if(n>5){this.fail();return}setTimeout(()=>{if(this.leaving||!this.on)return;this.open(this.url,{t:'rejoin',code:this.code,token:this.token},(ok)=>{if(ok){UI.toast('재접속했다',2000)}else this.retry(n+1)})},1500*n)},
 fail(){this.on=false;Game.state='ui';Game.unlock();UI.net('');UI.panel('<h2>연결 실패</h2><p>서버와 다시 연결하지 못했다. 싱글플레이는 그대로 이어서 할 수 있다.</p><button id="nf">메인 메뉴</button>');UI.$('nf').onclick=()=>{UI.close();Game.toMenu()}},
chatLine(name,text,mine){const log=UI.$('chatLog');if(!log)return;const row=document.createElement('div');row.textContent=(mine?'나':name)+': '+text;row.style.color=mine?'#e8dc88':'#ded7ad';log.appendChild(row);while(log.children.length>80)log.removeChild(log.firstChild);log.scrollTop=log.scrollHeight},
 sendChat(text){text=String(text||'').trim().slice(0,180);if(!text)return false;if(!this.on)return false;return this.send({t:'chat',text})},
 voiceIceServers(){
  // 배포 운영자는 HTTPS 페이지에서 이 값을 설정해 TURN 서버를 연결할 수 있다.
  // TURN이 없으면 일부 공유기/통신사 NAT 환경에서 연결이 실패할 수 있다.
  const configured=window.NRNH_ICE_SERVERS;
  if(Array.isArray(configured)&&configured.length)return configured;
  return [{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]
 },
 async toggleVoice(){
  this.initVoiceControls();
  if(!this.on){UI.toast('먼저 멀티플레이 방에 들어가세요.');return}
  if(this.voiceOn){this.stopVoice();return}
  if(!window.isSecureContext||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){UI.toast('마이크는 HTTPS 또는 localhost에서만 사용할 수 있습니다.',4000);return}
  try{
   this.voiceStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1},video:false});
   this.voiceOn=true;this.applyVoiceSettings();const b=UI.$('bVoice');if(b)b.textContent=Save.data.settings.voiceMute?'🎙 마이크 음소거':'🎙 음성 끄기';
   const st=UI.$('voiceStatus');if(st)st.textContent='마이크 켜짐 · 상대방 연결 대기 중…';
   this.ensureVoicePeers();for(const id of this.roster.keys())if(id!==this.me)this.send({t:'signal',to:id,data:{ready:true}});this.voiceStatus();UI.toast('마이크가 켜졌습니다. 상대방도 음성을 켜야 합니다.',2200)
  }catch(e){const msg=e.name==='NotAllowedError'?'사이트 권한에서 마이크를 허용하세요.':e.name==='NotFoundError'?'사용 가능한 마이크를 찾을 수 없습니다.':e.name==='NotReadableError'?'마이크가 다른 앱에서 사용 중일 수 있습니다.':e.message;UI.toast('마이크를 켤 수 없습니다: '+msg,4000)}
 },
 voiceStatus(){
  const st=UI.$('voiceStatus');if(!st)return;
  if(!this.voiceOn){st.textContent='음성 채팅 꺼짐';return}
  const peers=[...this.roster.keys()].filter(id=>id!==this.me);
  const connected=peers.filter(id=>this.voiceConnected.has(id)).length;
  st.textContent=peers.length===0?'마이크 켜짐 · 다른 플레이어가 들어오면 연결됩니다':`마이크 켜짐 · 음성 연결 ${connected}/${peers.length}`;
 },
 ensureVoicePeers(){for(const id of this.roster.keys())if(id!==this.me)this.ensureVoicePeer(id)},
 ensureVoicePeer(id){
  if(!this.voiceOn||!this.voiceStream||id===this.me||this.voicePeers.has(id))return;
  let pc;try{pc=new RTCPeerConnection({iceServers:this.voiceIceServers(),iceCandidatePoolSize:4,bundlePolicy:'max-bundle'})}catch(e){console.error('RTCPeerConnection',e);return}
  this.voicePeers.set(id,pc);this.voiceCandidateQueues.set(id,[]);
  this.voiceStream.getTracks().forEach(t=>pc.addTrack(t,this.voiceStream));
  pc.onicecandidate=e=>{if(e.candidate)this.send({t:'signal',to:id,data:{candidate:e.candidate}})};
  pc.ontrack=e=>{
   let a=document.getElementById('voice-'+id);if(!a){a=document.createElement('audio');a.id='voice-'+id;a.autoplay=true;a.playsInline=true;a.setAttribute('playsinline','');a.style.display='none';document.body.appendChild(a)}
   a.srcObject=e.streams&&e.streams[0]?e.streams[0]:new MediaStream([e.track]);this.updateVoiceVolumes();
   a.play().then(()=>{const p=this.roster.get(id);UI.toast('음성 연결됨'+(p?' · '+p.name:''),1600)}).catch(()=>{const st=UI.$('voiceStatus');if(st)st.textContent='음성 연결됨 · 소리가 안 들리면 화면을 터치해 재생을 허용하세요'});
  };
  pc.onconnectionstatechange=()=>{
   if(pc.connectionState==='connected'){this.voiceConnected.add(id);this.voiceStatus()}
   else if(pc.connectionState==='failed'){this.voiceConnected.delete(id);this.voiceStatus();UI.toast('음성 연결 실패 · TURN 서버가 필요한 네트워크일 수 있습니다.',3500);try{pc.restartIce()}catch(e){}}
   else if(pc.connectionState==='disconnected'){this.voiceConnected.delete(id);this.voiceStatus()}
   else if(pc.connectionState==='closed'){this.voiceConnected.delete(id);this.voiceStatus()}
  };
  pc.oniceconnectionstatechange=()=>{if(pc.iceConnectionState==='failed'){try{pc.restartIce()}catch(e){}}};
  // ID가 작은 쪽만 offer를 만들어 동시 offer 충돌을 방지한다.
  if(Number(this.me)<Number(id))this.makeVoiceOffer(id,pc);
 },
 async makeVoiceOffer(id,pc){try{const offer=await pc.createOffer();if(pc.signalingState!=='stable')return;await pc.setLocalDescription(offer);this.send({t:'signal',to:id,data:{description:pc.localDescription}})}catch(e){console.warn('voice offer failed',e)}},
 async flushVoiceCandidates(id,pc){const q=this.voiceCandidateQueues.get(id)||[];while(q.length){const c=q.shift();try{await pc.addIceCandidate(new RTCIceCandidate(c))}catch(e){console.warn('ICE candidate rejected',e)}}},
 async voiceSignal(from,data){
  if(!this.voiceOn||!this.voiceStream||!data)return;
  this.ensureVoicePeer(from);const pc=this.voicePeers.get(from);if(!pc)return;
  try{
   if(data.ready){if(Number(this.me)<Number(from)&&pc.signalingState==='stable'&&!pc.remoteDescription)await this.makeVoiceOffer(from,pc);return}
   if(data.description){const desc=new RTCSessionDescription(data.description);await pc.setRemoteDescription(desc);await this.flushVoiceCandidates(from,pc);
    if(desc.type==='offer'){const answer=await pc.createAnswer();await pc.setLocalDescription(answer);this.send({t:'signal',to:from,data:{description:pc.localDescription}})}
   }else if(data.candidate){if(pc.remoteDescription)await pc.addIceCandidate(new RTCIceCandidate(data.candidate));else{const q=this.voiceCandidateQueues.get(from)||[];q.push(data.candidate);this.voiceCandidateQueues.set(from,q)}}
  }catch(e){console.warn('voice signaling',e);const st=UI.$('voiceStatus');if(st)st.textContent='음성 협상 중 오류가 발생했습니다. 음성을 껐다가 다시 켜보세요.'}
 },
 dropVoicePeer(id){const pc=this.voicePeers.get(id);if(pc){try{pc.close()}catch(e){}this.voicePeers.delete(id)}this.voiceCandidateQueues.delete(id);this.voiceConnected.delete(id);const a=document.getElementById('voice-'+id);if(a){a.pause();a.srcObject=null;a.remove()}this.voiceStatus()},
 stopVoice(){this.voiceOn=false;this.pttHeld=false;const pt=document.getElementById('bPTT');if(pt)pt.style.display='none';if(this.voiceStream){this.voiceStream.getTracks().forEach(t=>t.stop());this.voiceStream=null}for(const id of [...this.voicePeers.keys()])this.dropVoicePeer(id);this.voiceCandidateQueues.clear();this.voiceConnected.clear();const b=UI.$('bVoice');if(b)b.textContent='🎙 음성 켜기';const st=UI.$('voiceStatus');if(st)st.textContent='음성 채팅 꺼짐';},
 leave(){this.leaving=true;this.stopVoice();if(this.ws){this.send({t:'leave'});try{this.ws.close()}catch(e){}}this.ws=null;this.on=false;this.pend={};if(this.grp)this.clearAv();this.roster.clear();UI.net('');const box=UI.$('chatBox');if(box)box.classList.add('hidden')}};
