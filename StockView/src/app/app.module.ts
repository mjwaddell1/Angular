import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeadingBarComponent } from './heading-bar/heading-bar.component';
import { StockListComponent } from './stock-list/stock-list.component';
import { StockComponent } from './stock/stock.component';
import { DataFeedService } from './data-feed.service';
import { GoogleChartsModule } from 'angular-google-charts';
import { StockMixComponent } from './stock-mix/stock-mix.component';

@NgModule({
  declarations: [
    AppComponent,
    HeadingBarComponent,
    StockListComponent,
    StockComponent,
    StockMixComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    GoogleChartsModule.forRoot()
  ],
  providers: [DataFeedService],
  bootstrap: [AppComponent]
})
export class AppModule { }
