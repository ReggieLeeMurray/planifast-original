import { TestBed } from '@angular/core/testing';

import { EmpleadoinactivoService } from './empleadoinactivo.service';

describe('EmpleadoinactivoService', () => {
  let service: EmpleadoinactivoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpleadoinactivoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
