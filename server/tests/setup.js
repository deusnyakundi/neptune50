const knex = require('../src/db');
const redis = require('../src/utils/redis');

beforeAll(async () => {
  // Run migrations
  await knex.migrate.latest();
});

afterAll(async () => {
  // Clean up
  await knex.destroy();
  await redis.quit();
});

beforeEach(async () => {
  // Run seeds before each test
  await knex.seed.run();
}); 