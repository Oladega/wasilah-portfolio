import re,json,urllib.request,concurrent.futures,pathlib
root=pathlib.Path('public');(root/'images').mkdir(parents=True,exist_ok=True);(root/'fonts').mkdir(exist_ok=True);(root/'documents').mkdir(exist_ok=True)
sources=[open('/tmp/wasilah-reference.html').read(),open('/tmp/wasilah-page.mjs').read()]
for slug in ['halden','pulse','nacre','kiln-co','orbit']:
 text=urllib.request.urlopen('https://informal-room-612303.framer.app/work/'+slug).read().decode();sources.append(text);pathlib.Path('docs/reference-'+slug+'.html').write_text(text)
urls=set()
for s in sources:
 urls.update(re.findall(r'https://framerusercontent.com/images/[A-Za-z0-9]+\.(?:png|jpg|jpeg|webp)',s))
 urls.update(re.findall(r'https://fonts.gstatic.com/[^\s`"<>;)]+\.woff2',s))
urls.add('https://framerusercontent.com/assets/qVI4VexACDjeL2UOQF9oibjSXo.pdf')
def fetch(url):
 folder='images' if '/images/' in url else 'fonts' if 'woff' in url else 'documents'
 path=root/folder/url.split('/')[-1]
 if not path.exists(): urllib.request.urlretrieve(url,path)
 return url,'/'+str(path.relative_to(root))
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:result=dict(ex.map(fetch,urls))
pathlib.Path('docs/asset-manifest.json').write_text(json.dumps(result,indent=2));print('Downloaded',len(result),'original assets')
