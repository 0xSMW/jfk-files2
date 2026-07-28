# JFK Files 2025 — LLM Analysis & Explorer

Structured LLM analysis of the **2025 JFK Assassination Records** release: roughly **2,560 documents** turned into searchable JSON summaries, about **1,850 cross-document entity profiles**, and a Next.js explorer for browsing documents, people, and relationships. The goal is to make a dense multi-agency dump navigable for researchers and the public — not to declare a single theory of the assassination.

## Key findings from this corpus

These observations come from the structured extractions in `json/2025/`, the entity layer in `json/entity_summaries/`, and the deeper batch write-up in [`md/analysis-april-release-2025.md`](md/analysis-april-release-2025.md). Counts are approximate (LLM fields, OCR, and agency name variants introduce noise). Treat this as a **finding aid**, not a verdict.

### Shape of the release

The 2025 batch is **not primarily a pile of “who shot JFK” dockets**. After normalizing classifications:

| Theme (normalized) | ~Docs |
| --- | ---: |
| Cuba | 593 |
| Personnel | 467 |
| JFK Assassination (incl. related labels) | 358 |
| Administrative | 305 |
| Operations | 179 |
| Liaison / Security / Mexico / Commission | ~500 combined |

**Agency mix** (origin agency, name-normalized): **CIA ~1,160**, **NSA ~215**, **FBI ~210**, **INSCOM ~120**, **HSCA ~115**, with hundreds missing or unparsed. **HSCA payroll and administrative paper** is a real slice of the dump — the *process* of reinvestigation, not only operational content.

**Time distribution** has a double peak: **1963** is the single largest year (~450 dated docs), then the **mid/late-1970s oversight era** (1975 and 1978 each ~165–170). Roughly half of dated records fall in the 1960s; another large block is 1970s Church Committee / HSCA material. The corpus is “Cold War operations + later accountability,” not only Dealey Plaza.

**Security markings** (normalized): mostly **SECRET** (~1,450), then Unclassified (~600), Top Secret (~215), plus smaller Confidential and compartmented sets (e.g. TOP SECRET UMBRA).

**Soft analytical flags:** only about **114 documents** (~4%) received a non-empty `conspiracy` field (optional: material that *might* clarify who / why / how). Only **9** received an `allies` field. Most pages are machinery of intelligence, liaison, personnel, and oversight.

### Substantive threads worth starting with

1. **NSA post-assassination SIGINT** — Intercepts and summaries of foreign diplomatic and Cuban military/diplomatic traffic in the hours and days after 22 November 1963 (alerts, stand-downs, Castro messaging, international speculation). Expands *immediate international situational awareness* more than it rewrites a domestic shooter narrative. See the file clusters and discussion in [`md/analysis-april-release-2025.md`](md/analysis-april-release-2025.md) (many records in the `144-…` series).

2. **Mexico City process detail** — Internal material on Oswald’s Soviet/Cuban embassy contacts, reporting to the FBI, Warren Commission access to **transcripts** (recordings routinely not retained), and non-Oswald photographic coverage. Useful for addressing perennial “withheld tapes / misidentified photos” claims with primary-process language rather than secondary summary. Discussed in the April analysis (e.g. around `135-10001-10276`).

3. **Anti-Castro / CIA operational adjacency** — Including deposition material such as Frank Sturgis on a 1961 approach (via Bernard Barker) to discuss assassination methods; authorization and corroboration remain murky. Enriches the CIA–exile–underworld neighborhood with operational color, not a courtroom case. See e.g. `135-10001-10288`, `135-10001-10253` and the April write-up.

4. **PFIAB minutes (roughly 1962–1964)** — Board-level anxiety about Missile Crisis intelligence, NRO management, agent penetration vs. photo reliance, McCone/oversight friction, and security failures (e.g. Dunlap, Moscow Embassy). Institutional self-critique sitting next to the assassination window. Series often under `206-…`.

