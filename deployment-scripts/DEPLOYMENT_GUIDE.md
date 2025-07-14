# Deployment guide

This document is a guide to deploy the web application in a Linux server.

## Installations

Before anything, you must install the project dependencies and the required tools, like:

 - Git (`sudo apt install git`).
 - [NodeJS](https://nodejs.org/en/download/package-manager)
 - [Docker](https://docs.docker.com/engine/install/ubuntu/)
 - Other dependencies, depending on the project.

Note: make sure to allow NodeJS to bind on port `80` and `443` using the following command:

```sh
sudo setcap 'cap_net_bind_service=+ep' `which node`
```

## Setup a deploy key

The first step to deploy the application, is to setup a deploy key and configuring both the server and GitHub in order to be able to:

 - Clone the repository
 - Update the server with the repository changes

Follow these steps in order to create and configure a deploy key:

### 1. Create a SSH key

In the server, run the following:

```sh
cd .ssh
ssh-keygen -t ed25519 -C "project@air-institute.com"
```

Name the key `deploy_key` and set no passphrase.

### 2. Configure SSH to use the key

Edit the `~/.ssh/config` file (eg: `nano ~/.ssh/config`). Add the following, changing the key path to the corresponding ones for the project:

```conf
Host github.com-app
        Hostname github.com
        IdentityFile=/home/bisite/.ssh/deploy_key
```

### 3. Configure GitHub to allow the key

Go to the GitHub repository to the Settings -> Deploy Keys section. Create a new deploy key, and paste the content of `deploy_key.pub`

```sh
cat ~/.ssh/deploy_key.pub
```

## Clone the repository

Clone the repository using an SSH URI, adding `-app` to the domain to match the SSH custom configuration we set before:

```sh
git clone git@github.com-app:AIRInstitute/project.git
```

## Set up the project

Follow the instructions on the `README.md` files to:

 - Install dependencies
 - Configure both the backend and the frontend
 - Build both the backend and the frontend

## Setup a service with systemd

Create a `.service` file in `/etc/systemd/system` with a service file similar to this:

```sh
sudo nano /etc/systemd/system/project.service
```

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

Change the service configuration depending on the project.

After the file is saved, enable and start the service:

```sh
sudo systemctl enable app
sudo systemctl start app
```

After you start the service, you can check the logs with `journalctl -u project` or with Kibana, if you configured the logging system cia Elastic Search.
