"""Integrate project-specific, source-grounded figures into the approved portfolio."""
from pathlib import Path
import argparse
import html
import json
import re
import shutil
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT
PREVIEW = ROOT
VERSION = 'apparatus-20261028'
LAYOUT = {'clip-context': 'layout-reversed', 'sunicon-vton': '',
          'allmize': 'layout-reversed', 'generative-models': 'layout-wide', 'khuda': 'layout-wide'}


def esc(text):
    return html.escape(str(text), quote=True)


def remove_generated(page):
    page = re.sub(r'<section class="project-explorer\b.*?</section>\s*', '', page, flags=re.S)
    page = re.sub(r'<link[^>]+project-explorer\.css[^>]*>\s*', '', page)
    return re.sub(r'<script[^>]+project-explorer\.js[^>]*></script>\s*', '', page)


def localized(tag, values, attrs=''):
    values = {key: value.replace('<br>', '\n').replace('<br/>', '\n') for key, value in values.items()}
    return f'<{tag} {attrs} data-ko="{esc(values["ko"]).replace(chr(10), "&lt;br&gt;")}" data-en="{esc(values["en"]).replace(chr(10), "&lt;br&gt;")}">{esc(values["ko"]).replace(chr(10), "<br>")}</{tag}>'


def section(slug, data, svg):
    initial = next(part for part in data['parts'] if part['id'] == data['defaultPart'])
    index = data['parts'].index(initial) + 1
    buttons = ''.join(f'<button type="button" data-stage="{esc(p["id"])}" aria-controls="project-part-panel" aria-pressed="{str(p == initial).lower()}"><b aria-hidden="true">{i:02}</b>{localized("span", p["label"])}</button>' for i, p in enumerate(data['parts'], 1))
    # Static fallback includes the initial selection; JavaScript adds interaction.
    work = localized('dt', {'ko': '내가 맡은 일', 'en': 'My contribution'})
    result = localized('dt', {'ko': '확인한 것', 'en': 'What this showed'})
    selected = f'<div class="explorer-panel" id="project-part-panel" aria-live="polite" aria-atomic="true"><div class="explorer-panel-title"><span data-part-number>{index:02}</span><h3 data-part-title>{esc(initial["label"]["ko"])}</h3></div><dl><div>{work}<dd data-part-work>{esc(initial["work"]["ko"])}</dd></div><div>{result}<dd data-part-result>{esc(initial["result"]["ko"])}</dd></div></dl></div>'
    if slug == 'spot-videollm':
        takeaway = f'<div class="explorer-comparison"><div>{localized("h3", data["takeaway"])}{localized("p", data["scope"], "class=explorer-scope")}</div><div class="explorer-results">'
        for number, label in [(577, {'ko': '원모델 답변', 'en': 'Native answers'}), (874, {'ko': '학습된 외부 분류기', 'en': 'Trained external classifier'})]:
            takeaway += f'<div class="explorer-result">{localized("p", label)}<strong>{number}</strong>{localized("small", {"ko": "/ 1,104 정답", "en": "/ 1,104 correct"})}</div>'
        takeaway += f'</div>{localized("p", data["boundary"], "class=explorer-boundary")}</div>'
    else:
        takeaway = '<div class="explorer-takeaway">' + localized('h3', data['takeaway']) + localized('p', data['scope'], 'class="explorer-scope"') + localized('p', data['boundary']) + '</div>'
    payload = json.dumps(data, ensure_ascii=False).replace('<', '\\u003c')
    hint = localized('p', {'ko': '부품을 눌러 프로젝트를 살펴보세요.', 'en': 'Select a part. Explore the project.'})
    return f'''<section class="project-explorer {LAYOUT.get(slug, '')}" id="experiment" data-project-explorer aria-labelledby="explorer-heading">
<div class="explorer-heading">{localized('h2', data['heading'], 'id="explorer-heading"')}{hint}</div>
<div class="explorer-layout"><div class="explorer-stage">{svg}<button class="explorer-motion" data-explorer-motion type="button" aria-label="모형 움직임 멈추기" aria-pressed="false"><svg class="pause" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4v12M13 4v12"/></svg><svg class="play" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 4 10 6-10 6z"/></svg></button></div>{selected}</div>
<div class="explorer-stages" role="group" aria-label="프로젝트 구성 선택">{buttons}</div>
{localized('p', data['caption'], 'class="explorer-caption"')}{takeaway}
<script type="application/json" data-explorer-content>{payload}</script></section>'''


