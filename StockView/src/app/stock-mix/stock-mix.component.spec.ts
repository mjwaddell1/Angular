import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockMixComponent } from './stock-mix.component';

describe('StockMixComponent', () => {
  let component: StockMixComponent;
  let fixture: ComponentFixture<StockMixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockMixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockMixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