5. **Organized-crime surveillance density** — Figures such as Roselli, Trafficante, and Mannarino tracked at hotel, associate, and financial granularity via informants and technical coverage. Shows *how* the Bureau watched mob figures adjacent to Cuba/Castro-plot history even when a given file does not “solve JFK.”

6. **Why delay can look structural** — Across the batch, plausible holdback drivers recur: **SIGINT equities**, **CIA sources/methods**, **FBI informant protection**, **foreign-government content**, and **multi-agency equities** — not only a single smoking-gun page. Spelled out with examples in the April analysis.

### Who shows up most in *this* graph

High-frequency **tags/themes** in entity summaries include CIA, Cuba, FBI, HSCA, NSA, clandestine/anti-Castro activity, and FOIA process. Among people and roles with high document degree: **Lee Harvey Oswald**, **Fidel Castro**, **Richard Helms**, **John McCone**, **Allen Dulles**, **William K. Harvey**, **Lyndon B. Johnson**, **J. Edgar Hoover**, and a large **HSCA-era** cluster (e.g. Louis Stokes, Richard Sprague, G. Robert Blakey). Start from `json/entity_summaries/` or the explorer’s entity pages.

### Deep dive example

**John Garrett Underhill Jr.** — CIA-adjacent arms expert, *Ramparts* allegations about a “CIA clique,” contested death — is a good rabbit hole that combines one memorandum, broader biography, and how the schema’s optional `conspiracy` field surfaces allegations without endorsing them.

- Document: [`json/2025/104-10170-10145.json`](json/2025/104-10170-10145.json) (and matching markdown under `md/2025/`)
- Biography: [`md/j-underhill-bio.md`](md/j-underhill-bio.md)

---

## Explore the data

| Path | What you get |
| --- | --- |
| [`jfk-explorer/`](jfk-explorer/) | Next.js app: document list/filters, entity pages, relationship graph |
| [`json/2025/`](json/2025/) | Per-document structured analysis (~2,558 JSON files) |
| [`md/2025/`](md/2025/) | Markdown text of the same records (OCR/converted) |
| [`json/entity_summaries/`](json/entity_summaries/) | Cross-document entity profiles (~1,845) |
| [`md/analysis-april-release-2025.md`](md/analysis-april-release-2025.md) | Batch-level narrative: entity clusters, novel threads, delay hypotheses |
| [`md/2025-new/`](md/2025-new/) | Additional / later markdown batch (~380 files) |

### Run the explorer locally

```bash
cd jfk-explorer
pnpm install   # or npm install
pnpm dev       # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app redirects to the documents browser. Static analysis JSON lives under `jfk-explorer/public/json/` (a published subset of the full `json/` tree).

### Open a single record

Each document id maps across formats, for example:

```text
md/2025/104-10170-10145.md
json/2025/104-10170-10145.json
```

---

## Corpus at a glance

| Metric | Approx. value |
| --- | --- |
| Documents with JSON + MD | ~2,558 |
| Entity summaries | ~1,845 |
| Documents with `conspiracy` filled | ~114 |
| Peak year | 1963 |
| Secondary peaks | 1975, 1978 (oversight era) |
| Leading origin agency | CIA |
| Leading theme | Cuba / ops / personnel, then assassination investigation |

Document-level extraction used **Google Gemini** against a fixed JSON schema (`scripts/schema.json`). Entity summaries roll up mentions across documents (`scripts/schema_entity.json`, `scripts/entity-analysis.py`, clustering in `scripts/entity-cluster.py`).

---

## How the analysis was built

```text
Source PDFs / archives
    → download scripts
    → PDF → markdown (pdf-2-md)
    → per-doc Gemini extraction (schema.json)
    → entity extraction, clustering, summaries
    → optional explorer publish under jfk-explorer/public
