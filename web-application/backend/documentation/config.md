# Configuration providers

Configuration provider classes are used lo load the configuration from the process environment variables, do the appropriate parsing and make the configuration values accesible for the rest of the codebase.

The are placed in the [src/config](../src/config/) folder.

Configuration provider classes use the `Singleton` pattern, doing the fetching and parsing a single time, while keeping the values for future usages.

Here is an example of a configuration provider class:


```ts
// Reserved for license

"use strict";

/**
 * Example configuration
 */
export class ExampleConfig {

    /**
     * Gets the configuration instance.
     */
    public static getInstance(): ExampleConfig {
        if (ExampleConfig.instance) {
            return ExampleConfig.instance;
        }

        const config: ExampleConfig = new ExampleConfig();

        config.booleanValue = process.env.EXAMPLE_BOOL === "YES";
        config.stringValue = process.env.EXAMPLE_STRING || "";
        config.numericValue = Number(process.env.EXAMPLE_NUMBER) || 0;
        
        ExampleConfig.instance = config;

        return config;
    }
    private static instance: ExampleConfig = null;

    public booleanValue: boolean;
    public stringValue: string;
    public numericValue: number;

    constructor() {
        this.booleanValue = false;
        this.stringValue = "";
        this.numericValue = 0;
    }
}
```

You can then access the configuration from any part of the codebase:

```ts
const exampleString = ExampleConfig.getInstance().stringValue;
```

## Documentation

When adding new configuration values, make sure to update the [configuration reference](../CONFIG.md) and also the [example configuration file](../.env.example).
