import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DataFeedService } from '../data-feed.service';


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
    info: '',
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
    avgVol: 0.0,
    loaded: false
  };

  constructor(private feed: DataFeedService, private el: ElementRef) { }

  ngOnInit(): void {
    this.feed.getStockDataDaily(this.stockName, this.feed.range)
      .then(r => {
        this.feed.parseJson(r.stockData, this);
        if (this.chart.data == null) this.chart.title = '!!! Failed To Load  ' + this.stockName;
        this.chart.options.colors = this.feed.lineColors.slice(this.stockIndex)
      });

    this.feed.msgEvent.subscribe((data) => {  //trigger refresh data 
      this.feed.getStockDataDaily(this.stockName, this.feed.range)
        .then(r => {
          this.feed.parseJson(r.stockData, this);
          if (this.chart.data == null) this.chart.title = '!!! Failed To Load  ' + this.stockName;
        });
    });
  }

  ngAfterViewInit(): void {
    window.dispatchEvent(new Event('resize')); //force chart resize
  }

  onResize(event) {
    this.chart.width = event.target.innerWidth - 50;
  }

  onLoad(event) { }
}
