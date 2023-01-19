import { Component, OnInit } from '@angular/core';
import { HistorialService } from 'src/app/services/historial.service';
// import { AzureBlobStorageService } from 'src/app/services/azure-blob-storage.service';
import { GoogledriveService } from 'src/app/services/googledrive.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css'],
})
export class HistorialComponent implements OnInit {
  listHistory = null;
  historial: string;
  loading = false;
  listTemporal = null;
  file: any;
  fileName: string = '';
  DEBUG = false;

  constructor(
    private HistorialService: HistorialService,
    // private AzureBlobStorageService: AzureBlobStorageService,
    private GoogledriveService: GoogledriveService
  ) {}
  ngOnInit(): void {
    // ENABLE/DISABLE Console Logs
    if (!this.DEBUG) {
      console.log = function () {};
    }
    // this.cargarHistorial();
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
  // cargarHistorial() {
  //   this.loading = true;
  //   this.HistorialService.getListHistoryWPlanilla().subscribe((data) => {
  //     this.loading = false;
  //     this.listHistory = data;
  //     this.listHistory.sort((a, b) => a.id - b.id);
  //     this.reloadArchivosList();
  //   });
  // }
  onFileChange(event: any) {
    console.log(event);
    this.file = event.target.files[0];
    this.fileName = event.target.files[0].name;
    this.upload(this.file, this.fileName);
  }
  upload(archivo: any, name: string) {
    console.log(archivo, name);
    // this.GoogledriveService.uploadFile(archivo, name).then((data) => {});
  }
  Search(value: string) {
    if (this.listTemporal == null) {
      this.listTemporal = this.listHistory;
    }
    if (value != '' && value != undefined && value != null) {
      this.listHistory = this.listTemporal.filter((res) => {
        return res.descripcion
          .toLocaleLowerCase()
          .match(value.toLocaleLowerCase());
      });
    } else {
      this.listHistory = this.listTemporal;
      this.listTemporal = null;
      return this.listHistory;
    }
  }
}
