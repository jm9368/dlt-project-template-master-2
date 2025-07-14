# Hyperledger Besu test node

This folder contains a dockerized Ethereum (Hyperledger Besu) node for development, testing and demos.

The node is already pre-configured. But, if you need to change anything, check the [genesis.json](./networkFiles/config/genesis.json) configuration file. Documentation: https://besu.hyperledger.org/public-networks/concepts/genesis-file

The node is setup in a way to allow gas-free transactions.

## Requirements

 - [Docker](https://www.docker.com/)
 - [Docker Compose](https://docs.docker.com/compose/)

## Running the node

In order to start the node, type:

```sh
docker-compose up
```

or:

```sh
docker compose up
```

## Using the node

The node has two listening interfaces, HTTP and WebSockets:

 - `http://localhost:8545`
 - `ws://localhost:8546`

The chain ID of this test node is **1337**.

The other components (smart contracts, web application) are configured by default to use this node.

## Stopping the node

In order to stop the node, type:

```sh
docker-compose down
```

or:

```sh
docker compose down
```

## Resetting the chain

If you want to reset the chain, stop the node and remove the `data` folder:

```sh
rm -rf data
```

Warning: This removes all the data stored by the node. 
