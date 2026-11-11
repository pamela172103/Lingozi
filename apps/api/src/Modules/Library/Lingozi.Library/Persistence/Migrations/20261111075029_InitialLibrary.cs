using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lingozi.Library.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialLibrary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "library");

            migrationBuilder.CreateTable(
                name: "KnowledgeItems",
                schema: "library",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Kind = table.Column<byte>(type: "tinyint", nullable: false),
                    Term = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    NormalizedTerm = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    NormalizedTermHash = table.Column<byte[]>(type: "varbinary(32)", nullable: false, computedColumnSql: "CONVERT(varbinary(32), HASHBYTES('SHA2_256', [NormalizedTerm]))", stored: true),
                    Meaning = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Formula = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PartOfSpeech = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Ipa = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IpaSource = table.Column<byte>(type: "tinyint", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    SearchText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClientRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2(3)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2(3)", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KnowledgeItems", x => x.Id);
                    table.UniqueConstraint("AK_KnowledgeItems_Id_UserId", x => new { x.Id, x.UserId });
                    table.CheckConstraint("CK_KnowledgeItems_FieldsByKind", "([Kind] = 1 AND [Meaning] IS NOT NULL AND [Formula] IS NULL) OR ([Kind] = 5 AND [Formula] IS NOT NULL AND [PartOfSpeech] IS NULL AND [Ipa] IS NULL)");
                    table.CheckConstraint("CK_KnowledgeItems_IpaSource", "[IpaSource] IS NULL OR [IpaSource] IN (1, 2)");
                    table.CheckConstraint("CK_KnowledgeItems_IpaSource_Ipa", "([Ipa] IS NULL AND [IpaSource] IS NULL) OR ([Ipa] IS NOT NULL AND [IpaSource] IS NOT NULL)");
                    table.CheckConstraint("CK_KnowledgeItems_Kind", "[Kind] IN (1, 5)");
                });

            migrationBuilder.CreateTable(
                name: "ItemExamples",
                schema: "library",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Translation = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SortOrder = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemExamples", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemExamples_KnowledgeItems_ItemId_UserId",
                        columns: x => new { x.ItemId, x.UserId },
                        principalSchema: "library",
                        principalTable: "KnowledgeItems",
                        principalColumns: new[] { "Id", "UserId" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItemExamples_ItemId_SortOrder",
                schema: "library",
                table: "ItemExamples",
                columns: new[] { "ItemId", "SortOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemExamples_ItemId_UserId",
                schema: "library",
                table: "ItemExamples",
                columns: new[] { "ItemId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeItems_UserId_ClientRequestId",
                schema: "library",
                table: "KnowledgeItems",
                columns: new[] { "UserId", "ClientRequestId" },
                unique: true,
                filter: "[ClientRequestId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeItems_UserId_CreatedAt",
                schema: "library",
                table: "KnowledgeItems",
                columns: new[] { "UserId", "CreatedAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeItems_UserId_Kind_CreatedAt",
                schema: "library",
                table: "KnowledgeItems",
                columns: new[] { "UserId", "Kind", "CreatedAt" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeItems_UserId_Kind_NormalizedTermHash",
                schema: "library",
                table: "KnowledgeItems",
                columns: new[] { "UserId", "Kind", "NormalizedTermHash" });

            // Users belongs to the Accounts DbContext, so EF cannot model this key (ERD §1, §3.2). NO ACTION: deleting a user
            // must first delete their items on purpose (data-deletion flow, FEAT-01).
            migrationBuilder.Sql(
                "ALTER TABLE [library].[KnowledgeItems] ADD CONSTRAINT [FK_KnowledgeItems_Users_UserId] " +
                "FOREIGN KEY ([UserId]) REFERENCES [accounts].[Users] ([Id]) ON DELETE NO ACTION;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ItemExamples",
                schema: "library");

            migrationBuilder.DropTable(
                name: "KnowledgeItems",
                schema: "library");
        }
    }
}
