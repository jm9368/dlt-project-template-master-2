// Third party users

import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, GenericRow, enforceType, TypedRow } from "tsbean-orm";
import { createRandomToken } from "../../utils/text-utils";
import { User } from "./user";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "tp_users";
const PRIMARY_KEY = "id";

/**
 * Third party users
 */
export class ThirdPartyUser extends DataModel {

    public static finder = new DataFinder<ThirdPartyUser>(DATA_SOURCE, TABLE, PRIMARY_KEY, function (data: any) {
        return new ThirdPartyUser(data);
    });

    public static async find(service: string, id: string): Promise<ThirdPartyUser> {
        return ThirdPartyUser.finder.findByKey(service + ":" + id);
    }

    public static async create(service: string, id: string, email: string, name: string): Promise<ThirdPartyUser> {
        const tpUser = new ThirdPartyUser({
            id: service + ":" + id,
            type: service,
            tpEmail: email,
            tpUsername: name,
            secret: createRandomToken(),
            uid: null,
        });

        await tpUser.insert();

        return tpUser;
    }

    public id: string;

    /* db-index: uid */

    public uid: string;

    public type: string;

    public tpEmail: string;
    public tpUsername: string;

    // Registration secret
    public secret: string;

    constructor(data: TypedRow<ThirdPartyUser>) {
        super(DATA_SOURCE, TABLE, PRIMARY_KEY);

        this.id = data.id || "";

        this.uid = data.uid || null;

        this.type = data.type || "";

        this.tpEmail = data.tpEmail || "";
        this.tpUsername = data.tpUsername || "";

        this.secret = data.secret || "";

        this.init();
    }

    public async findUser(): Promise<User> {
        if (this.uid) {
            return User.findUserByUID(this.uid);
        } else {
            return null;
        }
    }
}
