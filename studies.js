'use strict';
(() => {
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),mode=document.body.dataset.work;
const titles={ripples:'Still Water',drift:'Drift',orbits:'Quiet Orbits'};
let seed=Math.floor(Math.random()*900000)+100000,time=0,last=null,painted=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
let pointer={x:.5,y:.5,active:false},sources=[],width=1,height=1;
const pause=document.querySelector('#pause'),status=document.querySelector('#status');
const rand=n=>{const v=Math.sin(n*127.1+seed*.073)*43758.5453;return v-Math.floor(v)};
function reset(){sources=[{x:.32+rand(1)*.1,y:.4+rand(2)*.2,born:0},{x:.65,y:.55,born:-4}];}
function sync(){pause.textContent=paused?'再生':'一時停止';pause.setAttribute('aria-pressed',String(paused));}
function draw(c,w,h,exporting=false){
  const dark=mode==='drift',bg=dark?'#122731':mode==='ripples'?'#dce5df':'#eae2d4';
  c.fillStyle=bg;c.fillRect(0,0,w,h);c.save();
  const artHeight=exporting?h*.91:h;if(exporting)c.translate(0,h*.01);c.scale(w,artHeight);
  if(mode==='ripples'){
    // Circles are corrected for the canvas aspect ratio, including phone screens.
    const aspect=w/artHeight;
    sources.forEach((s,si)=>{for(let ring=0;ring<32;ring++){
      const r=((ring/32+(time-s.born)*.012)%1)*.82,opacity=Math.pow(1-r/.82,1.6)*.34;
      c.beginPath();for(let j=0;j<=160;j++){const a=j/160*Math.PI*2,rr=r+Math.sin(a*4+time*.2+si)*.002;const x=s.x+Math.cos(a)*rr,y=s.y+Math.sin(a)*rr*aspect;if(!j)c.moveTo(x,y);else c.lineTo(x,y);}
      c.strokeStyle=si%2?'#7b9386':'#496f70';c.globalAlpha=opacity;c.lineWidth=.8/w;c.stroke();
    }});
  }else if(mode==='drift'){
    for(let i=0;i<550;i++){
      const speed=.006+rand(i+1000)*.014;
      const x=(rand(i+1)+time*speed+Math.sin(time*.07+i)*.025)%1;
      let y=.07+rand(i+2000)*.86+Math.sin(x*8+time*.13+i*.04)*.045;
      if(pointer.active){const dx=x-pointer.x,dy=y-pointer.y;y+=Math.exp(-(dx*dx+dy*dy)*25)*.075*Math.sin(time*.3+i);}
      const radius=(.6+rand(i+3000)*1.5)/w;
      c.beginPath();c.ellipse(x,y,radius,radius*w/artHeight,0,0,Math.PI*2);c.fillStyle=i%4?'#d6ca9e':'#90b4b6';c.globalAlpha=.15+rand(i+4000)*.65;c.fill();
      if(i%17===0){c.beginPath();c.moveTo(x-.012,y);c.lineTo(x+.012,y);c.strokeStyle='#d6ca9e';c.globalAlpha=.1;c.lineWidth=.65/w;c.stroke();}
    }
  }else{
    const aspect=w/artHeight,rotation=time*.035+rand(1)*6.28+(pointer.active?(pointer.x-.5)*.25:0);
    for(let layer=0;layer<68;layer++){
      const u=layer/67,r=.1+u*.29,angle=rotation+u*1.9;
      c.beginPath();for(let corner=0;corner<=6;corner++){const a=corner/6*Math.PI*2+angle,x=.5+Math.cos(a)*r,y=.49+Math.sin(a)*r*aspect*.72;if(!corner)c.moveTo(x,y);else c.lineTo(x,y);}
      c.strokeStyle=layer%3?'#7a7760':'#b07a5b';c.globalAlpha=.3;c.lineWidth=.75/w;c.stroke();
    }
  }
  c.globalAlpha=.07;for(let i=0;i<1700;i++){c.fillStyle=dark?'#dce5df':i%2?'#fff':'#3b4942';c.fillRect(rand(i+7000),rand(i+9000),.8/w,.8/artHeight);}
  c.restore();c.globalAlpha=1;
  if(exporting){c.fillStyle=dark?'#b7c4bd':'#455047';c.font=`${w*.008}px Georgia`;c.fillText(titles[mode],w*.045,h*.965);c.textAlign='right';c.font=`${w*.006}px Arial`;c.fillText(`SHUMPEI KAI / 2026 / ${seed}`,w*.955,h*.965);c.textAlign='left';}
}
function redraw(){draw(ctx,width,height);}
function resize(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);width=canvas.width=Math.max(1,Math.round(rect.width*dpr));height=canvas.height=Math.max(1,Math.round(rect.height*dpr));redraw();}
function animate(now){const dt=last===null?0:Math.min((now-last)/1000,.1);last=now;if(!paused&&!document.hidden){time+=dt;if(now-painted>=40){redraw();painted=now;}}requestAnimationFrame(animate);}
pause.addEventListener('click',()=>{paused=!paused;sync();redraw();});
document.querySelector('#new').addEventListener('click',()=>{seed=Math.floor(Math.random()*900000)+100000;time=0;reset();redraw();status.textContent='新しい景色になりました。';});
function touch(x,y){pointer={x,y,active:true};if(mode==='ripples'){sources.push({x,y,born:time});if(sources.length>5)sources.shift();}redraw();}
canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();touch((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);});
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height,active:true};if(paused&&mode!=='ripples')redraw();});
canvas.addEventListener('pointerleave',()=>{pointer.active=false;if(paused)redraw();});canvas.addEventListener('pointercancel',()=>pointer.active=false);
canvas.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse'){pointer.active=false;if(paused)redraw();}});
canvas.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();touch(.25+rand(time+1)*.5,.25+rand(time+2)*.5);}});
document.querySelector('#save').addEventListener('click',()=>{const out=document.createElement('canvas');out.width=2400;out.height=1800;draw(out.getContext('2d'),2400,1800,true);out.toBlob(blob=>{if(!blob){status.textContent='保存できませんでした。もう一度お試しください。';return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`shumpei-kai-${mode}-${seed}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);status.textContent='この瞬間をPNG画像として保存しました。';},'image/png');});
reset();sync();new ResizeObserver(resize).observe(canvas);resize();requestAnimationFrame(animate);
})();
