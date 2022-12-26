using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BEProyectoFinal.Controllers;
using BEProyectoFinal.Models;
using Microsoft.AspNetCore.Cors;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BEProyectoFinal.Controllers
{
  //[EnableCors("CorsPolicy")]
  [Route("api/[controller]")]
  [ApiController]
  public class RolController : ControllerBase
  {

    private readonly AplicationDBContext _context;


    public RolController(AplicationDBContext context)
    {
      _context = context;
    }

    // GET: api/<RolController>
    [HttpGet]
    public ActionResult<List<Roles>> Get()
    {
      try
      {
        var ListRoles = _context.Roles.ToList();
        return Ok(ListRoles);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // GET api/<RolController>/5
    [HttpGet("{id}")]
    public ActionResult<Roles> Get(int id)
    {
      try
      {
        var roles = _context.Roles.Find(id);
        if (roles == null)
        {
          return NotFound();
        }
        return Ok(roles);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // POST api/<RolController>
    [HttpPost]
    public ActionResult Post([FromBody] Roles roles)
    {
      try
      {
        _context.Add(roles);
        _context.SaveChanges();
        return Ok();
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }
    // PUT api/<RolController>/5
    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] Roles roles)
    {
      try
      {
        if (id != roles.Id)
        {
          return BadRequest();
        }
        _context.Entry(roles).State = EntityState.Modified;
        _context.Update(roles);
        _context.SaveChanges();
        return Ok();

      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // DELETE api/<RolController>/5
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
      try
      {
        var roles = _context.Roles.Find(id);
        if (roles == null)
        {
          return NotFound();
        }
        _context.Remove(roles);
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
