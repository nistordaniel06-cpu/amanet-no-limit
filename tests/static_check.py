"""Check real static entrypoints, links, anchors, form labels, IDs and referenced assets."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
root=Path(__file__).resolve().parent.parent
class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=set(); self.refs=[]; self.duplicates=[]; self.h1=0
        self.label_depth=0; self.unlabeled=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'):
            if a['id'] in self.ids: self.duplicates.append(a['id'])
            self.ids.add(a['id'])
        if tag=='h1': self.h1+=1
        if tag=='label': self.label_depth+=1
        if tag in ('input','select','textarea') and not self.label_depth and not a.get('aria-label'):
            self.unlabeled.append(tag)
        for key in ('href','src'):
            if key in a: self.refs.append(a[key])
    def handle_endtag(self, tag):
        if tag=='label': self.label_depth=max(0,self.label_depth-1)
pages={}
for path in list(root.glob('*.html'))+list((root/'Pagini').glob('*.html')):
    parser=Page(); parser.feed(path.read_text()); pages[path]=parser
errors=[]
for path,page in pages.items():
    if page.duplicates: errors.append(f'{path.name}: duplicate IDs {page.duplicates}')
    if page.unlabeled: errors.append(f'{path.name}: unlabeled controls')
    if path.parent==root and page.h1!=1: errors.append(f'{path.name}: expected one h1')
    for ref in page.refs:
        u=urlsplit(ref)
        if u.scheme or u.netloc: continue
        target=(path.parent/unquote(u.path)).resolve() if u.path else path
        if not target.is_file(): errors.append(f'{path.name}: missing {ref}')
        if u.fragment and target in pages and u.fragment not in pages[target].ids:
            errors.append(f'{path.name}: missing anchor {ref}')
assert not errors, '\n'.join(errors)
print(f'{len(pages)} HTML pages: routes, assets, anchors, IDs and labels passed')
