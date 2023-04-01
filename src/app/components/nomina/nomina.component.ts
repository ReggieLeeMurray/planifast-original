import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoPlanilla } from 'src/app/models/tipoplanilla';
import { Info } from 'src/app/models/info';
import { Empleado } from 'src/app/models/empleado';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { HistorialService } from 'src/app/services/historial.service';
import { TipoplanillaService } from 'src/app/services/tipoplanilla.service';
import { InfoService } from 'src/app/services/info.service';
import moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PageEvent } from '@angular/material/paginator';
import * as XLSX from 'xlsx';
import { PuedeDesactivar } from 'src/app/can-deactivate.guard';
import { Observable } from 'rxjs';
// import { AzureBlobStorageService } from 'src/app/services/azure-blob-storage.service';
import { startOfWeek, endOfMonth, startOfMonth } from 'date-fns';
import { Time } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';

moment.locale('es');
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
@Component({
  selector: 'app-nomina',
  templateUrl: './nomina.component.html',
  styleUrls: ['./nomina.component.css'],
})
export class NominaComponent implements OnInit, PuedeDesactivar {
  //salir modulo
  permitirSalidaDeRuta(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.current === 2) {
      return true;
    } else {
      const confirmacion = window.confirm(
        '¿Desea salir del módulo y perder los cambios realizados?'
      );
      return confirmacion;
    }
  }
  //fecha de planilla
  inicioSemana = startOfWeek(new Date());
  finalSemana = startOfWeek(new Date());
  inicioQuincena: Date = new Date();
  fechaCreacionPlanilla: Date = new Date();
  finalQuincena = endOfMonth(new Date());
  dateFormat = 'dd/MM/yyyy';
  today = new Date();
  ranges: any;
  fileGenerado: Blob;
  diferencia: number;
  start: Date;
  end: Date;
  nombre: any;
  planidescrip: any;
  planitipo: any;
  fecha: any;
  yearAguinaldo: any;
  mesAguinaldo: any;
  cantOI: number = 0;
  cantOD: number = 0;
  //archivo
  hideObv: boolean = true;
  fileUploaded: boolean = false;
  obv: string = 'Observaciones';
  hideDetectados: boolean = true;
  hideErroneos: boolean = true;
  hideFaltantesSobrantes: boolean = true;
  msgDetectados: string = '';
  msgErroneos: string = '';
  msgFaltantesSobrantes: string = '';
  msgInfo: string = '';
  jDatos = [];
  //formgroups
  inicialForm: FormGroup;
  periodoForm: FormGroup;
  automaticForm: FormGroup;
  aguinaldoForm: FormGroup;
  horasForm: FormGroup;
  infoForm: FormGroup;
  descriForm: FormGroup;
  extraForm: FormGroup;
  extraFormSecundario: FormGroup;
  extraFormTercero: FormGroup;
  resumenForm: FormGroup;
  deduccionForm: FormGroup;
  deduccionFormQuincenal: FormGroup;
  tempForm: FormGroup;
  //paginador
  page_size: number = 12;
  page_number: number = 1;
  //id y listas
  idEmpleado = 0;
  idTP = 0;
  listTP: TipoPlanilla[];
  listNomina = null;
  listNominaFinal = null;
  listInfo: Info[];
  listTemporal = null;
  listFinal = null;
  notFound = './assets/empty.svg';
  listComprobantes = [];
  listTarjeta = [];
  listIncapacidadPrivada = [];
  nombres: string;
  editId: number | null = null;
  Id: number | null = null;
  //stepper
  current = 0;
  //blob storage
  // imageSource = '';
  file: File;
  //entradas y salidas
  luI: Time;
  luO: Time;
  maI: Time;
  maO: Time;
  miI: Time;
  miO: Time;
  juI: Time;
  juO: Time;
  viI: Time;
  viO: Time;
  saI: Time;
  saO: Time;
  doI: Time;
  doO: Time;
  //duracion de jornada
  hrsJornadaDiurna = 8;
  hrsJornadaNocturna = 6;
  hrsJornadaMixta = 7;
  //horarios de las jornadas
  diurnaI = moment(5, 'HH:mm a');
  diurnaO = moment(19, 'HH:mm a');
  nocturnaIa = moment(18, 'HH:mm a');
  nocturnaI = moment(19, 'HH:mm a');
  nocturnaO = moment(5, 'HH:mm a');
  mixtaIa = moment(12, 'HH:mm a');
  mixtaIb = moment(14, 'HH:mm a');
  mixtaIc = moment(15, 'HH:mm a');
  mixtaOa = moment(20, 'HH:mm a');
  mixtaOb = moment(21, 'HH:mm a');
  mixtaOc = moment(22, 'HH:mm a');
  reset = moment(24, 'HH:mm a');
  //checkboxes deduccion
  cboxAll = false;
  cboxIHSS = false;
  cboxISR = false;
  cboxAFPC = false;
  cboxAguinaldo = false;
  cboxImpVecinal = false;
  cboxPrestamoRap = false;
  cboxAnticipo = false;
  cboxCTAEmpresa = false;
  cboxViaticos = false;
  cboxOtros = false;
  cboxAjuste = false;
  //modals, disable controls y checks
  loading = false;
  isMainVisible = false;
  isValidAguinaldo = false;
  isVisibleInvalidas = false;
  isVisibleArchivo = false;
  isVisibleValidasIguales = false;
  isVisibleLibres = false;
  isVisiblePromedio = false;
  isVisibleDeduccion = false;
  isVisibleAguinaldoDeduccion = false;
  isVisibleMasEsMenos = false;
  isVisibleIncPubParcial = false;
  isVisibleDivPrimario = false;
  isVisibleDivSecundario = false;
  isVisibleDivTercero = false;
  isVisibleDiasCorrectos = false;
  isVisibleGenerar = false;
  isVisibleInicial = false;
  isVisibleAguinaldo = false;
  isVisibleAguinaldoAdvertencia = false;
  isAdvertenciaIgnored = false;
  isVisibleDeducible = false;
  switchValueIHSS = false;
  switchValueISR = false;
  switchValueAFPC = false;
  switchValuePP = false;
  switchValueAguinaldo = false;
  switchValueTechoEM_IHSS = false;
  switchValueTechoIVM_IHSS = false;
  switchValuePorcentajeEM_IHSS = false;
  switchValuePorcentajeIVM_IHSS = false;
  switchValueTechoExento_ISR = false;
  switchValueTecho15_ISR = false;
  switchValueTecho20_ISR = false;
  switchValueMontoServicioMedico_ISR = false;
  switchValueTechoIVM_RAP = false;
  switchValuePorcentajeIVM_RAP = false;
  limpiarTotalAguinaldo = true;
  isDisabledIHSS = false;
  isDisabledISR = false;
  isDisableAFPC = false;
  isDisabledPP = false;
  isDisabledAguinaldo = true;
  isCheckedIHSS = true;
  isCheckedISR = true;
  isCheckedAFPC = true;
  isCheckedImpVecinal = true;
  isCheckedCTAEmpresa = true;
  isCheckedTransporte = true;
  isCheckedPrestamoRap = true;
  isCheckedAnticipo = true;
  isCheckedAjuste = true;
  isCheckedVarios = true;
  isCheckedAguinaldo = false;
  aguinaldoCalculado = false;
  allChecked = true;
  indeterminate = false;
  btnEnable = true;
  continue = false;
  archivoGenerado = false;
  //horas trabajadas x dia de la semana
  hours: number = 0;
  hoursLunes: number = 0;
  hoursMartes: number = 0;
  hoursMiercoles: number = 0;
  hoursJueves: number = 0;
  hoursViernes: number = 0;
  hoursSabado: number = 0;
  hoursDomingo: number = 0;
  //total horas trabajadas x semana y requeridas para completar jornada
  totalTrabNormales: number = 0;
  totalTrabReales: number = 0;
  totalTrabRealesCompletas: number = 0;
  totalExtrasDiurnas: number = 0;
  totalExtrasNocturnas: number = 0;
  totalExtrasMixtas: number = 0;
  ajustePositivo: number = 0;
  extrasSabados: number = 0;
  requiredCompletarDiurna: number = 0;
  requiredCompletarMixta: number = 0;
  requiredCompletarNocturna: number = 0;
  requiredCompletarIncapacidadPrivada: number = 0;
  requiredCompletarAutorizado: number = 0;
  requiredCompletarAutorizadoReal: number = 0;
  incapacidadReal: number = 0;
  //precio por jornada
  salarioMinimoPerHour = 0;
  salarioMinimoPerDia = 0;
  recargo = 0;
  //cantidad de ingresos y egresos
  feriado: number = 0;
  incapacidadpub: number = 0;
  incapacidadpriv: number = 0;
  incPriv: Boolean = false;
  incapacidadpubparcial: number = 0;
  incapacidadpendiente: number = 0;
  conpermiso: number = 0;
  septimo: number = 0;
  vacacion: number = 0;
  vacacioncanc: number = 0;
  incapacidadcanc: number = 0;
  falta: number = 0;
  suspension: number = 0;
  abandono: number = 0;
  notrabajaba: number = 0;
  dia: string = '';
  sueldo: number = 0;
  sueldoNormal: number = 0;
  sueldoString = '0.00';
  sueldoAlDeducirString = '0.00';
  salario: number;
  salarioString: string;
  totalAPagar: number = 0;
  empleadosactivos;
  deduccion: number = 0;
  deduccionString = '0.00';
  nombreCompleto;
  maximo = 30;
  totalCalculados = 0;
  //valores de la cantidad ingresos y egresos
  valorNormal: number = 0;
  valorHED: number = 0;
  valorHEM: number = 0;
  valorHEN: number = 0;
  valorFeriado: number = 0;
  valorIncapacidadPub: number = 0;
  valorIncapacidadPriv: number = 0;
  valorSeptimo: number = 0;
  valorVacacion: number = 0;
  valorFalta: number = 0;
  valorAutorizado: number = 0;
  valorIHSS: number = 0;
  valorAnticipo: number = 0;
  valorAFPC: number = 0;
  valorPrestamoRap: number = 0;
  valorISR: number = 0;
  valorSuspension: number = 0;
  valorImpVecinal: number = 0;
  valorCTAEmpresa: number = 0;
  valorTransporte: number = 0;
  valorAjuste: number = 0;
  valorAguinaldo: number = 0;
  totalAguinaldo: number = 0;
  valorVarios: number = 0;
  ajusteDias: number = 0;
  sabadoHorasNormales: number = 0;
  //count tipo de jornada para promedio
  diaDiurno = 0;
  diaMixto = 0;
  diaNocturno = 0;
  DEBUG = false;
  //tarjetas
  jornada: string = '';
  jornadaL: number = 0;
  jornadaM: number = 0;
  jornadaMi: number = 0;
  jornadaJ: number = 0;
  jornadaV: number = 0;
  jornadaS: number = 0;
  jornadaD: number = 0;
  extrasDiurna: number = 0;
  extrasMixta: number = 0;
  extrasNocturna: number = 0;
  cambioRevisarJornada: string = '';
  //moment
  lunesDesde = moment();
  lunesHasta = moment();
  martesDesde = moment();
  martesHasta = moment();
  miercolesDesde = moment();
  miercolesHasta = moment();
  juevesDesde = moment();
  juevesHasta = moment();
  viernesDesde = moment();
  viernesHasta = moment();
  sabadoDesde = moment();
  sabadoHasta = moment();
  domingoDesde = moment();
  domingoHasta = moment();
  //impresion de comprobantes
  seleccionado = false;
  indeterminados = false;
  listOfCurrentPageData = null;
  setOfCheckedId = new Set<number>();
  constructor(
    private fb: FormBuilder,
    private modal: NzModalService,
    private EmpleadosService: EmpleadosService,
    private TipoplanillaService: TipoplanillaService,
    private HistorialService: HistorialService,
    private InfoService: InfoService,
    // private AzureBlobStorageService: AzureBlobStorageService,
    private NzMessageService: NzMessageService
  ) {
    this.horasForm = this.fb.group({
      luIControl: ['', Validators.required],
      luOControl: ['', Validators.required],
      maIControl: ['', Validators.required],
      maOControl: ['', Validators.required],
      miIControl: ['', Validators.required],
      miOControl: ['', Validators.required],
      juIControl: ['', Validators.required],
      juOControl: ['', Validators.required],
      viIControl: ['', Validators.required],
      viOControl: ['', Validators.required],
      saIControl: ['', Validators.required],
      saOControl: ['', Validators.required],
      doIControl: ['', Validators.required],
      doOControl: ['', Validators.required],
    });
    this.descriForm = this.fb.group({
      lunesSelect: ['', Validators.required],
      martesSelect: ['', Validators.required],
      miercolesSelect: ['', Validators.required],
      juevesSelect: ['', Validators.required],
      viernesSelect: ['', Validators.required],
      sabadoSelect: ['', Validators.required],
      domingoSelect: ['', Validators.required],
    });
    this.infoForm = this.fb.group({
      razon: ['', Validators.required],
      fecha: ['', Validators.required],
      sitio: ['', Validators.required],
      dir: ['', Validators.required],
      email: [null, [Validators.email, Validators.required]],
      codigop: ['', Validators.required],
      bio: ['', Validators.required],
      techoEM_IHSS: ['', Validators.required],
      techoIVM_IHSS: ['', Validators.required],
      porcentajeContribucionTrabajadorEM_IHSS: ['', Validators.required],
      porcentajeContribucionTrabajadorIVM_IHSS: ['', Validators.required],
      techoIVM_RAP: ['', Validators.required],
      porcentajeContribucionTrabajador_RAP: ['', Validators.required],
      techoExento_ISR: ['', Validators.required],
      techo15_ISR: ['', Validators.required],
      techo20_ISR: ['', Validators.required],
      montoServicioMedico_ISR: ['', Validators.required],
    });
    this.extraForm = this.fb.group({
      incpub: [{ value: '', disabled: true }, Validators.required],
    });
    this.extraFormSecundario = this.fb.group({
      jornadaSelect: [{ value: '', disabled: true }, Validators.required],
    });
    this.extraFormTercero = this.fb.group({
      incpub: [{ value: '', disabled: true }, Validators.required],
      dias: [{ value: '', disabled: true }, Validators.required],
    });
    this.resumenForm = this.fb.group({
      hn: [{ value: 0, disabled: true }, Validators.required],
      hed: [{ value: 0, disabled: true }, Validators.required],
      hem: [{ value: 0, disabled: true }, Validators.required],
      hen: [{ value: 0, disabled: true }, Validators.required],
      ajuste: [{ value: '', disabled: false }, Validators.required],
      aguinaldo: [{ value: '', disabled: true }, Validators.required],
      conpermiso: [{ value: '', disabled: false }, Validators.required],
      feriado: [{ value: 0, disabled: true }, Validators.required],
      feriados: [{ value: '', disabled: false }, Validators.required],
      falta: [{ value: 0, disabled: true }, Validators.required],
      faltas: [{ value: '', disabled: false }, Validators.required],
      incapacidad: [{ value: 0, disabled: true }, Validators.required],
      incapacidadpub: [{ value: '', disabled: false }, Validators.required],
      incapacidadpriv: [{ value: '', disabled: false }, Validators.required],
      septimo: [{ value: 0, disabled: true }, Validators.required],
      septimos: [{ value: '', disabled: false }, Validators.required],
      suspension: [{ value: '', disabled: false }, Validators.required],
      suspensiones: [{ value: '', disabled: false }, Validators.required],
      vacacion: [{ value: 0, disabled: true }, Validators.required],
      vacaciones: [{ value: '', disabled: false }, Validators.required],
    });
    this.inicialForm = this.fb.group({
      tplanilla: ['', Validators.required],
      fecha: ['', Validators.required],
      archivo: [''],
    });
    this.periodoForm = this.fb.group({
      periodo: [{ value: '', disabled: true }, , Validators.required],
    });
    this.automaticForm = this.fb.group({
      isr: [{ value: '', disabled: true }, [Validators.required]],
      ihss: [{ value: '', disabled: true }, [Validators.required]],
      afpc: [{ value: '', disabled: true }, [Validators.required]],
    });
    this.aguinaldoForm = this.fb.group({
      ajuste: [{ value: '', disabled: false }, [Validators.required]],
      varios: [{ value: '', disabled: false }, [Validators.required]],
    });
    this.deduccionForm = this.fb.group({
      varios: [{ value: '', disabled: false }, [Validators.required]],
      ajuste: [{ value: '', disabled: false }, [Validators.required]],
      transporte: [{ value: '', disabled: false }, [Validators.required]],
      impvecinal: [{ value: '', disabled: false }, [Validators.required]],
      ctaempresa: [{ value: '', disabled: false }, [Validators.required]],
    });
    this.deduccionFormQuincenal = this.fb.group({
      varios: [{ value: '', disabled: false }, [Validators.required]],
      ajuste: [{ value: '', disabled: false }, [Validators.required]],
      transporte: [{ value: '', disabled: false }, [Validators.required]],
      impvecinal: [{ value: '', disabled: false }, [Validators.required]],
      ctaempresa: [{ value: '', disabled: false }, [Validators.required]],
      anticipo: [{ value: '', disabled: false }, [Validators.required]],
      prestamorap: [{ value: '', disabled: false }, [Validators.required]],
    });
    this.tempForm = this.fb.group({
      salario: [{ value: '', disabled: false }, [Validators.required]],
      busqueda: [{ value: '', disabled: false }, [Validators.required]],
    });
  }
  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarTP();
    this.cargarCountEmpleadosActivos();
    this.cargarFecha();
    this.cargarInfo();
  }
  //recomienda rangos por semana y quincena en el calendario
  cargarFecha() {
    this.inicioSemana.setDate(this.inicioSemana.getDate() - 6);
    if (this.today.getDate() >= 1 && this.today.getDate() <= 15) {
      this.inicioQuincena = startOfMonth(new Date());
      this.finalQuincena.setDate(this.inicioQuincena.getDate() + 14);
    } else if (this.today.getDate() >= 16 && this.today.getDate() <= 31) {
      if (endOfMonth(this.today).getDate() === 30) {
        this.inicioQuincena.setDate(this.finalQuincena.getDate() - 14);
      } else if (endOfMonth(this.today).getDate() === 31) {
        this.inicioQuincena.setDate(this.finalQuincena.getDate() - 15);
      }
    }
    this.ranges = {
      'Esta Semana': [this.inicioSemana, this.finalSemana],
      'Esta Quincena': [this.inicioQuincena, this.finalQuincena],
    };
  }
  //obtiene lista de planillas disponibles
  cargarTP() {
    this.loading = true;
    this.TipoplanillaService.getListTipoPlanilla().subscribe((data) => {
      this.loading = false;
      this.listTP = data;
      this.idTP = this.inicialForm.get('tplanilla').value;
    });
  }
  //obtiene lista de planillas disponibles
  cargarInfo() {
    this.loading = true;
    this.InfoService.getInfo().subscribe((data) => {
      this.loading = false;
      this.listInfo = data;
      this.infoForm.disable();
      this.infoForm.get('techoEM_IHSS').setValue(data[0].techoEM_IHSS);
      this.infoForm.get('techoIVM_IHSS').setValue(data[0].techoIVM_IHSS);
      this.infoForm
        .get('porcentajeContribucionTrabajadorEM_IHSS')
        .setValue(data[0].porcentajeContribucionTrabajadorEM_IHSS);
      this.infoForm
        .get('porcentajeContribucionTrabajadorIVM_IHSS')
        .setValue(data[0].porcentajeContribucionTrabajadorIVM_IHSS);
      this.infoForm.get('techoIVM_RAP').setValue(data[0].techoIVM_RAP);
      this.infoForm
        .get('porcentajeContribucionTrabajador_RAP')
        .setValue(data[0].porcentajeContribucionTrabajador_RAP);
      this.infoForm.get('techoExento_ISR').setValue(data[0].techoExento_ISR);
      this.infoForm.get('techo15_ISR').setValue(data[0].techo15_ISR);
      this.infoForm.get('techo20_ISR').setValue(data[0].techo20_ISR);
      this.infoForm
        .get('montoServicioMedico_ISR')
        .setValue(data[0].montoServicioMedico_ISR);
    });
  }
  //obtener cantidad de empleados activos
  cargarCountEmpleadosActivos() {
    this.EmpleadosService.getCountActivo().subscribe((data) => {
      this.empleadosactivos = data;
    });
  }
  //obtener nombre de la planilla seleccionada
  cargarDescri(id) {
    this.TipoplanillaService.cargarTipoPlanilla(id).subscribe((data) => {
      this.planidescrip = data.descripcion;
      this.planitipo = 'Planilla de pago ' + data.tipo;
    });
  }
  //obtiene empleados por planillas seleccionada al cambiar selector
  log(value): void {
    console.log(value);
    if (value !== null) {
      this.idTP = parseInt(value);
      this.cargarEmpleadoByPlanillaId(this.idTP);
    }
  }
  //crea lista de empleados dentro de la planilla por id
  cargarEmpleadoByPlanillaId(id: number) {
    this.loading = true;
    this.EmpleadosService.cargarEmpleadosByPlanillaId(id).subscribe((data) => {
      this.loading = false;
      this.listNomina = data;
      console.log(data);
      this.listNomina.sort((a, b) => a.id - b.id);
      this.listTarjeta = this.listNomina.map((o) => ({
        id: o.id,
        nombres: o.nombres,
        apellidos: o.apellidos,
      }));
      this.listNominaFinal = data;
      console.log(this.listTarjeta, this.listNomina, this.listNominaFinal);
      this.cargarDescri(this.idTP);
    });
  }
  //guardar historial de archivos generados
  guardarHistorial() {
    var fechaInicio = moment(this.start).format('L').toString();
    var fechaFinal = moment(this.end).format('L').toString();
    var fechaCreacion = moment(this.fechaCreacionPlanilla)
      .format('L')
      .toString();
    const history = new FormData();
    history.append('fechaInicio', fechaInicio);
    history.append('fechaFinal', fechaFinal);
    history.append('fechaCreacion', fechaCreacion);
    history.append(
      'totalPlanilla',
      this.round2Decimal(this.totalAPagar).toString()
    );
    history.append('archivo', this.nombre.toString() + '.xlsx');
    history.append('files', this.fileGenerado);
    history.append('planillaID', this.idTP.toString());
    console.log(history);
    this.HistorialService.guardarHistory(history).subscribe((data) => {
      console.log(data);
    });
  }
  isNumber(value) {
    return Number.isNaN(value);
  }
  //determina la fecha de la planilla y variables importantes
  onChange(result: Date[]): void {
    console.log(result);
    if (result !== null) {
      //pasar fechas a moment.js
      var start = moment(result[0], 'YYYY-MM-DD');
      var end = moment(result[1], 'YYYY-MM-DD');
      //calcular diferencia en dias para stepper
      this.diferencia = moment.duration(end.diff(start)).asDays() + 1;
      //moment js get de fechas iniciales (dia,mes,año)
      var dayInicio = moment(result[0]).format('DD');
      var dayFinal = moment(result[1]).format('DD');
      var monthInicio = moment(result[0]).format('MMMM');
      var monthFinal = moment(result[1]).format('MMMM');
      var yearInicio = moment(result[0]).format('YYYY');
      var yearFinal = moment(result[1]).format('YYYY');
      console.log(
        dayInicio,
        dayFinal,
        monthInicio,
        monthFinal,
        yearInicio,
        yearFinal
      );
      // determinar nombre de la planilla
      this.yearAguinaldo = yearInicio;
      if (monthInicio === 'diciembre') {
        this.mesAguinaldo = 'treceavo';
      } else {
        this.mesAguinaldo = 'catorceavo';
      }
      if (yearInicio === yearFinal) {
        if (monthInicio === monthFinal) {
          this.fecha =
            dayInicio +
            ' al ' +
            dayFinal +
            '  ' +
            monthFinal +
            '  ' +
            yearFinal;
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
      //determinar nombre de la planilla
      this.nombre = 'Planilla ' + this.planidescrip + ' del ' + this.fecha;
      //guardar en historial las fechas al inicio del dia
      if (result.length !== 0) {
        this.start = new Date(result[0].setHours(0, 0, 0, 0));
        this.end = new Date(result[1].setHours(0, 0, 0, 0));
        console.log(this.diferencia, this.current);
      }
    }
  }
  //validaciones para ir al paso 2
  disable() {
    this.inicialForm.get('tplanilla').disable();
    this.inicialForm.get('fecha').disable();
    this.inicialForm.get('archivo').disable();
    document.getElementById('btnnext').removeAttribute('disabled');
    document
      .getElementById('btncontinuar')
      .setAttribute('disabled', 'disabled');
  }
  enable() {
    this.inicialForm.get('tplanilla').enable();
    this.inicialForm.get('fecha').enable();
    this.inicialForm.get('archivo').enable();
    document.getElementById('btnnext').setAttribute('disabled', 'disabled');
    document
      .getElementById('btncontinuar')
      .setAttribute('disabled', 'disabled');
  }
  empty(): void {
    this.modal.error({
      nzTitle: 'Informacion Faltante',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Asegúrate de llenar los valores y techos del IHSS, ISR y AFPC utilizando el boton Deducibles.</b>',
      nzClosable: false,
      nzOkDanger: true,
      nzStyle: { left: '5%' },
      nzOnOk: () => this.retry(),
    });
  }
  //modal primer paso
  warning(): void {
    this.isVisibleInicial = true;
    this.modal.confirm({
      nzTitle: 'CONFIRMACIÓN',
      nzContent:
        '<b style="color: red;">¿Está seguro que la fecha y la planilla seleccionada son correctas?.</b>',
      nzOkText: 'Si',
      nzStyle: { left: '5%' },
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => {
        // if (
        //   this.listInfo[0].montoServicioMedico_ISR === 0 ||
        //   this.listInfo[0].porcentajeContribucionTrabajadorEM_IHSS === 0 ||
        //   this.listInfo[0].porcentajeContribucionTrabajadorIVM_IHSS === 0 ||
        //   this.listInfo[0].porcentajeContribucionTrabajador_RAP === 0 ||
        //   this.listInfo[0].techo15_ISR === 0 ||
        //   this.listInfo[0].techo20_ISR === 0 ||
        //   this.listInfo[0].techoEM_IHSS === 0 ||
        //   this.listInfo[0].techoExento_ISR === 0 ||
        //   this.listInfo[0].techoIVM_IHSS === 0 ||
        //   this.listInfo[0].techoIVM_RAP === 0
        // ) {
        //   this.empty();
        // } else {
        let arreglo = [];
        let iguales: number = 0;
        let faltante: number = 0;
        let sobrante: number = 0;
        let duplicados: number = 0;
        let contador: number = 0;
        let invalido: number = 0;
        let reduccion: number = 0;
        for (let x = 0; x < this.jDatos.length; x++) {
          if (!this.jDatos[x].id) {
            this.jDatos[x].id = 0;
            reduccion++;
          }
        }
        console.log('REDUCCION: ', this.jDatos, reduccion);
        if (this.jDatos.length > 0) {
          this.jDatos.sort((a, b) => a.id - b.id);
          console.log(this.jDatos);
          for (let x = 0; x < this.jDatos.length; x++) {
            console.log(
              'X:',
              x,
              'DUP: ',
              duplicados,
              'LENGTH: ',
              this.jDatos.length,
              'ID: ',
              this.jDatos[x].id
            );
            if (x + 1 === this.jDatos.length) {
              console.log('UNDEFINED');
            } else if (
              this.jDatos[x].id === this.jDatos[x + 1].id &&
              this.jDatos[x].id !== undefined &&
              this.jDatos[x + 1].id !== undefined
            ) {
              duplicados++;
            }
          }
        }
        if (this.jDatos.length > 0) {
          for (let j = 0; j < this.jDatos.length; j++) {
            contador = 0;
            for (let i = 0; i < this.listNominaFinal.length; i++) {
              if (this.jDatos[j].id === this.listNominaFinal[i].id) {
                console.log(
                  'IGUALES',
                  'I: ',
                  i,
                  'J: ',
                  j,
                  'JDatosId: ',
                  this.jDatos[j].id,
                  'ListNominaId: ',
                  this.listNominaFinal[i].id
                );
                iguales++;
                if (j + 1 === this.jDatos.length) {
                  console.log('UNDEFINED');
                } else if (this.jDatos[j].id === this.jDatos[j + 1].id) {
                  console.log('RESTA DE DUPLICADOS DETECTADOS');
                  iguales = iguales - 1;
                }
              } else {
                console.log(
                  'DESIGUALES',
                  'I: ',
                  i,
                  'J: ',
                  j,
                  'JDatosId: ',
                  this.jDatos[j].id,
                  'ListNominaId: ',
                  this.listNominaFinal[i].id
                );
                contador++;
                if (contador === this.listNominaFinal.length) {
                  if (this.jDatos[j].id === 0) {
                    arreglo.push('Registro Invalido');
                    invalido++;
                    console.log('ARREGLO:', arreglo, invalido);
                  } else {
                    arreglo.push(this.jDatos[j].id);
                    console.log('ARREGLO:', arreglo);
                  }
                }
              }
            }
          }
        }
        if (duplicados > 0 && reduccion > 0) {
          this.msgInfo =
            this.jDatos.length +
            ' registros en el archivo ' +
            '(' +
            (duplicados - (reduccion - 1)) +
            ')' +
            ' repetidos' +
            ' / ' +
            this.listNominaFinal.length +
            ' colaboradores en la planilla seleccionada';
        } else if (duplicados > 0 && reduccion === 0) {
          this.msgInfo =
            this.jDatos.length +
            ' registros en el archivo ' +
            '(' +
            duplicados +
            ')' +
            ' duplicados' +
            ' / ' +
            this.listNominaFinal.length +
            ' colaboradores en la planilla seleccionada';
        } else {
          this.msgInfo =
            this.jDatos.length +
            ' registros en el archivo / ' +
            this.listNominaFinal.length +
            ' colaboradores en la planilla seleccionada';
        }
        if (arreglo.length >= 0) {
          let tempArreglo = [];
          for (let i = 0; i < arreglo.length; i++) {
            if (arreglo[i] !== 'Registro Invalido') {
              tempArreglo.push(arreglo[i]);
            }
          }
          arreglo.length = 0;
          for (let i = 0; i < tempArreglo.length; i++) {
            arreglo.push(tempArreglo[i]);
          }
          tempArreglo.length = 0;
        }
        if (this.fileUploaded === true) {
          this.hideObv = false;
        }
        if (iguales > 0) {
          this.hideDetectados = false;
          this.msgDetectados =
            'Detectados: ' + iguales + ' / ' + this.listNominaFinal.length;
          faltante = this.listNominaFinal.length - iguales;
        } else {
          faltante = this.listNominaFinal.length;
        }
        if (faltante < 0) {
          sobrante = faltante * -1;
          faltante = 0;
        }
        if (arreglo.length > 0) {
          this.hideErroneos = false;
          this.msgErroneos =
            'Cantidad de registros inválidos: ' +
            arreglo.length +
            ' ⇄ ' +
            "Lista Id's: " +
            arreglo;
        }
        if (faltante > 0 || sobrante > 0 || invalido > 0) {
          this.hideFaltantesSobrantes = false;
          console.log(
            'FALTANTE: ',
            faltante,
            'SOBRANTE: ',
            sobrante,
            'INVALIDO: ',
            invalido
          );
          switch (faltante > 0 || sobrante > 0 || invalido > 0) {
            case faltante > 0 && invalido > 0:
              this.msgFaltantesSobrantes =
                'Registros faltantes: ' +
                faltante +
                ' ✦ ' +
                "Id's vacios ó nulos: " +
                invalido;
              break;
            case faltante > 0:
              this.msgFaltantesSobrantes = 'Registros faltantes: ' + faltante;
              break;
            case sobrante > 0 && invalido > 0:
              this.msgFaltantesSobrantes =
                'Registros sobrantes: ' +
                sobrante +
                ' ✦ ' +
                " Id's vacios ó nulos: " +
                invalido;
              break;
            case sobrante > 0:
              this.msgFaltantesSobrantes = 'Registros sobrantes: ' + sobrante;
              break;
            case faltante === 0 && sobrante === 0 && invalido > 0:
              this.msgFaltantesSobrantes = "Id's vacios ó nulos: " + invalido;
              break;
          }
        }
        this.disable();
        document.getElementById('btnreintentar').removeAttribute('disabled');
        for (let i = 0; i < this.listNomina.length; i++) {
          this.handleEmpleadoClear(this.listNomina[i].id);
        }
        this.totalAguinaldo = 0;
        this.totalCalculados = 0;
        console.log(
          this.seleccionado,
          this.listNomina,
          this.listNominaFinal,
          this.jDatos
        );
        // }
      },
      nzCancelText: 'No',
      nzOnCancel: () => {
        this.inicialForm.reset();
        this.isVisibleInicial = false;
        this.jDatos = [];
      },
    });
  }
  retry(): void {
    this.hideObv = true;
    this.fileUploaded = false;
    this.hideDetectados = true;
    this.hideErroneos = true;
    this.hideFaltantesSobrantes = true;
    this.msgDetectados = '';
    this.msgErroneos = '';
    this.msgFaltantesSobrantes = '';
    this.msgInfo = '';
    this.enable();
    this.inicialForm.reset();
    this.jDatos = [];
    document
      .getElementById('btnreintentar')
      .setAttribute('disabled', 'disabled');
  }
  handleChange(evt: any) {
    this.jDatos = [];
    this.file = evt;
    const target: DataTransfer = <DataTransfer>evt.target;
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const headers = [
        'id',
        'nombreCompleto',
        'lunesEntrada',
        'lunesSalida',
        'lunesEvento',
        'martesEntrada',
        'martesSalida',
        'martesEvento',
        'miercolesEntrada',
        'miercolesSalida',
        'miercolesEvento',
        'juevesEntrada',
        'juevesSalida',
        'juevesEvento',
        'viernesEntrada',
        'viernesSalida',
        'viernesEvento',
        'sabadoEntrada',
        'sabadoSalida',
        'sabadoEvento',
        'domingoEntrada',
        'domingoSalida',
        'domingoEvento',
      ];
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      var nombreHoja = wb.SheetNames; // regresa un array
      let datos = XLSX.utils.sheet_to_json(wb.Sheets[nombreHoja[0]], {
        header: headers,
      });
      //remueve las instrucciones del archivo antes de leerlo, no debe incluir titulos
      datos = datos.slice(6);
      console.log('DATOS', datos);
      for (let i = 0; i < datos.length; i++) {
        const dato = datos[i];
        this.jDatos.push({
          ...(dato as object),
        });
        console.log('Ciclo # ' + i);
        this.reformatJDatos(
          'lunes',
          this.jDatos[i].lunesEntrada,
          this.jDatos[i].lunesSalida,
          this.jDatos[i].lunesEvento,
          i
        );
        this.reformatJDatos(
          'martes',
          this.jDatos[i].martesEntrada,
          this.jDatos[i].martesSalida,
          this.jDatos[i].martesEvento,
          i
        );
        this.reformatJDatos(
          'miercoles',
          this.jDatos[i].miercolesEntrada,
          this.jDatos[i].miercolesSalida,
          this.jDatos[i].miercolesEvento,
          i
        );
        this.reformatJDatos(
          'jueves',
          this.jDatos[i].juevesEntrada,
          this.jDatos[i].juevesSalida,
          this.jDatos[i].juevesEvento,
          i
        );
        this.reformatJDatos(
          'viernes',
          this.jDatos[i].viernesEntrada,
          this.jDatos[i].viernesSalida,
          this.jDatos[i].viernesEvento,
          i
        );
        this.reformatJDatos(
          'sabado',
          this.jDatos[i].sabadoEntrada,
          this.jDatos[i].sabadoSalida,
          this.jDatos[i].sabadoEvento,
          i
        );
        this.reformatJDatos(
          'domingo',
          this.jDatos[i].domingoEntrada,
          this.jDatos[i].domingoSalida,
          this.jDatos[i].domingoEvento,
          i
        );
      }
      // this.error();
      this.isVisibleArchivo = true;
      this.listFinal = [...this.jDatos];
      console.log('RESULTADO FINAL ', this.jDatos);
      this.fileUploaded = true;
    };
    reader.readAsBinaryString(target.files[0]);
  }
  error(): void {
    this.modal.error({
      nzCentered: true,
      nzTitle: 'Archivo Inconsistente',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Asegúrate de elejir el archivo correcto. Revise si hay campos en blanco.</b>',
      nzOkText: 'Okay',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.clean(),
      nzOnCancel: () => this.clean(),
    });
  }
  clean() {
    this.isVisibleArchivo = false;
    this.jDatos = [];
    this.inicialForm.get('archivo').reset();
  }
  reformatJDatos(
    dia: string,
    entrada: any,
    salida: any,
    evento: string,
    posicion: number
  ) {
    //entrada
    let fromExcel = entrada;
    let basenumber = fromExcel * 24;
    let hour = Math.floor(basenumber).toString();
    if (hour.length < 2) {
      hour = '0' + hour;
    }
    var minute = Math.round((basenumber % 1) * 60).toString();
    if (minute.length < 2) {
      minute = '0' + minute;
    }
    let Timestring = hour + ':' + minute;
    var final = moment(Timestring, 'HH:mm a');
    //salida
    let fromExcelb = salida;
    let basenumberb = fromExcelb * 24;
    let hourb = Math.floor(basenumberb).toString();
    if (hourb.length < 2) {
      hourb = '0' + hourb;
    }
    var minuteb = Math.round((basenumberb % 1) * 60).toString();
    if (minuteb.length < 2) {
      minuteb = '0' + minuteb;
    }
    let Timestringb = hourb + ':' + minuteb;
    var finalb = moment(Timestringb, 'HH:mm a');
    console.log('A ' + Timestring, 'B ' + Timestringb, 'POS ', posicion);
    // console.log('FINALES: ', dia, final, finalb, posicion);

    if (dia === 'lunes') {
      if (Timestring === 'NaN:NaN' || Timestringb === 'NaN:NaN') {
        this.jDatos[posicion].lunesEntrada = null;
        this.jDatos[posicion].lunesSalida = null;
      } else {
        this.jDatos[posicion].lunesEntrada = final;
        this.jDatos[posicion].lunesSalida = finalb;
      }
    }
    if (dia === 'martes') {
      if (Timestring === 'NaN:NaN' || Timestringb === 'NaN:NaN') {
        this.jDatos[posicion].martesEntrada = null;
        this.jDatos[posicion].martesSalida = null;
      } else {
        this.jDatos[posicion].martesEntrada = final;
        this.jDatos[posicion].martesSalida = finalb;
      }
    }
    if (dia === 'miercoles') {
      if (Timestring === 'NaN:NaN' || Timestringb === 'NaN:NaN') {
        this.jDatos[posicion].miercolesEntrada = null;
        this.jDatos[posicion].miercolesSalida = null;
      } else {
        this.jDatos[posicion].miercolesEntrada = final;
        this.jDatos[posicion].miercolesSalida = finalb;
      }
    }
    if (dia === 'jueves') {
      if (Timestring === 'NaN:NaN' || Timestringb === 'NaN:NaN') {
        this.jDatos[posicion].juevesEntrada = null;
        this.jDatos[posicion].juevesSalida = null;
      } else {
        this.jDatos[posicion].juevesEntrada = final;
        this.jDatos[posicion].juevesSalida = finalb;
      }
    }
    if (dia === 'viernes') {
      if (Timestring === 'NaN:NaN' || Timestringb === 'NaN:NaN') {
        this.jDatos[posicion].viernesEntrada = null;
        this.jDatos[posicion].viernesSalida = null;
      } else {
        this.jDatos[posicion].viernesEntrada = final;
        this.jDatos[posicion].viernesSalida = finalb;
      }
    }
    if (dia === 'sabado') {
      if (Timestring === 'NaN:NaN' || Timestringb === 'NaN:NaN') {
        this.jDatos[posicion].sabadoEntrada = null;
        this.jDatos[posicion].sabadoSalida = null;
      } else {
        this.jDatos[posicion].sabadoEntrada = final;
        this.jDatos[posicion].sabadoSalida = finalb;
      }
    }
    if (dia === 'domingo') {
      if (Timestring === 'NaN:NaN' || Timestringb === 'NaN:NaN') {
        this.jDatos[posicion].domingoEntrada = null;
        this.jDatos[posicion].domingoSalida = null;
      } else {
        this.jDatos[posicion].domingoEntrada = final;
        this.jDatos[posicion].domingoSalida = finalb;
      }
    }
  }
  handleCancelArchivo() {
    this.isVisibleArchivo = false;
  }
  showArchivo(): void {
    this.isVisibleArchivo = true;
  }
  showArchivoById(): void {
    this.isVisibleArchivo = true;
    for (let x = 0; x < this.jDatos.length; x++) {
      if (this.jDatos[x].id === this.idEmpleado) {
        this.listFinal.length = 0;
        this.listFinal.push(this.jDatos[x]);
        x = this.jDatos.length;
      } else {
        this.listFinal.length = 0;
        this.listFinal = [...this.jDatos];
      }
    }
  }
  handlePage(e: PageEvent) {
    this.page_size = e.pageSize;
    this.page_number = e.pageIndex + 1;
  }
  revisarPorcentajes(valor: number, tipo: string) {
    let result: number = 0;
    switch (valor >= 0) {
      case valor > 1:
        result = valor / 100;
        break;
      case valor === 0 && tipo === 'IHSS':
        result = 0.025;
        break;
      case valor === 0 && tipo === 'RAP':
        result = 0.015;
        break;
      case valor > 0 && valor < 1:
        result = valor;
        break;
    }
    return result;
  }
  //calculo del isr segun su respectiva ley
  ISR() {
    var exento = this.listInfo[0].techoExento_ISR;
    var quince = this.listInfo[0].techo15_ISR;
    var veinte = this.listInfo[0].techo20_ISR;
    //monto exento de pago anuales destinada al pago de servicios medicos
    var montodeducible = this.listInfo[0].montoServicioMedico_ISR;
    var x = this.truncator(this.salario * 12 - montodeducible);
    console.log('X', x);
    var w = 0;
    var y = 0;
    var z = 0;
    if (x <= exento) {
      this.automaticForm.get('isr').setValue(0);
    } else if (x > exento && x <= quince) {
      y = this.truncator(((x - exento + 0.01) * 0.15) / 12);
      this.automaticForm.get('isr').setValue(y);
    } else if (x > quince && x <= veinte) {
      y = ((x - quince + 0.01) * 0.2) / 12;
      z = ((quince - exento + 0.01) * 0.15) / 12;
      this.automaticForm.get('isr').setValue(this.truncator(y + z));
    } else if (x > veinte) {
      y = ((x - veinte + 0.01) * 0.25) / 12;
      z = ((quince - exento + 0.01) * 0.15) / 12;
      w = ((veinte - quince + 0.01) * 0.2) / 12;
      this.automaticForm.get('isr').setValue(this.truncator(y + z + w));
    }
  }
  //calculo del ihss segun su respectiva ley
  //IHSS = EM = 9,849.7(techo) x 2.5% + IVM = 10,282.37(techo) x 2.5%
  IHSS() {
    var techoem = this.listInfo[0].techoEM_IHSS;
    var pctem = this.revisarPorcentajes(
      this.listInfo[0].porcentajeContribucionTrabajadorEM_IHSS,
      'IHSS'
    );
    var techoivm = this.listInfo[0].techoIVM_IHSS;
    var pctivm = this.revisarPorcentajes(
      this.listInfo[0].porcentajeContribucionTrabajadorIVM_IHSS,
      'IHSS'
    );
    var em = 0;
    var ivm = 0;
    em = techoem * pctem;
    ivm = techoivm * pctivm;
    this.automaticForm.get('ihss').setValue(this.truncator(em + ivm));
  }
  //calculo del afpc segun su respectiva ley
  //AFPC = Salario Mensual - 10,282.37(techo) x 1.5%
  AFPC() {
    var salario: number = this.salario;
    var techorap: number = this.round2Decimal(this.listInfo[0].techoIVM_RAP);
    var subtotal = salario - techorap;
    var pctrap = this.revisarPorcentajes(
      this.listInfo[0].porcentajeContribucionTrabajador_RAP,
      'RAP'
    );
    var rap = 0;
    rap = subtotal * pctrap;
    this.automaticForm.get('afpc').setValue(this.truncator(rap));
  }
  // modal segundo paso > 7
  ingresoCompleto(id: number): void {
    this.cantOI = 1;
    this.idEmpleado = id;
    console.log('CANTIDADIO ' + this.cantOI);
    for (let i = 0; i < this.listNomina.length; i++) {
      if (this.listNomina[i].id === id) {
        if (this.listNomina[i].totalPagar === 0) {
          this.totalCalculados = this.totalCalculados + 1;
        } else if (this.listNomina[i].totalPagar > 0) {
          this.totalAPagar = this.round2Decimal(
            this.totalAPagar - this.listNomina[i].totalPagar
          );
        }
        var salario = this.listNomina[i].salarioBase;
        this.listNomina[i].ingresos = salario / 2;
        this.listNomina[i].totalPagar = this.listNomina[i].ingresos;
        if (this.listNomina[i].deducciones > 0) {
          this.listNomina[i].totalPagar = this.round2Decimal(
            this.listNomina[i].ingresos - this.listNomina[i].deducciones
          );
        } else {
          this.listNomina[i].deducciones = 0;
        }
        this.totalAPagar = this.round2Decimal(
          this.totalAPagar + this.listNomina[i].totalPagar
        );
        console.log(this.totalAPagar, this.totalCalculados);
        this.listNominaFinal[i].ingresoBruto = salario / 2;
        this.listNominaFinal[i].feriado = 0;
        this.listNominaFinal[i].incapacidad = 0;
        this.listNominaFinal[i].vacacion = 0;
        this.listNominaFinal[i].ajusteP = 0;
        this.listNominaFinal[i].aguinaldo = 0;
        this.listNominaFinal[i].cantOI = this.cantOI;
        this.listNominaFinal[i].totalObs =
          this.listNominaFinal[i].cantOI + this.listNominaFinal[i].cantOD;
        console.log(this.listNominaFinal[i].totalObs, this.cantOI);
      }
    }
    this.onItemChecked(this.idEmpleado, true);
    document.getElementById('btnnext').removeAttribute('disabled');
    this.cantOI = 0;
  }
  handleAguinaldoSemanal(id: number): void {
    this.idEmpleado = id;
    console.log(
      this.totalCalculados,
      this.isVisibleAguinaldoAdvertencia,
      this.isAdvertenciaIgnored
    );
    if (this.totalCalculados > 0 && this.isAdvertenciaIgnored === false) {
      this.aguinaldoAdvertencia();
    } else {
      var salario: number = 0;
      var ingresos: number = 0;
      this.handleEmpleadoClear(id);
      this.isValidAguinaldo = false;
      this.isVisibleAguinaldo = true;
      this.isDisabledAguinaldo = false;
      for (let i = 0; i < this.listNomina.length; i++) {
        if (this.listNomina[i].id === id) {
          salario = this.listNomina[i].salarioBase;
          ingresos = this.listNomina[i].ingresos;
          console.log(
            'AGUINALDO: ',
            salario,
            ingresos,
            this.totalAPagar,
            this.totalAguinaldo
          );
        }
      }
      this.resumenForm.disable();
      this.resumenForm.get('aguinaldo').setValue(salario);
      this.salarioMinimoPerDia = salario / 30;
    }
  }
  aguinaldoAdvertencia(): void {
    this.isVisibleAguinaldoAdvertencia = true;
    this.modal.error({
      nzCentered: true,
      nzTitle: 'ERROR',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: EL CALCULO ACTUAL CONTIENE DATOS AJENOS AL AGUINALDO, SI PROCEDE PERDERA DICHO TRABAJO.</b>',
      nzOkType: 'primary',
      nzOkText: 'Continuar de todas formas',
      nzCancelText: 'Salir',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => {
        this.isVisibleAguinaldoAdvertencia = false;
        this.isAdvertenciaIgnored = true;
        this.handleAguinaldoSemanal(this.idEmpleado);
      },
      nzOnCancel: () => {
        this.isVisibleAguinaldoAdvertencia = false;
      },
    });
  }
  aguinaldoSemanal(): void {
    var temp: number = this.idEmpleado;
    console.log(this.totalAPagar, this.totalAguinaldo);
    if (this.totalAPagar > 0 && this.totalAguinaldo === 0) {
      for (let i = 0; i < this.listNomina.length; i++) {
        this.handleEmpleadoClear(this.listNomina[i].id);
      }
      this.idEmpleado = temp;
      this.switchValueAguinaldo = true;
    }
    console.log(
      'ENTRADA',
      'a ',
      this.switchValueAguinaldo,
      'b ',
      this.idEmpleado,
      'c ',
      temp,
      'd ',
      this.totalAPagar,
      'e ',
      this.totalAguinaldo
    );
    if (this.current === 1) {
      this.onItemChecked(this.idEmpleado, true);
    }
    if (this.switchValueAguinaldo === true) {
      this.valorAguinaldo = this.round2Decimal(
        this.resumenForm.get('aguinaldo').value
      );
      this.totalAguinaldo = this.round2Decimal(
        this.totalAguinaldo + this.valorAguinaldo
      );
    } else {
      this.valorAguinaldo = this.salarioMinimoPerDia * 30;
      this.totalAguinaldo = this.round2Decimal(
        this.totalAguinaldo + this.valorAguinaldo
      );
    }
    this.sueldo = this.valorAguinaldo;
    this.sueldo = this.round2Decimal(this.sueldo);
    console.log(
      this.switchValueAguinaldo,
      this.valorAguinaldo,
      this.sueldo,
      this.totalAguinaldo
    );
    for (let i = 0; i < this.listNomina.length; i++) {
      if (this.listNomina[i].id === this.idEmpleado) {
        console.log(
          '1: ',
          this.listNomina[i].ingresos,
          this.listNomina[i].totalPagar,
          this.totalAguinaldo,
          this.sueldo
        );
        this.totalCalculados = this.totalCalculados + 1;
        this.listNomina[i].ingresos = this.round2Decimal(this.sueldo);
        this.listNomina[i].totalPagar = this.round2Decimal(
          this.listNomina[i].ingresos - this.listNomina[i].deducciones
        );
        this.totalAPagar = this.totalAPagar + this.listNomina[i].totalPagar;
        this.listNominaFinal[i].ingresos = this.sueldo;
        this.listNominaFinal[i].aguinaldo = this.valorAguinaldo;
        this.listNominaFinal[i].cantOI = 1;
        this.listNominaFinal[i].totalObs =
          this.listNominaFinal[i].cantOI + this.listNominaFinal[i].cantOD;
        console.log(
          '2: ',
          this.totalAguinaldo,
          this.totalAPagar,
          this.sueldo,
          this.listNominaFinal[i]
        );
      }
      document.getElementById('btnnext').removeAttribute('disabled');
    }
    this.resumenForm.get('aguinaldo').disable();
    this.switchValueAguinaldo = false;
    this.isVisibleAguinaldo = false;
    this.isVisibleAguinaldoAdvertencia = true;
    this.isAdvertenciaIgnored = true;
    console.log(
      'SALIDA',
      this.switchValueAguinaldo,
      this.idEmpleado,
      this.totalAPagar,
      this.totalAguinaldo
    );
  }
  handleCancelAguinaldoSem() {
    // console.log(this.idEmpleado, this.limpiarTotalAguinaldo);
    // if (this.limpiarTotalAguinaldo === true) {
    //   this.handleEmpleadoClear(this.idEmpleado);
    // }
    this.valorAguinaldo = 0;
    this.resumenForm.reset();
    this.resumenForm.get('aguinaldo').disable();
    this.isDisabledAguinaldo = true;
    this.switchValueAguinaldo = false;
    this.valorVacacion = 0;
    this.isVisibleAguinaldo = false;
    this.isVisibleAguinaldoAdvertencia = false;
    this.isAdvertenciaIgnored = false;
    console.log(this.listNominaFinal);
  }
  ingresosTotal(): void {
    this.handleEmpleadoClear(this.idEmpleado);
    //calcula valor incapacidad publica
    this.incapacidadpub = this.round2Decimal(
      this.resumenForm.get('incapacidadpub').value
    );
    if (this.incapacidadpub <= 3) {
      this.valorIncapacidadPub = this.round2Decimal(
        this.incapacidadpub * this.salarioMinimoPerDia
      );
      this.resumenForm.get('incapacidadpub').setValue(this.valorIncapacidadPub);
      this.resumenForm.get('incapacidadpub').disable();
    } else if (this.incapacidadpub > 3) {
      this.isVisibleDivPrimario = true;
      this.extraForm.get('incpub').enable();
    }
    //calcula valor incapacidad privada
    this.incapacidadpriv = this.round2Decimal(
      this.resumenForm.get('incapacidadpriv').value
    );
    this.valorIncapacidadPriv = this.truncator(
      this.incapacidadpriv * this.salarioMinimoPerDia
    );
    this.resumenForm.get('incapacidadpriv').setValue(this.valorIncapacidadPriv);
    this.resumenForm.get('incapacidadpriv').disable();
    //valor ajuste
    this.valorAjuste = this.round2Decimal(this.resumenForm.get('ajuste').value);
    this.resumenForm.get('ajuste').disable();
    if (this.valorAjuste === 0) {
      this.resumenForm.get('ajuste').setValue(0);
    }
    //valor aguinaldo
    if (this.isCheckedAguinaldo === true) {
      if (this.switchValueAguinaldo === true) {
        this.valorAguinaldo = this.round2Decimal(
          this.resumenForm.get('aguinaldo').value
        );
        this.totalAguinaldo = this.totalAguinaldo + this.valorAguinaldo;
      } else {
        this.valorAguinaldo = this.salarioMinimoPerDia * 30;
        this.totalAguinaldo = this.totalAguinaldo + this.valorAguinaldo;
      }
    }
    //calcula valor faltas
    this.falta = this.round2Decimal(this.resumenForm.get('faltas').value);
    this.valorFalta = this.truncator(this.falta * this.salarioMinimoPerDia);
    this.resumenForm.get('faltas').setValue(this.valorFalta);
    this.resumenForm.get('faltas').disable();
    //calcula valor autorizados
    this.conpermiso = this.round2Decimal(
      this.resumenForm.get('conpermiso').value
    );
    this.valorAutorizado = this.truncator(
      this.conpermiso * this.salarioMinimoPerDia
    );
    this.resumenForm.get('conpermiso').setValue(this.valorAutorizado);
    this.resumenForm.get('conpermiso').disable();
    //calcula valor suspension
    this.suspension = this.round2Decimal(
      this.resumenForm.get('suspensiones').value
    );
    this.valorSuspension = this.truncator(
      this.suspension * this.salarioMinimoPerDia
    );
    this.resumenForm.get('suspensiones').setValue(this.valorSuspension);
    this.resumenForm.get('suspensiones').disable();
    //calcula valor feriados
    this.feriado = this.round2Decimal(this.resumenForm.get('feriados').value);
    this.valorFeriado = this.truncator(this.feriado * this.salarioMinimoPerDia);
    this.resumenForm.get('feriados').setValue(this.valorFeriado);
    this.resumenForm.get('feriados').disable();
    //calcula valor de vacaciones
    this.vacacion = this.round2Decimal(
      this.resumenForm.get('vacaciones').value
    );
    this.valorVacacion = this.truncator(
      this.vacacion * this.salarioMinimoPerDia
    );
    this.resumenForm.get('vacaciones').setValue(this.valorVacacion);
    this.resumenForm.get('vacaciones').disable();
    var obsv =
      this.falta +
      this.feriado +
      this.incapacidadpub +
      this.incapacidadpriv +
      this.suspension +
      this.vacacion +
      this.conpermiso;
    console.log(
      this.falta,
      this.feriado,
      this.incapacidadpub,
      this.incapacidadpriv,
      this.suspension,
      this.vacacion,
      this.conpermiso,
      this.valorAjuste
    );
    if (this.feriado > 0) {
      this.cantOI = this.cantOI + 2;
    }
    if (this.incapacidadpub > 0) {
      this.cantOI = this.cantOI + 2;
    }
    if (this.vacacion > 0) {
      this.cantOI = this.cantOI + 2;
    }
    if (this.valorAjuste > 0) {
      this.cantOI = this.cantOI + 1;
    }
    if (this.isCheckedAguinaldo !== false) {
      this.cantOI = this.cantOI + 1;
    }
    console.log(this.cantOI, this.isCheckedAguinaldo);

    if (obsv > 15) {
      this.diasCorrectos();
    } else {
      if (this.isCheckedAguinaldo === true) {
        this.sueldo = this.valorAguinaldo;
        this.sueldoNormal = this.valorAguinaldo;
      } else {
        this.sueldo = this.round2Decimal(
          this.salarioMinimoPerDia * 15 -
            this.valorFalta -
            this.valorFeriado -
            this.valorIncapacidadPub -
            this.valorSuspension -
            this.valorVacacion
        );
        this.sueldoNormal = this.round2Decimal(
          this.salarioMinimoPerDia * 15 -
            this.valorFalta -
            this.valorIncapacidadPub -
            this.valorSuspension +
            this.valorAjuste
        );
        this.valorAguinaldo = 0;
      }
      if (this.sueldo > 0) {
        this.cantOI = this.cantOI + 1;
      }
      console.log(
        this.sueldo,
        this.valorAguinaldo,
        this.valorAjuste,
        this.valorAutorizado,
        this.valorFalta,
        this.valorFeriado,
        this.valorIncapacidadPub,
        this.valorIncapacidadPriv,
        this.valorSuspension,
        this.valorVacacion
      );
      for (let i = 0; i < this.listNomina.length; i++) {
        if (this.listNomina[i].id === this.idEmpleado) {
          if (this.listNomina[i].totalPagar === 0) {
            this.totalCalculados = this.totalCalculados + 1;
          } else if (this.listNomina[i].totalPagar > 0) {
            this.totalAPagar = this.totalAPagar - this.listNomina[i].totalPagar;
          }
          //listNomina
          this.listNomina[i].ingresos = this.sueldoNormal;
          this.listNomina[i].totalPagar = this.round2Decimal(
            this.listNomina[i].ingresos - this.listNomina[i].deducciones
          );
          this.totalAPagar = this.totalAPagar + this.listNomina[i].totalPagar;
          //listNominaFinal
          this.listNominaFinal[i].ingresoBruto = this.sueldo;
          this.listNominaFinal[i].feriado = this.valorFeriado;
          this.listNominaFinal[i].incapacidad = this.valorIncapacidadPub;
          this.listNominaFinal[i].vacacion = this.valorVacacion;
          if (this.isCheckedAguinaldo === true) {
            this.listNominaFinal[i].aguinaldo = this.valorAguinaldo;
          } else {
            this.listNominaFinal[i].aguinaldo = 0;
          }
          this.listNominaFinal[i].ajusteP = this.valorAjuste;
          this.listNominaFinal[i].diasferiado = this.feriado;
          this.listNominaFinal[i].diasincapacidad = this.incapacidadpub;
          this.listNominaFinal[i].diasvacacion = this.vacacion;
          this.listNominaFinal[i].diasnoautorizados = this.falta;
          this.listNominaFinal[i].diassuspension = this.suspension;
          this.listNominaFinal[i].diasautorizados =
            this.conpermiso + this.incapacidadpriv;
          this.listNominaFinal[i].cantOI = this.cantOI;
          this.listNominaFinal[i].totalObs =
            this.listNominaFinal[i].cantOI + this.listNominaFinal[i].cantOD;
        }
      }
      this.onItemChecked(this.idEmpleado, true);
      this.sueldoString = this.numberWithCommas(this.sueldoNormal);
      document.getElementById('btnnext').removeAttribute('disabled');
      this.resumenForm.get('aguinaldo').disable();
      this.cboxAguinaldo = true;
      this.isDisabledAguinaldo = true;
    }
    document.getElementById('btnCalculos').setAttribute('disabled', 'disabled');
  }
  diasCorrectos(): void {
    this.isVisibleDiasCorrectos = true;
    this.modal.error({
      nzCentered: true,
      nzTitle: 'ERROR',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Colaborador tiene mas observaciones que dias trabajados.</b>',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.limpiar(),
    });
  }
  showConfirm(): void {
    this.isVisibleGenerar = true;
    this.modal.confirm({
      nzCentered: true,
      nzTitle: 'CONFIRMACIÓN',
      nzContent:
        '<b style="color: red;">¿Esta seguro que la información ingresada es correcta y desea proceder al cálculo de la planilla? ADVERTENCIA: A partir de este punto el archivo se generará con los datos proporcionados.</b>',
      nzOkText: '¡Si, genera el archivo!',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => {
        this.exportExcel(), this.current++;
      },
      nzCancelText: 'No, regrésame',
      nzOnCancel: () => {
        this.isVisibleGenerar = false;
      },
    });
  }
  limpiar(): void {
    // console.log(this.idEmpleado, this.limpiarTotalAguinaldo);
    // if (this.limpiarTotalAguinaldo === true) {
    //   this.handleEmpleadoClear(this.idEmpleado);
    // }
    this.valorAguinaldo = 0;
    this.sueldoString = '0.00';
    this.resumenForm.reset();
    this.resumenForm.get('aguinaldo').disable();
    this.isDisabledAguinaldo = true;
    this.switchValueAguinaldo = false;
    this.cboxAguinaldo = false;
    this.isCheckedAguinaldo = false;
    this.resumenForm.get('ajuste').enable();
    this.resumenForm.get('faltas').enable();
    this.resumenForm.get('conpermiso').enable();
    this.resumenForm.get('feriados').enable();
    this.resumenForm.get('incapacidadpub').enable();
    this.resumenForm.get('incapacidadpriv').enable();
    this.resumenForm.get('septimos').enable();
    this.resumenForm.get('suspensiones').enable();
    this.resumenForm.get('vacaciones').enable();
    this.resetObservacion();
    this.valorVacacion = 0;
    this.isVisibleDiasCorrectos = false;
    document.getElementById('btnCalculos').removeAttribute('disabled');
    this.isVisibleDivPrimario = false;
  }
  handleCancel(): void {
    // this.limpiarTotalAguinaldo = false;
    this.isMainVisible = false;
    this.limpiar();
    // this.limpiarTotalAguinaldo = true;
  }
  resetNominaFinal() {
    for (let i = 0; i < this.listNominaFinal.length; i++) {
      this.listNominaFinal[i].recargo = 0;
      this.listNominaFinal[i].horasNormales = 0;
      this.listNominaFinal[i].lpsNormales = 0;
      this.listNominaFinal[i].horasDiurnas = 0;
      this.listNominaFinal[i].lpsDiurnas = 0;
      this.listNominaFinal[i].horasMixtas = 0;
      this.listNominaFinal[i].lpsMixtas = 0;
      this.listNominaFinal[i].horasNocturnas = 0;
      this.listNominaFinal[i].lpsNocturnas = 0;
      this.listNominaFinal[i].feriado = 0;
      this.listNominaFinal[i].septimo = 0;
      this.listNominaFinal[i].incapacidad = 0;
      this.listNominaFinal[i].vacacion = 0;
      this.listNominaFinal[i].ajusteP = 0;
      this.listNominaFinal[i].ihss = 0;
      this.listNominaFinal[i].isr = 0;
      this.listNominaFinal[i].afpc = 0;
      this.listNominaFinal[i].impvecinal = 0;
      this.listNominaFinal[i].prestamorap = 0;
      this.listNominaFinal[i].aguinaldo = 0;
      this.listNominaFinal[i].anticipo = 0;
      this.listNominaFinal[i].cta = 0;
      this.listNominaFinal[i].viaticos = 0;
      this.listNominaFinal[i].ajuste = 0;
      this.listNominaFinal[i].otros = 0;
      this.listNominaFinal[i].cantOI = 0;
      this.listNominaFinal[i].cantOD = 0;
      this.listNominaFinal[i].totalObs = 0;
      /**/
      this.listNominaFinal[i].diasferiado = 0;
      this.listNominaFinal[i].diasincapacidad = 0;
      this.listNominaFinal[i].diasvacacion = 0;
      this.listNominaFinal[i].diasnoautorizados = 0;
      this.listNominaFinal[i].diassuspension = 0;
      this.listNominaFinal[i].diasautorizados = 0;
      this.listNominaFinal[i].ingresos = 0;
      this.listNominaFinal[i].deducciones = 0;
      this.listNominaFinal[i].totalPagar = 0;
    }
  }
  // stepper
  next(): void {
    console.log(this.current, this.totalCalculados);
    if (this.current === 0) {
      this.current += 1;
      this.resetNominaFinal();
      document.getElementById('btnnext').setAttribute('disabled', 'disabled');
    }
    if (this.current === 1 && this.totalCalculados > 0) {
      let comprobantesTemp = [];
      comprobantesTemp.push(...this.listNominaFinal);
      const array = Array.from(this.setOfCheckedId);
      for (let k = 0; k < comprobantesTemp.length; k++) {
        console.log(
          'OBS: ',
          comprobantesTemp[k].id,
          comprobantesTemp[k].totalObs
        );
      }
      console.log(
        '1er',
        'list: ',
        comprobantesTemp,
        array,
        this.listComprobantes,
        this.listNomina,
        this.listNominaFinal
      );
      for (let j = 0; j < array.length; j++) {
        for (let i = 0; i < comprobantesTemp.length; i++) {
          console.log('I: ', i, j, comprobantesTemp[i].id, array[j]);
          if (comprobantesTemp[i].id === array[j]) {
            this.listComprobantes[j] = comprobantesTemp[i];
            console.log('ENTRO ', this.listComprobantes);
          }
        }
      }
      comprobantesTemp.length = 0;
      comprobantesTemp = this.listComprobantes;
      const sorted = comprobantesTemp.slice().sort();
      this.listComprobantes.length = 0;
      this.listComprobantes = sorted.sort((a, b) => b.totalObs - a.totalObs);
      console.log(
        '2nd',
        'list: ',
        comprobantesTemp,
        array,
        this.listComprobantes,
        this.listNomina,
        this.listNominaFinal
      );
      this.showConfirm();
    }
  }
  //SheetJS
  exportExcel(): void {
    console.log(this.totalAguinaldo);

    /* table id is passed over here */
    var planilla = document.getElementById('nominaFinal');
    var comprobantes = document.getElementById('final');
    var comprobantesv2 = document.getElementById('finalv2');
    if (this.diferencia <= 7) {
      if (this.totalAguinaldo <= 0) {
        var tarjeta = document.getElementById('tarjetas');
        var calculos = document.getElementById('calculosIngresos');
      }
    }
    /* worksheets */
    const wsPlanilla: XLSX.WorkSheet = XLSX.utils.table_to_sheet(planilla);
    const wsComprobantes: XLSX.WorkSheet =
      XLSX.utils.table_to_sheet(comprobantes);
    const wsComprobantesV2: XLSX.WorkSheet =
      XLSX.utils.table_to_sheet(comprobantesv2);
    if (this.diferencia <= 7) {
      if (this.totalAguinaldo <= 0) {
        var wsTarjetas: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tarjeta);
        var wsCalculos: XLSX.WorkSheet = XLSX.utils.table_to_sheet(calculos);
      }
    }
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsPlanilla, 'Planilla');
    XLSX.utils.book_append_sheet(wb, wsComprobantes, 'Comprobantes');
    XLSX.utils.book_append_sheet(wb, wsComprobantesV2, 'Comprobantes part. 2');
    if (this.diferencia <= 7) {
      if (this.totalAguinaldo <= 0) {
        XLSX.utils.book_append_sheet(wb, wsTarjetas, 'T de Planilla');
        XLSX.utils.book_append_sheet(wb, wsCalculos, 'Calculos de Ingresos');
      }
    }
    /* save to excel-file which will be downloaded */
    XLSX.writeFile(wb, this.nombre + '.xlsx');
    /* write and save file */
    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    console.log(data);
    this.fileGenerado = data;
    /* post historial */
    if (this.archivoGenerado === false) {
      this.guardarHistorial();
      this.archivoGenerado = true;
    }
    /* upload file */
    // this.uploadFile(data);
  }
  descargarPlantilla(): void {
    let link = document.createElement('a');
    link.href = '/assets/plantillaNomina.xlsx';
    link.click();
  }
  //viejo metodo subir archivo
  // uploadFile(file: Blob) {
  //   this.AzureBlobStorageService.uploadBlob(
  //     this.AzureBlobStorageService.code,
  //     file,
  //     this.nombre + '.xlsx',
  //     () => {}
  //   );
  // }
  //nuevo metodo subir archivo
  // uploadFile(files: Blob) {
  //   this.BlobsService.upload(files).subscribe(
  //     ({ path }) => (this.imageSource = path)
  //   );
  // }
  // modal segundo paso diferencia === 7
  handleEmpleado(
    id: number,
    salario: number,
    nombre: string,
    apellido: string
  ): void {
    console.log(id, salario, nombre + ' ' + apellido);
    console.log(this.jDatos, this.listFinal);
    this.isMainVisible = true;
    this.salarioString = this.numberWithCommas(salario);
    this.salarioMinimoPerDia = salario / 30;
    this.salarioMinimoPerHour = this.truncator(salario / 30) / 8;
    this.recargo = this.truncator(this.salarioMinimoPerHour);
    this.idEmpleado = id;
    this.nombreCompleto = nombre + ' ' + apellido;
    this.EmpleadosService.cargarEmpleados(id).subscribe((data) => {
      if (data.permanente === true) {
        this.switchValuePP = false;
      } else {
        this.switchValuePP = true;
      }
    });
    console.log(this.switchValuePP);
    if (this.fileUploaded === true) {
      var luIControl: string = '';
      var luOControl: string = '';
      var maIControl: string = '';
      var maOControl: string = '';
      var miIControl: string = '';
      var miOControl: string = '';
      var juIControl: string = '';
      var juOControl: string = '';
      var viIControl: string = '';
      var viOControl: string = '';
      var saIControl: string = '';
      var saOControl: string = '';
      var doIControl: string = '';
      var doOControl: string = '';
      var lunesSelect: string = '';
      var martesSelect: string = '';
      var miercolesSelect: string = '';
      var juevesSelect: string = '';
      var viernesSelect: string = '';
      var sabadoSelect: string = '';
      var domingoSelect: string = '';

      for (let x = 0; x < this.jDatos.length; x++) {
        if (this.jDatos[x].id === id) {
          luIControl = moment(this.jDatos[x].lunesEntrada).format('HH:mm');
          luOControl = moment(this.jDatos[x].lunesSalida).format('HH:mm');
          maIControl = moment(this.jDatos[x].martesEntrada).format('HH:mm');
          maOControl = moment(this.jDatos[x].martesSalida).format('HH:mm');
          miIControl = moment(this.jDatos[x].miercolesEntrada).format('HH:mm');
          miOControl = moment(this.jDatos[x].miercolesSalida).format('HH:mm');
          juIControl = moment(this.jDatos[x].juevesEntrada).format('HH:mm');
          juOControl = moment(this.jDatos[x].juevesSalida).format('HH:mm');
          viIControl = moment(this.jDatos[x].viernesEntrada).format('HH:mm');
          viOControl = moment(this.jDatos[x].viernesSalida).format('HH:mm');
          saIControl = moment(this.jDatos[x].sabadoEntrada).format('HH:mm');
          saOControl = moment(this.jDatos[x].sabadoSalida).format('HH:mm');
          doIControl = moment(this.jDatos[x].domingoEntrada).format('HH:mm');
          doOControl = moment(this.jDatos[x].domingoSalida).format('HH:mm');
          lunesSelect = this.jDatos[x].lunesEvento;
          martesSelect = this.jDatos[x].martesEvento;
          miercolesSelect = this.jDatos[x].miercolesEvento;
          juevesSelect = this.jDatos[x].juevesEvento;
          viernesSelect = this.jDatos[x].viernesEvento;
          sabadoSelect = this.jDatos[x].sabadoEvento;
          domingoSelect = this.jDatos[x].domingoEvento;
        }
      }
      this.horasForm.get('luIControl').setValue(luIControl);
      this.horasForm.get('luOControl').setValue(luOControl);
      this.horasForm.get('maIControl').setValue(maIControl);
      this.horasForm.get('maOControl').setValue(maOControl);
      this.horasForm.get('miIControl').setValue(miIControl);
      this.horasForm.get('miOControl').setValue(miOControl);
      this.horasForm.get('juIControl').setValue(juIControl);
      this.horasForm.get('juOControl').setValue(juOControl);
      this.horasForm.get('viIControl').setValue(viIControl);
      this.horasForm.get('viOControl').setValue(viOControl);
      this.horasForm.get('saIControl').setValue(saIControl);
      this.horasForm.get('saOControl').setValue(saOControl);
      this.horasForm.get('doIControl').setValue(doIControl);
      this.horasForm.get('doOControl').setValue(doOControl);
      this.descriForm.get('lunesSelect').setValue(lunesSelect);
      this.descriForm.get('martesSelect').setValue(martesSelect);
      this.descriForm.get('miercolesSelect').setValue(miercolesSelect);
      this.descriForm.get('juevesSelect').setValue(juevesSelect);
      this.descriForm.get('viernesSelect').setValue(viernesSelect);
      this.descriForm.get('sabadoSelect').setValue(sabadoSelect);
      this.descriForm.get('domingoSelect').setValue(domingoSelect);
    }
  }
  handleMainCancel(): void {
    this.limpiarMain();
    this.isMainVisible = false;
  }
  handleEmpleadoDeduccion(
    id: number,
    salario: number,
    nombre: string,
    apellido: string
  ): void {
    this.idEmpleado = id;
    this.nombreCompleto = nombre + ' ' + apellido;
    this.salario = salario;
    if (this.totalAguinaldo > 0) {
      this.isVisibleAguinaldoDeduccion = true;
    } else {
      this.isVisibleDeduccion = true;
      this.ISR();
      this.IHSS();
      this.AFPC();
      console.log('CORRIO TODOS');
    }
    for (let i = 0; i < this.listNomina.length; i++) {
      if (this.listNomina[i].id === this.idEmpleado) {
        if (this.listNomina[i].ingresos === 0) {
          this.sueldoAlDeducirString = '0.00';
        } else {
          this.sueldoAlDeducirString = this.numberWithCommas(
            this.listNomina[i].ingresos
          );
        }
      }
    }
    this.btnDeduccionEnable();
  }
  modificarDeducibles() {
    this.isVisibleDeducible = true;
  }
  handleCancelDeducibles() {
    this.isVisibleDeducible = false;
    this.infoForm.reset();
    this.cargarInfo();
    this.switchValueTechoEM_IHSS = false;
    this.switchValueTechoIVM_IHSS = false;
    this.switchValuePorcentajeEM_IHSS = false;
    this.switchValuePorcentajeIVM_IHSS = false;
    this.switchValueTechoIVM_RAP = false;
    this.switchValuePorcentajeIVM_RAP = false;
    this.switchValueTechoExento_ISR = false;
    this.switchValueTecho15_ISR = false;
    this.switchValueTecho20_ISR = false;
    this.switchValueMontoServicioMedico_ISR = false;
  }
  handleOkDeducibles() {
    this.isVisibleDeducible = false;
    const info: Info = {
      id: 1,
      razonSocial: this.listInfo[0].razonSocial,
      sitioWeb: this.listInfo[0].sitioWeb,
      fechaFundacion: this.listInfo[0].fechaFundacion,
      direccionPrincipal: this.listInfo[0].direccionPrincipal,
      email: this.listInfo[0].email,
      codigoPostal: this.listInfo[0].codigoPostal,
      bio: this.listInfo[0].bio,
      techoEM_IHSS: this.infoForm.get('techoEM_IHSS').value,
      techoIVM_IHSS: this.infoForm.get('techoIVM_IHSS').value,
      porcentajeContribucionTrabajadorEM_IHSS: this.infoForm.get(
        'porcentajeContribucionTrabajadorEM_IHSS'
      ).value,
      porcentajeContribucionTrabajadorIVM_IHSS: this.infoForm.get(
        'porcentajeContribucionTrabajadorIVM_IHSS'
      ).value,
      techoIVM_RAP: this.infoForm.get('techoIVM_RAP').value,
      porcentajeContribucionTrabajador_RAP: this.infoForm.get(
        'porcentajeContribucionTrabajador_RAP'
      ).value,
      techoExento_ISR: this.infoForm.get('techoExento_ISR').value,
      techo15_ISR: this.infoForm.get('techo15_ISR').value,
      techo20_ISR: this.infoForm.get('techo20_ISR').value,
      montoServicioMedico_ISR: this.infoForm.get('montoServicioMedico_ISR')
        .value,
    };
    console.log(this.listInfo, info);
    this.InfoService.actualizarInfo(1, info).subscribe((data) => {
      this.infoForm.reset();
      this.cargarInfo();
    });
    this.switchValueTechoEM_IHSS = false;
    this.switchValueTechoIVM_IHSS = false;
    this.switchValuePorcentajeEM_IHSS = false;
    this.switchValuePorcentajeIVM_IHSS = false;
    this.switchValueTechoIVM_RAP = false;
    this.switchValuePorcentajeIVM_RAP = false;
    this.switchValueTechoExento_ISR = false;
    this.switchValueTecho15_ISR = false;
    this.switchValueTecho20_ISR = false;
    this.switchValueMontoServicioMedico_ISR = false;
  }
  handleEmpleadoClear(id: number) {
    console.log(id);
    this.idEmpleado = id;
    this.valorAguinaldo = 0;
    for (let i = 0; i < this.listNomina.length; i++) {
      if (this.listNomina[i].id === this.idEmpleado) {
        if (this.totalCalculados > 0 && this.listNomina[i].totalPagar !== 0) {
          this.totalCalculados = this.totalCalculados - 1;
        }
        this.listNomina[i].ingresos = 0;
        this.listNomina[i].deducciones = 0;
        if (this.listNomina[i].totalPagar !== undefined) {
          this.totalAPagar = this.totalAPagar - this.listNomina[i].totalPagar;
          this.listNomina[i].totalPagar = 0;
        }
        //ingresos listnominafinal
        this.totalAguinaldo =
          this.round2Decimal(this.totalAguinaldo) -
          this.round2Decimal(this.listNominaFinal[i].aguinaldo);
        console.log(
          'TOTAL AGUINALDO: ',
          this.idEmpleado,
          this.totalAguinaldo,
          this.listNominaFinal[i].aguinaldo
        );
        this.listNominaFinal[i].ingresoBruto = 0;
        this.listNominaFinal[i].recargo = 0;
        this.listNominaFinal[i].horasNormales = 0;
        this.listNominaFinal[i].lpsNormales = 0;
        this.listNominaFinal[i].horasDiurnas = 0;
        this.listNominaFinal[i].lpsDiurnas = 0;
        this.listNominaFinal[i].horasMixtas = 0;
        this.listNominaFinal[i].lpsMixtas = 0;
        this.listNominaFinal[i].horasNocturnas = 0;
        this.listNominaFinal[i].lpsNocturnas = 0;
        this.listNominaFinal[i].feriado = 0;
        this.listNominaFinal[i].incapacidad = 0;
        this.listNominaFinal[i].septimo = 0;
        this.listNominaFinal[i].vacacion = 0;
        this.listNominaFinal[i].ajusteP = 0;
        this.listNominaFinal[i].cantOI = 0;
        this.listNominaFinal[i].totalObs = 0;
        this.listNominaFinal[i].aguinaldo = 0;
        this.listNominaFinal[i].diasferiado = 0;
        this.listNominaFinal[i].diasincapacidad = 0;
        this.listNominaFinal[i].diasvacacion = 0;
        this.listNominaFinal[i].diasnoautorizados = 0;
        this.listNominaFinal[i].diassuspension = 0;
        this.listNominaFinal[i].diasautorizados = 0;
        this.listNominaFinal[i].ingresos = 0;
        //deducciones listnominafinal
        this.listNominaFinal[i].cantOD = 0;
        this.listNominaFinal[i].ihss = 0;
        this.listNominaFinal[i].isr = 0;
        this.listNominaFinal[i].afpc = 0;
        this.listNominaFinal[i].impvecinal = 0;
        this.listNominaFinal[i].anticipo = 0;
        this.listNominaFinal[i].prestamorap = 0;
        this.listNominaFinal[i].cta = 0;
        this.listNominaFinal[i].viaticos = 0;
        this.listNominaFinal[i].ajuste = 0;
        this.listNominaFinal[i].otros = 0;
        this.listNominaFinal[i].deducciones = 0;
        this.listNominaFinal[i].totalPagar = 0;
      }
    }
    // console.log(this.listTarjeta.length);
    for (let j = 0; j < this.listTarjeta.length; j++) {
      if (this.listTarjeta[j].id === this.idEmpleado) {
        this.listTarjeta[j].XDD = 0;
        this.listTarjeta[j].XDJ = 0;
        this.listTarjeta[j].XDL = 0;
        this.listTarjeta[j].XDM = 0;
        this.listTarjeta[j].XDMi = 0;
        this.listTarjeta[j].XDS = 0;
        this.listTarjeta[j].XDV = 0;
        this.listTarjeta[j].XMD = 0;
        this.listTarjeta[j].XMJ = 0;
        this.listTarjeta[j].XML = 0;
        this.listTarjeta[j].XMM = 0;
        this.listTarjeta[j].XMMi = 0;
        this.listTarjeta[j].XMS = 0;
        this.listTarjeta[j].XMV = 0;
        this.listTarjeta[j].XND = 0;
        this.listTarjeta[j].XNJ = 0;
        this.listTarjeta[j].XNL = 0;
        this.listTarjeta[j].XNM = 0;
        this.listTarjeta[j].XNMi = 0;
        this.listTarjeta[j].XNS = 0;
        this.listTarjeta[j].XNV = 0;
        this.listTarjeta[j].domingoE = '00:00';
        this.listTarjeta[j].domingoS = '00:00';
        this.listTarjeta[j].horasD = 0;
        this.listTarjeta[j].horasJ = 0;
        this.listTarjeta[j].horasL = 0;
        this.listTarjeta[j].horasM = 0;
        this.listTarjeta[j].horasMi = 0;
        this.listTarjeta[j].horasS = 0;
        this.listTarjeta[j].horasV = 0;
        this.listTarjeta[j].jornadaD = 0;
        this.listTarjeta[j].jornadaJ = 0;
        this.listTarjeta[j].jornadaL = 0;
        this.listTarjeta[j].jornadaM = 0;
        this.listTarjeta[j].jornadaMi = 0;
        this.listTarjeta[j].jornadaS = 0;
        this.listTarjeta[j].jornadaV = 0;
        this.listTarjeta[j].juevesE = '00:00';
        this.listTarjeta[j].juevesS = '00:00';
        this.listTarjeta[j].lunesE = '00:00';
        this.listTarjeta[j].lunesS = '00:00';
        this.listTarjeta[j].martesE = '00:00';
        this.listTarjeta[j].martesS = '00:00';
        this.listTarjeta[j].miercolesE = '00:00';
        this.listTarjeta[j].miercolesS = '00:00';
        this.listTarjeta[j].sabadoE = '00:00';
        this.listTarjeta[j].sabadoS = '00:00';
        this.listTarjeta[j].totalD = 0;
        this.listTarjeta[j].totalM = 0;
        this.listTarjeta[j].totalN = 0;
        this.listTarjeta[j].viernesE = '00:00';
        this.listTarjeta[j].viernesS = '00:00';
      }
    }
    if (this.current === 1) {
      this.onItemChecked(id, false);
    }
    console.log('REVISAR ESTADO: ' + this.current, this.totalCalculados);
    if (this.current === 1 && this.totalCalculados === 0) {
      document.getElementById('btnnext').setAttribute('disabled', 'disabled');
      this.switchValueAguinaldo = false;
      this.isVisibleAguinaldoAdvertencia = false;
      this.isAdvertenciaIgnored = false;
    }
  }
  handleMainDeduccionCancel(): void {
    this.limpiarMainDeduccion();
    this.isVisibleDeduccion = false;
    this.isVisibleAguinaldoDeduccion = false;
    this.isDisabledIHSS = false;
    this.isDisabledISR = false;
    this.isDisableAFPC = false;
  }
  btnDeduccionEnable() {
    if (this.totalAguinaldo > 0) {
      if (this.isCheckedAjuste === false && this.isCheckedVarios === false) {
        document
          .getElementById('btnCalcularDeduccion')
          .removeAttribute('disabled');
      }
    } else {
      if (
        (this.isCheckedIHSS === true ||
          this.isCheckedISR === true ||
          this.isCheckedAFPC === true) &&
        this.isCheckedImpVecinal === false &&
        this.isCheckedPrestamoRap === false &&
        this.isCheckedAnticipo === false &&
        this.isCheckedCTAEmpresa === false &&
        this.isCheckedTransporte === false &&
        this.isCheckedAjuste === false &&
        this.isCheckedVarios === false
      ) {
        document
          .getElementById('btnCalcularDeduccion')
          .removeAttribute('disabled');
      }
    }
  }
  deduccionTotal() {
    if (this.diferencia >= 8) {
      this.valorIHSS = this.round2Decimal(this.automaticForm.get('ihss').value);
      this.valorISR = this.round2Decimal(this.automaticForm.get('isr').value);
      this.valorAFPC = this.round2Decimal(this.automaticForm.get('afpc').value);
      this.valorAnticipo = this.round2Decimal(
        this.deduccionFormQuincenal.get('anticipo').value
      );
      this.valorPrestamoRap = this.round2Decimal(
        this.deduccionFormQuincenal.get('prestamorap').value
      );
      this.valorImpVecinal = this.round2Decimal(
        this.deduccionFormQuincenal.get('impvecinal').value
      );
      this.valorCTAEmpresa = this.round2Decimal(
        this.deduccionFormQuincenal.get('ctaempresa').value
      );
      this.valorTransporte = this.round2Decimal(
        this.deduccionFormQuincenal.get('transporte').value
      );
      this.valorAjuste = this.round2Decimal(
        this.deduccionFormQuincenal.get('ajuste').value
      );
      this.valorVarios = this.round2Decimal(
        this.deduccionFormQuincenal.get('varios').value
      );
    } else {
      if (this.totalAguinaldo > 0) {
        this.valorIHSS = 0;
        this.valorISR = 0;
        this.valorImpVecinal = 0;
        this.valorCTAEmpresa = 0;
        this.valorTransporte = 0;
        this.valorAjuste = this.round2Decimal(
          this.aguinaldoForm.get('ajuste').value
        );
        this.valorVarios = this.round2Decimal(
          this.aguinaldoForm.get('varios').value
        );
      } else {
        this.valorIHSS = this.round2Decimal(
          this.automaticForm.get('ihss').value
        );
        this.valorISR = this.round2Decimal(this.automaticForm.get('isr').value);
        console.log(this.valorIHSS, this.valorISR);
        this.valorImpVecinal = this.round2Decimal(
          this.deduccionForm.get('impvecinal').value
        );
        this.valorCTAEmpresa = this.round2Decimal(
          this.deduccionForm.get('ctaempresa').value
        );
        this.valorTransporte = this.round2Decimal(
          this.deduccionForm.get('transporte').value
        );
        this.valorAjuste = this.round2Decimal(
          this.deduccionForm.get('ajuste').value
        );
        this.valorVarios = this.round2Decimal(
          this.deduccionForm.get('varios').value
        );
      }
    }
    this.cboxAll = true;
    this.cboxIHSS = true;
    this.cboxISR = true;
    this.cboxAFPC = true;
    this.cboxImpVecinal = true;
    this.cboxPrestamoRap = true;
    this.cboxAnticipo = true;
    this.cboxCTAEmpresa = true;
    this.cboxViaticos = true;
    this.cboxOtros = true;
    this.cboxAjuste = true;
    this.deduccionForm.disable();
    this.aguinaldoForm.disable();
    this.deduccionFormQuincenal.disable();
    this.automaticForm.disable();
    this.switchValueAFPC = false;
    this.switchValueIHSS = false;
    this.switchValueISR = false;
    this.isDisabledIHSS = true;
    this.isDisableAFPC = true;
    this.isDisabledISR = true;
    if (this.diferencia >= 8) {
      this.deduccion =
        this.valorIHSS +
        this.valorISR +
        this.valorImpVecinal +
        this.valorCTAEmpresa +
        this.valorTransporte +
        this.valorAjuste +
        this.valorVarios +
        this.valorAFPC +
        this.valorAnticipo +
        this.valorPrestamoRap;
    } else {
      this.deduccion =
        this.valorIHSS +
        this.valorISR +
        this.valorImpVecinal +
        this.valorCTAEmpresa +
        this.valorTransporte +
        this.valorAjuste +
        this.valorVarios;
    }
    console.log(
      this.valorIHSS,
      this.valorISR,
      this.valorAFPC,
      this.valorImpVecinal,
      this.valorCTAEmpresa,
      this.valorTransporte,
      this.valorAjuste,
      this.valorVarios,
      this.valorPrestamoRap,
      this.valorAnticipo,
      this.deduccion
    );
    if (this.valorIHSS > 0) {
      this.cantOD = this.cantOD + 1;
    }
    if (this.valorISR > 0) {
      this.cantOD = this.cantOD + 1;
    }
    if (this.valorImpVecinal > 0) {
      this.cantOD = this.cantOD + 1;
    }
    if (this.valorCTAEmpresa > 0) {
      this.cantOD = this.cantOD + 1;
    }
    if (this.valorTransporte > 0) {
      this.cantOD = this.cantOD + 1;
    }
    if (this.valorAjuste > 0) {
      this.cantOD = this.cantOD + 1;
    }
    if (this.valorVarios > 0) {
      this.cantOD = this.cantOD + 1;
    }
    if (this.valorAnticipo > 0) {
      this.cantOD = this.cantOD + 1;
    }
    if (this.valorAFPC > 0) {
      this.cantOD = this.cantOD + 1;
    }
    if (this.valorPrestamoRap > 0) {
      this.cantOD = this.cantOD + 1;
    }
    this.deduccion = this.round2Decimal(this.deduccion);
    console.log('DEDUCCION: ', this.deduccion);
    if (this.deduccion === 0) {
      this.deduccionString = '0.00';
    } else {
      this.deduccionString = this.numberWithCommas(this.deduccion);
    }
    document
      .getElementById('btnCalcularDeduccion')
      .setAttribute('disabled', 'true');
    for (let i = 0; i < this.listNomina.length; i++) {
      if (this.listNomina[i].id === this.idEmpleado) {
        var temp = this.listNomina[i].ingresos;
      }
    }
    if (temp < this.deduccion) {
      this.masDeduccionesMenosIngresos();
    } else {
      for (let i = 0; i < this.listNomina.length; i++) {
        if (this.listNomina[i].id === this.idEmpleado) {
          this.listNomina[i].deducciones = this.deduccion;
          console.log('AJUSTE POSITIVO ' + this.listNomina[i].ajusteP);
          this.listNomina[i].totalPagar = this.round2Decimal(
            this.listNomina[i].ingresos - this.listNomina[i].deducciones
          );
          this.totalAPagar = this.totalAPagar - this.listNomina[i].deducciones;
          console.log(this.totalAPagar);
          this.listNominaFinal[i].ihss = this.valorIHSS;
          this.listNominaFinal[i].isr = this.valorISR;
          if (this.diferencia >= 8) {
            this.listNominaFinal[i].afpc = this.valorAFPC;
            this.listNominaFinal[i].anticipo = this.valorAnticipo;
            this.listNominaFinal[i].prestamorap = this.valorPrestamoRap;
          }
          this.listNominaFinal[i].cantOD = this.cantOD;
          console.log(
            this.listNominaFinal[i].cantOI,
            this.listNominaFinal[i].cantOD
          );
          this.listNominaFinal[i].totalObs =
            this.listNominaFinal[i].cantOI + this.listNominaFinal[i].cantOD;
          console.log(this.listNominaFinal[i].totalObs);
          this.listNominaFinal[i].impvecinal = this.valorImpVecinal;
          this.listNominaFinal[i].cta = this.valorCTAEmpresa;
          this.listNominaFinal[i].viaticos = this.valorTransporte;
          this.listNominaFinal[i].ajuste = this.valorAjuste;
          this.listNominaFinal[i].otros = this.valorVarios;
          this.listNominaFinal[i].deducciones = this.deduccion;
          this.listNominaFinal[i].totalPagar = this.round2Decimal(
            this.listNominaFinal[i].ingresos -
              this.listNominaFinal[i].deducciones
          );
        }
      }
    }
  }
  masDeduccionesMenosIngresos(): void {
    this.isVisibleMasEsMenos = true;
    this.modal.error({
      nzCentered: true,
      nzTitle: 'ERROR',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Colaborador tiene mas deducciones que ingresos.</b>',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.limpiarMainDeduccion(),
    });
  }
  jornadaIncapacidadPriv(jornada: string) {
    if (jornada === 'Diurna') {
      this.requiredCompletarIncapacidadPrivada =
        8 * this.incapacidadpriv - this.incapacidadReal * 4;
    } else if (jornada === 'Mixta') {
      this.requiredCompletarIncapacidadPrivada = 7 * this.incapacidadpriv;
    } else if (jornada === 'Nocturna') {
      this.requiredCompletarIncapacidadPrivada = 6 * this.incapacidadpriv;
    }
  }
  onChangeJornada() {
    if (this.incapacidadpriv >= 1) {
      document.getElementById('btnCalcular').setAttribute('disabled', 'true');
      this.extraFormSecundario.get('jornadaSelect').enable();
      this.cambioRevisarJornada =
        this.extraFormSecundario.get('jornadaSelect').value;
      this.jornadaIncapacidadPriv(this.cambioRevisarJornada);
      console.log(
        this.totalExtrasDiurnas,
        this.totalExtrasMixtas,
        this.totalExtrasNocturnas,
        this.requiredCompletarIncapacidadPrivada
      );
    }
  }
  onAllChecked(value: boolean): void {
    if (value === false) {
      if (this.totalAguinaldo > 0) {
        this.isCheckedAjuste = false;
        this.isCheckedVarios = false;
        this.aguinaldoForm.disable();
        this.aguinaldoForm.get('varios').setValue('');
        this.aguinaldoForm.get('ajuste').setValue('');
        this.allFake();
      } else {
        this.isCheckedIHSS = false;
        this.isCheckedISR = false;
        this.isCheckedImpVecinal = false;
        this.isCheckedCTAEmpresa = false;
        this.isCheckedTransporte = false;
        this.isCheckedAjuste = false;
        this.isCheckedVarios = false;
        this.isCheckedAFPC = false;
        this.isCheckedAnticipo = false;
        this.isCheckedPrestamoRap = false;
        this.indeterminate = false;
        this.deduccionForm.disable();
        this.deduccionForm.get('varios').setValue('');
        this.deduccionForm.get('ajuste').setValue('');
        this.deduccionForm.get('transporte').setValue('');
        this.deduccionForm.get('impvecinal').setValue('');
        this.deduccionForm.get('ctaempresa').setValue('');
        this.deduccionFormQuincenal.disable();
        this.deduccionFormQuincenal.get('varios').setValue('');
        this.deduccionFormQuincenal.get('ajuste').setValue('');
        this.deduccionFormQuincenal.get('transporte').setValue('');
        this.deduccionFormQuincenal.get('impvecinal').setValue('');
        this.deduccionFormQuincenal.get('ctaempresa').setValue('');
        this.deduccionFormQuincenal.get('prestamorap').setValue('');
        this.deduccionFormQuincenal.get('anticipo').setValue('');
        this.isDisabledIHSS = true;
        this.isDisabledISR = true;
        this.isDisableAFPC = true;
        this.switchValueIHSS = false;
        this.switchValueISR = false;
        this.switchValueAFPC = false;
        this.automaticForm.reset();
        this.automaticForm.disable();
        this.allFake();
      }
    } else if (value === true) {
      if (this.totalAguinaldo > 0) {
        this.isCheckedAjuste = true;
        this.isCheckedVarios = true;
        this.indeterminate = false;
        this.limpiarMainDeduccion();
      } else {
        this.isCheckedIHSS = true;
        this.isCheckedISR = true;
        this.isCheckedImpVecinal = true;
        this.isCheckedCTAEmpresa = true;
        this.isCheckedTransporte = true;
        this.isCheckedAjuste = true;
        this.isCheckedVarios = true;
        this.isCheckedAFPC = true;
        this.isCheckedAnticipo = true;
        this.isCheckedPrestamoRap = true;
        this.indeterminate = false;
        this.limpiarMainDeduccion();
      }
    }
  }
  Search(value: string) {
    if (this.listTemporal === null) {
      var sorted = this.listNominaFinal.slice().sort();
      var listTemp = sorted.sort((a, b) => a.id - b.id);
      console.log(this.listNominaFinal, this.listNomina, listTemp, sorted);
    }
    if (value !== '' && value !== undefined && value !== null) {
      this.listNomina = listTemp.filter((res) => {
        return (
          res.nombres.toLocaleLowerCase().match(value.toLocaleLowerCase()) ||
          res.apellidos.toLocaleLowerCase().match(value.toLocaleLowerCase())
        );
      });
    } else {
      this.listNomina = sorted;
      this.listTemporal = null;
      return this.listNomina;
    }
  }
  allFake() {
    if (this.totalAguinaldo > 0) {
      if (this.isCheckedAjuste === false && this.isCheckedVarios === false) {
        this.indeterminate = false;
        this.allChecked = false;
        document
          .getElementById('btnCalcularDeduccion')
          .setAttribute('disabled', 'true');
      }
    } else {
      if (
        this.isCheckedIHSS === false &&
        this.isCheckedISR === false &&
        this.isCheckedAFPC === false &&
        this.isCheckedImpVecinal === false &&
        this.isCheckedPrestamoRap === false &&
        this.isCheckedAnticipo === false &&
        this.isCheckedCTAEmpresa === false &&
        this.isCheckedTransporte === false &&
        this.isCheckedAjuste === false &&
        this.isCheckedVarios === false
      ) {
        this.indeterminate = false;
        this.allChecked = false;
        document
          .getElementById('btnCalcularDeduccion')
          .setAttribute('disabled', 'true');
      }
    }
  }
  allReal() {
    if (this.totalAguinaldo > 0) {
      if (this.isCheckedAjuste === true && this.isCheckedVarios === true) {
        this.allChecked = true;
        this.indeterminate = false;
      } else {
        this.indeterminate = true;
      }
    } else {
      if (
        this.isCheckedIHSS === true &&
        this.isCheckedISR === true &&
        this.isCheckedAFPC === true &&
        this.isCheckedImpVecinal === true &&
        this.isCheckedPrestamoRap === true &&
        this.isCheckedAnticipo === true &&
        this.isCheckedCTAEmpresa === true &&
        this.isCheckedTransporte === true &&
        this.isCheckedAjuste === true &&
        this.isCheckedVarios === true
      ) {
        this.allChecked = true;
        this.indeterminate = false;
      } else {
        this.indeterminate = true;
      }
    }
  }
  logIHSS(value): void {
    console.log(value);
    if (value === false) {
      this.indeterminate = true;
      this.allFake();
      this.automaticForm.get('ihss').disable();
      this.isDisabledIHSS = true;
      this.automaticForm.get('ihss').setValue(0);
      this.switchValueIHSS = false;
    } else {
      this.isDisabledIHSS = false;
      this.IHSS();
      this.allReal();
      this.btnDeduccionEnable();
    }
  }
  logISR(value): void {
    console.log(value);
    if (value === false) {
      this.indeterminate = true;
      this.allFake();
      this.automaticForm.get('isr').disable();
      this.isDisabledISR = true;
      this.automaticForm.get('isr').setValue(0);
      this.switchValueISR = false;
    } else {
      this.isDisabledISR = false;
      this.ISR();
      this.allReal();
      this.btnDeduccionEnable();
    }
  }
  logAguinaldo(value): void {
    if (value === false) {
      this.isDisabledAguinaldo = true;
      this.switchValueAguinaldo = false;
      this.resumenForm.enable();
      this.resumenForm.get('aguinaldo').disable();
      this.resumenForm.get('aguinaldo').setValue(0);
    } else {
      for (let i = 0; i < this.listNomina.length; i++) {
        if (this.listNomina[i].id === this.idEmpleado) {
          var salario = this.listNomina[i].salarioBase;
        }
      }
      this.resumenForm.disable();
      this.resumenForm.get('aguinaldo').setValue(salario);
      this.isDisabledAguinaldo = false;
    }
  }
  logAFPC(value): void {
    if (value === false) {
      this.indeterminate = true;
      this.allFake();
      this.automaticForm.get('afpc').disable();
      this.isDisableAFPC = true;
      this.automaticForm.get('afpc').setValue(0);
      this.switchValueAFPC = false;
    } else {
      this.isDisableAFPC = false;
      this.AFPC();
      this.allReal();
      this.btnDeduccionEnable();
    }
  }
  logImpVecinal(value): void {
    if (value === false) {
      this.deduccionForm.get('impvecinal').disable();
      this.deduccionForm.get('impvecinal').setValue(0);
      this.deduccionFormQuincenal.get('impvecinal').disable();
      this.deduccionFormQuincenal.get('impvecinal').setValue(0);
      this.indeterminate = true;
      this.allFake();
      this.btnDeduccionEnable();
    } else {
      this.deduccionForm.get('impvecinal').enable();
      this.deduccionForm.get('impvecinal').setValue('');
      this.deduccionFormQuincenal.get('impvecinal').enable();
      this.deduccionFormQuincenal.get('impvecinal').setValue('');
      this.allReal();
      this.btnDeduccionEnable();
    }
  }
  logAnticipo(value): void {
    if (value === false) {
      this.deduccionFormQuincenal.get('anticipo').disable();
      this.deduccionFormQuincenal.get('anticipo').setValue(0);
      this.indeterminate = true;
      this.allFake();
      this.btnDeduccionEnable();
    } else {
      this.deduccionFormQuincenal.get('anticipo').enable();
      this.deduccionFormQuincenal.get('anticipo').setValue('');

      this.allReal();
      this.btnDeduccionEnable();
    }
  }
  logPrestamoRap(value): void {
    if (value === false) {
      this.deduccionFormQuincenal.get('prestamorap').disable();
      this.deduccionFormQuincenal.get('prestamorap').setValue(0);
      this.indeterminate = true;
      this.allFake();
      this.btnDeduccionEnable();
    } else {
      this.deduccionFormQuincenal.get('prestamorap').enable();
      this.deduccionFormQuincenal.get('prestamorap').setValue('');

      this.allReal();
      this.btnDeduccionEnable();
    }
  }
  logCTA(value): void {
    if (value === false) {
      this.deduccionForm.get('ctaempresa').disable();
      this.deduccionForm.get('ctaempresa').setValue(0);
      this.deduccionFormQuincenal.get('ctaempresa').disable();
      this.deduccionFormQuincenal.get('ctaempresa').setValue(0);
      this.indeterminate = true;
      this.allFake();
      this.btnDeduccionEnable();
    } else {
      this.deduccionForm.get('ctaempresa').enable();
      this.deduccionForm.get('ctaempresa').setValue('');
      this.deduccionFormQuincenal.get('ctaempresa').enable();
      this.deduccionFormQuincenal.get('ctaempresa').setValue('');
      this.allReal();
      this.btnDeduccionEnable();
    }
  }
  logTransporte(value): void {
    if (value === false) {
      this.deduccionForm.get('transporte').disable();
      this.deduccionForm.get('transporte').setValue(0);
      this.deduccionFormQuincenal.get('transporte').disable();
      this.deduccionFormQuincenal.get('transporte').setValue(0);
      this.indeterminate = true;
      this.allFake();
      this.btnDeduccionEnable();
    } else {
      this.deduccionForm.get('transporte').enable();
      this.deduccionForm.get('transporte').setValue('');
      this.deduccionFormQuincenal.get('transporte').enable();
      this.deduccionFormQuincenal.get('transporte').setValue('');
      this.allReal();
      this.btnDeduccionEnable();
    }
  }
  logAjuste(value): void {
    if (value === false) {
      if (this.totalAguinaldo > 0) {
        this.aguinaldoForm.get('ajuste').disable();
        this.aguinaldoForm.get('ajuste').setValue(0);
        this.indeterminate = true;
        this.allFake();
        this.btnDeduccionEnable();
      } else {
        this.deduccionForm.get('ajuste').disable();
        this.deduccionForm.get('ajuste').setValue(0);
        this.deduccionFormQuincenal.get('ajuste').disable();
        this.deduccionFormQuincenal.get('ajuste').setValue(0);
        this.indeterminate = true;
        this.allFake();
        this.btnDeduccionEnable();
      }
    } else {
      if (this.totalAguinaldo > 0) {
        this.aguinaldoForm.get('ajuste').enable();
        this.aguinaldoForm.get('ajuste').setValue('');
        this.allReal();
        this.btnDeduccionEnable();
      } else {
        this.deduccionForm.get('ajuste').enable();
        this.deduccionForm.get('ajuste').setValue('');
        this.deduccionFormQuincenal.get('ajuste').enable();
        this.deduccionFormQuincenal.get('ajuste').setValue('');
        this.allReal();
        this.btnDeduccionEnable();
      }
    }
  }
  logVarios(value): void {
    if (value === false) {
      if (this.totalAguinaldo > 0) {
        this.aguinaldoForm.get('varios').disable();
        this.aguinaldoForm.get('varios').setValue(0);
        this.indeterminate = true;
        this.allFake();
        this.btnDeduccionEnable();
      } else {
        this.deduccionForm.get('varios').disable();
        this.deduccionForm.get('varios').setValue(0);
        this.deduccionFormQuincenal.get('varios').disable();
        this.deduccionFormQuincenal.get('varios').setValue(0);
        this.indeterminate = true;
        this.allFake();
        this.btnDeduccionEnable();
      }
    } else {
      if (this.totalAguinaldo > 0) {
        this.aguinaldoForm.get('varios').enable();
        this.aguinaldoForm.get('varios').setValue('');
        this.allReal();
        this.btnDeduccionEnable();
      } else {
        this.deduccionForm.get('varios').enable();
        this.deduccionForm.get('varios').setValue('');
        this.deduccionFormQuincenal.get('varios').enable();
        this.deduccionFormQuincenal.get('varios').setValue('');
        this.allReal();
        this.btnDeduccionEnable();
      }
    }
  }
  limpiarMainDeduccion() {
    this.deduccionForm.reset();
    this.deduccionForm.enable();
    this.aguinaldoForm.reset();
    this.aguinaldoForm.enable();
    this.deduccionFormQuincenal.reset();
    this.deduccionFormQuincenal.enable();
    this.automaticForm.reset();
    this.automaticForm.disable();
    this.cboxAll = false;
    this.cboxIHSS = false;
    this.cboxISR = false;
    this.cboxAFPC = false;
    this.cboxImpVecinal = false;
    this.cboxPrestamoRap = false;
    this.cboxAnticipo = false;
    this.cboxCTAEmpresa = false;
    this.cboxViaticos = false;
    this.cboxOtros = false;
    this.cboxAjuste = false;
    this.deduccion = 0;
    this.valorIHSS = 0;
    this.valorISR = 0;
    this.valorAFPC = 0;
    this.valorImpVecinal = 0;
    this.valorPrestamoRap = 0;
    this.valorAnticipo = 0;
    this.valorCTAEmpresa = 0;
    this.valorTransporte = 0;
    this.valorAjuste = 0;
    this.valorVarios = 0;
    this.deduccionString = '0.00';
    this.switchValueIHSS = false;
    this.switchValueISR = false;
    this.switchValueAFPC = false;
    this.isDisabledIHSS = false;
    this.isDisabledISR = false;
    this.isDisableAFPC = false;
    this.isCheckedIHSS = true;
    this.isCheckedISR = true;
    this.isCheckedAFPC = true;
    this.isCheckedImpVecinal = true;
    this.isCheckedPrestamoRap = true;
    this.isCheckedAnticipo = true;
    this.isCheckedCTAEmpresa = true;
    this.isCheckedTransporte = true;
    this.isCheckedVarios = true;
    this.isCheckedAjuste = true;
    this.indeterminate = false;
    this.allChecked = true;
    this.cantOD = 0;
    document
      .getElementById('btnCalcularDeduccion')
      .setAttribute('disabled', 'true');
    this.IHSS();
    this.ISR();
    this.AFPC();
  }
  limpiarMain() {
    this.EmpleadosService.cargarEmpleados(this.idEmpleado).subscribe((data) => {
      this.switchValuePP = !data.permanente;
    });
    this.horasForm.reset();
    this.descriForm.reset();
    this.isDisabledPP = false;
    this.btnEnable = true;
    this.sabadoHorasNormales = 0;
    this.descriForm.get('lunesSelect').setValue('');
    this.descriForm.get('martesSelect').setValue('');
    this.descriForm.get('miercolesSelect').setValue('');
    this.descriForm.get('juevesSelect').setValue('');
    this.descriForm.get('viernesSelect').setValue('');
    this.descriForm.get('sabadoSelect').setValue('');
    this.descriForm.get('domingoSelect').setValue('');
    this.notrabajaba = 0;
    this.sueldoString = '0.00';
    this.extraForm.get('incpub').setValue('');
    this.extraFormTercero.get('incpub').setValue('');
    this.extraFormTercero.get('dias').setValue('');
    this.resumenForm.reset();
    document.getElementById('btnCalcular').setAttribute('disabled', 'true');
    document.getElementById('btnRevisar').removeAttribute('disabled');
    document.getElementById('btnAutofillDiurna').removeAttribute('disabled');
    document.getElementById('btnAutofillNocturna').removeAttribute('disabled');
    document.getElementById('btnAutofillMixta').removeAttribute('disabled');
    this.descriForm.enable();
    this.resumenForm.get('ajuste').enable();
    this.resetObservacion();
  }
  enableIHSS() {
    if (this.switchValueIHSS === false) {
      this.automaticForm.get('ihss').disable();
      this.IHSS();
    } else if (this.switchValueIHSS === true) {
      this.automaticForm.get('ihss').enable();
      this.automaticForm.get('ihss').setValue('');
    }
  }
  enableISR() {
    if (this.switchValueISR === false) {
      this.automaticForm.get('isr').disable();
      this.ISR();
    } else if (this.switchValueISR === true) {
      this.automaticForm.get('isr').enable();
      this.automaticForm.get('isr').setValue('');
    }
  }
  validAguinaldo(value: number): void {
    console.log(value, this.switchValueAguinaldo);
    if (value !== null && value !== 0) {
      this.isValidAguinaldo = false;
    } else {
      this.isValidAguinaldo = true;
    }
  }
  enableAguinaldo() {
    if (this.switchValueAguinaldo === false) {
      this.resumenForm.get('aguinaldo').disable();
      for (let i = 0; i < this.listNomina.length; i++) {
        if (this.listNomina[i].id === this.idEmpleado) {
          var salario = this.listNomina[i].salarioBase;
        }
      }
      this.resumenForm.get('aguinaldo').setValue(salario);
      this.isDisabledAguinaldo = false;
      this.isValidAguinaldo = false;
    } else if (this.switchValueAguinaldo === true) {
      this.resumenForm.get('aguinaldo').enable();
      this.resumenForm.get('aguinaldo').setValue('');
      this.isValidAguinaldo = true;
    }
  }
  enableTechoEM_IHSS() {
    if (this.switchValueTechoEM_IHSS === false) {
      this.infoForm.get('techoEM_IHSS').disable();
      this.InfoService.getInfo().subscribe((data) => {
        this.infoForm.get('techoEM_IHSS').setValue(data[0].techoEM_IHSS);
      });
    } else if (this.switchValueTechoEM_IHSS === true) {
      this.infoForm.get('techoEM_IHSS').enable();
      this.infoForm.get('techoEM_IHSS').setValue('');
    }
  }
  enableTechoIVM_IHSS() {
    if (this.switchValueTechoIVM_IHSS === false) {
      this.infoForm.get('techoIVM_IHSS').disable();
      this.InfoService.getInfo().subscribe((data) => {
        this.infoForm.get('techoIVM_IHSS').setValue(data[0].techoIVM_IHSS);
      });
    } else if (this.switchValueTechoIVM_IHSS === true) {
      this.infoForm.get('techoIVM_IHSS').enable();
      this.infoForm.get('techoIVM_IHSS').setValue('');
    }
  }
  enablePorcentajeEM_IHSS() {
    if (this.switchValuePorcentajeEM_IHSS === false) {
      this.infoForm.get('porcentajeContribucionTrabajadorEM_IHSS').disable();
      this.InfoService.getInfo().subscribe((data) => {
        this.infoForm
          .get('porcentajeContribucionTrabajadorEM_IHSS')
          .setValue(data[0].porcentajeContribucionTrabajadorEM_IHSS);
      });
    } else if (this.switchValuePorcentajeEM_IHSS === true) {
      this.infoForm.get('porcentajeContribucionTrabajadorEM_IHSS').enable();
      this.infoForm.get('porcentajeContribucionTrabajadorEM_IHSS').setValue('');
    }
  }
  enablePorcentajeIVM_IHSS() {
    if (this.switchValuePorcentajeIVM_IHSS === false) {
      this.infoForm.get('porcentajeContribucionTrabajadorIVM_IHSS').disable();
      this.InfoService.getInfo().subscribe((data) => {
        this.infoForm
          .get('porcentajeContribucionTrabajadorIVM_IHSS')
          .setValue(data[0].porcentajeContribucionTrabajadorIVM_IHSS);
      });
    } else if (this.switchValuePorcentajeIVM_IHSS === true) {
      this.infoForm.get('porcentajeContribucionTrabajadorIVM_IHSS').enable();
      this.infoForm
        .get('porcentajeContribucionTrabajadorIVM_IHSS')
        .setValue('');
    }
  }
  enableTechoExento_ISR() {
    if (this.switchValueTechoExento_ISR === false) {
      this.infoForm.get('techoExento_ISR').disable();
      this.InfoService.getInfo().subscribe((data) => {
        this.infoForm.get('techoExento_ISR').setValue(data[0].techoExento_ISR);
      });
    } else if (this.switchValueTechoExento_ISR === true) {
      this.infoForm.get('techoExento_ISR').enable();
      this.infoForm.get('techoExento_ISR').setValue('');
    }
  }
  enableTecho15_ISR() {
    if (this.switchValueTecho15_ISR === false) {
      this.infoForm.get('techo15_ISR').disable();
      this.InfoService.getInfo().subscribe((data) => {
        this.infoForm.get('techo15_ISR').setValue(data[0].techo15_ISR);
      });
    } else if (this.switchValueTecho15_ISR === true) {
      this.infoForm.get('techo15_ISR').enable();
      this.infoForm.get('techo15_ISR').setValue('');
    }
  }
  enableTecho20_ISR() {
    if (this.switchValueTecho20_ISR === false) {
      this.infoForm.get('techo20_ISR').disable();
      this.InfoService.getInfo().subscribe((data) => {
        this.infoForm.get('techo20_ISR').setValue(data[0].techo20_ISR);
      });
    } else if (this.switchValueTecho20_ISR === true) {
      this.infoForm.get('techo20_ISR').enable();
      this.infoForm.get('techo20_ISR').setValue('');
    }
  }
  enableMontoServicioMedico_ISR() {
    if (this.switchValueMontoServicioMedico_ISR === false) {
      this.infoForm.get('montoServicioMedico_ISR').disable();
      this.InfoService.getInfo().subscribe((data) => {
        this.infoForm
          .get('montoServicioMedico_ISR')
          .setValue(data[0].montoServicioMedico_ISR);
      });
    } else if (this.switchValueMontoServicioMedico_ISR === true) {
      this.infoForm.get('montoServicioMedico_ISR').enable();
      this.infoForm.get('montoServicioMedico_ISR').setValue('');
    }
  }
  enableTechoIVM_RAP() {
    if (this.switchValueTechoIVM_RAP === false) {
      this.infoForm.get('techoIVM_RAP').disable();
      this.InfoService.getInfo().subscribe((data) => {
        this.infoForm.get('techoIVM_RAP').setValue(data[0].techoIVM_RAP);
      });
    } else if (this.switchValueTechoIVM_RAP === true) {
      this.infoForm.get('techoIVM_RAP').enable();
      this.infoForm.get('techoIVM_RAP').setValue('');
    }
  }
  enablePorcentajeIVM_RAP() {
    if (this.switchValuePorcentajeIVM_RAP === false) {
      this.infoForm.get('porcentajeContribucionTrabajador_RAP').disable();
      this.InfoService.getInfo().subscribe((data) => {
        this.infoForm
          .get('porcentajeContribucionTrabajador_RAP')
          .setValue(data[0].porcentajeContribucionTrabajador_RAP);
      });
    } else if (this.switchValuePorcentajeIVM_RAP === true) {
      this.infoForm.get('porcentajeContribucionTrabajador_RAP').enable();
      this.infoForm.get('porcentajeContribucionTrabajador_RAP').setValue('');
    }
  }
  enableAFPC() {
    if (this.switchValueAFPC === false) {
      this.automaticForm.get('afpc').disable();
      this.AFPC();
    } else if (this.switchValueAFPC === true) {
      this.automaticForm.get('afpc').enable();
      this.automaticForm.get('afpc').setValue('');
    }
  }
  horasSemana(entrada: moment.Moment, salida: moment.Moment) {
    if (entrada > salida) {
      var diferencia = moment.duration(salida.diff(entrada)).add(24, 'hours');
      this.hours = diferencia.asHours();
    } else {
      diferencia = moment.duration(salida.diff(entrada));
      this.hours = diferencia.asHours();
    }
  }
  invalidaIncPub(): void {
    this.isVisibleIncPubParcial = true;
    this.modal.error({
      nzCentered: true,
      nzTitle: 'ERROR',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Dias inválidos. Reingrese.</b>',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.extraFormTercero.get('dias').setValue(''),
    });
  }
  invalidas(): void {
    this.isVisibleInvalidas = true;
    this.modal.error({
      nzCentered: true,
      nzTitle: 'ERROR',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Horas inválidas. Reingrese.</b>',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.limpiarResumen(),
    });
  }
  validasIguales(): void {
    this.isVisibleValidasIguales = true;
    this.modal.error({
      nzCentered: true,
      nzTitle: 'ERROR',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Horas iguales. Reingrese.</b>',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.limpiarResumen(),
    });
  }
  libres(): void {
    this.isVisibleLibres = true;
    this.modal.error({
      nzCentered: true,
      nzTitle: 'ERROR',
      nzContent:
        '<b style="color: red;">ADVERTENCIA: Solo puede tener un séptimo día a la semana.</b>',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.limpiarResumen(),
    });
  }
  tarjetas(
    entrada: moment.Moment,
    salida: moment.Moment,
    keyI: string,
    keyO: string,
    keyT: string,
    exD: string,
    exM: string,
    exN: string,
    jornada: number,
    jornadaKey: string,
    horas: number,
    observacion: string
  ) {
    var a = moment(entrada).format('hh:mm a');
    var b = moment(salida).format('hh:mm a');
    if (observacion === 'conpermiso') {
      observacion = 'Con Permiso';
    } else if (observacion === 'feriado') {
      observacion = 'Feriado';
    } else if (observacion === 'notrabajaba') {
      observacion = 'No Laboraba';
    } else if (
      observacion === 'incapacidadpub' ||
      observacion === 'incapacidadpubparcial' ||
      observacion === 'incapacidadcancelada'
    ) {
      observacion = 'IHSS';
    } else if (observacion === 'incapacidadpriv') {
      observacion = 'IP';
    } else if (observacion === 'septimo') {
      observacion = 'Libre';
    } else if (
      observacion === 'vacacion' ||
      observacion === 'vacacioncancelada'
    ) {
      observacion = 'Vacaciones';
    } else if (observacion === 'falta') {
      observacion = 'Sin Permiso';
    } else if (observacion === 'suspension') {
      observacion = 'Suspensión';
    } else if (observacion === 'abandono') {
      observacion = 'Renuncia';
    }

    if (a && b === 'Fecha inválida') {
      a = observacion;
      b = observacion;
    }
    if (horas === undefined) {
      horas = 0;
    }
    const array = [];
    console.log(
      'HORAS EXTRAS / DIAS',
      this.totalTrabNormales,
      this.totalExtrasDiurnas,
      this.totalExtrasMixtas,
      this.totalExtrasNocturnas
    );
    array.push({
      primero: a,
      segundo: b,
      total: horas,
      extrad: this.extrasDiurna,
      extram: this.extrasMixta,
      extran: this.extrasNocturna,
      jor: jornada,
      diurna: this.totalExtrasDiurnas,
      mixta: this.totalExtrasMixtas,
      noct: this.totalExtrasNocturnas,
    });
    var reformattedArray = array.map(function (obj) {
      var rObj = {};
      rObj[keyI] = obj.primero;
      rObj[keyO] = obj.segundo;
      rObj[keyT] = obj.total;
      rObj[exD] = obj.extrad;
      rObj[exM] = obj.extram;
      rObj[exN] = obj.extran;
      rObj[jornadaKey] = obj.jor;
      rObj['totalD'] = obj.diurna;
      rObj['totalM'] = obj.mixta;
      rObj['totalN'] = obj.noct;
      return rObj;
    });
    console.log(
      this.listTarjeta,
      this.idEmpleado,
      array,
      reformattedArray,
      observacion
    );
    for (let i = 0; i < this.listTarjeta.length; i++) {
      if (this.listTarjeta[i].id === this.idEmpleado) {
        console.log('entro', this.listTarjeta[i].id);
        const obj3 = { ...this.listTarjeta[i], ...reformattedArray[0] };
        console.log(obj3);
        this.listTarjeta[i] = obj3;
      }
    }
    console.log(this.listTarjeta, this.idEmpleado);
  }
  detectarIncapacidad() {
    if (this.descriForm.get('lunesSelect').value === 'incapacidadpub') {
      this.incapacidadpub = this.incapacidadpub + 1;
    }
    if (this.descriForm.get('martesSelect').value === 'incapacidadpub') {
      this.incapacidadpub = this.incapacidadpub + 1;
    }
    if (this.descriForm.get('miercolesSelect').value === 'incapacidadpub') {
      this.incapacidadpub = this.incapacidadpub + 1;
    }
    if (this.descriForm.get('juevesSelect').value === 'incapacidadpub') {
      this.incapacidadpub = this.incapacidadpub + 1;
    }
    if (this.descriForm.get('viernesSelect').value === 'incapacidadpub') {
      this.incapacidadpub = this.incapacidadpub + 1;
    }
    if (this.descriForm.get('sabadoSelect').value === 'incapacidadpub') {
      this.incapacidadpub = this.incapacidadpub + 1;
    }
    if (this.descriForm.get('domingoSelect').value === 'incapacidadpub') {
      this.incapacidadpub = this.incapacidadpub + 1;
    }
  }
  detectarJornada() {
    if (
      this.descriForm.get('lunesSelect').value === '' ||
      this.descriForm.get('lunesSelect').value === undefined
    ) {
      this.revisarLunes(this.lunesDesde, this.lunesHasta);
      this.jornadaL = this.retornarJornadaOld(this.jornada, 'Lunes');
      console.log('LUNES JORNADA: ', this.jornadaL, this.jornada);
    } else this.jornadaL = 0;

    if (
      this.descriForm.get('martesSelect').value === '' ||
      this.descriForm.get('martesSelect').value === undefined
    ) {
      this.revisarMartes(this.martesDesde, this.martesHasta);
      this.jornadaM = this.retornarJornadaOld(this.jornada, 'Martes');
      console.log('MARTES JORNADA: ', this.jornadaM, this.jornada);
    } else this.jornadaM = 0;

    if (
      this.descriForm.get('miercolesSelect').value === '' ||
      this.descriForm.get('martesSelect').value === undefined
    ) {
      this.revisarMiercoles(this.miercolesDesde, this.miercolesHasta);
      this.jornadaMi = this.retornarJornadaOld(this.jornada, 'Miercoles');
      console.log('MIERCOLES JORNADA: ', this.jornadaMi, this.jornada);
    } else this.jornadaMi = 0;

    if (
      this.descriForm.get('juevesSelect').value === '' ||
      this.descriForm.get('juevesSelect').value === undefined
    ) {
      this.revisarJueves(this.juevesDesde, this.juevesHasta);
      this.jornadaJ = this.retornarJornadaOld(this.jornada, 'Jueves');
      console.log('JUEVES JORNADA: ', this.jornadaJ, this.jornada);
    } else this.jornadaJ = 0;

    if (
      this.descriForm.get('viernesSelect').value === '' ||
      this.descriForm.get('viernesSelect').value === undefined
    ) {
      this.revisarViernes(this.viernesDesde, this.viernesHasta);
      this.jornadaV = this.retornarJornadaOld(this.jornada, 'Viernes');
      console.log('VIERNES JORNADA: ', this.jornadaV, this.jornada);
    } else this.jornadaV = 0;

    if (
      this.descriForm.get('sabadoSelect').value === '' ||
      this.descriForm.get('sabadoSelect').value === undefined
    ) {
      this.revisarSabado(this.sabadoDesde, this.sabadoHasta);
      this.jornadaS = this.retornarJornadaOld(this.jornada, 'Sabado');
      console.log('SABADO JORNADA: ', this.jornadaS, this.jornada);
    } else this.jornadaS = 0;

    if (
      this.descriForm.get('domingoSelect').value === '' ||
      this.descriForm.get('domingoSelect').value === undefined
    ) {
      this.revisarDomingo(this.domingoDesde, this.domingoHasta);
      this.jornadaD = this.retornarJornadaOld(this.jornada, 'Domingo');
      console.log('DOMINGO JORNADA: ', this.jornadaD, this.jornada);
    } else this.jornadaD = 0;
  }
  sumRequiredTipo(jornada: number) {
    console.log('JORNADA ' + jornada + ' ' + this.requiredCompletarDiurna);
    if (jornada !== 0) {
      if (jornada === 8) {
        this.requiredCompletarDiurna = this.requiredCompletarDiurna + jornada;
        this.ajusteDias = this.ajusteDias + 1;
      } else if (jornada === 4) {
        this.requiredCompletarDiurna =
          this.requiredCompletarDiurna + jornada - 8;
      } else if (jornada === 7) {
        this.requiredCompletarMixta = this.requiredCompletarMixta + jornada;
        this.ajusteDias = this.ajusteDias + 1;
      } else if (jornada === 6) {
        this.requiredCompletarNocturna =
          this.requiredCompletarNocturna + jornada;
        this.ajusteDias = this.ajusteDias + 1;
      }
    }
  }
  retornarJornadaOld(jornada: string, dia: string) {
    var jor: number;
    console.log('AQUI OLD', jornada, dia);
    if (jornada === 'Diurna' && dia === 'Sabado') {
      jor = this.hrsJornadaDiurna - 4;
    } else if (jornada === 'Diurna' && dia !== 'Sabado') {
      jor = this.hrsJornadaDiurna;
    } else if (jornada === 'Mixta') {
      jor = this.hrsJornadaMixta;
    } else if (jornada === 'Nocturna') {
      jor = this.hrsJornadaNocturna;
    }
    return jor;
  }
  retornarJornada(jornada: string, dia: string, obs: string) {
    var jor: number = 0;
    console.log('AQUI', jornada, dia, obs);
    if (obs === 'incapacidadpub' && this.incapacidadpub > 3) {
      obs = 'incapacidadpubmax';
    }
    if (
      obs === '' ||
      obs === undefined ||
      obs === 'conpermiso' ||
      obs === 'feriado' ||
      obs === 'vacacion' ||
      obs === 'incapacidadpub'
    ) {
      if (jornada === 'Diurna' && dia === 'Sabado') {
        jor = this.hrsJornadaDiurna - 4;
      } else if (jornada === 'Diurna' && dia !== 'Sabado') {
        jor = this.hrsJornadaDiurna;
      } else if (jornada === 'Mixta') {
        jor = this.hrsJornadaMixta;
      } else if (jornada === 'Nocturna') {
        jor = this.hrsJornadaNocturna;
      }
      return jor;
    } else if (
      obs === 'septimo' ||
      obs === 'falta' ||
      obs === 'suspension' ||
      obs === 'abandono' ||
      obs === 'vacacioncancelada' ||
      obs === 'incapacidadcancelada' ||
      obs === 'incapacidadpubparcial' ||
      obs === 'incapacidadpubmax'
    ) {
      jor = 0;
      return jor;
    }
    return jor;
  }
  revisarLunes(entrada: moment.Moment, salida: moment.Moment) {
    if (entrada.isValid() && salida.isValid()) {
      if (entrada.isSame(salida)) {
        if (this.isVisibleValidasIguales === false) {
          this.validasIguales();
        }
        this.horasForm.get('luIControl').setValue('');
        this.horasForm.get('luOControl').setValue('');
      } else {
        this.horasSemana(entrada, salida);
        this.hoursLunes = this.hours;
        console.log('Lunes: ' + this.hoursLunes);
        this.dia = 'Lunes';
        this.horas(entrada, salida, this.hoursLunes, this.dia);
      }
    } else if (this.descriForm.get('lunesSelect').value !== '') {
      if (this.descriForm.get('lunesSelect').value === 'conpermiso') {
        this.conpermiso = this.conpermiso + 1;
        if (this.jornadaM !== 0) {
          this.sumRequiredTipo(this.jornadaM);
          this.hoursLunes = this.jornadaM;
        } else if (this.jornadaMi !== 0) {
          this.sumRequiredTipo(this.jornadaMi);
          this.hoursLunes = this.jornadaMi;
        } else if (this.jornadaJ !== 0) {
          this.sumRequiredTipo(this.jornadaJ);
          this.hoursLunes = this.jornadaJ;
        } else if (this.jornadaV !== 0) {
          this.sumRequiredTipo(this.jornadaV);
          this.hoursLunes = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.sumRequiredTipo(this.jornadaS);
          this.hoursLunes = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.sumRequiredTipo(this.jornadaD);
          this.hoursLunes = this.jornadaD;
        } else this.hoursLunes = 0;
      } else if (this.descriForm.get('lunesSelect').value === 'feriado') {
        this.feriado = this.feriado + 1;
        if (this.jornadaM !== 0) {
          this.hoursLunes = this.jornadaM;
        } else if (this.jornadaMi !== 0) {
          this.hoursLunes = this.jornadaMi;
        } else if (this.jornadaJ !== 0) {
          this.hoursLunes = this.jornadaJ;
        } else if (this.jornadaV !== 0) {
          this.hoursLunes = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.hoursLunes = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursLunes = this.jornadaD;
        } else this.hoursLunes = 0;
      } else if (
        this.descriForm.get('lunesSelect').value === 'incapacidadpub'
      ) {
        if (this.jornadaM !== 0) {
          this.hoursLunes = this.jornadaM;
        } else if (this.jornadaMi !== 0) {
          this.hoursLunes = this.jornadaMi;
        } else if (this.jornadaJ !== 0) {
          this.hoursLunes = this.jornadaJ;
        } else if (this.jornadaV !== 0) {
          this.hoursLunes = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.hoursLunes = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursLunes = this.jornadaD;
        } else this.hoursLunes = 0;
        if (this.incapacidadpub > 3) {
          this.hoursLunes = 0;
        }
      } else if (
        this.descriForm.get('lunesSelect').value === 'incapacidadpubparcial'
      ) {
        this.incapacidadpubparcial = this.incapacidadpubparcial + 1;
        this.hoursLunes = 0;
      } else if (
        this.descriForm.get('lunesSelect').value === 'incapacidadpriv'
      ) {
        this.incapacidadpriv = this.incapacidadpriv + 1;
        this.incPriv = true;
      } else if (
        this.descriForm.get('lunesSelect').value === 'incapacidadcancelada'
      ) {
        this.incapacidadcanc = this.incapacidadcanc + 1;
        this.hoursLunes = 0;
      } else if (this.descriForm.get('lunesSelect').value === 'septimo') {
        this.septimo = this.septimo + 1;
        if (this.isVisibleLibres === false) {
          if (this.septimo > 1) {
            this.libres();
          }
        }
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursLunes = 0;
      } else if (this.descriForm.get('lunesSelect').value === 'vacacion') {
        this.vacacion = this.vacacion + 1;
        if (this.jornadaM !== 0) {
          this.hoursLunes = this.jornadaM;
        } else if (this.jornadaMi !== 0) {
          this.hoursLunes = this.jornadaMi;
        } else if (this.jornadaJ !== 0) {
          this.hoursLunes = this.jornadaJ;
        } else if (this.jornadaV !== 0) {
          this.hoursLunes = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.hoursLunes = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursLunes = this.jornadaD;
        } else this.hoursLunes = 0;
      } else if (
        this.descriForm.get('lunesSelect').value === 'vacacioncancelada'
      ) {
        this.vacacioncanc = this.vacacioncanc + 1;
        this.hoursLunes = 0;
      } else if (this.descriForm.get('lunesSelect').value === 'falta') {
        this.falta = this.falta + 1;
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursLunes = 0;
      } else if (this.descriForm.get('lunesSelect').value === 'suspension') {
        this.suspension = this.suspension + 1;
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursLunes = 0;
      } else if (this.descriForm.get('lunesSelect').value === 'abandono') {
        this.abandono = this.abandono + 1;
        this.hoursLunes = 0;
      }
    } else {
      if (this.isVisibleInvalidas === false) {
        this.invalidas();
      }
      this.horasForm.get('luIControl').setValue('');
      this.horasForm.get('luOControl').setValue('');
    }
    if (this.incPriv === true) {
      this.listIncapacidadPrivada.push('lunes');
    } else {
      this.tarjetas(
        entrada,
        salida,
        'lunesE',
        'lunesS',
        'horasL',
        'XDL',
        'XML',
        'XNL',
        this.retornarJornada(
          this.jornada,
          'Lunes',
          this.descriForm.get('lunesSelect').value
        ),
        'jornadaL',
        this.hoursLunes,
        this.descriForm.get('lunesSelect').value
      );
      this.hoursLunes = 0;
      this.extrasDiurna = 0;
      this.extrasMixta = 0;
      this.extrasNocturna = 0;
      this.dia = '';
    }
    this.incPriv = false;
  }
  revisarMartes(entrada: moment.Moment, salida: moment.Moment) {
    if (entrada.isValid() && salida.isValid()) {
      if (entrada.isSame(salida)) {
        if (this.isVisibleValidasIguales === false) {
          this.validasIguales();
        }
        this.horasForm.get('maIControl').setValue('');
        this.horasForm.get('maOControl').setValue('');
      } else {
        this.horasSemana(entrada, salida);
        this.hoursMartes = this.hours;
        console.log('Martes: ' + this.hoursMartes);
        this.dia = 'Martes';
        this.horas(entrada, salida, this.hoursMartes, this.dia);
      }
    } else if (this.descriForm.get('martesSelect').value !== '') {
      if (this.descriForm.get('martesSelect').value === 'conpermiso') {
        this.conpermiso = this.conpermiso + 1;
        if (this.jornadaL !== 0) {
          this.sumRequiredTipo(this.jornadaL);
          this.hoursMartes = this.jornadaL;
        } else if (this.jornadaMi !== 0) {
          this.sumRequiredTipo(this.jornadaMi);
          this.hoursMartes = this.jornadaMi;
        } else if (this.jornadaJ !== 0) {
          this.sumRequiredTipo(this.jornadaJ);
          this.hoursMartes = this.jornadaJ;
        } else if (this.jornadaV !== 0) {
          this.sumRequiredTipo(this.jornadaV);
          this.hoursMartes = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.sumRequiredTipo(this.jornadaS);
          this.hoursMartes = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.sumRequiredTipo(this.jornadaD);
          this.hoursMartes = this.jornadaD;
        } else this.hoursMartes = 0;
      } else if (this.descriForm.get('martesSelect').value === 'feriado') {
        this.feriado = this.feriado + 1;
        if (this.jornadaL !== 0) {
          this.hoursMartes = this.jornadaL;
        } else if (this.jornadaMi !== 0) {
          this.hoursMartes = this.jornadaMi;
        } else if (this.jornadaJ !== 0) {
          this.hoursMartes = this.jornadaJ;
        } else if (this.jornadaV !== 0) {
          this.hoursMartes = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.hoursMartes = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursMartes = this.jornadaD;
        } else this.hoursMartes = 0;
      } else if (
        this.descriForm.get('martesSelect').value === 'incapacidadpub'
      ) {
        if (this.jornadaL !== 0) {
          this.hoursMartes = this.jornadaL;
        } else if (this.jornadaMi !== 0) {
          this.hoursMartes = this.jornadaMi;
        } else if (this.jornadaJ !== 0) {
          this.hoursMartes = this.jornadaJ;
        } else if (this.jornadaV !== 0) {
          this.hoursMartes = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.hoursMartes = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursMartes = this.jornadaD;
        } else this.hoursMartes = 0;
        if (this.incapacidadpub > 3) {
          this.hoursMartes = 0;
        }
      } else if (
        this.descriForm.get('martesSelect').value === 'incapacidadpubparcial'
      ) {
        this.incapacidadpubparcial = this.incapacidadpubparcial + 1;
        this.hoursMartes = 0;
      } else if (
        this.descriForm.get('martesSelect').value === 'incapacidadpriv'
      ) {
        this.incapacidadpriv = this.incapacidadpriv + 1;
        this.incPriv = true;
      } else if (
        this.descriForm.get('martesSelect').value === 'incapacidadcancelada'
      ) {
        this.incapacidadcanc = this.incapacidadcanc + 1;
        this.hoursMartes = 0;
      } else if (this.descriForm.get('martesSelect').value === 'septimo') {
        this.septimo = this.septimo + 1;
        if (this.isVisibleLibres === false) {
          if (this.septimo > 1) {
            this.libres();
          }
        }
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursMartes = 0;
      } else if (this.descriForm.get('martesSelect').value === 'vacacion') {
        this.vacacion = this.vacacion + 1;
        if (this.jornadaL !== 0) {
          this.hoursMartes = this.jornadaL;
        } else if (this.jornadaMi !== 0) {
          this.hoursMartes = this.jornadaMi;
        } else if (this.jornadaJ !== 0) {
          this.hoursMartes = this.jornadaJ;
        } else if (this.jornadaV !== 0) {
          this.hoursMartes = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.hoursMartes = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursMartes = this.jornadaD;
        } else this.hoursMartes = 0;
      } else if (
        this.descriForm.get('martesSelect').value === 'vacacioncancelada'
      ) {
        this.vacacioncanc = this.vacacioncanc + 1;
        this.hoursMartes = 0;
      } else if (this.descriForm.get('martesSelect').value === 'falta') {
        this.falta = this.falta + 1;
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursMartes = 0;
      } else if (this.descriForm.get('martesSelect').value === 'suspension') {
        this.suspension = this.suspension + 1;
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursMartes = 0;
      } else if (this.descriForm.get('martesSelect').value === 'abandono') {
        this.abandono = this.abandono + 1;
        this.hoursMartes = 0;
      }
    } else {
      if (this.isVisibleInvalidas === false) {
        this.invalidas();
      }
      this.horasForm.get('maIControl').setValue('');
      this.horasForm.get('maOControl').setValue('');
    }
    if (this.incPriv === true) {
      this.listIncapacidadPrivada.push('martes');
    } else {
      this.tarjetas(
        entrada,
        salida,
        'martesE',
        'martesS',
        'horasM',
        'XDM',
        'XMM',
        'XNM',
        this.retornarJornada(
          this.jornada,
          'Martes',
          this.descriForm.get('martesSelect').value
        ),
        'jornadaM',
        this.hoursMartes,
        this.descriForm.get('martesSelect').value
      );
      this.hoursMartes = 0;
      this.extrasDiurna = 0;
      this.extrasMixta = 0;
      this.extrasNocturna = 0;
      this.dia = '';
    }
    this.incPriv = false;
  }
  revisarMiercoles(entrada: moment.Moment, salida: moment.Moment) {
    if (entrada.isValid() && salida.isValid()) {
      if (entrada.isSame(salida)) {
        if (this.isVisibleValidasIguales === false) {
          this.validasIguales();
        }
        this.horasForm.get('miIControl').setValue('');
        this.horasForm.get('miOControl').setValue('');
      } else {
        this.horasSemana(entrada, salida);
        this.hoursMiercoles = this.hours;
        console.log('Miercoles: ' + this.hoursMiercoles);
        this.dia = 'Miercoles';
        this.horas(entrada, salida, this.hoursMiercoles, this.dia);
      }
    } else if (this.descriForm.get('miercolesSelect').value !== '') {
      if (this.descriForm.get('miercolesSelect').value === 'conpermiso') {
        this.conpermiso = this.conpermiso + 1;
        if (this.jornadaM !== 0) {
          this.sumRequiredTipo(this.jornadaM);
          this.hoursMiercoles = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.sumRequiredTipo(this.jornadaL);
          this.hoursMiercoles = this.jornadaL;
        } else if (this.jornadaJ !== 0) {
          this.sumRequiredTipo(this.jornadaJ);
          this.hoursMiercoles = this.jornadaJ;
        } else if (this.jornadaV !== 0) {
          this.sumRequiredTipo(this.jornadaV);
          this.hoursMiercoles = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.sumRequiredTipo(this.jornadaS);
          this.hoursMiercoles = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.sumRequiredTipo(this.jornadaD);
          this.hoursMiercoles = this.jornadaD;
        } else this.hoursMiercoles = 0;
      } else if (this.descriForm.get('miercolesSelect').value === 'feriado') {
        this.feriado = this.feriado + 1;
        if (this.jornadaM !== 0) {
          this.hoursMiercoles = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursMiercoles = this.jornadaL;
        } else if (this.jornadaJ !== 0) {
          this.hoursMiercoles = this.jornadaJ;
        } else if (this.jornadaV !== 0) {
          this.hoursMiercoles = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.hoursMiercoles = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursMiercoles = this.jornadaD;
        } else this.hoursMiercoles = 0;
      } else if (
        this.descriForm.get('miercolesSelect').value === 'incapacidadpub'
      ) {
        if (this.jornadaM !== 0) {
          this.hoursMiercoles = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursMiercoles = this.jornadaL;
        } else if (this.jornadaJ !== 0) {
          this.hoursMiercoles = this.jornadaJ;
        } else if (this.jornadaV !== 0) {
          this.hoursMiercoles = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.hoursMiercoles = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursMiercoles = this.jornadaD;
        } else this.hoursMiercoles = 0;
        if (this.incapacidadpub > 3) {
          this.hoursMiercoles = 0;
        }
      } else if (
        this.descriForm.get('miercolesSelect').value === 'incapacidadpubparcial'
      ) {
        this.incapacidadpubparcial = this.incapacidadpubparcial + 1;
        this.hoursMiercoles = 0;
      } else if (
        this.descriForm.get('miercolesSelect').value === 'incapacidadpriv'
      ) {
        this.incapacidadpriv = this.incapacidadpriv + 1;
        this.incPriv = true;
      } else if (
        this.descriForm.get('miercolesSelect').value === 'incapacidadcancelada'
      ) {
        this.incapacidadcanc = this.incapacidadcanc + 1;
        this.hoursMiercoles = 0;
      } else if (this.descriForm.get('miercolesSelect').value === 'septimo') {
        this.septimo = this.septimo + 1;
        if (this.isVisibleLibres === false) {
          if (this.septimo > 1) {
            this.libres();
          }
        }
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
          this.hoursMiercoles = 0;
        }
      } else if (this.descriForm.get('miercolesSelect').value === 'vacacion') {
        this.vacacion = this.vacacion + 1;
        if (this.jornadaM !== 0) {
          this.hoursMiercoles = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursMiercoles = this.jornadaL;
        } else if (this.jornadaJ !== 0) {
          this.hoursMiercoles = this.jornadaJ;
        } else if (this.jornadaV !== 0) {
          this.hoursMiercoles = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.hoursMiercoles = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursMiercoles = this.jornadaD;
        } else this.hoursMiercoles = 0;
      } else if (
        this.descriForm.get('miercolesSelect').value === 'vacacioncancelada'
      ) {
        this.vacacioncanc = this.vacacioncanc + 1;
        this.hoursMiercoles = 0;
      } else if (this.descriForm.get('miercolesSelect').value === 'falta') {
        this.falta = this.falta + 1;
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursMiercoles = 0;
      } else if (
        this.descriForm.get('miercolesSelect').value === 'suspension'
      ) {
        this.suspension = this.suspension + 1;
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursMiercoles = 0;
      } else if (this.descriForm.get('miercolesSelect').value === 'abandono') {
        this.abandono = this.abandono + 1;
        this.hoursMiercoles = 0;
      }
    } else {
      if (this.isVisibleInvalidas === false) {
        this.invalidas();
      }
      this.horasForm.get('miIControl').setValue('');
      this.horasForm.get('miOControl').setValue('');
    }
    if (this.incPriv === true) {
      this.listIncapacidadPrivada.push('miercoles');
    } else {
      this.tarjetas(
        entrada,
        salida,
        'miercolesE',
        'miercolesS',
        'horasMi',
        'XDMi',
        'XMMi',
        'XNMi',
        this.retornarJornada(
          this.jornada,
          'Miercoles',
          this.descriForm.get('miercolesSelect').value
        ),
        'jornadaMi',
        this.hoursMiercoles,
        this.descriForm.get('miercolesSelect').value
      );
      this.hoursMiercoles = 0;
      this.extrasDiurna = 0;
      this.extrasMixta = 0;
      this.extrasNocturna = 0;
      this.dia = '';
    }
    this.incPriv = false;
  }
  revisarJueves(entrada: moment.Moment, salida: moment.Moment) {
    if (entrada.isValid() && salida.isValid()) {
      if (entrada.isSame(salida)) {
        if (this.isVisibleValidasIguales === false) {
          this.validasIguales();
        }
        this.horasForm.get('juIControl').setValue('');
        this.horasForm.get('juOControl').setValue('');
      } else {
        this.horasSemana(entrada, salida);
        this.hoursJueves = this.hours;
        console.log('Jueves: ' + this.hoursJueves);
        this.dia = 'Jueves';
        this.horas(entrada, salida, this.hoursJueves, this.dia);
      }
    } else if (this.descriForm.get('juevesSelect').value !== '') {
      if (this.descriForm.get('juevesSelect').value === 'conpermiso') {
        this.conpermiso = this.conpermiso + 1;
        if (this.jornadaMi !== 0) {
          this.sumRequiredTipo(this.jornadaMi);
          this.hoursJueves = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.sumRequiredTipo(this.jornadaM);
          this.hoursJueves = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.sumRequiredTipo(this.jornadaL);
          this.hoursJueves = this.jornadaL;
        } else if (this.jornadaV !== 0) {
          this.sumRequiredTipo(this.jornadaV);
          this.hoursJueves = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.sumRequiredTipo(this.jornadaS);
          this.hoursJueves = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.sumRequiredTipo(this.jornadaD);
          this.hoursJueves = this.jornadaD;
        } else this.hoursJueves = 0;
      } else if (this.descriForm.get('juevesSelect').value === 'feriado') {
        this.feriado = this.feriado + 1;
        if (this.jornadaMi !== 0) {
          this.hoursJueves = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.hoursJueves = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursJueves = this.jornadaL;
        } else if (this.jornadaV !== 0) {
          this.hoursJueves = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.hoursJueves = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursJueves = this.jornadaD;
        } else this.hoursJueves = 0;
      } else if (
        this.descriForm.get('juevesSelect').value === 'incapacidadpub'
      ) {
        if (this.jornadaMi !== 0) {
          this.hoursJueves = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.hoursJueves = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursJueves = this.jornadaL;
        } else if (this.jornadaV !== 0) {
          this.hoursJueves = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.hoursJueves = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursJueves = this.jornadaD;
        } else this.hoursJueves = 0;
        if (this.incapacidadpub > 3) {
          this.hoursJueves = 0;
        }
      } else if (
        this.descriForm.get('juevesSelect').value === 'incapacidadpubparcial'
      ) {
        this.incapacidadpubparcial = this.incapacidadpubparcial + 1;
        this.hoursJueves = 0;
      } else if (
        this.descriForm.get('juevesSelect').value === 'incapacidadpriv'
      ) {
        this.incapacidadpriv = this.incapacidadpriv + 1;
        this.incPriv = true;
      } else if (
        this.descriForm.get('juevesSelect').value === 'incapacidadcancelada'
      ) {
        this.incapacidadcanc = this.incapacidadcanc + 1;
        this.hoursJueves = 0;
      } else if (this.descriForm.get('juevesSelect').value === 'septimo') {
        this.septimo = this.septimo + 1;
        if (this.isVisibleLibres === false) {
          if (this.septimo > 1) {
            this.libres();
          }
        }
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursJueves = 0;
      } else if (this.descriForm.get('juevesSelect').value === 'vacacion') {
        this.vacacion = this.vacacion + 1;
        if (this.jornadaMi !== 0) {
          this.hoursJueves = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.hoursJueves = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursJueves = this.jornadaL;
        } else if (this.jornadaV !== 0) {
          this.hoursJueves = this.jornadaV;
        } else if (this.jornadaS !== 0) {
          this.hoursJueves = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursJueves = this.jornadaD;
        } else this.hoursJueves = 0;
      } else if (
        this.descriForm.get('juevesSelect').value === 'vacacioncancelada'
      ) {
        this.vacacioncanc = this.vacacioncanc + 1;
        this.hoursJueves = 0;
      } else if (this.descriForm.get('juevesSelect').value === 'falta') {
        this.falta = this.falta + 1;
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursJueves = 0;
      } else if (this.descriForm.get('juevesSelect').value === 'suspension') {
        this.suspension = this.suspension + 1;
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursJueves = 0;
      } else if (this.descriForm.get('juevesSelect').value === 'abandono') {
        this.abandono = this.abandono + 1;
        this.hoursJueves = 0;
      }
    } else {
      if (this.isVisibleInvalidas === false) {
        this.invalidas();
      }
      this.horasForm.get('juIControl').setValue('');
      this.horasForm.get('juOControl').setValue('');
    }
    if (this.incPriv === true) {
      this.listIncapacidadPrivada.push('jueves');
    } else {
      this.tarjetas(
        entrada,
        salida,
        'juevesE',
        'juevesS',
        'horasJ',
        'XDJ',
        'XMJ',
        'XNJ',
        this.retornarJornada(
          this.jornada,
          'Jueves',
          this.descriForm.get('juevesSelect').value
        ),
        'jornadaJ',
        this.hoursJueves,
        this.descriForm.get('juevesSelect').value
      );
      this.hoursJueves = 0;
      this.extrasDiurna = 0;
      this.extrasMixta = 0;
      this.extrasNocturna = 0;
      this.dia = '';
    }
    this.incPriv = false;
  }
  revisarViernes(entrada: moment.Moment, salida: moment.Moment) {
    if (entrada.isValid() && salida.isValid()) {
      if (entrada.isSame(salida)) {
        if (this.isVisibleValidasIguales === false) {
          this.validasIguales();
        }
        this.horasForm.get('viIControl').setValue('');
        this.horasForm.get('viOControl').setValue('');
      } else {
        this.horasSemana(entrada, salida);
        this.hoursViernes = this.hours;
        console.log('Viernes: ' + this.hoursViernes);
        this.dia = 'Viernes';
        this.horas(entrada, salida, this.hoursViernes, this.dia);
      }
    } else if (this.descriForm.get('viernesSelect').value !== '') {
      if (this.descriForm.get('viernesSelect').value === 'conpermiso') {
        this.conpermiso = this.conpermiso + 1;
        if (this.jornadaJ !== 0) {
          this.sumRequiredTipo(this.jornadaJ);
          this.hoursViernes = this.jornadaJ;
        } else if (this.jornadaMi !== 0) {
          this.sumRequiredTipo(this.jornadaMi);
          this.hoursViernes = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.sumRequiredTipo(this.jornadaM);
          this.hoursViernes = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.sumRequiredTipo(this.jornadaL);
          this.hoursViernes = this.jornadaL;
        } else if (this.jornadaS !== 0) {
          this.sumRequiredTipo(this.jornadaS);
          this.hoursViernes = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.sumRequiredTipo(this.jornadaD);
          this.hoursViernes = this.jornadaD;
        } else this.hoursViernes = 0;
        console.log(this.hoursSabado);
      } else if (this.descriForm.get('viernesSelect').value === 'feriado') {
        this.feriado = this.feriado + 1;
        if (this.jornadaJ !== 0) {
          this.hoursViernes = this.jornadaJ;
        } else if (this.jornadaMi !== 0) {
          this.hoursViernes = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.hoursViernes = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursViernes = this.jornadaL;
        } else if (this.jornadaS !== 0) {
          this.hoursViernes = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursViernes = this.jornadaD;
        } else this.hoursViernes = 0;
      } else if (
        this.descriForm.get('viernesSelect').value === 'incapacidadpub'
      ) {
        if (this.jornadaJ !== 0) {
          this.hoursViernes = this.jornadaJ;
        } else if (this.jornadaMi !== 0) {
          this.hoursViernes = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.hoursViernes = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursViernes = this.jornadaL;
        } else if (this.jornadaS !== 0) {
          this.hoursViernes = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursViernes = this.jornadaD;
        } else this.hoursViernes = 0;
        if (this.incapacidadpub > 3) {
          this.hoursViernes = 0;
        }
      } else if (
        this.descriForm.get('viernesSelect').value === 'incapacidadpubparcial'
      ) {
        this.incapacidadpubparcial = this.incapacidadpubparcial + 1;
        this.hoursViernes = 0;
      } else if (
        this.descriForm.get('viernesSelect').value === 'incapacidadpriv'
      ) {
        this.incapacidadpriv = this.incapacidadpriv + 1;
        this.incPriv = true;
      } else if (
        this.descriForm.get('viernesSelect').value === 'incapacidadcancelada'
      ) {
        this.incapacidadcanc = this.incapacidadcanc + 1;
        this.hoursViernes = 0;
      } else if (this.descriForm.get('viernesSelect').value === 'septimo') {
        this.septimo = this.septimo + 1;
        if (this.isVisibleLibres === false) {
          if (this.septimo > 1) {
            this.libres();
          }
        }
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursViernes = 0;
      } else if (this.descriForm.get('viernesSelect').value === 'vacacion') {
        this.vacacion = this.vacacion + 1;
        if (this.jornadaJ !== 0) {
          this.hoursViernes = this.jornadaJ;
        } else if (this.jornadaMi !== 0) {
          this.hoursViernes = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.hoursViernes = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursViernes = this.jornadaL;
        } else if (this.jornadaS !== 0) {
          this.hoursViernes = this.jornadaS;
        } else if (this.jornadaD !== 0) {
          this.hoursViernes = this.jornadaD;
        } else this.hoursViernes = 0;
      } else if (
        this.descriForm.get('viernesSelect').value === 'vacacioncancelada'
      ) {
        this.vacacioncanc = this.vacacioncanc + 1;
        this.hoursViernes = 0;
      } else if (this.descriForm.get('viernesSelect').value === 'falta') {
        this.falta = this.falta + 1;
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursViernes = 0;
      } else if (this.descriForm.get('viernesSelect').value === 'suspension') {
        this.suspension = this.suspension + 1;
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursViernes = 0;
      } else if (this.descriForm.get('viernesSelect').value === 'abandono') {
        this.abandono = this.abandono + 1;
        this.hoursViernes = 0;
      }
    } else {
      if (this.isVisibleInvalidas === false) {
        this.invalidas();
      }
      this.horasForm.get('viIControl').setValue('');
      this.horasForm.get('viOControl').setValue('');
    }
    if (this.incPriv === true) {
      this.listIncapacidadPrivada.push('viernes');
    } else {
      this.tarjetas(
        entrada,
        salida,
        'viernesE',
        'viernesS',
        'horasV',
        'XDV',
        'XMV',
        'XNV',
        this.retornarJornada(
          this.jornada,
          'Viernes',
          this.descriForm.get('viernesSelect').value
        ),
        'jornadaV',
        this.hoursViernes,
        this.descriForm.get('viernesSelect').value
      );
      this.hoursViernes = 0;
      this.extrasDiurna = 0;
      this.extrasMixta = 0;
      this.extrasNocturna = 0;
      this.dia = '';
    }
    this.incPriv = false;
  }

  revisarSabado(entrada: moment.Moment, salida: moment.Moment) {
    if (entrada.isValid() && salida.isValid()) {
      if (entrada.isSame(salida)) {
        if (this.isVisibleValidasIguales === false) {
          this.validasIguales();
        }
        this.horasForm.get('saIControl').setValue('');
        this.horasForm.get('saOControl').setValue('');
      } else {
        this.horasSemana(entrada, salida);
        this.hoursSabado = this.hours;
        console.log('Sabado: ' + this.hoursSabado);
        this.dia = 'Sabado';
        if (this.hoursSabado >= 4) {
          if (
            (entrada >= this.diurnaI &&
              entrada < this.diurnaO &&
              salida <= this.diurnaO &&
              salida > this.diurnaI &&
              salida > entrada) ||
            (entrada >= this.diurnaI &&
              entrada < this.mixtaIa &&
              (salida > this.nocturnaI || salida <= this.reset))
          ) {
            this.extrasSabados = this.hoursSabado - 4;
            this.horas(entrada, salida, 4, this.dia);
          } else {
            this.horas(entrada, salida, this.hoursSabado, this.dia);
          }
        } else {
          this.horas(entrada, salida, this.hoursSabado, this.dia);
        }
      }
    } else if (this.descriForm.get('sabadoSelect').value !== '') {
      if (this.descriForm.get('sabadoSelect').value === 'conpermiso') {
        this.conpermiso = this.conpermiso + 1;
        if (this.jornadaV !== 0) {
          this.sumRequiredTipo(this.jornadaV);
          this.hoursSabado = this.jornadaV;
        } else if (this.jornadaJ !== 0) {
          this.sumRequiredTipo(this.jornadaJ);
          this.hoursSabado = this.jornadaJ;
        } else if (this.jornadaMi !== 0) {
          this.sumRequiredTipo(this.jornadaMi);
          this.hoursSabado = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.sumRequiredTipo(this.jornadaM);
          this.hoursSabado = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.sumRequiredTipo(this.jornadaL);
          this.hoursSabado = this.jornadaL;
        } else if (this.jornadaD !== 0) {
          this.sumRequiredTipo(this.jornadaD);
          this.hoursSabado = this.jornadaD;
        } else this.hoursSabado = 0;
        if (this.hoursSabado / 8 === 1) {
          this.hoursSabado = 4;
          this.sumRequiredTipo(this.hoursSabado);
        }
        console.log(this.hoursSabado);
      } else if (this.descriForm.get('sabadoSelect').value === 'feriado') {
        this.feriado = this.feriado + 1;
        if (this.jornadaV !== 0) {
          this.hoursSabado = this.jornadaV;
        } else if (this.jornadaJ !== 0) {
          this.hoursSabado = this.jornadaJ;
        } else if (this.jornadaMi !== 0) {
          this.hoursSabado = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.hoursSabado = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursSabado = this.jornadaL;
        } else if (this.jornadaD !== 0) {
          this.hoursSabado = this.jornadaD;
        } else this.hoursSabado = 0;
        if (this.hoursSabado / 8 === 1) {
          this.hoursSabado = 4;
        }
      } else if (
        this.descriForm.get('sabadoSelect').value === 'incapacidadpub'
      ) {
        if (this.jornadaV !== 0) {
          this.hoursSabado = this.jornadaV;
        } else if (this.jornadaJ !== 0) {
          this.hoursSabado = this.jornadaJ;
        } else if (this.jornadaMi !== 0) {
          this.hoursSabado = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.hoursSabado = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursSabado = this.jornadaL;
        } else if (this.jornadaD !== 0) {
          this.hoursSabado = this.jornadaD;
        } else this.hoursSabado = 0;
        if (this.hoursSabado / 8 === 1) {
          this.hoursSabado = 4;
        }
        if (this.incapacidadpub > 3) {
          this.hoursSabado = 0;
        }
      } else if (
        this.descriForm.get('sabadoSelect').value === 'incapacidadpubparcial'
      ) {
        this.incapacidadpubparcial = this.incapacidadpubparcial + 1;
        this.hoursSabado = 0;
      } else if (
        this.descriForm.get('sabadoSelect').value === 'incapacidadpriv'
      ) {
        this.incapacidadpriv = this.incapacidadpriv + 1;
        this.incapacidadReal = 1;
        this.incPriv = true;
      } else if (
        this.descriForm.get('sabadoSelect').value === 'incapacidadcancelada'
      ) {
        this.incapacidadcanc = this.incapacidadcanc + 1;
        this.hoursSabado = 0;
      } else if (this.descriForm.get('sabadoSelect').value === 'septimo') {
        this.septimo = this.septimo + 1;
        if (this.isVisibleLibres === false) {
          if (this.septimo > 1) {
            this.libres();
          }
        }
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursSabado = 0;
      } else if (this.descriForm.get('sabadoSelect').value === 'vacacion') {
        this.vacacion = this.vacacion + 1;
        if (this.jornadaV !== 0) {
          this.hoursSabado = this.jornadaV;
        } else if (this.jornadaJ !== 0) {
          this.hoursSabado = this.jornadaJ;
        } else if (this.jornadaMi !== 0) {
          this.hoursSabado = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.hoursSabado = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursSabado = this.jornadaL;
        } else if (this.jornadaD !== 0) {
          this.hoursSabado = this.jornadaD;
        } else this.hoursSabado = 0;
        if (this.hoursSabado / 8 === 1) {
          this.hoursSabado = 4;
        }
      } else if (
        this.descriForm.get('sabadoSelect').value === 'vacacioncancelada'
      ) {
        this.vacacioncanc = this.vacacioncanc + 1;
        this.hoursSabado = 0;
      } else if (this.descriForm.get('sabadoSelect').value === 'falta') {
        this.falta = this.falta + 1;
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursSabado = 0;
      } else if (this.descriForm.get('sabadoSelect').value === 'suspension') {
        this.suspension = this.suspension + 1;
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursSabado = 0;
      } else if (this.descriForm.get('sabadoSelect').value === 'abandono') {
        this.abandono = this.abandono + 1;
        this.hoursSabado = 0;
      }
    } else {
      if (this.isVisibleInvalidas === false) {
        this.invalidas();
      }
      this.horasForm.get('saIControl').setValue('');
      this.horasForm.get('saOControl').setValue('');
    }
    if (this.incPriv === true) {
      this.listIncapacidadPrivada.push('sabado');
    } else {
      this.tarjetas(
        entrada,
        salida,
        'sabadoE',
        'sabadoS',
        'horasS',
        'XDS',
        'XMS',
        'XNS',
        this.retornarJornada(
          this.jornada,
          'Sabado',
          this.descriForm.get('sabadoSelect').value
        ),
        'jornadaS',
        this.hoursSabado,
        this.descriForm.get('sabadoSelect').value
      );
      this.hoursSabado = 0;
      this.extrasDiurna = 0;
      this.extrasMixta = 0;
      this.extrasNocturna = 0;
      this.dia = '';
    }
    this.incPriv = false;
  }
  revisarDomingo(entrada: moment.Moment, salida: moment.Moment) {
    if (entrada.isValid() && salida.isValid()) {
      if (entrada.isSame(salida)) {
        if (this.isVisibleValidasIguales === false) {
          this.validasIguales();
        }
        this.horasForm.get('doIControl').setValue('');
        this.horasForm.get('doOControl').setValue('');
      } else {
        this.horasSemana(entrada, salida);
        this.hoursDomingo = this.hours;
        console.log('Domingo: ' + this.hoursDomingo);
        this.dia = 'Domingo';
        this.horas(entrada, salida, this.hoursDomingo, this.dia);
      }
    } else if (this.descriForm.get('domingoSelect').value !== '') {
      if (this.descriForm.get('domingoSelect').value === 'conpermiso') {
        this.conpermiso = this.conpermiso + 1;
        if (this.jornadaS !== 0) {
          this.sumRequiredTipo(this.jornadaS);
          this.hoursDomingo = this.jornadaS;
        } else if (this.jornadaV !== 0) {
          this.sumRequiredTipo(this.jornadaV);
          this.hoursDomingo = this.jornadaV;
        } else if (this.jornadaJ !== 0) {
          this.sumRequiredTipo(this.jornadaJ);
          this.hoursDomingo = this.jornadaJ;
        } else if (this.jornadaMi !== 0) {
          this.sumRequiredTipo(this.jornadaMi);
          this.hoursDomingo = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.sumRequiredTipo(this.jornadaM);
          this.hoursDomingo = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.sumRequiredTipo(this.jornadaL);
          this.hoursDomingo = this.jornadaL;
        } else this.hoursDomingo = 0;
      } else if (this.descriForm.get('domingoSelect').value === 'feriado') {
        this.feriado = this.feriado + 1;
        if (this.jornadaS !== 0) {
          this.hoursDomingo = this.jornadaS;
        } else if (this.jornadaV !== 0) {
          this.hoursDomingo = this.jornadaV;
        } else if (this.jornadaJ !== 0) {
          this.hoursDomingo = this.jornadaJ;
        } else if (this.jornadaMi !== 0) {
          this.hoursDomingo = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.hoursDomingo = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursDomingo = this.jornadaL;
        } else this.hoursDomingo = 0;
      } else if (
        this.descriForm.get('domingoSelect').value === 'incapacidadpub'
      ) {
        if (this.jornadaS !== 0) {
          this.hoursDomingo = this.jornadaS;
        } else if (this.jornadaV !== 0) {
          this.hoursDomingo = this.jornadaV;
        } else if (this.jornadaJ !== 0) {
          this.hoursDomingo = this.jornadaJ;
        } else if (this.jornadaMi !== 0) {
          this.hoursDomingo = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.hoursDomingo = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursDomingo = this.jornadaL;
        } else this.hoursDomingo = 0;
        if (this.incapacidadpub > 3) {
          this.hoursDomingo = 0;
        }
      } else if (
        this.descriForm.get('domingoSelect').value === 'incapacidadpubparcial'
      ) {
        this.incapacidadpubparcial = this.incapacidadpubparcial + 1;
        this.hoursDomingo = 0;
      } else if (
        this.descriForm.get('domingoSelect').value === 'incapacidadpriv'
      ) {
        this.incapacidadpriv = this.incapacidadpriv + 1;
        this.incPriv = true;
      } else if (
        this.descriForm.get('domingoSelect').value === 'incapacidadcancelada'
      ) {
        this.incapacidadcanc = this.incapacidadcanc + 1;
        this.hoursDomingo = 0;
      } else if (this.descriForm.get('domingoSelect').value === 'septimo') {
        this.septimo = this.septimo + 1;
        if (this.isVisibleLibres === false) {
          if (this.septimo > 1) {
            this.libres();
          }
        }
        this.hoursDomingo = 0;
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursDomingo = 0;
      } else if (this.descriForm.get('domingoSelect').value === 'vacacion') {
        this.vacacion = this.vacacion + 1;
        if (this.jornadaS !== 0) {
          this.hoursDomingo = this.jornadaS;
        } else if (this.jornadaV !== 0) {
          this.hoursDomingo = this.jornadaV;
        } else if (this.jornadaJ !== 0) {
          this.hoursDomingo = this.jornadaJ;
        } else if (this.jornadaMi !== 0) {
          this.hoursDomingo = this.jornadaMi;
        } else if (this.jornadaM !== 0) {
          this.hoursDomingo = this.jornadaM;
        } else if (this.jornadaL !== 0) {
          this.hoursDomingo = this.jornadaL;
        } else this.hoursDomingo = 0;
      } else if (
        this.descriForm.get('domingoSelect').value === 'vacacioncancelada'
      ) {
        this.vacacioncanc = this.vacacioncanc + 1;
        this.hoursDomingo = 0;
      } else if (this.descriForm.get('domingoSelect').value === 'falta') {
        this.falta = this.falta + 1;
        if (this.falta >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursDomingo = 0;
      } else if (this.descriForm.get('domingoSelect').value === 'suspension') {
        this.suspension = this.suspension + 1;
        if (this.suspension >= 1 && this.septimo >= 1) {
          this.septimo = 0;
        }
        this.hoursDomingo = 0;
      } else if (this.descriForm.get('domingoSelect').value === 'abandono') {
        this.abandono = this.abandono + 1;
      }
      this.hoursDomingo = 0;
    } else {
      if (this.isVisibleInvalidas === false) {
        this.invalidas();
      }
      this.horasForm.get('doIControl').setValue('');
      this.horasForm.get('doOControl').setValue('');
    }
    if (this.incPriv === true) {
      this.listIncapacidadPrivada.push('domingo');
    } else {
      this.tarjetas(
        entrada,
        salida,
        'domingoE',
        'domingoS',
        'horasD',
        'XDD',
        'XMD',
        'XND',
        this.retornarJornada(
          this.jornada,
          'Domingo',
          this.descriForm.get('domingoSelect').value
        ),
        'jornadaD',
        this.hoursDomingo,
        this.descriForm.get('domingoSelect').value
      );
      this.hoursDomingo = 0;
      this.extrasDiurna = 0;
      this.extrasMixta = 0;
      this.extrasNocturna = 0;
      this.dia = '';
    }
    this.incPriv = false;
  }
  promedio() {
    console.log(
      this.totalTrabNormales,
      this.totalTrabRealesCompletas,
      this.sabadoHorasNormales,
      this.totalTrabReales
    );
    console.log(
      this.totalTrabNormales,
      this.totalTrabReales,
      this.totalExtrasDiurnas,
      this.totalExtrasMixtas,
      this.totalExtrasNocturnas
    );
    var normales: number = 0;
    if (this.diaDiurno >= this.diaMixto) {
      if (this.diaDiurno >= this.diaNocturno) normales = 44;
      else normales = 36;
    } else {
      if (this.diaMixto >= this.diaNocturno) normales = 42;
      else normales = 36;
    }
    this.totalExtrasDiurnas = 0;
    this.totalExtrasMixtas = 0;
    this.totalExtrasNocturnas = 0;
    console.log(normales, this.diaDiurno, this.diaMixto, this.diaNocturno);
    if (this.isVisiblePromedio === false) {
      this.totalTrabNormales = (this.totalTrabRealesCompletas / normales) * 48;
      var number = Math.trunc(this.totalTrabNormales * 100) / 100;
      this.totalTrabNormales = number;
    }
  }
  calcularMain() {
    if (this.fileUploaded === true) {
      this.horasLuI(this.horasForm.get('luIControl').value);
      this.horasLuO(this.horasForm.get('luOControl').value);
      this.horasMaI(this.horasForm.get('maIControl').value);
      this.horasMaO(this.horasForm.get('maOControl').value);
      this.horasMiI(this.horasForm.get('miIControl').value);
      this.horasMiO(this.horasForm.get('miOControl').value);
      this.horasJuI(this.horasForm.get('juIControl').value);
      this.horasJuO(this.horasForm.get('juOControl').value);
      this.horasViI(this.horasForm.get('viIControl').value);
      this.horasViO(this.horasForm.get('viOControl').value);
      this.horasSaI(this.horasForm.get('saIControl').value);
      this.horasSaO(this.horasForm.get('saOControl').value);
      this.horasDoI(this.horasForm.get('doIControl').value);
      this.horasDoO(this.horasForm.get('doOControl').value);
    }
    this.lunesDesde = moment(this.luI, 'HH:mm a');
    this.lunesHasta = moment(this.luO, 'HH:mm a');
    this.martesDesde = moment(this.maI, 'HH:mm a');
    this.martesHasta = moment(this.maO, 'HH:mm a');
    this.miercolesDesde = moment(this.miI, 'HH:mm a');
    this.miercolesHasta = moment(this.miO, 'HH:mm a');
    this.juevesDesde = moment(this.juI, 'HH:mm a');
    this.juevesHasta = moment(this.juO, 'HH:mm a');
    this.viernesDesde = moment(this.viI, 'HH:mm a');
    this.viernesHasta = moment(this.viO, 'HH:mm a');
    this.sabadoDesde = moment(this.saI, 'HH:mm a');
    this.sabadoHasta = moment(this.saO, 'HH:mm a');
    this.domingoDesde = moment(this.doI, 'HH:mm a');
    this.domingoHasta = moment(this.doO, 'HH:mm a');
    this.isVisibleInvalidas = false;
    this.isVisibleValidasIguales = false;
    this.isVisibleLibres = false;
    this.detectarJornada();
    this.resetObservacion();
    this.detectarIncapacidad();
    this.revisarLunes(this.lunesDesde, this.lunesHasta);
    this.revisarMartes(this.martesDesde, this.martesHasta);
    this.revisarMiercoles(this.miercolesDesde, this.miercolesHasta);
    this.revisarJueves(this.juevesDesde, this.juevesHasta);
    this.revisarViernes(this.viernesDesde, this.viernesHasta);
    this.revisarSabado(this.sabadoDesde, this.sabadoHasta);
    this.revisarDomingo(this.domingoDesde, this.domingoHasta);

    console.log(
      this.conpermiso,
      this.totalExtrasDiurnas,
      this.totalExtrasMixtas,
      this.totalExtrasNocturnas
    );
    var sumExtras =
      this.totalExtrasDiurnas +
      this.totalExtrasMixtas +
      this.totalExtrasNocturnas;
    if (this.switchValuePP === true) {
      if (this.totalTrabNormales + sumExtras >= 48) {
        this.totalTrabNormales = 48;
        this.totalExtrasDiurnas = 4;
        this.totalExtrasMixtas = 0;
        this.totalExtrasNocturnas = 0;
      } else if (
        this.totalTrabNormales < 44 &&
        sumExtras > 0 &&
        this.totalTrabNormales + sumExtras < 44 &&
        this.ajusteDias > 0
      ) {
        console.log(
          this.ajusteDias,
          this.totalTrabNormales,
          this.totalExtrasDiurnas,
          this.totalTrabReales,
          sumExtras
        );
        this.septimo = 0;
        var temphoras = this.ajusteDias * 8;
        var temp = sumExtras - temphoras;
        if (temp > 0) {
          this.totalExtrasDiurnas = 4;
          this.totalExtrasMixtas = 0;
          this.totalExtrasNocturnas = 0;
        } else {
          this.totalExtrasDiurnas = 4;
          this.totalExtrasMixtas = 0;
          this.totalExtrasNocturnas = 0;
        }
      } else {
        console.log(
          this.ajusteDias,
          this.totalTrabNormales,
          this.totalExtrasDiurnas,
          this.totalTrabReales,
          sumExtras
        );
        console.log('muy bajo');
        this.totalExtrasDiurnas = 4;
        this.totalExtrasMixtas = 0;
        this.totalExtrasNocturnas = 0;
        this.septimo = 0;
      }
    } else if (this.switchValuePP === false) {
      if (this.totalTrabNormales >= 44) {
        console.log('completo');
      } else if (
        (this.totalTrabNormales < 44 && sumExtras > 0) ||
        this.totalTrabNormales + sumExtras < 44 ||
        (this.totalTrabNormales < 44 &&
          sumExtras > 0 &&
          (this.conpermiso > 0 || this.incapacidadpriv > 0)) ||
        (this.totalTrabNormales < 44 &&
          sumExtras > 0 &&
          this.conpermiso > 0 &&
          this.incapacidadpriv > 0)
      ) {
        if (this.incapacidadpriv > 0) {
          document
            .getElementById('btnCalcular')
            .setAttribute('disabled', 'true');
          this.isVisibleDivSecundario = true;
          this.extraFormSecundario.get('jornadaSelect').setValue('');
          this.extraFormSecundario.get('jornadaSelect').enable();
          this.btnEnable = false;
        } else {
          console.log(
            this.requiredCompletarIncapacidadPrivada,
            this.incapacidadpriv
          );
          this.completar();
          this.tarjetas(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
          );
          this.isVisiblePromedio = false;
        }
      }
    }
    if (
      this.isVisibleInvalidas === false &&
      this.isVisibleValidasIguales === false &&
      this.isVisibleLibres === false
    ) {
      if (this.btnEnable === true) {
        document.getElementById('btnCalcular').removeAttribute('disabled');
      }
      document.getElementById('btnRevisar').setAttribute('disabled', 'true');
      //calcula valor incapacidad
      this.incapacidad();
      this.horasForm.disable();
      this.descriForm.disable();
      this.isDisabledPP = true;
      document
        .getElementById('btnAutofillDiurna')
        .setAttribute('disabled', 'true');
      document
        .getElementById('btnAutofillNocturna')
        .setAttribute('disabled', 'true');
      document
        .getElementById('btnAutofillMixta')
        .setAttribute('disabled', 'true');
    }
  }
  completar() {
    var faltante = 0,
      faltante2 = 0,
      faltante3 = 0,
      autorizado = this.requiredCompletarAutorizado,
      autorizadoReal = this.requiredCompletarAutorizadoReal,
      privada = this.requiredCompletarIncapacidadPrivada,
      sumExtras =
        this.totalExtrasDiurnas +
        this.totalExtrasMixtas +
        this.totalExtrasNocturnas,
      sumRequired =
        this.requiredCompletarDiurna +
        this.requiredCompletarMixta +
        this.requiredCompletarNocturna +
        this.requiredCompletarIncapacidadPrivada +
        this.requiredCompletarAutorizado;
    console.log(
      'required ',
      this.totalTrabNormales,
      this.totalTrabReales,
      this.requiredCompletarDiurna,
      this.requiredCompletarMixta,
      this.requiredCompletarNocturna,
      this.requiredCompletarIncapacidadPrivada,
      this.requiredCompletarAutorizado
    );
    console.log(
      'extras',
      this.totalExtrasDiurnas,
      this.totalExtrasMixtas,
      this.totalExtrasNocturnas
    );
    console.log(sumExtras, sumRequired);
    if (sumExtras >= sumRequired && sumExtras !== 0 && sumRequired !== 0) {
      if (this.requiredCompletarDiurna > this.totalExtrasDiurnas) {
        faltante = this.requiredCompletarDiurna - this.totalExtrasDiurnas;
        this.totalExtrasDiurnas = 0;
        if (faltante > this.totalExtrasMixtas) {
          faltante2 = faltante - this.totalExtrasMixtas;
          this.totalExtrasMixtas = 0;
          if (faltante2 > this.totalExtrasNocturnas) {
            faltante3 = faltante2 - this.totalExtrasNocturnas;
            this.totalExtrasNocturnas = 0;
            this.promedio();
            this.isVisiblePromedio = true;
          } else {
            this.totalExtrasNocturnas = this.totalExtrasNocturnas - faltante2;
          }
        } else {
          this.totalExtrasMixtas = this.totalExtrasMixtas - faltante;
        }
      } else {
        this.totalExtrasDiurnas =
          this.totalExtrasDiurnas - this.requiredCompletarDiurna;
      }
      if (this.requiredCompletarMixta > this.totalExtrasMixtas) {
        faltante = this.requiredCompletarMixta - this.totalExtrasMixtas;
        this.totalExtrasMixtas = 0;
        if (faltante > this.totalExtrasDiurnas) {
          faltante2 = faltante - this.totalExtrasDiurnas;
          this.totalExtrasDiurnas = 0;
          if (faltante2 > this.totalExtrasNocturnas) {
            faltante3 = faltante2 - this.totalExtrasNocturnas;
            this.totalExtrasNocturnas = 0;
            this.promedio();
            this.isVisiblePromedio = true;
          } else {
            this.totalExtrasNocturnas = this.totalExtrasNocturnas - faltante2;
          }
        } else {
          this.totalExtrasDiurnas = this.totalExtrasDiurnas - faltante;
        }
      } else {
        this.totalExtrasMixtas =
          this.totalExtrasMixtas - this.requiredCompletarMixta;
      }
      if (this.requiredCompletarNocturna > this.totalExtrasNocturnas) {
        faltante = this.requiredCompletarNocturna - this.totalExtrasNocturnas;
        this.totalExtrasNocturnas = 0;
        if (faltante > this.totalExtrasMixtas) {
          faltante2 = faltante - this.totalExtrasMixtas;
          this.totalExtrasMixtas = 0;
          if (faltante2 > this.totalExtrasDiurnas) {
            faltante3 = faltante2 - this.totalExtrasDiurnas;
            this.totalExtrasDiurnas = 0;
            this.promedio();
            this.isVisiblePromedio = true;
          } else {
            this.totalExtrasDiurnas = this.totalExtrasDiurnas - faltante2;
          }
        } else {
          this.totalExtrasMixtas = this.totalExtrasMixtas - faltante;
        }
      } else {
        this.totalExtrasNocturnas =
          this.totalExtrasNocturnas - this.requiredCompletarNocturna;
      }
      if (this.requiredCompletarIncapacidadPrivada > this.totalExtrasDiurnas) {
        faltante =
          this.requiredCompletarIncapacidadPrivada - this.totalExtrasDiurnas;
        this.totalExtrasDiurnas = 0;
        this.requiredCompletarIncapacidadPrivada = 0;
        if (faltante > this.totalExtrasMixtas) {
          faltante2 = faltante - this.totalExtrasMixtas;
          this.totalExtrasMixtas = 0;
          if (faltante2 > this.totalExtrasNocturnas) {
            faltante3 = faltante2 - this.totalExtrasNocturnas;
            this.totalExtrasNocturnas = 0;
            this.promedio();
            this.isVisiblePromedio = true;
          } else {
            this.totalExtrasNocturnas = this.totalExtrasNocturnas - faltante2;
          }
        } else {
          this.totalExtrasMixtas = this.totalExtrasMixtas - faltante;
        }
      } else {
        this.totalExtrasDiurnas =
          this.totalExtrasDiurnas - this.requiredCompletarIncapacidadPrivada;
        this.requiredCompletarIncapacidadPrivada = 0;
      }
      if (this.requiredCompletarAutorizado > this.totalExtrasDiurnas) {
        faltante = this.requiredCompletarAutorizado - this.totalExtrasDiurnas;
        this.totalExtrasDiurnas = 0;
        this.requiredCompletarAutorizado = 0;
        this.requiredCompletarAutorizadoReal = 0;
        if (faltante > this.totalExtrasMixtas) {
          faltante2 = faltante - this.totalExtrasMixtas;
          this.totalExtrasMixtas = 0;
          if (faltante2 > this.totalExtrasNocturnas) {
            faltante3 = faltante2 - this.totalExtrasNocturnas;
            this.totalExtrasNocturnas = 0;
            this.promedio();
            this.isVisiblePromedio = true;
          } else {
            this.totalExtrasNocturnas = this.totalExtrasNocturnas - faltante2;
          }
        } else {
          this.totalExtrasMixtas = this.totalExtrasMixtas - faltante;
        }
      } else {
        this.totalExtrasDiurnas =
          this.totalExtrasDiurnas - this.requiredCompletarAutorizado;
        this.requiredCompletarAutorizado = 0;
        this.requiredCompletarAutorizadoReal = 0;
      }
      console.log(
        'required ',
        this.requiredCompletarDiurna,
        this.requiredCompletarMixta,
        this.requiredCompletarNocturna,
        this.requiredCompletarIncapacidadPrivada,
        this.requiredCompletarAutorizado,
        autorizado,
        autorizadoReal,
        privada
      );
      console.log(
        'extras',
        this.totalExtrasDiurnas,
        this.totalExtrasMixtas,
        this.totalExtrasNocturnas
      );
      if (
        this.requiredCompletarAutorizado === 0 &&
        this.requiredCompletarAutorizadoReal === 0 &&
        this.requiredCompletarIncapacidadPrivada === 0
      ) {
        var ajuste = this.ajusteDias * 8;
        console.log(
          this.ajusteDias,
          ajuste,
          autorizado,
          privada,
          autorizadoReal,
          this.totalTrabNormales,
          this.incapacidadReal,
          this.incapacidadpriv
        );
        this.totalTrabNormales =
          this.totalTrabNormales +
          ajuste +
          autorizado +
          autorizadoReal +
          this.incapacidadpriv * 8;
      }
    }
    if (sumRequired > sumExtras) {
      console.log(
        'required ',
        this.ajusteDias,
        this.requiredCompletarDiurna,
        this.requiredCompletarMixta,
        this.requiredCompletarNocturna,
        this.requiredCompletarIncapacidadPrivada,
        this.requiredCompletarAutorizado
      );
      console.log(
        'extras',
        this.totalExtrasDiurnas,
        this.totalExtrasMixtas,
        this.totalExtrasNocturnas
      );
      this.promedio();
    }
  }
  limpiarResumen() {
    this.lunesDesde = moment();
    this.lunesHasta = moment();
    this.martesDesde = moment();
    this.martesHasta = moment();
    this.miercolesDesde = moment();
    this.miercolesHasta = moment();
    this.juevesDesde = moment();
    this.juevesHasta = moment();
    this.viernesDesde = moment();
    this.viernesHasta = moment();
    this.sabadoDesde = moment();
    this.sabadoHasta = moment();
    this.domingoDesde = moment();
    this.domingoHasta = moment();
    this.resetObservacion();
    this.resumenForm.reset();
  }
  incapacidadPubParcial() {
    var valorTotal = 0,
      dias = 0;
    dias = this.extraFormTercero.get('dias').value;
    valorTotal = this.truncator(this.extraFormTercero.get('incpub').value);
    this.incapacidadpendiente = dias - this.incapacidadpubparcial;
    if (dias < this.incapacidadpubparcial) {
      this.invalidaIncPub();
      this.incapacidadpendiente = 0;
      this.valorIncapacidadPub = 0;
    } else {
      if (
        this.descriForm.get('sabadoSelect').value === 'incapacidadpubparcial' &&
        this.incapacidadpendiente > 0
      ) {
        this.septimo = 0;
      }
      this.valorIncapacidadPub = this.round2Decimal(
        (valorTotal / dias) * this.incapacidadpubparcial
      );
      var temp = this.resumenForm.get('incapacidad').value;
      this.valorIncapacidadPub = this.valorIncapacidadPub + temp;
      console.log(temp, this.valorIncapacidadPub);
      this.resumenForm.get('incapacidad').setValue(this.valorIncapacidadPub);
      this.incapacidadpub = this.incapacidadpubparcial;
      if (this.incapacidadpriv <= 0) {
        document.getElementById('btnCalcular').removeAttribute('disabled');
      }
      this.isVisibleDivTercero = false;
    }
  }
  incapacidad() {
    if (this.incapacidadpubparcial >= 1) {
      this.isVisibleDivTercero = true;
      document.getElementById('btnCalcular').setAttribute('disabled', 'true');
      this.extraFormTercero.get('incpub').enable();
      this.extraFormTercero.get('dias').enable();
    }
    if (this.incapacidadpub > 3) {
      this.isVisibleDivPrimario = true;
      document.getElementById('btnCalcular').setAttribute('disabled', 'true');
      this.extraForm.get('incpub').enable();
    } else {
      this.valorIncapacidadPub =
        this.incapacidadpub * 8 * this.salarioMinimoPerHour;
      this.valorIncapacidadPub = this.truncator(this.valorIncapacidadPub);
      this.resumenForm.get('incapacidad').setValue(this.valorIncapacidadPub);
    }
  }
  incapacidadPub() {
    if (this.diferencia >= 8) {
      this.valorIncapacidadPub = this.round2Decimal(
        this.extraForm.get('incpub').value
      );
      var valorDeducir = this.incapacidadpub * this.salarioMinimoPerDia;
      for (let i = 0; i < this.listNomina.length; i++) {
        if (this.listNomina[i].id === this.idEmpleado) {
          this.listNominaFinal[i].ingresoBruto = this.round2Decimal(
            this.listNominaFinal[i].ingresoBruto - valorDeducir
          );
          this.listNominaFinal[i].incapacidad = this.valorIncapacidadPub;
          this.totalAPagar = this.totalAPagar - this.listNomina[i].totalPagar;
          this.listNomina[i].ingresos = this.round2Decimal(
            this.listNomina[i].ingresos - valorDeducir
          );
          this.listNominaFinal[i].totalPagar = this.round2Decimal(
            this.listNominaFinal[i].ingresos -
              this.listNominaFinal[i].deducciones
          );
          this.totalAPagar = this.totalAPagar + this.listNomina[i].totalPagar;
          console.log(this.totalAPagar);
          this.sueldoString = this.numberWithCommas(
            this.listNomina[i].ingresos
          );
        }
      }
      console.log(this.valorIncapacidadPub);
      this.resumenForm.get('incapacidadpub').setValue(this.valorIncapacidadPub);
      this.resumenForm.get('incapacidadpub').disable();
      this.isVisibleDivPrimario = false;
      this.extraForm.reset();
    } else {
      this.valorIncapacidadPub = this.truncator(
        this.extraForm.get('incpub').value
      );
      this.resumenForm.get('incapacidad').setValue(this.valorIncapacidadPub);
      if (this.incapacidadpriv <= 0) {
        document.getElementById('btnCalcular').removeAttribute('disabled');
      }
      this.isVisibleDivPrimario = false;
    }
  }
  incapacidadPriv() {
    document.getElementById('btnCalcular').removeAttribute('disabled');
    console.log(this.requiredCompletarIncapacidadPrivada, this.incapacidadpriv);
    var completarPriv = this.requiredCompletarIncapacidadPrivada;
    this.completar();
    for (let i = 0; i < this.listIncapacidadPrivada.length; i++) {
      var letra: string = '';
      if (this.listIncapacidadPrivada[i] === 'lunes') {
        letra = 'L';
      } else if (this.listIncapacidadPrivada[i] === 'martes') {
        letra = 'M';
      } else if (this.listIncapacidadPrivada[i] === 'miercoles') {
        letra = 'Mi';
      } else if (this.listIncapacidadPrivada[i] === 'jueves') {
        letra = 'J';
      } else if (this.listIncapacidadPrivada[i] === 'viernes') {
        letra = 'V';
      } else if (this.listIncapacidadPrivada[i] === 'sabado') {
        letra = 'S';
      } else if (this.listIncapacidadPrivada[i] === 'domingo') {
        letra = 'D';
      }
      console.log(
        this.extraFormSecundario.get('jornadaSelect').value,
        this.listIncapacidadPrivada[i],
        completarPriv,
        this.retornarJornada(
          this.extraFormSecundario.get('jornadaSelect').value,
          this.listIncapacidadPrivada[i],
          'incapacidadpriv'
        )
      );
      console.log(
        'YA PASO',
        this.totalExtrasDiurnas,
        this.totalExtrasMixtas,
        this.totalExtrasNocturnas
      );

      this.tarjetas(
        moment.invalid(),
        moment.invalid(),
        this.listIncapacidadPrivada[i] + 'E',
        this.listIncapacidadPrivada[i] + 'S',
        'horas' + letra,
        'XD' + letra,
        'XM' + letra,
        'XN' + letra,
        completarPriv / this.incapacidadpriv,
        'jornada' + letra,
        completarPriv / this.incapacidadpriv,
        'incapacidadpriv'
      );
    }
    this.isVisiblePromedio = false;
    this.isVisibleDivSecundario = false;
  }
  round2Decimal(num: number) {
    var m = Number((Math.abs(num) * 100).toPrecision(15));
    return (Math.round(m) / 100) * Math.sign(num);
  }
  ingresosTotalMain() {
    var roundRecargoDiurna: number;
    var roundRecargoMixta: number;
    var roundRecargoNocturna: number;
    var permanente: boolean;
    var idTemporal: number = this.idEmpleado;
    //calcula valor hora normal
    this.valorNormal = this.round2Decimal(
      this.totalTrabNormales * this.salarioMinimoPerHour
    );
    this.resumenForm.get('hn').setValue(this.valorNormal);
    //calcula valor hora diurna
    roundRecargoDiurna = this.round2Decimal(this.recargo * 1.25);
    this.valorHED = this.truncator(
      this.totalExtrasDiurnas * roundRecargoDiurna
    );
    this.resumenForm.get('hed').setValue(this.valorHED);
    //calcula valor hora mixta
    roundRecargoMixta = this.round2Decimal(this.recargo * 1.5);
    this.valorHEM = this.truncator(this.totalExtrasMixtas * roundRecargoMixta);
    this.resumenForm.get('hem').setValue(this.valorHEM);
    //calcula valor hora nocturna
    roundRecargoNocturna = this.round2Decimal(this.recargo * 1.25 * 1.75);
    this.valorHEN = this.truncator(
      this.totalExtrasNocturnas * roundRecargoNocturna
    );
    this.resumenForm.get('hen').setValue(this.valorHEN);
    //valor ajuste positivo
    this.ajustePositivo = this.round2Decimal(
      this.resumenForm.get('ajuste').value
    );
    this.resumenForm.get('ajuste').disable();
    //calcula valor feriados
    this.valorFeriado = this.truncator(
      this.feriado * 8 * this.salarioMinimoPerHour
    );
    this.resumenForm.get('feriado').setValue(this.valorFeriado);
    //calcula valor del septimo dia
    this.valorSeptimo = this.truncator(
      this.septimo * 8 * this.salarioMinimoPerHour
    );
    this.resumenForm.get('septimo').setValue(this.valorSeptimo);
    //calcula valor de vacaciones
    this.valorVacacion = this.truncator(
      this.vacacion * 8 * this.salarioMinimoPerHour
    );
    this.resumenForm.get('vacacion').setValue(this.valorVacacion);
    //sumatoria del salario
    this.sueldo =
      this.valorNormal +
      this.valorHED +
      this.valorHEM +
      this.valorHEN +
      this.valorFeriado +
      this.valorSeptimo +
      this.valorIncapacidadPub +
      this.valorVacacion +
      this.ajustePositivo;
    console.log(
      this.salarioMinimoPerHour,
      roundRecargoDiurna,
      roundRecargoMixta,
      roundRecargoNocturna,
      this.totalExtrasNocturnas,
      this.totalExtrasNocturnas * roundRecargoNocturna
    );
    console.log(
      this.valorNormal,
      this.valorHED,
      this.valorHEM,
      this.valorHEN,
      this.valorFeriado,
      this.valorSeptimo,
      this.valorIncapacidadPub,
      this.valorVacacion,
      this.sueldo
    );
    this.sueldo = this.round2Decimal(this.sueldo);
    console.log(this.sueldo);
    if (this.sueldo === 0) {
      this.sueldoString = '0.00';
      document.getElementById('btnCalcular').setAttribute('disabled', 'true');
    } else {
      this.sueldoString = this.numberWithCommas(this.sueldo);
      document.getElementById('btnCalcular').setAttribute('disabled', 'true');
    }
    for (let i = 0; i < this.listNomina.length; i++) {
      if (this.listNomina[i].id === this.idEmpleado) {
        if (this.listNomina[i].totalPagar === 0) {
          this.totalCalculados = this.totalCalculados + 1;
        }
        console.log(
          this.conpermiso,
          this.feriado,
          this.incapacidadpub,
          this.incapacidadpubparcial,
          this.incapacidadpriv,
          this.incapacidadcanc,
          this.vacacion,
          this.vacacioncanc,
          this.falta,
          this.suspension,
          this.abandono,
          this.septimo,
          this.ajustePositivo
        );
        if (this.feriado > 0) {
          this.cantOI = this.cantOI + 2;
        }
        if (this.incapacidadpub > 0 || this.incapacidadpubparcial > 0) {
          this.cantOI = this.cantOI + 2;
        }
        if (this.septimo > 0) {
          this.cantOI = this.cantOI + 1;
        }
        if (this.vacacion > 0) {
          this.cantOI = this.cantOI + 2;
        }
        if (this.ajustePositivo > 0) {
          this.cantOI = this.cantOI + 1;
        }
        this.listNomina[i].ingresos = this.sueldo;
        this.listNomina[i].deducciones = 0;
        this.listNomina[i].totalPagar =
          this.sueldo - this.listNomina[i].deducciones;
        this.totalAPagar = this.totalAPagar + this.listNomina[i].totalPagar;
        this.listNominaFinal[i].recargo = this.recargo;
        this.listNominaFinal[i].horasNormales = this.totalTrabNormales;
        this.listNominaFinal[i].lpsNormales = this.valorNormal;
        this.listNominaFinal[i].horasDiurnas = this.totalExtrasDiurnas;
        this.listNominaFinal[i].lpsDiurnas = this.valorHED;
        this.listNominaFinal[i].horasMixtas = this.totalExtrasMixtas;
        this.listNominaFinal[i].lpsMixtas = this.valorHEM;
        this.listNominaFinal[i].horasNocturnas = this.totalExtrasNocturnas;
        this.listNominaFinal[i].lpsNocturnas = this.valorHEN;
        this.listNominaFinal[i].feriado = this.valorFeriado;
        this.listNominaFinal[i].incapacidad = this.valorIncapacidadPub;
        this.listNominaFinal[i].vacacion = this.valorVacacion;
        this.listNominaFinal[i].ajusteP = this.ajustePositivo;
        this.listNominaFinal[i].septimo = this.valorSeptimo;
        this.listNominaFinal[i].ingresos = this.sueldo;
        this.listNominaFinal[i].diasferiado = this.feriado;
        this.listNominaFinal[i].diasincapacidad =
          this.incapacidadpub +
          this.incapacidadpubparcial +
          this.incapacidadpriv +
          this.incapacidadcanc;
        this.listNominaFinal[i].diasvacacion =
          this.vacacioncanc + this.vacacion;
        this.listNominaFinal[i].diasautorizados = this.conpermiso;
        this.listNominaFinal[i].diasnoautorizados = this.falta;
        this.listNominaFinal[i].diassuspension = this.suspension;
        this.listNominaFinal[i].cantOI = this.cantOI;
        this.listNominaFinal[i].totalObs =
          this.listNominaFinal[i].cantOI + this.listNominaFinal[i].cantOD;
        if (this.switchValuePP === true) {
          permanente = false;
          this.setOfCheckedId.delete(this.idEmpleado);
          this.idEmpleado = 0;
          this.refreshCheckedStatus();
        } else if (this.switchValuePP === false && this.current === 1) {
          permanente = true;
          this.onItemChecked(this.idEmpleado, true);
        }
        this.permanente(idTemporal, permanente);
        this.idEmpleado = idTemporal;
        console.log(
          this.listNominaFinal[i].totalObs,
          this.idEmpleado,
          this.switchValuePP,
          this.setOfCheckedId
        );
      }
    }
    document.getElementById('btnnext').removeAttribute('disabled');
  }
  permanente(id: number, value: boolean) {
    this.EmpleadosService.cargarEmpleados(id).subscribe((data) => {
      const empleado: Empleado = {
        id: data.id,
        fechaIngreso: data.fechaIngreso,
        nombres: data.nombres,
        apellidos: data.apellidos,
        genero: data.genero,
        permanente: value,
        email: data.email,
        fechaNac: data.fechaNac,
        fechaCreacion: data.fechaCreacion,
        direccion: data.direccion,
        n_Cedula: data.n_Cedula,
        salarioBase: data.salarioBase,
        departamentoID: data.departamentoID,
        planillaID: data.planillaID,
      };
      console.log(empleado);
      this.EmpleadosService.actualizarEmpleado(id, empleado).subscribe(
        (data) => {}
      );
    });
  }
  numberWithCommas(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  truncator(valor: number) {
    var number = Math.trunc(valor * 100) / 100;
    return number;
  }
  autofillDiurna() {
    this.notrabajaba = 0;
    if (
      this.descriForm.get('lunesSelect').value === '' &&
      this.descriForm.get('martesSelect').value === '' &&
      this.descriForm.get('miercolesSelect').value === '' &&
      this.descriForm.get('juevesSelect').value === '' &&
      this.descriForm.get('viernesSelect').value === '' &&
      this.descriForm.get('sabadoSelect').value === '' &&
      this.descriForm.get('domingoSelect').value === ''
    ) {
      this.horasForm.get('luIControl').setValue('06:00');
      this.horasForm.get('luOControl').setValue('18:00');
      this.horasForm.get('maIControl').setValue('06:00');
      this.horasForm.get('maOControl').setValue('18:00');
      this.horasForm.get('miIControl').setValue('06:00');
      this.horasForm.get('miOControl').setValue('18:00');
      this.horasForm.get('juIControl').setValue('06:00');
      this.horasForm.get('juOControl').setValue('18:00');
      this.horasForm.get('viIControl').setValue('06:00');
      this.horasForm.get('viOControl').setValue('18:00');
      this.horasForm.get('saIControl').setValue('06:00');
      this.horasForm.get('saOControl').setValue('18:00');
      this.descriForm.get('domingoSelect').setValue('septimo');
    } else {
      this.infoDiurna();
    }
  }
  autofillNocturna() {
    this.notrabajaba = 0;
    if (
      this.descriForm.get('lunesSelect').value === '' &&
      this.descriForm.get('martesSelect').value === '' &&
      this.descriForm.get('miercolesSelect').value === '' &&
      this.descriForm.get('juevesSelect').value === '' &&
      this.descriForm.get('viernesSelect').value === '' &&
      this.descriForm.get('sabadoSelect').value === '' &&
      this.descriForm.get('domingoSelect').value === ''
    ) {
      this.horasForm.get('luIControl').setValue('18:00');
      this.horasForm.get('luOControl').setValue('06:00');
      this.horasForm.get('maIControl').setValue('18:00');
      this.horasForm.get('maOControl').setValue('06:00');
      this.horasForm.get('miIControl').setValue('18:00');
      this.horasForm.get('miOControl').setValue('06:00');
      this.horasForm.get('juIControl').setValue('18:00');
      this.horasForm.get('juOControl').setValue('06:00');
      this.horasForm.get('viIControl').setValue('18:00');
      this.horasForm.get('viOControl').setValue('06:00');
      this.horasForm.get('saIControl').setValue('18:00');
      this.horasForm.get('saOControl').setValue('06:00');
      this.descriForm.get('domingoSelect').setValue('septimo');
    } else {
      this.infoNocturna();
    }
  }
  autofillMixta() {
    this.notrabajaba = 0;
    if (
      this.descriForm.get('lunesSelect').value === '' &&
      this.descriForm.get('martesSelect').value === '' &&
      this.descriForm.get('miercolesSelect').value === '' &&
      this.descriForm.get('juevesSelect').value === '' &&
      this.descriForm.get('viernesSelect').value === '' &&
      this.descriForm.get('sabadoSelect').value === '' &&
      this.descriForm.get('domingoSelect').value === ''
    ) {
      this.horasForm.get('luIControl').setValue('12:00');
      this.horasForm.get('luOControl').setValue('20:00');
      this.horasForm.get('maIControl').setValue('12:00');
      this.horasForm.get('maOControl').setValue('20:00');
      this.horasForm.get('miIControl').setValue('12:00');
      this.horasForm.get('miOControl').setValue('20:00');
      this.horasForm.get('juIControl').setValue('12:00');
      this.horasForm.get('juOControl').setValue('20:00');
      this.horasForm.get('viIControl').setValue('12:00');
      this.horasForm.get('viOControl').setValue('20:00');
      this.horasForm.get('saIControl').setValue('12:00');
      this.horasForm.get('saOControl').setValue('20:00');
      this.descriForm.get('domingoSelect').setValue('septimo');
    } else {
      this.infoMixta();
    }
  }

  infoDiurna(): void {
    this.modal.confirm({
      nzCentered: true,
      nzTitle: 'CONFIRMACIÓN',
      nzContent:
        '<b style="color: red;">¿Desea llenar el control de asistencia como una Jornada Diurna?. Perderá los datos ingresados.</b>',
      nzOkText: 'Si',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => {
        this.limpiarMain(), this.autofillDiurna();
      },
      nzCancelText: 'No',
      nzOnCancel: () => this.handleMainCancel(),
    });
  }
  infoNocturna(): void {
    this.modal.confirm({
      nzCentered: true,
      nzTitle: 'CONFIRMACIÓN',
      nzContent:
        '<b style="color: red;">¿Desea llenar el control de asistencia como una Jornada Nocturna?. Perderá los datos ingresados.</b>',
      nzOkText: 'Si',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => {
        this.limpiarMain(), this.autofillNocturna();
      },
      nzCancelText: 'No',
      nzOnCancel: () => this.handleMainCancel(),
    });
  }
  infoMixta(): void {
    this.modal.confirm({
      nzCentered: true,
      nzTitle: 'CONFIRMACIÓN',
      nzContent:
        '<b style="color: red;">¿Desea llenar el control de asistencia como una Jornada Mixta?. Perderá los datos ingresados.</b>',
      nzOkText: 'Si',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => {
        this.limpiarMain(), this.autofillMixta();
      },
      nzCancelText: 'No',
      nzOnCancel: () => this.handleMainCancel(),
    });
  }

  horas(
    entrada: moment.Moment,
    salida: moment.Moment,
    horas: number,
    dia: string
  ) {
    var a: number = 0,
      exd: number = 0,
      exn: number = 0,
      exm: number = 0,
      jornada: number = 0;
    //jornada diurna con extras diurnas
    if (
      entrada >= this.diurnaI &&
      entrada < this.diurnaO &&
      salida <= this.diurnaO &&
      salida > this.diurnaI &&
      salida > entrada
    ) {
      if (dia === 'Sabado' && horas >= 4) {
        this.totalExtrasDiurnas = this.totalExtrasDiurnas + this.extrasSabados;
        console.log(
          'jornada diurna ' + 'extras diurnas ' + this.extrasSabados,
          horas
        );
        this.jornada = 'Diurna';
        this.extrasDiurna = this.extrasSabados;
        this.totalTrabNormales = this.totalTrabNormales + this.hrsJornadaDiurna;
        this.sabadoHorasNormales = 4;
        this.diaDiurno = this.diaDiurno + 1;
        this.totalTrabRealesCompletas =
          this.totalTrabRealesCompletas + this.hoursSabado;
      } else if (dia === 'Sabado' && horas < 4) {
        this.requiredCompletarDiurna = this.requiredCompletarDiurna + 4 - horas;
        this.totalTrabReales = this.totalTrabReales + horas;
        console.log('jornada diurna no completo ' + horas);
        this.jornada = 'Diurna';
        this.ajusteDias = this.ajusteDias + 1;
        this.diaDiurno = this.diaDiurno + 1;
        this.totalTrabRealesCompletas =
          this.totalTrabRealesCompletas + this.hoursSabado;
      } else if (horas >= this.hrsJornadaDiurna) {
        exd = horas - this.hrsJornadaDiurna;
        this.totalExtrasDiurnas = this.totalExtrasDiurnas + exd;
        console.log('jornada diurna ' + 'extras diurnas ' + exd);
        this.jornada = 'Diurna';
        this.extrasDiurna = exd;
        this.totalTrabNormales = this.totalTrabNormales + this.hrsJornadaDiurna;
        this.diaDiurno = this.diaDiurno + 1;
        this.totalTrabRealesCompletas = this.totalTrabRealesCompletas + horas;
      } else if (horas < this.hrsJornadaDiurna) {
        this.requiredCompletarDiurna =
          this.requiredCompletarDiurna + this.hrsJornadaDiurna - horas;
        this.totalTrabReales = this.totalTrabReales + horas;
        console.log('jornada diurna no completo ' + horas);
        this.jornada = 'Diurna';
        this.ajusteDias = this.ajusteDias + 1;
        this.diaDiurno = this.diaDiurno + 1;
        this.totalTrabRealesCompletas = this.totalTrabRealesCompletas + horas;
      }
      //jornada nocturna extras nocturas
    } else if (
      entrada >= this.nocturnaIa &&
      entrada < this.reset &&
      (salida > this.nocturnaIa || salida <= this.mixtaIa)
    ) {
      if (horas >= this.hrsJornadaNocturna) {
        exn = horas - this.hrsJornadaNocturna;
        this.totalExtrasNocturnas = this.totalExtrasNocturnas + exn;
        console.log('jornada nocturna ' + 'extras nocturnas ' + exn);
        this.jornada = 'Nocturna';
        this.extrasNocturna = exn;
        this.totalTrabNormales = this.totalTrabNormales + this.hrsJornadaDiurna;
        this.diaNocturno = this.diaNocturno + 1;
        this.totalTrabRealesCompletas = this.totalTrabRealesCompletas + horas;
      } else if (horas < this.hrsJornadaNocturna) {
        this.requiredCompletarNocturna =
          this.requiredCompletarNocturna + this.hrsJornadaNocturna - horas;
        this.totalTrabReales = this.totalTrabReales + horas;
        console.log('jornada nocturna no completo ' + horas);
        this.jornada = 'Nocturna';
        this.ajusteDias = this.ajusteDias + 1;
        this.diaNocturno = this.diaNocturno + 1;
        this.totalTrabRealesCompletas = this.totalTrabRealesCompletas + horas;
      }
      //jornada diurna con extras mixtas y nocturnas
    } else if (
      entrada >= this.diurnaI &&
      entrada < this.mixtaIa &&
      (salida > this.nocturnaI || salida <= this.reset)
    ) {
      a = moment.duration(this.diurnaO.diff(entrada)).asHours();
      //dia sabado
      if (dia === 'Sabado') {
        if (a >= 4) {
          if (salida > this.nocturnaI && salida <= this.mixtaOc) {
            exd = a - 4;
            exm = moment.duration(salida.diff(this.diurnaO)).asHours();
            this.totalExtrasDiurnas = this.totalExtrasDiurnas + exd;
            this.totalExtrasMixtas = this.totalExtrasMixtas + exm;
            console.log(
              'jornada diurna ' +
                horas +
                ' extras diurnas ' +
                exd +
                ' extras mixtas ' +
                exm
            );
            this.jornada = 'Diurna';
            this.extrasDiurna = exd;
            this.extrasMixta = exm;
            this.totalTrabNormales =
              this.totalTrabNormales + this.hrsJornadaDiurna;
            this.sabadoHorasNormales = 4;
            this.diaDiurno = this.diaDiurno + 1;
            this.totalTrabRealesCompletas =
              this.totalTrabRealesCompletas + this.hoursSabado;
          } else if (salida > this.mixtaOc && salida <= this.reset) {
            exd = a - 4;
            exn = moment.duration(salida.diff(this.nocturnaI)).asHours();
            this.totalExtrasDiurnas = this.totalExtrasDiurnas + exd;
            this.totalExtrasNocturnas = this.totalExtrasNocturnas + exn;
            console.log(
              'jornada diurna ' +
                horas +
                ' extras diurnas ' +
                exd +
                ' extras nocturnas ' +
                exn
            );
            this.jornada = 'Diurna';
            this.extrasDiurna = exd;
            this.extrasNocturna = exn;
            this.totalTrabNormales =
              this.totalTrabNormales + this.hrsJornadaDiurna;
            this.sabadoHorasNormales = 4;
            this.diaDiurno = this.diaDiurno + 1;
            this.totalTrabRealesCompletas =
              this.totalTrabRealesCompletas + horas;
          }
        }
        //dia normal
      } else if (dia !== 'Sabado') {
        if (a >= this.hrsJornadaDiurna) {
          if (salida > this.nocturnaI && salida <= this.mixtaOc) {
            exd = a - this.hrsJornadaDiurna;
            exm = moment.duration(salida.diff(this.diurnaO)).asHours();
            this.totalExtrasDiurnas = this.totalExtrasDiurnas + exd;
            this.totalExtrasMixtas = this.totalExtrasMixtas + exm;
            console.log(
              'jornada diurna ' +
                horas +
                ' extras diurnas ' +
                exd +
                ' extras mixtas ' +
                exm
            );
            this.jornada = 'Diurna';
            this.extrasDiurna = exd;
            this.extrasMixta = exm;
            this.totalTrabNormales =
              this.totalTrabNormales + this.hrsJornadaDiurna;
            this.diaDiurno = this.diaDiurno + 1;
            this.totalTrabRealesCompletas =
              this.totalTrabRealesCompletas + horas;
          } else if (salida > this.mixtaOc && salida <= this.reset) {
            exd = a - this.hrsJornadaDiurna;
            exn = moment.duration(salida.diff(this.nocturnaI)).asHours();
            this.totalExtrasDiurnas = this.totalExtrasDiurnas + exd;
            this.totalExtrasNocturnas = this.totalExtrasNocturnas + exn;
            console.log(
              'jornada diurna ' +
                horas +
                ' extras diurnas ' +
                exd +
                ' extras nocturnas ' +
                exn
            );
            this.jornada = 'Diurna';
            this.extrasDiurna = exd;
            this.extrasNocturna = exn;
            this.totalTrabNormales =
              this.totalTrabNormales + this.hrsJornadaDiurna;
            this.diaDiurno = this.diaDiurno + 1;
            this.totalTrabRealesCompletas =
              this.totalTrabRealesCompletas + horas;
          }
        } else if (a < this.hrsJornadaDiurna) {
          if (salida > this.nocturnaI && salida <= this.mixtaOc) {
            exm = horas - this.hrsJornadaDiurna;
            if (exm < 0) {
              this.requiredCompletarDiurna =
                this.requiredCompletarDiurna + this.hrsJornadaDiurna - horas;
              this.totalTrabReales = this.totalTrabReales + horas;
              console.log('jornada diurna no completo ' + horas);
              this.jornada = 'Diurna';
              this.ajusteDias = this.ajusteDias + 1;
              this.diaDiurno = this.diaDiurno + 1;
              this.totalTrabRealesCompletas =
                this.totalTrabRealesCompletas + horas;
            } else {
              this.totalExtrasMixtas = this.totalExtrasMixtas + exm;
              console.log('jornada diurna ' + horas + ' extras mixtas ' + exm);
              this.jornada = 'Diurna';
              this.extrasMixta = exm;
              this.totalTrabNormales =
                this.totalTrabNormales + this.hrsJornadaDiurna;
              this.diaDiurno = this.diaDiurno + 1;
              this.totalTrabRealesCompletas =
                this.totalTrabRealesCompletas + horas;
            }
          } else if (salida > this.mixtaOc && salida <= this.reset) {
            exn = horas - this.hrsJornadaNocturna;
            this.totalExtrasNocturnas = this.totalExtrasNocturnas + exn;
            console.log(
              'jornada nocturna ' + horas + ' extras nocturnas ' + exn
            );
            this.jornada = 'Nocturna';
            this.extrasNocturna = exn;
            this.totalTrabNormales =
              this.totalTrabNormales + this.hrsJornadaDiurna;
            this.diaNocturno = this.diaNocturno + 1;
            this.totalTrabRealesCompletas =
              this.totalTrabRealesCompletas + horas;
          }
        }
      }
      //jornada mixta extras mixtas y nocturnas
    } else if (
      entrada >= this.mixtaIa &&
      entrada <= this.mixtaIc &&
      (salida <= this.diurnaI || salida >= this.diurnaO)
    ) {
      if (salida > this.mixtaOc || salida <= this.diurnaI) {
        jornada = moment.duration(this.mixtaOc.diff(entrada)).asHours();
        exm = jornada - this.hrsJornadaMixta;
        exn = moment.duration(salida.diff(this.mixtaOc)).asHours();
        if (exn < 0) {
          exn = exn + 24;
          this.totalExtrasMixtas = this.totalExtrasMixtas + exm;
          this.totalExtrasNocturnas = this.totalExtrasNocturnas + exn;
          console.log(
            'jornada mixta ' + 'extras mixtas ' + exm + ' extra nocturna ' + exn
          );
          this.jornada = 'Mixta';
          this.extrasMixta = exm;
          this.extrasNocturna = exn;
          this.totalTrabNormales =
            this.totalTrabNormales + this.hrsJornadaDiurna;
          this.diaMixto = this.diaMixto + 1;
          this.totalTrabRealesCompletas = this.totalTrabRealesCompletas + horas;
        } else {
          this.totalExtrasMixtas = this.totalExtrasMixtas + exm;
          this.totalExtrasNocturnas = this.totalExtrasNocturnas + exn;
          console.log(
            'jornada mixta ' + 'extras mixtas ' + exm + ' extra nocturna ' + exn
          );
          this.jornada = 'Mixta';
          this.extrasMixta = exm;
          this.extrasNocturna = exn;
          this.totalTrabNormales =
            this.totalTrabNormales + this.hrsJornadaDiurna;
          this.diaMixto = this.diaMixto + 1;
          this.totalTrabRealesCompletas = this.totalTrabRealesCompletas + horas;
        }
      } else if (salida > this.diurnaO && salida <= this.mixtaOc) {
        if (horas >= this.hrsJornadaMixta) {
          exm = horas - this.hrsJornadaMixta;
          this.totalExtrasMixtas = this.totalExtrasMixtas + exm;
          this.totalExtrasNocturnas = this.totalExtrasNocturnas + exn;
          console.log('jornada mixta ' + 'extras mixtas ' + exm);
          this.jornada = 'Mixta';
          this.extrasMixta = exm;
          this.totalTrabNormales =
            this.totalTrabNormales + this.hrsJornadaDiurna;
          this.diaMixto = this.diaMixto + 1;
          this.totalTrabRealesCompletas = this.totalTrabRealesCompletas + horas;
        } else {
          this.requiredCompletarMixta =
            this.requiredCompletarMixta + this.hrsJornadaMixta - horas;
          this.totalTrabReales = this.totalTrabReales + horas;
          console.log('jornada mixta no completo ' + horas);
          this.jornada = 'Mixta';
          this.ajusteDias = this.ajusteDias + 1;
          this.diaMixto = this.diaMixto + 1;
          this.totalTrabRealesCompletas = this.totalTrabRealesCompletas + horas;
        }
      }
    } else {
      if (this.isVisibleInvalidas === false) {
        this.invalidas();
        if (dia === 'Lunes') {
          this.descriForm.get('lunesSelect').setValue('');
        } else if (dia === 'Martes') {
          this.descriForm.get('martesSelect').setValue('');
        } else if (dia === 'Miercoles') {
          this.descriForm.get('miercolesSelect').setValue('');
        } else if (dia === 'Jueves') {
          this.descriForm.get('juevesSelect').setValue('');
        } else if (dia === 'Viernes') {
          this.descriForm.get('viernesSelect').setValue('');
        } else if (dia === 'Sabado') {
          this.descriForm.get('sabadoSelect').setValue('');
        } else if (dia === 'Domingo') {
          this.descriForm.get('domingoSelect').setValue('');
        }
      }
    }
  }
  ConvertStringToNumber(input: string) {
    if (!input) return NaN;
    if (input.trim().length === 0) {
      return NaN;
    }
    return Number(input);
  }
  startEdit(id: number): void {
    this.editId = id;
    this.tempForm.get('salario').setValue('');
  }
  stopEdit(): void {
    this.Id = this.editId;
    this.editId = null;
  }
  cancel(): void {
    this.NzMessageService.error('No se modifico el salario.');
  }
  confirm(): void {
    var x = this.tempForm.get('salario').value;
    var y = this.ConvertStringToNumber(x);
    const factor = 10 ** 2;
    var z = Math.round(y * factor) / factor;
    if (isNaN(z)) {
      this.cancel();
    } else {
      this.EmpleadosService.cargarEmpleados(this.Id).subscribe((data) => {
        const empleado: Empleado = {
          id: data.id,
          fechaIngreso: data.fechaIngreso,
          nombres: data.nombres,
          apellidos: data.apellidos,
          genero: data.genero,
          permanente: data.permanente,
          email: data.email,
          fechaNac: data.fechaNac,
          fechaCreacion: this.today,
          direccion: data.direccion,
          n_Cedula: data.n_Cedula,
          salarioBase: z,
          departamentoID: data.departamentoID,
          planillaID: data.planillaID,
        };
        console.log(empleado);
        this.EmpleadosService.actualizarEmpleado(this.Id, empleado).subscribe(
          (data) => {
            this.cargarEmpleadoByPlanillaIdEditSalario(this.idTP, this.Id);
            this.NzMessageService.success('¡Salario actualizado exitosamente!');
            this.handleEmpleadoClear(this.Id);
          }
        );
      });
      this.Search('');
      this.tempForm.get('busqueda').setValue('');
    }
  }
  cargarEmpleadoByPlanillaIdEditSalario(id: number, idEmp: number) {
    console.log(id, idEmp);
    this.EmpleadosService.cargarEmpleadosByPlanillaId(id).subscribe((data) => {
      for (let i = 0; i < this.listNomina.length; i++) {
        if (this.listNomina[i].id === idEmp) {
          this.listNomina[i].salarioBase = data[i].salarioBase;
          this.listNominaFinal[i].salarioBase = data[i].salarioBase;
        }
      }
    });
  }
  resetObservacion() {
    this.conpermiso = 0;
    this.feriado = 0;
    this.incapacidadpub = 0;
    this.incapacidadpriv = 0;
    this.incapacidadpendiente = 0;
    this.incapacidadpubparcial = 0;
    this.incapacidadcanc = 0;
    this.suspension = 0;
    this.septimo = 0;
    this.vacacion = 0;
    this.vacacioncanc = 0;
    this.falta = 0;
    this.abandono = 0;
    this.valorFeriado = 0;
    this.valorIncapacidadPub = 0;
    this.valorIncapacidadPriv = 0;
    this.valorSeptimo = 0;
    this.valorVacacion = 0;
    this.valorFalta = 0;
    this.valorSuspension = 0;
    this.sueldo = 0;
    this.sueldoNormal = 0;
    this.totalTrabNormales = 0;
    this.totalExtrasDiurnas = 0;
    this.totalExtrasMixtas = 0;
    this.totalExtrasNocturnas = 0;
    this.totalTrabReales = 0;
    this.totalTrabRealesCompletas = 0;
    this.extrasSabados = 0;
    this.requiredCompletarDiurna = 0;
    this.requiredCompletarMixta = 0;
    this.requiredCompletarNocturna = 0;
    this.requiredCompletarIncapacidadPrivada = 0;
    this.requiredCompletarAutorizado = 0;
    this.requiredCompletarAutorizadoReal = 0;
    this.incapacidadReal = 0;
    this.cambioRevisarJornada = '';
    this.diaDiurno = 0;
    this.diaMixto = 0;
    this.diaNocturno = 0;
    this.listIncapacidadPrivada = [];
    this.ajusteDias = 0;
    this.ajustePositivo = 0;
    this.cantOD = 0;
    this.cantOI = 0;
  }
  showModalMain(): void {
    this.modal.confirm({
      nzCentered: true,
      nzTitle: 'CONFIRMACIÓN',
      nzContent:
        '<b style="color: red;">¿Esta seguro de haber ingresado las horas correctas?</b>',
      nzOkText: 'Si',
      nzOkType: 'primary',
      nzClosable: false,
      nzOkDanger: true,
      nzOnOk: () => this.calcularMain(),
      nzCancelText: 'No',
      nzOnCancel: () => this.handleMainCancel(),
    });
  }
  horasLuI(value: Time): void {
    this.luI = value;
  }
  horasLuO(value: Time): void {
    this.luO = value;
  }
  horasMaI(value: Time): void {
    this.maI = value;
  }
  horasMaO(value: Time): void {
    this.maO = value;
  }
  horasMiI(value: Time): void {
    this.miI = value;
  }
  horasMiO(value: Time): void {
    this.miO = value;
  }
  horasJuI(value: Time): void {
    this.juI = value;
  }
  horasJuO(value: Time): void {
    this.juO = value;
  }
  horasViI(value: Time): void {
    this.viI = value;
  }
  horasViO(value: Time): void {
    this.viO = value;
  }
  horasSaI(value: Time): void {
    this.saI = value;
  }
  horasSaO(value: Time): void {
    this.saO = value;
  }
  horasDoI(value: Time): void {
    this.doI = value;
  }
  horasDoO(value: Time): void {
    this.doO = value;
  }
  onChangeLunes() {
    if (this.descriForm.get('lunesSelect').value !== '') {
      this.horasForm.get('luIControl').disable();
      this.horasForm.get('luOControl').disable();
      this.horasForm.get('luIControl').setValue('');
      this.horasForm.get('luOControl').setValue('');
      if (this.descriForm.get('lunesSelect').value === 'abandono') {
        this.descriForm.get('martesSelect').setValue('abandono');
        this.descriForm.get('miercolesSelect').setValue('abandono');
        this.descriForm.get('juevesSelect').setValue('abandono');
        this.descriForm.get('viernesSelect').setValue('abandono');
        this.descriForm.get('sabadoSelect').setValue('abandono');
        this.descriForm.get('domingoSelect').setValue('abandono');
      }
      if (this.descriForm.get('lunesSelect').value === 'notrabajaba') {
        this.switchValuePP = true;
        this.notrabajaba++;
      }
    } else {
      this.horasForm.get('luIControl').setValue('');
      this.horasForm.get('luOControl').setValue('');
      this.horasForm.get('luIControl').enable();
      this.horasForm.get('luOControl').enable();
      this.switchValuePP = false;
    }
    console.log(this.notrabajaba);
  }
  onChangeMartes() {
    if (this.descriForm.get('martesSelect').value !== '') {
      this.horasForm.get('maIControl').disable();
      this.horasForm.get('maOControl').disable();
      this.horasForm.get('maIControl').setValue('');
      this.horasForm.get('maOControl').setValue('');
      if (this.descriForm.get('martesSelect').value === 'abandono') {
        this.descriForm.get('miercolesSelect').setValue('abandono');
        this.descriForm.get('juevesSelect').setValue('abandono');
        this.descriForm.get('viernesSelect').setValue('abandono');
        this.descriForm.get('sabadoSelect').setValue('abandono');
        this.descriForm.get('domingoSelect').setValue('abandono');
      }
      if (this.descriForm.get('martesSelect').value === 'notrabajaba') {
        this.switchValuePP = true;
        this.notrabajaba++;
      }
    } else {
      this.horasForm.get('maIControl').setValue('');
      this.horasForm.get('maOControl').setValue('');
      this.horasForm.get('maIControl').enable();
      this.horasForm.get('maOControl').enable();
      this.switchValuePP = false;
    }
    console.log(this.notrabajaba);
  }
  onChangeMiercoles() {
    if (this.descriForm.get('miercolesSelect').value !== '') {
      this.horasForm.get('miIControl').disable();
      this.horasForm.get('miOControl').disable();
      this.horasForm.get('miIControl').setValue('');
      this.horasForm.get('miOControl').setValue('');
      if (this.descriForm.get('miercolesSelect').value === 'abandono') {
        this.descriForm.get('juevesSelect').setValue('abandono');
        this.descriForm.get('viernesSelect').setValue('abandono');
        this.descriForm.get('sabadoSelect').setValue('abandono');
        this.descriForm.get('domingoSelect').setValue('abandono');
      }
      if (this.descriForm.get('miercolesSelect').value === 'notrabajaba') {
        this.switchValuePP = true;
        this.notrabajaba++;
      }
    } else {
      this.horasForm.get('miIControl').setValue('');
      this.horasForm.get('miOControl').setValue('');
      this.horasForm.get('miIControl').enable();
      this.horasForm.get('miOControl').enable();
      this.switchValuePP = false;
    }
    console.log(this.notrabajaba);
  }
  onChangeJueves() {
    if (this.descriForm.get('juevesSelect').value !== '') {
      this.horasForm.get('juIControl').disable();
      this.horasForm.get('juOControl').disable();
      this.horasForm.get('juIControl').setValue('');
      this.horasForm.get('juOControl').setValue('');
      if (this.descriForm.get('juevesSelect').value === 'abandono') {
        this.descriForm.get('viernesSelect').setValue('abandono');
        this.descriForm.get('sabadoSelect').setValue('abandono');
        this.descriForm.get('domingoSelect').setValue('abandono');
      }
      if (this.descriForm.get('juevesSelect').value === 'notrabajaba') {
        this.switchValuePP = true;
        this.notrabajaba++;
      }
    } else {
      this.horasForm.get('juIControl').setValue('');
      this.horasForm.get('juOControl').setValue('');
      this.horasForm.get('juIControl').enable();
      this.horasForm.get('juOControl').enable();
      this.switchValuePP = false;
    }
    console.log(this.notrabajaba);
  }
  onChangeViernes() {
    if (this.descriForm.get('viernesSelect').value !== '') {
      this.horasForm.get('viIControl').disable();
      this.horasForm.get('viOControl').disable();
      this.horasForm.get('viIControl').setValue('');
      this.horasForm.get('viOControl').setValue('');
      if (this.descriForm.get('viernesSelect').value === 'abandono') {
        this.descriForm.get('sabadoSelect').setValue('abandono');
        this.descriForm.get('domingoSelect').setValue('abandono');
      }
      if (this.descriForm.get('viernesSelect').value === 'notrabajaba') {
        this.switchValuePP = true;
        this.notrabajaba++;
      }
    } else {
      this.horasForm.get('viIControl').setValue('');
      this.horasForm.get('viOControl').setValue('');
      this.horasForm.get('viIControl').enable();
      this.horasForm.get('viOControl').enable();
      this.switchValuePP = false;
    }
    console.log(this.notrabajaba);
  }
  onChangeSabado() {
    if (this.descriForm.get('sabadoSelect').value !== '') {
      this.horasForm.get('saIControl').disable();
      this.horasForm.get('saOControl').disable();
      this.horasForm.get('saIControl').setValue('');
      this.horasForm.get('saOControl').setValue('');
      if (this.descriForm.get('sabadoSelect').value === 'abandono') {
        this.descriForm.get('domingoSelect').setValue('abandono');
      }
      if (this.descriForm.get('sabadoSelect').value === 'notrabajaba') {
        this.switchValuePP = true;
        this.notrabajaba++;
      }
    } else {
      this.horasForm.get('saIControl').setValue('');
      this.horasForm.get('saOControl').setValue('');
      this.horasForm.get('saIControl').enable();
      this.horasForm.get('saOControl').enable();
      this.switchValuePP = false;
    }
    console.log(this.notrabajaba);
  }
  onChangeDomingo() {
    if (this.descriForm.get('domingoSelect').value !== '') {
      this.horasForm.get('doIControl').disable();
      this.horasForm.get('doOControl').disable();
      this.horasForm.get('doIControl').setValue('');
      this.horasForm.get('doOControl').setValue('');
      if (this.descriForm.get('domingoSelect').value === 'notrabajaba') {
        this.switchValuePP = true;
        this.notrabajaba++;
      }
    } else {
      this.horasForm.get('doIControl').setValue('');
      this.horasForm.get('doOControl').setValue('');
      this.horasForm.get('doIControl').enable();
      this.horasForm.get('doOControl').enable();
      this.switchValuePP = false;
    }
    console.log(this.notrabajaba);
  }
  updateCheckedSet(id: number, checked: boolean): void {
    console.log(id);
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }
  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    console.log(this.setOfCheckedId, this.listComprobantes);
    this.refreshCheckedStatus();
  }
  onAllCheckedComprobantes(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) =>
      this.updateCheckedSet(item.id, value)
    );
    this.refreshCheckedStatus();
  }
  onCurrentPageDataChange($event: readonly null[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }
  sort(myset) {
    // Create a new array to store set elements
    let myarr = [];
    for (let element of myset) {
      // Set elements pushed into the array
      myarr.push(element);
    }
    // Print the values stored in Array
    console.log(myarr);
    // Sort the array (default it will sort
    // elements in ascending order)
    myarr.sort();
    // Clear the entire set using clear() method
    myset.clear();
    this.setOfCheckedId.clear();
    for (let element of myarr) {
      // Array elements pushed into the set
      this.setOfCheckedId.add(element);
    }
    console.log(this.setOfCheckedId);
  }
  refreshCheckedStatus(): void {
    this.seleccionado = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item.id)
    );
    this.indeterminados =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item.id)
      ) && !this.seleccionado;
    console.log(this.seleccionado, this.listComprobantes);
    this.sort(this.setOfCheckedId);
  }
}
