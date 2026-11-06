(() => {
 'use strict';
 const q=s=>document.querySelector(s),d=window.MAIN_WHOLE_D1;if(!d)return;
 let mode=new URLSearchParams(location.search).get('wholedesign')==='r4'?'r4':'main';
 const text=(id,t)=>{const e=q('#'+id);if(e)e.textContent=t;};
 const count=Number(d.count),direct=window.DESIGN_MAIN_STATE?.directSleevesIntegrated===true||window.DESIGN_MAIN_STATE?.revision==='D1_MAIN_DIRECT_GRIPS_004';
 const countLabel=count+'件';
 window.renderWholeMain=()=>{
  const a=window.compareAudit?.();if(!a)return;const active=a.mode==='r4'&&mode==='main',view=d.views[a.view];
  q('#wholeDesignSwitch').hidden=a.mode!=='r4';document.querySelectorAll('[data-whole-design]').forEach(b=>{b.classList.toggle('active',b.dataset.wholeDesign===mode);b.setAttribute('aria-pressed',String(b.dataset.wholeDesign===mode));});
  if(!active){
   if(a.mode==='r4'&&mode==='r4'){
    text('afterVersion','历史 R4 · 完整导出基线');text('afterTitle','PA35 · 历史R4原架子');text('afterCount','396 件');text('afterLegend','历史R4：未合并D1及去衬套改型');
    text('freshnessBadge','正在查看历史R4整机396件；当前MAIN仍为'+count+'件');
    q('#currentStepLink').href=window.COMPARE_PAGE_STATE.currentSTEP;text('currentStepLink','历史R4完整四足 STEP ↗');
    q('#currentReviewLink').href=window.COMPARE_PAGE_STATE.currentReview;text('currentReviewLink','历史R4导出清单 ↗');
   }
   window.renderPhysicalConnectionReview?.();return;
  }
  q('#wholeAfter').src=view.image;q('#wholeAfter').alt=`MAIN D1完整四足真实STEP渲染，四条腿杯式连接${direct?'、M1/M3直接适配':''}已合并，${countLabel}`;
  text('afterVersion','MAIN · D1完整四足');text('afterTitle',direct?'PA35 · D1杯式＋原件直接适配':'PA35 · 四腿D1杯式连接已合并');text('afterCount',count+' 件');text('afterLegend','MAIN D1整机几何 · 运动、锁紧及承载待验证');text('currentCount',count);text('summaryCurrentLabel','MAIN D1整机');text('totalScope',`当前MAIN ${countLabel}；C1列保留历史比较`);text('totalDelta','+'+(count-219));
  text('baselineComparisonHeading','完整整机：原CAD → MAIN D1');text('freshnessBadge',`MAIN D1整机几何已合并 · ${countLabel}`);
  text('designMainScope',direct?'四腿D1杯式连接、M1夹座直接夹持、M3端部一体定位已合并到完整STEP；原销轴、垫圈和轴向螺钉固定保留。':'四条腿均已按各自孔位合并D1杯式连接，M3侧腿组各内移4 mm；完整STEP已导出。');
  text('designMainExportNote',direct?'MAIN完整整机：R4 396 → D1＋原销固定364 → 本次356；本次取消四只M1和四只M3独立衬套，不增加紧固件。':`MAIN D1完整整机：R4基线396 → D1 ${count}，取消四腿接缝36件、原销固定恢复4件。`);
  text('pageIntro',direct?'当前MAIN已把两类衬套的适配内形并入原夹座和大腿端部：364→356件，12台实际PA35保持原位。D1杯式连接与原销固定保留，继续核对锁紧、运动和承载。':`当前MAIN已完成四条腿D1杯式连接的整机几何合并，完整STEP为${countLabel}、12台实际PA35。`);
  const note=q('.design-main-export-note');if(note)note.textContent=direct?'MAIN完整整机：396→364→356。本次仅取消M1四只、M3四只独立衬套；下方真实部件前后图保留364件版本作对照。原CAD、R4、C1三版图表为历史记录。':`MAIN D1完整整机已导出：396→${count}。原CAD、R4、C1三版计数与图像另作历史比较。`;
  q('#currentStepLink').href=d.wholeStep;text('currentStepLink','MAIN D1完整四足 STEP ↗');q('#currentReviewLink').href=d.manifest||d.wholeStep.replace(/[^/]+$/,'whole_robot_manifest.json');text('currentReviewLink','MAIN整机改型清单 ↗');
  text('countLedgerLink','历史R4模型台账');text('footerReviewLink','历史R4模型说明');text('revisionNote',`当前MAIN ${count}件；原CAD219与R4396的来源台账保留历史口径。双方均不计待选电池包及未定固定件。`);
  text('ledgerTitle',`历史R4差额台账（原219→R4396；非MAIN${count}计数）`);text('ledgerScope',`历史R4差额+177；MAIN D1实际${count}`);text('footerStatus','MAIN D1四腿整机几何已合并。M1预紧与抗滑、M3定位公差、0.10mm座面、销接合、完整运动、工具及承载仍未放行。');
  text('wholeHint','选中编号查看实际部位；M1、M3可在原位查看本次364→356的部件前后图。');
  if(direct)for(const id of ['m1','m3']){const b=q('.region-button[data-region="'+id+'"]');if(b){const change=b.querySelector('.change');if(change)change.textContent='已并入';b.title=(id==='m1'?'M1夹座':'M3端部')+'直接适配，本次四腿少4件';}}
  const ids=a.regions.map(r=>r.id),lines=q('.image-stage[data-side="after"] .leaders').querySelectorAll('line'),dots=q('.image-stage[data-side="after"] .leaders').querySelectorAll('circle');ids.forEach((id,i)=>{const p=view.anchors[id];if(!p)return;if(lines[i]){lines[i].setAttribute('x1',p[0]*1600);lines[i].setAttribute('y1',p[1]*1200);}if(dots[i]){dots[i].setAttribute('cx',p[0]*1600);dots[i].setAttribute('cy',p[1]*1200);}});
  if(a.localDetail?.displayedRevision==='D1'){text('detailLead',`D1杯式连接已合并到四条腿完整模型。本图展示RR相同连接路线；整机当前${countLabel}，本次M1/M3减件另在对应部位展示。`);text('perPosition','四腿几何已合并；对C1不重复减件');text('scopeCount','图示RR局部杯体及两台电机，不含7004。四腿均已取消A/B连接层，每腿10→1，共减少36件；M2输出和M3后端必要螺钉保留。');}
  window.renderPhysicalConnectionReview?.();
 };
 document.querySelectorAll('[data-whole-design]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.wholeDesign;const p=new URLSearchParams(location.search);p.set('wholedesign',mode);history.replaceState(null,'',location.pathname+'?'+p+location.hash);window.compareSelect(window.compareAudit().selected);window.renderDesignMain?.();window.renderWholeMain();window.renderPinMainDetail?.();window.renderSleeveDirectReview?.();window.renderPhysicalConnectionReview?.();}));
 const prior=window.compareAudit;window.compareAudit=()=>({...prior(),wholeMain:{mode,geometryIntegrated:true,count,assemblySHA:d.assemblySHA,manufacturingRelease:false,directSleevesIntegrated:direct}});window.renderWholeMain();
})();
