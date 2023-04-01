using BETesisProyectoFinal.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace BEProyectoFinal.Models
{
  public class Planillas
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public int EmpleadoID { get; set; }
    [ForeignKey("EmpleadoID")]
    public Empleados Empleados { get; set; }

    [Required]
    public int HistorialID { get; set; }
    [ForeignKey("HistorialID")]
    public Historial Historial { get; set; }
  }
}
