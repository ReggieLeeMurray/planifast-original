import { Component, OnInit } from '@angular/core';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import { Departamento } from 'src/app/models/departamento';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-departamento',
  templateUrl: './departamento.component.html',
  styleUrls: ['./departamento.component.css'],
})
export class DepartamentoComponent implements OnInit {
  departamentosForm: UntypedFormGroup;
  listDeptos = null;
  listTemporal = null;
  departamentos: Departamento;
  departamento: string;
  loading = false;
  idDepto = 0;
  isVisible = false;
  pageSize = 10;
  notFound = './assets/empty.svg';
  accion = 'Agregar';
  DEBUG = false;

  constructor(
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private DepartamentosService: DepartamentosService,
    private modal: NzModalService
  ) {
    this.departamentosForm = this.fb.group({
      descripcion: ['', Validators.required],
    });
    if (+this.route.snapshot.paramMap.get('id') > 0) {
      this.idDepto = +this.route.snapshot.paramMap.get('id');
    }
  }
  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarDepto();
  }
  showModal(): void {
    this.accion = 'Agregar';
    this.isVisible = true;
    this.departamentosForm.reset();
  }
  handleCancel(): void {
    this.isVisible = false;
    this.departamentosForm.reset();
  }
  error(): void {
    this.modal.error({
      nzCentered: true,
      nzTitle: 'Departamento Duplicado',
      nzContent: '<b style="color: red;">ADVERTENCIA: Ya existe un departamento similar.</b>',
      nzOkText: 'Okay',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.handleCancel(),
    });
  }
  guardarDepartamentos() {
    var y: number = 0;
    if (this.accion == 'Agregar') {
      const departamento: Departamento = {
        descripcion: this.departamentosForm.get('descripcion').value,
      };
      for (let i = 0; i < this.listDeptos.length; i++) {
        if (this.listDeptos[i].descripcion == departamento.descripcion) {
          i = this.listDeptos.length - 1;
          y++;
          this.error();
        }
      }
      if (y == 0) {
        this.DepartamentosService.guardarDeptos(departamento).subscribe((data) => {
          this.handleCancel();
          this.cargarDepto();
        });
      }
    } else {
      const departamento: Departamento = {
        id: this.departamentos.id,
        descripcion: this.departamentosForm.get('descripcion').value,
      };
      for (let i = 0; i < this.listDeptos.length; i++) {
        if (this.listDeptos[i].descripcion == departamento.descripcion) {
          i = this.listDeptos.length - 1;
          y++;
          this.error();
        }
      }
      if (y == 0) {
        this.DepartamentosService.actualizarDepto(this.idDepto, departamento).subscribe((data) => {
          this.handleCancel();
          this.cargarDepto();
        });
      }
    }
  }
  cargarDepto() {
    this.loading = true;
    this.DepartamentosService.getListDeptos().subscribe((data) => {
      this.loading = false;
      this.listDeptos = data;
    });
  }
  delete(id: number) {
    this.loading = true;
    this.DepartamentosService.deleteDeptos(id).subscribe((data) => {
      this.cargarDepto();
      this.loading = false;
    });
  }
  Search(value: string) {
    if (this.listTemporal == null) {
      this.listTemporal = this.listDeptos;
    }
    if (value != '' && value != undefined && value != null) {
      this.listDeptos = this.listTemporal.filter((res) => {
        return res.descripcion.toLocaleLowerCase().match(value.toLocaleLowerCase());
      });
    } else {
      this.listDeptos = this.listTemporal;
      this.listTemporal = null;
      return this.listDeptos;
    }
  }
  esEditar(id: number) {
    this.showModal();
    this.accion = 'Editar';
    if (id > 0) {
      this.DepartamentosService.cargarDeptos(id).subscribe((data) => {
        this.departamentos = data;
        this.idDepto = data.id;
        this.departamentosForm.patchValue({
          descripcion: data.descripcion,
        });
      });
    }
  }
  showDeleteConfirm(id): void {
    this.modal.confirm({
      nzTitle: '¿Está seguro que desea eliminar este departamento?',
      nzContent: '<b style="color: red;">ADVERTENCIA: Esta acción es permanente y se eliminarán todos los colaboradores dentro del mismo.</b>',
      nzOkText: 'Si',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => {
        this.delete(id);
        window.location.reload();
      },
      nzCancelText: 'No',
    });
  }
}
