using BEProyectoFinal.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BEProyectoFinal.Controllers
{
  //[EnableCors("CorsPolicy")]
  [Route("api/[controller]")]
  [ApiController]
  public class InfoController : Controller
  {
    private readonly AplicationDBContext _context;
    public InfoController(AplicationDBContext context)
    {
      _context = context;
    }

    // GET: api/<InfoController>
    [HttpGet]
    public ActionResult<List<Info>> Get()
    {
      try
      {
        var info = _context.Info.ToList();
        return Ok(info);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // GET api/<InfoController>/5
    [HttpGet("{id}")]
    public ActionResult<Info> Get(int id)
    {
      try
      {
        var info = _context.Info.Find(id);
        if (info == null)
        {
          return NotFound();
        }
        return Ok(info);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // POST api/<InfoController>
    [HttpPost]
    public ActionResult Post([FromBody] Info info)
    {
      try
      {
        _context.Add(info);
        _context.SaveChanges();
        return Ok();
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // PUT api/<InfoController>/5
    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] Info info)
    {
      try
      {
        if (id != info.Id)
        {
          return BadRequest();
        }
        _context.Entry(info).State = EntityState.Modified;
        _context.Update(info);
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
