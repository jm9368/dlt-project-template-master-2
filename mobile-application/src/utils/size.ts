// Size rendering

"use strict";

export function renderSizeBytes(bytes: number): string {
    if (bytes > 1024 * 1024 * 1024) {
        let gb = bytes / (1024 * 1024 * 1024);
        gb = Math.floor(gb * 100) / 100;
        return gb + " GB";
    } else if (bytes > 1024 * 1024) {
        let mb = bytes / (1024 * 1024);
        mb = Math.floor(mb * 100) / 100;
        return mb + " MB";
    } else if (bytes > 1024) {
        let kb = bytes / 1024;
        kb = Math.floor(kb * 100) / 100;
        return kb + " KB";
    } else {
        return bytes + " Bytes";
    }
}
