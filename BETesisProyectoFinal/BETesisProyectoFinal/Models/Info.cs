using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BEProyectoFinal.Models
{
  public class Info
  {
    [Key]
    public int Id { get; set; }

    [Required]
    public string RazonSocial { get; set; }

    [Required]
    public DateTime FechaFundacion { get; set; }

    [Required]
    public string SitioWeb { get; set; }

    [Required]
    public string DireccionPrincipal { get; set; }

    [Required]
    public string Email { get; set; }

    [Required]
    public int CodigoPostal { get; set; }

    [Required]
    public string Bio { get; set; }

    [Required]
    public decimal TechoExento_ISR { get; set; }

    [Required]
    public decimal Techo15_ISR { get; set; }

    [Required]
    public decimal Techo20_ISR { get; set; }

    [Required]
    public decimal MontoServicioMedico_ISR { get; set; }

    [Required]
    public decimal TechoEM_IHSS { get; set; }

    [Required]
    public decimal TechoIVM_IHSS { get; set; }

    [Required]
    public decimal PorcentajeContribucionTrabajadorEM_IHSS { get; set; }

    [Required]
    public decimal PorcentajeContribucionTrabajadorIVM_IHSS { get; set; }

    [Required]
    public decimal TechoIVM_RAP { get; set; }

    [Required]
    public decimal PorcentajeContribucionTrabajador_RAP { get; set; }
  }
}
