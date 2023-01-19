import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';

import { AccountService, AlertService } from 'src/app/_services';

@Component({
  templateUrl: 'list.component.html',
})
export class ListComponent implements OnInit {
  loading = false;
  usuarios: string;
  listUsers = null;
  listTemporal = null;
  isVisible = false;

  constructor(
    private accountService: AccountService,
    private modal: NzModalService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }
  handleCancel(): void {
    this.isVisible = false;
  }
  cargarUsuarios() {
    this.loading = true;
    this.accountService
      .getAll()
      .pipe(first())
      .subscribe((res) => ((this.loading = false), (this.listUsers = res)));
  }
  usuarioPorID(id) {
    const user = this.listUsers.find((x) => x.id === id);
    user.isDeleting = true;
    this.loading = true;
    this.accountService
      .delete(id)
      .pipe(first())
      .subscribe({
        next: () => {
          this.listUsers = this.listUsers.filter((x) => x.id !== id);
        },
        error: (error) => {
          this.alertService.error(error);
          this.loading = false;
        },
      });
  }
  deleteUser(id: string) {
    this.modal.confirm({
      nzTitle: '¿Está seguro que desea eliminar este usuario?',
      nzContent:
        '<b style="color: red;">Esta acción es permanente. SI USTED ELIMINA EL USUARIO CON EL QUE INICIO SESIÓN, SERÁ EXPULSADO DEL SISTEMA.</b>',
      nzOkText: 'Si',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.usuarioPorID(id);
        window.location.reload();
      },
      nzCancelText: 'No',
      nzOnCancel: () => this.handleCancel(),
    });
  }
  Search(value: string) {
    if (this.listTemporal == null) {
      this.listTemporal = this.listUsers;
    }
    if (value != '' && value != undefined && value != null) {
      this.listUsers = this.listTemporal.filter((res) => {
        return (
          res.username.toLocaleLowerCase().match(value.toLocaleLowerCase()) ||
          res.firstName.toLocaleLowerCase().match(value.toLocaleLowerCase()) ||
          res.lastName.toLocaleLowerCase().match(value.toLocaleLowerCase()) ||
          res.role.toLocaleLowerCase().match(value.toLocaleLowerCase())
        );
      });
    } else {
      this.listUsers = this.listTemporal;
      this.listTemporal = null;
      return this.listUsers;
    }
  }
}
