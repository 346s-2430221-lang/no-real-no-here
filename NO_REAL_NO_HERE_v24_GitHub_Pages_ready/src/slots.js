// 솔로 저장 슬롯 화면: 목록 / 새 게임 / 이어하기 / 이름 변경 / 삭제(확인) / 내보내기 / 가져오기
const Slots={
 esc:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 tm(sec){sec=Math.floor(sec||0);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60);return h?h+'시간 '+m+'분':m+'분'},
 dt(ts){const x=new Date(ts),p=n=>String(n).padStart(2,'0');return x.getFullYear()+'-'+p(x.getMonth()+1)+'-'+p(x.getDate())+' '+p(x.getHours())+':'+p(x.getMinutes())},
 card(s){if(!s.ok)return`<div class="slot"><b>${s.name}</b><br>읽을 수 없는 슬롯입니다. 삭제하거나 백업 파일을 가져오세요.<br><button data-a="del" data-id="${s.id}">삭제</button></div>`;
  const L=NRNH.LEVELS[s.level];return`<div class="slot"><b>${this.esc(s.name)}</b>${s.rec?' <i>(백업에서 복구됨)</i>':''}<br>${s.mode==='mp'?'멀티플레이 프로필':'솔로'} · ${this.esc(L?L.name:s.level)} · 진행 ${s.pct}% · 플레이 ${this.tm(s.play)}<br>마지막 저장 ${this.dt(s.saved)}<br>
   <button data-a="go" data-id="${s.id}">이어하기</button><button data-a="ren" data-id="${s.id}">이름</button><button data-a="exp" data-id="${s.id}">내보내기</button><button data-a="del" data-id="${s.id}">삭제</button></div>`},
 menu(msg){const L=Save.list().filter(s=>!s.ok||s.mode!=='mp'),pn=UI.$('panel');
  UI.panel(`<h2>솔로 플레이 — 저장 슬롯</h2><p class="sm">진행 상황은 이 브라우저(localStorage)에만 저장됩니다. 브라우저 데이터를 지우거나 다른 기기·브라우저를 쓰면 사라지니 '내보내기'로 백업하세요.</p>
   <div id="sl">${L.length?L.map(s=>this.card(s)).join(''):'<p>저장된 게임이 없습니다.</p>'}</div><div><button data-a="new">새 게임</button><button data-a="imp">가져오기</button><button data-a="expall">전체 내보내기</button><button data-a="back">뒤로</button></div>
   <input id="sfile" type="file" accept=".json,application/json" style="display:none"><div id="smsg">${msg?this.esc(msg):''}</div>`);
  pn.onclick=e=>{const b=e.target.closest('button[data-a]');if(b)this.act(b.dataset.a,b.dataset.id)};UI.$('sfile').onchange=e=>this.readFile(e.target.files&&e.target.files[0])},
 act(a,id){const $=x=>UI.$(x);
  if(a==='back'){UI.close();Game.menuBtns();return}
  if(a==='go'){if(!Game.startSlot(id))this.menu('이 슬롯을 열 수 없습니다. 백업 파일을 가져오거나 삭제하세요.');return}
  if(a==='new'){UI.panel(`<h2>새 게임</h2><label>저장 이름<input id="snm" type="text" maxlength="20" placeholder="비워 두면 자동 생성"></label><p class="sm">예상 플레이 시간(추정이며 실제 측정이 아님): 메인 약 30~40분 · 특별 레벨 약 5분. 3시간 목표에는 크게 못 미칩니다.</p><button id="sgo">시작</button><button id="sbk">뒤로</button>`);
   $('sgo').onclick=()=>{if(!Game.newSlot($('snm').value))this.menu('저장 공간이 부족해 새 슬롯을 만들 수 없습니다.')};$('sbk').onclick=()=>this.menu();return}
  if(a==='ren'){const s=Save.summary(id);UI.panel(`<h2>이름 변경</h2><label>이름<input id="snm" type="text" maxlength="20" value="${this.esc(s.name)}"></label><button id="sgo">변경</button><button id="sbk">취소</button>`);
   $('sgo').onclick=()=>{this.menu(Save.rename(id,$('snm').value)?'이름을 바꿨습니다.':'이름을 바꿀 수 없습니다.')};$('sbk').onclick=()=>this.menu();return}
  if(a==='del'){const s=Save.summary(id);UI.panel(`<h2>삭제 확인</h2><p>'${this.esc(s.name)}' 슬롯을 삭제할까요? 되돌릴 수 없습니다.<br>(내보내기로 백업했는지 확인하세요)</p><button id="sgo">삭제</button><button id="sbk">취소</button>`);
   $('sgo').onclick=()=>{Save.remove(id);this.menu('삭제했습니다.')};$('sbk').onclick=()=>this.menu();return}
  if(a==='exp'||a==='expall'){try{const s=a==='exp'?Save.exportSlot(id):Save.exportAll();this.download(a==='exp'?'nrnh-'+Save.summary(id).name+'.json':'nrnh-all-slots.json',s);this.menu('내보내기 파일을 내려받았습니다.')}catch(e){this.menu(e.message)}return}
  if(a==='imp'){$('sfile').click()}},
 readFile(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{const ids=Save.importText(String(r.result));this.menu('가져오기 완료: '+ids.length+'개 슬롯 (기존 슬롯은 덮어쓰지 않았습니다)')}catch(e){this.menu('가져오기 실패: '+e.message)}};r.onerror=()=>this.menu('파일을 읽을 수 없습니다.');r.readAsText(f)},
 download(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download=name.replace(/[^\w가-힣.-]+/g,'_');document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}};
