using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;
using BEProyectoFinal.Models;
using BETesisProyectoFinal.Models;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using Microsoft.AspNetCore.Http;

namespace BETesisProyectoFinal.Models
{
  public class Empleados
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public string Nombres { get; set; }

    [Required]
    public string Apellidos { get; set; }

    [Required]
    public string Email { get; set; }

    [Required]
    public string N_Cedula { get; set; }

    [Required]
    public string Direccion { get; set; }

    [Required]
    public DateTime FechaNac { get; set; }

    [Required]
    public DateTime FechaIngreso { get; set; }

    [Required]
    public DateTime FechaCreacion { get; set; }

    [Required]
    public string Genero { get; set; }

    [Required]
    public decimal SalarioBase { get; set; }

    [Required]
    public int DiasLaborados { get; set; }
    [Required]
    public decimal Ingresos { get; set; }

    [Required]
    public decimal Deducciones { get; set; }

    [Required]
    public decimal TotalPagar { get; set; }

    [Required]
    public int DepartamentoID { get; set; }
    [ForeignKey("DepartamentoID")]
    public Departamentos Departamentos { get; set; }

    [Required]
    public int PlanillaID { get; set; }
    [ForeignKey("PlanillaID")]
    public TipoPlanillas TipoPlanillas { get; set; }
    public EmpleadosInactivos EmpleadosInactivos { get; set; }

  }
}
