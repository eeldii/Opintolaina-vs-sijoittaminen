
# Opintolaina vai sijoittaminen?

A Finnish-language calculator comparing immediate student-loan repayment with investing and repaying the loan in monthly instalments.

## Kommentit

Halusin selvittää, miten yksinkertainen säästöjen sijoittaminen S&P 500:aan vertaisi välittömään lainanlyhennykseen. Tässä yksinkertainen koodi, joka testaa teoriaa.

--> Tulokset riippuivat vahvasti valitusta ajanjaksosta.
<img width="1290" height="592" alt="image" src="https://github.com/user-attachments/assets/ea363fb3-0ef0-4950-b78a-2bcf6dbc71e6" />
<img width="1300" height="589" alt="image" src="https://github.com/user-attachments/assets/6f916913-daf7-4e93-bfa1-90a32a9480dd" />


## Features

- Pure black background, colored strategy lines and expandable monthly calculation records.
- Shared savings, debt and total monthly payment for both strategies.
- Historical S&P 500 price returns or a custom effective annual return, including negative values.
- Optional scenario investing the newly borrowed student loan as well as savings. Both strategies receive the same opening resources.
- Separate month/year selections containing only **2000–2026** in both return modes.
- Finnish sale-tax estimate is **off by default**, with an optional checkbox to enable it.
- Input explanations are **hidden by default** and controlled by the “Näytä ohjetekstit” toggle.

## Open locally

Open `index.html` in a browser. All runtime code, styles and historical data are embedded in this file. External source links require internet access only when opened.

## Model and data limits

Historical returns use an embedded price-index snapshot through September 2026. Dividends and EUR/USD exchange-rate effects are excluded: USD percentage changes are applied to euro inputs. This is not the actual EUR total return of an investable fund. The Finnish tax estimate is bounded and applies the documented rules hypothetically; it does not calculate a complete personal tax return. A custom investment return is an assumption, not a promise.

See [SPEC.md](SPEC.md) for the calculation model, event timing, Finnish sources, tax assumptions and revision history. See [DATA-SOURCES.md](DATA-SOURCES.md) for market-data provenance and licensing.
