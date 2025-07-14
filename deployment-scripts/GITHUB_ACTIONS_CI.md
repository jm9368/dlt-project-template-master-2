# Setup GitHub actions auto-deployment

This guide contains all the necessary steps in order to setup an auto deployment workflow with GitHub Actions.

## Deploy the application into a server

The first step is deploying the application manually into a server.

 - Ensure all requirements are installed (MongoDB, Docker, NodeJS, FFmpeg, etc.)
 - Ensure NodeJS can bind to port 80 and 443: `sudo setcap 'cap_net_bind_service=+ep' /usr/bin/node`
 - Setup a deployment key to be able to clone and update the repository
 - Clone and configure the application to run.
 - Setup a `systemd` service to run the application.
 - Setup HTTPs with `certbot`
 - Setup a runner for GitHub Actions in the server
 - Setup the GitHub Actions workflow to auto-deploy changes to the server when a push is detected on `develop` branch.

### Setup deployment key

First, generate a new key with `shh-keygen`:

```sh
ssh-keygen -t ed25519 -C "example@air-institute.com"
```

Give it a name, for example, `deploy_key` and save it.

Print the public key, and copy it:

```sh
cat .ssh/deploy_key.pub
```

Go to the GitHub repository, **Settings** -> **Security** -> **Deploy Keys** -> **Add deploy key**.

Give the key a title, and paste the public key into the `Key` field. Do not mark `Allow write access` as it is not necessary.

Then, go back to the server, and modify the `~/.ssh/config` file:

```sh
pico ~/.ssh/config
```

Add the following configuration in order to use the key:

```conf
Host github.com-project
        Hostname github.com
        IdentityFile=/home/user/.ssh/deploy_key
```

Save the file and close the editor.

Then, clone the repository with `shh`, replacing `github.com` with `github.com-project`, and `dlt-project-template` with the name of the repository.

```sh
git clone git@github.com-project:AIRInstitute/dlt-project-template.git
```

For more details, check the [official documentation provided by GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys)

### Setup systemd service

In order to setup a `systemd` service for the project, create a new service file in `/etc/systemd/system`:

```sh
sudo pico /etc/systemd/system/project.service
```

Copy the following contents into the file, replacing the paths if they are different:

```conf
[Unit]
Description=Application service
After=network.target auditd.service

[Service]
Type=simple
ExecStart=/usr/bin/npm start
User=bisite
Group=bisite
WorkingDirectory=/home/bisite/project/web-application/backend
Environment=NODE_ENV=production
LimitNOFILE=infinity
LimitCORE=infinity
KillMode=control-group
StandardInput=null
StandardOutput=syslog
StandardError=syslog
Restart=always

[Install]
WantedBy=multi-user.target
```

Save the file and close the editor.

Then, enable and start the service (make sure you configure the server before starting it):

```sh
sudo systemctl enable project
sudo systemctl start project
```

### Setup HTTPS with certbot

In order to configure HTTPS with certbot, make sure the server has the appropriate configuration (`.env`):

```conf
SERVE_ACME_CHALLENGE=YES
ACME_CHALLENGE_PATH=/var/www/certbot/.well-known/acme-challenge/
```

Then, install `certbot`:

```sh
sudo apt install certbot
```

Create the directory for certbot to store the challenge results:

```sh
sudo mkdir -p /var/www/certbot
```

Then, run the command to issue a new certificate:

```sh
sudo certbot certonly --webroot -w /var/www/certbot --email example@air-institute.com -d project.air-institute.com --agree-tos
```

After than, ensure the server will be able to read the certificates:

```sh
sudo chmod -R 755 /etc/letsencrypt/
```

And, configure the server to use the certificates by adding into the `.env` file:

```conf
SERVER_HTTPS_PORT=443
SERVER_HTTPS_CERTIFICATE=/etc/letsencrypt/live/example.air-institute.com/fullchain.pem
SERVER_HTTPS_KEY=/etc/letsencrypt/live/example.air-institute.com/privkey.pem
SERVER_REDIRECT_SECURE=YES
```

And, restart the server:

```sh
sudo systemctl restart project
```

Also, if you want to setup `certbot` to automatically renew the certificate, create a new systemd service for that:

```sh
sudo pico /etc/systemd/system/auto-certbot.service
```

Copy the following contents:

```conf
[Unit]
Description=Automated certbot renewal service
After=network.target auditd.service

[Service]
Type=simple
ExecStart=/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'
User=root
Group=root
LimitNOFILE=infinity
LimitCORE=infinity
KillMode=process
StandardInput=null
StandardOutput=syslog
StandardError=syslog
Restart=always

[Install]
WantedBy=multi-user.target
```

Save the file and close the editor. Then, enable and start the service:

```sh
sudo systemctl enable auto-certbot
sudo systemctl start auto-certbot
```

### Setup a runner for GitHub Actions in the server

In the GitHub repository, go to **Settings** -> **Actions** -> **Runners** -> **New self-hosted runner**

Select **Linux** and follow the provided instructions.

After it's configured, the runner must be set to run as a systemd service, so it's always running, even when the mahcine restarts.

In order to do that, create a new service file in `/etc/systemd/system`:


```sh
sudo pico /etc/systemd/system/github-runner.service
```

Copy the following contents into the file, replacing the paths if they are different:

```conf
[Unit]
Description=GitHub Runner
After=network.target auditd.service

[Service]
Type=simple
ExecStart=/home/bisite/actions-runner/run.sh
User=bisite
Group=bisite
WorkingDirectory=/home/bisite/actions-runner/
LimitNOFILE=infinity
LimitCORE=infinity
KillMode=control-group
StandardInput=null
StandardOutput=syslog
StandardError=syslog
Restart=always

[Install]
WantedBy=multi-user.target
```

Then, enable and start the service

```sh
sudo systemctl enable github-runner
sudo systemctl start github-runner
```

### Setup the GitHub Actions workflow to auto-deploy

Create workflow file inside the `.github/workflows` folder of your repository, with a content similar to this:

```yml
name: Auto deployment of develop branch

on:
  push:
    branches: [ "develop" ]
jobs:
  deploy:
    runs-on: [self-hosted]

    steps:
    - name: Update local git repository
      working-directory: /home/bisite/project
      run: git add --all && git reset --hard && git checkout origin/develop && git pull origin develop

    - name: Build backend
      working-directory: /home/bisite/project/web-application/backend
      run: npm install && npm run build && npm run setup-mongo

    - name: Build frontend
      working-directory: /home/bisite/project/web-application/frontend
      run: npm install && npm run build

    - name: Restart service
      run: sudo systemctl restart project
```

Replace `project` for the actual project name.
