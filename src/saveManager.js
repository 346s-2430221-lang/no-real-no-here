// 저장 슬롯 시스템. 슬롯마다 독립된 localStorage 키를 쓰고, 쓰기 전에 이전 정상 데이터를 _bak으로 보존한다.
const isObj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const Save={IDX:'nrnh_slots_v1',GS:'nrnh_settings_v1',VER:4,GAME:'NO REAL NO HERE',MAIN:['level0','level1','level2','level3','level4','level5','level6',...Array.from({length:24},(_,i)=>'level'+(i+7)),'level9b'],data:null,id:null,gs:null,idx:{order:[],last:null,legacy:0},err:false,recovered:false,
 defGS(){return{vol:.6,sensPC:1,sensMob:1,quality:'auto',fov:72,btn:1,srv:'',name:'',voiceOut:.85,voicePTT:false,voiceMute:false,voiceKey:'KeyV'}},
 world(){return{team:{mara:'unknown',jin:'unknown'},keys:[],obs:[],env:{},fake:{taken:[],seen:0,retry:null,retryOk:false},done:{},ptypes:[]}},
 blank(name,mode){const t=Date.now();return{ver:this.VER,id:'s'+t.toString(36)+Math.floor(Math.random()*46656).toString(36),name:name||'',mode:mode||'solo',created:t,saved:t,play:0,level:'level0',pos:null,cp:null,started:false,lv:{},unl:{level0:true},
  diff:'normal',fear:'normal',acc:{flicker:true,shake:true,loud:true,fx:true},wallet:0,total:0,runCoins:0,totalRunCoins:0,health:100,stamina:200,sanity:100,earned:{},owned:[],equip:{c:'c0',h:'h0'},ach:{},endings:{},world:this.world()}},
 num(v,d,a,b){v=+v;return Number.isFinite(v)?Math.min(b,Math.max(a,v)):d},
 rd(k){try{const v=localStorage.getItem(k);return v==null?null:JSON.parse(v)}catch(e){return undefined}},
 norm(d){const b=this.blank();d.name=String(d.name||'').slice(0,20)||'게임';d.mode=d.mode==='mp'?'mp':'solo';d.created=this.num(d.created,Date.now(),0,9e15);d.saved=this.num(d.saved,d.created,0,9e15);d.play=this.num(d.play,0,0,1e9);
  if(!NRNH.LEVELS[d.level])d.level='level0';if(d.pos&&!(Number.isFinite(d.pos.x)&&Number.isFinite(d.pos.z)))d.pos=null;if(d.pos)d.pos={x:+d.pos.x,z:+d.pos.z,yaw:Number.isFinite(d.pos.yaw)?+d.pos.yaw:0};
  if(d.cp&&!(Number.isFinite(d.cp.x)&&Number.isFinite(d.cp.z)&&NRNH.LEVELS[d.cp.level]))d.cp=null;d.started=!!d.started;if(!isObj(d.lv))d.lv={};if(!isObj(d.unl))d.unl={};d.unl.level0=true;
  d.diff=['easy','normal','hard','nightmare'].includes(d.diff)?d.diff:'normal';d.fear=['low','normal','high','extreme'].includes(d.fear)?d.fear:'normal';
  d.acc=Object.assign({},b.acc,isObj(d.acc)?d.acc:{});for(const k in b.acc)d.acc[k]=!!d.acc[k];
  d.health=this.num(d.health,100,0,100);d.stamina=this.num(d.stamina,200,0,200);d.sanity=this.num(d.sanity,100,0,100);d.wallet=Math.floor(this.num(d.wallet,0,0,1e9));d.total=Math.floor(this.num(d.total,d.wallet,0,1e9));d.runCoins=Math.floor(this.num(d.runCoins,0,0,1e6));d.totalRunCoins=Math.floor(this.num(d.totalRunCoins,d.runCoins,0,1e9));if(!isObj(d.earned))d.earned={};
  d.owned=Array.isArray(d.owned)?d.owned.filter(x=>typeof x==='string').slice(0,200):[];d.equip=Object.assign({c:'c0',h:'h0'},isObj(d.equip)?d.equip:{});if(typeof d.equip.c!=='string')d.equip.c='c0';if(typeof d.equip.h!=='string')d.equip.h='h0';
  if(!isObj(d.ach))d.ach={};if(!isObj(d.endings))d.endings={};
  const W=d.world=Object.assign(this.world(),isObj(d.world)?d.world:{});if(!isObj(W.team))W.team=this.world().team;for(const k of['mara','jin'])if(!['unknown','rescued','missing','dead'].includes(W.team[k]))W.team[k]='unknown';
  for(const k of['keys','obs','ptypes'])if(!Array.isArray(W[k]))W[k]=[];if(!isObj(W.env))W.env={};W.fake=Object.assign(this.world().fake,isObj(W.fake)?W.fake:{});if(!Array.isArray(W.fake.taken))W.fake.taken=[];if(!isObj(W.done))W.done={};return d},
 load(){let g=this.rd(this.GS);if(!isObj(g))g=null;const had=!!g;this.gs=Object.assign(this.defGS(),g||{});const n=(k,a,b)=>this.gs[k]=this.num(this.gs[k],this.defGS()[k],a,b);n('vol',0,1);n('sensPC',.3,3);n('sensMob',.3,3);n('fov',60,100);n('btn',.7,1.5);n('voiceOut',0,1);this.gs.voicePTT=!!this.gs.voicePTT;this.gs.voiceMute=!!this.gs.voiceMute;if(!['low','mid','high','auto'].includes(this.gs.quality))this.gs.quality='auto';
  this.gs.name=String(this.gs.name||'').slice(0,12);this.gs.srv=String(this.gs.srv||'').slice(0,200);
  const i=this.rd(this.IDX);this.idx=isObj(i)&&Array.isArray(i.order)?{order:i.order.filter(x=>typeof x==='string'),last:typeof i.last==='string'?i.last:null,legacy:i.legacy|0}:{order:[],last:null,legacy:0};
  const old=this.rd('nrnh_save_v2')||this.rd('nrnh_save_v1');
  if(!had&&isObj(old)&&isObj(old.settings)){const s=old.settings;for(const k of['vol','sensPC','sensMob','fov','btn'])if(Number.isFinite(+s[k]))this.gs[k]=+s[k];if(['low','mid','high','auto'].includes(s.quality))this.gs.quality=s.quality;this.n2=1;n('vol',0,1);n('sensPC',.3,3);n('sensMob',.3,3);n('fov',60,100);n('btn',.7,1.5)}
  if(!this.idx.legacy){this.idx.legacy=1;if(isObj(old)&&old.started){const d=this.blank('이전 게임');d.level=old.level;d.pos=old.pos;d.started=true;d.lv=isObj(old.lv)?old.lv:{};d.diff='normal';this.norm(d);if(this.write(d)){this.idx.order.push(d.id);this.idx.last=d.id}}this.wIdx()}
  this.idx.order=this.idx.order.filter((x,k,a)=>a.indexOf(x)===k);this.clear();return this.data},
 clear(){this.data=this.blank('','solo');this.data.settings=this.gs;this.id=null},
 wIdx(){try{localStorage.setItem(this.IDX,JSON.stringify(this.idx));return true}catch(e){this.err=true;return false}},
 key(id){return'nrnh_slot_'+id},
 okSlot(d,id){return isObj(d)&&d.id===id&&typeof d.ver==='number'},
 readSlot(id){let d=this.rd(this.key(id));this.recovered=false;if(!this.okSlot(d,id)){const b=this.rd(this.key(id)+'_bak');if(this.okSlot(b,id)){d=b;this.recovered=true}else return null}return d},
 write(d){try{const k=this.key(d.id),c=Object.assign({},d);delete c.settings;delete c.mp;const s=JSON.stringify(c);const prev=localStorage.getItem(k);if(prev)localStorage.setItem(k+'_bak',prev);localStorage.setItem(k,s);return true}catch(e){this.err=true;return false}},
 open(id){const d=this.readSlot(id);if(!d)return false;this.norm(d);d.settings=this.gs;this.data=d;this.id=id;this.idx.last=id;this.wIdx();return true},
 create(name,mode,o){const n=this.idx.order.length+1,d=this.blank(String(name||'').trim().slice(0,20)||'게임 '+n,mode);if(o&&o.diff)d.diff=o.diff;if(o&&o.fear)d.fear=o.fear;this.norm(d);if(!this.write(d))return null;this.idx.order.push(d.id);this.idx.last=d.id;this.wIdx();return d.id},
 save(){let ok=true;try{localStorage.setItem(this.GS,JSON.stringify(this.gs))}catch(e){ok=false}
  if(this.id&&this.data){this.data.saved=Date.now();if(!this.write(this.data))ok=false}this.err=!ok;return ok},
 rename(id,name){name=String(name||'').trim().slice(0,20);if(!name)return false;if(this.id===id){this.data.name=name;return this.save()}const d=this.readSlot(id);if(!d)return false;d.name=name;return this.write(d)},
 remove(id){if(!this.idx.order.includes(id))return false;try{localStorage.removeItem(this.key(id));localStorage.removeItem(this.key(id)+'_bak')}catch(e){}this.idx.order=this.idx.order.filter(x=>x!==id);if(this.idx.last===id)this.idx.last=this.idx.order[0]||null;this.wIdx();if(this.id===id)this.clear();return true},
 progress(d){if(isObj(d.endings)&&Object.keys(d.endings).length)return 100;let t=0,c=0;for(const id of this.MAIN){const L=NRNH.LEVELS[id],s=isObj(d.lv)&&isObj(d.lv[id])?d.lv[id]:{};t+=L.notes.length+L.items.length+L.puzzles.length;
   c+=Math.min(L.notes.length,Array.isArray(s.notes)?s.notes.length:0)+Math.min(L.items.length,Array.isArray(s.items)?s.items.length:0)+(isObj(s.solved)?Object.keys(s.solved).length:0)}return t?Math.min(99,Math.round(c*100/t)):0},
 summary(id){const d=this.readSlot(id);if(!d)return{id,ok:false,name:'(손상된 슬롯)'};const rec=this.recovered;this.norm(d);return{id,ok:true,rec,name:d.name,mode:d.mode,level:d.level,pct:this.progress(d),play:d.play,saved:d.saved,diff:d.diff,fear:d.fear,endings:Object.keys(d.endings).length}},
 list(){return this.idx.order.map(id=>this.summary(id))},
 mpSlot(){const l=this.list().find(s=>s.ok&&s.mode==='mp');return l?l.id:this.create('멀티 프로필','mp')},
 exportSlot(id){const d=this.readSlot(id);if(!d)throw new Error('슬롯을 읽을 수 없습니다');return JSON.stringify({game:this.GAME,fmt:1,exported:Date.now(),slots:[d]},null,1)},
 exportAll(){return JSON.stringify({game:this.GAME,fmt:1,exported:Date.now(),slots:this.idx.order.map(id=>this.readSlot(id)).filter(Boolean)},null,1)},
 importText(t){if(typeof t!=='string'||t.length>3e6)throw new Error('파일이 너무 크거나 올바르지 않습니다');let o;try{o=JSON.parse(t)}catch(e){throw new Error('JSON 형식이 아닙니다')}
  const arr=isObj(o)&&o.game===this.GAME&&Array.isArray(o.slots)?o.slots:null;if(!arr||!arr.length||arr.length>20)throw new Error('NO REAL NO HERE 세이브 파일이 아닙니다');
  for(const s of arr)if(!isObj(s)||typeof s.ver!=='number'||s.ver>this.VER||!isObj(s.world===undefined?{}:s.world)||(s.level!==undefined&&!NRNH.LEVELS[s.level]))throw new Error('손상되었거나 지원하지 않는 세이브입니다');
  const made=[];for(const s of arr){const d=Object.assign(this.blank(),s);d.id=this.blank().id+made.length;d.name=String(s.name||'가져온 게임').slice(0,12)+' (가져옴)';this.norm(d);made.push(d)}
  for(const d of made){if(!this.write(d))throw new Error('저장 공간이 부족합니다');this.idx.order.push(d.id)}this.idx.last=made[made.length-1].id;this.wIdx();return made.map(d=>d.id)},
 lv(id){const d=this.data;d.lv=isObj(d.lv)?d.lv:{};const s=isObj(d.lv[id])?d.lv[id]:(d.lv[id]={});if(!Array.isArray(s.notes))s.notes=[];if(!Array.isArray(s.items))s.items=[];
  const old=s.solved===true;if(!isObj(s.solved))s.solved={};
  if(!Array.isArray(s.coins))s.coins=[];if(!Number.isInteger(s.seed)){if(id==='level0'){s.notes=[];s.items=[];s.solved={}}else if(old&&id==='level1')s.solved.box=true;s.seed=Math.floor(Math.random()*2147483647);delete s.code}return s}};
