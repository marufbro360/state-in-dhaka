import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bc7dc);
scene.fog = new THREE.Fog(0x9bc7dc, 95, 310);
const camera = new THREE.PerspectiveCamera(68, innerWidth/innerHeight, .1, 700);
const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.querySelector('#game').prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe8f5ff, 0x66705c, 2.0));
const sun = new THREE.DirectionalLight(0xffedc7, 2.1);
sun.position.set(-55,95,45); sun.castShadow = true;
sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-100; sun.shadow.camera.right=100; sun.shadow.camera.top=100; sun.shadow.camera.bottom=-100;
scene.add(sun);

const mat=(color,roughness=.9)=>new THREE.MeshStandardMaterial({color,roughness});
const grass=mat(0x657b52), asphalt=mat(0x30363a), pavement=mat(0x9a9a88), white=mat(0xf1e8c9);
const road = new THREE.Mesh(new THREE.PlaneGeometry(270,270), grass);
road.rotation.x=-Math.PI/2; road.position.y=-.13; road.receiveShadow=true; scene.add(road);

function box(w,h,d,material,x,y,z,shadow=true){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  m.position.set(x,y,z); m.castShadow=shadow; m.receiveShadow=true; scene.add(m); return m;
}
// Dhaka-like crossed streets and side lanes
box(22,.12,270,asphalt,0,-.04,0,false);
box(270,.12,20,asphalt,0,-.035,0,false);
for(let z=-125;z<=125;z+=12){
  box(.22,.025,5,white,0,.035,z,false);
}
for(let x=-126;x<=126;x+=12){
  box(5,.025,.22,white,x,.04,0,false);
}
// sidewalks
for(const z of [-12.4,12.4]) box(270,.28,3.2,pavement,0,.02,z,false);
for(const x of [-13.5,13.5]) box(3.1,.28,270,pavement,x,.02,0,false);

function label(text, x,y,z, color='#fff'){
  const c=document.createElement('canvas'); c.width=512;c.height=128;
  const ctx=c.getContext('2d'); ctx.fillStyle='#17242be8';ctx.fillRect(0,0,512,128);
  ctx.strokeStyle='#f5c44c';ctx.lineWidth=7;ctx.strokeRect(5,5,502,118);
  ctx.fillStyle=color;ctx.font='bold 48px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,65,470);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));
  sprite.position.set(x,y,z);sprite.scale.set(10,2.5,1);scene.add(sprite);
}
const shopColors=[0xc66d42,0x4b8a88,0xc7a24b,0x8c6aa5,0x5c7eae,0xb65b63,0x8a9c62];
const shopNames=['বিকাশ এজেন্ট','নান্না বিরিয়ানি','চায়ের দোকান','মোবাইল সার্ভিস','মুদি বাজার','ফার্মেসি','কাপড়ের দোকান'];
function building(x,z,w,d,h,i){
  const color=shopColors[i%shopColors.length];
  const body=box(w,h,d,mat(color),x,h/2,z);
  // roof parapet and repeated windows
  box(w+.18,.45,d+.18,mat(0xddd0b7),x,h+.22,z);
  const win=mat(0x243e4b,.35);
  for(let yy=2.3;yy<h-1;yy+=3){
    for(let xx=-w/2+1.3;xx<w/2-0.6;xx+=2.5){
      box(.95,1.25,.08,win,x+xx,yy,z-d/2-.05,false);
    }
  }
  const awning=box(w*.94,.45,.9,mat(0x253e46),x,2.65,z-d/2-.55);
  awning.rotation.x=-.08;
  label(shopNames[i%shopNames.length],x,3.7,z-d/2-.65, '#ffe7a3');
}
let seed=9137; const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
for(let side of [-1,1]){
  for(let z=-120;z<=120;z+=15){
    const w=8+rand()*6,d=9+rand()*4,h=9+rand()*27;
    building(side*(20+rand()*2),z,w,d,h,Math.floor(rand()*shopNames.length));
    // a few narrow houses set behind
    if(rand()>.45) building(side*(31+rand()*5),z+5,7,8,7+rand()*10,Math.floor(rand()*shopNames.length));
  }
}
for(let side of [-1,1]){
  for(let x=-120;x<=120;x+=18){
    if(Math.abs(x)<24) continue;
    const h=10+rand()*24;
    building(x,side*22,8+rand()*5,8,h,Math.floor(rand()*shopNames.length));
  }
}
label('গুলিস্তান',-4,12,-16,'#ffe7a3');
label('মতিঝিল',-43,13,-53,'#ffe7a3');
label('ধানমন্ডি',46,13,58,'#ffe7a3');
label('মিরপুর',-45,13,83,'#ffe7a3');

