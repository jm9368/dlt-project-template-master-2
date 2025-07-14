# Development guide

This document is an index of development documentation files found in the [documentation](./documentation/) folder.

Read this guide to get familiar with the backend codebase.

## Database models

Database models are located in the [src/models](./src/models/) folder. They represent the different databases or collection of the main database.

[Read the full document](./documentation/models.md)

## Controllers

Controllers are classes used to handle requests from the clients. They are located in the [src/controllers](./src/controllers/) folder.

[Read the full document](./documentation/controllers.md)

## Configuration

Configuration provider classes are used lo load the configuration from the process environment variables, do the appropriate parsing and make the configuration values accesible for the rest of the codebase.

The are placed in the [src/config](./src/config/) folder.

[Read the full document](./documentation/config.md)

## Services

Services are Singleton classes encapsulating reusable code. They are used by the controllers to perform complex tasks, like file storage, sending mails or making requests to third party services without adding the logic inside the controller class.

The are placed in the [src/services](./src/services/) folder.

[Read the full document](./documentation/services.md)

## Utilities

Utility functions, algorithms or other misc code must be placed in the [src/utils](./src/utils/) folder.

## Tests

Tests are scripts that run to ensure the backend codebase works as intended.

Tests are located in the [test/mocha](./test/mocha/) folder.

[Read the full document](./documentation/tests.md)
