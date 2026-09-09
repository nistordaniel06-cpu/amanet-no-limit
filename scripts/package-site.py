"""Create a website-only ZIP. Python 3, no dependencies. Run from any directory."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parent.parent
files = list(root.glob('*.html')) + [root/'robots.txt', root/'sitemap.xml']
for folder in ['assets', 'css', 'js', 'Pagini']:
    files += [p for p in (root/folder).rglob('*') if p.is_file()]
with ZipFile(root/'amanet-godaddy.zip', 'w', ZIP_DEFLATED) as archive:
    for path in sorted(files):
        archive.write(path, path.relative_to(root))
print('amanet-godaddy.zip: website files only; no docs, tests, git or credentials')
