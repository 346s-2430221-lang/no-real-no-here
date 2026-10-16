const Aud={ctx:null,zone:-1,hv:0,
 init(){if(this.ctx){this.ctx.resume();return}const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  const c=this.ctx=new C();this.m=c.createGain();this.m.connect(c.destination);this.setVol(Save.data.settings.vol);
  const f=(type,fr,ft,ff,g)=>{const o=c.createOscillator();o.type=type;o.frequency.value=fr;const q=c.createBiquadFilter();q.type=ft;q.frequency.value=ff;const gn=c.createGain();gn.gain.value=g;o.connect(q);q.connect(gn);gn.connect(this.m);o.start();return{o,q,gn}};
  this.dr=f('sawtooth',40,'lowpass',140,.12);this.hum=f('square',120,'bandpass',240,.01);
  const n=c.createBufferSource();n.buffer=this.nb();n.loop=true;const q=c.createBiquadFilter();q.type='highpass';q.frequency.value=3500;this.zap=c.createGain();this.zap.gain.value=.01;n.connect(q);q.connect(this.zap);this.zap.connect(this.m);n.start()},
 nb(){if(!this._n){const c=this.ctx,b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this._n=b}return this._n},
 setVol(v){if(this.m)this.m.gain.value=v},
 setZone(z){if(!this.ctx||z===this.zone)return;this.zone=z;const t=this.ctx.currentTime;this.dr.o.frequency.linearRampToValueAtTime(34+z*5,t+2);this.dr.q.frequency.linearRampToValueAtTime(100+z*25,t+2)},
 buzz(l){if(!this.ctx)return;const q=1-.9*this.hv;this.hum.gn.gain.value=(.01+.03*l)*q;this.zap.gain.value=(.005+.02*l)*q},
 hush(v){this.hv=v;if(this.ctx)this.dr.gn.gain.value=.12*(1-.8*v)},
 burst(fr,d,v){const c=this.ctx;if(!c)return;const s=c.createBufferSource();s.buffer=this.nb();s.playbackRate.value=.8+Math.random()*.4;
  const q=c.createBiquadFilter();q.type='lowpass';q.frequency.value=fr;const g=c.createGain();g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);
  s.connect(q);q.connect(g);g.connect(this.m);s.start(0,Math.random());s.stop(c.currentTime+d)},
 tone(fr,t0,d,v){const c=this.ctx;if(!c)return;const o=c.createOscillator(),g=c.createGain();o.frequency.value=fr;g.gain.setValueAtTime(v,c.currentTime+t0);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t0+d);o.connect(g);g.connect(this.m);o.start(c.currentTime+t0);o.stop(c.currentTime+t0+d)},
 breath(on,dt){if(!this.ctx)return;this._breathT=(this._breathT||0)+dt;if(!on){this._breathT=0;return}if(this._breathT>.95){this._breathT=0;const c=this.ctx,d=.42;const src=c.createBufferSource();src.buffer=this.nb();src.playbackRate.value=.18+Math.random()*.06;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=620;const g=c.createGain();g.gain.setValueAtTime(.0001,c.currentTime);g.gain.linearRampToValueAtTime(.12,c.currentTime+.08);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);src.connect(f);f.connect(g);g.connect(this.m);src.start();src.stop(c.currentTime+d)}},step(run){this.burst(run?520:360,.12,run?.4:.28)},door(){this.burst(200,.7,.6);this.tone(60,0,.5,.3)},
 solve(){[440,554,659].forEach((f,i)=>this.tone(f,i*.15,.5,.2))},paper(){this.burst(2500,.15,.2)}};
