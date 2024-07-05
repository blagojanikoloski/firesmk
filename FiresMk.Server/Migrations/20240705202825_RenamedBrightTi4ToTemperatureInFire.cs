using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FiresMk.Server.Migrations
{
    /// <inheritdoc />
    public partial class RenamedBrightTi4ToTemperatureInFire : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BrightTi4",
                table: "Fires",
                newName: "Temperature");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Temperature",
                table: "Fires",
                newName: "BrightTi4");
        }
    }
}
