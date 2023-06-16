import { Injectable } from '@angular/core';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

@Injectable({
  providedIn: 'root',
})
export class AzureBlobStorageService {
  // Enter your storage account name
  planillasAccount = 'ngblobsplanifasthn';
  // container name
  // planillasContainer = 'planillas';
  // container test name
  planillasContainer = 'prueba';
  //key to container
  // code =
  //  'sp=racwdl&st=2021-09-20T17:10:41Z&se=2022-09-21T01:10:41Z&sv=2020-08-04&sr=c&sig=%2FHBpIOqfqRqWQlON0v%2FtSCriPioFVxSSvt1ThLwlebo%3D';
  //sas key to test container
  // code =
  //   'sp=racwdli&st=2022-02-03T18:11:21Z&se=2023-04-02T02:11:21Z&sv=2020-08-04&sr=c&sig=5RvADCusCQ9Yn%2F6wPx6IsTAWFT0v7MbfQCHicvxVi%2FM%3D';

  public async listBlobs(): Promise<string[]> {
    let result: string[] = [];
    let blobs = this.containerClient().listBlobsFlat();
    for await (const blob of blobs) {
      result.push(blob.name);
    }
    return result;
  }
  public downloadBlob(name: string, handler: (blob: Blob) => void) {
    const blobClient = this.containerClient().getBlobClient(name);
    blobClient.download().then((resp) => {
      resp.blobBody.then((blob) => {
        handler(blob);
      });
    });
  }
  public uploadBlob(sas: string, content: Blob, name: string, handler: () => void) {
    const blockBlobClient = this.containerClient(sas).getBlockBlobClient(name);
    blockBlobClient
      .uploadData(content, {
        blobHTTPHeaders: { blobContentType: content.type },
      })
      .then(() => handler());
  }
  public deleteBlob(name: string, client: ContainerClient, handler: () => void) {
    client.deleteBlob(name).then(() => {
      handler();
    });
  }
  public containerClient(sas?: string): ContainerClient {
    let token = '';
    if (sas) {
      token = sas;
    }
    return new BlobServiceClient(`https://${this.planillasAccount}.blob.core.windows.net?${token}`).getContainerClient(this.planillasContainer);
  }
}
