'use strict';
const $=id=>document.getElementById(id);
const canvas=$('chart'),ctx=canvas.getContext('2d');
let img=null, taps=[];
const stages=['HIGH','LOW','CLOSE'];
function draw(){if(!img)return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);ctx.lineWidth=2;ctx.font='12px system-ui';taps.forEach((p,i)=>{ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fillStyle=['#ffbf69','#6ee7f9','#71ed9c'][i%3];ctx.fill();ctx.strokeStyle='#101827';ctx.stroke();});}
function progress(){const n=Math.floor(taps.length/3);$('progress').textContent=img?`${n} complete candles · next: ${stages[taps.length%3]} of candle ${n+1}`:'No screenshot loaded';}
$('upload').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('image/')){alert('Select an image.');return;}const url=URL.createObjectURL(f),next=new Image();next.onload=()=>{img=next;const ratio=Math.min(1,1200/next.naturalWidth);canvas.width=Math.round(next.naturalWidth*ratio);canvas.height=Math.round(next.naturalHeight*ratio);taps=[];draw();progress();URL.revokeObjectURL(url);};next.onerror=()=>{alert('Could not open image.');URL.revokeObjectURL(url)};next.src=url;});
canvas.addEventListener('click',e=>{if(!img)return;const r=canvas.getBoundingClientRect();taps.push({x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height});draw();progress();});
$('undo').onclick=()=>{taps.pop();draw();progress()};$('reset').onclick=()=>{taps=[];draw();progress();$('result').textContent='Points reset.'};
function ema(values,period){const alpha=2/(period+1),out=Array(values.length).fill(null);if(values.length<period)return out;let sum=0;for(let i=0;i<period;i++)sum+=values[i];out[period-1]=sum/period;for(let i=period;i<values.length;i++)out[i]=alpha*values[i]+(1-alpha)*out[i-1];return out;}
function rsi(values,period=14){if(values.length<=period)return null;let gain=0,loss=0;for(let i=1;i<=period;i++){const d=values[i]-values[i-1];gain+=Math.max(d,0);loss+=Math.max(-d,0)}gain/=period;loss/=period;for(let i=period+1;i<values.length;i++){const d=values[i]-values[i-1];gain=(gain*(period-1)+Math.max(d,0))/period;loss=(loss*(period-1)+Math.max(-d,0))/period;}if(loss===0)return gain===0?50:100;return 100-100/(1+gain/loss);}
function macd(values){const fast=ema(values,12),slow=ema(values,26),line=values.map((_,i)=>fast[i]===null||slow[i]===null?null:fast[i]-slow[i]);const valid=line.filter(v=>v!==null);const signals=ema(valid,9);const i=valid.length-1;return {macd:valid[i],signal:signals[i],hist:signals[i]===null?null:valid[i]-signals[i],prevHist:i>0&&signals[i-1]!==null?valid[i-1]-signals[i-1]:null};}
function fractals(candles){const highs=[],lows=[];for(let i=2;i<candles.length-2;i++){const c=candles[i];if([i-2,i-1,i+1,i+2].every(j=>c.high>candles[j].high))highs.push(i);if([i-2,i-1,i+1,i+2].every(j=>c.low<candles[j].low))lows.push(i)}return{highs,lows};}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function readHistory(){try{return JSON.parse(localStorage.getItem('chartSignalHistory')||'[]')}catch{return []}}
function showHistory(){const items=readHistory();$('history').innerHTML=items.length?items.map(x=>`<div class="history-item"><b class="${esc(x.signal.toLowerCase())}">${esc(x.signal)}</b> · ${esc(x.time)}<div>RSI ${esc(x.rsi)} · MACD histogram ${esc(x.hist)} · ${esc(x.count)} candles</div></div>`).join(''):'No saved signals yet.';}
$('analyze').onclick=()=>{const count=Math.floor(taps.length/3);if(count<35){$('result').textContent=`Need at least 35 complete candles; currently ${count}.`;return;}if(taps.length%3!==0){$('result').textContent='Finish the current candle (high, low, close) before analyzing.';return;}
const candles=[];for(let i=0;i<taps.length;i+=3){const [h,l,c]=taps.slice(i,i+3);if(h.y>=l.y||c.y<h.y||c.y>l.y){$('result').textContent=`Candle ${i/3+1}: high must be above low and close must lie between them. Correct the last points or reset.`;return;}candles.push({high:-h.y,low:-l.y,close:-c.y});}
const closes=candles.map(c=>c.close),r=rsi(closes),m=macd(closes),f=fractals(candles),last=candles.length-1;
if(r===null||m.hist===null){$('result').textContent='Insufficient history for indicators.';return;}
const upFractal=f.highs.length?f.highs[f.highs.length-1]:null,downFractal=f.lows.length?f.lows[f.lows.length-1]:null;
const trend=closes[last]>closes[last-5]?1:closes[last]<closes[last-5]?-1:0;
let bullish=0,bearish=0,reasons=[];
if(m.hist>0){bullish++;reasons.push('MACD histogram positive')}else if(m.hist<0){bearish++;reasons.push('MACD histogram negative')}else reasons.push('MACD neutral');
if(r>=50&&r<70){bullish++;reasons.push('RSI favors upward momentum')}else if(r>30&&r<50){bearish++;reasons.push('RSI favors downward momentum')}else reasons.push('RSI extreme/neutral: caution');
if(trend>0){bullish++;reasons.push('Last 5 closes trending up')}else if(trend<0){bearish++;reasons.push('Last 5 closes trending down')};
const breakoutUp=upFractal!==null&&closes[last]>candles[upFractal].high,breakoutDown=downFractal!==null&&closes[last]<candles[downFractal].low;
if(breakoutUp){bullish++;reasons.push('Close above latest confirmed high fractal')}if(breakoutDown){bearish++;reasons.push('Close below latest confirmed low fractal')};
let signal='WAIT';if(bullish>=3&&bearish===0&&r<70)signal='UP';if(bearish>=3&&bullish===0&&r>30)signal='DOWN';
const hist=m.hist.toFixed(3),time=new Date().toLocaleString();$('result').innerHTML=`<div class="signal ${signal.toLowerCase()}">${signal}</div><b>RSI:</b> ${r.toFixed(1)}<br><b>MACD histogram:</b> ${hist} (relative chart units)<br><b>Fractals:</b> ${f.highs.length} confirmed highs, ${f.lows.length} confirmed lows<br><b>Agreement:</b> ${bullish} bullish / ${bearish} bearish factors<br><b>Why:</b><ul>${reasons.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><small>Not a probability, prediction, or instruction to trade. Visual marking error can change the signal.</small>`;
const items=readHistory();items.unshift({time,signal,rsi:r.toFixed(1),hist,count});try{localStorage.setItem('chartSignalHistory',JSON.stringify(items.slice(0,100)))}catch{}showHistory();};
$('clear').onclick=()=>{if(confirm('Delete all saved signal history?')){localStorage.removeItem('chartSignalHistory');showHistory()}};
$('export').onclick=()=>{const rows=readHistory();if(!rows.length){alert('No history to export');return;}const csv=['time,signal,rsi,macd_histogram,candles',...rows.map(x=>[x.time,x.signal,x.rsi,x.hist,x.count].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(','))].join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='signal-history.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
progress();showHistory();