// trees, street lamps and simple traffic props
const trunk=mat(0x60432d), leaves=mat(0x39744a);
for(let z=-115;z<=115;z+=18){
  for(let side of [-1,1]){
    const x=side*17.4;
    const t=new THREE.Mesh(new THREE.CylinderGeometry(.22,.32,2.2,7),trunk);t.position.set(x,1.1,z);t.castShadow=true;scene.add(t);
    const crown=new THREE.Mesh(new THREE.SphereGeometry(1.45,8,7),leaves);crown.position.set(x,3,z);crown.castShadow=true;scene.add(crown);
  }
}
const carMats=[mat(0xc83f38),mat(0x2879a6),mat(0xd7b44b),mat(0xddddda)];
const cars=[];
for(let i=0;i<7;i++){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(2.1,.85,4),carMats[i%4]);body.position.y=.85;body.castShadow=true;g.add(body);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.55,.72,1.8),mat(0x263d49));cabin.position.set(0,1.55,-.15);g.add(cabin);
  for(const x of [-.9,.9])for(const z of [-1.25,1.25]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.22,10),mat(0x17191b));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.45,z);g.add(wheel);
  }
  g.position.set(i%2?4:-4,.0,-100+i*31);scene.add(g);cars.push({g,dir:i%2?1:-1,speed:5+rand()*5});
}
// Player capsule + simple stylized person
const player=new THREE.Group();scene.add(player);
const skin=mat(0xb77d55), shirt=mat(0x176d8a), pants=mat(0x252d3b), shoes=mat(0x17191c);
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.85,4,8),shirt);torso.position.y=1.55;torso.castShadow=true;player.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),skin);head.position.y=2.45;head.castShadow=true;player.add(head);
const legs=[];
for(const x of [-.23,.23]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.25,.85,.3),pants);leg.position.set(x,.55,0);player.add(leg);legs.push(leg)}
const arms=[];
for(const x of [-.62,.62]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.22,.85,.24),skin);arm.position.set(x,1.65,0);player.add(arm);arms.push(arm)}
const cameraOffset=new THREE.Vector3(0,5.5,10);
player.position.set(0,0,4);
let yaw=0,vy=0,onGround=true,run=false,camMode=0;
const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();});
addEventListener('keyup',e=>keys[e.code]=false);
const stick={x:0,y:0,active:false}; const base=document.querySelector('#stick-base'),knob=document.querySelector('#stick');
function stickMove(e){const r=base.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const len=Math.hypot(dx,dy),max=38;if(len>max){dx=dx/len*max;dy=dy/len*max}stick.x=dx/max;stick.y=dy/max;knob.style.transform=`translate(${dx}px,${dy}px)`}
base.addEventListener('pointerdown',e=>{stick.active=true;base.setPointerCapture(e.pointerId);stickMove(e)});
base.addEventListener('pointermove',e=>{if(stick.active)stickMove(e)});
function resetStick(){stick.active=false;stick.x=stick.y=0;knob.style.transform=''}
base.addEventListener('pointerup',resetStick);base.addEventListener('pointercancel',resetStick);
document.querySelector('#runBtn').addEventListener('pointerdown',()=>run=true);
['pointerup','pointercancel','pointerleave'].forEach(ev=>document.querySelector('#runBtn').addEventListener(ev,()=>run=false));
document.querySelector('#jumpBtn').addEventListener('pointerdown',()=>{if(onGround){vy=8.2;onGround=false}});
document.querySelector('#camBtn').addEventListener('click',()=>{camMode=(camMode+1)%2;toast(camMode?'ক্যামেরা: কাছাকাছি':'ক্যামেরা: পেছনে')});
function toast(t){const el=document.querySelector('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1900)}
let last=performance.now(),walkTime=0;
function animate(now){
 requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.04);last=now;
 const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-stick.y;
 const strafe=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+stick.x;
 const mag=Math.hypot(forward,strafe);let moving=mag>.08;
 if(moving){
   const f=forward/(mag||1),s=strafe/(mag||1);
   const speed=(run||keys.ShiftLeft||keys.ShiftRight?10.5:6.2);
   const dx=(Math.sin(yaw)*f+Math.cos(yaw)*s)*speed*dt;
   const dz=(-Math.cos(yaw)*f+Math.sin(yaw)*s)*speed*dt;
   player.position.x+=dx;player.position.z+=dz;
   yaw=Math.atan2(dx,-dz);player.rotation.y=yaw;
   walkTime+=dt*(run?13:9);legs[0].rotation.x=Math.sin(walkTime)*.65;legs[1].rotation.x=-Math.sin(walkTime)*.65;
   arms[0].rotation.x=-Math.sin(walkTime)*.45;arms[1].rotation.x=Math.sin(walkTime)*.45;
 } else {legs.forEach(l=>l.rotation.x=THREE.MathUtils.damp(l.rotation.x,0,8,dt));arms.forEach(a=>a.rotation.x=THREE.MathUtils.damp(a.rotation.x,0,8,dt))}
 if(keys.Space&&onGround){vy=8.2;onGround=false}
 vy-=19*dt;player.position.y+=vy*dt;if(player.position.y<=0){player.position.y=0;vy=0;onGround=true}
 player.position.x=THREE.MathUtils.clamp(player.position.x,-128,128);player.position.z=THREE.MathUtils.clamp(player.position.z,-128,128);
 cars.forEach(c=>{c.g.position.z+=c.dir*c.speed*dt;if(c.g.position.z>135)c.g.position.z=-135;if(c.g.position.z< -135)c.g.position.z=135});
 const dist=camMode?7:11,height=camMode?3.8:5.5;
 const target=new THREE.Vector3(player.position.x-Math.sin(yaw)*dist,player.position.y+height,player.position.z+Math.cos(yaw)*dist);
 camera.position.lerp(target,1-Math.exp(-5*dt));camera.lookAt(player.position.x,player.position.y+1.45,player.position.z);
 renderer.render(scene,camera);
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7))});
requestAnimationFrame(()=>{document.querySelector('#loading').style.opacity='0';setTimeout(()=>document.querySelector('#loading').remove(),450);toast('WASD দিয়ে চলুন, Shift দিয়ে দৌড়ান');});
requestAnimationFrame(animate);
