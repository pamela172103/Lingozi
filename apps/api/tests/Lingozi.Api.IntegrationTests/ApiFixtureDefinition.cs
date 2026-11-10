namespace Lingozi.Api.IntegrationTests;

[CollectionDefinition(SqlServerApiFactory.CollectionName)]
public sealed class ApiFixtureDefinition : ICollectionFixture<SqlServerApiFactory>;
