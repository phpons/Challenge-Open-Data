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

## Gitlab CI

The gitlab CI checks the HTML, CSS and Javascript files.

### W3C standards

This job checks that the HTML file corresponds to the W3C standards. To run this command locally you need:
- `bash`
- `curl`
- `jq`

Then you can run the following command:
```shell
bash ci/w3c-html-validation.sh
```

### Linting

To run these tests locally you need to install [Node](https://nodejs.org).

#### HTML

To launch the linter on the HTML file you have to install:
- `html-linter` with `npm install -g html-linter`

Then you can run the following command:
```shell
html-linter --config .htmllintrc.json
```

#### CSS

To launch the linter on the CSS files you have to install:
- `stylelint` with `npm install -g stylelint`
- `stylelint-config-standard` with `npm install --save-dev stylelint-config-standard`

Then you can run the following command:
```shell
stylelint src/css/
```

#### Javascript

To launch the linter on the Javascript files you have to install:
- `eslint` with `npm install -g eslint`
- `eslint-config-standard` with `npm install --save-dev eslint-config-standard`

Then you can run the following command:
```shell
eslint src/js/
```
