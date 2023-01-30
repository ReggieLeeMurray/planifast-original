using BEProyectoFinal.Models;
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
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BEProyectoFinal.Controllers
{
  //[EnableCors("CorsPolicy")]
  [Route("api/[controller]")]
  [ApiController]
  public class HistorialController : ControllerBase
  {
    private readonly AplicationDBContext _context;
    public HistorialController(AplicationDBContext context)
    {
      _context = context;
    }
    // GET: api/<HistorialController>
    [HttpGet]
    public ActionResult<List<Historial>> Get()
    {
      try
      {
        var ListHistorial = _context.Historial.ToList();
        return Ok(ListHistorial);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }


    // GET api/<HistorialController>/5
    [HttpGet("{id}")]
    public ActionResult<Historial> Get(int id)
    {
      try
      {
        var historial = _context.Historial.Find(id);
        if (historial == null)
        {
          return NotFound();
        }
        return Ok(historial);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }
    [Route("[action]")]
    public IActionResult Lista()
    {
      using (AplicationDBContext db = new AplicationDBContext())
      {
        //LINQ QUERY

        //SELECT h.*, p.descripcion FROM planifast.historial h
        //LEFT JOIN planifast.tipoplanillas p on h.PlanillaID where h.id = p.id;

        //JOIN SYNTAX LINQ

        //from ... in outerSequence join... in innerSequence on outerKey equals innerKey select ...

        var query = from x in db.Historial
                    join y in db.TipoPlanillas on x.PlanillaID equals y.Id
                    select new
                    {
                      Id=x.Id,
                      FechaInicio = x.FechaInicio,
                      FechaFinal = x.FechaFinal,
                      FechaCreacion = x.FechaCreacion,
                      TotalPlanilla = x.TotalPlanilla,
                      Archivo = x.Archivo,
                      Descripcion = y.Descripcion
                    };

        return Ok(query.ToList());
      }
    }
    [Route("[action]")]
    public IActionResult SumTotalxFechaxPlanilla(DateTime inicial, DateTime final, int id )
    {
      using (AplicationDBContext db = new AplicationDBContext())
      {
        //LINQ QUERY

        //SELECT SUM(TotalPlanilla) AS Total  FROM planifast.historial WHERE FechaInicio >= "2021-09-01" and
        // FechaFinal<= "2021-09-30" and planillaID = 8

        var query = from x in db.Historial
                    where x.FechaInicio >= inicial
                    where x.FechaFinal <= final
                    where x.PlanillaID == id
                    select new
                    {
                      TotalPlanilla = x.TotalPlanilla
                    };
        var query2 = from x in db.Historial
                    where x.FechaInicio >= inicial
                    where x.FechaFinal <= final
                    where x.PlanillaID == id
                    select new
                    {
                      Id = x.PlanillaID,
                      TotalPlanilla = query.Select(x => x.TotalPlanilla).Sum()
                    };

        return Ok(query2.ToList());
      }
    }
    // POST api/<HistorialController>
    [HttpPost]
    public ActionResult Post([FromBody] Historial history)
    {
      try
      {
        _context.Add(history);
        _context.SaveChanges();
        return Ok();
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // PUT api/<HistorialController>/5
    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] Historial history)
    {
      try
      {
        if (id != history.Id)
        {
          return BadRequest();
        }
        _context.Entry(history).State = EntityState.Modified;
        _context.Update(history);
        _context.SaveChanges();
        return Ok();

      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }
    // DELETE api/<HistorialController>/5
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
      try
      {
        var history = _context.Historial.Find(id);
        if (history == null)
        {
          return NotFound();
        }
        _context.Remove(history);
        _context.SaveChanges();
        return Ok();
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }
  }
}
