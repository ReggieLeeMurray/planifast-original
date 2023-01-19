import { Component, OnInit } from '@angular/core';
import { EmpleadoinactivoService } from 'src/app/services/empleadoinactivo.service';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-lista-empleado-inactivo',
  templateUrl: './lista-empleado-inactivo.component.html',
  styleUrls: ['./lista-empleado-inactivo.component.css'],
})
export class ListaEmpleadoInactivoComponent implements OnInit {
  listEmpleadoInactivo = null;
  loading = false;
  size: NzButtonSize = 'large';
  nombres: string;
  listTemporal = null;
  DEBUG = false;

  constructor(
    private EmpleadoinactivoService: EmpleadoinactivoService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarEmpleado();
  }
  cargarEmpleado() {
    this.loading = true;
    this.EmpleadoinactivoService.getListEmpleadosNoActivos().subscribe(
      (data) => {
        this.loading = false;
        this.listEmpleadoInactivo = data;
        console.log(data);
        this.listEmpleadoInactivo.sort((a, b) => a.empleadoID - b.empleadoID);
      }
    );
  }
  delete(id: number) {
    this.loading = true;
    this.EmpleadoinactivoService.deleteEmpleadosInactivos(id).subscribe(
      (data) => {
        this.cargarEmpleado();
        this.loading = false;
      }
    );
  }
  Search(value: string) {
    if (this.listTemporal == null) {
      this.listTemporal = this.listEmpleadoInactivo;
    }
    if (value != '' && value != undefined && value != null) {
      this.listEmpleadoInactivo = this.listTemporal.filter((res) => {
        return (
          res.nombres.toLocaleLowerCase().match(value.toLocaleLowerCase()) ||
          res.apellidos.toLocaleLowerCase().match(value.toLocaleLowerCase()) ||
          res.motivo.toLocaleLowerCase().match(value.toLocaleLowerCase())
        );
      });
    } else {
      this.listEmpleadoInactivo = this.listTemporal;
      this.listTemporal = null;
      return this.listEmpleadoInactivo;
    }
  }
  showDeleteConfirm(id): void {
    this.modal.confirm({
      nzTitle: '¿Está seguro que desea eliminar este empleado?',
      nzContent: '<b style="color: red;">Esta acción es permanente.</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.delete(id);
        window.location.reload();
      },
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel'),
    });
  }
}
