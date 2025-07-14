# Project template

This is a project template meant to be used to accelerate the initial setup and development steps of a new project.

In order to use this template, download it as zip and put it into a new repository, then start developing using the provided components or adding new ones.

## Components

This template has the basic components of a DLT project, with some example code and documentation in form of README files.

### Hyperledger Besu test node

You can find a dockerized test Ethereum (Hyperledger Besu) node in the [besu-test-node](./besu-test-node/) folder.

This node is meant to be used for development, tests and basic demos. It is a pre-configured node for smart contracts to be deployed and tested.

### Smart contracts

Any smart contracts the project requires should be placed in the [smart-contracts](./smart-contracts/) folder.

The smart contracts are compiled and deployed using the [Truffle](https://trufflesuite.com/) framework.

### Web application

The web application project is located in the [web-application](./web-application/) folder.

The web application uses a [NodeJS](https://nodejs.org/en) backend and a [Vue.js](https://vuejs.org/) frontend.

### Mobile application

The mobile application project is located in the [mobile-application](./mobile-application/) folder.

The mobile application uses [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/) in order to use the same codebase for both Android and IOS.

### Deployment scripts

You can find deployment scripts in the [deployment-scripts](./deployment-scripts/) folder.

This includes scripts to deploy the web application on a Linux server and CI/CD scripts.
