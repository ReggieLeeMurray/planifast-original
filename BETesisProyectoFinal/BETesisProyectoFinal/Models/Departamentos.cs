using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using BEProyectoFinal.Models;
using BETesisProyectoFinal.Models;

namespace BEProyectoFinal.Models
{
  public class Departamentos
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public string Descripcion { get; set; }

  }
}

