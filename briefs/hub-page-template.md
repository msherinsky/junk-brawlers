# Hub Page Template — Junk Brawlers

Applies to the three category hubs: `residential-junk-removal.html`,
`commercial-junk-removal.html`, `cleanout-services.html`.

Written 2026-08-24. Design language stays exactly as the homepage. What changes is
**what a hub says**, not how it looks.

---

## The one rule

> A **hub** answers "which of these am I?"
> A **leaf** answers "will you do my specific job, and what does it cost?"

Every decision below comes out of that. If a section on a hub could be lifted onto a
leaf without editing, it is probably doing the leaf's job and should be cut back.

---

## Why this was needed

Before this template, all three hubs were leaf pages with a small link grid bolted in.
Below the grid they were ~85% identical to their own children: same How It Works, same
pricing, same Standard, same FAQ shell. The hub added nothing the child did not have.

Five breaks found 2026-08-24:

1. The hub grid was the weakest section on the page. `.svc-list--hub` is a 3-column
   grid; Commercial and Cleanouts had only **2 chips**, leaving a visible hole in a
   full-height dark band.
2. All three heroes were identical to each other and to the homepage. Same truck photo,
   same "Where We Fight Your Junk / For You."
3. `cleanout-services.html` had **no pricing section**; the other two did.
4. `commercial-junk-removal.html` still ran the old owner section, not the Brawler
   Standard variant.
5. Taxonomy was incoherent: `garage-cleanouts` sat under Residential, `office-cleanouts`
   under Commercial, so "Cleanout Services" held only estate + hoarder. The page name
   promised more than the page contained.

## What the search data said

Pulled from GSC, 90 days ending 2026-08-24:

| Page | Impressions | Clicks | Avg position |
|---|---|---|---|
| `commercial-junk-removal.html` | 134 | **0** | 29.3 |
| `residential-junk-removal.html` | 0 | 0 | — |
| `cleanout-services.html` | 0 | 0 | — |

Every real query landing on the commercial hub carries a city:
`commercial junk removal duluth ga`, `... marietta ga`, `commercial+junk+removal+alpharetta`,
`kennesaw`, `tucker ga`, `ball ground`. Nobody searches the bare head term.

All site clicks go to the homepage and the city pages.

**Conclusion:** these hubs are not search assets today. Their real job right now is
**internal** — route homepage and city-page visitors to the right leaf, and pass link
equity down. Design for the router job first; the head term is a later fight.

(The `commercial junk removal + city` demand is real and unserved. Tracked as separate
work, not part of this template.)

## What other people do

- **Junk King `/commercial`** — hero → 1-2-3 booking → why choose → how it works →
  offers → reviews → FAQ. **Zero sub-service links.** It is a leaf wearing a hub URL.
  Not a model.
- **1-800-GOT-JUNK nav** — the useful signal. *For Home* splits by **situation**
  (moving, renovation, storage, disasters, donation). *For Business* splits by
  **customer type** (property management, retail, construction, healthcare/education).
  Never by item. Segment by who the visitor is, not by what they are throwing away.
- **Junkluggers** — pushes commercial content into city pages rather than a national
  hub, which matches what JB's own query data looks like.
- **General SEO consensus** — hub carries breadth and routing, children carry depth and
  transactional longtails, links run both ways, and the deep detail lives on the child
  so hub and child do not compete.

---

## Section stack

Same section vocabulary as the homepage. Four deliberate departures from the leaf
template, marked ★.

| # | Section | Notes |
|---|---|---|
| 1 | Hero (`hero--cinematic`) | ★ Audience-specific tagline + subhead. Keyword H1 untouched. |
| 2 | Pain (`pain-section`) | Exactly ONE overarching fear. Per the standing pain-section rule. |
| 3 | **★ Router** (`hub-router`) | Replaces the chip grid. The signature hub section. Leaves never have it. |
| 4 | How it works (`hiw-section`) | Written at category level, not job level. |
| 5 | Pricing (`pricing-section`) | On all three. Same four numbers, framed for the audience. |
| 6 | Brawler Standard (`owner-section--standard`) | Dark variant, required off-homepage. |
| 7 | Reviews (`trust-quotes`) | Filtered to that audience. Strictly verbatim. |
| 8 | **★ FAQ** (`faq-section`) | Hub-level questions ONLY. See below. |
| 9 | Locations (`locations-hub`) | Unchanged. |
| 10 | Final CTA (`cta-final`) | Unchanged. |

### ★ 1. Hero

Keep the existing truck photography. Change only the tagline and subhead so the visitor
sees themselves. The `hero-eyebrow` H1 keeps its keyword and does not move.

| Hub | Tagline should evoke |
|---|---|
| Residential | Your house, your driveway, your Saturday back |
| Commercial | Your storefront/office, your hours, your customers not seeing it |
| Cleanouts | A whole property, and someone treating it carefully |

### ★ 3. The Router — the section that makes a hub a hub

Full cards, not chips. Each card is a small sales pitch for one child page:

```
┌──────────────────────────────────────┐
│ ESTATE CLEANOUTS                     │  ← child page name
│ This is you if: you are clearing a   │  ← the "which am I?" line
│ parent's home and nobody has time    │
│ to sort it.                          │
│ ─────────────────────────────────    │
│ "…"  — real review line, or a real   │  ← ONE strongest proof
│       number for this job            │
│ See estate cleanouts →               │  ← explicit CTA, not a bare chip
└──────────────────────────────────────┘
```

Rules:
- **"This is you if…" is mandatory.** It is the routing mechanism. Without it the card
  is a chip with more padding.
- **One proof per card**, and it must be real: a verbatim review line or a real number.
  No price words inside review quotes.
- **Explicit CTA text**, not just a linked title.
- Grid must look deliberate at 2, 3, and 4 cards. `.svc-list--hub` at
  `repeat(3,1fr)` does not — that is what leaves the hole on the 2-child hubs.
- Keep the existing `.svc-footnote` cross-link line under the grid.

**Cross-listing.** A child page may appear on two hubs. This fixes the taxonomy break
without building new pages. Primary children first, then a secondary row:

| Hub | Primary children | Cross-listed |
|---|---|---|
| Residential | appliance, mattress, hot tub, pool, shed & deck, garage | — |
| Commercial | office cleanouts, construction debris | — |
| Cleanouts | estate, hoarder | garage, office (as "smaller-scope cleanouts") |

Cross-listed cards carry a different framing line so the two hubs do not read as
duplicates of each other.

### ★ 8. FAQ — the anti-cannibalization lever

This is the main defense against hub and child competing for the same query.

- **Hub FAQ answers routing questions**: "Which service do I need?" "Is a garage
  cleanout the same as a full house cleanout?" "Do you charge differently for a
  business?"
- **Leaf FAQ answers job questions**: "Do you disconnect the fridge?" "What if the
  house still has family photos in it?"

If a question could live on either, it belongs on the leaf.

---

## Standing rules that still apply

- **No em dashes anywhere in JB copy.** Periods, commas, colons.
- **Quick-read body copy**: hero sub ~25-30 words, pain paragraph ~35-40 words.
- **Pain section**: homepage gets multiple bullets; service and location pages get
  exactly ONE overarching fear.
- **No truck-size claim** (17.8 cu yd, 4th of 5). **No tenure claim** (LLC is 2 years,
  not 3). **Reviews strictly verbatim.** **No price words in reviews.**
- **Brawler Standard positioning**: "franchise consistency without the franchise."
  Dark variant required off-homepage.
- Nine service pages still claim "owner on every job" and need the Standard rollout.
  `commercial-junk-removal.html` is one of them.
