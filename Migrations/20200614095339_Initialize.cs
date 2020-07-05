using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace blog.Migrations
{
    public partial class Initialize : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Category",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CategoryName = table.Column<string>(nullable: false),
                    SequenceNumber = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Category", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PublishedPost",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    PostTitle = table.Column<string>(nullable: false),
                    PostFirstLine = table.Column<string>(nullable: true),
                    PostContent = table.Column<string>(nullable: false),
                    PostAuthor = table.Column<string>(nullable: true),
                    PostCategory = table.Column<string>(nullable: false),
                    IsDraft = table.Column<bool>(nullable: false),
                    PublishedTime = table.Column<DateTime>(nullable: false),
                    ModifiedTime = table.Column<DateTime>(nullable: false),
                    DisplayDate = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublishedPost", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SiteOption",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    SiteTitle = table.Column<string>(nullable: false),
                    SiteTagline = table.Column<string>(nullable: false),
                    SiteIcon = table.Column<string>(nullable: true),
                    HeaderImage = table.Column<string>(nullable: true),
                    SiteFooter = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteOption", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Category");

            migrationBuilder.DropTable(
                name: "PublishedPost");

            migrationBuilder.DropTable(
                name: "SiteOption");
        }
    }
}
