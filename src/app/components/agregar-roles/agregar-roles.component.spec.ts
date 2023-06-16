import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarRolesComponent } from './agregar-roles.component';

describe('AgregarRolesComponent', () => {
  let component: AgregarRolesComponent;
  let fixture: ComponentFixture<AgregarRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarRolesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
