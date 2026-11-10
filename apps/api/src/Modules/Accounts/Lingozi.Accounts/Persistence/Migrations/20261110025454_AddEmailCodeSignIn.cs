using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lingozi.Accounts.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailCodeSignIn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmailLoginCodes",
                schema: "accounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CodeHmac = table.Column<byte[]>(type: "varbinary(32)", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2(3)", nullable: false),
                    Attempts = table.Column<byte>(type: "tinyint", nullable: false),
                    ConsumedAt = table.Column<DateTime>(type: "datetime2(3)", nullable: true),
                    InvalidatedAt = table.Column<DateTime>(type: "datetime2(3)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2(3)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailLoginCodes", x => x.Id);
                    table.CheckConstraint("CK_EmailLoginCodes_Attempts", "[Attempts] <= 5");
                });

            migrationBuilder.CreateTable(
                name: "EmailOutbox",
                schema: "accounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<byte>(type: "tinyint", nullable: false),
                    ToAddress = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PayloadJson = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Status = table.Column<byte>(type: "tinyint", nullable: false),
                    Attempts = table.Column<byte>(type: "tinyint", nullable: false),
                    NextAttemptAt = table.Column<DateTime>(type: "datetime2(3)", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2(3)", nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2(3)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailOutbox", x => x.Id);
                    table.CheckConstraint("CK_EmailOutbox_Attempts", "[Attempts] <= 5");
                    table.CheckConstraint("CK_EmailOutbox_PayloadJson", "ISJSON([PayloadJson]) = 1");
                    table.CheckConstraint("CK_EmailOutbox_Status", "[Status] IN (0, 1, 2)");
                    table.CheckConstraint("CK_EmailOutbox_Type", "[Type] = 3");
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmailLoginCodes_Email_CreatedAt",
                schema: "accounts",
                table: "EmailLoginCodes",
                columns: new[] { "Email", "CreatedAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_EmailOutbox_Status_NextAttemptAt",
                schema: "accounts",
                table: "EmailOutbox",
                columns: new[] { "Status", "NextAttemptAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailLoginCodes",
                schema: "accounts");

            migrationBuilder.DropTable(
                name: "EmailOutbox",
                schema: "accounts");
        }
    }
}