def build(allow_partial=False):
    data = {}
    for path in sorted((ROOT/'tools/illustrations/data').glob('*-content.json')):
        data.update(json.loads(path.read_text()))
    expected = {p.parent.name for p in (SOURCE/'projects').glob('*/index.html')}
    if not allow_partial:
        assert set(data) == expected, (set(data), expected)
    # Reuse the accepted SPOT drawing; all remaining projects have dedicated art.
    svg = (PREVIEW/'assets/spot-apparatus.svg').read_text()
    svg = svg.replace('class="spot-apparatus"', 'class="project-apparatus spot-apparatus"').replace('viewBox="0 0 960 620"', 'viewBox="0 65 960 500"')
    svg = svg.replace('data-flow-route="input"', 'data-flow-route="input" data-flow-start="0" data-flow-end="0.42"')
    for route in ('native', 'readout'):
        svg = svg.replace(f'data-flow-route="{route}"', f'data-flow-route="{route}" data-flow-start="0.43" data-flow-end="0.93"')
    # Control trace is a diagnostic link, not another answer route.
    svg = svg.replace('class="flow-track" data-flow-route="control"', 'class="diagnostic-track" data-flow-route="control"')
    svg = svg.replace('.spot-apparatus .flow-track{', '.spot-apparatus .flow-track,.spot-apparatus .diagnostic-track{')
    (PREVIEW/'assets/project-spot-videollm.svg').write_text(svg)
    if allow_partial:
        data = {slug: config for slug, config in data.items() if (PREVIEW/f'assets/project-{slug}.svg').exists()}
    built = []
    for slug, config in data.items():
        figure = (PREVIEW/f'assets/project-{slug}.svg').read_text()
        tree = ET.fromstring(figure)
        ids = [node.attrib['data-part'] for node in tree.iter() if 'data-part' in node.attrib]
        assert sorted(ids) == sorted(p['id'] for p in config['parts']), (slug, ids)
        assert config['defaultPart'] in ids
        assert len(ids) == len(set(ids))
        for part in config['parts']:
            for field in ('label', 'work', 'result'):
                assert all(part[field][language].strip() for language in ('ko', 'en'))
        page = remove_generated((SOURCE/f'projects/{slug}/index.html').read_text())
        page = page.replace('</head>', f'<link rel="stylesheet" href="../../assets/project-explorer.css?v={VERSION}"/>\n</head>')
        page = page.replace('<nav aria-label="프로젝트 상세 목차"', section(slug, config, figure)+'\n<nav aria-label="프로젝트 상세 목차"', 1)
        page = page.replace('</body>', f'<script type="module" src="../../assets/project-explorer.js?v={VERSION}"></script>\n</body>')
        (PREVIEW/f'projects/{slug}/index.html').write_text(page)
        built.append({'slug': slug, 'parts': ids, 'bytes': len(figure.encode())})
    home = remove_generated((SOURCE/'index.html').read_text())
    home = home.replace('</head>', f'<link rel="stylesheet" href="assets/project-explorer.css?v={VERSION}"/>\n</head>')
    def cover(match):
        attrs = match.group('attrs').replace(' apparatus-cover', '')
        slug = re.search(r'href="projects/([^/]+)/(?:#experiment)?"', attrs).group(1)
        if slug not in data:
            return match.group(0)
        attrs = attrs.replace('class="project-cover ', 'class="project-cover apparatus-cover ')
        attrs = attrs.replace(f'href="projects/{slug}/"', f'href="projects/{slug}/#experiment"')
        return f'<a{attrs}><img class="apparatus-cover-image" src="assets/project-{slug}.svg?v={VERSION}" alt="" loading="lazy" width="960" height="600"/><span aria-hidden="true" class="cover-arrow">↗</span></a>'
    home = re.sub(r'<a(?P<attrs>[^>]*class="project-cover[^>]+)>.*?</a>', cover, home, flags=re.S)
    for slug in data:
        home = home.replace(f'href="projects/{slug}/"', f'href="projects/{slug}/#experiment"')
    (PREVIEW/'index.html').write_text(home)
    shutil.copyfile(ROOT/'tools/illustrations/reference/LICENSE', PREVIEW/'assets/anatomy-license.txt')
    (ROOT/'tools/illustrations/data/build.json').write_text(json.dumps(built, ensure_ascii=False, indent=2))
    print(json.dumps(built, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--partial', action='store_true')
    build(parser.parse_args().partial)
