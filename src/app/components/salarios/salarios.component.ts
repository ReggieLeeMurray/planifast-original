import { Component, OnInit } from '@angular/core';
import { ResultadosService } from 'src/app/services/resultados.service';
import { HistorialService } from 'src/app/services/historial.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import moment from 'moment';

@Component({
  selector: 'app-salarios',
  templateUrl: './salarios.component.html',
  styleUrls: ['./salarios.component.css'],
})
export class SalariosComponent implements OnInit {
  listIds = [];
  listEmpleados = [];
  listCompleta = [];
  listCompletaMensualPorId = [];
  listTemporal = [];
  listSearch = null;
  final = [];
  porcentaje: number = 0;
  listOfYears = [];
  totalMensual = 0;
  listOfMonths = [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Ocubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 },
  ];
  notFound = './assets/empty.svg';
  selectedYear = moment().year() - 1;
  selectedMonth: number = 1;
  empleados: string;
  expandSet = new Set<number>();
  DEBUG = true;

  constructor(private ResultadosService: ResultadosService, private HistorialService: HistorialService, private EmpleadosService: EmpleadosService) {}

  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarEmpleado();
  }
  onChangeYear(result: any) {
    if (result === null) {
      this.selectedYear = moment().year() - 1;
    }
    this.expandSet.delete(this.listIds[0]);
    this.cargarEmpleado();
    console.log('onChangeYear: ', result, this.selectedYear);
  }
  onChangeMonth(result: any) {
    if (result === null) {
      this.selectedMonth = 1;
      result = 1;
    }
    this.totalMensual = 0;
    this.filtrarPorFecha(result);
    console.log('onChangeMonth: ', result, this.selectedMonth);
  }
  Search(value: string) {
    if (this.listSearch == null) {
      this.listSearch = this.listCompleta;
    }
    if (value != '' && value != undefined && value != null) {
      this.listCompleta = this.listSearch.filter((res) => {
        return (
          res.nombreCompleto.toLocaleLowerCase().match(value.toLocaleLowerCase()) ||
          res.permanente.toLocaleLowerCase().match(value.toLocaleLowerCase())
        );
      });
      return this.listCompleta;
    } else {
      this.listCompleta = this.listSearch;
      this.listSearch = null;
      return this.listCompleta;
    }
  }
  cargarFechas() {
    return new Promise((resolve) => {
      var i: number = 0;
      var datasetAños: Array<number> = [];
      var listOfOptions = [];
      this.porcentaje = 60;
      this.HistorialService.getListHistory().subscribe((history) => {
        for (let x = 0; x < history.length; x++) {
          for (let i = 0; i < this.listEmpleados.length; i++) {
            if (this.listEmpleados[i].historialID === history[x].id) {
              this.listEmpleados[i].fechaInicio = moment(history[x].fechaInicio);
              this.listEmpleados[i].fechaFinal = moment(history[x].fechaFinal);
              this.listEmpleados[i].fechaCreacion = moment(history[x].fechaCreacion);
            }
          }
        }
        for (let x = 0; x < this.listEmpleados.length; x++) {
          datasetAños[i] = moment(this.listEmpleados[x].fechaCreacion).year();
          i++;
        }
        const uniqueIds = new Set(datasetAños);
        datasetAños.length = 0;
        datasetAños = Array.from(uniqueIds);
        datasetAños.sort(function (a, b) {
          return b - a;
        });
        for (let i = 0; i < datasetAños.length; i++) {
          listOfOptions[i] = { label: datasetAños[i], value: datasetAños[i] };
        }
        this.listOfYears = [...listOfOptions];
        resolve(
          console.log(
            'listEmpleados: ',
            this.listEmpleados,
            'datasetAños: ',
            datasetAños,
            'listOfYears: ',
            this.listOfYears,
            'selectedYear: ',
            this.selectedYear
          )
        );
      });
    });
  }
  cargarTipoContrato() {
    return new Promise((resolve) => {
      this.porcentaje = 90;
      this.EmpleadosService.getListEmpleados().subscribe((empleado) => {
        for (let x = 0; x < empleado.length; x++) {
          for (let i = 0; i < this.listEmpleados.length; i++) {
            if (this.listEmpleados[i].empleadoID === empleado[x].id) {
              this.listEmpleados[i].permanente = empleado[x].permanente;
            }
          }
        }
        resolve(console.log('Empleados: ', this.listEmpleados));
      });
    });
  }
  cargarEmpleado() {
    var i: number = 0;
    var j: number = 0;
    var x: number = 0;
    var reset: number = 0;
    var temp: number = 0;
    var listFinal = [];
    var array: Array<number> = [];
    this.porcentaje = 30;
    this.ResultadosService.getResultados().subscribe(async (result) => {
      this.listEmpleados = [...result.sort((a, b) => a.empleadoID - b.empleadoID)];
      await this.cargarFechas();
      await this.cargarTipoContrato();
      for (let x = 0; x < result.length; x++) {
        array[i] = result[x].empleadoID;
        i++;
      }
      const uniqueIds = new Set(array);
      array.length = 0;
      array = Array.from(uniqueIds);
      console.log(array);
      for (let i = 0; i < this.listEmpleados.length; i++) {
        if (moment(this.listEmpleados[i].fechaCreacion).year() === this.selectedYear) {
          listFinal[temp] = this.listEmpleados[i];
          temp++;
        }
      }
      this.listEmpleados.length = 0;
      this.listCompleta.length = 0;
      this.listTemporal.length = 0;
      this.listEmpleados = [...listFinal];
      temp = 0;
      for (j = 0; j < array.length; j++) {
        console.log('VARIABLES 1', ' J: ', j, ' X: ', x);
        reset = 0;
        for (x = temp; x < this.listEmpleados.length; x++) {
          console.log('VARIABLES 2', ' J: ', j, ' X: ', x, ' listEmpId: ', this.listEmpleados[x].empleadoID, ' ARRAY: ', array[j]);
          if (this.listEmpleados[x].empleadoID === array[j]) {
            if (this.listTemporal[j] === undefined) {
              this.listTemporal[j] = {
                id: 0,
                nombreCompleto: '',
                totalPagar: 0,
                permanente: '',
                planillas: [
                  {
                    historialID: 0,
                    fechaInicio: '',
                    fechaFinal: '',
                    registro: 0,
                    valor: 0,
                    incompleto: '',
                  },
                ],
              };
              this.listTemporal[j].id = this.listEmpleados[x].empleadoID;
              this.listTemporal[j].nombreCompleto = this.listEmpleados[x].nombreCompleto;
              this.listTemporal[j].planillas[reset].historialID = this.listEmpleados[x].historialID;
              this.listTemporal[j].planillas[reset].fechaInicio = moment(this.listEmpleados[x].fechaInicio);
              this.listTemporal[j].planillas[reset].fechaFinal = moment(this.listEmpleados[x].fechaFinal);
              this.listTemporal[j].planillas[reset].fechaCreacion = moment(this.listEmpleados[x].fechaCreacion);
              this.listTemporal[j].planillas[reset].registro = this.listEmpleados[x].id;
              this.listTemporal[j].planillas[reset].valor = this.listEmpleados[x].totalPagar;
              this.listTemporal[j].planillas[reset].incompleto = this.listEmpleados[x].incompleto;
              this.listTemporal[j].totalPagar = this.listEmpleados[x].totalPagar;
              if (this.listEmpleados[x].permanente === true) {
                this.listTemporal[j].permanente = 'Permanente';
              } else {
                this.listTemporal[j].permanente = 'Temporal';
              }
              if (this.listEmpleados[x].incompleto === true) {
                this.listTemporal[j].planillas[reset].incompleto = 'Si';
              } else {
                this.listTemporal[j].planillas[reset].incompleto = 'No';
              }
              console.log('1 ', this.listTemporal, j, reset);
            } else {
              this.listTemporal[j].planillas[reset] = {
                historialID: 0,
                fechaInicio: '',
                fechaFinal: '',
                registro: 0,
                valor: 0,
                incompleto: '',
              };
              this.listTemporal[j].planillas[reset].historialID = this.listEmpleados[x].historialID;
              this.listTemporal[j].planillas[reset].fechaInicio = moment(this.listEmpleados[x].fechaInicio);
              this.listTemporal[j].planillas[reset].fechaFinal = moment(this.listEmpleados[x].fechaFinal);
              this.listTemporal[j].planillas[reset].fechaCreacion = moment(this.listEmpleados[x].fechaCreacion);
              this.listTemporal[j].planillas[reset].registro = this.listEmpleados[x].id;
              this.listTemporal[j].planillas[reset].valor = this.listEmpleados[x].totalPagar;
              this.listTemporal[j].totalPagar = this.listTemporal[j].totalPagar + this.listEmpleados[x].totalPagar;
              if (this.listEmpleados[x].incompleto === true) {
                this.listTemporal[j].planillas[reset].incompleto = 'Si';
              } else {
                this.listTemporal[j].planillas[reset].incompleto = 'No';
              }
              console.log('2 ', this.listTemporal, j, reset);
            }
            console.log('TRUE', ' J: ', j, ' X: ', x, ' listEmp: ', this.listEmpleados[x].empleadoID, ' ARRAY: ', array[j]);
          } else {
            temp = x;
            x = this.listEmpleados.length;
            console.log('FALSE', ' J: ', j, ' X: ', x, ' TEMP: ', temp);
          }
          reset++;
        }
      }
      this.porcentaje = 100;
      //reorganiza y elimina registros vacios
      this.listTemporal = this.listTemporal.filter(function (element) {
        return element !== undefined;
      });
      this.listCompleta = [...this.listTemporal];
      console.log(this.listEmpleados, this.listTemporal, this.listCompleta);
    });
  }
  filtrarPorFecha(id: number) {
    id--;
    var inicioMesAnterior = moment()
      .month(id - 1)
      .startOf('month')
      .year(this.selectedYear);
    var inicioMesSiguiente = moment()
      .month(id + 1)
      .startOf('month')
      .year(this.selectedYear);
    var inicioMes = moment().month(id).startOf('month').year(this.selectedYear);
    var finalMes = moment().month(id).endOf('month').year(this.selectedYear);
    var listadoTemp = [...this.listCompletaMensualPorId];
    var reset = 0;
    //limpiar lista de planillas del mes anterior
    if (this.final.length > 0) {
      this.final[0].planillas.length = 0;
      console.log('YES LENGTH > 0', this.final);
    }
    console.log(id, listadoTemp, inicioMes.format('L'), finalMes.format('L'));
    for (let i = 0; i < listadoTemp[0].planillas.length; i++) {
      if (
        (listadoTemp[0].planillas[i].fechaInicio >= inicioMesAnterior &&
          listadoTemp[0].planillas[i].fechaInicio < inicioMes &&
          listadoTemp[0].planillas[i].fechaFinal >= inicioMes &&
          listadoTemp[0].planillas[i].fechaFinal < finalMes) ||
        (listadoTemp[0].planillas[i].fechaInicio >= inicioMes &&
          listadoTemp[0].planillas[i].fechaInicio < finalMes &&
          listadoTemp[0].planillas[i].fechaFinal <= finalMes &&
          listadoTemp[0].planillas[i].fechaFinal > inicioMes) ||
        (listadoTemp[0].planillas[i].fechaInicio > inicioMes &&
          listadoTemp[0].planillas[i].fechaInicio < finalMes &&
          listadoTemp[0].planillas[i].fechaFinal >= inicioMesSiguiente)
      ) {
        console.log(
          'TRUE ',
          i,
          'FECHA INICIAL: ',
          moment(listadoTemp[0].planillas[i].fechaInicio).format('L'),
          moment(listadoTemp[0].planillas[i].fechaFinal).format('L'),
          'FECHA FINAL: ',
          moment(inicioMes).format('L'),
          moment(finalMes).format('L')
        );
        if (this.final[0] === undefined) {
          this.final = [
            {
              id: 0,
              nombreCompleto: '',
              totalPagar: 0,
              planillas: [
                {
                  historialID: 0,
                  fechaInicio: '',
                  fechaFinal: '',
                  registro: 0,
                  valor: 0,
                },
              ],
            },
          ];
          this.final[0].id = listadoTemp[0].id;
          this.final[0].nombreCompleto = listadoTemp[0].nombreCompleto;
          this.final[0].planillas[reset] = listadoTemp[0].planillas[i];
          this.final[0].totalPagar = listadoTemp[0].totalPagar;
          console.log('UNDEFINED', this.final);
        } else {
          this.final[0].planillas[reset] = listadoTemp[0].planillas[i];
          console.log('DEFINED', this.final, reset, i);
        }
        this.totalMensual = this.totalMensual + listadoTemp[0].planillas[i].valor;
        reset++;
      }
    }
    //limpiar listado si el empleado no tiene planillas en esas fechas
    if (this.final[0] !== undefined && this.final[0].planillas.length === 0) {
      this.final.length = 0;
    }
    console.log(this.final, this.listCompletaMensualPorId);
  }
  showListado(id: number) {
    return new Promise((resolve) => {
      for (let i = 0; i < this.listCompleta.length; i++) {
        if (id === this.listCompleta[i].id) {
          this.listCompletaMensualPorId.push(this.listCompleta[i]);
        }
      }
      resolve(console.log(id, this.listCompletaMensualPorId));
    });
  }
  async onExpandChange(id: number, checked: boolean): Promise<void> {
    this.selectedMonth = 1;
    this.totalMensual = 0;
    this.listCompletaMensualPorId.length = 0;
    if (this.listIds.length === 0 && checked === true) {
      await this.showListado(id);
      this.filtrarPorFecha(this.selectedMonth);
      this.expandSet.add(id);
      this.listIds.push(id);
    } else if (this.listIds.length > 0 && checked === true) {
      this.expandSet.delete(this.listIds[0]);
      this.listIds.length = 0;
      await this.showListado(id);
      this.filtrarPorFecha(this.selectedMonth);
      this.expandSet.add(id);
      this.listIds.push(id);
    } else {
      this.expandSet.delete(id);
      this.listIds.length = 0;
    }
  }
}
