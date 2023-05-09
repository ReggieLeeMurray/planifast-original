import { Component, OnInit } from '@angular/core';
import { HistorialService } from 'src/app/services/historial.service';
import moment, { Moment } from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
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
  dateFormat = 'dd/MM/yyyy';
  notFound = './assets/empty.svg';
  date = [startOfMonth(new Date()), endOfMonth(new Date())];
  inicioMes: Moment = moment().startOf('month');
  finalMes: Moment = moment().endOf('month');
  DEBUG = false;
  today = new Date();
  ranges = {
    'Mes Anterior': [
      startOfMonth(new Date(this.today.getFullYear(), this.today.getMonth() - 1)),
      endOfMonth(new Date(this.today.getFullYear(), this.today.getMonth(), 0)),
    ],
    'Mes Actual': [
      startOfMonth(new Date(this.today.getFullYear(), this.today.getMonth())),
      endOfMonth(new Date(this.today.getFullYear(), this.today.getMonth())),
    ],
  };

  constructor(
    private NzMessageService: NzMessageService,
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
  // downloadPlanillaAzure(name: string) {
  //   this.AzureBlobStorageService.downloadBlob(name, (blob) => {
  //     let url = window.URL.createObjectURL(blob);
  //     window.open(url);
  //   });
  // }
  downloadPlanilla(id: number) {
    this.HistorialService.downloadFile(id).subscribe((data) => {
      console.log(data);
      //no generar archivo si esta vacio
      if (data.size === 1) {
        this.NzMessageService.error('¡Archivo no disponible!');
      } else {
        this.NzMessageService.success('¡Archivo generado exitosamente!');
        let url = window.URL.createObjectURL(data);
        window.open(url);
      }
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
        for (let i = 0; i < this.listadoTemp.length; i++) {
          if (
            (this.listadoTemp[i].fechaInicio >= inicioMesAnterior &&
              this.listadoTemp[i].fechaInicio < this.inicioMes &&
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
      console.log(this.fechasValidas, this.listHistory, this.inicioMes, this.finalMes);
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
        return res.descripcion.toLocaleLowerCase().match(value.toLocaleLowerCase()) || res.tipo.toLocaleLowerCase().match(value.toLocaleLowerCase());
      });
    } else {
      this.listHistory = this.listTemporal;
      this.listTemporal = null;
      return this.listHistory;
    }
  }
}
