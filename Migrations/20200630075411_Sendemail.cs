using Microsoft.EntityFrameworkCore.Migrations;

namespace blog.Migrations
{
    public partial class Sendemail : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Encryption",
                table: "SiteOption",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SMTPHost",
                table: "SiteOption",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SMTPPassword",
                table: "SiteOption",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SMTPPort",
                table: "SiteOption",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SMTPUser",
                table: "SiteOption",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Encryption",
                table: "SiteOption");

            migrationBuilder.DropColumn(
                name: "SMTPHost",
                table: "SiteOption");

            migrationBuilder.DropColumn(
                name: "SMTPPassword",
                table: "SiteOption");

            migrationBuilder.DropColumn(
                name: "SMTPPort",
                table: "SiteOption");

            migrationBuilder.DropColumn(
                name: "SMTPUser",
                table: "SiteOption");
        }
    }
}
