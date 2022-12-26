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
  public class UsuarioController : ControllerBase
  {

    private readonly AplicationDBContext _context;


    public UsuarioController(AplicationDBContext context)
    {
      _context = context;
    }


    // GET: api/<UsuarioController>
    [HttpGet]
    public ActionResult<List<Usuarios>> Get()
    {
      try
      {
        var ListUsuarios = _context.Usuarios.ToList();
        return Ok(ListUsuarios);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    [HttpGet("byUser")]
    public IActionResult byUser(string user)
    {
      using (AplicationDBContext db = new AplicationDBContext())
      
      {
        //LINQ

        //select* from abmproyectofinal.usuarios where usuarios.nombreUsuario = "elmalo"

        var query = from x in db.Usuarios
                    where x.NombreUsuario == user
                    select new
                    {
                      Id = x.Id,
                      NombreUsuario = x.NombreUsuario,
                      Password = x.Password,
                      Email = x.Email,
                      RolID = x.RolID
                    };
        return Ok(query.ToList());
      }
    }

    [Route("[action]")]
    public IActionResult UsuariosConRoles()
    {
      using (AplicationDBContext db = new AplicationDBContext())
      {
        //LINQ QUERY

        //SELECT* FROM abmproyectofinal.roles r
        //LEFT JOIN abmproyectofinal.usuarios u ON r.id = u.rolid

        //JOIN SYNTAX LINQ

        //from ... in outerSequence join... in innerSequence on outerKey equals innerKey select ...

        var query = from r in db.Roles
                    join u in db.Usuarios on r.Id equals u.RolID
                    select new
                    {
                      Id = u.Id,
                      NombreUsuario = u.NombreUsuario,
                      Password = u.Password,
                      Email = u.Email,
                      RolID = u.RolID,
                      Descripcion = r.Descripcion,
                    };

        return Ok(query.ToList());
      }
    }
    // GET api/<UsuarioController>/5
    [HttpGet("{id}")]
    public ActionResult<Usuarios> Get(int id)
    {
      try
      {
        var usuarios = _context.Usuarios.Find(id);
        if (usuarios == null)
        {
          return NotFound();
        }
        return Ok(usuarios);
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }
    // POST api/<UsuarioController>
    [HttpPost]
    public ActionResult Post([FromBody] Usuarios usuarios)
    {
      try
      {
        _context.Add(usuarios);
        _context.SaveChanges();
        return Ok();
      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // PUT api/<UsuarioController>/5
    [HttpPut("{id}")]
    public ActionResult Put(int id, [FromBody] Usuarios usuarios)
    {
      try
      {
        if (id != usuarios.Id)
        {
          return BadRequest();
        }
        _context.Entry(usuarios).State = EntityState.Modified;
        _context.Update(usuarios);
        _context.SaveChanges();
        return Ok();

      }
      catch (Exception ex)
      {
        return BadRequest(ex.Message);
      }
    }

    // DELETE api/<UsuarioController>/5
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
      try
      {
        var usuarios = _context.Usuarios.Find(id);
        if (usuarios == null)
        {
          return NotFound();
        }
        _context.Remove(usuarios);
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
