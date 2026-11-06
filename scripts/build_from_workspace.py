"""Build only the inspectable static review site; never publish or mutate CAD.

The source review works from a local output/ tree. The published copy puts its
cross-folder dependencies under resources/ and serves large approved downloads
from a GitHub release. Raw CAD intermediates and local machine paths stay out.
"""
from __future__ import annotations
import argparse, hashlib, html, json, re, shutil, os
from pathlib import Path
from urllib.parse import unquote, urlsplit

OUTPUT = Path(os.environ.get('ROBOPUP_SOURCE_OUTPUT', str(Path(__file__).resolve().parents[3]/'output'))).resolve()
SOURCE = OUTPUT/'whole_robot_click_compare'
DEFAULT_DEST = Path(__file__).resolve().parents[1]/'docs'
RELEASE = 'https://github.com/Fli0618/RoboPup/releases/download/design-main-2026-11-06/'
BIG_RELEASE = {
    'main/whole_robot_D1_direct_grips/PA35_MAIN_D1_WHOLE_ROBOT.step': RELEASE+'PA35_MAIN_D1_WHOLE_ROBOT.step',
    'isaac_lab_main_v1/PA35_MAIN_ISAAC_SIM_v1.zip': RELEASE+'PA35_MAIN_ISAAC_SIM_v1.zip',
}
TEXT = {'.html','.js','.css','.json','.md','.txt','.usda','.svg'}
MEDIA = {'.png','.jpg','.jpeg','.gif','.webp','.svg','.mp4','.woff','.woff2','.ico'}
DOCUMENT = {'.json','.md','.txt','.pdf','.usda','.usdc','.step','.stp','.zip'}
MAX_CAD = 20*1024*1024
MAX_FILE = 95*1024*1024
QUOTED = re.compile(r'''["']([^"'\r\n]{1,1800})["']''')
PARENT_URL = re.compile(r'''(?<![A-Za-z0-9_])(?:\.\./)+[A-Za-z0-9_%@.\-/\u4e00-\u9fff]+(?:\?[A-Za-z0-9_=&.%-]+)?''')
MACHINE_PATH = re.compile(r'''(?<![A-Za-z0-9_])[A-Za-z]:[/\\]+(?:[^"'<>\r\n]|\\["'])*''')

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def dumps(value): return json.dumps(value, ensure_ascii=False, indent=2)
def is_internal(path):
    try: path.resolve().relative_to(OUTPUT.resolve()); return True
    except ValueError: return False

def public_source_path(raw):
    # Exact origins remain attributable without exposing Windows account paths.
    value=raw.replace('\\\\','/').replace('\\','/')
    lower=value.lower(); marker='e:/rtx05mini/output/'
    if marker in lower:return 'source:/'+value[lower.index(marker)+len(marker):]
    marker='e:/rtx05mini/'
    if marker in lower:return 'source:/inputs/'+value[lower.index(marker)+len(marker):]
    if '/users/' in lower:
        tail=value[lower.index('/users/')+7:].split('/',1)
        return 'local-source:/'+(tail[1] if len(tail)>1 else 'user-directory')
    return 'local-source:/'+value.split('/',1)[-1]

def sanitize(text):
    # JSON backslashes are kept in the lexer; every disk-origin string is only
    # provenance, while actual UI dependencies are separately relative URLs.
    return MACHINE_PATH.sub(lambda m:public_source_path(m.group()),text)

def relative_ref(value):
    value=html.unescape(value.strip())
    if not value or value.startswith(('#','http:','https:','data:','mailto:','javascript:','source:','local-source:','blob:')):return None
    if '${' in value or re.match(r'^[A-Za-z]:',value):return None
    if '\\' in value or any(ch in value for ch in '<>\n{}'):return None
    pure=unquote(urlsplit(value).path)
    if not pure or Path(pure).suffix.lower() not in TEXT|MEDIA|DOCUMENT:return None
    return pure

def source_seed(path):
    rel=path.relative_to(SOURCE); parts=rel.parts
    if 'history' in parts:return False
    n=path.name.lower()
    if n.startswith(('browser-','browser_','maintenance-browser','local-assets-qa')) or 'browser-validation' in n:return False
    if path.suffix.lower()=='.js':return not ('qa' in path.stem.lower() or n=='diagnose.js')
    if path.suffix.lower()=='.html':return rel.as_posix()=='index.html'
    return path.suffix.lower() in MEDIA|{'.css','.json'}

