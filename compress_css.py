from pathlib import Path

try:
    import csscompressor
except Exception as exc:  # pragma: no cover
    raise SystemExit("csscompressor is required: pip install csscompressor") from exc


def main() -> None:
    project_root = Path(__file__).resolve().parent
    src = project_root / "css" / "main.dev.css"
    dst = project_root / "css" / "main.css"

    css_text = src.read_text(encoding="utf-8")
    minified = csscompressor.compress(css_text)
    dst.write_text(minified, encoding="utf-8")
    print("CSS compressed successfully!")


if __name__ == "__main__":
    main()

import csscompressor

# Read the development CSS file
with open('css/main.dev.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Minify the CSS
minified_css = csscompressor.compress(css_content)

# Write the minified CSS to main.css
with open('css/main.css', 'w', encoding='utf-8') as f:
    f.write(minified_css)

print("CSS compressed successfully!")