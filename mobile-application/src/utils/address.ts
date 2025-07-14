// Address utils

"use strict";

export function renderAddress(addr: string) {
    if (!addr) {
        return "";
    }

    return addr.substring(0, 6) + "..." + addr.substring(addr.length - 6, addr.length);
}
