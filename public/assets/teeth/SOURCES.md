# Tooth SVG Assets — Sources & Licenses

Downloaded for the dentalbook odontogram. **Primary chart assets** are the six `*-labial.svg` / `*-occlusal.svg` files from GitHub (realistic, layered odontogram templates). **Reference assets** are supplemental anatomical diagrams from Wikimedia Commons and OpenClipart.

---

## Primary odontogram templates (use in chart)

| Local file | Original source | Author | License | Commercial use | FDI mapping |
|---|---|---|---|---|---|
| `incisor-labial.svg` | [11.svg](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/src/assets/teeth-svgs/11.svg) | Zoltán Dul | [MIT](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE) | ✅ Yes (include copyright notice) | 11, 12, 21, 22, 31, 32, 41, 42 |
| `canine-labial.svg` | [13.svg](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/src/assets/teeth-svgs/13.svg) | Zoltán Dul | MIT | ✅ Yes | 13, 23, 33, 43 |
| `premolar-labial.svg` | [14.svg](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/src/assets/teeth-svgs/14.svg) | Zoltán Dul | MIT | ✅ Yes | 14, 15, 24, 25, 34, 35, 44, 45 |
| `premolar-occlusal.svg` | [14_occl.svg](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/src/assets/teeth-svgs/14_occl.svg) | Zoltán Dul | MIT | ✅ Yes | Same premolars (occlusal view) |
| `molar-labial.svg` | [16.svg](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/src/assets/teeth-svgs/16.svg) | Zoltán Dul | MIT | ✅ Yes | 16–18, 26–28, 36–38, 46–48 |
| `molar-occlusal.svg` | [16_occl.svg](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/src/assets/teeth-svgs/16_occl.svg) | Zoltán Dul | MIT | ✅ Yes | Same molars (occlusal view) |

**Repository:** https://github.com/ZoliQua/React-Odontogram-Modul  
**MIT notice required:** Copyright (c) 2026 Zoltán Dul — include license text in project notices if these SVGs are shipped in production.

---

## Reference / supplemental assets

| Local file | Original source | Author | License | Commercial use | Notes |
|---|---|---|---|---|---|
| `reference-full-dental-arches.svg` | [Human dental arches.svg](https://commons.wikimedia.org/wiki/File:Human_dental_arches.svg) | Kaligula | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | ✅ Yes (attribution + share-alike on derivatives) | Full upper/lower arch diagram; realistic buccal view |
| `reference-types-overview.svg` | [Types of teeth.svg](https://commons.wikimedia.org/wiki/File:Types_of_teeth.svg) | Bizhan Khodabandeh | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | ✅ Yes (attribution + share-alike) | Incisor / canine / premolar / molar side-by-side |
| `reference-tooth-unlabeled.svg` | [Basic tooth.svg](https://commons.wikimedia.org/wiki/File:Basic_tooth.svg) | K. D. Schroeder (KDS4444) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | ✅ Yes (attribution + share-alike) | Unlabeled molar anatomy (labial view) |
| `reference-molar-cross-section-labeled.svg` | [Human tooth diagram-en.svg](https://commons.wikimedia.org/wiki/File:Human_tooth_diagram-en.svg) | K. D. Schroeder (KDS4444) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | ✅ Yes (attribution + share-alike) | Labeled cross-section (enamel, dentin, pulp, etc.) |
| `reference-tooth-cut-half.svg` | [OpenClipart #28489](https://openclipart.org/detail/28489/tooth-cut-in-half-vector-drawing) (mirrored on [Public Domain Vectors](https://publicdomainvectors.org/en/free-clipart/Tooth-cut-in-half-vector-drawing/28489.html)) | OpenClipart contributor | **Public Domain** | ✅ Yes (no restrictions) | Simplified cutaway; less detailed than odontogram templates |

### Suggested attribution lines (CC BY-SA assets)

- `reference-full-dental-arches.svg`: "Human dental arches.svg by Kaligula, Wikimedia Commons, CC BY-SA 3.0"
- `reference-types-overview.svg`: "Types of teeth.svg by Bizhan Khodabandeh, Wikimedia Commons, CC BY-SA 4.0"
- `reference-tooth-unlabeled.svg`: "Basic tooth.svg by K. D. Schroeder, Wikimedia Commons, CC BY-SA 4.0"
- `reference-molar-cross-section-labeled.svg`: "Human tooth diagram-en.svg by K. D. Schroeder, Wikimedia Commons, CC BY-SA 4.0"

---

## Sources searched but not included

### SVG Repo (https://www.svgrepo.com)

Searched collections: `tooth-shape-outline`, `dental-chart`, `body-parts`.

| Example | License | Why excluded |
|---|---|---|
| [tooth-shape-outline](https://www.svgrepo.com/svg/63429/tooth-shape-outline) | CC0 | Generic flat icon — not anatomically realistic |
| [tooth-outline](https://www.svgrepo.com/svg/170365/tooth-outline) | CC0 | Simple outline — cartoon/stylized |
| [tooth-with-a-dentist-tool-outline](https://www.svgrepo.com/svg/136406/tooth-with-a-dentist-tool-outline) | CC0 | Icon with tool — not odontogram anatomy |

**Conclusion:** SVG Repo has CC0 commercial-friendly icons, but none meet the “anatomically correct, no cartoon” requirement for chart teeth.

### GitHub (other repos)

| Repository | License | Why not used for assets |
|---|---|---|
| [biomathcode/react-odontogram](https://github.com/biomathcode/react-odontogram) | Check repo LICENSE | SVG teeth embedded in React components, not standalone anatomical templates |
| [traval27/react-teeth-selector](https://github.com/traval27/react-teeth-selector) | Check repo LICENSE | Polygon-based selector shapes, not realistic anatomy |
| [jonathanfrancisco Adult Dental Chart Gist](https://gist.github.com/jonathanfrancisco/f397ede938335509c0f7abbade84b1a0) | Unspecified | White polygon fills only — schematic, not realistic |

### Public Domain Vectors

Only [Tooth cut in half](https://publicdomainvectors.org/en/free-clipart/Tooth-cut-in-half-vector-drawing/28489.html) was anatomically usable; downloaded as `reference-tooth-cut-half.svg`. Other results were fairy/cartoon teeth.

---

## File naming convention

```
{tooth-type}-{view}.svg          → chart-ready odontogram templates (GitHub/MIT)
reference-{description}.svg      → educational / attribution-required diagrams
```

| Pattern | Example | Purpose |
|---|---|---|
| `incisor-labial.svg` | Central/lateral incisors, buccal view | Primary chart asset |
| `canine-labial.svg` | Canines, buccal view | Primary chart asset |
| `premolar-labial.svg` | Premolars, buccal view | Primary chart asset |
| `premolar-occlusal.svg` | Premolars, occlusal view | Status overlays / detail |
| `molar-labial.svg` | Molars, buccal view | Primary chart asset |
| `molar-occlusal.svg` | Molars, occlusal view | Status overlays / detail |
| `reference-*.svg` | Full arch, type chart, cross-sections | Design reference only |

---

## Partial set note

No single free source provides 32 unique per-tooth realistic SVGs. This set combines:

1. **6 templates** (MIT) covering 4 morphological groups × labial/occlusal — mapped to all FDI numbers by type.
2. **5 reference diagrams** (Wikimedia + Public Domain) for full-arch layout and anatomy validation.

For a gum (gingiva) layer matching the target mockup, that will need a separate asset or extraction from `reference-full-dental-arches.svg` (pink tissue paths).
