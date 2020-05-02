import { Component, OnInit, Input } from '@angular/core';
import { DataFeedService } from '../data-feed.service';

@Component({
  selector: 'app-stock-mix',
  templateUrl: './stock-mix.component.html',
  styleUrls: ['./stock-mix.component.css']
})
export class StockMixComponent implements OnInit {

  @Input()
  stockName: string;

  stockData: any;

  public chart = {
    title: 'Mixed',
    info: '',
    type: 'LineChart',
    data: [['Loading...', 0]],
    columnNames: ['Price', ...this.feedsvc.stocks],   //['Price', 'MFA', 'NCLH', 'CHEF'],
    options: {
      legend: { position: 'top' },
      title: { position: 'top' },
      chartArea: { left: 50, right: 5 },
      hAxis: { gridLines: { color: '#333', minSpacing: 20 } },
      vAxis: { baseline: null },
      colors: this.feedsvc.lineColors
    },
    width: 1000,
    height: 1500,
    maxVal: 0.0, minVal: 0.0, last: 0.0, chg: 0.0, chgPct: 0.0, lastTime: '**',
    factor: 0.0,
    avgVol: 0.0,
    loaded: false
  };

  constructor(private feedsvc: DataFeedService) {}

  ngOnInit(): void {
    //get chart data
    this.feedsvc.getStockDataDailyMix(this.feedsvc.stocks, this.feedsvc.range).then(r => {
      this.feedsvc.parseJsonMulti(r, this);
      window.dispatchEvent(new Event('resize')); //chart object does not resize automatically
      this.chart.loaded = true; //show chart
      this.feedsvc.titleEvent.next('SV ' + this.chart.chgPct.toFixed(2) + '%');
    });

    this.feedsvc.msgEvent.subscribe((data) => {
      this.feedsvc.getStockDataDailyMix(this.feedsvc.stocks, this.feedsvc.range)
        .then(r => {
          this.feedsvc.parseJsonMulti(r, this);
          window.dispatchEvent(new Event('resize'));

          this.feedsvc.titleEvent.next('SV ' + this.chart.chgPct.toFixed(2) + '%'); //trigger observable
        });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(()=> window.dispatchEvent(new Event('resize')), 500);
  }

  onResize(event) {
    this.chart.width = event.target.innerWidth - 50;
  }

  onLoad(event) {
    this.chart.width = event.target.innerWidth - 50;
    this.feedsvc.titleEvent.next('SV');
  }
}
