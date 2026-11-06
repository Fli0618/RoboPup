(() => {
 'use strict';
 const q=s=>document.querySelector(s), data=window.PHYSICAL_CONNECTION_REVIEW;
 if(!data||data.status!=='SOURCE_REVIEW_NOT_PHYSICAL_BOM'||typeof window.compareAudit!=='function')return;
 const sourceAudit=window.compareAudit;
 const txt=(id,t)=>{const el=q('#'+id);if(el)el.textContent=t;};
 const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const sign=n=>n==null?'待核':n>0?'+'+n:n<0?'−'+Math.abs(n):'0';
 const names={m1:'M1直接夹持',ab:'D1杯式连接',m3:'M3一体端部',pin:'上销固定',legother:'腿部小件',bodyadapter:'梁端直连',bodyother:'横梁支撑',battery:'电池固定'};
 const originals=Object.fromEntries((window.COMPARE_R2_REGIONS||[]).map(r=>[r.id,r.name]));
 const originalsR4={...originals,bodyadapter:'梁端直连'};
 const partition=data.mainPartition||[];
 const partById=Object.fromEntries(partition.map(r=>[r.id,r]));
 const active=a=>a.mode==='r4'&&a.wholeMain?.mode==='main';
 const style=document.createElement('style');style.textContent=`
 .physical-connection-review{margin:0 0 24px;border:1px solid #9eb7c6;border-radius:14px;background:#f6fbfd;padding:24px;color:#234759}.physical-connection-review h3{margin:5px 0 12px;font-size:24px}.physical-connection-review p{line-height:1.65}.physical-counts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0}.physical-counts>div{padding:14px;background:white;border:1px solid #d5e1e8;border-radius:10px}.physical-counts small{display:block;color:#587386}.physical-counts strong{display:block;font-size:24px;margin:8px 0}.physical-counts span{font-size:14px}.physical-source-photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:20px 0}.physical-source-photos figure{margin:0;background:white;border:1px solid #d5e1e8;border-radius:10px;overflow:hidden}.physical-source-photos button{display:block;width:100%;padding:0;border:0;background:white;cursor:zoom-in}.physical-source-photos img{display:block;width:100%;height:350px;object-fit:contain;background:#eef3f6}.physical-source-photos figcaption{padding:14px;font-size:14px;line-height:1.65}.physical-review-note{background:#fff6e8;border-left:4px solid #ce8d36;padding:12px 16px}.physical-model-rows{display:flex;gap:16px;flex-wrap:wrap;font-size:14px}.physical-evidence-link{display:inline-block;margin-top:8px}@media(max-width:650px){.physical-connection-review{padding:16px}.physical-counts,.physical-source-photos{grid-template-columns:1fr}.physical-source-photos img{height:300px}.physical-connection-review h3{font-size:21px}}
 `;document.head.appendChild(style);
 const panel=document.createElement('section');panel.id='physicalConnectionReview';panel.className='physical-connection-review';panel.setAttribute('aria-labelledby','physicalConnectionTitle');panel.hidden=true;
 panel.innerHTML=`<p class="eyebrow">原CAD已画数量与原实物装配分开核对</p><h3 id="physicalConnectionTitle">上销净变化为0；腿部小件的实物净增仍待核</h3><div class="physical-counts"><div><small>上销固定 · 相对原CAD</small><strong>${data.pinBefore} → ${data.pinAfter}（0）</strong><span>四根销＋四片垫圈＋四颗轴向螺钉</span></div><div><small>腿部小件 · CAD已画件</small><strong>159 → 296（+${data.modelDelta}）</strong><span>本组模型差额；当前MAIN沿用同组数量</span></div><div><small>腿部小件 · 实物净新增</small><strong>待核</strong><span>现有照片和PDF不足以填写0或137</span></div></div><p>原CAD已画其余连接小件${data.originalOther}项；当前MAIN为${data.interfaceScrews}颗接口螺钉＋${data.currentOther}项其余连接，共${data.interfaceScrews+data.currentOther}项。相同结构件和电机数量相抵后，CAD已画差额为${data.modelDelta}项。</p><p class="physical-review-note">已明确的补画案例：大腿外板原有5处连接孔，每腿只画1颗，补齐为5颗，四腿增加${data.confirmedSupplementalModelItems}个模型项。其余差额尚未逐项归因；实际新增紧固件数量继续按原实物装配核对。</p><div class="physical-source-photos">${(data.photos||[]).map((p,i)=>`<figure><button type="button" data-physical-photo="${i}" aria-label="放大来源照片${i+1}"><img src="${esc(p.src)}" alt="${esc(p.caption)}" loading="lazy"></button><figcaption>${esc(p.caption)}</figcaption></figure>`).join('')}</div><p>实拍能确认原结构采用紧凑的直接连接路线；背面、法兰接合面及遮挡处无法逐颗数清。PDF拆件展示可见螺钉、垫圈等紧固小件；它没有给出与这台实拍一一对应的完整制造BOM。</p><div class="physical-model-rows">${(data.groups||[]).map(g=>`<span>${esc(g.name)}：${g.perLeg}颗／腿，四腿${g.total}颗</span>`).join('')}</div><a class="physical-evidence-link" href="${esc(data.evidence)}">查看照片、PDF与模型数量核对依据 ↗</a>`;
 q('#legBreakdown')?.prepend(panel);
 panel.querySelectorAll('[data-physical-photo]').forEach(b=>b.addEventListener('click',()=>{const p=data.photos[Number(b.dataset.physicalPhoto)];if(!p)return;q('#zoomImage').src=p.src;txt('zoomTitle',p.caption);q('#zoomDialog').showModal();}));
 function navigation(a,isMain){
  const sourceById=Object.fromEntries((a.regions||[]).map(r=>[r.id,r]));
  document.querySelectorAll('.region-button[data-region],.hotspot[data-region]').forEach(b=>{
   const id=b.dataset.region,source=sourceById[id],main=partById[id];if(!source)return;
   const historyNames=a.mode==='r4'?originalsR4:originals;
   const label=isMain?(names[id]||historyNames[id]):historyNames[id];
   const delta=isMain?(id==='battery'?null:main?.delta):source.delta;
   const value=isMain&&id==='legother'?'模型 +137':sign(delta);
   const type=isMain?(id==='battery'?'pending':id==='legother'?'model':'resolved'):source.type;
   ['new','reduction','resolved','pending','model'].forEach(t=>b.classList.remove(t));b.classList.add(type);
   const n=b.querySelector('.name');if(n)n.textContent=label;
   const change=b.querySelector('.change');if(change)change.textContent=value;
   const tip=b.querySelector('.tip');if(tip)tip.textContent=label+' · '+value;
   const side=b.closest('.image-stage')?.dataset.side;
   const scope=isMain?(side==='before'?'原CAD基准':'当前MAIN'):(side==='before'?'原CAD基准':a.mode==='r2'?'历史R2':'历史R4');
   const meaning=isMain&&id==='legother'?'模型已画差额137项，实物净增待核':id==='battery'?'待选，不计数':'相对原CAD模型变化'+sign(delta)+'件';
   b.setAttribute('aria-label',scope+'，'+label+'，'+meaning+'，查看装配对照');b.title=meaning;
  });
 }
 window.renderPhysicalConnectionReview=()=>{
  const a=sourceAudit(),isMain=active(a);navigation(a,isMain);panel.hidden=!(isMain&&a.selected==='legother');
  if(isMain){txt('totalScope','CAD已建模条目 · 原／新实物完整BOM待核');txt('revisionNote','原CAD已画219项 → 当前MAIN已画356项；数量反映模型表达，实际整机BOM与紧固件净增仍待原实物清点。双方均不计待选电池包。');}
  if(isMain&&a.selected==='pin'){txt('perPosition','原CAD12件 → MAIN12件；相对原方案净变化0');txt('scopeCount','每腿保留原销轴、垫圈及轴向螺钉各1件；四腿原CAD12件 → 当前MAIN12件。本处相对原方案净变化0；旧keeper减4只在历史R4台账中保留。');}
  if(!isMain||a.selected!=='legother')return;
  q('#detail').dataset.localRevision='MAIN_MODEL_VS_PHYSICAL_REVIEW';
  txt('detailCategory','CAD已画件对照 · 原实物紧固件数量待核');txt('detailTitle','5  腿部小件：模型差额+137，实物净增待核');
  txt('detailLead','当前MAIN沿用这组接口小件数量。原CAD部分紧固件未画齐，实拍背面又有遮挡；结合PDF拆件图，现阶段能确认原结构也使用紧固件，尚不能报实际净增0或137。');
  txt('detailDeltaScope','相对原CAD的模型已画件差额');txt('detailDelta','+137 项（模型）');txt('perPosition','原CAD159 → MAIN296；实物净新增待核');
  txt('scopeCount','本组原CAD159项 → 当前MAIN296项；同组结构件64项和电机12台数量相抵，其余连接由83项变为220项。结构件数量相同，7007端部和7009销座等几何已改型。模型差额137，实际新增数量单独核对。');
  txt('partsHeading','模型表示与实物数量分开核对');q('#partsList').innerHTML='<div class="part-row"><span>原CAD已画其余连接</span><strong>83项</strong></div><div class="part-row"><span>当前接口螺钉144＋其余连接76</span><strong>220项</strong></div><div class="part-row"><span>其中已证实为既有连接补画（不重复累计）</span><strong>16项</strong></div><div class="part-row total"><span>CAD模型已画净差</span><strong>+137项</strong></div><div class="part-row total"><span>实物净新增</span><strong>待核</strong></div>';
  txt('interpretation','原CAD已画差额与实际采购装配增量分开核对。PDF拆件图可见原有紧固小件；用户实拍能支持原紧凑直连路线，背面与接合面遮挡使数量无法数清。');
  txt('reuseText','继续沿用原连接架构适配PA35，按输出端、壳体、外板及止挡逐组核实固定功能和实际标准件数量。');
  txt('targetText','已确认上销固定12→12、净变化0；腿部小件实物增量待原装配BOM或拆解清点后再给。现阶段保留必要连接，并逐项减少额外连接层。');
  q('#evidenceLink').href=data.evidence;txt('evidenceLink','查看原实拍、PDF与模型计数核对依据 ↗');
  txt('legBreakdownTitle','本组144颗接口螺钉的安装位置；实物净增待核');
  txt('legAuditSummary','原CAD模型159项＝结构64＋电机12＋其余连接83；当前MAIN同组296项＝结构64＋电机12＋其余连接76＋接口螺钉144。137＝144＋(76−83)，这里统计CAD已画件，实际新增紧固件另核。');
  txt('legCreditIntro','历史R4归类台账为原CAD83项 → 76项，八类净差−7；当前MAIN保留同组数量。此归类用于模型核销，实际装配逐接口确认。');
  if(a.optimization?.comparison!=='current_proposal')txt('legComparisonMeaning','下图保留原CAD与历史R4的接口展开图；当前MAIN沿用相同的接口螺钉数量，最新支架和端部形状以MAIN整机图及对应部位前后对比为准。');
 };
 window.compareAudit=()=>{
  const a=sourceAudit();return {...a,sourceRegions:a.regions,mainComparison:{scope:'ORIGINAL_CAD_TO_CURRENT_MAIN_MODELED_PARTS',active:active(a),revision:window.DESIGN_MAIN_STATE?.revision,original:219,current:data.mainCount,modeledDelta:data.modelDelta,physicalDelta:null,partitionVerified:partition.length>0,regions:partition,pin:{before:data.pinBefore,after:data.pinAfter,delta:0},supplementalModeledItemsConfirmed:data.confirmedSupplementalModelItems,evidence:data.evidence},physicalConnectionReview:{visible:!panel.hidden,physicalDelta:null,sourcePhotos:data.photos?.length||0,modelDelta:data.modelDelta,pinDelta:0}};
 };
 window.renderPhysicalConnectionReview();
})();
