import { Component, OnInit } from '@angular/core';
import { TipoplanillaService } from 'src/app/services/tipoplanilla.service';
import { TipoPlanilla } from 'src/app/models/tipoplanilla';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tipoplanilla',
  templateUrl: './tipoplanilla.component.html',
  styleUrls: ['./tipoplanilla.component.css'],
})
export class TipoplanillaComponent implements OnInit {
  TPForm: FormGroup;
  tp: TipoPlanilla;
  listTemporal = null;
  listTP = null;
  loading = false;
  idTP = 0;
  planillas: string;
  selectedValuePlanilla: string = 'Seleccione';
  accion = 'Agregar';
  pageSize = 10;
  isVisible = false;
  DEBUG = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private TipoplanillaService: TipoplanillaService,
    private modal: NzModalService
  ) {
    this.TPForm = this.fb.group({
      descripcion: ['', Validators.required],
      tipo: ['', Validators.required],
    });
    if (+this.route.snapshot.paramMap.get('id') > 0) {
      this.idTP = +this.route.snapshot.paramMap.get('id');
    }
  }
  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarTP();
  }
  showModal(): void {
    this.accion = 'Agregar';
    this.isVisible = true;
    this.TPForm.reset();
  }
  handleCancel(): void {
    this.isVisible = false;
    this.TPForm.reset();
  }
  error(): void {
    this.modal.error({
      nzCentered: true,
      nzTitle: 'Planilla Duplicada',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Ya existe una planilla similar.</b>',
      nzOkText: 'Okay',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.handleCancel(),
    });
  }
  guardarTP() {
    var y: number = 0;
    if (this.accion == 'Agregar') {
      const TP: TipoPlanilla = {
        descripcion: this.TPForm.get('descripcion').value,
        tipo: this.TPForm.get('tipo').value,
      };
      for (let i = 0; i < this.listTP.length; i++) {
        if (
          this.listTP[i].descripcion == TP.descripcion &&
          this.listTP[i].tipo == TP.tipo
        ) {
          i = this.listTP.length - 1;
          y++;
          this.error();
        }
      }
      if (y == 0) {
        this.TipoplanillaService.guardarTipoPlanilla(TP).subscribe((data) => {
          this.handleCancel();
          this.cargarTP();
        });
      }
    } else {
      const TP: TipoPlanilla = {
        id: this.tp.id,
        descripcion: this.TPForm.get('descripcion').value,
        tipo: this.TPForm.get('tipo').value,
      };
      for (let i = 0; i < this.listTP.length; i++) {
        if (
          this.listTP[i].descripcion == TP.descripcion &&
          this.listTP[i].tipo == TP.tipo
        ) {
          i = this.listTP.length - 1;
          y++;
          this.error();
        }
      }
      if (y == 0) {
        console.log('entro');
        this.TipoplanillaService.actualizarTipoPlanilla(
          this.idTP,
          TP
        ).subscribe((data) => {
          this.handleCancel();
          this.cargarTP();
        });
      }
    }
  }
  onChange(value: string) {}
  cargarTP() {
    this.loading = true;
    this.TipoplanillaService.getListTipoPlanilla().subscribe((data) => {
      this.loading = false;
      this.listTP = data;
      console.log(this.listTP);
    });
  }
  delete(id: number) {
    this.loading = true;
    this.TipoplanillaService.deleteTipoPlanilla(id).subscribe((data) => {
      this.cargarTP();
      this.loading = false;
    });
  }
  Search(value: string) {
    if (this.listTemporal == null) {
      this.listTemporal = this.listTP;
    }
    if (value != '' && value != undefined && value != null) {
      this.listTP = this.listTemporal.filter((res) => {
        return (
          res.descripcion
            .toLocaleLowerCase()
            .match(value.toLocaleLowerCase()) ||
          res.tipo.toLocaleLowerCase().match(value.toLocaleLowerCase())
        );
      });
    } else {
      this.listTP = this.listTemporal;
      this.listTemporal = null;
      return this.listTP;
    }
  }
  esEditar(id: number) {
    this.showModal();
    this.accion = 'Editar';
    if (id > 0) {
      this.TipoplanillaService.cargarTipoPlanilla(id).subscribe((data) => {
        this.tp = data;
        this.idTP = data.id;
        this.TPForm.patchValue({
          descripcion: data.descripcion,
          tipo: data.tipo,
        });
      });
    }
  }
  showDeleteConfirm(id): void {
    this.modal.confirm({
      nzTitle: 'Está seguro que desea eliminar esta planilla?',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Esta acción es permanente y se eliminarán todos los colaboradores dentro de la misma.</b>',
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
