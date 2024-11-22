const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Clean the tables
  await knex('provisioning_results').del();
  await knex('provisioning_logs').del();
  await knex('projects').del();
  await knex('users').del();

  // Insert admin user
  const adminPassword = await bcrypt.hash('Admin123!@#', 10);
  await knex('users').insert({
    email: 'admin@safaricom.co.ke',
    name: 'System Admin',
    password: adminPassword,
    role: 'admin',
  });

  // Insert test engineer
  const engineerPassword = await bcrypt.hash('Engineer123!@#', 10);
  await knex('users').insert({
    email: 'engineer@safaricom.co.ke',
    name: 'Test Engineer',
    password: engineerPassword,
    role: 'engineer',
    region: 'NAIROBI EAST',
  });

  // Insert test user
  const userPassword = await bcrypt.hash('User123!@#', 10);
  await knex('users').insert({
    email: 'user@safaricom.co.ke',
    name: 'Test User',
    password: userPassword,
    role: 'user',
  });

  // Insert test projects
  await knex('projects').insert([
    {
      description: 'Test Project 1',
      region: 'NAIROBI EAST',
      msp: 'MSP 1',
      partner: 'Partner 1',
      status: 'pending',
      created_by: 'admin@safaricom.co.ke',
    },
    {
      description: 'Test Project 2',
      region: 'NAIROBI WEST',
      msp: 'MSP 2',
      partner: 'Partner 2',
      status: 'in_progress',
      engineer: 'engineer@safaricom.co.ke',
      created_by: 'user@safaricom.co.ke',
    },
  ]);
}; 