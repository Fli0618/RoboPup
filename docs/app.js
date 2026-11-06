(() => {
  'use strict';
  const q=s=>document.querySelector(s),text=(id,s)=>q('#'+id).textContent=s;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sign=n=>n===null?'待选':n>0?'+'+n:n<0?'−'+Math.abs(n):'0';
  const ps=window.COMPARE_PAGE_STATE,ca=window.COMPARE_ASSETS_R4;
  const hasDesignMain=window.DESIGN_MAIN_STATE?.id==='D1'&&window.DESIGN_MAIN_STATE?.status==='OFFICIAL_DESIGN_MAIN'&&window.DESIGN_MAIN_STATE?.adoptedByUser===true;
  if(!(ps?.status==='SYNCED_CURRENT_MODEL'&&ps.currentRevision==='R4'&&ps.modelSHA===ca?.source?.modelSHA&&ca?.source?.currentRevision==='R4'&&ps.counts?.originalScoped===219&&ps.counts?.currentScoped===396&&ps.counts?.delta===177)){
    const msg='对比页与当前模型尚未同步。请先更新版本数据、图片与统计，再使用本页评审。';
    const p=document.createElement('p');p.className='sync-warning';p.setAttribute('role','alert');p.textContent=msg;q('main').prepend(p);
    text('pageEyebrow','当前模型同步状态待核对');text('pageIntro',msg);text('freshnessBadge','需要更新 · 当前版本未验证');q('#freshnessBadge').classList.add('invalid');
    ['originalCount','currentCount','totalDelta'].forEach(id=>text(id,'—'));text('revisionNote','本页未将历史R2或旧R4标记为当前有效结果。');
    document.querySelectorAll('.whole-section,.region-list,.detail,.reconciliation,.context').forEach(el=>el.hidden=true);document.querySelectorAll('[data-mode]').forEach(el=>el.disabled=true);
    text('footerStatus','当前模型校验未通过；本页暂停展示对比，保留文件供维护。');window.compareAudit=()=>({status:'COMPARISON_REQUIRES_UPDATE',mode:null,currentRevision:null,modelSHA:ps?.modelSHA||null,CADModified:false});window.compareSelect=()=>false;return;
  }
  const r2=window.COMPARE_R2_REGIONS.map(r=>({...r,parts:r.parts.map(p=>[...p])})),r4=r2.map(r=>({...r,parts:r.parts.map(p=>[...p])}));
  const row=id=>r4.find(r=>r.id===id);
  const legAudit=window.LEGOTHER_AUDIT,legImages=window.LEGOTHER_ASSETS;
  const legValid=legAudit?.status==='LEGOTHER_137_COMPONENT_AUDIT_PASS'&&legAudit.modelSHA===ps.modelSHA&&legImages?.source?.modelSHA===ps.modelSHA&&legAudit.reconciliation?.delta===137;
  const legPlan=window.LEGOTHER_SIMPLIFICATION;
  const legPlanValid=legPlan?.status==='SCREEN_NOT_VALIDATED'&&legPlan.modelSHA===ps.modelSHA&&legPlan.phase1target===44&&legPlan.confirmedReduction===0&&Array.isArray(legPlan.rows)&&legPlan.rows.length===6;
  const legOptimization=window.LEGOTHER_OPTIMIZATION,legCandidate=window.LEGOTHER_CANDIDATE;
  const optimizationValid=legOptimization?.status==='FUNCTIONAL_SCREEN_WITH_COMPONENT_COMPARISONS'&&legOptimization.modelSHA===ps.modelSHA&&legOptimization.connectionTotal===220&&legOptimization.retainAndCheck===192&&legOptimization.m3ResearchPool===28&&legOptimization.confirmedReduction===0&&legOptimization.populations?.length===6&&legOptimization.populations.reduce((n,r)=>n+r.count,0)===220;
  const candidateValid=optimizationValid&&legCandidate?.status==='GEOMETRY_PREVIEW_NOT_RELEASED'&&legCandidate.modelSHA===ps.modelSHA&&legCandidate.formalCADModified===false&&legCandidate.images?.before&&legCandidate.images?.after&&legCandidate.verifiedFormalReduction===0;
  const architecture=window.ORIGINAL_ARCHITECTURE_CANDIDATE;
  const architectureValid=architecture?.status==='WHOLE_ROBOT_GEOMETRY_PREVIEW_NOT_RELEASED'&&architecture.modelSHA===ps.modelSHA&&architecture.formalCADModified===false&&architecture.currentCount===396&&[40,44].includes(architecture.reduction)&&architecture.candidateCount===396-architecture.reduction&&architecture.formalReduction===0&&architecture.parts?.whole&&architecture.parts?.carrier&&architecture.parts?.m1;
  const three=window.THREE_VERSION_COMPARISON;
  const threeValid=!!architectureValid&&three?.status==='THREE_VERSION_MODEL_COMPARISON_READY'&&three.modelSHA===ps.modelSHA&&three.candidateSHA===architecture.assemblySHA&&three.totals?.baseline===219&&three.totals?.r4===396&&three.totals?.c1===352&&three.formalCADModified===false&&three.candidateAdopted===false&&Array.isArray(three.regions)&&['baseline','r4','c1'].every(k=>three.regions.reduce((n,r)=>n+r[k],0)===three.totals[k]);
  const legGroupIds=['m1','m2','m3','plate','stop'];
  if(legValid)Object.assign(row('legother'),{title:'腿部小件：144颗接口螺钉，加上其余连接净差−7',category:'五个安装位置 · 逐项模型计数闭合',per:'每腿36颗；四腿144颗，其余连接净差−7',lead:'之前的局部图只展示了大腿端，遗漏M1、M2等安装位置。这里把完整代表腿拆成5处：当前接口螺钉144颗，再加其余连接小件83→76的净差−7，合计模型差额137。',parts:[['当前四腿显式接口螺钉',144],...legAudit.credits.map(c=>[`${c.name}：原${c.before} → 当前${c.after}`,c.delta])],interpretation:'137是两个区域模型总数296−159的净差。144颗当前接口螺钉分布在5个安装位置；其余连接的8类变化合计−7。不能将这144颗全部认定为实物新增，也不能把−7理解为7颗可直接取消的螺钉。',reuse:'沿用原直接连接思路，逐组核对实际承载路径、螺纹与工具通道。先区分原CAD补画、接口适配和重复固定，再按每件修改前后图决定是否减少。',target:'本次展开已有模型和逐项台账，未修改正式CAD。外板原有5孔只画1颗、当前画5颗，是明确的补画案例；四腿增加16项模型表达。',evidence:'legother_audit/legother-audit.json'});
  row('pin').interpretation='这是−4的净变化，已在当前整机+177中扣除。销本体仍保留，不能只把新keeper再计成额外+4。';
  Object.assign(row('bodyadapter'),{name:'梁端直连',title:'机架：已恢复原梁端直连，取消R2新增转接层',delta:0,type:'resolved',category:'R4已恢复原连接架构 · 四根完整纵梁',per:'相对原CAD 0件；相对R2取消56件',lead:'历史R4已恢复原96 mm外宽、192 mm完整纵梁跨度，端板直接连接纵梁。R2为参考电池增加的8个偏置转接件和48件关联硬件，已经从当前模型移除。',beforeCaption:'原端板与完整纵梁直接连接',afterCaption:'R4恢复端板—完整纵梁架构',beforeFlow:'原端板 ⇄ <strong>完整纵梁</strong> ⇄ 原端板。<br>没有独立梁端偏置转接层。',afterFlow:'R4端板 ⇄ <strong>完整纵梁</strong> ⇄ R4端板。<br>恢复原连接路线，不再叠加R2转接层。',parts:[['相对原CAD新增的梁端转接层',0]],interpretation:'相对R2，取消8转接件＋16螺钉＋16垫圈＋16槽螺母＝56件新连接层。56是R2→R4的变化，不再叠加到原CAD→R4的+177中。沿用原紧固件仍是待核参考，未获采购或制造确认。',reuse:'已经按原架子的梁端直连思路替换。保留原宽度与纵梁跨度，腿部及12台实际尺寸PA35的几何和位置沿用。',target:'已并入R4。无需为了旧参考电池再横向加宽；有效螺纹、制造公差与紧固规格继续随制造审核确认。',evidence:ps.currentReview});
  Object.assign(row('bodyother'),{title:'横梁和支撑：原架子已恢复，对原模型数量相同',delta:0,type:'resolved',category:'R4已恢复原件与位置 · 模型口径闭合',per:'原39 → 当前39；模型差额为0',lead:'当前恢复原横梁、四个支撑块及原有连接参考。这里与梁端转接层分开计数，原CAD和历史R4在此都计39件。',beforeCaption:'原横梁、支撑块与已画紧固参考',afterCaption:'R4恢复原横梁、支撑块及对应参考',beforeFlow:'原横梁＋原支撑块 → 原直接连接关系。<br>同一机械模型范围计39件。',afterFlow:'恢复原横梁＋原支撑块 → <strong>原连接关系</strong>。<br>当前同范围仍为39件。',parts:[['其余机身结构及连接：原39 → 当前39',0]],interpretation:'R2这里的+31主要是连接硬件展开方式不同。恢复原模型表示后，模型少了31项；不能直接宣称为实物减少31件。原紧固参考不等于完整制造BOM。',reuse:'已恢复原横梁—纵梁、支撑块的直接定位与锁紧关系。后续按真实孔系核实紧固件，避免为了保留旧孔叠加转接副。',target:'该区相对原CAD无模型增件；最终标准件规格与数量随制造审核收口。',evidence:ps.currentReview});
  Object.assign(row('battery'),{title:'电池：先定原架子，再按腹部空间选择电池',delta:null,type:'pending',category:'待选电池与固定方案 · 不计入本次数量',per:'电池与待设计固定件均不计数',lead:'按你的要求，机架保持原方案窄身结构。实际电池尚未选定，后续按腹部空间选择；110×68×60 mm只用于空间参考，未进入整机STEP或BOM。',beforeCaption:'原架子与原电池安装关系参考',afterCaption:'腹部空间与透明参考包（非BOM）',beforeFlow:'原方案由机架承托完整电池包。<br>原电池在本次整机数量中同样排除，避免把未选电池算成减件。',afterFlow:'<strong>原机架 → 适配实际电池 → 必要快拆固定</strong>。<br>透明110×68×60 mm包仅用于选型空间示意。',parts:[],interpretation:'待选不等于0件。当前双方均排除电池；不能将原1件电池对当前空仓算成−1，也不能把R2的21项附件直接当成最终实物减件。整机图不显示透明包，局部图专门标识选型空间。',reuse:'沿用原机架承托和快拆思路。收到实际电池尺寸、接插件与出线方向后，再确定必要承托、防滑、限位与快拆固定。',target:'电池选型与固定件尚未完成，历史R4是评审模型，尚未制造放行。空间参考不代表可直接采购的电池上限。',evidence:ps.currentReview});
  const c2={m1:[0,4,'附加M1衬套'],ab:[8,44,'主支架、7004挡块及A/B接缝'],m3:[0,4,'附加M3衬套'],pin:[12,8,'上连杆销本体及固定件'],legother:[159,296,'其余腿部对应项，含12台电机'],bodyadapter:[0,56,'独立梁端转接层及连接副'],bodyother:[39,70,'其余机身结构及连接'],battery:[1,22,'电池整体及外附件']};
  const c4=Object.fromEntries(Object.entries(c2).map(([id,c])=>[id,id==='battery'?[null,null,'待选电池及固定件排除']:[ps.regionCounts[id].before,ps.regionCounts[id].after,c[2]]]));
  const params=new URLSearchParams(location.search),state={mode:params.get('version')==='r2'?'r2':'r4',view:params.get('view')==='side'?'side':'iso',selected:r2.some(r=>r.id===params.get('region'))?params.get('region'):'ab',legGroup:legGroupIds.includes(params.get('leggroup'))?params.get('leggroup'):'m1',legComparison:params.get('legcompare')==='proposal'?'current_proposal':'original_current',all:false,assetErrors:[]};
  let regions,byId,counts,assets;
  let candidateView='parts';
  let architecturePart=['whole','carrier','m1','m3'].includes(params.get('architecture'))?params.get('architecture'):'whole';
  let architectureVariant='pair';
  const isCurrent=()=>state.mode==='r4',name=()=>isCurrent()?'历史 R4':'历史 R2';
  const source=side=>assets.views[state.view][side],local=(side,id)=>{const v=assets.details[id][side];return typeof v==='string'?v:v.image;};
  const positions={m1:[.17,.15],ab:[.39,.105],m3:[.13,.40],pin:[.15,.68],legother:[.47,.86],bodyadapter:[.77,.16],bodyother:[.86,.43],battery:[.82,.72]};
  function updateURL(){const p=new URLSearchParams(location.search);p.set('version',state.mode);p.set('region',state.selected);p.set('view',state.view);if(isCurrent()&&state.selected==='legother'){p.set('leggroup',state.legGroup);if(state.legComparison==='current_proposal')p.set('legcompare','proposal');else p.delete('legcompare');}else{p.delete('leggroup');p.delete('legcompare');}try{history.replaceState(null,'',location.pathname+'?'+p+location.hash);}catch(_){}}
  function renderLegGroup(id){
    if(!legValid||!legGroupIds.includes(id))return false;state.legGroup=id;
    const g=legAudit.groups.find(g=>g.id===id),im=legImages.groups[id];
    text('legGroupTitle',`${legGroupIds.indexOf(id)+1}  ${g.name}`);q('#legGroupCount').innerHTML=`每腿 <strong>${g.perLeg}</strong> 颗 × 4腿 ＝ <strong>${g.currentTotal}</strong> 颗`;
    text('legGroupNote',`当前数量：${g.subgroups.map(s=>s.name+s.perLeg+'颗').join('＋')}。这是当前模型已画的螺钉数；与原部位对照，不等于本组全部为实物新增。`);
    renderLegComparison();
    document.querySelectorAll('[data-leg-group]').forEach(b=>{const yes=b.dataset.legGroup===id;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});renderLegOverviewMarkers();updateURL();window.renderPhysicalConnectionReview?.();return true;
  }
  function renderLegComparison(){
    const id=state.legGroup,g=legAudit.groups.find(g=>g.id===id),im=legImages.groups[id],decision=optimizationValid?legOptimization.groups[id]:null,proposal=optimizationValid&&state.legComparison==='current_proposal',hasCandidate=proposal&&id==='m3'&&candidateValid;
    const showOriginalM2=id==='m2'&&isCurrent();q('#originalM2Connection').hidden=!showOriginalM2;
    const originalM2Images={originalM2Diagram:window.ORIGINAL_M2_DIAGRAM_DATA_URL||null,originalM2Drawing7017:'resources/pa35_single_leg_v2/analysis/1584-7017_source_drawing.png',originalM2Drawing7003:'resources/pa35_single_leg_v2/analysis/1584-7003_source_drawing.png'};
    for(const [key,src] of Object.entries(originalM2Images)){if(showOriginalM2&&src)q('#'+key).src=src;else q('#'+key).removeAttribute('src');}
    q('#legComparisonControls').hidden=!optimizationValid;q('#legComponentDecision').hidden=!optimizationValid;
    q('#legCandidateViews').hidden=!hasCandidate;
    q('#legCandidateUnavailable').hidden=true;q('#legGroupAfter').closest('button').hidden=false;
    q('#legCandidateCounts').hidden=true;q('#legCandidateChecks').hidden=true;q('#legCandidateDownloads').hidden=true;
    text('legGroupBeforeTag',proposal?'修改前 · R4':'原方案');text('legGroupAfterTag',proposal?(hasCandidate?'候选 · 未采用':'本轮方案'):'历史 R4');
    text('legGroupBeforeCaption',proposal?(hasCandidate&&candidateView==='parts'?'B载板＋7007两件分离 · 历史R4':'当前已用模型 · 修改前'):'原CAD部位参照；数量见逐项台账');
    if(!proposal&&id==='m2')text('legGroupBeforeCaption','原M2安装螺钉未画齐；下方说明实际连接路线');
    text('legGroupAfterCaption',proposal?(hasCandidate?(candidateView==='parts'?'B载板＋7007一体候选 · 两件变一件':'前3颗取消、后4颗保留的接口候选'):id==='m3'?'等待真实候选模型':'本轮保留原样 · 减0'):`${g.name} · 当前${g.perLeg}颗／腿`);
    const sources=proposal?(hasCandidate?(candidateView==='interface'?legCandidate.interfaceImages:legCandidate.images):{before:im.after,after:id==='m3'?null:im.after}):im;
    for(const side of ['before','after']){const img=q(side==='before'?'#legGroupBefore':'#legGroupAfter');if(sources[side])img.src=sources[side];else{img.removeAttribute('src');img.closest('button').hidden=true;q('#legCandidateUnavailable').hidden=false;}img.alt=`${g.name}：`+(proposal?(side==='before'?'历史R4修改前真实CAD':hasCandidate?'独立候选真实CAD，未采用':'本轮保留当前几何，减0'):(side==='before'?'原CAD安装位置与已画件':'历史R4真实CAD分解，'+g.perLeg+'颗／腿'));}
    if(decision){
      text('legDecisionTitle',decision.title);text('legDecisionResult',id==='m3'&&!candidateValid?'M3固定路线待建模 · 已确认减0':decision.result);
      text('legDecisionReason',decision.reason);text('legDecisionAffected','配对件与受影响接口：'+decision.affected);
      text('legComparisonMeaning',proposal?(id==='m3'?(hasCandidate?'下图为历史R4与真实独立候选，同视角、同尺度；尚未并入整机。':'下图只显示修改前；候选几何尚未就绪，不能把原CAD图冒充优化后图。'):'两张图一致，因为本轮保留此组连接；这是“保持原样、减0”的方案，不是已做出减件。'):'下图是原CAD到历史R4已发生的适配变化；不是本轮精简后的模型。');
    }
    if(hasCandidate){
      text('legCandidateViewNote',candidateView==='parts'?'完整加工件，不裁切：橙色为当前B载板，蓝色为当前7007；绿色为一体候选。相同相机与比例，桥接处和扩大通口均来自实际CAD。':'电机接口局部：半透明为实际PA35，红色为拟取消的前3颗，紫色为保留后4颗。仅为观察裁去Y<−39的下段，完整件保留在STEP及“完整加工件前后”图中。');
      document.querySelectorAll('[data-candidate-view]').forEach(b=>{const active=b.dataset.candidateView===candidateView;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
      q('#legCandidateCounts').hidden=false;q('#legCandidateCounts').innerHTML=legCandidate.countCards.map(c=>`<div><small>${esc(c.label)}</small><strong>${esc(c.value)}</strong><span>${esc(c.note)}</span></div>`).join('');
      q('#legCandidateChecks').hidden=false;text('legCandidateChecks',legCandidate.checkSummary);
      q('#legCandidateDownloads').hidden=false;q('#legCandidateDownloads').innerHTML=legCandidate.downloads.map(d=>`<a href="${esc(d.href)}">${esc(d.label)} ↗</a>`).join('');
    }
    document.querySelectorAll('[data-leg-comparison]').forEach(b=>{const active=(proposal?'current_proposal':'original_current')===b.dataset.legComparison;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  }
  function inspectOptimizationGroup(group){
    if(!optimizationValid||!isCurrent()||state.selected!=='legother')return false;
    if(group==='other'){text('optimizationFocusNote','其余76项没有被排除在评审外：下方“剩下的−7”和逐项依据列出原83→当前76的实例核销；目前无批量减件结论。');q('#legCreditRows').scrollIntoView({behavior:'instant',block:'start'});return true;}
    if(!legGroupIds.includes(group))return false;state.legComparison='current_proposal';renderLegGroup(group);text('optimizationFocusNote','已在本页切到该部件的“历史R4 → 精简提案”；下方同时列出配对件和减件状态。');q('#legComponentReview').scrollIntoView({behavior:'instant',block:'start'});return true;
  }
  function renderLegOptimization(){
    q('#legOptimization').hidden=!optimizationValid;if(!optimizationValid)return;
    q('#optimizationPopulations').innerHTML=legOptimization.populations.map(r=>`<button data-optimization-group="${esc(r.group)}" class="${r.id==='m3mount'?'research':''}"><span>${esc(r.name)}</span><strong>${r.count}</strong><small>${esc(r.decision)} · 点看部件</small></button>`).join('');
    q('#optimizationRows').innerHTML=legOptimization.populations.map(r=>`<tr${r.id==='m3mount'?' class="conditional-row"':''}><th>${esc(r.name)}</th><td>${r.count}</td><td>${esc(r.decision)}</td><td>${esc(r.reason)}</td></tr>`).join('');
    document.querySelectorAll('[data-optimization-group]').forEach(b=>b.addEventListener('click',()=>inspectOptimizationGroup(b.dataset.optimizationGroup)));
  }
  function renderArchitecture(){
    const shown=isCurrent()&&architectureValid;
    q('#originalArchitectureCandidate').hidden=!shown;
    q('#goOriginalArchitecture').hidden=!shown;
    q('#reviewNavigation').hidden=!shown;q('#pendingReviewShortcut').hidden=!shown;
    renderThreeVersion();
    if(!shown){['architectureBefore','architectureAfter','architectureToolImage'].forEach(id=>q('#'+id).removeAttribute('src'));q('#architectureToolFigure').hidden=true;return false;}
    if(!architecture.parts[architecturePart])architecturePart='whole';
    text('architectureCandidateCount',architecture.candidateCount);text('architectureTargetNote',`候选模型少${architecture.reduction}项，均在137之外`);text('architectureReductionTitle',`${architecture.reduction}项具体减少在哪里`);text('architectureReductionTotal',`${architecture.reduction}项`);
    q('[data-architecture-part="m3"]').hidden=!architecture.parts.m3;q('#architectureM3Reduction').hidden=!architecture.parts.m3;
    const part=architecture.parts[architecturePart],variants=part.variants||{};
    if(!variants[architectureVariant])architectureVariant='pair';
    const p=variants[architectureVariant]||part;
    q('#architectureVariants').hidden=Object.keys(variants).length===0;
    q('#architectureVariants').innerHTML=Object.entries(variants).map(([id,v])=>`<button data-architecture-variant="${esc(id)}" aria-pressed="${id===architectureVariant}" class="${id===architectureVariant?'active':''}">${esc(v.label)}</button>`).join('');
    document.querySelectorAll('[data-architecture-variant]').forEach(b=>b.addEventListener('click',()=>{architectureVariant=b.dataset.architectureVariant;renderArchitecture();}));
    text('architecturePartTitle',p.title);text('architecturePartNote',p.note);
    text('architectureBeforeCaption',p.beforeCaption);text('architectureAfterCaption',p.afterCaption);
    for(const side of ['before','after']){const img=q(side==='before'?'#architectureBefore':'#architectureAfter');img.src=p.images[side];img.alt=p.title+' · '+(side==='before'?'历史R4修改前真实CAD':'独立C1候选修改后真实CAD')+'，同相机同尺度';}
    text('architectureLimit',architecture.limit);
    if(!hasDesignMain){text('pageIntro','原CAD基准219项、历史R4396项、C1当前候选352项。C1仍需继续按原架构适配PA35，优化到接近基准数量；当前352项不是最终目标。等你看过三者对比再决定。');text('totalScope','三版统一模型计数 · 均不含电池包');
    document.title='四足整机 · 原CAD／R4／C1三者对比';}
    q('.architecture-pair').hidden=threeValid&&architecturePart==='whole';q('.architecture-selected').hidden=threeValid&&architecturePart==='whole';
    if(architecture.reduction===44){text('legSimplificationTitle','历史C1曾实现44项候选精简；当前采用MAIN D1');q('#legSimplification .leg-plan-tag').textContent='11月4日历史评估 · C1未采用';text('legPlanTargetNote','历史C1从R4396减44项；当前MAIN另计356项');}
    const toolShown=architecturePart==='carrier'&&!!architecture.toolImage;q('#architectureToolFigure').hidden=!toolShown;if(toolShown)q('#architectureToolImage').src=architecture.toolImage;else q('#architectureToolImage').removeAttribute('src');
    q('#architectureDownloads').innerHTML=architecture.downloads.map(d=>`<a href="${esc(d.href)}">${esc(d.label)} ↗</a>`).join('');
    q('#architectureSourceEvidence').href=architecture.sourceEvidence;
    document.querySelectorAll('[data-architecture-part]').forEach(b=>{const active=b.dataset.architecturePart===architecturePart;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    window.renderDesignMain?.();return true;
  }
  function renderThreeVersion(){
    const shown=isCurrent()&&threeValid;
    q('#threeVersionComparison').hidden=!shown;q('#threeVersionUnavailable').hidden=!isCurrent()||threeValid;
    q('#summaryCandidateVersion').hidden=!shown;q('#summaryCandidateArrow').hidden=!shown;text('summaryCurrentLabel',isCurrent()?'历史R4':'R2历史');
    if(!shown){['threeBaselineImage','threeR4Image','threeC1Image'].forEach(id=>q('#'+id).removeAttribute('src'));return;}
    text('summaryCandidateCount',three.totals.c1);text('threeVersionScope',three.scope);
    const images={baseline:'threeBaselineImage',r4:'threeR4Image',c1:'threeC1Image'};
    for(const [key,id] of Object.entries(images))q('#'+id).src=three.images[key];
    q('#threeRegionRows').innerHTML=three.regions.map(r=>`<tr class="${r.c1-r.baseline>0?'remaining-gap':''}"><th><button data-three-region="${esc(r.id)}">${esc(r.name)}</button></th><td>${r.baseline}</td><td>${r.r4}</td><td>${r.c1}</td><td>${sign(r.c1-r.baseline)}</td><td>${sign(r.c1-r.r4)}</td></tr>`).join('');
    document.querySelectorAll('[data-three-region]').forEach(b=>b.addEventListener('click',()=>inspectThreeRegion(b.dataset.threeRegion)));window.renderDesignMain?.();
  }
  function inspectThreeRegion(id){
    const changed={m1:'m1',ab:'carrier',m3:'m3'};
    if(changed[id]){architecturePart=changed[id];architectureVariant='pair';renderArchitecture();q('.architecture-selected').scrollIntoView({behavior:'instant',block:'start'});return;}
    if(id==='head'){architecturePart='whole';renderArchitecture();q('#threeVersionGallery').scrollIntoView({behavior:'instant',block:'start'});return;}
    if(byId[id])select(id,true);
  }
  function renderLegOverviewMarkers(){
    const positions={m1:[.14,.15],m2:[.82,.15],m3:[.83,.40],plate:[.83,.69],stop:[.14,.71]},NS='http://www.w3.org/2000/svg';
    document.querySelectorAll('.leg-overview-stage').forEach(stage=>{const side=stage.dataset.legSide,svg=stage.querySelector('svg'),hotspots=stage.querySelector('.leg-overview-hotspots');svg.innerHTML='';hotspots.innerHTML='';
      legGroupIds.forEach((id,i)=>{const anchor=legImages.overview.anchors?.[side]?.[id];if(!anchor)return;const pos=positions[id],selected=id===state.legGroup,g=legAudit.groups.find(g=>g.id===id),line=document.createElementNS(NS,'line');line.setAttribute('x1',anchor[0]*1600);line.setAttribute('y1',anchor[1]*1200);line.setAttribute('x2',pos[0]*1600);line.setAttribute('y2',pos[1]*1200);line.setAttribute('class',selected?'selected':'');svg.appendChild(line);const dot=document.createElementNS(NS,'circle');dot.setAttribute('cx',anchor[0]*1600);dot.setAttribute('cy',anchor[1]*1200);dot.setAttribute('r',selected?9:6);svg.appendChild(dot);const b=document.createElement('button');b.className='leg-position-button'+(selected?' active':'');b.style.left=pos[0]*100+'%';b.style.top=pos[1]*100+'%';b.dataset.legPosition=id;b.setAttribute('aria-label',`${side==='before'?'原方案':'历史R4'}位置${i+1}，${g.name}，查看每腿${g.perLeg}颗螺钉`);b.setAttribute('aria-pressed',String(selected));b.textContent=i+1;b.addEventListener('click',()=>renderLegGroup(id));hotspots.appendChild(b);});
    });
  }
  function renderLegBreakdown(){
    const shown=isCurrent()&&state.selected==='legother';q('#legBreakdown').hidden=!shown||!legValid;q('#legBreakdownUnavailable').hidden=!shown||!!legValid;q('.detail > .local-grid').hidden=shown;
    if(!shown){document.querySelectorAll('#legBreakdown img').forEach(img=>img.removeAttribute('src'));return;}
    if(!legValid)return;
    renderLegSimplification();
    renderLegOptimization();
    const rec=legAudit.reconciliation;
    text('legAuditSummary',`原${rec.original}件＝结构${rec.unchangedStructure}＋电机${rec.unchangedMotors}＋其余连接${rec.originalOtherConnections}；当前${rec.current}件＝相同结构${rec.unchangedStructure}＋电机${rec.unchangedMotors}＋其余连接${rec.currentOtherConnections}＋接口螺钉${rec.currentInterfaceScrews}。结构和电机数量抵消后，就是144＋(76−83)＝137。`);
    for(const side of ['before','after'])q(side==='before'?'#legOverviewBefore':'#legOverviewAfter').src=legImages.overview[side];
    if(legImages.hardwareTray)q('#legHardwareTray').src=legImages.hardwareTray;
    q('#legGroupButtons').innerHTML=legAudit.groups.map((g,i)=>`<button class="leg-group-button" data-leg-group="${esc(g.id)}" aria-pressed="false"><span class="num">${i+1}</span><span class="group-name">${esc(g.name)}</span><span class="group-count">${g.perLeg}／腿 · 四腿${g.currentTotal}</span></button>`).join('');
    document.querySelectorAll('[data-leg-group]').forEach(b=>b.addEventListener('click',()=>renderLegGroup(b.dataset.legGroup)));
    q('#legInterfaceRows').innerHTML=legAudit.groups.flatMap(g=>g.subgroups).map(s=>`<tr><td>${esc(s.name)}</td><td>${s.perLeg}</td><td>${s.currentTotal}</td></tr>`).join('');
    q('#legPerLegRows').innerHTML=legAudit.perLeg.map(r=>`<tr><td>${esc(r.name)} ${r.corner}</td><td>${r.original}</td><td>${r.current}</td><td>${sign(r.delta)}</td></tr>`).join('');
    text('legCreditIntro',`其余连接小件合计原${rec.originalOtherConnections}件 → 当前${rec.currentOtherConnections}件。下面8类一增一减合计−7，不能当成7颗同类螺钉被删除。`);
    q('#legCreditRows').innerHTML=legAudit.credits.map(c=>`<div class="leg-credit-row"><span>${esc(c.name)}<br><small>原 ${c.before} → 当前 ${c.after}</small></span><strong>${sign(c.delta)}</strong></div>`).join('');
    text('legCreditNote','以上是模型类别的核销，不据名称推断连接功能已取消。原CAD漏画、左右腿不一致和规格替换，均需逐接口核实后才能定实际BOM。');
    q('#legSourceDetails').innerHTML=`<ul>${legAudit.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul>`+legAudit.credits.map(c=>`<p><b>${esc(c.name)}：${c.before} → ${c.after}，净${sign(c.delta)}</b><br>原CAD实例：${c.originalIDs.length?c.originalIDs.join('、'):'该类无原实例'}<br>当前实例：${c.currentLabels.length?c.currentLabels.map(esc).join('、'):'该类无当前实例'}${c.note?'<br>'+esc(c.note):''}</p>`).join('');
    renderLegGroup(state.legGroup);
  }
  function renderLegSimplification(){
    q('#legSimplification').hidden=!legPlanValid;
    if(!legPlanValid)return;
    text('legPlanCurrent',ps.counts.currentScoped);text('legPlanTarget',ps.counts.currentScoped-legPlan.phase1target);
    q('#legSimplification').dataset.planStatus=legPlan.status;
    text('legPlanScope',legPlan.phase1Scope+' 同一模型口径不含电池包；本轮已证实可直接删除的数量为0。');
    q('#legPlanRows').innerHTML=legPlan.rows.map(r=>`<tr${r.id==='m3mount'?' class="conditional-row"':''}><th>${esc(r.name)}</th><td>${r.id==='m3mount'?'12＋16':r.count}${r.id==='other'?'项':'颗'}</td><td>${esc(r.decision)}</td><td>${esc(r.reason)}</td></tr>`).join('');
  }
  function renderHotspots(){document.querySelectorAll('.image-stage').forEach(stage=>{
    const side=stage.dataset.side;stage.querySelector('img').src=source(side);stage.querySelector('img').alt=side==='before'?(isCurrent()?'原CAD严格60%基准机械装配，排除电池':'原CAD严格60%基准，历史含参考电池'):name()+'完整四足狗真实CAD装配';
    const svg=stage.querySelector('.leaders'),layer=stage.querySelector('.hotspots');svg.innerHTML='';layer.innerHTML='';
    regions.forEach(r=>{const p=assets.views[state.view].anchors[side][r.id],a=Array.isArray(p)?p:[p.x,p.y],pos=positions[r.id],selected=!state.all&&state.selected===r.id,NS='http://www.w3.org/2000/svg';
      const line=document.createElementNS(NS,'line');line.setAttribute('x1',a[0]*1600);line.setAttribute('y1',a[1]*1200);line.setAttribute('x2',pos[0]*1600);line.setAttribute('y2',pos[1]*1200);if(selected)line.setAttribute('class','selected');line.style.opacity=state.all?'.48':selected?'.95':'.16';svg.appendChild(line);
      const dot=document.createElementNS(NS,'circle');dot.setAttribute('cx',a[0]*1600);dot.setAttribute('cy',a[1]*1200);dot.setAttribute('r',selected?'8':'5');dot.style.opacity=state.all||selected?'.85':'.23';svg.appendChild(dot);
      const b=document.createElement('button');b.className='hotspot '+r.type+(selected?' selected':'');b.style.left=pos[0]*100+'%';b.style.top=pos[1]*100+'%';b.dataset.region=r.id;b.setAttribute('aria-label',`${side==='before'?'原方案':name()}，${r.num} ${r.name}，${r.delta===null?'待选，不计数':'整机变化'+sign(r.delta)+'件'}，查看装配变化`);b.setAttribute('aria-pressed',String(selected));b.innerHTML=`${r.num}<span class="tip">${esc(r.name)} · ${sign(r.delta)}</span>`;b.addEventListener('click',()=>select(r.id,true));layer.appendChild(b);
    });
  });window.renderWholeMain?.();window.renderPhysicalConnectionReview?.();}
  function select(id,scroll=false){if(!byId[id])return false;state.selected=id;state.all=false;const r=byId[id];
    text('wholeHint',`当前定位：${r.num} ${r.name}，两图同步标出对应部位。点击编号展开装配变化。`);document.querySelectorAll('.region-button').forEach(b=>{const yes=b.dataset.region===id;b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes));});
    text('detailCategory',r.category);text('detailTitle',r.num+'  '+r.title);text('detailLead',r.lead);text('detailDelta',sign(r.delta)+(r.delta===null?'':' 件'));text('perPosition',r.per);text('regionPosition',r.num+' / '+regions.length);const c=counts[id];
    text('scopeCount',r.delta===null?'该区不计数：电池未选型，固定件待设计。透明参考包不在STEP或BOM中。':`该区统计范围：${c[2]} ｜ 原 ${c[0]} 件 → ${name()} ${c[1]} 件。图示代表部位，数量为整机汇总。`);q('.delta-box').className='delta-box '+r.type;
    ['before','after'].forEach(side=>{text(side+'Caption',r[side+'Caption']);q('#'+side+'Flow').innerHTML=r[side+'Flow'];const img=q(side==='before'?'#localBefore':'#localAfter');if(isCurrent()&&id==='legother')img.removeAttribute('src');else img.src=local(side,id);img.alt=`${r.name}：${side==='before'?'原方案':name()}真实CAD局部装配图${r.delta===null?'，透明包为非BOM参考':''}`;});renderLegBreakdown();renderArchitecture();
    text('partsHeading',r.delta===null?'这一区域如何计数':r.type==='resolved'?'当前这一区域已恢复什么':'这些件是怎么多出来的');q('#partsList').innerHTML=r.parts.map(([s,n])=>`<div class="part-row"><span>${esc(s)}</span><strong>${sign(n)}</strong></div>`).join('')+`<div class="part-row total"><span>${r.delta===null?'电池与固定件状态':'本处整机模型净变化'}</span><strong>${r.delta===null?'待选 · 不计数':sign(r.delta)}</strong></div>`;
    text('interpretation',r.interpretation);text('reuseText',r.reuse);text('targetText',r.target);q('#evidenceLink').href=r.evidence;renderHotspots();updateURL();window.renderABMainDetail?.();window.renderWholeMain?.();window.renderPinMainDetail?.();window.renderSleeveDirectReview?.();window.renderPhysicalConnectionReview?.();if(scroll)q('#detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});return true;
  }
  function renderMode(){regions=isCurrent()?r4:r2;byId=Object.fromEntries(regions.map(r=>[r.id,r]));counts=isCurrent()?c4:c2;assets=isCurrent()?ca:window.COMPARE_ASSETS;const before=isCurrent()?219:220,after=isCurrent()?396:505,total=isCurrent()?177:285;
    document.title=hasDesignMain?'四足设计MAIN · D1杯式连接':'四足整机 · '+name()+'与原方案对比';document.querySelectorAll('[data-mode]').forEach(b=>{const yes=b.dataset.mode===state.mode;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});
    if(!hasDesignMain){text('pageEyebrow',isCurrent()?'PA35 · 历史 R4 · 恢复原架子 · 2026.11.04':'PA35 · 历史 R2 · 原始对照留档');text('pageIntro',isCurrent()?'历史R4已恢复原架子；腿部沿用原评审几何。点击编号查看各部位，电池包待选、R4固定件待设计。':'这是历史R2对照，保留当时加宽机架、参考电池与外附件模型。当前采用版本为R4。');}else{text('pageEyebrow','PA35 · 设计主线已确定 · D1');text('pageIntro','D1杯式连接已正式采用为设计MAIN。现有真实几何完成右后腿局部，后续沿此主线推进四腿和整机合并。');}
    text('originalCount',before);text('currentCount',after);text('totalDelta','+'+total);text('totalScope',isCurrent()?'机械 CAD 数量 · 不含电池包':'历史机械 CAD 数量 · 含参考电池');text('freshnessBadge',isCurrent()?'历史 R4 · 模型 SHA '+ps.modelSHA.slice(0,12):'历史 R2 · 当前采用版本仍为 R4');q('#freshnessBadge').dataset.modelSha=ps.modelSHA;q('#freshnessBadge').classList.toggle('historical',!isCurrent());
    text('revisionNote',isCurrent()?'R4范围：两版均不计电池包。219 → 396；R4电池固定件待设计，未纳入当前数量。原CAD已有机身支撑和紧固件照常计入。':'历史R2范围：含原参考电池与R2外附件，220 → 505。+285是历史模型差额，不是历史R4的数量。');text('beforeTitle',isCurrent()?'原方案 · 60% 基准（电池除外）':'原方案 · 60% 基准（含参考电池）');text('afterVersion',isCurrent()?'历史 R4 评审模型':'历史 R2 评审模型');text('afterTitle',isCurrent()?'PA35 · 原架子已恢复':'PA35 · 历史加宽机架');text('beforeCount',before+' 件');text('afterCount',after+' 件');text('beforeLegend',isCurrent()?'原架子与连接关系；电池不计入':'原CAD结构；含原参考电池');text('afterLegend',isCurrent()?'原架子已恢复；腿部沿用；电池待选':'历史R2：加宽机架与参考电池外附件');text('localCurrentTag',name());
    text('ledgerTitle',total+' 件的来源在这里闭合');text('ledgerTotal','+'+total);text('ledgerScope',`原${before} → ${name()}${after}${isCurrent()?'（电池除外）':'（含参考电池）'}`);text('ledgerNote',isCurrent()?'原219 → 当前396，两版均不计电池包；R4固定件待设计。原CAD已有机身支撑和紧固件照常计入。“模型差额”不等于实际新增采购数量；原CAD未画全的小件另行核对。':'历史原220 → R2 505。+285含电池包外附件，不能当作历史R4实际新增采购数量。');
    text('footerScope','计数口径：完整电机模组各计1；端板、抱箍、挡块等分别计件；线束布局占位和单件附加曲面不另计。'+(isCurrent()?'R4两版均不计电池包；R4固定件待设计，未纳入当前数量。原CAD已有机身支撑和紧固件照常计入，不将未选电池算成减件。':'历史R2两侧均含参考电池；历史图片和计数依据保持留档。'));text('footerStatus',isCurrent()?'历史R4：原架子已恢复；腿部暂沿用R2几何；电池与固定件待设计，未制造放行。局部分层仅用于观察。后续每件修改继续先看前后图，再验证、并入。':'历史R2留档：局部说明中的“当前”指该历史R2模型。当前正式评审模型为R4；后续减件方案未因切换视图而自动并入。');
    q('#currentStepLink').href=ps.currentSTEP;q('#currentReviewLink').href=ps.currentReview;q('#footerReviewLink').href=ps.currentReview;q('#countLedgerLink').href=isCurrent()?'resources/pa35_whole_robot_R4_original_frame/whole_robot_manifest.json':'resources/assembly_delta_review/complete_mechanical_count.json';text('countLedgerLink',isCurrent()?'历史R4模型台账':'历史计数台账');q('#renderProof').href=assets.proof||assets.source.proof;text('historyLink',isCurrent()?'切换历史R2':'返回历史R4');q('#historyLink').href='?version='+(isCurrent()?'r2':'r4');
    q('#regionList').innerHTML=regions.map(r=>`<button class="region-button ${r.type}" data-region="${r.id}" aria-pressed="false"><span class="num">${r.num}</span><span class="name">${esc(r.name)}</span><span class="change">${sign(r.delta)}</span></button>`).join('');document.querySelectorAll('.region-button').forEach(b=>b.addEventListener('click',()=>select(b.dataset.region)));
    const nature=r=>r.type==='new'?'新增连接层':r.type==='reduction'?'替换减项':r.type==='resolved'?'已恢复原架构':r.type==='pending'?'待选，不计入合计':'模型差额／原固定清单待核';q('#ledgerBody').innerHTML=regions.map(r=>`<tr class="${r.type}"><td><a href="#detail" data-ledger="${r.id}">${r.num} ${esc(r.name)}</a></td><td>${sign(r.delta)}</td><td>${nature(r)}</td></tr>`).join('');document.querySelectorAll('[data-ledger]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();select(a.dataset.ledger,true);}));select(state.selected);window.renderDesignMain?.();window.renderABMainDetail?.();window.renderWholeMain?.();window.renderPinMainDetail?.();window.renderSleeveDirectReview?.();window.renderPhysicalConnectionReview?.();
  }
  function zoom(src,title){q('#zoomImage').src=src;text('zoomTitle',title);q('#zoomDialog').showModal();}
  function showPendingReview(){if(!architectureValid||!isCurrent())return;architecturePart='whole';architectureVariant='pair';renderArchitecture();const p=new URLSearchParams(location.search);p.set('architecture','whole');history.replaceState(null,'',location.pathname+'?'+p+'#originalArchitectureCandidate');q('#originalArchitectureCandidate').scrollIntoView({behavior:'instant',block:'start'});}
  ['goOriginalArchitecture','showPendingReview'].forEach(id=>q('#'+id).addEventListener('click',showPendingReview));
  q('#pendingReviewShortcut').addEventListener('click',()=>hasDesignMain?window.showDesignMain?.():showPendingReview());
  q('#showBaselineReview').addEventListener('click',()=>q('#baselineComparisonHeading').scrollIntoView({behavior:'instant',block:'start'}));
  document.querySelectorAll('[data-architecture-part]').forEach(b=>b.addEventListener('click',()=>{architecturePart=b.dataset.architecturePart;renderArchitecture();const p=new URLSearchParams(location.search);p.set('architecture',architecturePart);history.replaceState(null,'',location.pathname+'?'+p+location.hash);(architecturePart==='whole'&&threeValid?q('#threeVersionGallery'):q('.architecture-selected')).scrollIntoView({behavior:'instant',block:'start'});}));
  document.querySelectorAll('[data-three-zoom]').forEach(b=>b.addEventListener('click',()=>{if(threeValid)zoom(three.images[b.dataset.threeZoom],three.versions[b.dataset.threeZoom].name+' · 三版同视角同尺度');}));
  document.querySelectorAll('[data-architecture-zoom]').forEach(b=>b.addEventListener('click',()=>{const img=q(b.dataset.architectureZoom==='before'?'#architectureBefore':'#architectureAfter');if(img.getAttribute('src'))zoom(img.getAttribute('src'),img.alt);}));
  q('[data-architecture-tool-zoom]').addEventListener('click',()=>{const img=q('#architectureToolImage');if(img.getAttribute('src'))zoom(img.getAttribute('src'),img.alt);});
  document.querySelectorAll('[data-d1-zoom]').forEach(b=>b.addEventListener('click',()=>{const img=b.querySelector('img');zoom(img.getAttribute('src'),img.alt);}));
  document.querySelectorAll('[data-original-m2-zoom]').forEach(b=>b.addEventListener('click',()=>{const id={diagram:'originalM2Diagram',drawing7017:'originalM2Drawing7017',drawing7003:'originalM2Drawing7003'}[b.dataset.originalM2Zoom],img=q('#'+id);if(img.getAttribute('src'))zoom(img.getAttribute('src'),img.alt);}));
  document.querySelectorAll('[data-leg-comparison]').forEach(b=>b.addEventListener('click',()=>{state.legComparison=b.dataset.legComparison;renderLegComparison();updateURL();window.renderPhysicalConnectionReview?.();}));
  document.querySelectorAll('[data-candidate-view]').forEach(b=>b.addEventListener('click',()=>{candidateView=b.dataset.candidateView;renderLegComparison();}));
  document.querySelectorAll('[data-plan-region]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.planRegion,true)));
  q('#legPlanInspectM3').addEventListener('click',()=>{renderLegGroup('m3');q('#legGroupTitle').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
  document.querySelectorAll('[data-leg-zoom]').forEach(b=>b.addEventListener('click',()=>{const id={'overview-before':'legOverviewBefore','overview-after':'legOverviewAfter','group-before':'legGroupBefore','group-after':'legGroupAfter','hardware-tray':'legHardwareTray'}[b.dataset.legZoom],img=q('#'+id);if(img?.getAttribute('src'))zoom(img.getAttribute('src'),img.alt);}));
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;renderMode();}));document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(v=>{const yes=v===b;v.classList.toggle('active',yes);v.setAttribute('aria-pressed',String(yes));});renderHotspots();updateURL();}));
  q('#previousRegion').addEventListener('click',()=>select(regions[(byId[state.selected].num+regions.length-2)%regions.length].id));q('#nextRegion').addEventListener('click',()=>select(regions[byId[state.selected].num%regions.length].id));q('#clearSelection').addEventListener('click',()=>{state.all=true;document.querySelectorAll('.region-button').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});renderHotspots();text('wholeHint','全部8个位置已显示；点击任一编号可查看原来和现在的装配。');});
  document.querySelectorAll('[data-zoom]').forEach(b=>b.addEventListener('click',()=>zoom(q(b.dataset.zoom==='before'?'#wholeBefore':'#wholeAfter').getAttribute('src'),q(b.dataset.zoom==='before'?'#wholeBefore':'#wholeAfter').alt)));document.querySelectorAll('[data-local-zoom]').forEach(b=>b.addEventListener('click',()=>{const img=q(b.dataset.localZoom==='before'?'#localBefore':'#localAfter'),src=img?.getAttribute('src');if(src)zoom(src,img.alt);}));q('#zoomClose').addEventListener('click',()=>q('#zoomDialog').close());q('#zoomDialog').addEventListener('click',e=>{if(e.target===q('#zoomDialog'))q('#zoomDialog').close();});document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const s=img.getAttribute('src');if(!state.assetErrors.includes(s))state.assetErrors.push(s);}));
  window.compareAudit=()=>({status:ps.status,mode:state.mode,currentRevision:ps.currentRevision,displayedRevision:isCurrent()?'R4':'R2',modelSHA:ps.modelSHA,original:isCurrent()?219:220,current:isCurrent()?396:505,delta:isCurrent()?177:285,comparisonScope:isCurrent()?ps.comparisonScope:'历史R2含参考电池及外附件',excludedBattery:isCurrent(),regionSum:regions.reduce((a,r)=>a+(r.delta??0),0),regions:regions.map(r=>({id:r.id,before:counts[r.id][0],after:counts[r.id][1],delta:r.delta,partsSum:r.delta===null?null:r.parts.reduce((a,p)=>a+p[1],0),type:r.type,includedInCount:r.delta!==null})),view:state.view,selected:state.selected,all:state.all,hotspotCount:document.querySelectorAll('.hotspot').length,availableViews:Object.keys(assets.views),hasAssetManifest:true,assetErrors:[...state.assetErrors],images:[...document.images].filter(i=>i.getAttribute('src')).map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,width:i.naturalWidth,height:i.naturalHeight})),anchors:assets.views[state.view].anchors,legBreakdown:{visible:isCurrent()&&state.selected==='legother'&&!!legValid,validated:!!legValid,selectedGroup:state.legGroup,groupCount:legValid?legAudit.groups.length:0,reconciliation:legValid?legAudit.reconciliation:null,groups:legValid?legAudit.groups.map(g=>({id:g.id,name:g.name,perLeg:g.perLeg,currentTotal:g.currentTotal})):[],credits:legValid?legAudit.credits.map(c=>({id:c.id,before:c.before,after:c.after,delta:c.delta})):[]},CADModified:false});window.compareSelect=id=>select(id);window.compareLegSelect=id=>renderLegGroup(id);
  const baseCompareAudit=window.compareAudit;
  window.compareAudit=()=>({...baseCompareAudit(),simplification:{validated:legPlanValid,visible:isCurrent()&&state.selected==='legother'&&legValid&&legPlanValid,confirmedReduction:legPlanValid?legPlan.confirmedReduction:null,phase1target:legPlanValid?legPlan.phase1target:null,phase1WholeTarget:legPlanValid?ps.counts.currentScoped-legPlan.phase1target:null,m3Alternatives:legPlanValid?[12,16]:[]},optimization:{validated:optimizationValid,visible:isCurrent()&&state.selected==='legother'&&legValid&&optimizationValid,connectionTotal:optimizationValid?220:null,retainAndCheck:optimizationValid?192:null,m3ResearchPool:optimizationValid?28:null,canJustifyDeletingAll137:false,comparison:state.legComparison,candidateAvailable:!!candidateValid,formalCADModified:false,verifiedReduction:0}});
  window.compareOptimizationSelect=group=>inspectOptimizationGroup(group);
  const beforeArchitectureAudit=window.compareAudit;
  window.compareAudit=()=>({...beforeArchitectureAudit(),architecture:{validated:!!architectureValid,visible:isCurrent()&&!!architectureValid,placement:'canonical_overview',decision:'pending_user_review',part:architecturePart,variant:architectureVariant,candidateCount:architectureValid?architecture.candidateCount:null,reduction:architectureValid?architecture.reduction:null,formalReduction:0,motors:architectureValid?architecture.motors:null,assemblySHA:architectureValid?architecture.assemblySHA:null,manufacturingRelease:false,samePageOnly:true}});
  const beforeThreeAudit=window.compareAudit;
  window.compareAudit=()=>({...beforeThreeAudit(),threeVersion:{validated:threeValid,visible:isCurrent()&&threeValid,totals:threeValid?three.totals:null,regions:threeValid?three.regions.map(r=>({id:r.id,baseline:r.baseline,r4:r.r4,c1:r.c1})):[],remainingModelGap:threeValid?133:null,currentCandidateMeetsFinalObjective:false,goal:'adapt_original_CAD_architecture_to_PA35_and_approach_baseline_piece_count',candidateAdopted:false,formalCADModified:false}});
  renderMode();document.querySelectorAll('[data-view]').forEach(v=>{const yes=v.dataset.view===state.view;v.classList.toggle('active',yes);v.setAttribute('aria-pressed',String(yes));});
  if(!hasDesignMain&&architectureValid&&isCurrent()&&!params.has('architecture')&&(!location.hash||location.hash==='#detail'))window.addEventListener('load',showPendingReview,{once:true});
})();
