(function(root){'use strict';
const CS=3,DCH={'1':'d1','2':'d2','3':'x1','E':'exit'};
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hs(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function grid(W,H){const m=Array.from({length:H},()=>Array(W).fill('#'));return{c(x0,y0,x1,y1,ch){ch=ch||'.';for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)m[y][x]=ch},s(x,y,ch){m[y][x]=ch},out:()=>m.map(r=>r.join(''))}}
const Rules={CS,DCH,
 answers(L,seed){const A={};for(const p of L.puzzles)if(p.type==='code'){const r=rng((seed^hs(L.id+p.id))>>>0);let s='';for(let i=0;i<p.len;i++)s+=Math.floor(r()*10);A[p.id]=s}return A},
 mkState(seed){return{seed,notes:[],items:[],solved:{}}},
 noteText(L,st,i){const n=L.notes[i];return n?n.text(Rules.answers(L,st.seed)):''},
 collectNote(L,st,i){if(!Number.isInteger(i)||i<0||i>=L.notes.length||st.notes.includes(i))return false;st.notes.push(i);for(const p of L.puzzles)if(p.type==='notes'&&st.notes.length>=p.need)st.solved[p.id]=true;return true},
 collectItem(L,st,i){if(!Number.isInteger(i)||i<0||i>=L.items.length||st.items.includes(i))return false;st.items.push(i);return true},
 submit(L,st,pid,ans){const p=L.puzzles.find(q=>q.id===pid);if(!p||p.type!=='code'||typeof ans!=='string'||ans.length!==p.len||!/^\d+$/.test(ans))return'invalid';
  if(st.solved[pid])return'already';if(ans!==Rules.answers(L,st.seed)[pid])return'wrong';st.solved[pid]=true;return'ok'},
 useBreaker(L,st,pid){const p=L.puzzles.find(q=>q.id===pid);if(!p||p.type!=='items')return'invalid';if(st.solved[pid])return'already';if(st.items.length<p.need)return'need';st.solved[pid]=true;return'ok'},
 doorOpen(L,st,did,W){const d=L.doors&&L.doors[did],required=L.puzzles.filter(p=>p.door===did);return(required.length>0&&required.every(p=>!!st.solved[p.id]))||(!required.length&&!!(d&&d.env&&W&&W.env&&W.env[d.env]))},
 solidAt(L,st,x,z,W){const cx=Math.floor(x/CS),cz=Math.floor(z/CS),c=(L.map[cz]||'')[cx]||'#';if(c==='#')return true;if(DCH[c])return!Rules.doorOpen(L,st,DCH[c],W);
  const dx=Math.abs(x-(cx+.5)*CS),dz=Math.abs(z-(cz+.5)*CS);if(c==='P')return dx<.6&&dz<.6;if(c==='D')return dx<.95&&dz<.55;return false},
 cellPos(c){return[(c.cx+.5)*CS,(c.cy+.5)*CS]},
 wallDir(w){return{N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]}[w]},
 puzzlePt(p){const q=Rules.cellPos(p.at),d=Rules.wallDir(p.at.wall);return[q[0]+d[0]*.8,q[1]+d[1]*.8]},
 THEMES:{yellow:{wall:'#a39a45',floor:'#665a2c',ceil:'#c4c096',fog:0x1c1c08,amb:0x6a6a30,lamp:0xf2f0a0,panel:[.93,.96,.68]},red:{wall:'#7a2a24',floor:'#3d1612',ceil:'#6e504a',fog:0x1e0806,amb:0x7a3a30,lamp:0xff9a80,panel:[1,.55,.45]},water:{wall:'#7fa7a4',floor:'#4a7a86',ceil:'#b9d2d0',fog:0x08161a,amb:0x4a7a84,lamp:0xcfe8ff,panel:[.8,.92,1]},white:{wall:'#b9b7ae',floor:'#8a8880',ceil:'#d8d6cc',fog:0x141414,amb:0x82827c,lamp:0xffffff,panel:[1,1,.95]},void:{wall:'#3a3a1e',floor:'#24240f',ceil:'#34342a',fog:0x060604,amb:0x4a4a2c,lamp:0xf2f0a0,panel:[.9,.92,.65]}},
 exitPt(L){const e=L.exit;return[e.cx*CS-.5,(e.cy0+e.cy1+1)/2*CS]},
 startPt(L){return Rules.cellPos(L.start)}};
// ---------------- LEVEL 0 (64x44) ----------------
const g=grid(64,44);
g.c(2,36,7,41);g.c(8,38,41,39);                  // 시작의 방, 남쪽 긴 복도
g.c(14,28,14,37);g.c(10,20,18,27);               // 분기1 -> 방 A(기록실)
g.c(26,30,26,37);g.c(22,22,30,29);               // 분기2 -> 방 B (A와 똑같은 구조)
g.c(19,25,21,25);                                // A-B 연결
g.c(36,19,36,37);g.c(32,10,38,18);               // 분기3 -> 막다른 방
g.c(31,26,35,26);                                // B-분기3 연결(루프)
g.c(42,38,42,38);g.s(43,38,'1');g.c(44,38,44,38);// 잠긴 문 D1
g.c(45,30,60,41);                                // 넓은 사무실 홀
g.c(52,24,52,29);g.c(46,14,58,23);               // 좁은 통로, 개방형 사무실
g.c(59,18,62,18);g.c(62,19,62,33);g.c(61,33,61,33);// 우회로(루프)
g.c(47,10,47,13);g.c(40,4,48,9);                 // 숨겨진 통로와 방
g.s(54,13,'2');g.c(50,1,62,12);                  // 잠긴 문 D2, 최종 구역
g.c(63,5,63,6,'E');                              // 출구
for(const[x,y]of[[12,22],[16,22],[12,25],[16,25],[24,24],[28,24],[24,27],[28,27],[48,33],[48,37],[56,33],[56,37],[52,35],[52,4],[60,4],[52,9],[60,9],[56,6]])g.s(x,y,'P');
for(const[x,y]of[[3,37],[38,12],[46,31],[59,40],[59,31],[48,16],[50,16],[56,16],[56,21],[48,21]])g.s(x,y,'D');
const dg=(A,i)=>+A.p2[i];
const L0={id:'level0',name:'LEVEL 0',next:'level1',darkZone:5,intro:'어디선가 형광등이 윙윙거린다. 이곳이 어디인지, 어떻게 왔는지 기억나지 않는다.',
 goal:'복도 끝의 잠긴 문을 열고 사무실 구역을 지나, 최종 구역 분전함에 퓨즈 2개를 꽂아 출구를 열어라.',
 map:g.out(),start:{cx:4,cy:39,yaw:-Math.PI/2},exit:{cx:63,cy0:5,cy1:6},
 doors:{d1:{lockedMsg:'잠겨 있다. 문 옆 벽의 키패드에 비밀번호를 입력해야 한다.'},d2:{lockedMsg:'사무실 깊은 곳의 문이다. 4자리 비밀번호가 필요하다.'},exit:{lockedMsg:'전원이 꺼져 있다. 분전함에 퓨즈 2개가 필요하다.'}},
 notes:[
  {cx:11,cy:21,text:A=>'복도 끝 문의 비밀번호, 첫 번째 숫자는 '+A.p1[0]+'. 기록실 선반 번호였다.'},
  {cx:23,cy:28,text:A=>'두 번째 숫자는 '+A.p1[1]+'. 이 방은 앞의 기록실과 똑같이 생겼다.'},
  {cx:33,cy:11,text:A=>'마지막 숫자는 '+A.p1[2]+'. 막다른 방의 벽에 적혀 있었다.'},
  {cx:58,cy:32,text:A=>'사무실 문 암호(4자리)의 첫 번째 숫자는 '+A.p2[0]+'.'},
  {cx:57,cy:22,text:A=>'사무실 문 암호의 첫째와 둘째 숫자의 합은 '+(dg(A,0)+dg(A,1))+'.'},
  {cx:62,cy:24,text:A=>'사무실 문 암호의 세 번째 숫자는 '+A.p2[2]+'. 돌아가는 길에 적어 두었다.'},
  {cx:41,cy:5,text:A=>'사무실 문 암호의 셋째와 넷째 숫자의 합은 '+(dg(A,2)+dg(A,3))+'.'},
  {cx:55,cy:6,text:()=>'출구는 전원이 필요하다. 분전함에 퓨즈 두 개를 꽂아라. 하나는 숨겨진 방에, 하나는 우회로에 있다.'},
  {cx:44,cy:7,key:true,text:()=>'낡은 메모: "진짜 출구에는 초록색 표지가 없다. 표지가 달린 문은 모두 거짓이다. 붉은 복도에서는 이것을 잊지 마라."'}],
 items:[{cx:47,cy:7},{cx:62,cy:31}],
 puzzles:[{id:'p1',type:'code',len:3,door:'d1',at:{cx:41,cy:38,wall:'N'}},{id:'p2',type:'code',len:4,door:'d2',at:{cx:53,cy:14,wall:'N'}},{id:'p3',type:'items',need:2,door:'exit',at:{cx:60,cy:12,wall:'S'}}],
 lit:(x,y)=>!(y<=13&&x>=40&&x<=48)&&!(x===62&&y>=19&&y<=33),
 zone:(cx,cy)=>(cy<=13&&cx>=40&&cx<=48)||(cx===62&&cy>=19&&cy<=33)?5:(cx<=7&&cy>=36)?1:(cx>=10&&cx<=30&&cy>=20&&cy<=29)?2:(cx>=45&&cy>=30)?3:(cx>=46&&cy>=14&&cy<=23)?4:(cy<=12&&cx>=50)?6:0};
// ---------------- LEVEL 1 (28x17) ----------------
const h=grid(28,17);
h.c(1,12,5,15);h.c(8,4,20,13);h.c(1,1,5,4);h.c(23,1,26,5);h.c(22,12,26,15);h.c(3,5,3,11);h.c(6,13,7,13);h.c(7,1,22,2);h.c(14,3,14,3);h.c(6,1,6,1);h.c(21,13,21,13);h.c(10,14,10,15);h.c(27,13,27,14,'E');h.s(0,2,'3');
for(const x of[10,13,16,19])for(const y of[6,9,12])h.s(x,y,'P');h.s(2,14,'D');h.s(24,4,'D');
const L1={id:'level1',name:'LEVEL 1',next:'level2',darkZone:5,intro:'벽지가 바뀌었다. 같은 소리인데 다른 장소 같다.',goal:'흩어진 퓨즈 3개를 찾아 남동쪽 방의 퓨즈 상자에 꽂아라.',
 map:h.out(),start:{cx:4,cy:15,yaw:0},exit:{cx:27,cy0:13,cy1:14},
 doors:{exit:{lockedMsg:'전원이 꺼져 있다. 퓨즈 상자를 찾아라.'},x1:{env:'void_open',to:'void',lockedMsg:'북서쪽 방의 서쪽 벽에 얇은 틈이 있다. 지금은 아무 일도 일어나지 않는다.'}},
 switches:[{id:'sw1',cx:1,cy:3,wall:'W',zone:7,label:'형광등 스위치'}],stay:{zone:7,secs:20,env:'void_open',msg:'방이 숨을 쉬었다. 서쪽 벽의 틈이 벌어진다.'},
 notes:[{cx:4,cy:13,text:()=>'퓨즈 세 개가 사라졌다. 북쪽 방, 북서쪽 방, 그리고 홀 아래쪽 좁은 틈에 하나씩 떨어져 있다.'},{cx:14,cy:8,text:()=>'퓨즈 상자는 남동쪽 방 벽에 있다. 서쪽 통로는 어둡다. 불이 나간 곳에서는 벽을 따라 걸어라.'},
  {cx:3,cy:8,key:true,text:()=>'벽에 적힌 글: "불을 끄고, 아무도 곁에 없이, 가만히 서 있으면 북서쪽 방의 벽이 숨을 쉰다." 그리고 그 아래: "문은 선택이다. 모두와 나갈 수 있는 길은 한 곳뿐."'}],
 items:[{cx:2,cy:2},{cx:25,cy:2},{cx:10,cy:15}],
 puzzles:[{id:'box',type:'items',need:3,door:'exit',at:{cx:25,cy:15,wall:'S'}}],
 lit:(x,y)=>!(x<=5&&y>=5&&y<=11)&&!(x===10&&y>=14),
 zone:(cx,cy)=>(cx<=5&&cy<=4)?7:(cx<=5&&cy>=5&&cy<=11)?5:cy<=3?1:cx>=22?3:2};
// ---------------- SPECIAL ∅: The Empty ----------------
const v=grid(36,26);v.c(2,10,5,15);v.c(6,12,7,13);v.c(8,3,27,22);v.c(2,2,5,5);v.c(6,3,7,4);v.c(2,19,5,22);v.c(6,20,7,21);v.c(28,4,29,5);v.c(30,3,33,6);v.c(28,20,29,21);v.c(30,19,33,22);v.c(28,12,29,13);v.c(30,10,34,15);v.c(35,12,35,13,'E');
for(const x of[12,17,22])for(const y of[8,13,18])v.s(x,y,'P');
const LV={id:'void',name:'SPECIAL ∅ — The Empty',next:'level1',ret:true,special:true,theme:'void',darkZone:5,dim:.18,intro:'아무도 없다. 소리도 없다. 발소리만 남는다.',
 goal:'메아리 조각 4개를 모두 찾아라. 불빛이 줄어들수록 소리도 줄어든다.',map:v.out(),start:{cx:3,cy:12,yaw:-Math.PI/2},exit:{cx:35,cy0:12,cy1:13},
 doors:{exit:{lockedMsg:'문이 보이지 않는다. 메아리 조각을 모두 찾아야 한다.'}},
 notes:[{cx:3,cy:3,text:()=>'메아리 1/4 — 이곳은 누군가의 기억에서 지워진 방이다.'},{cx:31,cy:4,text:()=>'메아리 2/4 — 불빛이 줄어들수록 내 발소리만 또렷해진다.'},{cx:3,cy:21,text:()=>'메아리 3/4 — 다른 사람들은 처음부터 없었던 걸까.'},{cx:31,cy:20,text:()=>'메아리 4/4 — 이제 동쪽 끝에서 문이 열린다. 돌아가도 아무도 기다리지 않는다.'}],
 items:[],puzzles:[{id:'void',type:'notes',need:4,door:'exit'}],lit:(x,y)=>!(x>=8&&x<=27&&y>=3&&y<=22)||(x%5===0&&y%5===0),zone:(cx)=>(cx>=8&&cx<=27)?5:(cx>=30)?6:1};
// ---------------- LEVEL 2: THE FLOODED SERVICE WING ----------------
const w=grid(34,24);
w.c(1,10,8,14);w.c(7,11,26,13);w.c(8,5,13,10);w.c(10,3,22,5);w.c(20,5,22,11);w.c(20,14,25,19);w.c(24,11,33,13);w.c(28,5,31,11);w.c(27,13,30,18);w.c(14,13,16,19);w.c(11,18,20,20);w.c(1,2,5,6);w.c(5,6,8,10);w.c(33,11,33,12,'E');
for(const [x,y] of [[9,7],[12,7],[21,8],[29,8],[22,16],[17,18],[4,4],[29,16]])w.s(x,y,'P');
w.s(2,12,'D');w.s(29,12,'D');
const L2={id:'level2',name:'LEVEL 2 — THE FLOODED SERVICE WING',next:'level3',theme:'water',darkZone:5,intro:'물은 발목 아래까지 차 있다. 어딘가에서 펌프가 돌지만, 물결은 반대 방향으로 흐른다.',goal:'배수 펌프실의 퓨즈 3개를 찾아 동쪽 비상문 전원을 복구하라.',map:w.out(),start:{cx:3,cy:12,yaw:0},exit:{cx:33,cy0:11,cy1:12},doors:{exit:{lockedMsg:'비상문 전원이 끊겨 있다. 펌프실 퓨즈 3개가 필요하다.'}},
 notes:[{cx:3,cy:4,text:()=>'작업일지: 물은 북쪽에서 밀려오지만 수위 센서는 남쪽을 가리킨다. 펌프의 순서를 바꿔야 한다.'},{cx:11,cy:7,text:()=>'배전반은 동쪽 서비스 통로 끝에 있다. 퓨즈가 빠진 슬롯은 세 개.'},{cx:17,cy:18,text:()=>'누군가 물속에 서 있었다. 내가 고개를 들자 천장 조명만 흔들렸다.'},{cx:29,cy:16,key:true,text:()=>'주의: 펌프가 멈춘 뒤에도 물결이 움직이면, 그쪽으로 가지 마라.'}],
 items:[{cx:4,cy:4},{cx:21,cy:16},{cx:29,cy:8}],puzzles:[{id:'pumpbox',type:'items',need:3,door:'exit',at:{cx:29,cy:12,wall:'E'}}],
 lit:(x,y)=>!(x>=14&&x<=20&&y>=13&&y<=20)&&!(x>=27&&y>=14),zone:(cx,cy)=>(cx>=14&&cx<=20&&cy>=13)?5:(cx>=27&&cy>=14)?6:(cy<=5)?2:1};
// ---------------- LEVEL 3: THE RED HALL ----------------
const r=grid(38,26);
r.c(1,18,7,22);r.c(6,20,15,22);r.c(14,12,17,21);r.c(15,11,27,14);r.c(25,5,28,12);r.c(27,4,34,7);r.c(33,7,37,18);r.c(26,17,34,20);r.c(18,17,27,19);r.c(2,8,8,13);r.c(7,12,15,14);r.c(2,3,5,7);r.c(4,7,7,9);r.c(37,16,37,17,'E');
for(const [x,y] of [[4,20],[10,21],[15,16],[22,12],[27,9],[32,17],[30,5],[4,10]])r.s(x,y,'P');
r.s(6,21,'D');r.s(33,17,'D');
const L3={id:'level3',name:'LEVEL 3 — THE RED HALL',next:'level4',theme:'red',darkZone:5,intro:'붉은 조명 아래 복도는 지나온 곳과 똑같아 보인다. 벽의 숫자는 걸을 때마다 바뀐다.',goal:'세 개의 기록을 찾아 경보 패널을 해제하고, 붉은 복도가 끝나기 전에 출구를 찾아라.',map:r.out(),start:{cx:3,cy:21,yaw:-Math.PI/2},exit:{cx:37,cy0:16,cy1:17},doors:{exit:{lockedMsg:'경보 패널이 잠겨 있다. 기록 3개를 찾아야 한다.'}},
 notes:[{cx:3,cy:5,text:()=>'기록 01: 빨간 불이 두 번 깜박이면 멈춰라. 세 번째 깜박임은 네 뒤에서 온다.'},{cx:16,cy:18,text:()=>'기록 02: 경보 패널의 세 칸은 왼쪽부터 켜야 한다. 순서를 틀리면 경보가 다시 시작된다.'},{cx:31,cy:6,key:true,text:()=>'기록 03: 이곳의 출구 표지는 초록색이다. 이전 메모를 믿지 말 것. 혹은 믿을 것.'},{cx:31,cy:18,text:()=>'패널이 해제되면 복도 끝의 비상문으로 달려라. 뒤돌아보지 마라.'}],
 items:[{cx:4,cy:5},{cx:22,cy:12},{cx:30,cy:18}],puzzles:[{id:'alarmbox',type:'items',need:3,door:'exit',at:{cx:33,cy:17,wall:'E'}}],
 lit:(x,y)=>(x+y)%7!==0,zone:(cx,cy)=>(cx>=25&&cy<=12)?5:(cx>=28&&cy>=15)?6:(cx<=8&&cy<=13)?2:1};


// ---------------- LEVEL 4: THE FORGOTTEN SCHOOL ----------------
const s4=grid(36,25);
s4.c(1,11,7,15);s4.c(6,12,16,14);s4.c(10,5,14,12);s4.c(12,4,24,6);s4.c(21,5,24,14);s4.c(15,13,23,15);s4.c(22,14,30,16);s4.c(28,7,31,15);s4.c(29,6,34,8);s4.c(33,8,34,19);s4.c(27,18,34,20);s4.c(19,18,28,20);s4.c(18,15,20,19);s4.c(2,3,7,7);s4.c(6,6,10,12);s4.c(35,12,35,13,'E');
for(const [x,y] of [[4,4],[12,5],[22,9],[30,7],[25,19],[4,13],[17,14],[32,18]])s4.s(x,y,'P');s4.s(5,13,'D');s4.s(29,15,'D');
const L4={id:'level4',name:'LEVEL 4 — THE FORGOTTEN SCHOOL',next:'level5',theme:'white',darkZone:5,intro:'종이 울렸지만 학교에는 학생도 선생도 없다. 교실 문마다 다른 날짜가 적혀 있다.',goal:'교실과 교무실에서 출석부 3개를 찾아 비상문 잠금을 해제하라.',map:s4.out(),start:{cx:3,cy:13,yaw:0},exit:{cx:35,cy0:12,cy1:13},doors:{exit:{lockedMsg:'비상문이 잠겨 있다. 출석부 3개를 찾아야 한다.'}},notes:[{cx:4,cy:4,text:()=>'칠판: 오늘은 졸업식이다. 하지만 출석부에는 아무 이름도 없다.'},{cx:12,cy:5,text:()=>'교실 기록: 첫 번째 출석부는 창가 책상 아래에 있었다.'},{cx:25,cy:19,text:()=>'교무실 메모: 종이 세 번 울리면 복도 가운데를 걷지 마라.'},{cx:32,cy:18,key:true,text:()=>'누군가 출석을 부르고 있다. 대답하지 말 것.'}],items:[{cx:4,cy:4},{cx:22,cy:9},{cx:25,cy:19}],puzzles:[{id:'schoolbox',type:'items',need:3,door:'exit',at:{cx:29,cy:15,wall:'E'}}],lit:(x,y)=>(x+y)%9!==0,zone:(cx,cy)=>(cx<=8&&cy<=8)?2:(cx>=27&&cy>=16)?5:1};
// ---------------- LEVEL 5: THE INFINITE MALL ----------------
const s5=grid(38,25);
s5.c(1,11,8,15);s5.c(7,12,30,14);s5.c(9,5,14,12);s5.c(11,4,24,6);s5.c(22,5,25,12);s5.c(24,11,32,14);s5.c(31,12,37,13);s5.c(29,5,33,12);s5.c(30,4,36,6);s5.c(31,14,35,19);s5.c(24,18,32,20);s5.c(17,17,25,19);s5.c(16,14,18,18);s5.c(2,3,7,7);s5.c(6,6,10,12);s5.c(37,12,37,13,'E');
for(const [x,y] of [[4,4],[11,5],[23,9],[32,5],[28,19],[4,13],[17,17],[33,17],[15,13]])s5.s(x,y,'P');s5.s(5,13,'D');s5.s(32,14,'D');
const L5={id:'level5',name:'LEVEL 5 — THE INFINITE MALL',next:'level6',theme:'yellow',darkZone:5,intro:'폐점 방송이 반복된다. 매장 이름은 익숙하지만, 쇼윈도 안의 마네킹은 조금씩 가까워진다.',goal:'세 개의 전력 카드를 찾아 중앙 안내 데스크를 작동시키고 동쪽 출구로 가라.',map:s5.out(),start:{cx:3,cy:13,yaw:0},exit:{cx:37,cy0:12,cy1:13},doors:{exit:{lockedMsg:'셔터 전원이 없다. 전력 카드 3개가 필요하다.'}},notes:[{cx:4,cy:4,text:()=>'안내 방송: 고객 여러분, 폐점 시간이 지났습니다. 출구는 언제나 같은 방향입니다.'},{cx:23,cy:9,text:()=>'매장 직원 메모: 중앙 안내 데스크에서 전력 카드를 등록해야 셔터가 열린다.'},{cx:28,cy:19,text:()=>'쇼윈도에 비친 사람이 나보다 한 걸음 늦게 움직였다.'},{cx:33,cy:17,key:true,text:()=>'에스컬레이터는 아래로 내려가지만, 발소리는 위에서 들린다.'}],items:[{cx:4,cy:4},{cx:23,cy:9},{cx:28,cy:19}],puzzles:[{id:'mallbox',type:'items',need:3,door:'exit',at:{cx:32,cy:14,wall:'E'}}],lit:(x,y)=>(x*3+y)%11!==0,zone:(cx,cy)=>(cx>=28&&cy>=16)?5:(cx<=8&&cy<=8)?2:1};
// ---------------- LEVEL 6: THE BLACKOUT ----------------
const s6=grid(40,27);
s6.c(1,12,7,16);s6.c(6,13,17,15);s6.c(10,5,14,13);s6.c(12,4,25,6);s6.c(22,5,25,14);s6.c(16,13,24,16);s6.c(23,14,33,16);s6.c(31,7,34,15);s6.c(32,6,37,8);s6.c(36,8,38,20);s6.c(29,19,37,21);s6.c(20,19,30,21);s6.c(19,16,21,20);s6.c(2,3,7,7);s6.c(6,6,10,13);s6.c(39,12,39,13,'E');
for(const [x,y] of [[4,4],[12,5],[24,9],[34,7],[27,20],[4,14],[18,15],[36,18],[32,12]])s6.s(x,y,'P');s6.s(5,14,'D');s6.s(33,15,'D');
const L6={id:'level6',name:'LEVEL 6 — THE BLACKOUT',next:'level7',theme:'void',darkZone:5,dim:.25,intro:'마지막 구역에서는 비상등만 살아 있다. 뒤에서 들리는 발걸음은 네 속도에 맞춰진다.',goal:'비상 전지 4개를 모아 비상문을 열어라. 출구 앞에서 선택을 내려야 한다.',map:s6.out(),start:{cx:3,cy:14,yaw:0},exit:{cx:39,cy0:12,cy1:13},doors:{exit:{lockedMsg:'비상문이 열리지 않는다. 비상 전지 4개가 필요하다.'}},notes:[{cx:4,cy:4,text:()=>'비상 매뉴얼: 불이 꺼지면 전지를 찾고, 소리가 가까워지면 숨을 멈춰라.'},{cx:12,cy:5,text:()=>'첫 번째 전지는 제어실에 있다.'},{cx:27,cy:20,text:()=>'문 너머의 목소리가 이름을 부른다. 대답하지 마라.'},{cx:36,cy:18,key:true,text:()=>'마지막 문은 탈출구이자 선택이다. 무엇을 남길지는 네가 결정한다.'}],items:[{cx:4,cy:4},{cx:24,cy:9},{cx:27,cy:20},{cx:36,cy:18}],puzzles:[{id:'blackoutbox',type:'items',need:4,door:'exit',at:{cx:33,cy:15,wall:'E'}}],lit:(x,y)=>(x+y)%13!==0,zone:(cx,cy)=>(cx>=29&&cy>=18)?5:(cx<=8&&cy<=8)?2:1};


// ---------------- LARGE MAIN STORY LEVELS 7-30 ----------------
// Each level is a large connected 76x54-cell map (~228m x 162m at current scale),
// with a different theme, branching wings, loop routes, landmarks, notes and collectible objectives.
const EXTRA_LEVEL_META=[
 ['level7','LEVEL 7 — ENDLESS CITY','white','도시의 가로등은 켜져 있지만 창문 안에는 아무도 없다.','아파트 단지와 지하 연결 통로에서 도시 기록 4개를 찾아 지하 출구 전원을 복구하라.'],
 ['level8','LEVEL 8 — THE SUBURBS','yellow','모든 집의 현관문이 열려 있다. 안에서는 같은 저녁 뉴스가 반복된다.','주택가의 우편함 단서와 전력 부품 4개를 모아 외곽 도로를 열어라.'],
 ['level9','LEVEL 9 — POOLROOMS','water','타일에 울리는 물소리가 너무 크다. 수면 아래에서 발걸음이 따라온다.','수영장 구역을 탐험해 밸브 부품 4개를 모으고 배수문을 열어라.'],
 ['level10','LEVEL 10 — THE FUNHOUSE','red','거울 속 당신은 한 박자 늦게 움직인다. 어떤 거울은 아예 반대편을 비춘다.','거울 복도와 놀이 구역에서 표식 4개를 찾아 출구 패널을 해제하라.'],
 ['level11','LEVEL 11 — THE FORGOTTEN SCHOOL','white','종이 울렸지만 학교에는 학생도 선생도 없다. 출석부의 이름은 모두 지워져 있다.','교실과 체육관을 탐색해 출석 기록 4개를 모아 비상문을 열어라.'],
 ['level12','LEVEL 12 — THE HOSPITAL','white','빈 병실마다 모니터가 켜져 있다. 화면에는 당신의 현재 위치가 표시된다.','병동과 수술실에서 의료 키카드 4개를 찾아 격리 구역을 탈출하라.'],
 ['level13','LEVEL 13 — THE LIBRARY','yellow','책장 사이에서 누군가 책장을 넘긴다. 책 제목은 당신이 아직 하지 않은 선택이다.','서고의 색인 단서 4개를 찾아 기록 보관실의 잠금을 풀어라.'],
 ['level14','LEVEL 14 — THE FACTORY','red','기계는 멈췄지만 컨베이어 벨트 위의 그림자는 계속 움직인다.','공장 여러 동에서 전력 셀 4개를 찾아 제어실을 재가동하라.'],
 ['level15','LEVEL 15 — THE TRAIN STATION','void','안내 방송이 도착하지 않은 열차의 플랫폼 번호를 부른다.','플랫폼과 터널을 오가며 신호 모듈 4개를 모아 출구 열차를 호출하라.'],
 ['level16','LEVEL 16 — THE INFINITE MALL','yellow','폐점 방송이 반복된다. 쇼윈도 속 마네킹은 눈을 돌릴 때마다 가까워진다.','매장과 서비스 복도에서 전력 카드 4개를 모아 셔터를 열어라.'],
 ['level17','LEVEL 17 — THE FLOODED HALL','water','물은 무릎까지 차올랐지만 벽의 물자국은 천장에 남아 있다.','침수된 홀의 펌프 부품 4개를 모아 수위를 낮추고 출구를 열어라.'],
 ['level18','LEVEL 18 — THE RED HALLWAY','red','붉은 비상등이 켜질 때마다 복도 구조가 조금씩 바뀐다.','각 구역의 경보 기록 4개를 수집하고 마지막 비상문을 해제하라.'],
 ['level19','LEVEL 19 — THE SILENT FOREST','void','나무 사이로 보이는 불빛은 가까이 갈수록 멀어진다. 새소리조차 없다.','숲의 관측 표식 4개를 찾아 산림 관측소의 문을 열어라.'],
 ['level20','LEVEL 20 — THE BUNKER','red','벽 너머에서 누군가 두드린다. 두드리는 간격은 당신의 심장 박동과 같다.','벙커 구역의 전원 모듈 4개를 찾아 격벽을 해제하라.'],
 ['level21','LEVEL 21 — THE SERVER ROOM','void','랙의 상태 표시등이 당신이 다가올 때마다 하나씩 꺼진다.','서버 구역의 데이터 코어 4개를 회수하고 냉각 시스템을 재가동하라.'],
 ['level22','LEVEL 22 — THE CLOCKWORK','white','벽시계는 모두 다른 시간을 가리키지만 초침은 같은 박자로 움직인다.','시계실의 태엽 부품 4개를 모아 중앙 시계문을 열어라.'],
 ['level23','LEVEL 23 — THE BLACKOUT','void','비상등만 남았다. 뒤에서 들리는 발걸음은 당신의 속도에 맞춰진다.','정전 구역에서 비상 전지 4개를 모아 마지막 문을 열어라.'],
 ['level24','LEVEL 24 — THE MIRROR MAZE','red','거울 속 복도는 실제 복도보다 길다. 가끔 거울 속의 당신만 먼저 달린다.','거울 미로에서 반사 표식 4개를 찾아 진짜 출구를 식별하라.'],
 ['level25','LEVEL 25 — THE LAST SHELTER','yellow','안전하다는 방송이 들리지만, 대피소 문 안쪽에는 손톱 자국이 가득하다.','대피소 각 구역의 생존 기록 4개를 찾아 최종 격벽을 열어라.'],
 ['level26','LEVEL 26 — THE THRESHOLD','void','이곳의 모든 문은 처음 왔던 장소로 이어지는 것처럼 보인다.','경계 구역에서 기록 4개를 모으고 현실로 이어지는 문을 찾아라.'],
 ['level27','LEVEL 27 — THE OBSERVER','white','감시 카메라는 모두 꺼져 있다. 그런데 모니터에는 당신의 뒷모습이 보인다.','관측실과 통제 구역에서 렌즈 모듈 4개를 모아 감시 시스템을 차단하라.'],
 ['level28','LEVEL 28 — THE ARCHIVE','yellow','기록된 사건은 당신이 기억하는 순서와 다르다. 마지막 페이지는 아직 젖어 있다.','기록 보관소에서 문서 조각 4개를 찾아 사건의 순서를 복원하라.'],
 ['level29','LEVEL 29 — THE LAST SIGNAL','water','무전기에서 구조 신호가 들린다. 송신 위치는 매번 다른 층으로 바뀐다.','신호 중계기 4개를 활성화하고 구조 통로를 열어라.'],
 ['level30','LEVEL 30 — NO REAL, NO HERE','void','벽지가 벗겨지며 그 아래에 시작 지점의 벽이 드러난다. 이곳은 끝이 아니라 선택이다.','마지막 구역의 기억 조각 4개를 모으고, 어떤 엔딩을 맞이할지 결정하라.']
];
function makeLargeLevel(meta,idx){
 const [id,name,theme,intro,goal]=meta,W=76,H=54,mid=27,gg=grid(W,H);
 // A long central spine with alternating broad rooms and connected side wings.
 gg.c(2,mid-2,W-3,mid+2,'.');
 const centers=[7,16,25,34,43,52,61,69];
 centers.forEach((cx,j)=>{
   const top=(j%2===0), y0=top?4:mid+3, y1=top?mid-3:H-5;
   gg.c(Math.max(3,cx-4),y0,Math.min(W-4,cx+4),y1,'.');
   const vx=cx+(j%3===0?2:-1);gg.c(vx,Math.min(y0,mid),vx,Math.max(y1,mid),'.');
   // side alcoves and a loop in every second wing create route choices
   if(j%2===0){gg.c(Math.max(3,cx-9),top?8:mid+7,Math.max(3,cx-5),top?12:mid+11,'.');gg.c(Math.max(3,cx-5),top?10:mid+9,cx,top?10:mid+9,'.')}
   else {gg.c(Math.min(W-4,cx+5),top?mid-10:H-10,Math.min(W-4,cx+9),top?mid-6:H-6,'.');gg.c(cx,top?mid-8:H-8,Math.min(W-4,cx+7),top?mid-8:H-8,'.')}
 });
 // Two lateral cross-routes join distant wings; these prevent a single straight corridor run.
 gg.c(10,mid-7,66,mid-5,'.');gg.c(12,mid+5,64,mid+7,'.');
 // Restore solid borders and mark a real exit at the far east end.
 for(let y=0;y<H;y++){gg.s(0,y,'#');gg.s(W-1,y,'#')}
 for(let x=0;x<W;x++){gg.s(x,0,'#');gg.s(x,H-1,'#')}
 gg.s(W-2,mid,'E');
 // Small props are kept away from primary objective cells and all main routes remain navigable.
 const itemPts=[[8,mid-9],[16,mid+11],[43,mid-9],[69,mid+11]];
 const notePts=[[5,mid-15],[17,mid+13],[25,mid-15],[34,mid+13],[43,mid-14],[69,mid+12]];
 // Place visual pillars only in broad room corners, never on the spine/cross-routes/objectives.
 const propPts=[];centers.forEach((cx,j)=>{const y=j%2===0?7:H-8;propPts.push([cx-3,y],[cx+3,y]);});
 for(const [x,y] of propPts)if(x>2&&x<W-2&&y>2&&y<H-2&&gg.out()[y][x]==='.')gg.s(x,y,'P');
 // Theme-specific blockers are placed at room edges, never on the main spine.
 const furniturePts=[[7,mid-7],[16,mid+8],[25,mid-7],[34,mid+8],[43,mid-7],[52,mid+8],[61,mid-7]];
 for(const [x,y] of furniturePts)if(x>2&&x<W-2&&y>2&&y<H-2&&gg.out()[y][x]==='.')gg.s(x,y,'D');
 const items=itemPts.map(([cx,cy])=>({cx,cy}));
 const notes=notePts.map(([cx,cy],i)=>({cx,cy,key:i===notesDummy(),text:()=>''}));
 // Deterministic story clues, with a final clue pointing toward the exit.
 notes.forEach((n,i)=>{n.key=i===5;n.text=()=>[
  '탐사 기록 01: 이 구역의 복도는 서로 연결되어 있다. 막다른 길처럼 보여도 옆방을 확인하라.',
  '탐사 기록 02: 전력 장치가 있는 방은 중앙 통로에서 떨어져 있다. 벽을 따라가면 연결 통로가 나온다.',
  '탐사 기록 03: 멀리서 들리는 발소리는 반드시 당신을 따라오는 것은 아니다. 소리가 멈출 때 주변을 살펴라.',
  '탐사 기록 04: 이곳의 표식은 방향을 알려주지만, 모든 표식이 진실을 말하지는 않는다.',
  '탐사 기록 05: 장치 부품 네 개가 모이면 출구의 잠금이 풀린다. 되돌아갈 길도 기억하라.',
  '마지막 메모: 출구는 동쪽 끝에 있다. 부품을 모두 모은 뒤에도 주변의 단서를 확인하라.'
 ][i]});
 const map=gg.out();
 return {id,name,next:idx<EXTRA_LEVEL_META.length-1?EXTRA_LEVEL_META[idx+1][0]:undefined,theme,darkZone:5,intro,goal,map,start:{cx:3,cy:mid,yaw:0},exit:{cx:W-2,cy0:mid,cy1:mid},doors:{exit:{lockedMsg:'출구 전원이 꺼져 있다. 이 레벨의 부품 4개를 모두 찾아라.'}},notes,items,puzzles:[{id:id+'_exit',type:'items',need:4,door:'exit',at:{cx:W-5,cy:mid,wall:'N'}}],lit:(x,y)=>theme==='void'?((x*3+y*7)%13!==0):theme==='red'?((x+y*2)%9!==0):theme==='water'?((x*5+y)%8!==0):((x+y)%11!==0),zone:(cx,cy)=>cx>56?5:cy<13?2:cy>40?3:cx<18?1:4};
}
function notesDummy(){return -999}
const EXTRA_LEVELS={};EXTRA_LEVEL_META.forEach((m,i)=>{EXTRA_LEVELS[m[0]]=makeLargeLevel(m,i)});

// Poolrooms has two separately traversable floors, linked by the stairwell exit.
const pool1=EXTRA_LEVELS.level9;
pool1.name='LEVEL 9 — POOLROOMS / FLOOR 1';
pool1.next='level9b';
pool1.goal='1층 수영장 구역에서 밸브 부품 4개를 모아 계단실의 문을 열고 2층으로 올라가라. 일부 초록색 물은 독성 세균 오염수다.';
pool1.toxicZones=[{x1:20,y1:25,x2:26,y2:29},{x1:48,y1:32,x2:54,y2:34}];
pool1.poolFloor=1;
const pool2Meta=['level9b','LEVEL 9 — POOLROOMS / FLOOR 2','water','2층의 물은 고요하다. 아래층에서 들리는 물소리가 천장 안쪽에서 울린다.','2층의 정비 통로에서 밸브 부품 4개를 모으고 최종 배수문을 열어라.'];
const pool2=makeLargeLevel(pool2Meta,2);
pool2.poolFloor=2;pool2.next='level10';pool2.start={cx:3,cy:27,yaw:0};pool2.toxicZones=[{x1:30,y1:25,x2:36,y2:29},{x1:55,y1:32,x2:56,y2:34}];
pool2.items=[{cx:8,cy:18},{cx:20,cy:38},{cx:47,cy:17},{cx:67,cy:40}];
pool2.notes=[{cx:5,cy:12,text:()=> '2층 기록: 초록빛 수면에 맨살이 닿으면 즉시 물 밖으로 나와라.'},{cx:18,cy:40,text:()=> '배수 밸브는 계단 반대편 정비실에 있다.'},{cx:43,cy:12,text:()=> '난간 너머 아래층에는 아무도 없어야 한다.'},{cx:68,cy:42,key:true,text:()=> '마지막 부품을 꽂으면 동쪽 배수문이 열린다.'}];
pool2.puzzles=[{id:'level9b_exit',type:'items',need:4,door:'exit',at:{cx:71,cy:27,wall:'N'}}];

// SAFE HUB: entity-free, well-lit rest area. Exit returns to the previous level.
function makeHub(id,name,theme,shop){const q=grid(30,22);q.c(2,2,27,19);q.c(1,9,1,12);q.c(28,9,28,12,'E');for(const x of [7,12,17,22])for(const y of [6,15])q.s(x,y,'D');return{id,name,next:undefined,safe:true,shop:!!shop,theme:theme||'white',darkZone:-1,intro:shop?'글자가 깨진 틈 너머의 상점.':'아무 소리도 들리지 않는다. 여기서는 엔티티가 나타나지 않는다.',goal:shop?'원하는 물건을 둘러보고 출구로 돌아가라.':'안전 구역에서 숨을 고르고, 준비가 끝나면 출구로 돌아가라.',map:q.out(),start:{cx:4,cy:11,yaw:0},exit:{cx:28,cy0:9,cy1:12},doors:{exit:{lockedMsg:'출구가 잠겨 있다.'}},notes:[],items:[],puzzles:[],lit:()=>true,zone:()=>0}};
const SAFE_HUB=makeHub('sanctuary','SAFE LEVEL — THE QUIET ROOM','white',false);
const GLITCH_SHOP=makeHub('glitchshop','GL!TCH SHOP — ???','void',true);
const ALL_LEVELS={level0:L0,level1:L1,level2:L2,level3:L3,level4:L4,level5:L5,level6:L6,void:LV,sanctuary:SAFE_HUB,glitchshop:GLITCH_SHOP,...EXTRA_LEVELS,level9b:pool2};
// A second 4/3 expansion combines with the original 1.5x pass for 2x original width and height.
const LEVEL_EXPANSION=4/3;
function expandLevel(L){
 const old=L.map.map(r=>[...r]),oldH=old.length,oldW=old[0].length;
 const newH=Math.ceil(oldH*LEVEL_EXPANSION),newW=Math.ceil(oldW*LEVEL_EXPANSION);
 const expanded=Array.from({length:newH},()=>Array(newW).fill('#'));
 for(let y=0;y<oldH;y++)for(let x=0;x<oldW;x++){
  const x0=Math.floor(x*LEVEL_EXPANSION),x1=Math.floor((x+1)*LEVEL_EXPANSION);
  const y0=Math.floor(y*LEVEL_EXPANSION),y1=Math.floor((y+1)*LEVEL_EXPANSION);
  for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++)expanded[yy][xx]=old[y][x];
 }
 L.map=expanded.map(r=>r.join(''));
 const point=v=>Math.floor((v+.5)*LEVEL_EXPANSION);
 const startRange=v=>Math.floor(v*LEVEL_EXPANSION);
 const endRange=v=>Math.floor((v+1)*LEVEL_EXPANSION)-1;
 const walk=(o,parentKey='')=>{
  if(!o||typeof o!=='object')return;
  if(Array.isArray(o)){o.forEach(v=>walk(v,parentKey));return}
  for(const k of Object.keys(o)){
   const v=o[k];
   if(typeof v==='number'){
    if(k==='cx'||k==='cy')o[k]=point(v);
    else if(k==='cy0')o[k]=startRange(v);
    else if(k==='cy1')o[k]=endRange(v);
    else if(k==='x1'||k==='y1')o[k]=startRange(v);
    else if(k==='x2'||k==='y2')o[k]=endRange(v);
   }else if(v&&typeof v==='object')walk(v,k);
  }
 };
 // Keep level rules aligned with the original logical zones after the map is enlarged.
 const oldZone=L.zone,oldLit=L.lit;
 walk(L);
 if(oldZone)L.zone=(x,y)=>oldZone(Math.floor(x/LEVEL_EXPANSION),Math.floor(y/LEVEL_EXPANSION));
 if(oldLit)L.lit=(x,y)=>oldLit(Math.floor(x/LEVEL_EXPANSION),Math.floor(y/LEVEL_EXPANSION));
 return L;
}
for(const L of Object.values(ALL_LEVELS))expandLevel(L);

