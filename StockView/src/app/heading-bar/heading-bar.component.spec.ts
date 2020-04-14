import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadingBarComponent } from './heading-bar.component';

describe('HeadingBarComponent', () => {
  let component: HeadingBarComponent;
  let fixture: ComponentFixture<HeadingBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadingBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadingBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
