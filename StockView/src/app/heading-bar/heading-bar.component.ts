import { Component, OnInit } from '@angular/core';
import { DataFeedService } from '../data-feed.service';

@Component({
  selector: 'app-heading-bar',
  templateUrl: './heading-bar.component.html',
  styleUrls: ['./heading-bar.component.css']
})
export class HeadingBarComponent implements OnInit {

  public rg: number = this.feedsvc.range;

  constructor(public feedsvc: DataFeedService) { this.rg = feedsvc.range; }

  public updateData(moCnt) {
    console.log('updateData');
    this.feedsvc.msgEvent.next(moCnt);
    this.rg = moCnt;
  }

  ngOnInit(): void {
  }

}
