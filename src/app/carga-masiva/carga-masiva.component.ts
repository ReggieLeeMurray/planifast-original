import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { EmpleadosService } from 'src/app/services/empleados.service';
import moment from 'moment';
import { EmpleadoinactivoService } from 'src/app/services/empleadoinactivo.service';
import { TipoplanillaService } from 'src/app/services/tipoplanilla.service';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HttpClient } from '@angular/common/http';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
interface Ingresos {
  apellidos: string;
  departamentoID: string;
  direccion: string;
  email: string;
  fechaIngreso: Date;
  fechaNac: Date;
  genero: string;
  n_Cedula: string;
  nombres: string;
  planillaID: string;
  salarioBase: number;
  tipo: string;
}
@Component({
  selector: 'app-carga-masiva',
  templateUrl: './carga-masiva.component.html',
  styleUrls: ['./carga-masiva.component.css'],
})
export class CargaMasivaComponent implements OnInit {
  reqForm: FormGroup;
  listEmpleadoActivo: Ingresos[] = [];
  listInicialEmpleadoActivo = [];
  listFinal = null;
  jDatos = [];
  data = [];
  isActive = false;
  listTP = null;
  listDeptos = null;
  today = moment().format('LL');
  isVisibleExistente = false;
  isVisibleId = false;
  isVisibleRepetidos = false;
  isVisibleCedula = false;
  notFound = './assets/empty.svg';
  DEBUG = true;
  httpClient: HttpClient;

