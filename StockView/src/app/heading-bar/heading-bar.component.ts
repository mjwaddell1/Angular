import { Component, OnInit } from '@angular/core';
import { DataFeedService } from '../data-feed.service';

@Component({
  selector: 'app-heading-bar',
  templateUrl: './heading-bar.component.html',
  styleUrls: ['./heading-bar.component.css']
})
export class HeadingBarComponent implements OnInit {

  public rg: number = this.feedsvc.range;
  public showSettings: boolean = false;
  public stks = 'xxx';
  public range = 6;
  public refresh = 0;
  public baseline = 0;

  constructor(public feedsvc: DataFeedService) { this.rg = feedsvc.range; }

  public updateData(rng) {
    console.log('updateData');
    this.feedsvc.msgEvent.next(rng);
    this.rg = rng;
  }

  ngOnInit(): void {
    this.stks = this.feedsvc.stocks.join(',');
    this.range = this.feedsvc.range;
    this.refresh = this.feedsvc.refreshRate;
    this.baseline = this.feedsvc.baseline;
  }

  updateLink() {
    document.location.href = document.location.pathname + '?range=' + this.range + '&refresh=' + this.refresh + '&baseline=' + this.baseline + '&stocks=' + this.stks;
    this.showSettings = false;
  }

}
