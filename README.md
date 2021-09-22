# World Inequality Database

Data from [World Bank](https://www.worldbank.org)

## Links

- [API documentation](https://datahelpdesk.worldbank.org/knowledgebase/topics/125589-developer-information)
- [API basic call structures](https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures)

## Indicators

- CO2 emissions (code `EN.ATM.CO2E.PC`)
- Gini index World Bank estimate (code `SI.POV.GINI`)
- GDP (code `NY.GDP.MKTP.CD`)
- Unemployment (code `SL.UEM.TOTL.ZS`)
- Renewable energy consumption (code `EG.FEC.RNEW.ZS`)

### Example Query

`https://api.worldbank.org/v2/countries/all/indicators/<code>?format=json&date=<date>`

`http://api.worldbank.org/v2/country/<country_code>/indicators/<code>?format=json&date=<date>`
