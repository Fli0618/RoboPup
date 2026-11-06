(() => {
 'use strict';
 const q=s=>document.querySelector(s);
 const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const style=document.createElement('style');
 style.textContent=`
 .isaac-sim-review{margin:28px 0;padding:26px;border:1px solid #a5bfc8;border-radius:16px;background:#f4fafb;color:#21485a}.isaac-sim-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:18px}.isaac-sim-review h2{font-size:27px;margin:4px 0 14px}.isaac-sim-review p{line-height:1.7}.isaac-sim-badge{display:inline-block;padding:9px 13px;border-radius:9px;background:#e5eef2;color:#345c6d;font-weight:700;white-space:nowrap}.isaac-sim-badge.pass{background:#def1e7;color:#23684a}.isaac-sim-badge.fail{background:#fbe8e2;color:#97482e}.isaac-sim-facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:20px 0}.isaac-sim-facts div{padding:14px;border:1px solid #d1e1e6;border-radius:10px;background:white}.isaac-sim-facts dt{font-size:14px;color:#547181}.isaac-sim-facts dd{font-size:25px;font-weight:700;margin:7px 0 0}.isaac-sim-note{padding:13px 16px;border-left:4px solid #c68d3c;background:#fff6e6}.isaac-sim-downloads{display:flex;flex-wrap:wrap;gap:12px 22px;margin:18px 0}.isaac-sim-downloads a{font-weight:600}.isaac-sim-tests{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin:18px 0}.isaac-sim-test{background:white;border:1px solid #d3e0e6;border-radius:10px;padding:17px}.isaac-sim-test h3{font-size:18px;margin:0 0 12px}.isaac-sim-test .test-status{font-size:14px;font-weight:700;color:#537183}.isaac-sim-test[data-status="pass"] .test-status{color:#276b4c}.isaac-sim-test[data-status="fail"] .test-status{color:#a34c30}.isaac-sim-test p{font-size:14px;margin:9px 0 0;overflow-wrap:anywhere}.isaac-sim-results{margin:22px 0 10px}.isaac-sim-results video{width:100%;max-height:640px;background:#e5edf0;border-radius:12px}.isaac-sim-results img{display:block;max-width:100%;max-height:640px;margin:auto;object-fit:contain}.isaac-sim-results figcaption{font-size:14px;line-height:1.6;color:#527080;margin-top:10px}.isaac-sim-limits{margin:16px 0 0}.isaac-sim-limits summary{cursor:pointer;font-weight:600}.isaac-sim-limits ul{padding-left:24px;line-height:1.7}.isaac-sim-limits li{margin:7px 0}.isaac-sim-review .isaac-sim-footnote{font-size:14px;margin-bottom:0;color:#587381}@media(max-width:750px){.isaac-sim-review{padding:18px}.isaac-sim-heading{display:block}.isaac-sim-review h2{font-size:23px}.isaac-sim-badge{white-space:normal}.isaac-sim-facts{grid-template-columns:repeat(2,minmax(0,1fr))}.isaac-sim-tests{grid-template-columns:1fr}.isaac-sim-downloads{flex-direction:column;gap:12px}.isaac-sim-facts dd{font-size:22px}}
 `;
 document.head.appendChild(style);
 style.textContent+=`.isaac-sim-change{margin:20px 0;padding:18px;border:1px solid #c8dfe2;border-radius:12px;background:white}.isaac-sim-change h3{margin:0 0 10px}.isaac-sim-change table{border-collapse:collapse;width:100%;font-size:15px}.isaac-sim-change th,.isaac-sim-change td{text-align:left;border-bottom:1px solid #e0eaed;padding:12px 8px}.isaac-sim-change th{background:#edf5f6}.isaac-sim-change small{display:block;margin-top:12px;line-height:1.6;color:#527080}@media(max-width:750px){.isaac-sim-change{padding:12px}.isaac-sim-change table{font-size:12px}.isaac-sim-change th,.isaac-sim-change td{padding:10px 3px}}`;
 const section=document.createElement('section');
 section.id='isaacSimulationReview';section.className='isaac-sim-review';section.hidden=true;
 section.setAttribute('aria-labelledby','isaacSimulationTitle');
 q('#designMain')?.insertAdjacentElement('afterend',section);
 const statuses={
  PASS:{text:'通过',kind:'pass'},PASSED:{text:'通过',kind:'pass'},
  FAIL:{text:'未通过',kind:'fail'},FAILED:{text:'未通过',kind:'fail'},
  IN_PROGRESS:{text:'测试中',kind:'running'},RUNNING:{text:'测试中',kind:'running'},
  NOT_RUN:{text:'尚未运行',kind:'pending'},PENDING:{text:'待进行',kind:'pending'},
  BLOCKED:{text:'前置检查未通过',kind:'fail'},PLANNED:{text:'待进行',kind:'pending'},
  READY:{text:'资产已准备',kind:'pending'}
 };
 const testState=t=>statuses[String(t.status||'').toUpperCase()]||{text:'状态待核对',kind:'pending'};
 const metricText=value=>typeof value==='string'||typeof value==='number'?String(value):Array.isArray(value)?value.join('；'):'';
 const url=value=>typeof value==='string'&&!/^\s*(javascript|data):/i.test(value)?value:null;
 const link=(href,label)=>url(href)?`<a href="${esc(href)}">${esc(label)} ↗</a>`:'';
 window.renderIsaacSimulationReview=()=>{
  const d=window.PA35_ISAAC_SIM_REVIEW;
  section.hidden=!d;
  if(!d)return;
  const tests=Array.isArray(d.tests)?d.tests:[];
  const fail=tests.some(t=>!t.archived&&testState(t).kind==='fail');
  const active=tests.some(t=>testState(t).kind==='running');
  const anyPass=tests.some(t=>testState(t).kind==='pass');
  const badge=fail?'有检查项待解决':active?'测试进行中':anyPass?'已完成部分仿真检查':'仿真资产准备中';
  const assumedMass=Number(d.assumedMassKg);
  const mass=Number.isFinite(assumedMass)?assumedMass.toFixed(3)+' kg':'待赋值';
  section.dataset.status=d.status||'PREPARATION';
  section.innerHTML=`<div class="isaac-sim-heading"><div><p class="eyebrow">当前MAIN → Isaac Lab · 可动仿真</p><h2 id="isaacSimulationTitle">先检查关节与闭环，再站立、小跑</h2></div><span id="isaacSimulationBadge" class="isaac-sim-badge${fail?' fail':anyPass&&!active?' pass':''}">${badge}</span></div>
   <p id="isaacSimulationScope">基于当前MAIN ${esc(d.sourceRevision||'')}。仿真中将固定零件合为运动刚体，保留12个电机驱动和四连杆闭环；机械CAD仍为356个建模项。</p>
   <dl class="isaac-sim-facts"><div><dt>运动刚体</dt><dd>${esc(d.bodyCount??'待核')}</dd></div><div><dt>主动／被动转动关节</dt><dd>${esc(d.drivenCount??'待核')}／${esc(d.passiveCount??'待核')}</dd></div><div><dt>闭环／CAD可视实例</dt><dd>${esc(d.closureCount??'待核')}／${esc(d.visualCount??'待核')}</dd></div><div><dt>本轮假设质量</dt><dd>${mass}</dd></div></dl>
   <p id="isaacSimulationReadiness">${esc(d.readiness||'正在准备可动资产，测试结果以本节逐项记录为准。')}</p>
   <p class="isaac-sim-note"><strong>参数是假设，须用实测值替换。</strong> 本轮质量、惯量、电池占位质量及电机限幅用于探索；不据此认定实机能小跑或机械制造已放行。</p>
   <nav id="isaacSimulationDownloads" class="isaac-sim-downloads" aria-label="当前仿真资产与结果">${link(d.packageFile,'完整仿真包（含USD依赖）')}${link(d.assetFile,'可动USD入口（需同目录依赖）')}${link(d.metadataFile,'关节、质量与假设清单')}${link(d.resultsFile,'本轮仿真测试记录')}</nav>
   <div id="isaacSimulationTests" class="isaac-sim-tests">${tests.length?tests.map(t=>{const s=testState(t);return `<article class="isaac-sim-test" data-status="${t.archived?'archived':s.kind}"><h3>${esc(t.label||'待核检查项')}</h3><span class="test-status">${t.archived?'前序记录 · '+s.text:s.text}</span>${metricText(t.metric)?`<p>${esc(metricText(t.metric))}</p>`:''}</article>`;}).join(''):'<article class="isaac-sim-test" data-status="pending"><h3>测试记录</h3><span class="test-status">尚未提供运行结果</span></article>'}</div>
   ${d.contactComparison?`<div id="isaacContactComparison" class="isaac-sim-change"><h3>${esc(d.contactComparison.title)}</h3><p>${esc(d.contactComparison.description)}</p><table><thead><tr><th scope="col">部位</th><th scope="col">调整前</th><th scope="col">当前</th><th scope="col">离地且卸载</th></tr></thead><tbody>${(d.contactComparison.rows||[]).map(r=>`<tr><th scope="row">${esc(r.part)}</th><td>${esc(r.before)}</td><td>${esc(r.after)}</td><td>${esc(r.fraction)}</td></tr>`).join('')}</tbody></table><small>${esc(d.contactComparison.footnote)}</small></div>`:''}
   ${url(d.video)?`<figure class="isaac-sim-results"><video id="isaacSimulationVideo" controls preload="metadata" playsinline${url(d.poster)?` poster="${esc(d.poster)}"`:''}><source src="${esc(d.video)}" type="video/mp4"></video><figcaption>${esc(d.videoCaption||'本轮运行记录。动作结果只对应上述仿真假设与已列测试工况。')}</figcaption></figure>`:url(d.poster)?`<figure class="isaac-sim-results"><img id="isaacSimulationPoster" src="${esc(d.poster)}" alt="${esc(d.posterCaption||'本轮可动仿真资产与测试画面')}"><figcaption>${esc(d.posterCaption||'本轮可动资产记录；画面不替代物理测试指标。')}</figcaption></figure>`:''}
   ${(Array.isArray(d.videos)?d.videos:[]).filter(v=>url(v.src)).map((v,i)=>`<figure class="isaac-sim-results"><h3>${esc(v.title||'实际轨迹回放')}</h3><video id="isaacExtraVideo${i}" controls preload="metadata" playsinline${url(v.poster)?` poster="${esc(v.poster)}"`:''}><source src="${esc(v.src)}" type="video/mp4"></video><figcaption>${esc(v.caption||'实际仿真轨迹；对应参数假设见本页。')}</figcaption></figure>`).join('')}
   <details class="isaac-sim-limits"><summary>本轮边界与待补参数</summary><ul>${(Array.isArray(d.limits)?d.limits:[]).map(v=>`<li>${esc(v)}</li>`).join('')}</ul></details><p class="isaac-sim-footnote">站立、慢走和小跑各自记录结果；没有运行的项目保留“尚未运行”，不会由资产导出自动标为通过。</p>`;
 };
 window.isaacSimulationAudit=()=>{
  const d=window.PA35_ISAAC_SIM_REVIEW;
  return {visible:!section.hidden,status:d?.status||null,sourceRevision:d?.sourceRevision||null,
    bodyCount:d?.bodyCount,drivenCount:d?.drivenCount,passiveCount:d?.passiveCount,closureCount:d?.closureCount,
    assumedMassKg:d?.assumedMassKg,mechanicalMAINChanged:false,
    tests:(d?.tests||[]).map(t=>({label:t.label,status:t.status})),
    video:url(d?.video),assetFile:url(d?.assetFile),metadataFile:url(d?.metadataFile)};
 };
 window.renderIsaacSimulationReview();
 if(location.hash==='#isaacSimulationReview')section.scrollIntoView({behavior:'instant',block:'start'});
})();
