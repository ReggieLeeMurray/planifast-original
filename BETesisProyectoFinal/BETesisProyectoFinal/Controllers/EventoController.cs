using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BEProyectoFinal;
using BEProyectoFinal.Controllers;
using BETesisProyectoFinal.Models;
using BEProyectoFinal.Models;
using Microsoft.AspNetCore.Cors;


// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BETesisProyectoFinal.Controllers
{
  //[EnableCors("CorsPolicy")]
  [Route("api/[controller]")]
  [ApiController]
  public class EventoController : Controller
  {

    private readonly AplicationDBContext _context;


    public EventoController(AplicationDBContext context)
    {
      _context = context;
    }

    // GET: api/<EventoController>
    [HttpGet]
    public ActionResult<List<Eventos>> Get()
    {
      try
      {
        var ListEventos = _context.Eventos.ToList();
        return Ok(ListEventos);
      }
      catch(Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // GET api/<EventoController>/5
    [HttpGet("{id}")]
    public ActionResult<Eventos> Get(int id)
    {
      try
      {
        var eventos = _context.Eventos.Find(id);
        if (eventos == null)
        {
          return NotFound();
        }
        return Ok(eventos);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // POST api/<EventoController>
    [HttpPost]
    public ActionResult Post([FromBody] Eventos eventos)
    {
      try
      {
        _context.Add(eventos);
        _context.SaveChanges();
        return Ok();
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // PUT api/<EventoController>/5
    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] Eventos eventos)
    {
      try
      {
        if(id!=eventos.Id)
        {
          return BadRequest();
        }
        _context.Entry(eventos).State = EntityState.Modified;
        _context.Update(eventos);
        _context.SaveChanges();
        return Ok();

      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }
    [Route("[action]")]
    public IActionResult Eventos()
    {
      using (AplicationDBContext db = new AplicationDBContext())
      {
        //LINQ QUERY

        //SELECT e.nombres, e.apellidos, ev.* FROM abmproyectofinal.empleados e
        //LEFT JOIN abmproyectofinal.eventos ev on e.id where e.id = ev.empleadosID;

        //JOIN SYNTAX LINQ

        //from ... in outerSequence join... in innerSequence on outerKey equals innerKey select ...

        var query = from x in db.Empleados
                    join y in db.Eventos on x.Id equals y.EmpleadosID
                    select new
                    {
                      IdEmp = x.Id,
                      Apellidos = x.Apellidos,
                      Nombres = x.Nombres,
                      Id = y.Id,
                      FechaInicio = y.FechaInicio,
                      FechaFinal = y.FechaFinal,
                      Tipo = y.Tipo,
                      Comentario = y.Comentario,
                      Color= y.Color
                    };

        return Ok(query.ToList());
      }
    }
    [Route("[action]")]
    public IActionResult CountEventosByTipo(int id)
    {
      using (AplicationDBContext db = new AplicationDBContext())
      {
        //LINQ

        //select e.tipo, COUNT(*) as cantidad from abmproyectofinal.eventos e  group by e.tipo;


        var query = from x in db.Eventos
                    group x by x.Tipo into grp
                    select new { Tipo = grp.Key, Cantidad = grp.Count() };

        return Ok(query.ToList());
      }
    }

    // DELETE api/<EventoController>/5
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
      try
      {
        var eventos = _context.Eventos.Find(id);
        if (eventos == null)
        {
          return NotFound();
        }
        _context.Remove(eventos);
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
