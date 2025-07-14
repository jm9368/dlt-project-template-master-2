# Database models

Database models are located in the [src/models](../src/models/) folder. They represent the different databases or collection of the main database.

 - The database models uses the ORM (Object Relational Mapping) pattern.
 - The library used for the mapping is [tsbean-orm](https://github.com/AgustinSRG/tsbean-orm).
 - A database model must be a class that extends `DataModel` from `tsbean-orm`.
 - A file must contain a single model class.
 - The fields of the class must be public, and be formatted in [camelCase](https://en.wikipedia.org/wiki/Camel_case).

## Creating model classes

When creating a models class, you can create it from scratch my following the [library documentation](https://github.com/AgustinSRG/tsbean-orm?tab=readme-ov-file#data-models), or you can generate it.

In order to generate a model class, follow these steps:

 1. Create your model using [dbdiagram.io](https://dbdiagram.io/home)
 2. Export the model to MySQL format.
 3. Use the [tsbean-orm-generator](https://agustinsrg.github.io/tsbean-codegen/) to generate the model classes from the MySQL code.
 4. Copy each class to a file in the [src/models](../src/models/) folder.

## Using the models

All the documentation about using the ORM library can be found inside the [library documentation](https://github.com/AgustinSRG/tsbean-orm?tab=readme-ov-file#data-models), make sure to read it to get familiar with model classes.

## Database script generation

This project contains a script to generate database setup scripts for MongoDB, MySQL and Postgres.

In order to update the scripts, run the following command:

```sh
npm run update-db-scripts
```

You can add annotations as comments in order for the tool to be able to generate the scripts properly. 

Annotations have the following format:

```ts
/* annotation: parameter */
```

In the following sub-sections we go into detail for each of them.

### Annotation: db-ignore

Use the `db-ignore` annotation in order to stop the generation script from parsing.

This can be used when:

 - You add a non-database model class in the `models` folder. For that case, place the annotation at the top of the file.
 - You add auxiliar classes under a database model class.

Examples:

```ts
/* db-ignore */

"use strict";

export class NonDatabaseModel {
    // ...
}
```

```ts
import { DataModel } from "tsbean-orm";

"use strict";

export class DatabaseModel extends DataModel {
    // ...
}

/* db-ignore */

export class NonDatabaseModel {
    // ...
}
```

### Annotation: db-table

By default, the tool will infer the table name from a constant named `TABLE` expected in the file.

```ts
import { DataModel } from "tsbean-orm";

"use strict";

const TABLE = "database_table";

export class DatabaseModel extends DataModel {
    // ...
}
```

If you do not define such constant, you must use the `db-table` annotation:

```ts
import { DataModel } from "tsbean-orm";

"use strict";

/* db-table: database_table */

export class DatabaseModel extends DataModel {
    // ...
}
```

### Annotation: db-primary-key

By default, the tool will infer the primary key name from a constant named `PRIMARY_KEY` expected in the file.

```ts
import { DataModel } from "tsbean-orm";

"use strict";

const TABLE = "database_table";
const PRIMARY_KEY = "id";

export class DatabaseModel extends DataModel {
    // ...
}
```

If you do not define such constant, you must use the `db-primary-key` annotation on top of the field that is the primary key:

```ts
import { DataModel } from "tsbean-orm";

"use strict";

const TABLE = "database_table";

export class DatabaseModel extends DataModel {
    // ...

    /* db-primary-key */
    public id: string;

    // ...
}
```

### Annotations: db-index and db-index-unique

If you want to add an index to the database, you must use the `db-index` annotation, or the `db-index-unique` annotation if the index is unique.

For more information about database indexes, read [this article](https://www.codecademy.com/article/sql-indexes).

The annotation expects a list of fields as an argument:

```ts
import { DataModel } from "tsbean-orm";

"use strict";

const TABLE = "database_table";

/* db-index: indexedField */

/* db-index: indexedField, otherField  */

/* db-index-unique: uniqueField */

export class DatabaseModel extends DataModel {
    // ...

    public indexedField: string;
    public uniqueField: string;
    public otherField: string;

    // ...
}
```

You can also set the sorting direction, by specifying `ASC` or `DESC` next to the field name, separated by a single space:

```ts
/* db-index: indexedField ASC, otherField DESC  */
```

### Annotation: db-type

By default, the tool will infer the types from the Typescript type annotations of the model fields.

However, fpr schema-based databases like MySQL and PostgreSQL, you probably want to be explicit about the type. For that, use the `db-type` annotation on top of a field definition.


```ts
import { DataModel } from "tsbean-orm";

"use strict";

const TABLE = "database_table";

export class DatabaseModel extends DataModel {
    // ...

    /* db-primary-key */
    /* db-type VARCHAR 80 */
    public id: string;

    /* db-type: BIGINT */
    public timestamp: number;

    /* db-type: TEXT */
    public description: string;

    // ...
}
```

Currently, the following database types are supported:

| Type         | Description                                                 |
| ------------ | ----------------------------------------------------------- |
| `BOOLEAN`    | A boolean type. Can be `true` or `false`.                   |
| `SMALLINT`   | A 2-bytes integer.                                          |
| `INT`        | A 4-bytes integer.                                          |
| `BIGINT`     | A 8-bytes integer.                                          |
| `FLOAT`      | A 4-bytes floating point number.                            |
| `DOUBLE`     | A 8-bytes floating point number.                            |
| `DATE`       | A date (year, month, day).                                  |
| `DATETIME`   | A timestamp. You can also use `BIGINT` to store timestamps. |
| `VARCHAR`    | A string, from 0 to a max of 255 characters.                |
| `TEXT`       | A string. Max 64 KB.                                        |
| `MEDIUMTEXT` | A string. Max 16 MB.                                        |
| `LONGTEXT`   | A string. Max 4 GB.                                         |

For `VARCHAR`, you can further limit its size by specifying it next to the type name, separated by a single space:

```ts
/* db-type VARCHAR 80 */
```
