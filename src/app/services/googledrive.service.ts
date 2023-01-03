import { Injectable } from '@angular/core';
import * as fs from 'fs';
import { google } from 'googleapis';

//excel file type
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const GOOGLE_API_FOLDER_ID = '1R2L1fFHddFIXQWBU51r4nwFOn-T2hi7p';

@Injectable({
  providedIn: 'root',
})
export class GoogledriveService {
  constructor() {}

  public async uploadFile() {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const driveService = google.drive({
      version: 'v3',
      auth,
    });
    const fileMetaData = {
      name: 'Book1.xlsx',
      parents: [GOOGLE_API_FOLDER_ID],
    };
    const media = {
      mimeType: EXCEL_TYPE,
      body: fs.createReadStream('./Book1.xlsx'),
    };
    try {
      const response = await driveService.files.create({
        requestBody: fileMetaData,
        media: media,
        fields: 'id',
      });
      console.log('File Uploaded', response.data.id);
      return response.data.id;
    } catch (err) {
      console.log('Upload File Error', err);
      return err;
    }
  }
}
// public async uploadFile(archivo: any, name: string) {
//   console.log(archivo, name);
//   const auth = new google.auth.GoogleAuth({
//     keyFile: './googlekey.json',
//     scopes: 'https://www.googleapis.com/auth/drive',
//   });
//   const driveService = google.drive({
//     version: 'v3',
//     auth,
//   });
// const fileMetaData = {
//   name: name,
//   parents: [GOOGLE_API_FOLDER_ID],
// };
// const media = {
//   mimeType: EXCEL_TYPE,
//   body: fs.createReadStream(archivo),
// };
//   try {
//     const response = await driveService.files.create({
//       requestBody: fileMetaData,
//       media: media,
//       fields: 'id',
//     });
//     console.log('File Id:', response.data.id);
//     return response.data.id;
//   } catch (err) {
//     throw err;
//   }
// }
