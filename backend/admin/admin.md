admin user creating:

```
mysql -u mkopychko -p securepass USOF -e "
INSERT INTO users (login, password, full_name, email, role, email_verified, rating, created_at, updated_at) 
VALUES (
    'admin', 
    '\$2b\$12\$LQv3c1yqBWVHxkd0LQ1lV.e.gj7d5T5n4H1mF4qF3L5nF4qF3L5n',
    'Системний адміністратор',
    'admin@thedevnexus.com',
    'admin',
    1,
    0,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    role = VALUES(role);
"
```

cheking if user created:

```
mysql -u mkopychko -p securepass USOF -e "SELECT id, login, email, role FROM users WHERE role = 'admin';"
```