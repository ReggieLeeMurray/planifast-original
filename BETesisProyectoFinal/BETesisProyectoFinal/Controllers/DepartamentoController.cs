using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BEProyectoFinal;
using BEProyectoFinal.Controllers;
using BEProyectoFinal.Models;
using Microsoft.AspNetCore.Cors;

namespace BEProyectoFinal.Controllers
{
  //[EnableCors("CorsPolicy")]
  [Route("api/[controller]")]
  [ApiController]
  public class DepartamentoController : Controller
  {
    private readonly AplicationDBContext _context;
    public DepartamentoController(AplicationDBContext depto_context)
    {
      _context = depto_context;
    }

    // GET: api/<DepartamentoController>
    [HttpGet]
    public ActionResult<List<Departamentos>> Get()
    {
      try
      {
        var ListDepartamentos = _context.Departamentos.ToList();
        return Ok(ListDepartamentos);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // GET api/<DepartamentoController>/5
    [HttpGet("{id}")]
    public ActionResult<Departamentos> Get(int id)
    {
      try
      {
        var deptos = _context.Departamentos.Find(id);
        if (deptos == null)
        {
          return NotFound();
        }
        return Ok(deptos);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // POST api/<DepartamentoController>
    [HttpPost]
    public ActionResult Post([FromBody] Departamentos deptos)
    {
      try
      {
        _context.Add(deptos);
        _context.SaveChanges();
        return Ok();
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // PUT api/<DepartamentoController>/5
    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] Departamentos deptos)
    {
      try
      {
        if (id != deptos.Id)
        {
          return BadRequest();
        }
        _context.Entry(deptos).State = EntityState.Modified;
        _context.Update(deptos);
        _context.SaveChanges();
        return Ok();

      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // DELETE api/<DepartamentoController>/5
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
      try
      {
        var deptos = _context.Departamentos.Find(id);
        if (deptos == null)
        {
          return NotFound();
        }
        _context.Remove(deptos);
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
