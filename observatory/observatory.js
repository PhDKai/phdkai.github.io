'use strict';
(() => {
const $=s=>document.querySelector(s),canvas=$('#sea'),ctx=canvas.getContext('2d');
let time=0,last=null,painted=0,readAt=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,voice='observer',width=1,height=1;
const controls={period:$('#period'),phase:$('#phase'),ratio:$('#ratio')};
const words={
 observer:[
 '波1と波2は、ほぼ打ち消し合っている。\n断面は静かに見えるが、このモデルでは、二つの波の振幅をゼロにしたわけではない。潮位の観測は行っていない。',
 '一定の周期で、断面を波が通過している。\n同じ条件なら、同じ計算結果になる。窓の向こうで誰が待っているかを書く欄は、この観測票にはない。',
 '二つの波が重なり、合成振幅が大きくなっている。\n波を分けて記録する。見えた大きさを、そのまま海の荒れ具合と呼ばないように。'
 ],
 daughter:[
 '海が静かだと、足音が遠くまで聞こえる。\n今夜も戸口の石を拾い、窓辺へ移した。返事はそれだけでよかった。',
 'あの人は波紋の上を歩いた、と皆は言う。\nわたしはその夜、岬で灯りを直していた。歩いて帰った道がどんなだったかは、誰にも聞かれなかった。',
 '鍋の中の湯まで揺れているように見える。\n母は二つの椀を押さえ、それからこちらを見た。何も呼ばなかった。ただ、熱いうちに座れという手をした。'
 ],
 child:[
 '何もないよ、と言いかけてやめた。\n暗いところに誰かがいるなら、まだ見つけていないだけかもしれない。ポケットの石を、ひとつ握り直した。',
 '沖の灯りが、波の向こうに隠れたり戻ったりする。\n見えなくなったあいだも、消えてはいないのだろうか。次に見えたら、数え直そうと思った。',
 '防波堤の先へ行こうとすると、袖を引かれた。\n名前は知らない人だった。戻る道は知っていると言ったので、手を離さないで歩いた。'
 ]};
function parameters(){return {period:Number(controls.period.value),phase:Number(controls.phase.value)*Math.PI/180,ratio:Number(controls.ratio.value)}}
function amplitude(p){return Math.sqrt(Math.max(0,1+p.ratio*p.ratio+2*p.ratio*Math.cos(p.phase)))}
function field(x,t,p){const a=4*Math.PI*x-2*Math.PI*t/p.period;return [Math.sin(a),p.ratio*Math.sin(a+p.phase)]}
function narratives(){const p=parameters(),r=amplitude(p),category=r<.25?0:r<1.2?1:2;for(const name of Object.keys(words)){$('#quote-'+name).textContent=words[name][category];$('[data-card="'+name+'"]').hidden=!$('#compare').checked&&voice!==name;}}
function readout(){const p=parameters();$('#time').textContent=time.toFixed(1);$('#amplitude').textContent=amplitude(p).toFixed(2);$('#phase-value').textContent=controls.phase.value;}
function sync(){const p=parameters();$('#period-out').textContent=p.period.toFixed(1)+' s';$('#phase-out').textContent=controls.phase.value+'°';$('#ratio-out').textContent=p.ratio.toFixed(2);$('#pause').textContent=paused?'再生':'一時停止';$('#pause').setAttribute('aria-pressed',String(paused));readout();narratives();}
function draw(c,w,h,exporting=false){
 const p=parameters();c.fillStyle='#0d202a';c.fillRect(0,0,w,h);c.save();c.scale(w,h);
 // A stable sky: switching narrator never changes the landscape or model state.
 for(let i=0;i<65;i++){const x=(Math.sin(i*127.1)*43758.5453)%1,y=(Math.sin(i*311.7)*17311.7)%1;if(x<0||y<0)continue;c.fillStyle=i%5?'#607b80':'#b5bda0';c.globalAlpha=.25+(i%4)*.12;c.fillRect(.03+x*.94,.07+y*.24,1/w,1/h);}
 c.globalAlpha=1;c.fillStyle='#142e37';c.fillRect(0,.39,1,.61);
 c.fillStyle='#14282f';c.beginPath();c.moveTo(0,.39);c.lineTo(.25,.35);c.lineTo(.38,.39);c.closePath();c.fill();
 // Lighthouse and steady light belong to the fictional scene, not the wave calculation.
 c.fillStyle='#52635f';c.fillRect(.21,.288,.008,.069);c.fillStyle='#d5b77a';c.fillRect(.207,.28,.014,.009);c.globalAlpha=.07;c.beginPath();c.moveTo(.214,.284);c.lineTo(.54,.25);c.lineTo(.54,.32);c.closePath();c.fill();c.globalAlpha=1;
 for(let row=0;row<31;row++){
  const d=row/30,base=.405+d*d*.31,scale=.002+d*d*.019;
  c.beginPath();for(let j=0;j<=220;j++){const x=j/220,v=field(x+d*.13,time,p),y=base-(v[0]+v[1])*scale;if(!j)c.moveTo(x,y);else c.lineTo(x,y);}c.strokeStyle=row%5?'#577d80':'#9aab98';c.globalAlpha=.11+d*.22;c.lineWidth=(.5+d*.35)/w;c.stroke();
 }
 c.globalAlpha=1;c.fillStyle='#0b1d26';c.fillRect(.04,.77,.92,.2);
 // Modeled cross-section, fixed axes: x=0..1, y=-2..2.
 const left=.09,right=.94,center=.86,sy=.037;
 c.strokeStyle='#41565b';c.lineWidth=.65/w;c.beginPath();c.moveTo(left,.78);c.lineTo(left,.94);c.moveTo(left,center);c.lineTo(right,center);c.stroke();
 for(let line=0;line<3;line++){c.beginPath();for(let j=0;j<=220;j++){const x=j/220,v=field(x,time,p),value=line===0?v[0]:line===1?v[1]:v[0]+v[1],px=left+x*(right-left),py=center-value*sy;if(!j)c.moveTo(px,py);else c.lineTo(px,py);}c.strokeStyle=['#c6a36e','#70a4b1','#eee7cf'][line];c.lineWidth=(line===2?1.5:.8)/w;c.globalAlpha=line===2?1:.65;c.stroke();}
 c.restore();c.globalAlpha=1;c.fillStyle='#8aa19b';c.font=`${Math.max(9,w*.008)}px Arial`;
 c.fillText('+2',w*.052,h*(.86-2*sy)+3);c.fillText('0',w*.061,h*.86+3);c.fillText('-2',w*.052,h*(.86+2*sy)+3);c.fillText('x = 0',w*.09,h*.965);c.textAlign='right';c.fillText('x = 1',w*.94,h*.965);c.textAlign='left';
 if(exporting){c.fillStyle='#c7cdb8';c.font=`${w*.007}px Arial`;c.fillText(`SHUMPEI KAI / NAGINO OBSERVATORY / T ${p.period.toFixed(1)} s / PHASE ${controls.phase.value} deg / r ${p.ratio.toFixed(2)} / t ${time.toFixed(1)} s`,w*.04,h*.05);}
}
function redraw(){draw(ctx,width,height);}
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);width=canvas.width=Math.max(1,Math.round(r.width*d));height=canvas.height=Math.max(1,Math.round(r.height*d));redraw();}
function animate(now){const dt=last===null?0:Math.min((now-last)/1000,.1);last=now;if(!paused&&!document.hidden){time+=dt;if(now-painted>=40){redraw();painted=now;}if(now-readAt>=250){readout();readAt=now;}}requestAnimationFrame(animate);}
for(const input of Object.values(controls))input.addEventListener('input',()=>{sync();redraw();});
document.querySelectorAll('[data-voice]').forEach(button=>button.addEventListener('click',()=>{voice=button.dataset.voice;document.querySelectorAll('[data-voice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));narratives();}));
$('#compare').addEventListener('change',narratives);
$('#pause').addEventListener('click',()=>{paused=!paused;sync();});
$('#reset').addEventListener('click',()=>{controls.period.value='8';controls.phase.value='90';controls.ratio.value='0.6';time=0;sync();redraw();$('#status').textContent='波の条件と時間を最初に戻しました。';});
$('#save').addEventListener('click',()=>{const out=document.createElement('canvas');out.width=2400;out.height=1600;draw(out.getContext('2d'),2400,1600,true);out.toBlob(blob=>{if(!blob){$('#status').textContent='保存できませんでした。もう一度お試しください。';return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='shumpei-kai-nagino-observatory.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);$('#status').textContent='この瞬間の風景と波の条件をPNG画像として保存しました。';},'image/png');});
sync();new ResizeObserver(resize).observe(canvas);resize();requestAnimationFrame(animate);
})();
