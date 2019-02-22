## Installation
```
npm i
```

## Run
```
npm start
```
Then the app is listening on port 5000

## Deployment
```
Add another location block in /etc/nginx/sites-available/default

...
 location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }

       location /screenshots {
                proxy_pass http://localhost:5000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
       }
...

```
Nginx will forward incoming traffic pointing to url '/screenshots' to your app /screenshots route