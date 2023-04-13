import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models';
import { AccountService } from 'src/app/_services';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { HistorialService } from 'src/app/services/historial.service';
import { TipoplanillaService } from 'src/app/services/tipoplanilla.service';
import moment, { Moment } from 'moment';
import Chart from 'chart.js/auto';
import { first } from 'rxjs/operators';
import { toNumber } from 'ng-zorro-antd/core/util';
import { startOfMonth, endOfMonth } from 'date-fns';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  chart: any;
  chart2: any;
  chart3: any;
  chart4: any;
  chart5: any;
  chart6: any;
  dateFormat = 'dd/MM/yyyy';
  date = [startOfMonth(new Date()), endOfMonth(new Date())];
  // inicioMes: string = moment().startOf('month').format('YYYY-MM-DD');
  // finalMes: string = moment().endOf('month').format('YYYY-MM-DD');
  inicioMes: Moment = moment().startOf('month');
  finalMes: Moment = moment().endOf('month');
  selectedValue = moment().year();
  valor = [];
  listOfOption = [];
  descripcion = [];
  listHistory = null;
  listadoTemp = [];
  fechasValidas = true;
  listPersonalContratadosByFecha = [];
  listEmpleadosByDepto = [];
  listEmpleadosByPlanilla = [];
  listEventosByTipo = [];
  listPlanillas = [];
  loading = false;
  today = new Date();
  ranges = {
    'Mes Anterior': [
      startOfMonth(
        new Date(this.today.getFullYear(), this.today.getMonth() - 1)
      ),
      endOfMonth(new Date(this.today.getFullYear(), this.today.getMonth(), 0)),
    ],
    'Mes Actual': [
      startOfMonth(new Date(this.today.getFullYear(), this.today.getMonth())),
      endOfMonth(new Date(this.today.getFullYear(), this.today.getMonth())),
    ],
  };
  user: User;
  userFromApi: User;
  DEBUG = true;

  constructor(
    private EmpleadosService: EmpleadosService,
    private HistorialService: HistorialService,
    private TipoplanillaService: TipoplanillaService,
    private accountService: AccountService
  ) {
    this.user = this.accountService.userValue;
  }

  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarHistorial();
    this.cargarAcceso();
    this.cargarEmpleadoByDepto();
    this.cargarEmpleadobyPlanilla();
    this.cargarEmpleados();
    this.cargarTotalxFechaxPlanilla();
    this.cargarEmpleadosxFechaContratacion();
    // this.cargarEventosByTipo();
    console.log(this.date);
  }
  cargarAcceso() {
    this.loading = true;
    this.accountService
      .getById(this.user.id)
      .pipe(first())
      .subscribe((user) => {
        this.loading = false;
        this.userFromApi = user;
      });
  }
  cargarHistorial() {
    this.loading = true;
    this.HistorialService.getListHistoryWPlanilla().subscribe((data) => {
      this.loading = false;
      this.listadoTemp = data;
      console.log(data, this.listadoTemp);
      for (let w = 0; w < data.length; w++) {
        this.listadoTemp[w].fechaInicio = moment(data[w].fechaInicio);
        this.listadoTemp[w].fechaFinal = moment(data[w].fechaFinal);
      }
      this.listadoTemp.sort((a, b) => a.id - b.id);
      this.listHistory = [];
      console.log(data, this.listadoTemp, this.listHistory);
      var x: number = 0;
      if (this.fechasValidas === true) {
        var inicioMesAnterior = moment(this.inicioMes).subtract(1, 'month');
        var inicioMesActual = moment(this.inicioMes).startOf('month');
        for (let i = 0; i < this.listadoTemp.length; i++) {
          if (
            (this.listadoTemp[i].fechaInicio >= inicioMesAnterior &&
              this.listadoTemp[i].fechaInicio < inicioMesActual &&
              this.listadoTemp[i].fechaFinal >= this.inicioMes &&
              this.listadoTemp[i].fechaFinal < this.finalMes) ||
            (this.listadoTemp[i].fechaInicio >= this.inicioMes &&
              this.listadoTemp[i].fechaInicio < this.finalMes &&
              this.listadoTemp[i].fechaFinal <= this.finalMes &&
              this.listadoTemp[i].fechaFinal > this.inicioMes)
          ) {
            console.log(
              'TRUE ',
              i,
              x,
              'FECHA INICIAL: ',
              this.listadoTemp[i].fechaInicio,
              this.inicioMes,
              'FECHA FINAL: ',
              this.listadoTemp[i].fechaFinal,
              this.finalMes
            );
            this.listHistory[x] = this.listadoTemp[i];
            x++;
          }
        }
      } else {
        console.log('FALSE');
        this.listHistory = this.listadoTemp;
      }
      console.log(
        this.fechasValidas,
        this.listHistory,
        this.inicioMes,
        this.finalMes
      );
      // this.reloadArchivosList();
    });
  }
  // onChange(result: Date[]): void {
  //   console.log(result[0], result[1]);
  //   if (result.length === 0) {
  //     this.inicioMes = moment().startOf('month').format('YYYY-MM-DD');
  //     this.finalMes = moment().endOf('month').format('YYYY-MM-DD');
  //   } else {
  //     var start = moment(result[0]).format('YYYY-MM-DD');
  //     var end = moment(result[1]).format('YYYY-MM-DD');
  //     this.inicioMes = start;
  //     this.finalMes = end;
  //   }
  //   this.chart5.destroy();
  //   this.valor.length = 0;
  //   this.descripcion.length = 0;
  //   this.cargarTotalxFechaxPlanilla();
  //   console.log('DATE: ', result, 'START', start, 'END', end);
  // }
  onChange(result: Date[]): void {
    console.log(result[0], result[1]);
    if (result[0] === undefined && result[1] === undefined) {
      this.fechasValidas = false;
    } else {
      if (result.length === 0) {
        this.inicioMes = moment().startOf('month');
        this.finalMes = moment().endOf('month');
      } else {
        this.inicioMes = moment(result[0]);
        this.finalMes = moment(result[1]);
      }
      this.fechasValidas = true;
    }
    this.chart5.destroy();
    this.valor.length = 0;
    this.descripcion.length = 0;
    this.cargarHistorial();
    this.cargarTotalxFechaxPlanilla();
    console.log(
      'DATE: ',
      result,
      'START',
      this.inicioMes,
      'END',
      this.finalMes
    );
    console.log('DATE: ', result);
  }
  selectedYear(result: any) {
    if (result === null) {
      this.selectedValue = moment().year();
    }
    this.chart6.destroy();
    this.cargarEmpleadosxFechaContratacion();
  }
  cargarEmpleadosxFechaContratacion() {
    this.loading = true;
    var fechas = [];
    var index = 0;
    var empleados = [];
    var empleadosDespedidos = [];
    var mesesArray = [
      { mes: 1 },
      { mes: 2 },
      { mes: 3 },
      { mes: 4 },
      { mes: 5 },
      { mes: 6 },
      { mes: 7 },
      { mes: 8 },
      { mes: 9 },
      { mes: 10 },
      { mes: 11 },
      { mes: 12 },
    ];
    var datasetContratacionMensual = [];
    var datasetAbandonoMensual = [];
    fechas = Array.from(Array(new Date().getFullYear() - 1992), (_, i) =>
      (i + 1993).toString()
    );
    fechas.sort(function (a, b) {
      return b - a;
    });
    for (let z = 0; z < fechas.length; z++) {
      fechas[z] = toNumber(fechas[z]);
      this.listOfOption[z] = { label: fechas[z], value: fechas[z] };
    }
    console.log(this.listOfOption);
    this.EmpleadosService.getCountPersonalByFechaIngreso().subscribe(
      (datos) => {
        empleados = datos;
        empleados.sort((a, b) => a.month - b.month);
        this.EmpleadosService.getCountPersonalByFechaSalida().subscribe(
          (datos) => {
            empleadosDespedidos = datos;
            empleadosDespedidos.sort((a, b) => a.month - b.month);
            console.log(empleados, empleadosDespedidos);

            for (let w = 0; w < mesesArray.length; w++) {
              for (let y = 0; y < empleados.length; y++) {
                if (mesesArray[w].mes === undefined) {
                  w = empleados.length;
                } else {
                  console.log(
                    'AQUI MIRA DESPEDIDOS',
                    empleados[y].fecha.year,
                    this.selectedValue,
                    mesesArray[w].mes,
                    empleados[y].fecha.month,
                    empleados[y].cantidad
                  );
                  if (empleados[y].fecha.year === this.selectedValue) {
                    if (mesesArray[w].mes === empleados[y].fecha.month) {
                      datasetContratacionMensual[index] = empleados[y].cantidad;
                      index++;
                      y = empleados.length;
                    } else {
                      if (y === empleados.length - 1) {
                        datasetContratacionMensual[index] = 0;
                        index++;
                        y = empleados.length;
                      }
                    }
                  }
                }
              }
            }
            index = 0;
            for (let w = 0; w < mesesArray.length; w++) {
              for (let y = 0; y < empleadosDespedidos.length; y++) {
                if (mesesArray[w].mes === undefined) {
                  w = empleadosDespedidos.length;
                } else {
                  console.log(
                    'AQUI MIRA DESPEDIDOS',
                    empleadosDespedidos[y].fecha.year,
                    this.selectedValue,
                    mesesArray[w].mes,
                    empleadosDespedidos[y].fecha.month,
                    empleadosDespedidos[y].cantidad
                  );
                  if (
                    empleadosDespedidos[y].fecha.year === this.selectedValue
                  ) {
                    if (
                      mesesArray[w].mes === empleadosDespedidos[y].fecha.month
                    ) {
                      datasetAbandonoMensual[index] =
                        empleadosDespedidos[y].cantidad;
                      index++;
                      y = empleadosDespedidos.length;
                    } else {
                      if (y === empleadosDespedidos.length - 1) {
                        datasetAbandonoMensual[index] = 0;
                        index++;
                        y = empleadosDespedidos.length;
                      }
                    }
                  }
                }
              }
            }
            index = 0;
            this.chart6 = new Chart('canvas6', {
              type: 'bar',
              data: {
                labels: [
                  'Enero',
                  'Febrero',
                  'Marzo',
                  'Abril',
                  'Mayo',
                  'Junio',
                  'Julio',
                  'Agosto',
                  'Septiembre',
                  'Octubre',
                  'Noviembre',
                  'Diciembre',
                ],
                datasets: [
                  {
                    label: 'Reclutados',
                    data: datasetContratacionMensual,
                    backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgb(54, 162, 235)'],
                    borderWidth: 3,
                  },
                  {
                    label: 'Despedidos',
                    data: datasetAbandonoMensual,
                    backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgb(255, 99, 132)'],
                    borderWidth: 3,
                  },
                ],
              },
              options: {
                plugins: {
                  legend: {
                    display: true,
                  },
                },
                responsive: true,
                maintainAspectRatio: true,
              },
            });
          }
        );
      }
    );
  }
  cargarTotalxFechaxPlanilla() {
    this.loading = true;
    this.TipoplanillaService.getListTipoPlanilla().subscribe((data) => {
      this.loading = false;
      this.listPlanillas = data;
      for (let i = 0; i < this.listPlanillas.length; i++) {
        this.HistorialService.SumTotalxFechaxPlanilla(
          this.listPlanillas[i].id,
          moment(this.listHistory[0].fechaInicio).format('YYYY-MM-DD'),
          this.finalMes.format('YYYY-MM-DD')
        ).subscribe((data) => {
          if (data[0] != undefined) {
            this.listPlanillas[i].totalesPlanillas = data[0].totalPlanilla;
            console.log('true');
          } else {
            this.listPlanillas[i].totalesPlanillas = 0;
            console.log('false');
          }
          var cantidad = this.listPlanillas.map(
            (data) => data.totalesPlanillas
          );
          var tipo = this.listPlanillas.map((data) => data.tipo);
          var planilla = this.listPlanillas.map((data) => data.descripcion);
          var labels = [];
          var planillaRefformated = [];
          var indefinido: any;
          var pos: number = 0;
          if (cantidad.indexOf(undefined) !== -1) {
            indefinido = i;
          }
          for (let w = 0; w < planilla.length; w++) {
            planillaRefformated[w] = planilla[w].slice(0, 6).toUpperCase();
          }
          for (let x = 0; x < tipo.length; x++) {
            if (cantidad[x] !== 0) {
              labels[pos] = planillaRefformated[x] + ' - ' + tipo[x];
              cantidad[pos] = cantidad[x];
              pos++;
            }
          }
          if (i !== indefinido) {
            console.log(labels, cantidad, indefinido, i);
            this.chart5 = new Chart('canvas5', {
              type: 'bar',
              data: {
                labels: labels,
                datasets: [
                  {
                    data: cantidad,
                    backgroundColor: [
                      'rgba(255, 205, 86, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(255, 159, 64, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(201, 203, 207, 0.2)',
                    ],
                    borderColor: [
                      'rgb(255, 205, 86)',
                      'rgb(153, 102, 255)',
                      'rgb(75, 192, 192)',
                      'rgb(255, 99, 132)',
                      'rgb(255, 159, 64)',
                      'rgb(54, 162, 235)',
                      'rgb(201, 203, 207)',
                    ],
                    borderWidth: 3,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              },
            });
          }
        });
      }
    });
  }
  cargarEmpleadoByDepto() {
    this.loading = true;
    this.EmpleadosService.getEmpleadoByDepto().subscribe((data) => {
      let listTemporal: any = data;
      let i: number = 0;
      for (let w = 0; w < listTemporal.length; w++) {
        if (listTemporal[w].cantidad > 5) {
          this.listEmpleadosByDepto[i] = listTemporal[w];
          i++;
        }
      }
      var cantidademp = this.listEmpleadosByDepto.map((data) => data.cantidad);
      var departamento = this.listEmpleadosByDepto.map(
        (data) => data.descripcion
      );
      console.log(cantidademp, departamento);
      this.chart = new Chart('canvas', {
        type: 'polarArea',
        data: {
          labels: departamento,
          datasets: [
            {
              data: cantidademp,
              backgroundColor: [
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(201, 203, 207, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(153, 102, 255, 0.2)',
              ],
              borderColor: [
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(201, 203, 207)',
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(153, 102, 255)',
              ],
              borderWidth: 3,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
          responsive: true,
        },
      });
    });
  }
  cargarEmpleadobyPlanilla() {
    this.loading = true;
    this.EmpleadosService.getEmpleadoByPlanilla().subscribe((data) => {
      this.listEmpleadosByPlanilla = data;
      var cantidademp = this.listEmpleadosByPlanilla.map(
        (data) => data.cantidad
      );
      var planilla = this.listEmpleadosByPlanilla.map(
        (data) => data.descripcion
      );
      var planillaRefformated = [];
      for (let w = 0; w < planilla.length; w++) {
        planillaRefformated[w] = planilla[w].split(' ')[0].toUpperCase();
      }
      this.chart2 = new Chart('canvas2', {
        type: 'doughnut',
        data: {
          labels: planillaRefformated,
          datasets: [
            {
              data: cantidademp,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)',
              ],
              borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)',
              ],
              borderWidth: 3,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
        },
      });
    });
  }
  cargarEmpleados() {
    this.loading = true;
    this.EmpleadosService.getCountActivo().subscribe((data) => {
      var a = data;
      this.EmpleadosService.getCountInactivo().subscribe((data1) => {
        var b = data1;

        this.chart = new Chart('canvas4', {
          type: 'pie',
          data: {
            labels: ['Activos', 'Inactivos'],
            datasets: [
              {
                data: [a, b],
                backgroundColor: [
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                  'rgb(75, 192, 192)',
                  'rgb(54, 162, 235)',
                  'rgb(153, 102, 255)',
                ],
                borderWidth: 3,
                hoverOffset: 4,
              },
            ],
          },
        });
      });
    });
  }
  // cargarEventosByTipo() {
  //   this.loading = true;
  //   this.EventosService.getEventosByTipo().subscribe((data) => {
  //     this.listEventosByTipo = data;
  //     var tipo = this.listEventosByTipo.map((data) => data.tipo);
  //     var cantidad = this.listEventosByTipo.map((data) => data.cantidad);
  //     this.chart = new Chart('canvas3', {
  //       type: 'polarArea',
  //       data: {
  //         labels: tipo,
  //         datasets: [
  //           {
  //             data: cantidad,
  //             backgroundColor: [
  //               'rgba(75, 192, 192, 0.2)',
  //               'rgba(54, 162, 235, 0.2)',
  //               'rgba(153, 102, 255, 0.2)',
  //             ],
  //             borderColor: [
  //               'rgb(75, 192, 192)',
  //               'rgb(54, 162, 235)',
  //               'rgb(153, 102, 255)',
  //             ],
  //             borderWidth: 3,
  //           },
  //         ],
  //       },
  //       options: {
  //         responsive: true,
  //       },
  //     });
  //   });
  // }
}
