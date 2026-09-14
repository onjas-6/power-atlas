# Power Atlas

An interactive, source-backed atlas of electricity use: countries, cities, AI infrastructure and the companies behind it.

**Website:** https://power-atlas.jason62-h.chatgpt.site

Inspired by [Dylan Patel's conversation with Dwarkesh Patel](https://www.youtube.com/watch?v=aV26V1UvkJw&t=365s), with the interview's capacity extrapolation presented as an adjustable scenario rather than a forecast.

## Explore

- A playable 2025–2030 time axis, with scrub, pause/replay and playback speed. IEA global AI and the conditional Dwarkesh lab scenario share a chart; numerical values and city-equivalent squares update together.
- A 1,000-tile world view showing the AI share, with a switch to data centres alone.
- 38 reference entities, including 26 countries and five cities. Linear bars and area-proportional squares put them on a shared scale.
- Annual electricity in TWh and average power in GW.
- IEA's 2025–2030 outlook, alongside reported Google, Microsoft and Meta histories.
- A capacity simulator with electrical load, IT/facility boundaries and cooling overhead.
- The full physical chain, including the stages where AI-specific data is still missing.
- A bibliography with 19 source records, reporting boundaries and downloadable CSV data.

## Run locally

No build step, dependencies or API keys are required. Use Python 3:

```sh
python3 -m http.server 4173 --directory dist
```

Then open http://localhost:4173. Serve over HTTP: opening index.html directly may prevent the dataset from loading.

## Project structure

```text
dist/index.html     Page structure and explanatory text
dist/styles.css     Responsive visual design
dist/app.js         Interactive charts and calculations
dist/timeline-model.js Scenario math
dist/timeline.js    Animation and timeline controls
dist/timeline.css   Timeline styling
dist/data.json      Entities, annual series, provenance and forecast endpoints
dist/data.csv       Downloadable entity data
scripts/validate.py Data and asset consistency checks
.openai/hosting.json Sites static hosting configuration
```

The website is static and can also be hosted by any service that serves `dist/`. It uses no analytics, cookies or server-side data storage. Google Fonts supplies optional web fonts, with system fallbacks.

## Data and methodology

Research snapshot: **14 September 2026**. This is a curated educational comparison, not a real-time meter or a harmonised global accounting system.

- World electricity demand: 31,772.35 TWh in 2025, from Ember via Our World in Data. National totals include system losses.
- AI-focused data centres: 155 TWh in 2025, from IEA estimates reported by Our World in Data. This facility-based proxy includes cooling and supporting equipment; it is not an exact sum of all AI workloads.
- All data centres: 485 TWh in 2025; IEA's 2030 base case is approximately 950 TWh, including 465 TWh AI-focused. Intermediate years use constant compound interpolation and are explicitly labelled illustrations.
- City figures have different boundaries. Shanghai and Beijing cover their administrative municipalities. Singapore's city reference is final consumption, distinct from the national demand series. London uses metered consumption; NYC uses a rounded annual benchmark.
- Company values cover all operations, not AI alone. Microsoft reports fiscal years ending 30 June; Google and Meta use calendar years. Google's historical series is the restated one in its 2026 report.
- Announced GW agreements are not measured annual TWh. Shared infrastructure can appear in both a provider's and a customer's announcements, so these must not be summed.
- Electricity is distinct from primary energy, carbon emissions, contracted renewable energy and power capacity. Missing AI allocation is shown as unknown, never zero.

See `sources` in `dist/data.json` and the site's bibliography for original URLs and source-specific notes.

### Calculations

```text
Average GW = TWh × 1,000 / hours in the reporting year
Scenario TWh = IT GW × electrical load fraction × PUE × 8,760 / 1,000
Scenario TWh = whole-facility GW × electrical load fraction × 8,760 / 1,000
Comparison square side = maximum side × sqrt(value / maximum value)
```

Reported 2024 periods, including FY2024, use 8,784 hours. Annualised or rounded benchmarks use 8,760. National shares use the matching year's world demand. Scenario comparisons use a fixed 2025 world baseline and a full operating year; they do not model a construction ramp. Cooling must not be added again to whole-facility totals.

### Updating

Update the values, periods, scope and sources together in `dist/data.json`; refresh `dist/data.csv` to match. Some baseline and explanatory values are also present in `dist/app.js` and `dist/index.html`, so update them consistently. Keep scenarios separate from reported values, preserve company reporting periods and restatements, and never allocate all supplier electricity to AI without evidence.

Validate before publishing:

```sh
python3 scripts/validate.py
node --check dist/app.js
node --check dist/timeline.js
node scripts/validate-timeline.cjs
```

Manual validation covered desktop and 390-pixel mobile layouts, world/data-centre scope, categories, unit conversion, comparisons, company history, the year slider, scenario presets and facility boundaries, PUE and source expansion. Native controls are keyboard accessible; charts have text equivalents, and reduced motion is respected.

## License

Original code and design are MIT licensed; see [LICENSE](LICENSE). Third-party reports and source datasets retain their original rights and attribution requirements. In particular, Ember data is CC BY 4.0 and Our World in Data material carries its stated CC BY attribution. No full third-party reports are redistributed in this repository.

Created with GPT-6 in Codex, September 2026.

### Animated scenario

The orange timeline applies 6, 18 and 54 GW **per lab** at end-2026, end-2027 and end-2028. Default: two labs, 80% average electrical load and 1.2 PUE, yielding approximately 100.9, 302.7 and 908.2 TWh/year. These are full-year run rates at year-end capacity, not measured consumption in those calendar years. The orange path is never extrapolated outside 2026–2028; it is not added to the global IEA series. Interpolation is exponential between anchors. All shares use a fixed 2025 world denominator. Playback is opt-in, stops at the endpoint and pauses when the page is hidden. Native year buttons offer an alternative to motion.
