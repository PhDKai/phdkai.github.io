'use strict';
(() => {
  const canvas = document.querySelector('#art'), ctx = canvas.getContext('2d');
  const palettes = {
    moss: {paper:'#e4e3d7', colors:['#566b58','#73826a','#9c916e','#3b5e59']},
    tide: {paper:'#e0e6e3', colors:['#4c737b','#789595','#8a9584','#435c76']},
    ember: {paper:'#eee0d2', colors:['#9d6654','#bb8b64','#8b7668','#7c5350']}
  };
  let seed = Math.floor(Math.random()*900000)+100000, palette = 'moss';
  let t = 0, paused = matchMedia('(prefers-reduced-motion: reduce)').matches, previous = 0, frame = 0;
  let pointer = {x:.5,y:.5,strength:0}, target = 0, width=0,height=0;
  const pause = document.querySelector('#pause'), status = document.querySelector('#status');
  function sync(){pause.textContent=paused?'再生':'一時停止';pause.setAttribute('aria-pressed',String(paused));document.querySelector('#seed-label').textContent=seed;}
  function random(n){let v=Math.sin(n*127.1+seed*.013)*43758.5453;return v-Math.floor(v);}
  function draw(c,w,h,signature=false){
    const p=palettes[palette];c.fillStyle=p.paper;c.fillRect(0,0,w,h);
    c.save();if(signature)c.translate(0,h*.015);c.scale(w,signature?h*.88:h);
    // Two gently opposed bundles, with a generous empty margin around them.
    for(let bundle=0;bundle<2;bundle++){
      for(let line=0;line<116;line++){
        const u=line/115, phase=random(bundle+3)*6.28;
        c.beginPath();
        for(let step=0;step<=170;step++){
          const s=step/170, x=.055+s*.89;
          const envelope=Math.pow(Math.sin(s*Math.PI),1.25);
          const drift=Math.sin(s*5.3+t*.17+phase)*.075 + Math.cos(s*9.5-t*.11+u*1.7)*.036;
          let y=.49+(u-.5)*.39 + envelope*(Math.sin(s*6.0+u*2.8+t*.12+bundle*2.3)*.145+drift);
          y+=(bundle===0?-1:1)*Math.sin(s*Math.PI)*.055;
          const dx=x-pointer.x,dy=y-pointer.y;
          y+=Math.exp(-(dx*dx+dy*dy)*22)*pointer.strength*.032*Math.sin(s*8+t*.3);
          if(step===0)c.moveTo(x,y);else c.lineTo(x,y);
        }
        c.strokeStyle=p.colors[(Math.floor(line/29)+bundle)%4];c.globalAlpha=.27+random(line+bundle*1000)*.20;c.lineWidth=.65/w;c.stroke();
      }
    }
    // Deterministic paper grain; no image assets or external requests.
    c.globalAlpha=.075;
    for(let i=0;i<2600;i++){c.fillStyle=i%2?'#fff':'#39463e';c.fillRect(random(i+2000),random(i+7000),.7/w,.7/h);}
    c.restore();c.globalAlpha=1;
    if(signature){c.fillStyle='#455047';c.font=`${w*.008}px Georgia`;c.fillText('Intervals / No. 001',w*.055,h*.955);c.textAlign='right';c.font=`${w*.006}px Arial`;c.fillText(`SHUMPEI KAI · 2026 · ${seed}`,w*.945,h*.955);c.textAlign='left';}
  }
  function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);width=Math.round(r.width*dpr);height=Math.round(r.height*dpr);canvas.width=width;canvas.height=height;draw(ctx,width,height);}
  function animate(now){const dt=previous?Math.min((now-previous)/1000,.1):0;previous=now;if(!paused&&!document.hidden)t+=dt;pointer.strength+=(target-pointer.strength)*.07;if(!paused||pointer.strength>.001||target) {if(now-frame>40){draw(ctx,width,height);frame=now;}}requestAnimationFrame(animate);}
  pause.addEventListener('click',()=>{paused=!paused;sync();draw(ctx,width,height);});
  document.querySelector('#new').addEventListener('click',()=>{seed=Math.floor(Math.random()*900000)+100000;t=0;sync();draw(ctx,width,height);status.textContent='新しい景色になりました。';});
  document.querySelectorAll('[data-palette]').forEach(b=>b.addEventListener('click',()=>{palette=b.dataset.palette;document.querySelectorAll('[data-palette]').forEach(a=>a.setAttribute('aria-pressed',String(a===b)));draw(ctx,width,height);}));
  canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width;pointer.y=(e.clientY-r.top)/r.height;target=1;});
  canvas.addEventListener('pointerleave',()=>target=0);canvas.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')target=0;});canvas.addEventListener('pointercancel',()=>target=0);
  document.querySelector('#save').addEventListener('click',()=>{
    const out=document.createElement('canvas');out.width=2400;out.height=1800;draw(out.getContext('2d'),2400,1800,true);
    out.toBlob(blob=>{if(!blob){status.textContent='保存できませんでした。もう一度お試しください。';return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`shumpei-kai-intervals-${seed}-${palette}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);status.textContent='この瞬間をPNG画像として保存しました。';},'image/png');
  });
  new ResizeObserver(resize).observe(canvas);sync();resize();requestAnimationFrame(animate);
})();
