# Market-data sources

- Snapshot: `sp500-source.csv`, downloaded 15 November 2026.
- Provider: [DataHub: S&P 500](https://datahub.io/core/s-and-p-500).
- Download: [CSV source](https://datahub.io/core/s-and-p-500/_r/-/data/data.csv).
- Original historical compilation: [Robert Shiller / Yale](https://www.econ.yale.edu/~shiller/data.htm).
- Recent price extension: [FRED S&P 500](https://fred.stlouisfed.org/series/SP500).
- DataHub's stated dataset license: [Open Data Commons Public Domain Dedication and License 1.0](https://opendatacommons.org/licenses/pddl/1-0/).

Data attribution and the dataset license above concern the market data, not a separate license grant for this project's application code.

The source snapshot contains 1,869 monthly observations from January 1871 through September 2026. The user interface restricts comparison start years to 2000 or later. Older data is retained for source integrity and regression checks. Pre-1957 observations describe predecessor indices; the old series uses monthly averages. Recent extension rows have no dividend information.

The calculator uses only the price column: monthly return = current index price / previous index price − 1. It excludes dividends, inflation and exchange-rate effects. It does not present this as an actual EUR-denominated fund return.

`sp500-data.mjs` records the source URLs, snapshot date and SHA-256 of the CSV. `prepare-market-data.mjs` validates positive prices and consecutive months before regenerating the embedded module. Runtime calculations make no network requests.
