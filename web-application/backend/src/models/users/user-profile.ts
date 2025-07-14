// User profile

import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, GenericRow, enforceType, TypedRow } from "tsbean-orm";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "user_profile";
const PRIMARY_KEY = "id";

/**
 * User profile
 */
export class UserProfile extends DataModel {
    public static finder = new DataFinder<UserProfile>(DATA_SOURCE, TABLE, PRIMARY_KEY, function (data: any) {
        return new UserProfile(data);
    });

    public static async findByUser(uid: string): Promise<UserProfile> {
        let profile = await UserProfile.finder.findByKey(uid);

        if (!profile) {
            profile = new UserProfile({
                id: uid,
            });

            try {
                await profile.insert();
            } catch (ex) {}
        }

        return profile;
    }

    public id: string;

    public name: string;

    /* db-type: text */
    public bio: string;

    public image: string;

    public location: string;

    public website: string;

    constructor(data: TypedRow<UserProfile>) {
        super(DATA_SOURCE, TABLE, PRIMARY_KEY);

        this.id = enforceType(data.id, "string") || "";

        this.name = enforceType(data.name, "string") || "";
        this.bio = enforceType(data.bio, "string") || "";

        this.image = enforceType(data.image, "string") || "";

        this.location = enforceType(data.location, "string") || "";

        this.website = enforceType(data.website, "string") || "";

        this.init();
    }
}
