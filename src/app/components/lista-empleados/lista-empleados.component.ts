import { Component, OnInit } from '@angular/core';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { Departamento } from 'src/app/models/departamento';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import { EmpleadoinactivoService } from 'src/app/services/empleadoinactivo.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TipoplanillaService } from 'src/app/services/tipoplanilla.service';
import * as XLSX from 'xlsx';
import { startOfWeek, endOfWeek } from 'date-fns';
import moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
interface Empleados {
  id?: number;
  apellidos: string;
  descriDepto: string;
  descriPlanilla: string;
  tipo: string;
  direccion: string;
  email: string;
  tipoPlanilla: string;
  fechaIngreso: Date;
  fechaNac: Date;
  genero: string;
  n_Cedula: string;
  nombres: string;
  salarioBase: number;
}
@Component({
  selector: 'app-lista-empleados',
  templateUrl: './lista-empleados.component.html',
  styleUrls: ['./lista-empleados.component.css'],
})
export class ListaEmpleadosComponent implements OnInit {
  fechaForm: FormGroup;
  //fecha de tarjetas
  inicioSemana = startOfWeek(new Date());
  finalSemana = endOfWeek(new Date());
  listDepto: Departamento[];
  listTP = null;
  listTemporal = null;
  listEmpleadoQuincenal: Empleados[] = [];
  listEmpleadoSemanal: Empleados[] = [];
  listEmpleadoActivo = null;
  loading = false;
  nombres: string;
  fecha: string;
  isVisible = false;
  isVisibleMacro = false;
  porcentaje: number = 0;
  listEmpleadoFirst: Empleados[] = [];
  listEmpleadoSecond: Empleados[] = [];
  listEmpleadoThird: Empleados[] = [];
  tipoSemana: string;
  date = null;
  DEBUG = false;

