using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class Fix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Families_Users_UserId",
                table: "Families");

            migrationBuilder.DropForeignKey(
                name: "FK_Families_Users_UserId1",
                table: "Families");

            migrationBuilder.DropIndex(
                name: "IX_Families_UserId1",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "Families");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "Families",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AddColumn<string>(
                name: "CreatorId",
                table: "Families",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Families_CreatorId",
                table: "Families",
                column: "CreatorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Families_Users_CreatorId",
                table: "Families",
                column: "CreatorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Families_Users_UserId",
                table: "Families",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Families_Users_CreatorId",
                table: "Families");

            migrationBuilder.DropForeignKey(
                name: "FK_Families_Users_UserId",
                table: "Families");

            migrationBuilder.DropIndex(
                name: "IX_Families_CreatorId",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "Families");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "Families",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId1",
                table: "Families",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Families_UserId1",
                table: "Families",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Families_Users_UserId",
                table: "Families",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Families_Users_UserId1",
                table: "Families",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
