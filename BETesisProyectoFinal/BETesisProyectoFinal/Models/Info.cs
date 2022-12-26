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
  }
}
