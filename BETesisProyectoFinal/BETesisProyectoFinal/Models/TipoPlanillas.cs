using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using BEProyectoFinal.Models;
using BETesisProyectoFinal.Models;
namespace BEProyectoFinal.Models
{
  public class TipoPlanillas
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public string Descripcion { get; set; }

    [Required]
    public string Tipo { get; set; }
  }
}
