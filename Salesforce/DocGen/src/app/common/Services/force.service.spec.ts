import { TestBed, inject } from '@angular/core/testing';

import { ForceService } from './force.service';

describe('ForceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ForceService]
    });
  });

  it('should ...', inject([ForceService], (service: ForceService) => {
    expect(service).toBeTruthy();
  }));
});
