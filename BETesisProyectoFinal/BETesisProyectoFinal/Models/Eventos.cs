using BEProyectoFinal.Models;
using BETesisProyectoFinal.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace BEProyectoFinal.Models
{
  public class Eventos
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public DateTime FechaInicio { get; set; }

    [Required]
    public DateTime FechaFinal { get; set; }

    [Required]
    public string Tipo { get; set; }

    [Required]
    public string Comentario { get; set; }

    [Required]
    public string Color { get; set; }

    [Required]
    public int EmpleadosID { get; set; }
    [ForeignKey("EmpleadosID")]
    public Empleados Empleados { get; set; }

  }
}
