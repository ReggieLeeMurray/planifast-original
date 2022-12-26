import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Info } from 'src/app/models/info';
import { InfoService } from 'src/app/services/info.service';

@Component({
  selector: 'app-informacion',
  templateUrl: './informacion.component.html',
  styleUrls: ['./informacion.component.css'],
})
export class InformacionComponent implements OnInit {
  InfoForm: FormGroup;
  info: Info;
  loading = false;
  listInfo;
  idInfo;
  accion = 'Agregar';
  isVisible = false;
  date = null;
  DEBUG = false;

  constructor(
    private router: Router,
    private InfoService: InfoService,
    private fb: FormBuilder
  ) {
    this.InfoForm = this.fb.group({
      razon: ['', Validators.required],
      fecha: ['', Validators.required],
      sitio: ['', Validators.required],
      dir: ['', Validators.required],
      email: [null, [Validators.email, Validators.required]],
      codigop: ['', Validators.required],
      bio: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarInfo();
  }
  cargarInfo() {
    this.loading = true;
    this.InfoService.getInfo().subscribe((data) => {
      this.loading = false;
      this.listInfo = data;
      this.idInfo = this.listInfo[0].id;
    });
  }
  resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.InfoForm.reset();
    for (const key in this.InfoForm.controls) {
      this.InfoForm.controls[key].markAsPristine();
      this.InfoForm.controls[key].updateValueAndValidity();
    }
  }
  esEditar() {
    this.showModal();
    if (this.idInfo == 1) {
      this.accion = 'Editar';
      this.InfoService.cargarInfo(this.idInfo).subscribe((data) => {
        this.info = data;
        this.InfoForm.patchValue({
          razon: data.razonSocial,
          sitio: data.sitioWeb,
          fecha: data.fechaFundacion,
          dir: data.direccionPrincipal,
          email: data.email,
          codigop: data.codigoPostal,
          bio: data.bio,
        });
        console.log(this.InfoForm);
      });
    }
  }
  guardarInfo() {
    if (this.accion == 'Agregar') {
      const info: Info = {
        razonSocial: this.InfoForm.get('razon').value,
        sitioWeb: this.InfoForm.get('sitio').value,
        fechaFundacion: this.InfoForm.get('fecha').value,
        direccionPrincipal: this.InfoForm.get('dir').value,
        email: this.InfoForm.get('email').value,
        codigoPostal: this.InfoForm.get('codigop').value,
        bio: this.InfoForm.get('bio').value,
      };
      this.InfoService.guardarInfo(info).subscribe((data) => {
        this.router.navigate(['/info']);
      });
      this.handleOk();
      console.log(this.InfoForm);
    } else if (this.accion == 'Editar') {
      const info: Info = {
        id: this.idInfo,
        razonSocial: this.InfoForm.get('razon').value,
        sitioWeb: this.InfoForm.get('sitio').value,
        fechaFundacion: this.InfoForm.get('fecha').value,
        direccionPrincipal: this.InfoForm.get('dir').value,
        email: this.InfoForm.get('email').value,
        codigoPostal: this.InfoForm.get('codigop').value,
        bio: this.InfoForm.get('bio').value,
      };
      this.InfoService.actualizarInfo(this.idInfo, info).subscribe((data) => {
        this.router.navigate(['/info']);
      });
      this.handleOk();
      console.log(this.InfoForm);
    }
  }
  showModal(): void {
    this.isVisible = true;
  }
  handleOk(): void {
    window.location.reload();
    this.isVisible = false;
  }
  handleCancel(): void {
    this.isVisible = false;
    this.InfoForm.reset();
  }
}
