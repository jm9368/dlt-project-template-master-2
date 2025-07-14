# Smart contracts

This folder contains the smart contracts project.

This project uses [Truffle](https://trufflesuite.com/) as a framework to compile, test and deploy the smart contracts.

## Requirements

 - [NodeJS](https://nodejs.org/) - Last stable version

## Installation

In order to install truffle and all its dependencies, run:

```sh
npm install
```

## Private key generation

The first step after installation is to generate some private keys for deployment ad testing.

In order to do this, type:

```sh
npm run gen-keys
```

This will generate 10 random private keys and store them in the `key` file, which is git-ignored.

You can replace the keys by your own by modifying the `key` file.

The most important private key is the first one, which is used to deploy the smart contracts.

## Configuration

In order to configure the project, copy the file `.env.example` into `.env`.

```sh
cp .env.example .env
```

Open the `.env` file with an editor and modify the appropriate environment variables.

For development, you can use the default configuration.

Compiler configuration:

| Variable name  | Description                              |
| -------------- | ---------------------------------------- |
| `SOLC_VERSION` | Version of the Solidity compiler to use. |

Development network configuration:

| Variable name           | Description                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `DEV_NETWORK_PROTOCOL`  | Protocol to connect to the node via JSON-RPC                                                                          |
| `DEV_NETWORK_HOST`      | Host for the development network.                                                                                     |
| `DEV_NETWORK_PORT`      | Port for the JSON-RPC interface for the development network.                                                          |
| `DEV_NETWORK_ID`        | Network / Chain ID of the development network. You can use `*` if you prefer to fetch it from the JSON-RPC interface. |
| `DEV_NETWORK_GAS_PRICE` | Gas price to use for the development network. In Wei.                                                                 |

Production network configuration:

| Variable name            | Description                                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `PROD_NETWORK_PROTOCOL`  | Protocol to connect to the node via JSON-RPC                                                                         |
| `PROD_NETWORK_HOST`      | Host for the production network.                                                                                     |
| `PROD_NETWORK_PORT`      | Port for the JSON-RPC interface for the production network.                                                          |
| `PROD_NETWORK_ID`        | Network / Chain ID of the production network. You can use `*` if you prefer to fetch it from the JSON-RPC interface. |
| `PROD_NETWORK_GAS_PRICE` | Gas price to use for the production network. In Wei.                                                                 |

## Compiling the smart contracts

The smart contracts are located in the [contracts][./contracts] folder, as `.sol` files.

In this template there is some example contracts token from [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts).

The programming language used for the smart contracts is [Solidity](https://docs.soliditylang.org/en/v0.8.23/). Make sure to check the documentation before starting.

In order to compile the smart contracts simply run:

```sh
npm run build
```

Truffle will compile the contracts and generate the compiled artifacts in the `build` folder.

## Generating contract wrappers

Once your contracts are compiled, you can generate Typescript wrappers, in order to interact with the smart contracts from the web application.

In order to generate those wrappers, we use the [smart-contract-wrapper](https://github.com/AgustinSRG/smart-contract-wrapper) library.

In order to generate a wrapper for a contract, run the following command:

```sh
node generate-contract-wrapper ContractName
```

This script will generate a wrapper in the `wrappers` folder. You can copy this wrapper into your web application backend codebase in order to use it.

## Deploying

In order to deploy the smart contracts, you have to modify the [2_deploy_contracts.js](./migrations/2_deploy_contracts.js) script in the migrations folder in order to match your smart contracts.

If you didn't make any changes to the contracts and just want to deploy the smart contracts, no modification of the deployment script is needed.

Read the [official documentation](https://trufflesuite.com/docs/truffle/how-to/contracts/run-migrations/) provided by Truffle about this topic for more information.

Once is setup, you can deploy the smart contracts to the development network:

```sh
npm run deploy:dev
```

or into the production network:

```sh
npm run deploy:prod
```

Truffle will give you the addresses of the deployed contracts along with some extra information via the console output.

## Testing

All the unit tests of the smart contracts are stored into the [test](./test/) folder.

In order to know how to write the tests, read the [official documentation](https://trufflesuite.com/docs/truffle/how-to/debug-test/write-tests-in-javascript/) provided by Truffle.

In order to run the test, type:

```
npm test
```

This will run the test in the development network. Make sure it's UP and running before you run the tests.
