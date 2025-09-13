# Body for register
```
{
  "login": "testuser",
  "password": "123456",
  "full_name": "Test User",
  "email": "5233crimson@mechanicspedia.com"
}
```
# Body for login
```
{
  "loginOrEmail": "5233crimson@mechanicspedia.com",
  "password": "123456"
}
```

# body for reset password
```
{
  "email": "5233crimson@mechanicspedia.com",
  "token": "6fda2892eb62ccd35a3631229e4698985fa3df8c92590a2150f49d70a85780dc",
  "newPassword": "12345678"
}
```

# mySQL requests
```
DELETE FROM ... WHERE ... = "";
SELECT * FROM ...;

DROP TABLE IF EXISTS likes, comments, post_categories, posts, categories, users, role_permissions, guest_sessions;
```
