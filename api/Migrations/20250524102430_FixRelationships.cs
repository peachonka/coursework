using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class FixRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Families",
                newName: "UserId");

            migrationBuilder.AddColumn<string>(
                name: "UserId1",
                table: "Families",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_FamilyMemberId",
                table: "Incomes",
                column: "FamilyMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Families_UserId",
                table: "Families",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Families_UserId1",
                table: "Families",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_FamilyMemberId",
                table: "Expenses",
                column: "FamilyMemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_FamilyMembers_FamilyMemberId",
                table: "Expenses",
                column: "FamilyMemberId",
                principalTable: "FamilyMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Incomes_FamilyMembers_FamilyMemberId",
                table: "Incomes",
                column: "FamilyMemberId",
                principalTable: "FamilyMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_FamilyMembers_FamilyMemberId",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Families_Users_UserId",
                table: "Families");

            migrationBuilder.DropForeignKey(
                name: "FK_Families_Users_UserId1",
                table: "Families");

            migrationBuilder.DropForeignKey(
                name: "FK_Incomes_FamilyMembers_FamilyMemberId",
                table: "Incomes");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Incomes_FamilyMemberId",
                table: "Incomes");

            migrationBuilder.DropIndex(
                name: "IX_Families_UserId",
                table: "Families");

            migrationBuilder.DropIndex(
                name: "IX_Families_UserId1",
                table: "Families");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_FamilyMemberId",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "Families");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Families",
                newName: "Name");
        }
    }
}
