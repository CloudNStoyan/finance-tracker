# Finance Tracker

Clone the repository and create the necessary .env files as shown below.

Template for app.env
```env
# Things you need to configure
DatabaseConnectionString=Server=YourDatabaseIp;Port=DatabasePort;Database=DatabaseName;Uid=DatabaseUser;Pwd=DatabasePassword;
ReCaptchaSecretKey=YourGoogleReCaptchaKey

# These here you don't change (they are configured in mind of nginx.conf)
Kestrel__Endpoints__Https__Url=http://+:5005
ASPNETCORE_URLS=http://+:5005
```

Template for postgres.env
```env
POSTGRES_USER=postgresUser
POSTGRES_PASSWORD=postgresPassword
POSTGRES_DB=dbName

# These here you don't change (they are configured in mind of docker-compose.yml volumes)
PGDATA=/var/lib/postgresql/data/pgdata
```

Template for .env
```env
Recaptcha_Site_Key=YourRecaptchaSiteKey
App_Port=ThePortOfTheApp
```