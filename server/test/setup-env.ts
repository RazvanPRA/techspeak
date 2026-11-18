// e2e tests run the real AppModule; these values satisfy the env schema. Azure and the
// database are replaced by fakes in the tests, so nothing here is ever used for real.
process.env['API_KEY'] = 'e2e-test-api-key-123';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test';
process.env['AZURE_SPEECH_KEY'] = 'not-used';
process.env['AZURE_SPEECH_REGION'] = 'westeurope';
