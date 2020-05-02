import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DataFeedService } from './data-feed.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'StockView';

  public constructor(private feedsvc: DataFeedService, private titleService: Title) {

    this.feedsvc.titleEvent.subscribe((title) => {
      this.titleService.setTitle(title.toString())
    });
  }
}
