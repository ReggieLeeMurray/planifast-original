import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaEmpleadoInactivoComponent } from './lista-empleado-inactivo.component';

describe('ListaEmpleadoInactivoComponent', () => {
  let component: ListaEmpleadoInactivoComponent;
  let fixture: ComponentFixture<ListaEmpleadoInactivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaEmpleadoInactivoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaEmpleadoInactivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
