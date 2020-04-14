import { Component, OnInit } from '@angular/core';
import { DataFeedService } from '../data-feed.service';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.css']
})
export class StockListComponent implements OnInit {

  constructor(private feedsvc:DataFeedService) { }

  ngOnInit(): void {
  }

  getStockList = () => this.feedsvc.getStockList();

}
