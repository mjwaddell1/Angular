import { Injectable } from '@angular/core';
import { promise } from 'protractor';
import { HttpClient } from '@angular/common/http';
import { resolve } from 'url';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataFeedService {


  //http://localhost:4200/?stocks=DIA,SPY,QQQ&range=6&refresh=5&baseline=0


  public stocks: string[] = ['MFA', 'NCLH', 'ERI', 'SPY'];
  public range: number = 6;  //months
  public refreshRate: number = 10; //minutes
  public urlParams: any;
  public lineColors = ['BlueViolet', 'ForestGreen', 'IndianRed', 'DarkCyan', 'DarkOliveGreen', 'DarkOrchid', 'Brown', 'DarkOrange', 'DarkSlateBlue', 'DarkViolet', 'DarkSeaGreen','GoldenRod'];

  private tmrCnt = 0;

  msgEvent: Subject<Object>;

  constructor(private http: HttpClient) {
    console.log(this.range + ' ' + this.tmrCnt);
    this.msgEvent = new Subject<Object>();
    this.msgEvent.subscribe((data) => {
      this.range = parseInt(data.toString());
    });

    //params
    let queryString = window.location.search;
    this.urlParams = new URLSearchParams(queryString);
    if (this.urlParams.has('stocks'))
      this.stocks = this.urlParams.get('stocks').split(',');
    if (this.urlParams.has('range'))
      this.range = parseInt(this.urlParams.get('range'));
    if (this.urlParams.has('refresh'))
      this.refreshRate = parseInt(this.urlParams.get('refresh'));

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
    return Promise.all(promiseList).then(res => { res.map((r, i) => results.push(r)); return Promise.resolve(results); });
  }

  public getStockDataDaily(stk: string, moCnt: number): Promise<any> {
    console.log('getStockDataDaily');
    //let apiURL = `https://query1.finance.yahoo.com/v7/finance/chart/${stk}?range=${moCnt}mo&interval=1d&indicators=quote&includeTimestamps=true`;
    let apiURL = `http://clicktocontinue.com/getwebdata.asp?https://query1.finance.yahoo.com/v7/finance/chart/${stk}?range=${moCnt}mo&interval=1d&indicators=quote&includeTimestamps=true`;
    let promise = new Promise((resolve, reject) => {
      this.http.get(apiURL)
        .toPromise()
        .then(
        res => { // Success
          //console.log(res['chart']['result'][0]['timestamp'][0]);
          //console.log(res['chart']['result'][0]['indicators']['adjclose'][0]['adjclose'][0]);
            resolve({ stockName:stk, moCnt: moCnt, stockData: res });
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
    let apiURL = `http://clicktocontinue.com/getwebdata.asp?https://query1.finance.yahoo.com/v7/finance/chart/${stk}?range=1d&interval=${interval}m&indicators=quote&includeTimestamps=true`;
    let promise = new Promise((resolve, reject) => {
      this.http.get(apiURL)
        .toPromise()
        .then(
          res => { // Success
            //console.log(res['chart']['result'][0]['timestamp'][0]);
            //console.log(res['chart']['result'][0]['indicators']['quote'][0]['close'][0]);
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
    const zip = (a1, a2) => a1.map((v1, i) => [this.getDateMonthDay(v1), parseFloat(a2[i])]);
    let stkData = zip(ts, prc);
    chrtCmpt.stockData = zip(ts, prc);
    chrtCmpt.chart.data = stkData; //this.stockData;
    chrtCmpt.chart.maxVal = stkData[0][1];
    chrtCmpt.chart.minVal = stkData[0][1];
    for (let x of stkData) {
      if (x[1] > chrtCmpt.chart.maxVal) chrtCmpt.chart.maxVal = x[1];
      if (x[1] < chrtCmpt.chart.minVal) chrtCmpt.chart.minVal = x[1];
    }
    chrtCmpt.chart.last = stkData[stkData.length - 1][1];
    chrtCmpt.chart.chg = stkData[stkData.length - 1][1] - stkData[stkData.length - 2][1];
    chrtCmpt.chart.chg = stkData[stkData.length - 1][1] - stkData[stkData.length - 2][1];
    chrtCmpt.chart.chgPct = chrtCmpt.chart.chg / stkData[stkData.length - 1][1] * 100.0;
    chrtCmpt.chart.lastTime = this.getTime(ts[ts.length - 1]);
    chrtCmpt.chart.title = chrtCmpt.stockName + '  ' + chrtCmpt.chart.last.toFixed(2) + '  (' + chrtCmpt.chart.minVal.toFixed(2) + ' - ' + chrtCmpt.chart.maxVal.toFixed(2) + ')';
    if (this.urlParams.has('baseline'))
      chrtCmpt.chart.options.vAxis.baseline = parseInt(this.urlParams.get('baseline'));
  }

  public parseJsonMulti(data, chrtCmpt, normalize = true): void {
    let ttl = "";
    let colNames = ['Price'];
    let ts = data[0]['stockData']['chart']['result'][0]['timestamp']; //timestamps
    //let prc = data['stockData']['chart']['result'][0]['indicators']['adjclose'][0]['adjclose']; //close price
    let stkData = [];
    const zip = (a1, a2) => a1.map((v1, i) => v1.push(parseFloat(a2[i].toFixed(2))));
    //add time stamps
    for (let x of data[0]['stockData']['chart']['result'][0]['timestamp'])
      stkData.push([this.getDateMonthDay(x)]);
    //add prices
    for (let dset of data) {
      ttl += dset.stockName + ' '
      if (dset['stockData']['chart']['result']) {
        colNames.push(dset.stockName);
        zip(stkData, dset['stockData']['chart']['result'][0]['indicators']['adjclose'][0]['adjclose']);
      }
    }

    if (normalize) //range 0-100
    {
      //console.log(stkData);
      let maxnum = [0];
      for (let i = 1; i < stkData[0].length; i++) maxnum.push(stkData[0][i]);

      for (let r of stkData)
        for (let i = 1; i < r.length; i++)
          if (parseFloat(r[i]) > maxnum[i]) maxnum[i] = parseFloat(r[i]);
      //console.log(maxnum);
      for (let r of stkData)
        for (let i = 1; i < r.length; i++) {
          //console.log(r);
          r[i] = parseFloat(r[i]) / maxnum[i] * 100;
        }
    }

    chrtCmpt.columnNames = colNames; //does not work
    chrtCmpt.stockData = stkData;
    chrtCmpt.chart.data = stkData; //this.stockData;
    chrtCmpt.chart.maxVal = parseFloat(stkData[0][1]);
    chrtCmpt.chart.minVal = parseFloat(stkData[0][1]);
    for (let x of stkData) {
      if (x[1] > chrtCmpt.chart.maxVal) chrtCmpt.chart.maxVal = x[1];
      if (x[1] < chrtCmpt.chart.minVal) chrtCmpt.chart.minVal = x[1];
    }
    chrtCmpt.chart.last = parseFloat(stkData[stkData.length - 1][1]);
    chrtCmpt.chart.lastTime = this.getTime(ts[ts.length - 1]);
    chrtCmpt.chart.title = ttl; //chrtCmpt.stockName + '  ' + chrtCmpt.chart.last.toFixed(2) + '  (' + chrtCmpt.chart.minVal.toFixed(2) + ' - ' + chrtCmpt.chart.maxVal.toFixed(2) + ')';
    if (this.urlParams.has('baseline'))
      chrtCmpt.chart.options.vAxis.baseline = parseInt(this.urlParams.get('baseline'));
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
