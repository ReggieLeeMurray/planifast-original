import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { EventosService } from 'src/app/services/eventos.service';
import { HistorialService } from 'src/app/services/historial.service';
import { TipoplanillaService } from 'src/app/services/tipoplanilla.service';
import moment from 'moment';

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
  date = null;
  valor = [];
  descripcion = [];
  listEmpleadosByDepto = null;
  listEmpleadosByPlanilla = null;
  listEventosByTipo = null;
  listPlanillas = [];
  loading = false;
  inicioMes: string = moment().startOf('month').format('YYYY-MM-DD');
  finalMes: string = moment().endOf('month').format('YYYY-MM-DD');
  DEBUG = true;

  constructor(
    private EmpleadosService: EmpleadosService,
    private HistorialService: HistorialService,
    private TipoplanillaService: TipoplanillaService,
    private EventosService: EventosService
  ) {}

  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarEmpleadoByDepto();
    this.cargarEmpleadobyPlanilla();
    this.cargarEventosByTipo();
    this.cargarEmpleados();
    this.cargarTotalxFechaxPlanilla();
  }
  onChange(result: Date[]): void {
    if (result.length == 0) {
      this.inicioMes = moment().startOf('month').format('YYYY-MM-DD');
      this.finalMes = moment().endOf('month').format('YYYY-MM-DD');
      this.chart5.destroy();
      this.valor.length = 0;
      this.descripcion.length = 0;
      this.cargarTotalxFechaxPlanilla();
    } else {
      var start = moment(result[0]).format('YYYY-MM-DD');
      var end = moment(result[1]).format('YYYY-MM-DD');
      this.inicioMes = start;
      this.finalMes = end;
      console.log('onChange: ', result, 's', start, 'e', end);
      this.chart5.destroy();
      this.valor.length = 0;
      this.descripcion.length = 0;
      this.cargarTotalxFechaxPlanilla();
    }
  }
  cargarTotalxFechaxPlanilla() {
    this.loading = true;
    this.TipoplanillaService.getListTipoPlanilla().subscribe((data) => {
      this.loading = false;
      this.listPlanillas = data;
      for (let i = 0; i < this.listPlanillas.length; i++) {
        this.HistorialService.SumTotalxFechaxPlanilla(
          this.listPlanillas[i].id,
          this.inicioMes,
          this.finalMes
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
          var indefinido: any;
          if (cantidad.indexOf(undefined) !== -1) {
            indefinido = i;
          }
          for (let x = 0; x < tipo.length; x++) {
            if (cantidad[x] !== 0) {
              labels[x] = planilla[x] + ' -  ' + tipo[x];
            }
          }
          if (i != indefinido) {
            console.log(cantidad, indefinido, i);
            this.chart5 = new Chart('canvas5', {
              type: 'bar',
              data: {
                labels: labels,
                datasets: [
                  {
                    label: 'Valor',
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
      this.listEmpleadosByDepto = data;
      var cantidademp = this.listEmpleadosByDepto.map((data) => data.cantidad);
      var departamento = this.listEmpleadosByDepto.map(
        (data) => data.descripcion
      );
      console.log(cantidademp, departamento);
      this.chart = new Chart('canvas', {
        type: 'bar',
        data: {
          labels: departamento,
          datasets: [
            {
              label: 'Empleados',
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
            },
          ],
        },
        options: {
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

      this.chart2 = new Chart('canvas2', {
        type: 'doughnut',
        data: {
          labels: planilla,
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
  cargarEventosByTipo() {
    this.loading = true;
    this.EventosService.getEventosByTipo().subscribe((data) => {
      this.listEventosByTipo = data;
      var tipo = this.listEventosByTipo.map((data) => data.tipo);
      var cantidad = this.listEventosByTipo.map((data) => data.cantidad);
      this.chart = new Chart('canvas3', {
        type: 'polarArea',
        data: {
          labels: tipo,
          datasets: [
            {
              data: cantidad,
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
}
