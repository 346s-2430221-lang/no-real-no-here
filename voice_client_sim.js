'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const sent=[];const pcs=[];
class FakePC {
 constructor(config){this.config=config;this.signalingState='stable';this.remoteDescription=null;this.localDescription=null;this.connectionState='new';this.iceConnectionState='new';this.added=[];pcs.push(this)}
 addTrack(){} async createOffer(){return {type:'offer',sdp:'CLIENT_OFFER'}} async createAnswer(){return {type:'answer',sdp:'CLIENT_ANSWER'}}
 async setLocalDescription(d){this.localDescription=d;this.signalingState=d.type==='offer'?'have-local-offer':'stable'}
 async setRemoteDescription(d){this.remoteDescription=d;this.signalingState=d.type==='offer'?'have-remote-offer':'stable'}
 async addIceCandidate(c){this.added.push(c)} close(){this.connectionState='closed'} restartIce(){}
}
const document={getElementById:()=>null,querySelectorAll:()=>[],createElement:()=>({style:{},addEventListener(){},setAttribute(){},play:()=>Promise.resolve(),remove(){}}),body:{appendChild(){}}};
const context={console,Map,Set,Math,Number,String,Array,JSON,Promise,document,window:{NRNH_ICE_SERVERS:[{urls:'stun:test.invalid'}]},navigator:{},RTCPeerConnection:FakePC,RTCSessionDescription:class{constructor(x){Object.assign(this,x)}},RTCIceCandidate:class{constructor(x){Object.assign(this,x)}},MediaStream:class{constructor(x){this.tracks=x}},Save:{data:{settings:{voiceOut:.85,voicePTT:false,voiceMute:false}}},UI:{$:()=>null,toast(){},net(){},panel(){},close(){}},Game:{},Player:{},Levels:{},Aud:{},location:{protocol:'https:',host:'example.invalid'},setTimeout,clearTimeout,addEventListener(){}};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/net.js'),'utf8')+'\nglobalThis.__Net=Net;',context);
const Net=context.__Net;Net.me='1';Net.on=true;Net.voiceOn=true;Net.voiceStream={getTracks:()=>[{kind:'audio'}],getAudioTracks:()=>[{enabled:true}]};Net.send=o=>{sent.push(o);return true};
(async()=>{
 try{
  Net.ensureVoicePeer('2'); await new Promise(r=>setImmediate(r));
  assert.ok(sent.some(m=>m.t==='signal'&&m.to==='2'&&m.data.description.type==='offer'),'initiator emits offer');
  const pc=Net.voicePeers.get('2');
  // ICE before SDP is queued and then flushed after the remote offer is set.
  await Net.voiceSignal('2',{candidate:{candidate:'EARLY_ICE'}});
  assert.equal(Net.voiceCandidateQueues.get('2').length,1);
  await Net.voiceSignal('2',{description:{type:'answer',sdp:'REMOTE_ANSWER'}});
  assert.equal(pc.remoteDescription.type,'answer');assert.equal(pc.added.length,1,'queued ICE is flushed after remote SDP');
  // A second, non-initiator peer receives an offer and replies with an answer.
  Net.me='3';Net.voicePeers.clear();Net.voiceCandidateQueues.clear();sent.length=0;
  await Net.voiceSignal('4',{description:{type:'offer',sdp:'INCOMING_OFFER'}});
  const p2=Net.voicePeers.get('4');assert.ok(p2);assert.equal(p2.remoteDescription.type,'offer');
  assert.ok(sent.some(m=>m.t==='signal'&&m.to==='4'&&m.data.description.type==='answer'),'receiver emits answer');
  await Net.voiceSignal('4',{candidate:{candidate:'LATE_ICE'}});assert.equal(p2.added.length,1);
  Net.dropVoicePeer('2');Net.dropVoicePeer('4');
  console.log('PASS: client creates offer, queues early ICE, applies answer, answers incoming offer, and applies remote ICE candidates.');
 }catch(e){console.error(e);process.exitCode=1}
})();
