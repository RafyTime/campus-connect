#!/usr/bin/env python3
"""Render launcher PNGs directly from the shared SVG at their declared sizes.

Requires ImageMagick with SVG support. Run: python3 scripts/generate-app-icons.py
"""

from copy import deepcopy
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SVG = '{http://www.w3.org/2000/svg}'
ET.register_namespace('', 'http://www.w3.org/2000/svg')
source = ET.parse(ROOT / 'src/lib/assets/favicon.svg').getroot()


def render(size: int, destination: str, *, opaque: bool = False, maskable: bool = False):
    icon = deepcopy(source)
    # Set dimensions before rasterization; resizing a 32px bitmap produces blurry exports.
    icon.set('width', str(size))
    icon.set('height', str(size))
    if opaque or maskable:
        icon.find(f'{SVG}rect').set('rx', '0')
    if maskable:
        mark = ET.SubElement(icon, f'{SVG}g', {'transform': 'translate(4 4) scale(0.75)'})
        for path in list(icon.findall(f'{SVG}path')):
            icon.remove(path)
            mark.append(path)
    output = ROOT / destination
    output.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(prefix='campus-icons-') as directory:
        vector = Path(directory) / 'icon.svg'
        ET.ElementTree(icon).write(vector, encoding='unicode')
        subprocess.run(
            ['magick', '-background', 'none', str(vector), '-strip',
             f'{"PNG24" if opaque or maskable else "PNG32"}:{output}'],
            check=True,
        )


render(192, 'static/icons/campus-connect-192.png')
render(512, 'static/icons/campus-connect-512.png')
render(512, 'static/icons/campus-connect-maskable-512.png', maskable=True)
render(180, 'static/apple-touch-icon.png', opaque=True)
