import { Component, OnInit } from '@angular/core';
import { HistorialService } from 'src/app/services/historial.service';
import moment, { Moment } from 'moment';
import { startOfMonth, endOfMonth } from 'date-fns';
// import { AzureBlobStorageService } from 'src/app/services/azure-blob-storage.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css'],
})
export class HistorialComponent implements OnInit {
  listHistory = null;
  listadoTemp = [];
  historial: string;
  fechasValidas = true;
  loading = false;
  listTemporal = null;
  file: any;
  fileName: string = '';
  notFound = './assets/empty.svg';
  date = [startOfMonth(new Date()), endOfMonth(new Date())];
  inicioMes: Moment = moment().startOf('month');
  finalMes: Moment = moment().endOf('month');
  DEBUG = false;
  today = new Date();
  ranges = {
    'Mes Anterior': [
      startOfMonth(
        new Date(this.today.getFullYear(), this.today.getMonth() - 1)
      ),
      endOfMonth(new Date(this.today.getFullYear(), this.today.getMonth(), 0)),
    ],
  };

  constructor(
    private HistorialService: HistorialService // private AzureBlobStorageService: AzureBlobStorageService
  ) {}
  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    this.cargarHistorial();
  }
  // reloadArchivosList() {
  //   this.AzureBlobStorageService.listBlobs().then((list) => {
  //     for (let i = 0; i < this.listHistory.length; i++) {
  //       this.listHistory[i].archivos = list[i];
  //     }
  //   });
  // }
  // downloadPlanilla(name: string) {
  //   this.AzureBlobStorageService.downloadBlob(name, (blob) => {
  //     let url = window.URL.createObjectURL(blob);
  //     window.open(url);
  //   });
  // }
  // onFileChange(event: any) {
  //   console.log(event);
  //   this.file = event.target.files[0];
  //   this.fileName = event.target.files[0].name;
  //   this.upload(this.file, this.fileName);
  // }
  // upload(archivo: any, name: string) {
  //   console.log(archivo, name);
  // }
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
        var tempFechaInicio = moment(this.listadoTemp[0].fechaInicio).format(
          'DD MM YYYY'
        );
        var tempfechaFinal = moment(this.listadoTemp[0].fechaFinal).format(
          'DD MM YYYY'
        );
        var tempInicioMes = moment(this.inicioMes).format('DD MM YYYY');
        var tempfinalMes = moment(this.finalMes).format('DD MM YYYY');

        for (let i = 0; i < this.listadoTemp.length; i++) {
          if (
            (this.listadoTemp[i].fechaInicio > this.inicioMes ||
              tempFechaInicio === tempInicioMes) &&
            this.listadoTemp[i].fechaInicio < this.finalMes &&
            (this.listadoTemp[i].fechaFinal < this.finalMes ||
              tempfechaFinal === tempfinalMes) &&
            this.listadoTemp[i].fechaFinal > this.inicioMes
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
    console.log('DATE: ', result);
    this.cargarHistorial();
  }
  Search(value: string) {
    if (this.listTemporal == null) {
      this.listTemporal = this.listHistory;
    }
    if (value != '' && value != undefined && value != null) {
      this.listHistory = this.listTemporal.filter((res) => {
        return (
          res.descripcion
            .toLocaleLowerCase()
            .match(value.toLocaleLowerCase()) ||
          res.tipo.toLocaleLowerCase().match(value.toLocaleLowerCase())
        );
      });
    } else {
      this.listHistory = this.listTemporal;
      this.listTemporal = null;
      return this.listHistory;
    }
  }
}
