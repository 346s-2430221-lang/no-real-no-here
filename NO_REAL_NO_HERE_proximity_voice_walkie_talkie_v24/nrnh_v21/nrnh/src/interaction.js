const Interact={list:[],cur:null,
 clear(){this.list=[];this.cur=null},add(o){this.list.push(o)},
 update(px,pz,yaw){const fx=-Math.sin(yaw),fz=-Math.cos(yaw);let b=null,bd=1e9;
  for(const o of this.list){if(o.hide&&o.hide())continue;const dx=o.x-px,dz=o.z-pz,d=Math.hypot(dx,dz);if(d>o.r||d>=bd)continue;
   if(d>.6&&(dx*fx+dz*fz)/d<.7)continue;if(!Levels.los(px,pz,o.x,o.z))continue;b=o;bd=d}
  this.cur=b;UI.prompt(b?b.label():'')},
 trigger(){if(this.cur)this.cur.act()}};
