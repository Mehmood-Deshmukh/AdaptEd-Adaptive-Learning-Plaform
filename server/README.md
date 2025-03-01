### Structure of ENV file
```bash
PORT=
MONGO_URI=
JWT_SECRET=

# these are for sending emails for resetting password
EMAIL_USER=
EMAIL_PASSWORD=
```

### Endpoints

#### /api/users

- POST /register
```
{
    "username": "username",
    "email": "email",
    "password": "password"
}
```
This endpoint is used to register a new user.

- POST /login
```
{
    "email": "email",
    "password": "password"
}
```
This endpoint is used to login a user.

- POST /forgot-password
```
{
    "email": "email"
}
```
This endpoint is used to send an email to the user with a token to reset the password.

- POST /reset-password
```
{
    "email": "email",
    "token": "token",
    "password": "password",
}
```
This endpoint is used to reset the password of the user.




