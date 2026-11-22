INSERT INTO management_users
(organization_id, role_id, username, password_hash, enabled, created_at, updated_at)
SELECT NULL, id, 'platform-admin',
       '$2y$10$E/Qaay8upXkzOQivswrx.i9qy/DkClipmBCfZZpLIDCo.SZnNybO',
       TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM roles WHERE name = 'PLATFORM_ADMIN';

INSERT INTO management_users
(organization_id, role_id, username, password_hash, enabled, created_at, updated_at)
SELECT NULL, id, 'gateway-service',
       '$2y$10$kqkpKYK3zLNzLV54ObZbee68JvjRjy79J6kATSfD0grUXKDd6jxOO',
       TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM roles WHERE name = 'GATEWAY_SERVICE';
