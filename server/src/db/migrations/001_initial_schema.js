exports.up = async function(knex) {
  // Users table
  await knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('name').notNullable();
    table.string('password').notNullable();
    table.enum('role', ['admin', 'user', 'engineer']).notNullable();
    table.string('region');
    table.timestamps(true, true);
  });

  // Projects table
  await knex.schema.createTable('projects', table => {
    table.increments('id').primary();
    table.text('description').notNullable();
    table.string('region').notNullable();
    table.string('msp').notNullable();
    table.string('partner').notNullable();
    table.enum('status', ['pending', 'in_progress', 'completed', 'on_hold'])
      .defaultTo('pending');
    table.string('engineer').references('email').inTable('users');
    table.string('created_by').references('email').inTable('users');
    table.string('updated_by').references('email').inTable('users');
    table.text('notes');
    table.timestamps(true, true);
  });

  // Provisioning logs table
  await knex.schema.createTable('provisioning_logs', table => {
    table.increments('id').primary();
    table.string('ticket_number').notNullable();
    table.text('reason').notNullable();
    table.integer('total_devices').notNullable();
    table.integer('processed_devices').defaultTo(0);
    table.integer('successful_devices').defaultTo(0);
    table.integer('failed_devices').defaultTo(0);
    table.string('created_by').references('email').inTable('users');
    table.timestamps(true, true);
  });

  // Provisioning results table
  await knex.schema.createTable('provisioning_results', table => {
    table.increments('id').primary();
    table.integer('log_id').references('id').inTable('provisioning_logs')
      .onDelete('CASCADE');
    table.string('serial_number').notNullable();
    table.string('ci_number').notNullable();
    table.boolean('success').notNullable();
    table.text('message');
    table.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('provisioning_results');
  await knex.schema.dropTableIfExists('provisioning_logs');
  await knex.schema.dropTableIfExists('projects');
  await knex.schema.dropTableIfExists('users');
}; 