(() => {
 'use strict';
 const q=s=>document.querySelector(s),data=window.SLEEVE_DIRECT_REVIEW,section=q('#sleeveDirectReview');
 if(!section||typeof window.compareAudit!=='function')return;
 const previousAudit=window.compareAudit,txt=(id,t)=>{const e=q('#'+id);if(e)e.textContent=t;};
 // Older proposal links now resolve to the adopted geometry; only an explicit before link shows history.
 let view=new URLSearchParams(location.search).get('sleeveview')==='before'?'before':'main';
 const currentCount=Number(data?.currentCount),baselineCount=Number(data?.baselineCount??data?.previousCount??364);
 const valid=!!data&&data.adopted===true&&currentCount===356&&baselineCount===364&&data.groups?.m1&&data.groups?.m3;
 const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const limitsText=value=>Array.isArray(value)?value.join('；'):value||'';
 function state(){const a=previousAudit();return {a,id:a.selected,active:valid&&a.mode==='r4'&&a.wholeMain?.mode!=='r4'&&['m1','m3'].includes(a.selected)};}
 window.renderSleeveDirectReview=()=>{
  const st=state();section.hidden=!st.active;if(!st.active)return;const g=data.groups[st.id],isM1=st.id==='m1',before=view==='before',label=isM1?'M1':'M3';
  txt('sleeveDirectReviewTitle',isM1?'M1：夹座和可拆抱箍直接适配，独立衬套已取消':'M3：短定位段并入7007端部，独立短衬套已取消');
  txt('sleeveReviewCount',`已合并 · 每腿少1件 · 四腿少${g.reductionFourLegs||4}件`);txt('sleeveReviewDescription',g.description||'');
  txt('sleeveBeforeCaption',g.beforeCaption);
  txt('sleeveAfterCaption',g.afterCaption);
  q('#sleeveBeforeImage').src=g.before;q('#sleeveAfterImage').src=g.after;q('#sleeveBeforeImage').alt=label+'修改前364件版本的独立衬套及配对件真实CAD';q('#sleeveAfterImage').alt=label+'当前MAIN356件版本，取消独立衬套并修改原件的真实CAD';
  txt('sleeveReviewChanges',limitsText(g.changes));txt('sleeveReviewLimits',limitsText(g.limits));
  txt('sleeveReviewTotal','本次M1四只＋M3四只合计少8件：364→356。已合入完整MAIN，12台电机、连接螺钉和原销固定保留。');
  q('#sleeveReviewFiles').innerHTML=(g.files||[]).map(f=>typeof f==='string'?`<a href="${esc(f)}">查看改型文件 ↗</a>`:`<a href="${esc(f.href||f.file||'')}">${esc(f.label||f.name||'查看改型文件')} ↗</a>`).join('');
  document.querySelectorAll('[data-sleeve-view]').forEach(b=>{const yes=b.dataset.sleeveView===view;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});
  q('#detail').dataset.localRevision=before?'D1_PREVIOUS_WITH_SLEEVE':'D1_MAIN_DIRECT_GRIPS';
  txt('detailCategory',before?'修改前 · 364件版本 · 已由当前MAIN替换':'MAIN D1 · 原件直接适配已合并');
  txt('detailTitle',(isM1?'1  M1夹持适配':'3  M3端部定位')+(before?'：修改前的独立衬套':'：取消独立衬套'));
  txt('detailLead',isM1?'固定半座和可拆半夹同时修改内壁，恢复原方案直接夹持电机的路线；开合结构与原夹紧螺钉保留。':'把短定位段做进7007原端部；每腿从两件改为一件，必要电机螺钉保留。这段短定位环的抗滑承载尚待核算。');
  txt('localCurrentTag',before?'修改前 · 364件版本':'当前MAIN · 356件');txt('afterCaption',before?(isM1?'修改前：夹座＋独立M1衬套':'修改前：7007端部＋独立短衬套'):(isM1?'当前MAIN：夹座／可拆抱箍直接夹持PA35':'当前MAIN：7007端部一体定位段'));
  q('#localAfter').src=before?g.before:g.after;q('#localAfter').alt=label+(before?'修改前独立衬套真实CAD':'当前MAIN取消独立衬套的真实CAD');
  q('#afterFlow').innerHTML=isM1?(before?'修改前：固定夹座／可拆抱箍 → <strong>独立M1衬套</strong> → PA35。<br>此图保留用于前后对照；当前MAIN已取消该衬套。':'修改后的固定夹座 ⇄ <strong>可拆抱箍直接夹持PA35</strong>。<br>独立衬套取消；原开合结构与夹紧螺钉保留。'):(before?'修改前：7007原端部 → <strong>独立短定位衬套</strong> → PA35。<br>此图保留用于前后对照；当前MAIN已取消该衬套。':'7007原端部 → <strong>一体辅助定位段</strong> → PA35。<br>独立短衬套取消；前3／后4定子螺钉及输出6颗螺钉保留。');
  txt('detailDeltaScope','本次相对364件版本（四腿）');txt('detailDelta','−4 件');txt('perPosition','每腿少1只独立衬套，四腿少4只');
  txt('scopeCount','本组独立衬套4→0；不增加替代零件或紧固件。M1与M3各少4件，完整MAIN合计364→356。原CAD已画件数量仍作为历史基准单独核对。');
  txt('partsHeading',isM1?'M1本次实际修改与减件':'M3本次实际修改与减件');
  q('#partsList').innerHTML='<div class="part-row"><span>独立衬套（四腿）</span><strong>4→0（−4）</strong></div><div class="part-row"><span>'+(isM1?'2个共享7001＋4个可拆7002':'4件7007原端部')+'重做适配内形</span><strong>原件改型</strong></div><div class="part-row"><span>新增紧固件</span><strong>0件</strong></div><div class="part-row total"><span>本组已合并</span><strong>−4件</strong></div>';
  txt('interpretation','尺寸适配内形已并入原结构件，取消M1四只和M3四只独立衬套。完整MAIN由364变为356件；D1杯体、12台PA35与原销固定继续保留。');
  txt('reuseText',isM1?'沿用原固定座＋可拆抱箍思路，两半同时直接适配PA35。主孔φ46.30、夹持长7.68 mm；开合与夹紧螺钉保留。':'沿用原7007端部直接适配路线，把内径46.5 mm、长2.69 mm的辅助定位段内置，跟随当前D1接口位置。');
  txt('targetText',limitsText(g.limits));
  const evidence=(g.files||[]).find(f=>typeof f!=='string'&&/依据|证据|清单|evidence/i.test(f.label||f.name||f.href||''));q('#evidenceLink').href=evidence?(evidence.href||evidence.file):(g.evidence||'sleeve_direct_review/review-data.json');txt('evidenceLink','查看已合并改型依据 ↗');
 };
 document.querySelectorAll('[data-sleeve-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.sleeveView==='before'?'before':'main';const p=new URLSearchParams(location.search);p.set('sleeveview',view);history.replaceState(null,'',location.pathname+'?'+p+location.hash);window.compareSelect(previousAudit().selected);window.renderSleeveDirectReview();}));
 document.querySelectorAll('[data-sleeve-zoom]').forEach(b=>b.addEventListener('click',()=>{const img=q(b.dataset.sleeveZoom==='before'?'#sleeveBeforeImage':'#sleeveAfterImage');if(!img?.getAttribute('src'))return;q('#zoomImage').src=img.getAttribute('src');txt('zoomTitle',img.alt);q('#zoomDialog').showModal();}));
 window.sleeveDirectSelectView=key=>{view=key==='before'?'before':'main';window.renderSleeveDirectReview();};
 window.sleeveDirectAudit=()=>{const st=state();return {validated:valid,visible:st.active,region:st.id,view,baselineCount,currentCount,targetCount:356,reduction:8,adopted:valid,formalCADModified:valid,mainCountChanged:valid};};
 window.compareAudit=()=>({...previousAudit(),sleeveDirect:window.sleeveDirectAudit()});window.renderSleeveDirectReview();
})();
