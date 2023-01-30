using BEProyectoFinal.Models;
using BETesisProyectoFinal.Models;
using Microsoft.EntityFrameworkCore;
using WebApi.Entities;

namespace BEProyectoFinal
{
  public class AplicationDBContext: DbContext
  {
    public DbSet<User> Users { get; set; }
    public DbSet<Empleados> Empleados { get; set; }
    public DbSet<Departamentos> Departamentos { get; set; }
    public DbSet<Usuarios> Usuarios { get; set; }
    public DbSet<TipoPlanillas> TipoPlanillas { get; set; }
    public DbSet<Roles> Roles { get; set; }
    public DbSet<Eventos> Eventos { get; set; }
    public DbSet<EmpleadosInactivos> EmpleadosInactivos { get; set; }
    public DbSet<Info> Info { get; set; }
    public DbSet<Historial> Historial { get; set; }

    public AplicationDBContext() { }
    public AplicationDBContext(DbContextOptions<AplicationDBContext> options) : base(options) { }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
      if (!optionsBuilder.IsConfigured)
      {
        optionsBuilder.UseMySql("Server=localhost;Database=planifast;Uid=root;Pwd=admin");
        //optionsBuilder.UseMySql("Server=planifast-my-sql-db.mysql.database.azure.com;Database=PlaniFast;Uid=reggiemurray@planifast-my-sql-db;Pwd=Incorrect201");
      }

    }
  }
}
