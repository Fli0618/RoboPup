(() => {
  'use strict';
  const q=s=>document.querySelector(s), data=window.DESIGN_MAIN_STATE;
  const adopted=data?.id==='D1'&&data.status==='OFFICIAL_DESIGN_MAIN'&&data.adoptedByUser===true;
  const switcher=q('#abDesignSwitch');
  if(!switcher||typeof window.compareAudit!=='function')return;
  const baseAudit=window.compareAudit;
  let mode=new URLSearchParams(location.search).get('abdesign')==='r4'?'r4':'main';
  const text=(id,value)=>{const el=q('#'+id);if(el)el.textContent=value;};
  function rememberMode(){
    const p=new URLSearchParams(location.search);p.set('abdesign',mode);
    try{history.replaceState(null,'',location.pathname+'?'+p+location.hash);}catch(_){}
  }
  function detailsAudit(){
    const state=baseAudit(),active=adopted&&state.mode==='r4'&&state.selected==='ab';
    return {active,region:state.selected,mode:active?mode:state.mode==='r2'?'r2':'baseline',displayedRevision:active&&mode==='main'?'D1':state.mode==='r2'?'R2':'R4',afterImage:q('#localAfter')?.getAttribute('src')||null,beforeImage:q('#localBefore')?.getAttribute('src')||null,localReductionVsR4:active&&mode==='main'?9:null,extraReductionVsC1:active&&mode==='main'?0:null,wholeRobotIntegrated:data.wholeRobotIntegrated===true};
  }
  window.renderABMainDetail=()=>{
    const state=baseAudit(),active=adopted&&state.mode==='r4'&&state.selected==='ab';
    switcher.hidden=!active;
    text('detailDeltaScope',state.mode==='r2'?'历史整机模型变化':'R4完整导出基线模型变化');
    text('localCurrentTag',state.mode==='r2'?'历史R2':'R4完整导出基线');
    text('evidenceLink','查看本处建模依据 ↗');
    q('#detail').dataset.localRevision=state.mode==='r2'?'R2':'R4';
    if(adopted&&state.mode==='r4'){
      const ab=q('.region-button[data-region="ab"]');
      if(ab){ab.querySelector('.name').textContent='主支架 · D1已采用';ab.querySelector('.change').textContent='MAIN';}
    }
    if(!active)return;
    rememberMode();
    document.querySelectorAll('[data-ab-design]').forEach(b=>{const yes=b.dataset.abDesign===mode;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});
    if(mode==='r4'){
      text('detailCategory','历史R4完整导出 · A/B分体连接');
      text('detailTitle','2  历史R4：A盘＋B板＋接缝硬件');
      text('detailLead','这里查看的是保留的R4历史几何：A、B分别连接电机，再用接缝螺钉合拢。它是D1采用前的对比基线，当前设计MAIN已改用D1一体杯式连接。');
      text('localCurrentTag','历史R4 · 非MAIN');
      text('detailDeltaScope','原CAD → 历史R4整机差额');
      text('abDesignMeaning','历史R4：本区原8 → R4 44，差36项；用于说明旧A/B接缝来源，不代表当前D1的整机计数。');
      text('partsHeading','历史R4：这些件曾如何增加');
      return;
    }
    q('#detail').dataset.localRevision='D1';
    text('detailCategory','MAIN · D1正式采用 · M2—M3一体杯式连接');
    text('detailTitle','2  MAIN D1杯式连接');
    text('detailLead','本处正式设计已采用D1：取消A/B分体接缝，改为一个杯式支架直接连接M2输出端与M3后壳。下图是右后腿代表部位的真实CAD；同一连接路线已合并到四腿整机。');
    text('detailDeltaScope','本处相对R4（单腿连接层）');text('detailDelta','−9 件／腿');
    text('perPosition','四腿整机已合并；相对C1不重复减件');q('.delta-box').className='delta-box main-local';
    text('scopeCount','D1图示范围：一体杯体＋两台实际PA35＋M2输出6颗及M3后端4颗螺钉，不含7004挡块。减件范围仅指A/B连接层：2结构＋4接缝螺钉＋4垫圈，10→1，少9件。四条腿均已按各自接口合并；这里以RR代表腿显示。');
    text('localCurrentTag','MAIN · D1正式方案');
    text('afterCaption','一体杯体连接M2输出与M3后壳（图不含7004）');
    const image=q('#localAfter');image.src='resources/main/views/connection-exploded.png';image.alt='MAIN D1右后腿局部真实CAD：一体杯体＋M2及M3电机＋两组固定螺钉，无A/B接缝';
    q('#afterFlow').innerHTML='M2输出 → <strong>一个D1杯体</strong> → M3后壳（定子）。<br>内圈6孔接M2输出；外圈4孔接M3后壳。杯口向机身外侧／M3，图为RR局部；7004挡块未在此图展示。';
    text('abDesignMeaning','默认显示正式MAIN D1；右侧已取消A/B接缝。旧R4图只在“历史R4 A/B”中查看，上方默认全机图为当前MAIN；历史R4通过独立开关查看。');
    text('partsHeading','D1在本连接层如何减件（单腿）');
    q('#partsList').innerHTML='<div class="part-row"><span>A/B两件支架改为一个杯体</span><strong>2→1（−1）</strong></div><div class="part-row"><span>取消A/B接缝螺钉</span><strong>4→0（−4）</strong></div><div class="part-row"><span>取消A/B接缝垫圈</span><strong>4→0（−4）</strong></div><div class="part-row total"><span>以上连接层小计</span><strong>10→1（−9）</strong></div><div class="part-row"><span>M2输出6颗＋M3后端4颗必要螺钉</span><strong>10→10</strong></div>';
    text('interpretation','D1取消的是分体A/B和其接缝，M2输出与M3后端的必要固定螺钉保留。该一体连接减件已与C1的统计重合，对C1额外减0；不能再从352里扣36。原CAD219、R4396、C1352是各自完整模型的比较记录，当前MAIN为356件；本次M1/M3各减少4件。');
    text('reuseText','已正式沿用原7003一体连接思路，以PA35真实接口重建：内圈6孔连接M2输出，外圈4孔连接M3后壳。杯壁与M3留间隙，未作为已验证夹紧或过盈定位面。');
    text('targetText','D1已经采用为MAIN，不再待选。后续在主线上修正M3螺钉0.10 mm座面间隙，继续核对连杆与止挡、工具装拆及承载/制造验证。');
    q('#evidenceLink').href='resources/main/main-design.json';text('evidenceLink','查看MAIN正式采用与模型记录 ↗');
    text('wholeHint','主支架已定位：上方整机与下方部位详情默认显示正式MAIN D1；可单独查看历史R4。');
  };
  document.querySelectorAll('[data-ab-design]').forEach(b=>b.addEventListener('click',()=>{
    mode=b.dataset.abDesign==='r4'?'r4':'main';rememberMode();window.compareSelect('ab');
  }));
  window.selectABDesign=key=>{mode=key==='r4'?'r4':'main';rememberMode();window.compareSelect('ab');return detailsAudit();};
  window.abMainDetailAudit=detailsAudit;
  window.compareAudit=()=>({...baseAudit(),localDetail:detailsAudit()});
  window.renderABMainDetail();
})();
