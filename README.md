This project contains a boiler plate implementation for stateless JWT Authentication. The client side is React, server side is Node, and database is Postgres. This projects build scripts are staged to be deployed to digital oceans app platform.

I used Mailerlite/Mailersend for handling password resets and a subscription list. Google ReCaptcha on the front end for captcha's.

User Workflow:

Users can create accounts with this site providing a username, e-mail, and password. They are required to verify their e-mail through Mailersend. There is a self service portal for updating e-mails, resetting passwords, or deleting accounts.

Authentication Workflow:

Upon registration/login users are issued a short lived access token and a long lived refresh token as secure cookies. The access token is used for protecting resources and the refresh token is used to keep users logged in for longer durations of time. The access and refresh tokens can be configured with flexible expiry times.

Routes are protected with custom middleware called "AuthenticateJWT". This function will validate if the users Access Token can be verified. If the Access Token is expired or missing, we check to see if the user has a refresh token. If they do not pass any of these checks, we log the user out, otherwise we send a response back to the client letting it know a new access token is needed. The client will then issue an auth/check to a separate route where the Refresh Token is validated, recycled, and a new access token is issued. Once a new access token is issued to the client, it will re-make the original request to the protected route. Users with valid access tokens can pass through protected routes as needed.

All routes are protected by strict validation as well as a rate limiter as fall back protecting for denial of service attacks.

To stage this project you must do the following:

1. Install Postgres and run the model.sql file in the database folder of this project.
2. Register accounts with mailerlite, mailersend, google recaptcha.
3. Clone project and install dependencies
4. A client side .env file is needed with the following:
REACT_APP_RECAPTCHA_SITE_KEY=
5. A server side .env file is needed with the following:
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ID_TOKEN_SECRET=
MAILERLITE_API_KEY=
MAILERSEND_API_KEY=
RECAPTCHA_SECRET_KEY=
FORGOT_PASSWORD_TEMPLATEID=
VERIFY_EMAIL_TEMPLATEID=
SENDER_EMAIL_DOMAIN=
SENDER_EMAIL_NAME
SENDER_EMAIL_SUPPORT=
SITE_DOMAIN=
DB_USER=
DB_HOST=
DB_NAME=
DB_PASSWORD=
DB_PORT=
6. Secrets can be generated using a crypto library from npm.
7. Run "npm run startdev" for development mode.
8. Build scripts are set up for digital oceans app platform.