using BETesisProyectoFinal.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace BEProyectoFinal.Models
{
  public class EmpleadosInactivos
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public float Valor { get; set; }

    [Required]
    public string Motivo { get; set; }

    [Required]
    public string Nota { get; set; }

    [Required]
    public DateTime FechaSalida { get; set; }

    [Required]
    public int EmpleadoID { get; set; }
    [ForeignKey("EmpleadoID")]
    public Empleados Empleados { get; set; }
  }
}
