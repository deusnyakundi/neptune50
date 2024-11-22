CREATE DATABASE provisioning_db;

\c provisioning_db

CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    first_login BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE engineers (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) REFERENCES users(email),
    region VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_data (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    ci_number VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    region VARCHAR(100) NOT NULL,
    assigned_engineer VARCHAR(255) REFERENCES users(email),
    msp VARCHAR(255),
    partner VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_by VARCHAR(255) REFERENCES users(email),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE provisioning_logs (
    id SERIAL PRIMARY KEY,
    crq_number VARCHAR(100),
    inc_number VARCHAR(100),
    reason TEXT NOT NULL,
    initiator VARCHAR(255) REFERENCES users(email),
    status VARCHAR(50),
    response_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE provisioning_details (
    id SERIAL PRIMARY KEY,
    log_id INTEGER REFERENCES provisioning_logs(id),
    serial_number VARCHAR(100),
    ci_number VARCHAR(100),
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 