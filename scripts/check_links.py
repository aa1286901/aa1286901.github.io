#!/usr/bin/env python3
"""Check that every .ipa link in apps/apps.json is reachable (without downloading it)."""
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

APPS_JSON = Path(__file__).resolve().parent.parent / "apps" / "apps.json"


def main():
    apps = json.loads(APPS_JSON.read_text(encoding="utf-8"))["routes"]
    failed = 0
    for app in apps:
        req = urllib.request.Request(app["ipa"], headers={"Range": "bytes=0-0"})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                status = resp.status
        except urllib.error.HTTPError as e:
            status = e.code
        except Exception as e:  # network error
            status = repr(e)
        ok = status in (200, 206)
        failed += not ok
        print(f"{'OK  ' if ok else 'FAIL'} {status} {app['title']}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
