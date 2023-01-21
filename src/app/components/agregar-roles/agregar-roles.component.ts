import { Component, OnInit } from '@angular/core';
import { RolesService } from 'src/app/services/roles.service';
import { Rol } from 'src/app/models/rol';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-agregar-roles',
  templateUrl: './agregar-roles.component.html',
  styleUrls: ['./agregar-roles.component.css'],
})
export class AgregarRolesComponent implements OnInit {
  RolForm: FormGroup;
  listRol: Rol[];
  loading = false;
  idRol = 0;
  Roles;
  isVisible = false;
  page_size: number = 10;
  page_number: number = 1;
  switchValue = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private RolesService: RolesService,
    private modal: NzModalService
  ) {
    this.RolForm = this.fb.group({
      descripcion: ['', Validators.required],
    });
    if (+this.route.snapshot.paramMap.get('id') > 0) {
      this.idRol = +this.route.snapshot.paramMap.get('id');
    }
  }
  ngOnInit(): void {
    this.cargarRol();
  }
  showModal(): void {
    this.isVisible = true;
    this.clear();
  }
  handlePage(e: PageEvent) {
    this.page_size = e.pageSize;
    this.page_number = e.pageIndex + 1;
  }
  handleCancel(): void {
    this.isVisible = false;
    this.clear();
  }
  guardarRol() {
    const Roles: Rol = {
      descripcion: this.RolForm.get('descripcion').value,
    };
    this.RolesService.guardarRoles(Roles).subscribe((data) => {
      this.router.navigate(['/rolesagregar']);
      this.cargarRol();
    });
    console.log(this.RolForm);
    this.isVisible = false;
  }
  clear() {
    this.RolForm.reset();
  }
  cargarRol() {
    this.loading = true;
    this.RolesService.getListRoles().subscribe((data) => {
      this.loading = false;
      this.listRol = data;
    });
  }
  delete(id: number) {
    this.loading = true;
    this.RolesService.deleteRoles(id).subscribe((data) => {
      this.cargarRol();
      this.loading = false;
    });
  }
  Search() {
    if (this.Roles != '' && this.Roles != undefined && this.Roles != null) {
      this.listRol = this.listRol.filter((res) => {
        return res.descripcion
          .toLocaleLowerCase()
          .match(this.Roles.toLocaleLowerCase());
      });
    } else {
      this.ngOnInit();
    }
  }
  showDeleteConfirm(id): void {
    this.modal.confirm({
      nzTitle: '¿Está seguro que desea eliminar este rol?',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Esta acción es permanente y se elimináran todos los usuarios con dicho rol.</b>',
      nzOkText: 'Si',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.delete(id),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel'),
    });
  }
}
