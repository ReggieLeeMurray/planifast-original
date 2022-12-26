import { TestBed } from '@angular/core/testing';

import { TipoplanillaService } from './tipoplanilla.service';

describe('TipoplanillaService', () => {
  let service: TipoplanillaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoplanillaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
