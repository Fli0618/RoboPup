"""Check the self-contained GitHub Pages artifact, without external dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import hashlib, json, re, subprocess

ROOT=Path(__file__).resolve().parents[1]
DOCS=ROOT/'docs'
errors=[]
class References(HTMLParser):
    def __init__(self):super().__init__();self.refs=[]
    def handle_starttag(self,tag,attrs):
        for key,value in attrs:
            if key in ('src','href','poster') and value:self.refs.append(value)

assert (DOCS/'index.html').exists() and (DOCS/'.nojekyll').exists()
for path in DOCS.rglob('*'):
    if not path.is_file():continue
    if path.stat().st_size>=100*1024*1024:errors.append(f'GitHub file limit: {path.relative_to(ROOT)}')
    if path.suffix in {'.js','.json','.html','.css','.usda','.md'}:
        text=path.read_text(encoding='utf-8-sig')
        if re.search(r'(?i)(?<![a-z0-9_])[a-z]:[/\\]+',text):errors.append(f'Windows path: {path.relative_to(ROOT)}')
    if path.suffix=='.json':
        try:json.loads(text)
        except Exception as e:errors.append(f'Invalid JSON: {path.relative_to(ROOT)}: {e}')
    if path.suffix=='.js':
        check=subprocess.run(['node','--check',str(path)],capture_output=True,text=True)
        if check.returncode:errors.append(f'Invalid JS: {path.relative_to(ROOT)}: {check.stderr}')
    if path.suffix=='.html':
        parser=References();parser.feed(text)
        for value in parser.refs:
            url=urlsplit(value)
            if url.scheme or url.netloc or not url.path:continue
            target=(path.parent/unquote(url.path)).resolve()
            if not target.is_relative_to(DOCS.resolve()) or not target.exists():errors.append(f'Missing resource: {path.relative_to(DOCS)} -> {value}')

manifest=json.loads((DOCS/'publication-manifest.json').read_text(encoding='utf-8'))
assert manifest['current_model_items']==356 and manifest['manufacturing_release'] is False
for entry in manifest['files']:
    path=DOCS/entry['path']
    if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest()!=entry['published_SHA256']:errors.append('Manifest mismatch: '+entry['path'])
assert not errors,'\n'.join(errors)
print(f'STATIC_SITE_CHECK_PASS: {len(manifest["files"])} files, MAIN356, no missing HTML resources, valid JSON/JS, no local Windows paths')
