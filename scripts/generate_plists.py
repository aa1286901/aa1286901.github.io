#!/usr/bin/env python3
"""Generate apps/plist/<bundleId>.plist from apps/apps.json (single source of truth).

Usage:
  scripts/generate_plists.py          write plists, remove plists not listed in apps.json
  scripts/generate_plists.py --check  only validate; exit 1 if plists are out of date
"""
import json
import sys
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
APPS_JSON = ROOT / "apps" / "apps.json"
PLIST_DIR = ROOT / "apps" / "plist"
REQUIRED = ("title", "img", "bundleId", "category", "ipa")

TEMPLATE = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
        <key>items</key>
        <array>
                <dict>
                        <key>assets</key>
                        <array>
                                <dict>
                                        <key>kind</key>
                                        <string>software-package</string>
                                        <key>url</key>
                                        <string>{ipa}</string>
                                </dict>
                                <dict>
                                        <key>kind</key>
                                        <string>display-image</string>
                                        <key>url</key>
                                        <string>{img}</string>
                                </dict>
                                <dict>
                                        <key>kind</key>
                                        <string>full-size-image</string>
                                        <key>url</key>
                                        <string>{img}</string>
                                </dict>
                        </array>
                        <key>metadata</key>
                        <dict>
                                <key>bundle-identifier</key>
                                <string>{bundleId}</string>
                                <key>bundle-version</key>
                                <string>{version}</string>
                                <key>kind</key>
                                <string>software</string>
                                <key>title</key>
                                <string>{title}</string>
                        </dict>
                </dict>
        </array>
</dict>
</plist>
"""


def render(app):
    version = app["category"].strip()
    if version.startswith("v."):
        version = version[2:].strip()
    fields = {k: escape(str(v)) for k, v in app.items()}
    fields["version"] = escape(version)
    return TEMPLATE.format(**fields)


def main():
    check = "--check" in sys.argv[1:]
    apps = json.loads(APPS_JSON.read_text(encoding="utf-8"))["routes"]
    errors = []
    seen = set()

    for app in apps:
        name = app.get("title") or app.get("bundleId") or "?"
        missing = [k for k in REQUIRED if not app.get(k)]
        if missing:
            errors.append(f"{name}: missing fields {', '.join(missing)}")
            continue
        if app["bundleId"] in seen:
            errors.append(f"{name}: duplicate bundleId {app['bundleId']}")
            continue
        seen.add(app["bundleId"])
        if not app["ipa"].startswith("https://"):
            errors.append(f"{name}: ipa url must be https")
            continue

        path = PLIST_DIR / f"{app['bundleId']}.plist"
        content = render(app)
        if check:
            if not path.exists() or path.read_text(encoding="utf-8") != content:
                errors.append(f"{path.relative_to(ROOT)}: out of date, run scripts/generate_plists.py")
        else:
            PLIST_DIR.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")

    for path in sorted(PLIST_DIR.glob("*.plist")):
        if path.stem not in seen:
            if check:
                errors.append(f"{path.relative_to(ROOT)}: not listed in apps.json")
            else:
                path.unlink()
                print(f"removed unused {path.relative_to(ROOT)}")

    if errors:
        print("\n".join(errors))
        sys.exit(1)
    print(f"ok: {len(seen)} apps")


if __name__ == "__main__":
    main()
