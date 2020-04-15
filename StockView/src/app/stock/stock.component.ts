import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DataFeedService } from '../data-feed.service';
import { GoogleChartsModule } from 'angular-google-charts';


@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})

export class StockComponent implements OnInit {

  @Input()
  stockName: string;

  @Input()
  stockIndex: number;

  stockData: any;

  public chart = {
    title: this.stockName,
    type: 'LineChart',
    data: [['Loading...', 0]],
    columnNames: ['Price', 'Price'],
    options: {
      legend: { position: 'none' },
      chartArea: { left: 50, right: 5 },
      hAxis: { gridLines: { color: '#333', minSpacing: 20 } },
      vAxis: { baseline: null },
      colors: this.feed.lineColors.slice(this.stockIndex)
    },
    width: 1000,
    height: 1500,
    maxVal: 0.0, minVal: 0.0, last: 0.0, chg: 0.0, chgPct: 0.0, lastTime: '**',
    factor: 0.0,
    loaded: false
  };

public XXchart = {
    title: 'Styled Line Chart',
    type: 'LineChart',
    columns: [
      'Element',
      'Density',
      { type: 'number', role: 'interval' },
      { type: 'number', role: 'interval' },
      { type: 'string', role: 'annotation' },
      { type: 'string', role: 'annotationText' },
      { type: 'boolean', role: 'certainty' }
    ],
    data: [
      ['April', 1000, 900, 1100, 'A', 'Stolen data', true],
      ['May', 1170, 1000, 1200, 'B', 'Coffee spill', true],
      ['June', 660, 550, 800, 'C', 'Wumpus attack', true],
      ['July', 1030, null, null, null, null, false]
    ]
  };

public XXchart2 = {
    title: 'Browser market shares at a specific website, 2014',
    type: 'PieChart',
    data: [
      ['Firefox', 45.0],
      ['IE', 26.8],
      ['Chrome', 12.8],
      ['Safari', 8.5],
      ['Opera', 6.2],
      ['Others', 0.7]
    ],
    columnNames: ['Browser', 'Percentage'],
    options: {
    },
    width: 550,
    height: 400
  };


  public chartWrapperSpecs: google.visualization.ChartSpecs = {
    chartType: 'corechart',  //ChartType.AreaChart,
    dataTable: [
      ['SMR CV', 'US Cents/KG'],
      [new Date(1990, 1, 1), 10],
      [new Date(1991, 1, 1), 20],
      [new Date(1992, 1, 1), 40],
      [new Date(1993, 1, 1), 80],
      [new Date(1994, 1, 1), 160],
      [new Date(1995, 1, 1), 320],
      [new Date(1996, 1, 1), 640],
      [new Date(1997, 1, 1), 1280]
    ]
  };

  constructor(private feed: DataFeedService, private el: ElementRef) { }

  ngOnInit(): void {
    this.feed.getStockDataDaily(this.stockName, this.feed.range)
      .then(r => {
        this.feed.parseJson(r.stockData, this);
        if (this.chart.data == null) this.chart.title = '!!! Failed To Load  ' + this.stockName;
        this.chart.options.colors = this.feed.lineColors.slice(this.stockIndex)
      });
    //setTimeout(function () { alert(this.el); this.chart.width = this.el.nativeElement.offsetWidth - 50; }, 3000);
    //this.feed.getStockDataIntraday(this.stockName, 15)
    //  .then(r => { this.stockData = JSON.stringify(r); console.log(r); });
    this.feed.msgEvent.subscribe((data) => {
      this.feed.getStockDataDaily(this.stockName, this.feed.range)
        .then(r => {
          this.feed.parseJson(r.stockData, this);
          if (this.chart.data == null) this.chart.title = '!!! Failed To Load  ' + this.stockName;
        });
    });
  }

  ngAfterViewInit(): void {
    //this.chart.width = 500;  //this.el.nativeElement.offsetWidth - 50;
    window.dispatchEvent(new Event('resize'));
  }

  onResize(event) {
    //console.log(event.target.innerWidth);
    this.chart.width = event.target.innerWidth - 50;
  }

  onLoad(event) {
    //console.log('xxxx  ' + event.target.offsetWidth);
    //console.log(event.target);
    //this.chart.width = this.el.nativeElement.offsetWidth - 50;
  }



  //daily
  //console.log(res['chart']['result'][0]['timestamp'][0]);
  //console.log(res['chart']['result'][0]['indicators']['adjclose'][0]['adjclose'][0]);

  //intraday
  //console.log(res['chart']['result'][0]['timestamp'][0]);
  //console.log(res['chart']['result'][0]['indicators']['quote'][0]['close'][0]);

  /*
  parseJsonXX(data): void {
    let ts  = data['chart']['result'][0]['timestamp']; //timestamps
    let prc = data['chart']['result'][0]['indicators']['adjclose'][0]['adjclose']; //close price
    //console.log('PRICE[0]=' + prc[0]);
    //const zip = (ts, prc) => ts.map((t, i) => [this.getDateMonthDay(t), prc[i].toFixed(2)]);
    //const zip = (ts, prc) => ts.map((t, i) => [this.getDateMonthDay(t), prc[i] == null ? prc[i-1].toFixed(2):prc[i].toFixed(2)]);
    const zip = (a1, a2) => a1.map((v1, i) => [this.getDateMonthDay(v1), parseFloat(a2[i])]);
    this.stockData = zip(ts, prc);
    //console.log(this.stockData);
    this.chart.data = this.stockData;
    this.chart.maxVal = this.stockData[0][1];
    this.chart.minVal = this.stockData[0][1];
    for (let x of this.stockData)
    {
      if (x[1] > this.chart.maxVal) this.chart.maxVal = x[1];
      if (x[1] < this.chart.minVal) this.chart.minVal = x[1];
    }
    this.chart.last = this.stockData[this.stockData.length - 1][1];
    this.chart.title = this.stockName + '  ' + this.chart.last.toFixed(2) + '  (' + this.chart.minVal.toFixed(2) + ' - ' + this.chart.maxVal.toFixed(2) + ')';
  }

  getDateMonthDay(epoch: number):string {
    let dt = new Date(epoch * 1000);
    return dt.getMonth() + 1 + '-' + dt.getDate();
  }
  */

}
