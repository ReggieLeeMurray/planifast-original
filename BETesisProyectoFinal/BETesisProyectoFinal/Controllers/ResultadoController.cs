using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BEProyectoFinal;
using BETesisProyectoFinal.Models;
using BEProyectoFinal.Controllers;
using Microsoft.AspNetCore.Cors;
using BEProyectoFinal.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BETesisProyectoFinal.Controllers
{
  //[EnableCors("CorsPolicy")]
  [Route("api/[controller]")]
  [ApiController]
  public class ResultadoController : ControllerBase
  {
    private readonly AplicationDBContext _context;
    public ResultadoController(AplicationDBContext context)
    {
      _context = context;
    }
    // GET: api/<ResultadoController>
    [HttpGet]
    public ActionResult<List<Resultados>> Get()
    {
      try
      {
        var ListResultados = _context.Resultados.ToList();
        return Ok(ListResultados);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // GET api/<ResultadoController>/5
    [HttpGet("{id}")]
    public ActionResult<Resultados> Get(int id)
    {
      try
      {
        var resultados = _context.Resultados.Find(id);
        if (resultados == null)
        {
          return NotFound();
        }
        return Ok(resultados);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    [HttpPost("[action]")]
    public ActionResult CargaMasiva([FromBody] Resultados[] resultados)
    {
      for (int i = 0; i < resultados.Length;)
      {
        _context.Add(resultados[i]);
        i++;
        _context.SaveChanges();
      }
      return Ok();
    }
  }
}
