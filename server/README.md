### Structure of ENV file

```bash
PORT=
MONGO_URI=
DB_NAME=
JWT_SECRET=
GEMINI_API_KEY=

# these are for sending emails for resetting password
EMAIL_USER=
EMAIL_PASSWORD=

FLASK_BASE_URL=
FRONTEND_URL=
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

#### /api/roadmap

- GET /get

This endpoint is used to get all the roadmaps of the user.

- POST /generate-roamap

```
{
    "topic": "topic",
}
```

This endpoint is used to generate a new roadmap.

- POST /update-checkpoint-status

```
{
    "roadmapId": "roadmapId",
    "checkpointId": "checkpointId",
    "status": "status"
}
```