  constructor(
    private fb: FormBuilder,
    private EmpleadosService: EmpleadosService,
    private EmpleadoinactivoService: EmpleadoinactivoService,
    private TipoplanillaService: TipoplanillaService,
    private DepartamentosService: DepartamentosService,
    private modal: NzModalService,
    private http: HttpClient
  ) {
    this.reqForm = this.fb.group({
      archivo: ['', Validators.required],
    });
    this.httpClient = http;
  }
  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarTP();
    this.cargarDepto();
    this.cargarEmpleado();
  }
  cargarTP() {
    this.TipoplanillaService.getListTipoPlanilla().subscribe((data) => {
      this.listTP = data;
    });
  }
  cargarEmpleado() {
    this.EmpleadoinactivoService.getListEmpleadosActivos().subscribe((data) => {
      this.listInicialEmpleadoActivo = data;
    });
  }
  cargarDepto() {
    this.DepartamentosService.getListDeptos().subscribe((data) => {
      this.listDeptos = data;
    });
  }
  existente(): void {
    this.isVisibleExistente = true;
    this.modal.error({
      nzCentered: true,
      nzTitle: 'Archivo Inconsistente',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Contiene colaboradores ya existentes en el sistema.</b>',
      nzOkText: 'Okay',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.clean(),
      nzOnCancel: () => this.clean(),
    });
  }
  cedulaInconsistente(): void {
    this.isVisibleCedula = true;
    this.modal.error({
      nzCentered: true,
      nzTitle: 'Archivo Inconsistente',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Número de cédula inadmisible. Debe tener 13 números sin guiones y estar formato texto.</b>',
      nzOkText: 'Okay',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.clean(),
      nzOnCancel: () => this.clean(),
    });
  }
  malFormato(): void {
    this.isVisibleId = true;
    this.modal.error({
      nzCentered: true,
      nzTitle: 'Archivo Inconsistente',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Existe un error de tipografía. Lea las instrucciones y revise si ingreso correctamente el genero o los ID requeridos.</b>',
      nzOkText: 'Okay',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.clean(),
      nzOnCancel: () => this.clean(),
    });
  }
  repetidos(): void {
    this.isVisibleRepetidos = true;
    this.modal.error({
      nzCentered: true,
      nzTitle: 'Archivo Inconsistente',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Registros duplicados en el archivo. TIP: Nombre ó número de cedula duplicado.</b>',
      nzOkText: 'Okay',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.clean(),
      nzOnCancel: () => this.clean(),
    });
  }
  error(): void {
    this.modal.error({
      nzCentered: true,
      nzTitle: 'Archivo Inconsistente',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: No se actualizarán los colaboradores. TIP: Usa nuestra plantilla y sigue las instrucciones o asegúrate de elejir el archivo correcto. Revise si hay campos en blanco.</b>',
      nzOkText: 'Okay',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.clean(),
      nzOnCancel: () => this.clean(),
    });
  }
  archivoVacio(): void {
    this.modal.warning({
      nzCentered: true,
      nzTitle: 'Archivo Vacío',
      nzContent:
        '<b style="color: yellow;">ADVERTENCIA: No se actualizarán los colaboradores. TIP: Asegúrate de elejir el archivo correcto.</b>',
      nzOkText: 'Okay',
      nzOkType: 'primary',
      nzClosable: false,
      nzOnOk: () => this.clean(),
      nzOnCancel: () => this.clean(),
    });
  }
  multiplesArchivos(): void {
    this.modal.warning({
      nzCentered: true,
      nzTitle: 'Multiples Archivos',
      nzContent:
        '<b style="color: yellow;">ADVERTENCIA: Solo se permite un archivo en formato Excel.</b>',
      nzOkText: 'Okay',
      nzOkType: 'primary',
      nzClosable: false,
      nzOnOk: () => this.clean(),
      nzOnCancel: () => this.clean(),
    });
  }
  success(): void {
    this.modal.success({
      nzCentered: true,
      nzTitle: 'Colaboradores Agregados Exitosamente',
      nzContent: 'Listados actualizados',
      nzOkText: 'Okay',
      nzOkType: 'primary',
      nzClosable: false,
      nzOnOk: () => this.clean(),
      nzOnCancel: () => this.clean(),
    });
  }
  onFileChange(evt: any) {
    this.jDatos = [];
    const target: DataTransfer = <DataTransfer>evt.target;
    if (target.files.length !== 1) {
      this.multiplesArchivos();
    } else {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const headers = [
          'nombres',
          'apellidos',
          'n_Cedula',
          'direccion',
          'fechaNac',
          'fechaIngreso',
          'genero',
          'salarioBase',
          'departamentoID',
          'planillaID',
        ];
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        var nombreHoja = wb.SheetNames; // regresa un array
        // let datos = XLSX.utils.sheet_to_json(wb.Sheets[nombreHoja[0]]);
        let datos = XLSX.utils.sheet_to_json(wb.Sheets[nombreHoja[0]], {
          header: headers,
        });
        //remueve las instrucciones del archivo antes de leerlo, no debe incluir titulos
        datos = datos.slice(8);
        console.log('DATOS', datos);
        for (let i = 0; i < datos.length; i++) {
          const dato = datos[i];
          this.jDatos.push({
            ...(dato as object),
          });
          this.jDatos[i].email = 'email@xyz.com';
          console.log(this.jDatos, dato);
          if (
            this.jDatos[i].fechaNac != undefined ||
            this.jDatos[i].fechaIngreso != undefined
          ) {
            this.jDatos[i].fechaNac = new Date(
              (this.jDatos[i].fechaNac - (25567 + 1)) * 86400 * 1000
            );
            this.jDatos[i].fechaIngreso = new Date(
              (this.jDatos[i].fechaIngreso - (25567 + 1)) * 86400 * 1000
            );
          } else {
            i = datos.length - 1;
            this.error();
          }
          for (let k = 0; k < this.listInicialEmpleadoActivo.length; k++) {
            if (
              (this.jDatos[i].n_Cedula ===
                this.listInicialEmpleadoActivo[k].n_Cedula ||
                // this.jDatos[i].email ===
                //   this.listInicialEmpleadoActivo[k].email ||
                this.jDatos[i].nombres + ' ' + this.jDatos[i].apellidos ===
                  this.listInicialEmpleadoActivo[k].nombres +
                    ' ' +
                    this.listInicialEmpleadoActivo[k].apellidos) &&
              this.isVisibleExistente === false
            ) {
              this.existente();
            }
          }
          if (
            this.jDatos[i].n_Cedula.length < 13 &&
            this.isVisibleCedula === false
          ) {
            this.cedulaInconsistente();
          }
          if (
            this.jDatos[i].genero === 'Masculino' ||
            this.jDatos[i].genero === 'Femenino' ||
            this.jDatos[i].genero === 'femenino' ||
            this.jDatos[i].genero === 'masculino' ||
            this.jDatos[i].genero === 'F' ||
            this.jDatos[i].genero === 'M' ||
            this.jDatos[i].genero === 'f' ||
            this.jDatos[i].genero === 'm'
          ) {
            if (
              this.jDatos[i].genero === 'Masculino' ||
              this.jDatos[i].genero === 'masculino' ||
              this.jDatos[i].genero === 'M' ||
              this.jDatos[i].genero === 'm'
            ) {
              this.jDatos[i].genero = 'Masculino';
            } else {
              this.jDatos[i].genero = 'Femenino';
            }
          } else {
            this.malFormato();
          }
        }
        if (this.jDatos.length === 0) {
          this.archivoVacio();
        } else {
          console.log(
            this.jDatos,
            this.listInicialEmpleadoActivo,
            this.listDeptos,
            this.listTP
          );
          this.inicializar(this.jDatos.length);
          for (let i = 0; i < this.jDatos.length; i++) {
            this.listEmpleadoActivo[i].nombres = this.jDatos[i].nombres;
            this.listEmpleadoActivo[i].apellidos = this.jDatos[i].apellidos;
            this.listEmpleadoActivo[i].direccion = this.jDatos[i].direccion;
            this.listEmpleadoActivo[i].email = 'email@xyz.com';
            this.listEmpleadoActivo[i].genero = this.jDatos[i].genero;
            this.listEmpleadoActivo[i].n_Cedula = this.jDatos[i].n_Cedula;
            this.listEmpleadoActivo[i].salarioBase = this.jDatos[i].salarioBase;
            this.listEmpleadoActivo[i].fechaNac = this.jDatos[i].fechaNac;
            this.listEmpleadoActivo[i].fechaIngreso =
              this.jDatos[i].fechaIngreso;
          }
          for (let i = 0; i < this.jDatos.length; i++) {
            for (let k = 0; k < this.listDeptos.length; k++) {
              if (
                this.jDatos[i].departamentoID === this.listDeptos[k].id &&
                this.isVisibleId === false
              ) {
                this.listEmpleadoActivo[i].departamentoID =
                  this.listDeptos[k].descripcion;
                k = this.listDeptos.length - 1;
              } else if (
                k === this.listDeptos.length - 1 &&
                this.isVisibleId === false
              ) {
                this.malFormato();
              }
            }
            for (let j = 0; j < this.listTP.length; j++) {
              if (
                this.jDatos[i].planillaID === this.listTP[j].id &&
                this.isVisibleId === false
              ) {
                this.listEmpleadoActivo[i].planillaID =
                  this.listTP[j].descripcion;
                this.listEmpleadoActivo[i].tipo = this.listTP[j].tipo;
                j = this.listTP.length - 1;
              } else if (
                j === this.listTP.length - 1 &&
                this.isVisibleId === false
              ) {
                this.malFormato();
              }
            }
          }
          console.log(this.jDatos, this.listEmpleadoActivo);
          this.listFinal = this.listEmpleadoActivo;
          var x = 0;
          for (let i = 0; i < this.listFinal.length; i++) {
            x++;
            if (
              x < this.listFinal.length &&
              this.isVisibleRepetidos === false &&
              (this.listFinal[i].nombres + ' ' + this.listFinal[i].apellidos ===
                this.listFinal[x].nombres + ' ' + this.listFinal[x].apellidos ||
                this.listFinal[i].n_Cedula === this.listFinal[x].n_Cedula)
            ) {
              this.repetidos();
            }
          }
        }
      };
      reader.readAsBinaryString(target.files[0]);
    }
  }
  exportExcel(): void {
    let filepath = './assets/cargaMasiva.xlsx';
    this.httpClient
      .get(filepath, { responseType: 'arraybuffer' })
      .subscribe((res: any) => {
        console.log(res);
        const temporal: XLSX.WorkBook = XLSX.read(res, {
          type: 'buffer',
        });
        var nombreHoja = temporal.SheetNames;
        const wsColaboradores: XLSX.WorkSheet = temporal.Sheets[nombreHoja[0]];
        /* table id is passed over here */
        let departamentos = document.getElementById('deptos');
        let planillas = document.getElementById('planillas');
        /*html tables*/
        const wsDeptos: XLSX.WorkSheet =
          XLSX.utils.table_to_sheet(departamentos);
        const wsPlanillas: XLSX.WorkSheet =
          XLSX.utils.table_to_sheet(planillas);
        /* generate workbook and add the worksheet */
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsColaboradores, 'Colaboradores');
        XLSX.utils.book_append_sheet(wb, wsDeptos, 'Departamentos ID');
        XLSX.utils.book_append_sheet(wb, wsPlanillas, 'Planillas ID');
        /* save to excel-file which will be downloaded */
        XLSX.writeFile(wb, 'Carga Masiva del ' + this.today + '.xlsx');
        /* write and save file */
        const excelBuffer: any = XLSX.write(wb, {
          bookType: 'xlsx',
          type: 'array',
        });
        const archivo: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
      });
  }
  upload() {
    document.getElementById('btnSubir').setAttribute('disabled', 'disabled');
    this.EmpleadosService.guardarMuchosEmpleados(this.jDatos).subscribe(
      (data) => {
        this.success();
      },
      (err) => {
        this.error();
      }
    );
  }
  inicializar(x: number) {
    for (let i = 0; i < x; i++) {
      this.listEmpleadoActivo.push({
        nombres: '',
        apellidos: '',
        departamentoID: '',
        planillaID: '',
        direccion: '',
        salarioBase: 0,
        email: 'email@xyz.com',
        fechaIngreso: new Date(),
        fechaNac: new Date(),
        genero: '',
        n_Cedula: '',
        tipo: ' ',
      });
    }
  }
  onChange(result: boolean): void {
    this.isActive = result;
  }
  clean() {
    this.isActive = false;
    this.isVisibleId = false;
    this.isVisibleExistente = false;
    this.isVisibleRepetidos = false;
    this.isVisibleCedula = false;
    this.listEmpleadoActivo = [];
    this.listFinal = null;
    this.cargarEmpleado();
    this.reqForm.reset();
    for (const key in this.reqForm.controls) {
      this.reqForm.controls[key].markAsPristine();
      this.reqForm.controls[key].updateValueAndValidity();
    }
    console.log(this.listFinal, this.reqForm, this.isActive);
  }
}
