using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace BEProyectoFinal.Models
{
  public class Historial
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public DateTime FechaInicio { get; set; }

    [Required]
    public DateTime FechaFinal { get; set; }

    [Required]
    public decimal TotalPlanilla { get; set; }

    [Required]
    public string Archivo { get; set; }

    //[Required]
    //public string Link { get; set; }

    [Required]
    public int PlanillaID { get; set; }
    [ForeignKey("PlanillaID")]
    public TipoPlanillas TipoPlanillas { get; set; }

  }
}
