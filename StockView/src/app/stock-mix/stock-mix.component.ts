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
    type: 'LineChart',
    data: [['Loading...', 0]],
    columnNames: ['Price',...this.feed.stocks],   //['Price', 'MFA', 'NCLH', 'CHEF'],
    options: {
      legend: { position: 'top' },
      title: { position: 'none' },
      chartArea: { left: 50, right: 5 },
      hAxis: { gridLines: { color: '#333', minSpacing: 20 } },
      vAxis: { baseline: null },
      colors: this.feed.lineColors
    },
    width: 1000,
    height: 1500,
    maxVal: 0, minVal: 0, last: 0,
    loaded: false
  };

  constructor(private feed: DataFeedService) {}

  ngOnInit(): void {
    //this.feed.getStockDataDaily(this.stockName, 6)
    //  .then(r => { this.feed.parseJson(r, this); });
    //this.feed.getStockDataIntraday(this.stockName, 15)
    //  .then(r => { this.stockData = JSON.stringify(r); console.log(r); });
    //this.feed.getStockDataDailyMix(['MFA', 'NCLH', 'CHEF'], 6).then(r => { this.stockData = JSON.stringify(r); console.log('res='+r); });
    this.feed.getStockDataDailyMix(this.feed.stocks, this.feed.range).then(r => {
      this.feed.parseJsonMulti(r, this);
      window.dispatchEvent(new Event('resize'));
      this.chart.loaded = true;
    });

    this.feed.msgEvent.subscribe((data) => {
      this.feed.getStockDataDailyMix(this.feed.stocks, this.feed.range).then(r => { this.feed.parseJsonMulti(r, this); window.dispatchEvent(new Event('resize')); });
    });

  }

  ngAfterViewInit(): void {
    //this.chart.width = 500;  //this.el.nativeElement.offsetWidth - 50;
    setTimeout(()=> window.dispatchEvent(new Event('resize')), 500);
  }

  onResize(event) {
    //console.log(event.target.innerWidth);
    this.chart.width = event.target.innerWidth - 50;
  }

  onLoad(event) {
    //console.log(event.target.innerWidth);
    this.chart.width = event.target.innerWidth - 50;
  }
}
