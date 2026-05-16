#!/usr/bin/env python3
"""下载产品图片 - 使用 placeholder.co 生成产品语义图片（保证唯一性）"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import urllib.request
from pathlib import Path

BASE_DIR = Path("E:/claude/project/commerce/backend/public/top10")
BASE_DIR.mkdir(parents=True, exist_ok=True)

# 每个产品使用唯一的描述文字 + 颜色组合
# 颜色主题与设计系统一致 (Hermes Orange: #E65C00)
IMAGES = {
    "skincare": [
        ("skincare-01.png", "Face Cream", "E65C00"),
        ("skincare-02.png", "Vitamin C Serum", "FF8533"),
        ("skincare-03.png", "Moisturizer", "D4AF37"),
        ("skincare-04.png", "Cleanser", "E65C00"),
        ("skincare-05.png", "Toner", "FF8533"),
        ("skincare-06.png", "Sunscreen SPF50", "D4AF37"),
        ("skincare-07.png", "Eye Cream", "E65C00"),
        ("skincare-08.png", "Face Mask", "FF8533"),
        ("skincare-09.png", "Serum", "D4AF37"),
        ("skincare-10.png", "Skincare Kit", "E65C00"),
    ],
    "makeup": [
        ("makeup-01.png", "Lipstick", "C71585"),
        ("makeup-02.png", "Mascara", "DB7093"),
        ("makeup-03.png", "Foundation", "C71585"),
        ("makeup-04.png", "Eye Shadow", "DB7093"),
        ("makeup-05.png", "Blush", "C71585"),
        ("makeup-06.png", "Concealer", "DB7093"),
        ("makeup-07.png", "Highlighter", "C71585"),
        ("makeup-08.png", "Primer", "DB7093"),
        ("makeup-09.png", "Makeup Palette", "C71585"),
        ("makeup-10.png", "Brush Set", "DB7093"),
    ],
    "electronics": [
        ("electronics-01.png", "Headphones", "007AFF"),
        ("electronics-02.png", "Smart Watch", "5856D6"),
        ("electronics-03.png", "Speaker", "007AFF"),
        ("electronics-04.png", "Tablet", "5856D6"),
        ("electronics-05.png", "Camera", "007AFF"),
        ("electronics-06.png", "Earbuds", "5856D6"),
        ("electronics-07.png", "Charger", "007AFF"),
        ("electronics-08.png", "Keyboard", "5856D6"),
        ("electronics-09.png", "Mouse", "007AFF"),
        ("electronics-10.png", "Laptop", "5856D6"),
    ],
    "home": [
        ("home-01.png", "Table Lamp", "8B4513"),
        ("home-02.png", "Vase", "D2691E"),
        ("home-03.png", "Candle", "D2691E"),
        ("home-04.png", "Pillow", "8B4513"),
        ("home-05.png", "Plant", "228B22"),
        ("home-06.png", "Clock", "8B4513"),
        ("home-07.png", "Mirror", "D2691E"),
        ("home-08.png", "Rug", "8B4513"),
        ("home-09.png", "Frame", "D2691E"),
        ("home-10.png", "Decor", "8B4513"),
    ],
}


def download_image(filename: str, text: str, bg_color: str, category: str) -> bool:
    """下载单张产品图片 - 使用唯一描述和颜色确保唯一性"""
    try:
        # 使用 placeholder.co，背景色+文字颜色形成对比
        # 每张图片使用不同的文字和颜色组合
        text_encoded = text.replace(" ", "+")
        url = f"https://placehold.co/400x400/{bg_color}/FFFFFF.png?text={text_encoded}"

        filepath = BASE_DIR / filename
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "image/png,image/*;*/*",
            }
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            content = response.read()
            # 验证是PNG图片
            if content[:4] != b'\x89PNG':
                print(f"[FAIL] {category}/{filename} - Not a PNG")
                return False
            filepath.write_bytes(content)
            print(f"[OK] {category}/{filename} ({len(content)} bytes)")
            return True
    except Exception as e:
        print(f"[FAIL] {category}/{filename} - {e}")
        return False


def main():
    print("Downloading product images from placehold.co...")
    print("Unique text + color for each product\n")

    total_success = 0
    total_failed = 0

    for category, images in IMAGES.items():
        print(f"[{category.upper()}]")
        for filename, text, color in images:
            if download_image(filename, text, color, category):
                total_success += 1
            else:
                total_failed += 1

    print(f"\n[DONE] Success: {total_success}, Failed: {total_failed}")
    print(f"Images saved to: {BASE_DIR}")


if __name__ == "__main__":
    main()