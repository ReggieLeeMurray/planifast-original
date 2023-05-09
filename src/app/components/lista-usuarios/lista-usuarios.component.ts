import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { PageEvent } from '@angular/material/paginator';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Rol } from 'src/app/models/rol';
import { RolesService } from 'src/app/services/roles.service';

@Component({
  selector: 'app-lista-usuarios',
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css'],
})
export class ListaUsuariosComponent implements OnInit {
  listUsuarios;
  loading = false;
  size: NzButtonSize = 'large';
  nombres;
  page_size: number = 10;
  page_number: number = 1;
  isVisible = false;

  //form agregar usuario
  validateForm!: FormGroup;
  bUsuario!: FormGroup;
  listRol: Rol[];
  idRol = 0;
  idUsuario = 0;
  accion = 'Agregar';
  DEBUG = false;

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
  }
  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.validateForm.controls.checkPassword.updateValueAndValidity());
  }
  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  constructor(
    private modal: NzModalService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private rolService: RolesService,
    private usuariosService: UsuariosService
  ) {
    this.validateForm = this.fb.group({
      email: [null, [Validators.email, Validators.required]],
      password: [null, [Validators.required]],
      checkPassword: [null, [Validators.required, this.confirmationValidator]],
      nickname: [null, [Validators.required]],
      rol: [null, [Validators.required]],
    });
    if (+this.route.snapshot.paramMap.get('id') > 0) {
      this.idUsuario = +this.route.snapshot.paramMap.get('id');
    }
  }

  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarUsuarios();
    this.cargarRol();
  }
  handlePage(e: PageEvent) {
    this.page_size = e.pageSize;
    this.page_number = e.pageIndex + 1;
  }
  cargarUsuarios() {
    this.loading = true;
    this.usuariosService.getListUsuariosConRol().subscribe((data) => {
      this.loading = false;
      this.listUsuarios = data;
    });
  }
  delete(id: number) {
    this.loading = true;
    this.usuariosService.deleteUsuarios(id).subscribe((data) => {
      this.cargarUsuarios();
      this.loading = false;
    });
  }
  Search() {
    if (this.nombres != '' && this.nombres != undefined && this.nombres != null) {
      this.listUsuarios = this.listUsuarios.filter((res) => {
        return (
          res.nombreUsuario.toLocaleLowerCase().match(this.nombres.toLocaleLowerCase()) ||
          res.descripcion.toLocaleLowerCase().match(this.nombres.toLocaleLowerCase())
        );
      });
    } else {
      this.ngOnInit();
    }
  }
  showDeleteConfirm(id): void {
    this.modal.confirm({
      nzTitle: '¿Está seguro que desea eliminar este usuario?',
      nzContent: '<b style="color: red;">Esta acción es permanente.</b>',
      nzOkText: 'Si',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => {
        this.delete(id);
        window.location.reload();
      },
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel'),
    });
  }
  showModal(): void {
    this.isVisible = true;
  }
  handleOk(): void {
    window.location.reload();
    this.isVisible = false;
  }
  handleCancel(): void {
    this.clear();
    this.isVisible = false;
  }
  cargarRol() {
    this.loading = true;
    this.rolService.getListRoles().subscribe((data) => {
      this.loading = false;
      this.listRol = data;
    });
  }
  guardarUsuario() {
    if (this.accion == 'Agregar') {
      const usuario: Usuario = {
        email: this.validateForm.get('email').value,
        nombreUsuario: this.validateForm.get('nickname').value,
        password: this.validateForm.get('password').value,
        rolID: parseInt(this.validateForm.get('rol').value),
      };
      this.usuariosService.guardarUsuarios(usuario).subscribe((data) => {
        this.handleOk();
      });
    }
    console.log(this.validateForm);
  }
  clear() {
    this.validateForm.reset();
  }
}
