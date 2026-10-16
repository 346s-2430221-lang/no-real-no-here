// WIP(미연결): LEVEL 22 / 21 / 30 초안. 엔진이 아직 지원하지 않는 기능(가짜 출구, 구조 대상, 제한 시간, 최종 선택 스테이션)을 전제로 한다.
// 이 파일은 index.html/서버에서 로드되지 않으며 게임에 포함되지 않는다. 구현 후 shared/levels.js의 LEVELS에 등록해야 한다.
// ---------------- LEVEL 22: The Red Hallway (가짜 출구) ----------------
const r=grid(40,30);for(const y of[5,12,19,26])r.c(3,y,36,y);for(const x of[8,18,28,36])r.c(x,5,x,26);
r.c(37,5,38,5);r.s(39,5,'E');r.c(21,14,25,17);r.c(23,13,23,13);
const L22={id:'level22',name:'LEVEL 22 — The Red Hallway',next:'level21',theme:'red',darkZone:-1,intro:'붉은 복도가 끝없이 반복된다. 초록색 EXIT 표지가 여기저기 켜져 있다.',
 goal:'표지가 없는 진짜 출구를 찾아 비밀번호를 풀어라. 초록 표지의 문은 믿지 마라.',map:r.out(),start:{cx:3,cy:26,yaw:-Math.PI/2},exit:{cx:39,cy0:5,cy1:5},
 doors:{exit:{lockedMsg:'표지 없는 붉은 문이다. 키패드에 비밀번호가 필요하다.'}},
 fakes:[{cx:36,cy:12,wall:'E'},{cx:3,cy:19,wall:'W'},{cx:28,cy:5,wall:'N'}],
 rescue:{id:'mara',cx:24,cy:16},
 notes:[{cx:10,cy:26,text:A=>'비밀번호의 첫 번째 숫자는 '+A.p1[0]+'. 복도 바닥에 번호가 적혀 있다.'},{cx:18,cy:19,text:A=>'두 번째 숫자는 '+A.p1[1]+'. 같은 교차로가 계속 나온다.'},{cx:28,cy:12,text:A=>'세 번째 숫자는 '+A.p1[2]+'. 이 숫자가 맞다면 문은 열린다.'},
  {cx:3,cy:12,text:()=>'초록색 EXIT 표지가 달린 문은 전부 가짜다. 진짜 출구는 동쪽 끝, 표지 없는 붉은 문이다.'},{cx:22,cy:15,key:true,text:()=>'마라의 메모: "나는 여기 숨어 있다. 나를 두고 가지 마. 이 층에서 길을 잃은 사람은 가짜 문으로 들어가 돌아오지 못했다."'}],
 items:[],anoms:[{cx:12,cy:5,text:'벽의 붉은 손자국이 같은 간격으로 계속 이어진다.'},{cx:23,cy:12,text:'이 앞의 벽 한 칸만 페인트 냄새가 나지 않는다.'}],
 puzzles:[{id:'p1',type:'code',len:3,door:'exit',at:{cx:38,cy:5,wall:'N'}}],lit:()=>true,zone:()=>0};
// ---------------- LEVEL 21: The Flooded Hall (제한 시간) ----------------
const w=grid(36,24);w.c(2,3,24,20);w.c(25,11,28,12);w.c(29,8,34,15);w.c(35,11,35,12,'E');w.c(25,18,26,18);w.c(27,16,29,19);
for(const x of[6,10,14,18,22])for(const y of[6,10,14,18])w.s(x,y,'P');
const L21={id:'level21',name:'LEVEL 21 — The Flooded Hall',next:'level30',theme:'water',darkZone:-1,intro:'발목까지 물이 차 있다. 수위가 계속 올라온다.',
 goal:'물이 차오르기 전에 퓨즈 2개를 모아 동쪽 제어실의 펌프를 켜라. 진을 구하는 것도 잊지 마라.',map:w.out(),start:{cx:3,cy:19,yaw:-Math.PI/2},exit:{cx:35,cy0:11,cy1:12},
 doors:{exit:{lockedMsg:'펌프가 꺼져 있다. 퓨즈 2개가 필요하다.'}},timer:{sec:270,puzzle:'pump'},rescue:{id:'jin',cx:13,cy:4},
 notes:[{cx:3,cy:17,text:()=>'경고: 수위가 올라온다. 펌프를 켜지 못하면 이 홀은 잠긴다. 진의 신호가 북쪽에서 들린다.'},{cx:12,cy:12,text:()=>'퓨즈는 홀 북서쪽과 북동쪽에 하나씩 떨어져 있다. 제어실은 동쪽 복도 끝이다.'},{cx:28,cy:18,key:true,text:()=>'기록: "물은 사람을 막으려는 것이 아니다. 문을 닫은 사람이 따로 있다. 출구는 하나가 아니라 선택이다."'}],
 items:[{cx:4,cy:5},{cx:23,cy:4}],anoms:[{cx:20,cy:8,text:'수위 표시선이 위가 아니라 아래로 이어진다.'}],
 puzzles:[{id:'pump',type:'items',need:2,door:'exit',at:{cx:33,cy:15,wall:'S'}}],lit:()=>true,zone:(cx)=>cx>=25?3:2};
// ---------------- LEVEL 30: The Threshold (최종 분기) ----------------
const t=grid(30,22);t.c(8,4,21,17);t.c(12,18,16,20);
const L30={id:'level30',name:'LEVEL 30 — The Threshold',theme:'white',darkZone:-1,intro:'문이 여러 개 있다. 이번에는 길이 아니라 선택이다.',
 goal:'문을 선택하라. 무엇을 구했고 무엇을 알아냈는지가 결과를 정한다.',map:t.out(),start:{cx:14,cy:19,yaw:0},
 doors:{},puzzles:[],items:[],
 stations:[{id:'s1',cx:9,cy:4,wall:'N',label:'빛이 새는 문'},{id:'s2',cx:11,cy:4,wall:'N',label:'혼자 나가는 문'},{id:'s3',cx:13,cy:4,wall:'N',label:'중앙 장치'},{id:'s4',cx:15,cy:4,wall:'N',label:'문지기의 자리'},{id:'s5',cx:17,cy:4,wall:'N',label:'기록실의 문'},{id:'s6',cx:19,cy:4,wall:'N',label:'익숙한 문'},{id:'s7',cx:21,cy:10,wall:'E',label:'균열',hidden:'rift'}],
 switches:[{id:'sw30',cx:8,cy:16,wall:'W',zone:1,label:'형광등 스위치'}],stay:{zone:1,secs:12,env:'rift',msg:'벽 한쪽이 갈라졌다. 동쪽 벽에 균열이 생긴다.'},
 notes:[{cx:14,cy:16,text:()=>'문은 일곱 개가 아니다. 여섯 개와, 보려는 사람에게만 보이는 하나다.'},{cx:9,cy:16,text:()=>'모두를 구했다면 빛이 새는 문은 열린다. 아니라면 그 문은 같은 복도로 되돌아온다.'}],
 anoms:[{cx:20,cy:16,text:'벽 위에 낯선 방의 문 그림자가 겹쳐 보인다.'}],lit:()=>true,zone:(cx,cy)=>(cx>=8&&cx<=21&&cy>=4&&cy<=17)?1:0};
