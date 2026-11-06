(() => {
  'use strict';
  const q=s=>document.querySelector(s), data=window.DESIGN_MAIN_STATE;
  const valid=data?.id==='D1'&&data?.status==='OFFICIAL_DESIGN_MAIN'&&data?.adoptedByUser===true;
  const hero=q('#designMain');
  if(!hero)return;
  const views={
    assembly:{src:'resources/main/views/connection-exploded.png',title:'D1正式MAIN：M2输出经一体杯体连接M3后壳',caption:'实际CAD显示分解，蓝：M2；灰：杯体；橙：M3。显示偏移用于观察，不代表已验证装配顺序。'},
    holes:{src:'resources/main/views/connection-hole-map.png',title:'D1正式MAIN两组孔：内圈6孔接M2输出，外圈4孔接M3后壳',caption:'内圈PCD Ø24、6孔；外圈PCD Ø38.5、4孔。两组孔都在杯底，杯口没有另一圈固定孔。'},
    part:{src:'resources/main/views/part_after.png',title:'D1正式MAIN一体内凹杯式支架',caption:'单一有效实体；杯内径47.2、外径52、嵌入深度20 mm。主方案已选定，制造与完整装配验证继续进行。'},
    direction:{src:'resources/main/views/cup-orientation.png',title:'D1杯口朝向机身外侧M3，与原7003同向',caption:'RR局部：机身中面Z=0，向腿外侧为+Z；原7003杯口和D1杯口均朝+Z/M3。杯底与杯口位置见实际剖面图。'}
  };
  const params=new URLSearchParams(location.search);
  let currentView=Object.hasOwn(views,params.get('mainview'))?params.get('mainview'):'assembly';
  const text=(id,value)=>{const el=q('#'+id);if(el)el.textContent=value;};
  const setHash=id=>{try{history.replaceState(null,'',location.pathname+location.search+'#'+id);}catch(_){}};
  function selectView(key){
    if(!Object.hasOwn(views,key))return false;
    currentView=key;const view=views[key];q('#mainDesignImage').src=view.src;q('#mainDesignImage').alt=view.title;
    text('mainDesignImageCaption',view.caption);
    document.querySelectorAll('[data-main-view]').forEach(b=>{const yes=b.dataset.mainView===key;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});
    return true;
  }
  window.showDesignMain=()=>{hero.scrollIntoView({behavior:'instant',block:'start'});setHash('designMain');};
  window.showDesignMainDetails=()=>{
    if(window.compareAudit?.().mode!=='r4')q('[data-mode="r4"]')?.click();
    window.compareSelect?.('legother');window.compareLegSelect?.('stop');
    q('#recessedCupConcept').scrollIntoView({behavior:'instant',block:'start'});setHash('recessedCupConcept');
  };
  window.renderDesignMain=()=>{
    hero.hidden=false;hero.dataset.status=valid?data.status:'DESIGN_MAIN_STATE_REQUIRES_SYNC';
    if(!valid){text('designMainBadge','主线数据待同步');hero.classList.add('design-main-invalid');return;}
    hero.classList.remove('design-main-invalid');text('designMainBadge','MAIN · D1正式采用');
    text('pageMainTitle','设计MAIN · D1杯式连接');text('pageEyebrow','PA35 · 设计主线已确定 · D1');
    text('pageIntro','D1杯式连接与M1/M3直接适配已合并到完整四足MAIN。原销轴固定保留，运动、锁紧及承载验证继续进行。');
    document.title='四足设计MAIN · D1杯式连接';
    text('designMainScope',data.wholeRobotIntegrated?'四腿D1杯式连接已合并，M1/M3原件直接适配继续沿用原拆装路线；以完整STEP和改型清单为准。':'整机合并状态待核对。');
    q('#mainDesignPartLink').href=data.selectedLocalStep;q('#mainDesignAssemblyLink').href=data.selectedAssemblyStep;
    text('currentStepLink','完整整机导出基线 R4 STEP ↗');text('currentReviewLink','R4完整导出基线说明 ↗');
    const historical=window.compareAudit?.().mode==='r2';
    text('totalScope',historical?'历史R2模型计数参考 · D1为设计MAIN':'历史R4模型计数参考 · 默认MAIN另列');
    text('summaryCurrentLabel',historical?'R2历史':'R4完整导出');
    text('afterVersion',historical?'历史R2完整导出':'R4完整导出基线');
    text('afterLegend',historical?'历史R2：加宽机架与参考电池外附件':'R4完整导出基线 · 尚未合并D1');
    text('freshnessBadge',historical?'历史R2 · 当前设计MAIN为D1':'R4完整导出基线 · 设计MAIN为D1');
    text('baselineComparisonHeading','来源台账：原CAD → R4完整导出基线');
    const r4Button=q('[data-mode="r4"]');if(r4Button)r4Button.textContent='MAIN / 历史R4';
    text('footerStatus','设计MAIN已合并四腿D1杯式及原件直接适配。当前所选历史版本只作比较；完整运动、锁紧、工具和承载继续核对，未制造放行。');
    text('pendingReviewShortcut','回到MAIN · D1 ↑');q('#pendingReviewShortcut').hidden=false;window.renderWholeMain?.();
  };
  document.querySelectorAll('[data-main-view]').forEach(b=>b.addEventListener('click',()=>selectView(b.dataset.mainView)));
  document.querySelectorAll('[data-main-action]').forEach(b=>b.addEventListener('click',()=>{
    if(b.dataset.mainAction==='home')window.showDesignMain();
    else if(b.dataset.mainAction==='details')window.showDesignMainDetails();
    else {if(window.compareAudit?.().mode!=='r4')q('[data-mode="r4"]')?.click();q('#showPendingReview')?.click();}
  }));
  q('#mainDesignZoom').addEventListener('click',()=>{q('#zoomImage').src=q('#mainDesignImage').getAttribute('src');text('zoomTitle',q('#mainDesignImage').alt);q('#zoomDialog').showModal();});
  const audit=()=>({id:'D1',status:valid?data.status:'DESIGN_MAIN_STATE_REQUIRES_SYNC',adoptedByUser:valid,scope:data.wholeRobotIntegrated?'whole_robot_D1':'RR_M2_M3_local_connection',wholeRobotIntegrated:data?.wholeRobotIntegrated===true,manufacturingRelease:data?.manufacturingRelease===true,view:currentView,selectedLocalStep:data?.selectedLocalStep||null,selectedAssemblyStep:data?.selectedAssemblyStep||null,remainingSeatGapMM:data?.remainingSeatGapMM??0.1,visible:!hero.hidden});
  window.designMainAudit=audit;window.designMainSelectView=selectView;
  if(typeof window.compareAudit==='function'){const beforeMain=window.compareAudit;window.compareAudit=()=>({...beforeMain(),designMain:audit()});}
  selectView(currentView);window.renderDesignMain();
})();
