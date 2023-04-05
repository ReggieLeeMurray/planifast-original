using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace BEProyectoFinal.Migrations
{
    public partial class myFirstMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Departamentos",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Descripcion = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departamentos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Info",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    RazonSocial = table.Column<string>(nullable: false),
                    FechaFundacion = table.Column<DateTime>(nullable: false),
                    SitioWeb = table.Column<string>(nullable: false),
                    DireccionPrincipal = table.Column<string>(nullable: false),
                    Email = table.Column<string>(nullable: false),
                    CodigoPostal = table.Column<int>(nullable: false),
                    Bio = table.Column<string>(nullable: false),
                    TechoExento_ISR = table.Column<decimal>(nullable: false),
                    Techo15_ISR = table.Column<decimal>(nullable: false),
                    Techo20_ISR = table.Column<decimal>(nullable: false),
                    MontoServicioMedico_ISR = table.Column<decimal>(nullable: false),
                    TechoEM_IHSS = table.Column<decimal>(nullable: false),
                    TechoIVM_IHSS = table.Column<decimal>(nullable: false),
                    PorcentajeContribucionTrabajadorEM_IHSS = table.Column<decimal>(nullable: false),
                    PorcentajeContribucionTrabajadorIVM_IHSS = table.Column<decimal>(nullable: false),
                    TechoIVM_RAP = table.Column<decimal>(nullable: false),
                    PorcentajeContribucionTrabajador_RAP = table.Column<decimal>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Info", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TipoPlanillas",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Descripcion = table.Column<string>(nullable: false),
                    Tipo = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoPlanillas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    FirstName = table.Column<string>(nullable: true),
                    LastName = table.Column<string>(nullable: true),
                    Username = table.Column<string>(nullable: true),
                    Email = table.Column<string>(nullable: true),
                    Role = table.Column<string>(nullable: true),
                    Token = table.Column<string>(nullable: true),
                    PasswordHash = table.Column<byte[]>(nullable: true),
                    PasswordSalt = table.Column<byte[]>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Empleados",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Nombres = table.Column<string>(nullable: false),
                    Apellidos = table.Column<string>(nullable: false),
                    Email = table.Column<string>(nullable: false),
                    N_Cedula = table.Column<string>(nullable: false),
                    Direccion = table.Column<string>(nullable: false),
                    FechaNac = table.Column<DateTime>(nullable: false),
                    FechaIngreso = table.Column<DateTime>(nullable: false),
                    FechaCreacion = table.Column<DateTime>(nullable: false),
                    Permanente = table.Column<bool>(nullable: false),
                    Genero = table.Column<string>(nullable: false),
                    SalarioBase = table.Column<decimal>(nullable: false),
                    DepartamentoID = table.Column<int>(nullable: false),
                    PlanillaID = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empleados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Empleados_Departamentos_DepartamentoID",
                        column: x => x.DepartamentoID,
                        principalTable: "Departamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Empleados_TipoPlanillas_PlanillaID",
                        column: x => x.PlanillaID,
                        principalTable: "TipoPlanillas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Historial",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    FechaInicio = table.Column<DateTime>(nullable: false),
                    FechaFinal = table.Column<DateTime>(nullable: false),
                    TotalPlanilla = table.Column<decimal>(nullable: false),
                    Archivo = table.Column<string>(nullable: false),
                    DataFiles = table.Column<byte[]>(nullable: true),
                    FechaCreacion = table.Column<DateTime>(nullable: false),
                    PlanillaID = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Historial", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Historial_TipoPlanillas_PlanillaID",
                        column: x => x.PlanillaID,
                        principalTable: "TipoPlanillas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmpleadosInactivos",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Valor = table.Column<decimal>(nullable: false),
                    Motivo = table.Column<string>(nullable: false),
                    Nota = table.Column<string>(nullable: false),
                    FechaSalida = table.Column<DateTime>(nullable: false),
                    EmpleadoID = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmpleadosInactivos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmpleadosInactivos_Empleados_EmpleadoID",
                        column: x => x.EmpleadoID,
                        principalTable: "Empleados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Eventos",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    FechaInicio = table.Column<DateTime>(nullable: false),
                    FechaFinal = table.Column<DateTime>(nullable: false),
                    Tipo = table.Column<string>(nullable: false),
                    Comentario = table.Column<string>(nullable: false),
                    Color = table.Column<string>(nullable: false),
                    EmpleadosID = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Eventos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Eventos_Empleados_EmpleadosID",
                        column: x => x.EmpleadosID,
                        principalTable: "Empleados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Resultados",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    NombreCompleto = table.Column<string>(nullable: false),
                    Permanente = table.Column<bool>(nullable: false),
                    SalarioBase = table.Column<double>(nullable: false),
                    Ingresos = table.Column<double>(nullable: false),
                    Deducciones = table.Column<double>(nullable: false),
                    Recargo = table.Column<double>(nullable: false),
                    HorasNormales = table.Column<double>(nullable: false),
                    LpsNormales = table.Column<double>(nullable: false),
                    HorasDiurnas = table.Column<double>(nullable: false),
                    LpsDiurnas = table.Column<double>(nullable: false),
                    HorasMixtas = table.Column<double>(nullable: false),
                    LpsMixtas = table.Column<double>(nullable: false),
                    HorasNocturnas = table.Column<double>(nullable: false),
                    LpsNocturnas = table.Column<double>(nullable: false),
                    Feriado = table.Column<double>(nullable: false),
                    Incapacidad = table.Column<double>(nullable: false),
                    Septimo = table.Column<double>(nullable: false),
                    Vacacion = table.Column<double>(nullable: false),
                    AjusteP = table.Column<double>(nullable: false),
                    Aguinaldo = table.Column<double>(nullable: false),
                    Ihss = table.Column<double>(nullable: false),
                    Isr = table.Column<double>(nullable: false),
                    Afpc = table.Column<double>(nullable: false),
                    Impvecinal = table.Column<double>(nullable: false),
                    Anticipo = table.Column<double>(nullable: false),
                    Prestamorap = table.Column<double>(nullable: false),
                    Cta = table.Column<double>(nullable: false),
                    Viaticos = table.Column<double>(nullable: false),
                    Ajuste = table.Column<double>(nullable: false),
                    Otros = table.Column<double>(nullable: false),
                    TotalPagar = table.Column<double>(nullable: false),
                    EmpleadoID = table.Column<int>(nullable: false),
                    HistorialID = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resultados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Resultados_Empleados_EmpleadoID",
                        column: x => x.EmpleadoID,
                        principalTable: "Empleados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Resultados_Historial_HistorialID",
                        column: x => x.HistorialID,
                        principalTable: "Historial",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_DepartamentoID",
                table: "Empleados",
                column: "DepartamentoID");

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_PlanillaID",
                table: "Empleados",
                column: "PlanillaID");

            migrationBuilder.CreateIndex(
                name: "IX_EmpleadosInactivos_EmpleadoID",
                table: "EmpleadosInactivos",
                column: "EmpleadoID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Eventos_EmpleadosID",
                table: "Eventos",
                column: "EmpleadosID");

            migrationBuilder.CreateIndex(
                name: "IX_Historial_PlanillaID",
                table: "Historial",
                column: "PlanillaID");

            migrationBuilder.CreateIndex(
                name: "IX_Resultados_EmpleadoID",
                table: "Resultados",
                column: "EmpleadoID");

            migrationBuilder.CreateIndex(
                name: "IX_Resultados_HistorialID",
                table: "Resultados",
                column: "HistorialID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmpleadosInactivos");

            migrationBuilder.DropTable(
                name: "Eventos");

            migrationBuilder.DropTable(
                name: "Info");

            migrationBuilder.DropTable(
                name: "Resultados");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Empleados");

            migrationBuilder.DropTable(
                name: "Historial");

            migrationBuilder.DropTable(
                name: "Departamentos");

            migrationBuilder.DropTable(
                name: "TipoPlanillas");
        }
    }
}
