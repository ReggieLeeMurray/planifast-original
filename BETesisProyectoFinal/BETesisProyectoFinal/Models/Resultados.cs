using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BEProyectoFinal.Models;
using BETesisProyectoFinal.Models;
using System.Diagnostics;
using Microsoft.AspNetCore.Http;

namespace BEProyectoFinal.Models
{
  public class Resultados
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public string NombreCompleto { get; set; }

    [Required]
    public bool Permanente { get; set; }

    [Required]
    public double SalarioBase { get; set; }

    [Required]
    public double Ingresos { get; set; }

    [Required]
    public double Deducciones { get; set; }

    [Required]
    public double Recargo { get; set; }

    [Required]
    public double HorasNormales { get; set; }

    [Required]
    public double LpsNormales { get; set; }

    [Required]
    public double HorasDiurnas { get; set; }

    [Required]
    public double LpsDiurnas { get; set; }

    [Required]
    public double HorasMixtas { get; set; }

    [Required]
    public double LpsMixtas { get; set; }

    [Required]
    public double HorasNocturnas { get; set; }

    [Required]
    public double LpsNocturnas { get; set; }

    [Required]
    public double Feriado { get; set; }

    [Required]
    public double Incapacidad { get; set; }

    [Required]
    public double Septimo { get; set; }

    [Required]
    public double Vacacion { get; set; }

    [Required]
    public double AjusteP { get; set; }

    [Required]
    public double Aguinaldo { get; set; }

    [Required]
    public double Ihss { get; set; }

    [Required]
    public double Isr { get; set; }

    [Required]
    public double Afpc { get; set; }

    [Required]
    public double Impvecinal { get; set; }

    [Required]
    public double Anticipo { get; set; }

    [Required]
    public double Prestamorap { get; set; }

    [Required]
    public double Cta { get; set; }

    [Required]
    public double Viaticos { get; set; }

    [Required]
    public double Ajuste { get; set; }

    [Required]
    public double Otros { get; set; }

    [Required]
    public double TotalPagar { get; set; }

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
