using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using BEProyectoFinal.Models;
namespace BEProyectoFinal.Models
{
  public class Usuarios
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public string NombreUsuario { get; set; }

    [Required]
    public string Password { get; set; }

    [Required]
    public string Email { get; set; }

    [Required]
    public int RolID { get; set; }
    [ForeignKey("RolID")]
    public Roles Roles { get; set; }

  }
}
