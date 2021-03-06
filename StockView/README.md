# StockView

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.0.

After deployment, StockView page can be launched with parameters:    
http://www.YourSite.com/StockView/?range=6&refresh=5&baseline=0&stocks=DIA,SPY,QQQ,AAPL,MSFT

Parameters:    
&nbsp;&nbsp;&nbsp;&nbsp;range=6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<-- Default range 6 months   
&nbsp;&nbsp;&nbsp;&nbsp;refresh=5&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<-- Refresh data every 5 minutes   
&nbsp;&nbsp;&nbsp;&nbsp;baseline=0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<-- Chart Y-axis begins at zero    
&nbsp;&nbsp;&nbsp;&nbsp;stocks=DIA,SPY&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<-- Stocks to display    

To deploy into a site subfolder, use the base-href option:    
`ng build --prod --base-href=/StockView/`

First chart combines all stocks into a normalized (0-100) range.

The charts are from Google Charts (line chart) using the [angular-google-charts](https://github.com/FERNman/angular-google-charts) library.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Server Redirect
Angular will throw a CORS error if loading data from an external site. A way around this is to provide a redirect endpoint on your local server. This project uses a small js server (StockView/server/server.js) for calling http://localhost:8080/?site=<data feed call> instead of calling the data feed directly. The local server adds an Access-Control-Allow-Origin header to allow the feed to work. The redirect only works with GET calls.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

To deploy into a site subfolder, use the base-href option:     
`ng build --prod --base-href=/StockView/`

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
