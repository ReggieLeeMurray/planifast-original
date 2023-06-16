import { TestBed } from '@angular/core/testing';

import { BlobsService } from './blobs.service';

describe('BlobsService', () => {
  let service: BlobsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlobsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
