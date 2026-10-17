const UI={$:id=>document.getElementById(id),
 panel(h){const p=this.$('panel');p.onclick=null;p.innerHTML=h;p.classList.remove('hidden')},
 close(){this.$('panel').classList.add('hidden');if(this.kh){document.removeEventListener('keydown',this.kh);this.kh=null}},
 toast(t,ms){const e=this.$('toast');e.textContent=t;e.style.opacity=1;clearTimeout(this._t);this._t=setTimeout(()=>e.style.opacity=0,ms||2200)},
 hud(on){this.$('hud').classList.toggle('hidden',!on)},
 menu(on){this.$('menu').classList.toggle('hidden',!on)},
 prompt(t){const e=this.$('prompt');if(e.textContent!==t)e.textContent=t},
 count(){const d=Levels.def,s=Levels.st;this.$('count').textContent='메모 '+s.notes.length+'/'+d.notes.length+(d.items.length?' · 퓨즈 '+s.items.length+'/'+d.items.length:'')+' · 탐험 코인 '+(Save.data.runCoins||0)+' · 꾸미기 코인 '+(Save.data.wallet||0)},
 net(t){const e=this.$('net');e.textContent=t||'';e.classList.toggle('hidden',!t)},
settings(back){const s=Save.data.settings,R=(id,t,a,b,st,v)=>`<label>${t}<input id="${id}" type="range" min="${a}" max="${b}" step="${st}" value="${v}"></label>`;
  this.panel(`<h2>설정</h2>${R('sv','볼륨',0,1,.05,s.vol)}${R('sp','마우스 감도',.3,3,.1,s.sensPC)}${R('sm','터치 감도',.3,3,.1,s.sensMob)}${R('sf','시야각(FOV)',60,100,1,s.fov)}${R('sz','조작 버튼 크기',.7,1.5,.1,s.btn)}
  <label>그래픽<select id="sq"><option value="auto">자동 최적화(FPS 우선)</option><option value="low">낮음(최고 FPS)</option><option value="mid">중간</option><option value="high">높음(그림자)</option></select></label>
  <label>화면 흔들림<select id="sk"><option value="1">켜기</option><option value="0">끄기</option></select></label>
  <h3>게임 난이도</h3><label>난이도<select id="sdiff"><option value="easy">쉬움 · 업적 보상 2코인</option><option value="normal">보통 · 업적 보상 5코인</option><option value="hard">어려움 · 업적 보상 8코인</option><option value="nightmare">악몽 · 업적 보상 12코인</option></select></label><p>난이도는 업적 달성 시 지급되는 꾸미기 코인에 영향을 줍니다.</p><h3>음성 채팅 설정</h3><p>음성은 멀티플레이에서만 작동합니다. 음성 켜기 버튼을 눌러 마이크 권한을 허용하세요.</p>
  <label>팀원 음량 <span id="svoVal">${Math.round((s.voiceOut??.85)*100)}%</span><input id="svo" type="range" min="0" max="1" step=".05" value="${s.voiceOut??.85}"></label>
  <label>마이크 <select id="svm"><option value="0">켜기</option><option value="1">음소거</option></select></label>
  <label>음성 입력 방식 <select id="svptt"><option value="0">항상 송신</option><option value="1">눌러서 말하기 (V)</option></select></label>
  <p id="voiceSettingsHint">눌러서 말하기를 선택하면 V 키를 누르고 있는 동안만 마이크가 송신됩니다.</p>
  <button id="svtest">음성 설정 적용</button><button id="sb">뒤로</button>`);
  this.$('sq').value=s.quality;this.$('sdiff').value=Save.data.diff||'normal';this.$('sk').value=Save.data.acc.shake?'1':'0';this.$('svm').value=s.voiceMute?'1':'0';this.$('svptt').value=s.voicePTT?'1':'0';
  const set=()=>{s.vol=+this.$('sv').value;s.sensPC=+this.$('sp').value;s.sensMob=+this.$('sm').value;s.fov=+this.$('sf').value;s.btn=+this.$('sz').value;s.quality=this.$('sq').value;Save.data.diff=this.$('sdiff').value;Save.data.acc.shake=this.$('sk').value==='1';s.voiceOut=+this.$('svo').value;s.voiceMute=this.$('svm').value==='1';s.voicePTT=this.$('svptt').value==='1';this.$('svoVal').textContent=Math.round(s.voiceOut*100)+'%';Save.save();Game.apply();if(window.Net&&Net.applyVoiceSettings)Net.applyVoiceSettings()};
  ['sv','sp','sm','sf','sz','sq','sdiff','sk','svo','svm','svptt'].forEach(i=>this.$(i).oninput=set);this.$('svtest').onclick=()=>{set();if(window.Net)Net.voiceStatus();UI.toast('음성 설정을 적용했어. 마이크 권한은 음성 켜기에서 설정해.',2400)};this.$('sb').onclick=back},
 help(back){this.panel(`<h2>조작 방법</h2><p>PC: WASD 이동 · 마우스 시점 · Shift 달리기 · E 상호작용 · Esc 일시정지<br>모바일: 왼쪽 조이스틱 이동 · 오른쪽 드래그 시점 · 달리기/조사 버튼<br><br>메모를 찾아 숫자를 모으고, 출구 옆 키패드에 입력하세요.</p><button id="hb">뒤로</button>`);this.$('hb').onclick=back},
 note(i,text,back){this.panel(`<h2>메모 #${i+1} / ${Levels.def.notes.length}</h2><p>${text}</p><button id="nb">닫기</button>`);this.$('nb').onclick=back},
 keypad(submit,back,len){len=len||3;let v='',lock=false;
  this.panel(`<h2>키패드</h2><p>메모의 단서를 조합해 ${len}자리를 입력</p><div id="disp">${Array(len).fill('_').join(' ')}</div><div class="pad">${[1,2,3,4,5,6,7,8,9,'←',0,'확인'].map(k=>`<button tabindex="-1" data-k="${k}">${k}</button>`).join('')}</div><button tabindex="-1" id="kb">닫기</button>`);
  const d=this.$('disp'),show=()=>{d.style.color='';d.textContent=(v+'_'.repeat(len)).slice(0,len).split('').join(' ')};
  const press=k=>{if(lock)return;if(k==='←'){v=v.slice(0,-1);show()}else if(k==='확인'){if(v.length<len){d.textContent=len+'자리를 입력';return}
    lock=true;d.textContent='확인 중…';submit(v,ok=>{if(ok)return;d.style.color='#c33';d.textContent='틀림';Aud.burst(300,.2,.4);setTimeout(()=>{lock=false;v='';show()},700)})}else if(v.length<len){v+=k;show()}};
  document.querySelectorAll('.pad button').forEach(b=>{b.onclick=()=>{press(b.dataset.k);b.blur()}});
  this.kh=e=>{if(e.repeat)return;let k=null;if(/^\d$/.test(e.key))k=e.key;else if(e.key==='Backspace')k='←';else if(e.key==='Enter')k='확인';if(k===null)return;e.preventDefault();press(k)};
  document.addEventListener('keydown',this.kh);this.$('kb').onclick=back}};