// Large exploration levels now require both the collected components and a five-digit cipher.
// Each clue is embedded in an existing note, so the puzzle uses exploration rather than a random guess.
function addCipherPuzzle(L){
 const map=L.map.map(r=>r.split('')),H=map.length,W=map[0].length;
 const walk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&!['#','P','D'].includes(map[y][x]);
 const seen=new Set(),q=[[L.start.cx,L.start.cy]];
 if(walk(L.start.cx,L.start.cy))seen.add(L.start.cy*W+L.start.cx);
 for(let i=0;i<q.length;i++){const[x,y]=q[i];for(const[nx,ny]of[[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const k=ny*W+nx;if(walk(nx,ny)&&!seen.has(k)){seen.add(k);q.push([nx,ny])}}}
 const occupied=[L.start,L.exit,...(L.items||[]),...(L.notes||[]),...(L.puzzles||[]).map(p=>p.at).filter(Boolean)].filter(Boolean);
 const dirs=[['N',0,-1],['S',0,1],['E',1,0],['W',-1,0]];
 let best=null,bestScore=-1;
 for(let y=2;y<H-2;y++)for(let x=8;x<W-8;x++){
  if(map[y][x]!=='.'||!seen.has(y*W+x))continue;
  for(const[wall,dx,dy]of dirs){
   if(map[y+dy]?.[x+dx]!=='#')continue;
   const minDist=Math.min(...occupied.map(o=>Math.abs(x-(o.cx??o.cx0??o.cx??0))+Math.abs(y-(o.cy??o.cy0??0))));
   if(minDist<5)continue;
   const score=minDist-Math.abs(x-W*.56)*.08-Math.abs(y-H*.5)*.03;
   if(score>bestScore){bestScore=score;best={cx:x,cy:y,wall}}
  }
 }
 if(!best)throw new Error('No reachable cipher panel location for '+L.id);
 const pid=L.id+'_cipher';
 L.puzzles.push({id:pid,type:'code',len:5,door:'exit',at:best});
 const originals=L.notes.map(n=>n.text);
 L.notes.forEach((n,i)=>{
  if(i>3)return;
  n.text=A=>{
   const base=typeof originals[i]==='function'?originals[i](A):String(originals[i]||'');
   const code=String(A[pid]||'00000').padStart(5,'0'),d=code.split('').map(Number);
   const clues=[
    '암호 단서 A: 첫째 숫자는 '+d[0]+'. 첫째와 둘째 숫자의 합은 '+(d[0]+d[1])+'.',
    '암호 단서 B: 셋째 숫자는 '+d[2]+'. 셋째와 넷째 숫자의 합은 '+(d[2]+d[3])+'.',
    '암호 단서 C: 다섯째 숫자는 '+d[4]+'. 앞의 네 숫자만 입력하면 열리지 않는다.',
    '검증 기록: 다섯 자리 숫자의 합은 '+d.reduce((a,b)=>a+b,0)+'. 계산한 암호가 맞는지 확인하라.'
   ][i];
   return base+'<br><br><b>'+clues+'</b>';
  };
 });
 const d=L.doors.exit;d.lockedMsg=(d.lockedMsg||'출구가 잠겨 있다.')+' 분전함의 부품과 5자리 암호를 모두 해결해야 한다.';
}
for(const L of Object.values(ALL_LEVELS)){
 if(/^level(?:[7-9]|1[0-9]|2[0-9]|30)$/.test(L.id)||L.id==='level9b')addCipherPuzzle(L);
}

// Keep interactable collectibles clear of generated furniture so they cannot spawn inside pillars/desks.
for(const L of Object.values(ALL_LEVELS)){
 const mm=L.map.map(r=>r.split(''));
 const clearCell=(p)=>{if(!p||!Number.isInteger(p.cx)||!Number.isInteger(p.cy)||!mm[p.cy]||!mm[p.cy][p.cx])return;if(mm[p.cy][p.cx]==='P'||mm[p.cy][p.cx]==='D')mm[p.cy][p.cx]='.'};
 (L.items||[]).forEach(clearCell);(L.notes||[]).forEach(clearCell);
 L.map=mm.map(r=>r.join(''));
}
const out={Rules,LEVELS:ALL_LEVELS};
if(typeof module!=='undefined'&&module.exports)module.exports=out;else root.NRNH=out;
})(typeof window!=='undefined'?window:globalThis);
