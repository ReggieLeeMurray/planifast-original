using BETesisProyectoFinal.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace BEProyectoFinal.Models
{
  public class ISR
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public decimal TotalEne { get; set; }

    [Required]
    public decimal TotalFeb { get; set; }

    [Required]
    public decimal TotalMar { get; set; }

    [Required]
    public decimal TotalAbr { get; set; }

    [Required]
    public decimal TotalMay { get; set; }

    [Required]
    public decimal TotalJun { get; set; }

    [Required]
    public decimal TotalJul { get; set; }

    [Required]
    public decimal TotalAgo { get; set; }

    [Required]
    public decimal TotalSep { get; set; }

    [Required]
    public decimal TotalOct { get; set; }

    [Required]
    public decimal TotalNov { get; set; }

    [Required]
    public decimal TotalDic { get; set; }

    [Required]
    public int EmpleadoID { get; set; }
    [ForeignKey("EmpleadoID")]
    public Empleados Empleados { get; set; }
  }
}
