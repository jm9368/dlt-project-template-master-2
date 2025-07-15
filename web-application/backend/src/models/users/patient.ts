import { DataModel, DataSource, DataFinder, enforceType, TypedRow } from "tsbean-orm";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "patients";
const PRIMARY_KEY = "id";

/**
 * Patient model
 */
export class Patient extends DataModel {
    public static finder = new DataFinder<Patient>(DATA_SOURCE, TABLE, PRIMARY_KEY, function (data: any) {
        return new Patient(data);
    });

    public id: string;
    public username: string;
    public email: string;
    public password: string;
    public enfermedades: string[]; // Lista de enfermedades
    public created: number;

    constructor(data: TypedRow<Patient>) {
        super(DATA_SOURCE, TABLE, PRIMARY_KEY);

        this.id = enforceType(data.id, "string") || "";
        this.username = enforceType(data.username, "string") || "";
        this.email = enforceType(data.email, "string") || "";
        this.password = enforceType(data.password, "string") || "";
        // Si enfermedades viene como string (ej: JSON), conviértelo a array
        if (Array.isArray(data.enfermedades)) {
            this.enfermedades = data.enfermedades;
        } else if (typeof data.enfermedades === "string") {
            try {
                this.enfermedades = JSON.parse(data.enfermedades);
            } catch {
                this.enfermedades = [];
            }
        } else {
            this.enfermedades = [];
        }
        this.created = enforceType(data.created, "number") || Date.now();

        this.init();
    }
}