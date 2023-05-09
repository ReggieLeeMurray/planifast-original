import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Empleado } from 'src/app/models/empleado';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { EmpleadoInactivo } from 'src/app/models/empleadoinactivo';
import { EmpleadoinactivoService } from 'src/app/services/empleadoinactivo.service';

@Component({
  selector: 'app-dar-baja',
  templateUrl: './dar-baja.component.html',
  styleUrls: ['./dar-baja.component.css'],
})
export class DarBajaComponent implements OnInit {
  empleadosForm: FormGroup;
  idEmpleado = 0;
  idEmp = 0;
  temporal = 0;
  accion = 'Agregar';
  loading = false;
  empleado: Empleado;
  empleadoinactivo: EmpleadoInactivo;
  listEmpleados;
  isEnglish = false;
  date = null;
  DEBUG = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private EmpleadoinactivoService: EmpleadoinactivoService,
    private empleadosService: EmpleadosService,
    private router: Router
  ) {
    this.empleadosForm = this.fb.group({
      nombre: ['', Validators.required],
      valor: ['', Validators.required],
      motivo: ['', Validators.required],
      fechasalida: ['', Validators.required],
    });
    if (+this.route.snapshot.paramMap.get('id') > 0) {
      this.idEmpleado = +this.route.snapshot.paramMap.get('id');
    }
  }
  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarEmpleado();
    this.esEditar();
  }
  cargarEmpleado() {
    this.loading = true;
    this.EmpleadoinactivoService.getListEmpleadosActivos().subscribe((data) => {
      this.loading = false;
      this.listEmpleados = data;
    });
  }
  clear() {
    this.empleadosForm.reset();
  }
  guardarEmpleados() {
    if (this.accion == 'Agregar') {
      var valor = (Math.round(this.empleadosForm.get('valor').value * 100) / 100).toFixed(2);
      const empleadoinactivo: EmpleadoInactivo = {
        nota: this.empleadosForm.get('motivo').value,
        motivo: this.empleadosForm.get('motivo').value,
        valor: parseFloat(valor),
        empleadoID: parseInt(this.empleadosForm.get('nombre').value),
        fechaSalida: this.empleadosForm.get('fechasalida').value,
      };
      this.EmpleadoinactivoService.guardarEmpleadosInactivos(empleadoinactivo).subscribe((data) => {
        this.router.navigate(['/inactivos']);
      });
    } else {
      var valor = (Math.round(this.empleadosForm.get('valor').value * 100) / 100).toFixed(2);
      const empleadoinactivo: EmpleadoInactivo = {
        id: this.empleadoinactivo.id,
        fechaSalida: this.empleadosForm.get('fechasalida').value,
        valor: parseFloat(valor),
        motivo: this.empleadosForm.get('motivo').value,
        nota: this.empleadosForm.get('motivo').value,
        empleadoID: this.idEmp,
      };
      this.EmpleadoinactivoService.actualizarEmpleadosInactivos(this.idEmpleado, empleadoinactivo).subscribe((data) => {
        this.router.navigate(['/inactivos']);
      });
    }
    console.log(this.empleadosForm);
  }
  esEditar() {
    if (this.idEmpleado > 0) {
      this.accion = 'Editar';
      this.EmpleadoinactivoService.cargarEmpleadosInactivos(this.idEmpleado).subscribe((data) => {
        this.empleadoinactivo = data;
        this.empleadosForm.patchValue({
          valor: data.valor,
          motivo: data.motivo,
          fechasalida: data.fechaSalida,
          nota: data.motivo,
        });
        this.idEmp = data.empleadoID;
        console.log(this.empleadosForm);
        this.empleadosForm.controls['nombre'].disable();
      });
    }
  }
  onChange(result: Date): void {
    console.log('onChange: ', result);
  }
}