```

**Per document**, the model is asked for consistent fields: title, type, classification category, security level, date, agencies/parties, persons and locations, tags, short and long summaries, and a security-sensitivity note. Two **optional** fields are only filled when warranted:

- `conspiracy` — only if the document appears to clarify or expand understanding of who killed JFK, why, or how (otherwise omitted)
- `allies` — only if the document appears to contain damaging material about U.S. treatment of allies (otherwise omitted)

**Entities** merge variant names where clustering succeeds and produce a short significance write-up plus document id lists so you can jump from a person or tag back into the file set.

### Example document record (trimmed)

```json
{
  "title": "Ramparts: John Garrett UNDERHILL Jr., Samuel George CUMMINGS, and INTERARMCO",
  "document_type": "Memorandum",
  "classification": "John F. Kennedy Assassination",
  "security_level": "SECRET",
  "date": "1967-07-19",
  "tags": ["CIA", "JFK Assassination", "Ramparts", "John Garrett Underhill Jr."],
  "summary": "This memorandum discusses a Ramparts article linking John Garrett Underhill Jr. ...",
  "persons_mentioned": ["John Garrett Underhill Jr.", "Samuel George Cummings", "Lee Harvey Oswald"],
  "conspiracy": "The document references allegations from a Ramparts article suggesting that a CIA clique..."
}
```

Full field definitions: [`scripts/schema.json`](scripts/schema.json) and [`scripts/schema_entity.json`](scripts/schema_entity.json).

---

## Repository layout

```text
json/2025/                 Per-document analysis JSON
json/entity_summaries/     Entity rollups
md/2025/                   Markdown document text
md/2025-new/               Additional markdown batch
md/analysis-april-release-2025.md
md/j-underhill-bio.md
scripts/                   Acquire, convert, extract, cluster, clean
jfk-explorer/              Next.js browser (documents, entities, graph)
```

### Scripts by stage

| Stage | Scripts |
| --- | --- |
| Acquire | `download_2025.py`, `download_archives.py`, link lists |
| Convert | `pdf-2-md.py`, `process_jfk_files.sh` |
| Extract | `generate_json_summary.py` (Gemini + `schema.json`) |
| Entities | `entity-analysis.py`, `entity-cluster.py` |
| Quality / filter | `find_dupes.py`, `remove_1992_files.py`, `clean.sh` |
| Ad hoc analysis | `analyze-april-release-2025.py` |

---

## Reproducing or extending

1. Obtain source documents (or use existing `md/` text).
2. Set up Google GenAI credentials required by the extraction scripts.
3. Convert new PDFs to markdown if needed (`scripts/pdf-2-md.py`).
4. Run document extraction (`scripts/generate_json_summary.py` / your pipeline entrypoint).
5. Rebuild entity summaries and clusters when the document set changes.
6. Copy or sync JSON into `jfk-explorer/public/json/` if you want the UI to see new files.

Expect **API cost and wall time** at multi-thousand-document scale. Prefer incremental runs and de-duplication (`find_dupes.py`) before re-extracting everything.

---

## Limitations

- **LLM extraction errs.** Titles, dates, agencies, and person lists can be wrong, incomplete, or inconsistently normalized (`CIA` vs `Central Intelligence Agency`, date typos, OCR garbage).
- **`conspiracy` / `allies` are soft flags**, not proof. Empty does not mean irrelevant; filled does not mean established fact.
- **Entity clustering is imperfect.** The same person may appear under multiple slugs; some high-count “entities” are roles or administrative labels.
- **Explorer ≠ full tree.** Counts under `jfk-explorer/public/json/` can lag the root `json/` directories.
- **Not a substitute for primary-source reading.** Always open the markdown (and ultimately NARA originals) before citing.

---

## Contributing

Improvements welcome: better entity merges, corrected extractions, additional analysis write-ups, explorer UX, and schema refinements. Prefer pull requests that keep analytical claims **cited** (record ids / paths) and clearly separate document content from model-derived summary.

## License

Intended as **MIT**. Source documents remain subject to their originating agencies and the JFK Records Collection release terms; this repository’s value-add is the analysis pipeline, structured metadata, and explorer code.
