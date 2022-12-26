using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
  public class EmpleadoController : Controller
  {

    private readonly AplicationDBContext _context;


    public EmpleadoController(AplicationDBContext context)
    {
      _context = context;
    }

    // GET: api/<EmpleadoController>
    [HttpGet]
    public ActionResult<List<Empleados>> Get()
    {
      try
      {
        var ListEmpleados = _context.Empleados.ToList();
        return Ok(ListEmpleados);
      }
      catch(Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // GET api/<EmpleadoController>/5
    [HttpGet("{id}")]
    public ActionResult<Empleados> Get(int id)
    {
      try
      {
        var empleados = _context.Empleados.Find(id);
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

    [HttpGet("byPlanilla")]
    public IActionResult byPlanilla(int id)
    {
      using (AplicationDBContext db = new AplicationDBContext())
      {
        //LINQ

        //select * from abmproyectofinal.empleados c where c.planillaId = 2;

        var query = from x in db.Empleados
                    join y in db.EmpleadosInactivos on x.Id equals y.EmpleadoID into pp
                    from y in pp.DefaultIfEmpty()
                    where x.PlanillaID == id && y == null
                    select new Empleados
                    {
                      Id = x.Id,
                      Apellidos = x.Apellidos,
                      Nombres = x.Nombres,
                      Email = x.Email,
                      N_Cedula = x.N_Cedula,
                      Direccion = x.Direccion,
                      FechaIngreso = x.FechaIngreso,
                      FechaNac = x.FechaNac,
                      Genero = x.Genero,
                      SalarioBase = x.SalarioBase,
                      DepartamentoID = x.DepartamentoID,
                      PlanillaID = x.PlanillaID,
                      DiasLaborados = x.DiasLaborados,
                      Ingresos=x.Ingresos,
                      Deducciones=x.Deducciones,
                      TotalPagar=x.TotalPagar
                    };
        return Ok(query.ToList());
      }
    }

    [Route("[action]")]
    public IActionResult CountEmpleadobyPlanilla(int id)
    {
      using (AplicationDBContext db = new AplicationDBContext())
      {
        //LINQ

        //SELECT d.descripcion, COUNT(*) as cantidad
        //FROM abmproyectofinal.empleados e, abmproyectofinal.tipoplanillas d
        //WHERE e.planillaid = d.id group by d.descripcion;

        var query = from x in db.Empleados
                    from y in db.TipoPlanillas
                    where x.PlanillaID == y.Id
                    group x by y.Descripcion into grp
                    select new { Descripcion = grp.Key, Cantidad = grp.Count() };

        return Ok(query.ToList());
      }
    }
    [Route("[action]")]
    public IActionResult CountEmpleadoActivo(int id)
    {
      using (AplicationDBContext db = new AplicationDBContext())
      {
        //LINQ

        //select COUNT(*) as cantidad
        //from abmproyectofinal.empleados as a
        //where a.id NOT IN(select b.empleadoId
        //                  from abmproyectofinal.empleadosinactivos as b) 

        var query = (from x in db.Empleados 
                     where !(from o in db.EmpleadosInactivos
                             select o.EmpleadoID)
                             .Contains(x.Id)
                     select x).Count();

        return Ok(query);
      }
    }
    [Route("[action]")]
    public IActionResult CountEmpleadoInactivo(int id)
    {
      using (AplicationDBContext db = new AplicationDBContext())
      {
        //LINQ

        //select COUNT(*) as CantidadActivos from abmproyectofinal.empleados;
        //var qry = (from x in y
        //           select x).Count()

        var query = (from x in db.EmpleadosInactivos select x).Count();

        return Ok(query);
      }
    }
    [Route("[action]")]
    public IActionResult CountEmpleadobyDepto(int id)
    {
      using (AplicationDBContext db = new AplicationDBContext())
      {
        //LINQ

        //SELECT d.descripcion, COUNT(*) as cantidad
        //FROM abmproyectofinal.empleados e, abmproyectofinal.departamentos d
        //WHERE e.departamentoid = d.id group by d.descripcion;

        var query = from x in db.Empleados
                 from y in db.Departamentos
                 where x.DepartamentoID == y.Id
                 group x by y.Descripcion into grp
                 select new { Descripcion = grp.Key, Cantidad = grp.Count() };

        return Ok(query.ToList());
      }
    }

    // POST api/<EventoController>
    [HttpPost]
    public ActionResult Post([FromBody] Empleados empleados)
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
    public ActionResult CargaMasiva([FromBody] Empleados[] empleados)
    {
      for (int i = 0; i < empleados.Length;)
      {
        _context.Add(empleados[i]);
        i++;
        _context.SaveChanges();
        //return Created("Player created", empleados[i]);
      }
      return Ok();
    }

    // PUT api/<EmpleadoController>/5
    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] Empleados empleados)
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

    // DELETE api/<EmpleadoController>/5
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
      try
      {
        var empleado = _context.Empleados.Find(id);
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