class Builder:
    def __init__(self,dest):
        self.dest=dest.resolve();self.files={};self.processed=set();self.external_refs={};self.stubbed=[];self.large_links=[];self.unresolved=[]
        self.text_content={}
        self.previous_owned=set()
        previous=self.dest/'publication-manifest.json'
        if previous.exists():
            old=json.loads(previous.read_text(encoding='utf-8-sig'))
            self.previous_owned={r['path'] for r in old.get('files',[])}
    def map_source(self,path):
        if path.is_relative_to(SOURCE):return path.relative_to(SOURCE).as_posix()
        return 'resources/'+path.relative_to(OUTPUT).as_posix()
    def queue(self,path):
        path=path.resolve()
        if not is_internal(path):return
        if not path.exists() or not path.is_file():return
        self.files.setdefault(self.map_source(path),path)
    def unavailable(self,key,reason):
        # A real destination explaining historical omission, never a fake STEP.
        self.stubbed.append({'source':key,'reason':reason})
        return 'archive-downloads.html?file='+key.replace(' ','%20')
    def external_url(self,raw):
        pure=unquote(urlsplit(raw).path)
        p=(SOURCE/pure).resolve()
        if not is_internal(p):return self.unavailable(pure,'Outside reviewed output workspace')
        key=p.relative_to(OUTPUT).as_posix()
        if key in BIG_RELEASE:
            self.large_links.append({'source':key,'url':BIG_RELEASE[key]});return BIG_RELEASE[key]
        suffix=p.suffix.lower()
        if suffix=='.html':
            return self.unavailable(key,'历史独立评审页未随本次网站发布；其主要图片与台账保留在本站历史记录中。')
        if p.exists() and p.is_file():
            if p.stat().st_size>MAX_FILE or (suffix in {'.step','.stp'} and p.stat().st_size>MAX_CAD and not key.startswith('main/')):
                return self.unavailable(key,'历史或大型CAD未随本次网站发布；正式MAIN整机见下载区。')
            self.queue(p);return self.map_source(p)
        self.unresolved.append({'source':key,'ref':raw,'reason':'Source file not found'})
        return self.unavailable(key,'源资料不在本次可发布文件集中。')
    def rewrite(self,text,source):
        if source==SOURCE/'main-whole-data.js':
            # Whole-main UI derives a manifest URL from wholeStep when absent.
            # A release download URL cannot be used for that derivation.
            prefix='window.MAIN_WHOLE_D1 = '
            data=json.loads(text[len(prefix):].strip().rstrip(';'))
            data['manifest']='../main/whole_robot_D1_direct_grips/whole_robot_manifest.json'
            text=prefix+json.dumps(data,ensure_ascii=False)+';\n'
        def replace_parent(m):
            raw=m.group()
            # Bare directory literals support dynamically assembled image paths.
            if raw.endswith('/'):
                p=(SOURCE/raw).resolve()
                if p.is_dir() and is_internal(p):
                    for f in p.iterdir():
                        if f.is_file() and f.suffix.lower() in MEDIA:self.queue(f)
                    return 'resources/'+p.relative_to(OUTPUT).as_posix()+'/'
                return raw
            return self.external_url(raw)
        text=PARENT_URL.sub(replace_parent,text)
        if source.suffix.lower()=='.usda':
            for asset in re.findall(r'@([^@]+)@',text):
                if not asset.startswith(('http:','https:')):
                    p=(source.parent/asset).resolve()
                    if p.exists():self.queue(p)
        # Pick up site-local download URLs and runtime dependency filenames.
        replacements={}
        for m in QUOTED.finditer(text):
            raw=m.group(1);ref=relative_ref(raw)
            if not ref or ref.startswith(('resources/','archive-downloads.html')):continue
            # Runtime data URLs are document-relative; most are stored in JS
            # subdirectories but resolved by the root index.html.
            p=(SOURCE/ref).resolve()
            if p.exists() and p.is_file() and is_internal(p):
                if p.suffix.lower() in {'.step','.stp'} and p.stat().st_size>MAX_CAD:
                    replacements[raw]=self.unavailable(p.relative_to(OUTPUT).as_posix(),'历史大型CAD未随本次网站发布。')
                else:self.queue(p)
            elif source.suffix.lower()=='.usda':
                p=(source.parent/ref).resolve()
                if p.exists():self.queue(p)
        for before,after in replacements.items():text=text.replace(before,after)
        return sanitize(text)
    def run(self):
        self.dest.mkdir(parents=True,exist_ok=True)
        for p in SOURCE.rglob('*'):
            if p.is_file() and source_seed(p):self.queue(p)
        while True:
            pending=[(dst,p) for dst,p in self.files.items() if dst not in self.processed]
            if not pending:break
            for dst,p in pending:
                self.processed.add(dst)
                if p.stat().st_size>MAX_FILE:raise RuntimeError(f'File too large for normal Git: {p}')
                out=self.dest/dst;out.parent.mkdir(parents=True,exist_ok=True)
                if p.suffix.lower() in TEXT:
                    text=self.rewrite(p.read_text(encoding='utf-8-sig'),p)
                    self.text_content[dst]=text;out.write_text(text,encoding='utf-8')
                else:shutil.copy2(p,out)
        archive='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>历史资料 · RoboPup</title><style>body{font-family:system-ui,sans-serif;max-width:760px;margin:12vh auto;padding:24px;line-height:1.9;color:#244958;background:#f4f8fa}main{background:white;padding:32px;border:1px solid #cfdee4;border-radius:16px}a{color:#287a65}code{overflow-wrap:anywhere}</style><main><p>RoboPup · 历史资料</p><h1>此历史文件未随网站发布</h1><p>本站保留了原CAD、R4、C1与当前MAIN的图片、计数及对照依据。为避免历史模型与当前方案混用，本链接对应的独立评审页或大型历史CAD没有随本次网站发布。</p><p>原资料标识：<code id="file"></code></p><p><a href="index.html?section=history">返回历史记录</a> · <a href="index.html?section=main">当前MAIN与正式下载</a></p></main><script>document.getElementById('file').textContent=new URLSearchParams(location.search).get('file')||'历史资料';</script></html>'''
        (self.dest/'archive-downloads.html').write_text(archive,encoding='utf-8')
        (self.dest/'.nojekyll').write_text('',encoding='utf-8')
        owned=set(self.files)|{'archive-downloads.html','.nojekyll'}
        for stale in self.previous_owned-owned:
            target=(self.dest/stale).resolve()
            if not target.is_relative_to(self.dest) or target==self.dest:
                raise RuntimeError(f'Unsafe prior-manifest path: {stale}')
            if target.is_file():target.unlink()
        manifest={'status':'STATIC_SOURCE_PREPARED_NOT_DEPLOYED','source':'output/whole_robot_click_compare','source_mechanical_revision':'D1_MAIN_DIRECT_GRIPS_004','current_model_items':356,'manufacturing_release':False,'hash_scope_note':'Published text files have Windows machine paths removed and relative links rewritten. source_SHA256 identifies the original local file; published_SHA256 identifies this public copy. Historical hashes inside evidence documents continue to identify their original source artifacts, not rewritten copies.','release_urls':sorted({v['url'] for v in self.large_links}),'unpublished_history_links':list({v['source']:v for v in self.stubbed}.values()),'unresolved_source_links':list({v['source']:v for v in self.unresolved}.values()),'files':[{'path':f.relative_to(self.dest).as_posix(),'bytes':f.stat().st_size,'published_SHA256':sha(f),'source_SHA256':sha(self.files[f.relative_to(self.dest).as_posix()]) if f.relative_to(self.dest).as_posix() in self.files else None,'source_path':self.files[f.relative_to(self.dest).as_posix()].relative_to(OUTPUT).as_posix() if f.relative_to(self.dest).as_posix() in self.files else None} for f in sorted(self.dest/p for p in owned) if f.is_file()]}
        manifest['total_bytes']=sum(r['bytes'] for r in manifest['files'])
        (self.dest/'publication-manifest.json').write_text(dumps(manifest),encoding='utf-8')
        check=self.validate()
        report=OUTPUT/'tooling_research/robopup-static-build-validation.json'
        report.write_text(dumps(check),encoding='utf-8')
        print(dumps({'status':check['status'],'files':len(manifest['files']),'MB':round(manifest['total_bytes']/1024/1024,2),'source_links_missing':len(manifest['unresolved_source_links']),'history_links_explained':len(manifest['unpublished_history_links']),'validation_report':str(report),'critical_missing':len(check['missing_html_assets'])}))
        return check
    def validate(self):
        missing=[];leaks=[]
        for dst in self.text_content:
            p=self.dest/dst;text=p.read_text(encoding='utf-8')
            if re.search(r'(?i)(?<![A-Za-z0-9_])[A-Za-z]:[/\\]+|Users[/\\]+[^/\\]+',text):leaks.append(dst)
            if p.suffix.lower()=='.html':
                for raw in re.findall(r'''(?:src|href)=["']([^"']+)["']''',text):
                    ref=relative_ref(raw)
                    if ref and not (p.parent/ref).resolve().exists():missing.append({'page':dst,'ref':raw})
        assert not leaks,('Machine path leaks',leaks)
        return {'status':'STATIC_SITE_BUILD_PASS' if not missing else 'STATIC_SITE_BUILD_NEEDS_REVIEW','machine_path_leaks':leaks,'missing_html_assets':missing,'source_dependency_count':len(self.files),'external_release_urls':list(BIG_RELEASE.values()),'release_assets_uploaded_by_this_script':False,'published_by_this_script':False}

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--destination',type=Path,default=DEFAULT_DEST);args=ap.parse_args()
    result=Builder(args.destination).run()
    if result['missing_html_assets']:raise SystemExit(2)
