// Object utils

/**
 * Clones an object, making a snapshot
 * @param o Object to clone
 * @returns The cloned object
 */
export function clone<T = any>(o: T): T {
    if (typeof o !== "object" || o === null) {
        return o; // Primitives don't need cloning
    }

    if (o instanceof Set) {
        const o2 = new Set();

        for (const e of o) {
            o2.add(clone(e));
        }

        return o2 as any;
    } else if (o instanceof Map) {
        const o2 = new Map();

        for (const [k, v] of o) {
            o2.set(k, clone(v));
        }

        return o2 as any;
    } else if (Array.isArray(o)) {
        return o.map(clone) as any;
    } else {
        const o2: T = Object.create(null);

        for (const key of Object.keys(o)) {
            o2[key] = clone(o[key]);
        }

        return o2;
    }
}
