(()=>{"use strict";
const $=id=>document.getElementById(id);
const A=window.Astrorium,STORAGE="astrorium-ipad-mode-v1";
if(!A||!window.AstroriumRenderer){$("skyStatus").textContent="星空エンジンを読み込めませんでした";return}
const canvas=$("sky"),rect=()=>canvas.getBoundingClientRect();
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const norm=x=>((x%360)+360)%360;
const two=n=>String(n).padStart(2,"0");
const localDate=d=>[d.getFullYear(),two(d.getMonth()+1),two(d.getDate())].join("-")+"T"+two(d.getHours())+":"+two(d.getMinutes());
const shortDate=d=>d.toLocaleString("ja-JP",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit",hour12:false});
let s=A.makeState(),saveTimer=0,clockAnchor=performance.now(),timeAnchor=Date.now();
try{
 const raw=localStorage.getItem(STORAGE);
 if(raw){const data=JSON.parse(raw);s=A.revive(data);if(!Number.isFinite(s.time.getTime()))throw Error("invalid time")}
 else{const sunset=A.sunsetForDate(s.time,s.location.lat,s.location.lon);if(sunset)s.time=new Date(sunset.getTime()+45*60000)}
}catch(e){console.warn("iPad state restore skipped",e);s=A.makeState()}
s.running=!!s.running;
s.rate=[1,60,600,3600].includes(Number(s.rate))?Number(s.rate):60;
s.global.direction=false;s.global.time=false;s.global.coordinates=false;
// Remove legacy selection labels/highlights on constellations; layer visibility now owns their names.
for(const c of A.D.constellations){delete s.highlights[c.id];delete s.labels[c.id]}
if(!s.display?.ipadStarAppearanceV1)s.display={...s.display,starScale:2.3,starBrightness:1.25,starSpikes:true,ipadStarAppearanceV1:true};
s.display={...s.display,starScale:Math.max(1,Math.min(12,Number(s.display.starScale)||2.3)),starBrightness:Math.max(.4,Math.min(4,Number(s.display.starBrightness)||1.25)),starSpikes:s.display.starSpikes!==false,objectTextScale:1.6,constellationTextScale:1.6,hudTextScale:1.4};
function anchor(){clockAnchor=performance.now();timeAnchor=s.time.getTime()}
anchor();
const renderer=window.AstroriumRenderer.createRenderer(canvas,A,{backend:"auto"});
let previousSelected=null,drawTime=0,displayTime=0,scale=.75,avgMs=12,lastTune=performance.now(),nextFrame=0,toastTimer=0;
let tourTimer=null,tourIndex=0;
function persist(){
 clearTimeout(saveTimer);
 saveTimer=setTimeout(()=>{
  try{localStorage.setItem(STORAGE,A.serial(s))}catch(e){console.warn("iPad settings not saved",e)}
 },350);
}
function notice(text){
 const el=$("notice");
 clearTimeout(toastTimer);el.textContent=text;el.classList.add("show");
 toastTimer=setTimeout(()=>el.classList.remove("show"),2600);
}
function renderClock(){
 $("skyStatus").textContent=(s.location.name||"観測地点")+" · "+shortDate(s.time)+" · "+A.dir16(s.camera.az);
 $("play").textContent=s.running?"Ⅱ 停止":"▶ 再生";
 $("play").setAttribute("aria-pressed",String(s.running));
 $("projection").setAttribute("aria-pressed",String(s.projection==="allsky"));
 $("projection").textContent=s.projection==="allsky"?"通常":"全天";
 $("fov").value=String(Math.round(s.camera.fov));
 $("fovText").textContent="画角 "+Math.round(s.camera.fov)+"°";
 if(document.activeElement!==$("dateTime"))$("dateTime").value=localDate(s.time);
}
function setTime(date){
 if(!(date instanceof Date)||!Number.isFinite(date.getTime())){notice("日時を確認してください");return}
 s.time=date;anchor();renderClock();refreshConstellationPicker();persist();
}
function advance(ms){setTime(new Date(s.time.getTime()+ms))}
function setRunning(value){s.running=!!value;anchor();renderClock();persist()}
function cameraPatch(patch){A.command(s,{type:"camera",value:patch});renderClock();persist()}
function changeLayer(key,on){
 s.global[key]=on;persist();syncLayers();
}
const layers=[
 ["stars","恒星"],["starNames","星の名前"],["planets","惑星"],["planetNames","惑星名"],
 ["moon","月"],["sun","太陽"],["daylight","昼光と薄明"],["moonlight","月明かり"],
 ["milkyWay","天の川"],["naturalDeepSky","星雲・星団"],["lines","星座線"],
 ["names","星座名"],["arts","星座絵"],["asterisms","アステリズム"],
 ["sporadicMeteors","散在流星"],["aurora","オーロラ"],["scintillation","瞬き"]
];
function buildLayers(){
 const host=$("layerList");
 for(const [key,label] of layers){
  const row=document.createElement("label");row.className="toggle";
  const span=document.createElement("span");span.textContent=label;
  const check=document.createElement("input");check.type="checkbox";check.dataset.layer=key;
  check.checked=!!s.global[key];
  check.addEventListener("change",()=>changeLayer(key,check.checked));
  row.append(span,check);host.appendChild(row);
 }
}
function setupStarAppearance(){
 const settings=[["starSize","starScale",1,12,1],["starBrightness","starBrightness",.4,4,2]];
 const sync=()=>{
  for(const [id,key,,,decimals] of settings)for(const suffix of ["","Landscape"]){
   $(id+suffix).value=String(s.display[key]);
   $(id+suffix+"Value").textContent=Number(s.display[key]).toFixed(decimals);
  }
  for(const id of ["starSpikes","starSpikesLandscape"])$(id).checked=!!s.display.starSpikes;
 };
 for(const [id,key,min,max] of settings)for(const suffix of ["","Landscape"]){
  $(id+suffix).addEventListener("input",e=>{
   s.display[key]=Math.max(min,Math.min(max,Number(e.target.value)));sync();persist();
  });
 }
 for(const id of ["starSpikes","starSpikesLandscape"])$(id).addEventListener("change",e=>{
  s.display.starSpikes=e.target.checked;sync();persist();
 });
 sync();
}
function buildPortraitLayers(){
 const host=$("portraitLayerList");
 if(!host)return;
 for(const [key,label] of layers){
  const row=document.createElement("label");row.className="pLayer";
  const input=document.createElement("input");input.type="checkbox";input.dataset.portraitLayer=key;
  input.checked=!!s.global[key];input.onchange=()=>changeLayer(key,input.checked);
  const text=document.createElement("span");text.textContent=label;
  row.append(input,text);host.appendChild(row);
 }
}
function syncLayers(){
 document.querySelectorAll("[data-layer]").forEach(el=>{el.checked=!!s.global[el.dataset.layer]});
 document.querySelectorAll("[data-portrait-layer]").forEach(el=>{el.checked=!!s.global[el.dataset.portraitLayer]});
}
const sheet=$("sheet"),scrim=$("scrim");
function chooseTab(name){
 document.querySelectorAll(".tab").forEach(el=>el.classList.toggle("active",el.dataset.tab===name));
 document.querySelectorAll(".pane").forEach(el=>el.classList.toggle("active",el.dataset.pane===name));
 if(name==="explore" && sheet.classList.contains("open"))setTimeout(()=>$("query").focus({preventScroll:true}),320);
}
function openSheet(tab="explore"){
 chooseTab(tab);sheet.classList.add("open");scrim.classList.add("open");sheet.setAttribute("aria-hidden","false");
}
function closeSheet(){
 sheet.classList.remove("open");scrim.classList.remove("open");sheet.setAttribute("aria-hidden","true");
 if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
}
$("openSearch").onclick=()=>choosePortraitTab("explore");
$("openSettings").onclick=()=>choosePortraitTab("layers");
$("openLayers").onclick=()=>choosePortraitTab("layers");
$("closeSheet").onclick=closeSheet;scrim.onclick=closeSheet;
document.querySelectorAll(".tab").forEach(el=>el.onclick=()=>chooseTab(el.dataset.tab));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeSheet()});
$("cardClose").onclick=()=>hideCard();
function hideCard(){$("objectCard").classList.remove("show")}

// Use the persistent bottom console for all routine iPad operations.
// Drag the separator, or use keyboard arrows, without stealing gestures from the sky.
function setupResizableConsole(){
 const grip=$("consoleResize"),key="astrorium-ipad-sky-split-v1";
 const portrait=()=>window.matchMedia("(orientation: portrait)").matches;
 const limits=()=>portrait()?[38,80]:[30,78];
 let values={portrait:66.666667,landscape:64};
 try{const saved=JSON.parse(localStorage.getItem(key)||"{}");for(const k of ["portrait","landscape"])if(Number.isFinite(Number(saved[k])))values[k]=Number(saved[k])}catch(_){}
 const mode=()=>portrait()?"portrait":"landscape";
 function apply(pct,save=false){
  const [low,high]=limits(),n=clamp(pct,low,high),k=mode();values[k]=n;
  document.documentElement.style.setProperty("--ipad-sky-height",n+"dvh");
  grip.setAttribute("aria-valuemin",String(low));grip.setAttribute("aria-valuemax",String(high));
  grip.setAttribute("aria-valuenow",String(Math.round(n)));grip.setAttribute("aria-valuetext","星空 "+Math.round(n)+"%、メニュー "+Math.round(100-n)+"%");
  if(save)try{localStorage.setItem(key,JSON.stringify(values))}catch(_){}
 }
 let dragging=null;
 grip.addEventListener("pointerdown",e=>{
  if(e.pointerType==="mouse"&&e.button!==0)return;
  e.preventDefault();dragging=e.pointerId;grip.classList.add("dragging");
  try{grip.setPointerCapture(e.pointerId)}catch(_){}
 });
 grip.addEventListener("pointermove",e=>{
  if(e.pointerId!==dragging)return;
  e.preventDefault();apply(e.clientY/Math.max(1,window.innerHeight)*100);
 });
 const finish=e=>{if(e.pointerId!==dragging)return;dragging=null;grip.classList.remove("dragging");apply(values[mode()],true)};
 grip.addEventListener("pointerup",finish);grip.addEventListener("pointercancel",finish);
 grip.addEventListener("keydown",e=>{
  const delta=e.key==="ArrowUp"?-2:e.key==="ArrowDown"?2:e.key==="PageUp"?-10:e.key==="PageDown"?10:0;
  if(!delta&&e.key!=="Home"&&e.key!=="End")return;
  e.preventDefault();const [low,high]=limits();
  apply(e.key==="Home"?low:e.key==="End"?high:values[mode()]+delta,true);
 });
 const orient=window.matchMedia("(orientation: portrait)");
 orient.addEventListener?.("change",()=>apply(values[mode()]));
 window.addEventListener("resize",()=>apply(values[mode()]));
 apply(values[mode()]);
}
function installBottomConsole(){
 for(const name of ["explore","time","data"]){
  const source=document.querySelector('[data-pane="'+name+'"]');
  const target=document.querySelector('[data-portrait-page="'+name+'"]');
  if(source&&target){source.classList.add("active");target.append(source)}
 }
}
function choosePortraitTab(name){
 closeSheet();
 document.querySelectorAll("[data-portrait-tab]").forEach(el=>{
  const active=el.dataset.portraitTab===name;
  el.classList.toggle("active",active);el.setAttribute("aria-pressed",String(active));
 });
 document.querySelectorAll("[data-portrait-page]").forEach(el=>el.classList.toggle("active",el.dataset.portraitPage===name));
}
document.querySelectorAll("[data-portrait-tab]").forEach(el=>el.onclick=()=>choosePortraitTab(el.dataset.portraitTab));
$("portraitOpenSearch").onclick=()=>choosePortraitTab("explore");
function removeSelection(){
 if(previousSelected){delete s.highlights[previousSelected];delete s.labels[previousSelected]}
 previousSelected=null;
}
function aboveHorizon(obj){
 const p=A.targetPosition(obj.id,s.time)||obj;
 if(!Number.isFinite(Number(p?.ra))||!Number.isFinite(Number(p?.dec)))return false;
 return A.altaz(Number(p.ra),Number(p.dec),s.time,s.location.lat,s.location.lon).alt>=0;
}
function refreshConstellationPicker(){
 const all=[...A.D.constellations].sort((a,b)=>(a.name||a.id).localeCompare(b.name||b.id,"ja"));
 const byVisibility={visible:[],hidden:[]};
 for(const c of all)(aboveHorizon(c)?byVisibility.visible:byVisibility.hidden).push(c);
 for(const selectId of ["portraitConstellationSelect","exploreConstellationSelect"]){
  const select=$(selectId),old=select.value||activeConstellationId;
  select.replaceChildren();
  for(const [label,rows] of [["今、地平線の上にある星座",byVisibility.visible],["地平線の下にある星座",byVisibility.hidden]]){
   if(!rows.length)continue;
   const group=document.createElement("optgroup");group.label=label;
   for(const obj of rows){const option=document.createElement("option");option.value=obj.id;option.textContent=obj.name||obj.id;group.append(option)}
   select.append(group);
  }
  select.value=old;
  if(!select.value&&all.length)select.value=all[0].id;
 }
}
const lookup=[
 ...A.D.constellations.map(o=>({...o,kind:"星座"})),
 ...A.D.stars.map(o=>({...o,kind:"恒星"})),
 ...A.D.dsos.map(o=>({...o,kind:"星雲・星団"})),
 ...A.D.planetsInfo.map(o=>({...o,kind:"惑星"})),
 {id:"Moon",name:"月",kind:"月"},{id:"Sun",name:"太陽",kind:"太陽"}
];
function findEntry(id){return lookup.find(o=>o.id===id)||A.targetById(id)}
let activeConstellationId=null,relatedConstellationId=null;
const constToggleLabels={line:"星座線",art:"星座絵",name:"星座名"};
function cleanGuideText(value){
 return String(value??"").replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
}
function relatedConstellation(obj){
 const id=obj?.constellation||obj?.constellation_id;
 return A.D.constellations.some(c=>c.id===id)?id:null;
}
function guideStory(obj){
 if(obj.kind==="星座"){
  const sections=[];
  if(obj.science)sections.push("【星座について】\n"+cleanGuideText(obj.science));
  if(obj.myth)sections.push("【神話・由来】\n"+cleanGuideText(obj.myth));
  if(!sections.length&&obj.story)sections.push(cleanGuideText(obj.story));
  return sections.join("\n\n")||"この星座の星座線・星座絵・星座名を個別に切り替えて、夜空の位置を確かめてみましょう。";
 }
 return cleanGuideText(obj.story||obj.science||obj.highlight||obj.myth)||
 "夜空の中で見つけた天体です。検索から別の天体を探すこともできます。";
}
function syncConstellationControls(){
 const id=activeConstellationId;
 const isGuideConstellation=s.selected===id&&!!id;
 ["constellationCardActions","portraitGuideActions"].forEach(k=>{$(k).hidden=!isGuideConstellation});
 $("portraitConstellationActions").hidden=!id;
 document.querySelectorAll("[data-const-toggle]").forEach(button=>{
  const key=button.dataset.constToggle;
  const enabled=!!(id&&A.effectiveConst(s,id,key));
  button.setAttribute("aria-pressed",String(enabled));
  button.textContent=constToggleLabels[key]+" "+(enabled?"ON":"OFF");
  button.disabled=!id;
 });
 if(id){$("portraitConstellationSelect").value=id;$("exploreConstellationSelect").value=id;}
}
function toggleIndividualConstellation(key){
 if(!activeConstellationId||!constToggleLabels[key])return;
 const enabled=A.effectiveConst(s,activeConstellationId,key);
 A.command(s,{type:"const",id:activeConstellationId,key,value:!enabled});
 syncConstellationControls();persist();
}
document.querySelectorAll("[data-const-toggle]").forEach(button=>{
 button.onclick=()=>toggleIndividualConstellation(button.dataset.constToggle);
});
function jumpToRelatedConstellation(){
 if(relatedConstellationId)selectTarget(relatedConstellationId,true);
}
$("objectConstellationJump").onclick=jumpToRelatedConstellation;
$("portraitConstellationJump").onclick=jumpToRelatedConstellation;
function initConstellationPicker(){
 activeConstellationId=A.D.constellations.find(c=>c.id==="Ori")?.id||A.D.constellations[0]?.id||null;
 refreshConstellationPicker();
 $("portraitConstellationSelect").value=activeConstellationId||"";
 $("exploreConstellationSelect").value=activeConstellationId||"";
 $("portraitConstellationSelect").onchange=()=>{selectTarget($("portraitConstellationSelect").value,true);choosePortraitTab("constellations")};
 $("exploreConstellationSelect").onchange=()=>{
  activeConstellationId=$("exploreConstellationSelect").value;
  $("portraitConstellationSelect").value=activeConstellationId;syncConstellationControls();
 };
 $("exploreCenterConstellation").onclick=()=>selectTarget($("exploreConstellationSelect").value,true);
 $("portraitCenterConstellation").onclick=()=>{
  if(!activeConstellationId)return;
  selectTarget(activeConstellationId,true);choosePortraitTab("constellations");
 };
 syncConstellationControls();
}

function showCard(obj){
 if(!obj)return;
 removeSelection();
 const isConstellation=obj.kind==="星座"||A.D.constellations.some(c=>c.id===obj.id);
 previousSelected=obj.id;
 // Constellations already have separately controlled names and artwork: no extra ring or label.
 if(!isConstellation){s.highlights[obj.id]=true;s.labels[obj.id]=true}
 s.selected=obj.id;
 if(isConstellation)activeConstellationId=obj.id;
 relatedConstellationId=isConstellation?null:relatedConstellation(obj);
 const name=obj.name||obj.display_name||obj.id;
 const category=isConstellation?"星座":obj.kind||obj.cat||"天体";
 const magnitude=obj.mag??obj.magnitude_v;
 const meta=category+(magnitude!==null&&magnitude!==undefined&&Number.isFinite(Number(magnitude))&&Number(magnitude)<30?" · 約"+Number(magnitude).toFixed(1)+"等":"");
 const story=guideStory({...obj,kind:isConstellation?"星座":obj.kind});
 $("objectName").textContent=name;
 $("objectMeta").textContent=meta;
 $("objectStory").textContent=story.slice(0,1200);
 $("portraitName").textContent=name;
 $("portraitMeta").textContent=meta;
 $("portraitStory").textContent=story.slice(0,4200);
 for(const id of ["objectConstellationJump","portraitConstellationJump"]){
  const btn=$(id);btn.hidden=!relatedConstellationId;
  if(relatedConstellationId){
   const c=A.D.constellations.find(x=>x.id===relatedConstellationId);
   btn.textContent=(c?.name||"所属する星座")+"の案内を見る";
  }
 }
 syncConstellationControls();
 choosePortraitTab("guide");
 $("objectCard").classList.add("show");persist();
}
function selectTarget(id,center=true){
 const obj=findEntry(id);if(!obj)return;
 if(center){
  s.projection="perspective";
  const result=A.centerOn(s,id);
  if(!result.ok)notice("現在の日時では地平線の下です");
 }
 showCard(obj);renderClock();closeSheet();persist();
}
function search(text){
 const host=$("results");host.replaceChildren();
 const q=String(text||"").trim().toLowerCase().normalize("NFKC");
 if(!q){const p=document.createElement("p");p.className="note";p.textContent="例：オリオン、カシオペヤ、M31、木星";host.append(p);return}
 let n=0;
 const ordered=[...lookup].sort((a,b)=>Number(aboveHorizon(b))-Number(aboveHorizon(a)));
 for(const o of ordered){
  if(n>=45)break;
  const name=[o.name,o.en,o.id,o.display_name,...(o.aliases||[])].filter(Boolean).join(" ").toLowerCase().normalize("NFKC");
  if(!name.includes(q))continue;
  const b=document.createElement("button");b.className="result";
  b.textContent=(o.name||o.id)+"  ·  "+o.kind+"  ·  "+(aboveHorizon(o)?"地平線の上":"地平線の下");
  b.onclick=()=>selectTarget(o.id,true);host.append(b);n++;
 }
 if(!n){const p=document.createElement("p");p.className="note";p.textContent="見つかりませんでした。別の名前で検索してください。";host.append(p)}
}
$("query").addEventListener("input",()=>search($("query").value));
function setTheme(name){
 stopTour();
 if(name==="tour"){startTour();closeSheet();return}
 if(name==="tonight"||name==="constellations"||name==="milkyway"){
  const sunset=A.sunsetForDate(s.time,s.location.lat,s.location.lon);
  if(sunset)setTime(new Date(sunset.getTime()+60*60000));
  s.global.stars=true;s.global.milkyWay=true;s.global.naturalDeepSky=true;
  s.global.lines=name==="constellations";s.global.names=name==="constellations";s.global.arts=name==="constellations";
  cameraPatch({az:name==="milkyway"?195:180,alt:name==="milkyway"?45:50,fov:name==="constellations"?95:115});
  if(name==="constellations")A.centerOn(s,"Cyg");
 }else if(name==="moon"){
  s.global.moon=true;s.global.moonlight=true;s.global.daylight=true;
  cameraPatch({fov:35});A.centerOn(s,"Moon");showCard(findEntry("Moon"));
 }else if(name==="aurora"){
  s.global.aurora=true;s.global.auroraIntensity=1.45;s.global.daylight=true;
  const sunset=A.sunsetForDate(s.time,s.location.lat,s.location.lon);
  if(sunset)setTime(new Date(sunset.getTime()+120*60000));
  cameraPatch({az:s.location.lat>=0?0:180,alt:18,fov:110});
  notice("オーロラは教育用の近似表現です");
 }
 syncLayers();renderClock();persist();closeSheet();
}
// Theme presets removed from iPad UI; the direct “今夜” shortcut remains.
const tourIds=["Ori","UMa","Cyg","Sco","Sgr","And","Cas","Tau"];
function stopTour(){if(tourTimer){clearInterval(tourTimer);tourTimer=null}}
function nextTour(){
 const id=tourIds[tourIndex++%tourIds.length];
 A.centerOn(s,id);cameraPatch({fov:83});const entry=findEntry(id);
 if(entry)showCard(entry);
}
function startTour(){
 const sunset=A.sunsetForDate(s.time,s.location.lat,s.location.lon);
 if(sunset)setTime(new Date(sunset.getTime()+75*60000));
 s.global.lines=true;s.global.arts=true;s.global.names=true;syncLayers();
 tourIndex=0;nextTour();tourTimer=setInterval(nextTour,18000);
 notice("星空めぐりを開始しました");
}
$("stepBack").onclick=()=>{stopTour();advance(-3600000)};
$("stepNext").onclick=()=>{stopTour();advance(3600000)};
$("play").onclick=()=>{stopTour();setRunning(!s.running)};
$("now").onclick=()=>{stopTour();setTime(new Date());notice("現在の日時に移動しました")};
$("tonight").onclick=()=>setTheme("tonight");
$("projection").onclick=()=>{
 stopTour();A.command(s,{type:"projection",value:s.projection==="allsky"?"perspective":"allsky"});
 renderClock();persist();
};
$("fov").addEventListener("input",()=>{stopTour();cameraPatch({fov:Number($("fov").value)})});
$("dateTime").addEventListener("change",()=>{stopTour();setTime(new Date($("dateTime").value))});
$("prevDay").onclick=()=>{stopTour();advance(-86400000)};
$("nextDay").onclick=()=>{stopTour();advance(86400000)};
$("jumpSunset").onclick=()=>{
 const sunset=A.sunsetForDate(s.time,s.location.lat,s.location.lon);
 if(sunset)setTime(sunset);else notice("この日の日の入りは計算できません");
};
$("speed").value=String(s.rate);
$("speed").onchange=()=>{
 s.rate=Number($("speed").value)||60;anchor();persist();
};
function syncPlace(){
 $("placeName").value=s.location.name||"";
 $("lat").value=String(s.location.lat);$("lon").value=String(s.location.lon);
}
$("applyLocation").onclick=()=>{
 const lat=Number($("lat").value),lon=Number($("lon").value);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||!$("lat").value||!$("lon").value){notice("緯度・経度を確認してください");return}
 A.command(s,{type:"location",value:{name:$("placeName").value.trim()||"観測地",lat,lon}});
 syncPlace();renderClock();refreshConstellationPicker();persist();notice("観測地点を変更しました");
};
$("useGps").onclick=()=>{
 if(!navigator.geolocation){notice("この端末では位置情報を使えません");return}
 notice("位置情報を確認しています…");
 navigator.geolocation.getCurrentPosition(p=>{
  A.command(s,{type:"location",value:{name:"現在地",lat:p.coords.latitude,lon:p.coords.longitude,alt:Number(p.coords.altitude)||0}});
  syncPlace();renderClock();refreshConstellationPicker();persist();notice("現在地に移動しました");
 },()=>notice("位置情報を取得できませんでした"),{enableHighAccuracy:false,timeout:12000,maximumAge:120000});
};
$("pickStarCatalog").onclick=()=>$("starFile").click();
$("starFile").onchange=async()=>{
 const file=$("starFile").files?.[0];if(!file)return;
 $("catalogStatus").textContent="読み込み中…";
 try{
  const result=await A.importStarCatalogText(await file.text());
  $("catalogStatus").textContent="追加恒星 "+result.count.toLocaleString("ja-JP")+"件を保存しました。";
  notice("星カタログの取り込みが完了しました");
 }catch(e){$("catalogStatus").textContent="取り込みに失敗しました："+e.message}
 finally{$("starFile").value=""}
};
const pointers=new Map();let gesture=null;
function xy(e){const box=rect();return{x:e.clientX-box.left,y:e.clientY-box.top}}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function initialGesture(){
 const a=[...pointers.values()];
 if(a.length===1)gesture={type:"pan",start:a[0],az:s.camera.az,alt:s.camera.alt,moved:false};
 else if(a.length>=2)gesture={type:"pinch",dist:Math.max(10,distance(a[0],a[1])),fov:s.camera.fov,moved:true};
 else gesture=null;
}
canvas.addEventListener("pointerdown",e=>{
 if(e.pointerType==="mouse"&&e.button!==0)return;
 e.preventDefault();stopTour();$("hint").classList.add("hidden");hideCard();
 pointers.set(e.pointerId,xy(e));try{canvas.setPointerCapture(e.pointerId)}catch(_){}
 initialGesture();
});
canvas.addEventListener("pointermove",e=>{
 if(!pointers.has(e.pointerId))return;e.preventDefault();
 pointers.set(e.pointerId,xy(e));if(!gesture)return;
 if(pointers.size>=2){
  if(gesture.type!=="pinch")initialGesture();
  const a=[...pointers.values()],ratio=distance(a[0],a[1])/gesture.dist;
  cameraPatch({fov:clamp(gesture.fov/Math.max(.2,ratio),20,150)});
 }else if(gesture.type==="pan"){
  const p=[...pointers.values()][0],dx=p.x-gesture.start.x,dy=p.y-gesture.start.y;
  if(Math.hypot(dx,dy)>8)gesture.moved=true;
  if(!gesture.moved)return;
  const box=rect(),span=s.camera.fov;
  cameraPatch({az:norm(gesture.az-dx/Math.max(1,box.width)*span),alt:clamp(gesture.alt+dy/Math.max(1,box.height)*span*.65,-20,90)});
 }
});
function pointToSegmentDistance(p,a,b){
 const vx=b.x-a.x,vy=b.y-a.y,l2=vx*vx+vy*vy;
 if(l2<1e-6)return Math.hypot(p.x-a.x,p.y-a.y);
 const t=clamp(((p.x-a.x)*vx+(p.y-a.y)*vy)/l2,0,1);
 return Math.hypot(p.x-a.x-t*vx,p.y-a.y-t*vy);
}
function pick(p){
 const box=rect(),w=Math.max(1,canvas.width),h=Math.max(1,canvas.height);
 if(box.width<1||box.height<1)return;
 const sx=w/box.width,sy=h/box.height;
 const screenPoint=o=>{
  if(!o)return null;
  const q=A.point(o,s,w,h);
  if(!q||q.x<0||q.x>w||q.y<0||q.y>h)return null;
  return{x:q.x/sx,y:q.y/sy};
 };
 let bestObject=null,bestObjectDistance=30;
 const objects=[
  ...lookup.filter(o=>o.kind!=="星座"),
  ...A.onlineStars().filter(st=>Number(st.mag)<=4.2).slice(0,900)
 ];
 for(const obj of objects){
  const q=screenPoint(A.targetPosition(obj.id,s.time)||obj);
  if(!q)continue;
  const d=Math.hypot(q.x-p.x,q.y-p.y);
  if(d<bestObjectDistance){bestObject=obj;bestObjectDistance=d}
 }
 let bestLine=null,bestLineDistance=22;
 let bestConstellation=null,bestConstellationDistance=50;
 const projectedStars=new Map();
 function starPoint(id){
  if(!projectedStars.has(id))projectedStars.set(id,screenPoint(A.coordFor(id)));
  return projectedStars.get(id);
 }
 for(const obj of A.D.constellations){
  const rep=screenPoint(obj);
  if(rep){
   const d=Math.hypot(rep.x-p.x,rep.y-p.y);
   if(d<bestConstellationDistance){bestConstellation=obj;bestConstellationDistance=d}
  }
  for(const [one,two] of A.constellationSegments(obj.abbr,s)){
   const a=starPoint(one),b=starPoint(two);
   if(!a||!b)continue;
   // Reject projected segments that cross an enormous arc or wrap at the screen edge.
   if(Math.hypot(a.x-b.x,a.y-b.y)>Math.max(box.width,box.height)*.5)continue;
   const d=pointToSegmentDistance(p,a,b);
   if(d<bestLineDistance){bestLine=obj;bestLineDistance=d}
  }
 }
 // Exact taps on an individual star/planet win; a nearby constellation line wins next.
 const chosen=(bestObject&&bestObjectDistance<13)?bestObject:
   bestLine||bestObject||bestConstellation;
 if(chosen)showCard(findEntry(chosen.id)||chosen);
 else{hideCard();$("portraitName").textContent="星空の案内";$("portraitMeta").textContent="近くに登録された天体がありません";$("portraitStory").textContent="星座線の近くをタップするか、検索から天体や星座を選んでください。"}
}
function endPointer(e,cancelled=false){
 if(!pointers.has(e.pointerId))return;
 const last=pointers.get(e.pointerId);
 const tap=!cancelled&&pointers.size===1&&gesture?.type==="pan"&&!gesture.moved&&distance(last,gesture.start)<12;
 pointers.delete(e.pointerId);initialGesture();
 if(tap)pick(last);
}
canvas.addEventListener("pointerup",e=>endPointer(e));
canvas.addEventListener("pointercancel",e=>endPointer(e,true));
canvas.addEventListener("contextmenu",e=>e.preventDefault());
document.addEventListener("visibilitychange",()=>{if(document.hidden){stopTour();persist()}else anchor()});
window.addEventListener("pagehide",()=>{stopTour();try{localStorage.setItem(STORAGE,A.serial(s))}catch(_){}});
function loop(t){
 if(s.running)s.time=new Date(timeAnchor+(t-clockAnchor)*s.rate);
 if(t>=nextFrame){
  const cost=renderer.render(s,{dprScale:scale,projector:true});
  avgMs=avgMs*.91+cost*.09;
  if(t-lastTune>1500){
   if(avgMs>26)scale=clamp(scale-.08,.52,.88);
   else if(avgMs<13)scale=clamp(scale+.035,.52,.88);
   lastTune=t;
  }
  nextFrame=t+(avgMs>26?1000/24:1000/30);
 }
 if(t-displayTime>900){renderClock();displayTime=t}
 requestAnimationFrame(loop);
}
setupResizableConsole();installBottomConsole();buildLayers();buildPortraitLayers();setupStarAppearance();initConstellationPicker();syncLayers();syncPlace();renderClock();search("");
Promise.resolve(A.loadLines()).then(info=>{
 let total=0,ready=0;
 for(const c of A.D.constellations)for(const [a,b] of A.constellationSegments(c.abbr,s)){
  total++;if(A.coordFor(a)&&A.coordFor(b))ready++;
 }
 const ok=info?.full&&ready===total&&total>0;
 $("lineStatus").textContent="星座線 "+ready+" / "+total+" 線分の座標を確認"+(ok?"（正常）":"（データ不足。再読み込みしてください）");
 if(!ok)notice("星座線データが不完全です");
}).catch(error=>{console.error(error);$("lineStatus").textContent="星座線データの読み込みに失敗しました";notice("星座線データを確認してください")});
Promise.resolve(A.loadMilkyWay()).catch(console.warn);
Promise.resolve(A.loadOnlineStars()).then(info=>{
 $("catalogStatus").textContent=info.count?"追加恒星 "+info.count.toLocaleString("ja-JP")+"件を読み込みました。":"追加の約8等星カタログは未登録です。必要ならJSONを取り込んでください。";
}).catch(()=>{$("catalogStatus").textContent="追加の星カタログは未登録です。"});
window.AstroriumArtImageStore?.applyAll(A).catch(console.warn);
window.AstroriumIPadDiagnostics={version:"1.0.0",state:()=>JSON.parse(A.serial(s)),renderer:()=>renderer.diagnostics()};
requestAnimationFrame(loop);
})();