using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using BEProyectoFinal;
using BEProyectoFinal.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BETesisProyectoFinal.Controllers
{
  //[EnableCors("CorsPolicy")]
  [Route("api/[controller]")]
  [ApiController]
  public class EmpleadoInactivoController : Controller
  {

    private readonly AplicationDBContext _context;


    public EmpleadoInactivoController(AplicationDBContext context)
    {
      _context = context;
    }

    // GET: api/<EmpleadoInactivoController>
    [HttpGet]
    public ActionResult<List<EmpleadosInactivos>> Get()
    {
      try
      {
        var ListEmpleadosInactivos = _context.EmpleadosInactivos.ToList();
        return Ok(ListEmpleadosInactivos);
      }
      catch(Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // GET api/<EmpleadoInactivoController>/5
    [HttpGet("{id}")]
    public ActionResult<EmpleadosInactivos> Get(int id)
    {
      try
      {
        var empleados = _context.EmpleadosInactivos.Find(id);
        if (empleados == null)
        {
          return NotFound();
        }
        return Ok(empleados);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    [Route("[action]")]
    public IActionResult Activos()
    {
      using (AplicationDBContext db = new AplicationDBContext())
      {
        //LINQ QUERY

        //SELECT c.id , c.nombres, c.apellidos, m.empleadoid FROM abmproyectofinal.empleados c
        //LEFT JOIN abmproyectofinal.empleadosinactivos m ON c.Id = m.empleadoID where m.empleadoid is null;

        //JOIN SYNTAX LINQ

        //from ... in outerSequence join... in innerSequence on outerKey equals innerKey select ...

        var query = from x in db.Empleados
                    from p in db.TipoPlanillas
                    from d in db.Departamentos
                    join y in db.EmpleadosInactivos on x.Id equals y.EmpleadoID into pp
                    from y in pp.DefaultIfEmpty()
                    where y == null && x.DepartamentoID == d.Id && x.PlanillaID == p.Id
                    select new
                    {
                      Id =x.Id,
                      Nombres=x.Nombres,
                      Apellidos=x.Apellidos,
                      Email=x.Email,
                      N_Cedula=x.N_Cedula,
                      Direccion=x.Direccion,
                      FechaNac=x.FechaNac,
                      FechaIngreso=x.FechaIngreso,
                      Genero=x.Genero,
                      SalarioBase=x.SalarioBase,
                      descriDepto=d.Descripcion,
                      tipoPlanilla=p.Tipo,
                      descriPlanilla=p.Descripcion,
                    };

        return Ok(query.ToList());
      }
    }
    [Route("[action]")]
    public IActionResult InActivos()
    {
      using (AplicationDBContext db = new AplicationDBContext())
      {
        //LINQ QUERY

        //SELECT m.*, c.id , c.nombres, c.apellidos FROM abmproyectofinal.empleados c
        //LEFT JOIN abmproyectofinal.empleadosinactivos m ON m.empleadoID = c.Id where m.empleadoID > 0

        //JOIN SYNTAX LINQ

        //from ... in outerSequence join... in innerSequence on outerKey equals innerKey select ...

        var query = from x in db.Empleados
                    join y in db.EmpleadosInactivos on x.Id equals y.EmpleadoID
                    where y.EmpleadoID > 0
                    select new
                    {
                      Nombres = x.Nombres,
                      Apellidos = x.Apellidos,
                      Id = y.Id,
                      Valor=y.Valor,
                      Motivo=y.Motivo,
                      Nota=y.Nota,
                      FechaSalida=y.FechaSalida,
                      EmpleadoID=y.EmpleadoID,
                    };

        return Ok(query.ToList());
      }
    }

    // POST api/<EmpleadoInactivoController>
    [HttpPost]
    public ActionResult Post([FromBody] EmpleadosInactivos empleados)
    {
      try
      {
        _context.Add(empleados);
        _context.SaveChanges();
        return Ok();
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    [HttpPost("[action]")]
    public ActionResult CargaMasivaInactivos([FromBody] EmpleadosInactivos[] empleados)
    {
      for (int i = 0; i < empleados.Length;)
      {
        _context.Add(empleados[i]);
        i++;
        _context.SaveChanges();
        //return Created("User created", empleados[i]);
      }
      return Ok();
    }
    // PUT api/<EmpleadoInactivoController>/5
    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] EmpleadosInactivos empleados)
    {
      try
      {
        if(id!=empleados.Id)
        {
          return BadRequest();
        }
        _context.Entry(empleados).State = EntityState.Modified;
        _context.Update(empleados);
        _context.SaveChanges();
        return Ok();

      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // DELETE api/<EmpleadoInactivoController>/5
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
      try
      {
        var empleado = _context.EmpleadosInactivos.Find(id);
        if (empleado == null)
        {
          return NotFound();
        }
        _context.Remove(empleado);
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
