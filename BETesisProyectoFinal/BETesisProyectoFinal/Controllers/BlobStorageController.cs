using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WebApi.Services;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BEProyectoFinal.Controllers
{
 [ApiController]
 [Route("api/[controller]")]
 public class UploadController : ControllerBase
 {
   private IBlobService _blobService;

   public UploadController(IBlobService blobService)
   {
     _blobService = blobService;
   }

   [HttpPost(""), DisableRequestSizeLimit]
   public async Task<ActionResult > UploadFile()
   {
     IFormFile file = Request.Form.Files[0];
     if (file == null)
     {
       return BadRequest();
     }

     var result = await _blobService.UploadFileBlobAsync(
             "planillas",
             file.OpenReadStream(),
             file.ContentType,
             file.FileName);

     var toReturn = result.AbsoluteUri;

     return Ok(new { path = toReturn });
   }
 }
}