  constructor(
    private fb: FormBuilder,
    private EmpleadosService: EmpleadosService,
    private DepartamentosService: DepartamentosService,
    private EmpleadoinactivoService: EmpleadoinactivoService,
    private TipoplanillaService: TipoplanillaService,
    private modal: NzModalService
  ) {
    this.fechaForm = this.fb.group({
      fechaplanilla: ['', Validators.required],
      search: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarEmpleado();
    this.cargarDepto();
    this.inicializarFecha(null, null);
  }
  inicializarFecha(inicio: Date, final: Date) {
    var inicioPrimeraSemana = new Date(),
      finalPrimeraSemana = new Date();
    if (inicio == undefined && final == undefined) {
      inicioPrimeraSemana.setDate(this.finalSemana.getDate() + 2);
      finalPrimeraSemana.setDate(this.finalSemana.getDate() + 8);
    } else {
      inicioPrimeraSemana = inicio;
      finalPrimeraSemana = final;
    }
    //moment js get de fechas iniciales (dia,mes,año)
    var dayInicio = moment(inicioPrimeraSemana).format('DD');
    var dayFinal = moment(finalPrimeraSemana).format('DD');
    var monthInicio = moment(inicioPrimeraSemana).format('MMM');
    var monthFinal = moment(finalPrimeraSemana).format('MMM');
    var yearInicio = moment(inicioPrimeraSemana).format('YYYY');
    var yearFinal = moment(finalPrimeraSemana).format('YYYY');
    console.log(
      dayInicio,
      dayFinal,
      monthInicio,
      monthFinal,
      yearInicio,
      yearFinal
    );
    // determinar nombre de la planilla
    if (yearInicio === yearFinal) {
      if (monthInicio === monthFinal) {
        this.fecha =
          dayInicio + ' al ' + dayFinal + '  ' + monthFinal + '  ' + yearFinal;
        console.log(this.fecha);
      } else {
        this.fecha =
          dayInicio +
          ' ' +
          monthInicio +
          ' al ' +
          dayFinal +
          ' ' +
          monthFinal +
          ' ' +
          yearFinal;
        console.log(this.fecha);
      }
    } else {
      this.fecha =
        dayInicio +
        ' ' +
        monthInicio +
        ' ' +
        yearInicio +
        ' al ' +
        dayFinal +
        ' ' +
        monthFinal +
        ' ' +
        yearFinal;
      console.log(this.fecha);
    }
  }
  onChange(result: Date[]): void {
    this.date = result;
    this.inicializarFecha(this.date[0], this.date[1]);
  }
  showModal(): void {
    this.isVisible = true;
  }
  showMacroModal(): void {
    this.isVisibleMacro = true;
    this.descargarMacro();
  }
  handleCancel(): void {
    this.isVisible = false;
    this.porcentaje = 0;
    this.fechaForm.get('fechaplanilla').setValue('');
    this.fechaForm.get('fechaplanilla').enable();
  }
  handleCancelMacro(): void {
    this.isVisibleMacro = false;
  }
  cargarEmpleado() {
    this.loading = true;
    var temporalSemanal;
    var temporalQuincenal;
    this.EmpleadoinactivoService.getListEmpleadosActivos().subscribe((data) => {
      this.loading = false;
      this.listEmpleadoActivo = data;
      this.listEmpleadoActivo.sort((a, b) => a.id - b.id);
      console.log(this.listEmpleadoActivo);
      for (let i = 0; i < this.listEmpleadoActivo.length; i++) {
        if (this.listEmpleadoActivo[i].tipoPlanilla == 'Semanal') {
          this.listEmpleadoSemanal[i] = this.listEmpleadoActivo[i];
        } else if (this.listEmpleadoActivo[i].tipoPlanilla == 'Quincenal') {
          this.listEmpleadoQuincenal[i] = this.listEmpleadoActivo[i];
        }
      }
      temporalSemanal = this.listEmpleadoSemanal.filter(function (el) {
        return el != null;
      });
      temporalQuincenal = this.listEmpleadoQuincenal.filter(function (el) {
        return el != null;
      });
      this.listEmpleadoQuincenal = temporalQuincenal;
      this.listEmpleadoSemanal = temporalSemanal;
      console.log(this.listEmpleadoSemanal, this.listEmpleadoQuincenal);
    });
  }
  tarjetasSemanales() {
    this.listEmpleadoFirst = [];
    this.listEmpleadoSecond = [];
    this.listEmpleadoThird = [];
    this.distribuirTablas(this.listEmpleadoSemanal);
    this.tipoSemana = 'semanales';
  }
  tarjetasQuincenales() {
    this.listEmpleadoFirst = [];
    this.listEmpleadoSecond = [];
    this.listEmpleadoThird = [];
    this.distribuirTablas(this.listEmpleadoQuincenal);
    this.tipoSemana = 'quincenales';
  }
  distribuirTablas(lista: Empleados[]) {
    this.porcentaje = 1;
    var j = 0;
    var k = 0;
    var l = 0;
    for (let i = 0; i < lista.length; i++) {
      var a = i % 2 == 0;
      var b = i % 2 == 1;
      var c = (i + 1) % 3 == 0;
      if (a && a != c) {
        this.listEmpleadoFirst[j] = lista[i];
        this.listEmpleadoFirst[j] = lista[i];
        j++;
        console.log('entro 1', lista[i].nombres + lista[i].apellidos);
      } else if (b && b != c) {
        this.listEmpleadoSecond[k] = lista[i];
        this.listEmpleadoSecond[k] = lista[i];
        k++;
        console.log('entro 2', lista[i].nombres + lista[i].apellidos);
      } else if (c) {
        this.listEmpleadoThird[l] = lista[i];
        this.listEmpleadoThird[l] = lista[i];
        l++;
        console.log('entro 3', lista[i].nombres + lista[i].apellidos);
      }
    }
    console.log(
      this.listEmpleadoFirst,
      this.listEmpleadoSecond,
      this.listEmpleadoThird
    );
    this.porcentaje = 100;
    document
      .getElementById('btnTarjetasSemanales')
      .setAttribute('disabled', 'true');
    document
      .getElementById('btnTarjetasQuincenales')
      .setAttribute('disabled', 'true');
    this.fechaForm.get('fechaplanilla').disable();
  }
  cargarDepto() {
    this.loading = true;
    this.DepartamentosService.getListDeptos().subscribe((data) => {
      this.loading = false;
      this.listDepto = data;
    });
  }
  cargarTP() {
    this.TipoplanillaService.getListTipoPlanilla().subscribe((data) => {
      this.listTP = data;
    });
  }
  delete(id: number) {
    this.loading = true;
    this.EmpleadosService.deleteEmpleados(id).subscribe((data) => {
      this.cargarEmpleado();
      this.loading = false;
    });
  }
  Search(value: string) {
    if (this.listTemporal == null) {
      this.listTemporal = this.listEmpleadoActivo;
    }
    if (value != '' && value != undefined && value != null) {
      this.listEmpleadoActivo = this.listTemporal.filter((res) => {
        return (
          res.nombres.toLocaleLowerCase().match(value.toLocaleLowerCase()) ||
          res.apellidos.toLocaleLowerCase().match(value.toLocaleLowerCase()) ||
          res.descriDepto
            .toLocaleLowerCase()
            .match(value.toLocaleLowerCase()) ||
          res.descriPlanilla
            .toLocaleLowerCase()
            .match(value.toLocaleLowerCase()) ||
          res.descriPlanilla
            .toLocaleLowerCase()
            .match(value.toLocaleLowerCase()) +
            res.tipoPlanilla
              .toLocaleLowerCase()
              .match(value.toLocaleLowerCase())
        );
      });
    } else {
      this.listEmpleadoActivo = this.listTemporal;
      this.listTemporal = null;
      return this.listEmpleadoActivo;
    }
  }
  showDeleteConfirm(id): void {
    this.modal.confirm({
      nzTitle: '¿Está seguro que desea eliminar este empleado?',
      nzContent:
        '<b style="color: red;">Se eliminará permanente toda la informacion del colaborador en el sistema. Esta acción no equivale a dar de baja.</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.delete(id);
        window.location.reload();
      },
      nzCancelText: 'No',
    });
  }
  exportExcel(): void {
    this.porcentaje = 0;
    /* table id is passed over here */
    let tarjeta_par = document.getElementById('tarjeta_par');
    let tarjeta_impar = document.getElementById('tarjeta_impar');
    let tarjeta_v3 = document.getElementById('tarjeta_v3');
    /* worksheets */
    const wsTarjeta_par: XLSX.WorkSheet =
      XLSX.utils.table_to_sheet(tarjeta_par);
    const wsTarjeta_impar: XLSX.WorkSheet =
      XLSX.utils.table_to_sheet(tarjeta_impar);
    const wsTarjeta_v3: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tarjeta_v3);
    /*width col*/
    var wscols = [{ wch: 10.7 }, { wch: 10.7 }, { wch: 10.7 }, { wpx: 6 }];
    wsTarjeta_par['!cols'] = wscols;
    wsTarjeta_impar['!cols'] = wscols;
    wsTarjeta_v3['!cols'] = wscols;
    /*heigh row */
    var rangeTarjeta_par = XLSX.utils.decode_range(wsTarjeta_par['!ref']);
    var rangeTarjeta_impar = XLSX.utils.decode_range(wsTarjeta_impar['!ref']);
    var rangeTarjeta_v3 = XLSX.utils.decode_range(wsTarjeta_v3['!ref']);
    var noRowsTarjeta_par = rangeTarjeta_par.e.r; // number of rows
    var noRowsTarjeta_impar = rangeTarjeta_impar.e.r; // number of rows
    var noRowsTarjeta_v3 = rangeTarjeta_v3.e.r; // number of rows
    var wsrowsTarjeta_par = [];
    var wsrowsTarjeta_impar = [];
    var wsrowsTarjeta_v3 = [];
    for (var i = 0; i < noRowsTarjeta_par; i++) {
      // columns length added
      wsrowsTarjeta_par.push({ hpx: 20.25 });
    }
    wsTarjeta_par['!rows'] = wsrowsTarjeta_par;

    for (var i = 0; i < noRowsTarjeta_impar; i++) {
      // columns length added
      wsrowsTarjeta_impar.push({ hpx: 20.25 });
    }
    wsTarjeta_impar['!rows'] = wsrowsTarjeta_impar;

    for (var i = 0; i < noRowsTarjeta_v3; i++) {
      // columns length added
      wsrowsTarjeta_v3.push({ hpx: 20.25 });
    }
    wsTarjeta_v3['!rows'] = wsrowsTarjeta_v3;
    /*margins sheets*/
    wsTarjeta_par['!margins'] = {
      left: 0.0,
      right: 0.0,
      top: 0.0,
      bottom: 0.0,
      header: 0.0,
      footer: 0.0,
    };
    wsTarjeta_impar['!margins'] = {
      left: 0.0,
      right: 0.0,
      top: 0.0,
      bottom: 0.0,
      header: 0.0,
      footer: 0.0,
    };
    wsTarjeta_v3['!margins'] = {
      left: 0.0,
      right: 0.0,
      top: 0.0,
      bottom: 0.0,
      header: 0.0,
      footer: 0.0,
    };
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsTarjeta_par, 'Tarjetas pt.1');
    XLSX.utils.book_append_sheet(wb, wsTarjeta_impar, 'Tarjetas pt.2');
    XLSX.utils.book_append_sheet(wb, wsTarjeta_v3, 'Tarjetas pt.3');
    /* save to excel-file which will be downloaded */
    XLSX.writeFile(
      wb,
      'Tarjetas ' +
        'de planillas ' +
        this.tipoSemana +
        ' del ' +
        this.fecha +
        ' ' +
        '.xlsx'
    );
    /* write and save file */
    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    document.getElementById('btnTarjetasSemanales').removeAttribute('disabled');
    document
      .getElementById('btnTarjetasQuincenales')
      .removeAttribute('disabled');
    this.handleCancel();
  }
  descargarMacro() {
    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = '/assets/PERSONAL.XLSB';
    link.download = 'macroPlanifast.XLSB';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
