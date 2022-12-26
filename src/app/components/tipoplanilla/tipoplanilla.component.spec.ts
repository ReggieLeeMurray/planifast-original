import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoplanillaComponent } from './tipoplanilla.component';

describe('TipoplanillaComponent', () => {
  let component: TipoplanillaComponent;
  let fixture: ComponentFixture<TipoplanillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoplanillaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoplanillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
