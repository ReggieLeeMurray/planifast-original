using System;
using Azure.Storage.Blobs;
using System.Threading.Tasks;
using System.IO;
using Azure.Storage.Blobs.Models;

namespace WebApi.Services
{
   public interface IBlobService
   {
   Task<Uri> UploadFileBlobAsync(string blobContainerName, Stream content, string contentType, string fileName);
   BlobContainerClient GetContainerClient(string blobContainerName);
   }

 public class BlobService : IBlobService
 {
   private readonly BlobServiceClient _blobServiceClient;

   public BlobService(BlobServiceClient blobServiceClient)
   {
     _blobServiceClient = blobServiceClient;
   }

   public async Task<Uri> UploadFileBlobAsync(string blobContainerName, Stream content, string contentType, string fileName)
   {
     var containerClient = GetContainerClient(blobContainerName);
     var blobClient = containerClient.GetBlobClient(fileName);
     await blobClient.UploadAsync(content, new BlobHttpHeaders { ContentType = contentType });
     return blobClient.Uri;
   }

   public BlobContainerClient GetContainerClient(string blobContainerName)
   {
     var containerClient = _blobServiceClient.GetBlobContainerClient(blobContainerName);
     containerClient.CreateIfNotExists(PublicAccessType.Blob);
     return containerClient;
   }
 }
}
