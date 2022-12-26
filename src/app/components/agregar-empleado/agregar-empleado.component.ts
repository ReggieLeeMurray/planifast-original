import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Empleado } from 'src/app/models/empleado';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { EmpleadoinactivoService } from 'src/app/services/empleadoinactivo.service';
import { Departamento } from 'src/app/models/departamento';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import { TipoPlanilla } from 'src/app/models/tipoplanilla';
import { TipoplanillaService } from 'src/app/services/tipoplanilla.service';
import getISOWeek from 'date-fns/getISOWeek';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-agregar-empleado',
  templateUrl: './agregar-empleado.component.html',
  styleUrls: ['./agregar-empleado.component.css'],
})
export class AgregarEmpleadoComponent implements OnInit {
  empleadosForm: FormGroup;
  idEmpleado = 0;
  idDepto: number;
  idTP: number;
  temporal = 0;
  duplicado = false;
  accion = 'Agregar';
  loading = false;
  empleado: Empleado;
  departamento: Departamento;
  tp: TipoPlanilla;
  listDeptos: Departamento[];
  listTP: TipoPlanilla[];
  listEmpleadoActivo = null;
  selectedValueDepto: string = 'Seleccione';
  selectedValuePlanilla: string = 'Seleccione';
  isEnglish = false;
  isHidden = false;
  dateNac = null;
  isVisibleExistente = false;
  dateI = null;
  radioValue: string;
  DEBUG = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private EmpleadosService: EmpleadosService,
    private router: Router,
    private departamentosService: DepartamentosService,
    private TipoplanillaService: TipoplanillaService,
    private EmpleadoinactivoService: EmpleadoinactivoService,
    private modal: NzModalService
  ) {
    this.empleadosForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: [null, [Validators.email, Validators.required]],
      n_cedula: ['', Validators.required],
      direccion: ['', Validators.required],
      fechaingreso: ['', Validators.required],
      fechanac: ['', Validators.required],
      genero: ['', Validators.required],
      depto: ['', Validators.required],
      salariobase: ['', Validators.required],
      tplanilla: ['', Validators.required],
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
    console.log('ANTES ', this.accion, this.isHidden);
    this.esEditar();
    console.log('DESPUES ', this.accion, this.isHidden);
    this.cargarDepto();
    this.cargarTP();
    this.cargarEmpleado();
  }
  cargarDepto() {
    this.loading = true;
    this.departamentosService.getListDeptos().subscribe((data) => {
      this.loading = false;
      this.listDeptos = data;
    });
  }
  cargarEmpleado() {
    this.loading = true;
    this.EmpleadoinactivoService.getListEmpleadosActivos().subscribe((data) => {
      this.loading = false;
      this.listEmpleadoActivo = data;
    });
  }
  cargarTP() {
    this.loading = true;
    this.TipoplanillaService.getListTipoPlanilla().subscribe((data) => {
      this.loading = false;
      this.listTP = data;
      console.log(this.listTP);
    });
  }
  existente(): void {
    this.isVisibleExistente = true;
    this.modal.error({
      nzCentered: true,
      nzTitle: 'Datos Inconsistentes',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Colaborador ya existentente en el sistema.</b>',
      nzOkText: 'Okay',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.resetForm();
        this.router.navigate(['/listado']);
      },
      nzOnCancel: () => this.resetForm(),
    });
  }
  guardarEmpleados() {
    if (this.accion == 'Agregar') {
      var valor = (
        Math.round(this.empleadosForm.get('salariobase').value * 100) / 100
      ).toFixed(2);
      const empleado: Empleado = {
        fechaIngreso: this.empleadosForm.get('fechaingreso').value,
        nombres: this.empleadosForm.get('nombre').value,
        apellidos: this.empleadosForm.get('apellido').value,
        genero: this.empleadosForm.get('genero').value,
        email: this.empleadosForm.get('email').value,
        fechaNac: this.empleadosForm.get('fechanac').value,
        direccion: this.empleadosForm.get('direccion').value,
        n_Cedula: this.empleadosForm.get('n_cedula').value,
        salarioBase: parseFloat(valor),
        departamentoID: parseInt(this.empleadosForm.get('depto').value),
        planillaID: parseInt(this.empleadosForm.get('tplanilla').value),
      };
      console.log(this.listEmpleadoActivo);
      for (let k = 0; k < this.listEmpleadoActivo.length; k++) {
        if (
          (empleado.n_Cedula == this.listEmpleadoActivo[k].n_Cedula ||
            empleado.nombres + ' ' + empleado.apellidos ==
              this.listEmpleadoActivo[k].nombres +
                ' ' +
                this.listEmpleadoActivo[k].apellidos) &&
          this.isVisibleExistente == false
        ) {
          this.existente();
          this.duplicado = true;
          k = this.listEmpleadoActivo.length - 1;
        }
      }
      if (this.duplicado != true) {
        this.EmpleadosService.guardarEmpleados(empleado).subscribe((data) => {
          this.router.navigate(['/listado']);
        });
      }
    } else if (this.accion == 'Editar') {
      var valor = (
        Math.round(this.empleadosForm.get('salariobase').value * 100) / 100
      ).toFixed(2);
      const empleado: Empleado = {
        id: this.empleado.id,
        fechaIngreso: this.empleadosForm.get('fechaingreso').value,
        nombres: this.empleadosForm.get('nombre').value,
        genero: this.empleadosForm.get('genero').value,
        email: this.empleadosForm.get('email').value,
        fechaNac: this.empleadosForm.get('fechanac').value,
        apellidos: this.empleadosForm.get('apellido').value,
        direccion: this.empleadosForm.get('direccion').value,
        n_Cedula: this.empleadosForm.get('n_cedula').value,
        salarioBase: parseFloat(valor),
        departamentoID: parseInt(this.empleadosForm.get('depto').value),
        planillaID: parseInt(this.empleadosForm.get('tplanilla').value),
      };
      console.log(empleado);
      if (this.duplicado != true) {
        this.EmpleadosService.actualizarEmpleado(
          this.idEmpleado,
          empleado
        ).subscribe((data) => {
          this.router.navigate(['/listado']);
        });
      }
    }
  }
  resetForm(): void {
    this.duplicado = false;
    this.empleadosForm.reset();
    for (const key in this.empleadosForm.controls) {
      this.empleadosForm.controls[key].markAsPristine();
      this.empleadosForm.controls[key].updateValueAndValidity();
    }
    this.selectedValueDepto = 'Seleccione';
    this.selectedValuePlanilla = 'Seleccione';
  }
  esEditar() {
    if (this.idEmpleado > 0) {
      this.accion = 'Editar';
      this.isHidden = true;
      this.EmpleadosService.cargarEmpleados(this.idEmpleado).subscribe(
        (data) => {
          this.empleado = data;
          this.idDepto = data.departamentoID;
          this.idTP = data.planillaID;
          this.empleadosForm.patchValue({
            nombre: data.nombres,
            apellido: data.apellidos,
            n_cedula: data.n_Cedula,
            fechaingreso: data.fechaIngreso,
            direccion: data.direccion,
            salariobase: data.salarioBase,
            email: data.email,
            fechanac: data.fechaNac,
            depto: data.departamentoID,
            tplanilla: data.planillaID,
            genero: data.genero,
          });
          this.departamentosService
            .cargarDeptos(this.idDepto)
            .subscribe((data) => {
              this.selectedValueDepto = data.descripcion;
              console.log(this.selectedValueDepto);
            });
          this.TipoplanillaService.cargarTipoPlanilla(this.idTP).subscribe(
            (data) => {
              this.selectedValuePlanilla = data.descripcion + ' - ' + data.tipo;
              console.log(this.selectedValuePlanilla);
            }
          );
        }
      );
    }
  }
  onChange(result: Date): void {
    console.log('onChange: ', result);
  }
  getWeek(result: Date): void {
    console.log('week: ', getISOWeek(result));
  }
}
