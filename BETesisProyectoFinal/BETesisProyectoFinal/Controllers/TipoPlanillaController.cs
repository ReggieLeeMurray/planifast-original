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

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BEProyectoFinal.Controllers
{
  //[EnableCors("CorsPolicy")]
  [Route("api/[controller]")]
  [ApiController]
  public class TipoPlanillaController : Controller
  {

    private readonly AplicationDBContext _context;

    public TipoPlanillaController(AplicationDBContext tp_context)
    {
      _context = tp_context;
    }


    // GET: api/<TipoPlanillaController>
    [HttpGet]
    public ActionResult<List<TipoPlanillas>> Get()
    {
      try
      {
        var ListPlanillas = _context.TipoPlanillas.ToList();
        return Ok(ListPlanillas);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // GET api/<TipoPlanillaController>/5
    [HttpGet("{id}")]
    public ActionResult<TipoPlanillas> Get(int id)
    {
      try
      {
        var tp = _context.TipoPlanillas.Find(id);
        if (tp == null)
        {
          return NotFound();
        }
        return Ok(tp);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }


    // POST api/<TipoPlanillaController>
    [HttpPost]
    public ActionResult Post([FromBody] TipoPlanillas tp)
    {
      try
      {
        _context.Add(tp);
        _context.SaveChanges();
        return Ok();
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // PUT api/<TipoPlanillaController>/5
    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] TipoPlanillas tp)
    {
      try
      {
        if (id != tp.Id)
        {
          return BadRequest();
        }
        _context.Entry(tp).State = EntityState.Modified;
        _context.Update(tp);
        _context.SaveChanges();
        return Ok();

      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // DELETE api/<TipoPlanillaController>/5
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
      try
      {
        var tp = _context.TipoPlanillas.Find(id);
        if (tp == null)
        {
          return NotFound();
        }
        _context.Remove(tp);
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
