import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "assets" / "img" / "abdul-photos"
OUTPUT_DIR = ROOT / "assets" / "img" / "candidate-photos"
MANIFEST_PATH = ROOT / "js" / "data" / "candidate-photos.js"

SOURCE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}
THUMB_SIZE = 240
PRINT_SIZE = 720
QUALITY = 88


def slugify(stem):
    cleaned = stem
    while True:
        lowered = cleaned.lower()
        if lowered.startswith("copy of "):
            cleaned = cleaned[len("copy of "):]
            continue
        break
    cleaned = re.sub(r"[^A-Za-z0-9]+", "-", cleaned).strip("-").lower()
    return cleaned or "photo"


def unique(slug, taken):
    if slug not in taken:
        taken.add(slug)
        return slug
    index = 2
    while f"{slug}-{index}" in taken:
        index += 1
    candidate = f"{slug}-{index}"
    taken.add(candidate)
    return candidate


def square(image, size):
    return ImageOps.fit(image, (size, size), method=Image.LANCZOS, centering=(0.5, 0.5))


def main():
    if not SOURCE_DIR.is_dir():
        sys.exit(f"Source directory not found: {SOURCE_DIR}")

    sources = sorted(
        (path for path in SOURCE_DIR.iterdir() if path.is_file() and path.suffix.lower() in SOURCE_SUFFIXES),
        key=lambda path: path.name.lower(),
    )
    if not sources:
        sys.exit(f"No images found in {SOURCE_DIR}")

    (OUTPUT_DIR / "thumb").mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "print").mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)

    taken = set()
    entries = []

    for index, path in enumerate(sources, start=1):
        slug = unique(slugify(path.stem), taken)
        try:
            with Image.open(path) as opened:
                image = ImageOps.exif_transpose(opened).convert("RGB")
        except Exception as exc:
            print(f"  skipped {path.name}: {exc}")
            continue

        square(image, THUMB_SIZE).save(OUTPUT_DIR / "thumb" / f"{slug}.jpg", "JPEG", quality=QUALITY, optimize=True)
        square(image, PRINT_SIZE).save(OUTPUT_DIR / "print" / f"{slug}.jpg", "JPEG", quality=QUALITY, optimize=True)

        entries.append({"id": slug, "label": f"Photo {index}"})
        print(f"  {slug}")

    body = json.dumps(entries, indent=2)
    MANIFEST_PATH.write_text(
        "export const CANDIDATE_PHOTO_THUMB_DIR = 'assets/img/candidate-photos/thumb';\n"
        "export const CANDIDATE_PHOTO_PRINT_DIR = 'assets/img/candidate-photos/print';\n\n"
        f"export const candidatePhotos = {body};\n",
        encoding="utf-8",
    )

    print(f"\n{len(entries)} photos -> {OUTPUT_DIR.relative_to(ROOT)}")
    print(f"manifest -> {MANIFEST_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
