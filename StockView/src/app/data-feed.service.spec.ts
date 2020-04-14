import { TestBed } from '@angular/core/testing';

import { DataFeedService } from './data-feed.service';

describe('DataFeedService', () => {
  let service: DataFeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataFeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
