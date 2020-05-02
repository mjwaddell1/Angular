import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataFeedService {

  //http://localhost:4200/?stocks=DIA,SPY,QQQ&range=6&refresh=5&baseline=0

  public stocks: string[] = ['DIA', 'SPY', 'QQQ', 'IWM']; //DOW, S&P500, Nasdaq, Russell 2k
  public range: number = 6;  //months
  public refreshRate: number = 10; //minutes
  public baseline: number = 0; //chart bottom
  public urlParams: any;  //chart settings
  public lineColors = [  //chart colors rotate
    'BlueViolet', 'ForestGreen', 'IndianRed', 'DarkCyan',
    'DarkOliveGreen', 'DarkOrchid', 'Brown', 'DarkOrange',
    'DarkSlateBlue', 'DarkViolet', 'DarkSeaGreen', 'GoldenRod'];

  private tmrCnt = 0;

  titleEvent: Subject<Object>;  //observable
  msgEvent: Subject<Object>;  //observable to triggering data refresh

  constructor(private http: HttpClient) {
    console.log(this.range + ' ' + this.tmrCnt);
    this.titleEvent = new Subject<Object>();
    this.msgEvent = new Subject<Object>();
    this.msgEvent.subscribe((data) => {
      this.range = parseInt(data.toString());
    });

    //params
    let queryString = window.location.search;
    this.urlParams = new URLSearchParams(queryString);
    if (this.urlParams.has('stocks') && this.urlParams.get('stocks') != '')
      this.stocks = this.urlParams.get('stocks').split(',');
    if (this.urlParams.has('range'))
      this.range = parseInt(this.urlParams.get('range'));
    if (this.urlParams.has('refresh'))
      this.refreshRate = parseInt(this.urlParams.get('refresh'));
    if (this.urlParams.has('baseline'))
      this.baseline = parseInt(this.urlParams.get('baseline'));

    //set refresh
    if (this.refreshRate > 0)
      setInterval(this.timerCheck, 60000, this); //check every minute
  }

  private timerCheck(svc): void {
    console.log('timer check ' + svc.tmrCnt + ' ' + svc.refreshRate);
    if (++svc.tmrCnt >= svc.refreshRate) {
      svc.tmrCnt = 0;
      console.log('trigger');
      svc.msgEvent.next(svc.range);  //trigger refresh
    }
}

  public getStockList():string[] {
    return this.stocks;
  }

  public getStockDataDailyMix(stks: string[], moCnt: number): Promise<any> {
    let results: any[] = [];
    let promiseList: Promise<any>[] = [];
    for (let s of stks) {
      promiseList.push(this.getStockDataDaily(s, moCnt));  //get single stock
    }
    return Promise.all(promiseList)
      .then(res => {
        res.map((r, i) => results.push(r));  //merge results
        return Promise.resolve(results);
      });
  }

  // curl "http://localhost:8080/?site=http://clicktocontinue.com/getwebdata.asp?https://query1.finance.yahoo.com/v7/finance/chart/DIA?range=1mo%26interval=1d%26indicators=quote%26includeTimestamps=true"
  // curl "http://localhost:8080/?site=https://query1.finance.yahoo.com/v7/finance/chart/DIA?range=1mo%26interval=1d%26indicators=quote%26includeTimestamps=true"

  public getStockDataDaily(stk: string, rng: number): Promise<any> {
    console.log('getStockDataDaily');
    let unit = rng > 0 ? 'mo' : 'd'; //if negative, then days
    //let apiURL = `https://query1.finance.yahoo.com/v7/finance/chart/${stk}?range=${moCnt}mo&interval=1d&indicators=quote&includeTimestamps=true`;
    //let apiURL = `http://c-c.com/getwebdata.asp?https://query1.finance.yahoo.com/v7/finance/chart/${stk}?range=${Math.abs(rng)}${unit}&interval=1d&indicators=quote&includeTimestamps=true`;
    let apiURL = `http://localhost:8080/?site=https://query1.finance.yahoo.com/v7/finance/chart/${stk}?range=${Math.abs(rng)}${unit}%26interval=1d%26indicators=quote%26includeTimestamps=true`;
    let promise = new Promise((resolve, reject) => {
      this.http.get(apiURL)
        .toPromise()
        .then(
        res => { // Success
            resolve({ stockName:stk, range: rng, stockData: res });
          },
          msg => { // Error
            console.log("ERROR:" + msg);
            reject(msg);
          }
        );
    });
    return promise;
  }

  public getStockDataIntraday(stk: string, interval: number): Promise<any> {
    //let apiURL = `https://query1.finance.yahoo.com/v7/finance/chart/${stk}?range=${moCnt}mo&interval=1d&indicators=quote&includeTimestamps=true`;
    let apiURL = `http://localhost:8080/?site=https://query1.finance.yahoo.com/v7/finance/chart/${stk}?range=1d&interval=${interval}m&indicators=quote&includeTimestamps=true`;
    let promise = new Promise((resolve, reject) => {
      this.http.get(apiURL)
        .toPromise()
        .then(
          res => { // Success
            resolve({ stockName: stk, moCnt: interval, stockData: res });
          },
          msg => { // Error
            console.log("ERROR:" + msg);
            reject(msg);
          }
        );
    });
    return promise;
  }

  public parseJson(data, chrtCmpt): void {
    if (!data.chart.result) { chrtCmpt.chart.data = null; return; }
    let ts = data['chart']['result'][0]['timestamp']; //timestamps
    let prc = data['chart']['result'][0]['indicators']['adjclose'][0]['adjclose']; //close price
    let vol = data['chart']['result'][0]['indicators']['quote'][0]['volume'];
    const zip = (a1, a2) => a1.map((v1, i) => [this.getDateMonthDay(v1), parseFloat(a2[i])]);
    let stkData = zip(ts, prc); //pair timestamp with price

    //set chart object data
    chrtCmpt.stockData = zip(ts, prc);
    chrtCmpt.chart.data = stkData; //this.stockData;
    chrtCmpt.chart.maxVal = stkData[0][1];
    chrtCmpt.chart.minVal = stkData[0][1];
    for (let x of stkData) {
      if (x[1] > chrtCmpt.chart.maxVal) chrtCmpt.chart.maxVal = x[1];
      if (x[1] < chrtCmpt.chart.minVal) chrtCmpt.chart.minVal = x[1];
    }
    let totVol = 0.0; //all days
    for (let x of vol)
      totVol += parseInt(vol);
    chrtCmpt.chart.avgVol = totVol / vol.length;
    chrtCmpt.chart.last = stkData[stkData.length - 1][1];
    chrtCmpt.chart.factor = chrtCmpt.chart.maxVal / chrtCmpt.chart.last;
    chrtCmpt.chart.chg = stkData[stkData.length - 1][1] - stkData[stkData.length - 2][1];
    chrtCmpt.chart.chgPct = chrtCmpt.chart.chg / stkData[stkData.length - 2][1] * 100.0;
    chrtCmpt.chart.lastTime = this.getTime(ts[ts.length - 1]);
    chrtCmpt.chart.info = chrtCmpt.chart.last.toFixed(2) + '  (' + chrtCmpt.chart.minVal.toFixed(2) + ' - ' + chrtCmpt.chart.maxVal.toFixed(2) + ')';
    chrtCmpt.chart.options.vAxis.baseline = this.baseline;
  }

  public parseJsonMulti(data, chrtCmpt, normalize = true): void {
    let ttl = '';
    let colNames = ['Price'];
    let ts = data[0]['stockData']['chart']['result'][0]['timestamp']; //timestamps
    let stkData = [];
    const zip = (a1, a2) => a1.map((v1, i) => v1.push(parseFloat(a2[i].toFixed(2))));

    //add time stamps from first result
    for (let x of data[0]['stockData']['chart']['result'][0]['timestamp'])
      stkData.push([this.getDateMonthDay(x)]);

    //add prices from each result
    for (let dset of data) {
      ttl += dset.stockName + ' '
      if (dset['stockData']['chart']['result']) {
        colNames.push(dset.stockName);
        zip(stkData, dset['stockData']['chart']['result'][0]['indicators']['adjclose'][0]['adjclose']);
      }
    }

    if (normalize) //range 0-100
    {
      //get max value from each result
      let maxnum = [0];
      for (let i = 1; i < stkData[0].length; i++) maxnum.push(stkData[0][i]);

      for (let r of stkData)
        for (let i = 1; i < r.length; i++)
          if (parseFloat(r[i]) > maxnum[i]) maxnum[i] = parseFloat(r[i]);

      for (let r of stkData)
        for (let i = 1; i < r.length; i++) {
          r[i] = parseFloat(r[i]) / maxnum[i] * 100;
        }
    }

    let totals: number[] = [];
    let totLast = 0.0;
    let avgLast = 0.0;
    chrtCmpt.columnNames = colNames; //does not work
    chrtCmpt.stockData = stkData;
    chrtCmpt.chart.data = stkData; //this.stockData;
    chrtCmpt.chart.maxVal = 100.0;  //parseFloat(stkData[0][1]);

    for (let x of stkData) {
      if (x[1] > chrtCmpt.chart.maxVal) chrtCmpt.chart.maxVal = x[1];
      if (x[1] < chrtCmpt.chart.minVal) chrtCmpt.chart.minVal = x[1];
    }
    //find min of portfolio
    let totMin = 99999999.0;
    for (let r = 0; r < stkData.length; r++) {
      let totRow = 0.0;
      for (let i = 1; i < stkData[r].length; i++) {
        totRow += stkData[r][i];
      }
      totals[r] = totRow; //sum all stocks
      if (totRow < totMin) totMin = totRow;
    }

    chrtCmpt.chart.minVal = totMin / (stkData[0].length - 1);

    avgLast = totals[totals.length - 1] / (stkData[stkData.length - 1].length - 1.0);

    //set chart object data
    chrtCmpt.chart.last = avgLast;
    chrtCmpt.factor = 100.0 / avgLast; //assume normalized
    chrtCmpt.chart.chg = (totals[totals.length - 1] - totals[totals.length - 2]) / (stkData[stkData.length - 1].length - 1.0);
    chrtCmpt.chart.chgPct = chrtCmpt.chart.chg / (totals[totals.length-2]/(stkData[stkData.length - 1].length - 1.0)) * 100.0;
    chrtCmpt.chart.lastTime = this.getTime(ts[ts.length - 1]);
    chrtCmpt.chart.info = chrtCmpt.chart.last.toFixed(2) + '  (' + chrtCmpt.chart.minVal.toFixed(2) + ' - ' + chrtCmpt.chart.maxVal.toFixed(2) + ')';
    chrtCmpt.chart.factor = 100.0 / avgLast;
    chrtCmpt.chart.options.vAxis.baseline = this.baseline;
 }

  getDateMonthDay(epoch: number): string {
    let dt = new Date(epoch * 1000);
    return dt.getMonth() + 1 + '-' + dt.getDate();
  }

  getTime(epoch: number): string {
    let dt = new Date(epoch * 1000);
    let z = (n) => (n < 10 ? '0' : '') + n; //add leading zero
    return dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + z(dt.getMinutes()) + ":" + z(dt.getSeconds()) 
  }
}
