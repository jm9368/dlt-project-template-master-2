// Time utils

"use strict";

/**
 * Asynchronously sleeps a number of milliseconds
 * @param ms Milliseconds to sleep
 * @returns A promise
 */
export function aSleep(ms: number): Promise<void> {
    return new Promise<void>(function (resolve) {
        setTimeout(resolve, ms);
    });
}

/**
 * Turns a timestamp into a formatted date.
 * @param timestamp The input timestamp.
 * @returns         The formatted date.
 */
export function formatDate(timestamp: number): string {
    const d: Date = new Date(timestamp);
    let day: string = "" + d.getDate();
    let month: string = "" + (d.getMonth() + 1);
    const year: string = "" + d.getFullYear();
    let hour: string = "" + d.getHours();
    let minutes: string = "" + d.getMinutes();
    let seconds: string = "" + d.getSeconds();

    if (day.length < 2) {
        day = "0" + day;
    }

    if (month.length < 2) {
        month = "0" + month;
    }

    if (hour.length < 2) {
        hour = "0" + hour;
    }

    if (minutes.length < 2) {
        minutes = "0" + minutes;
    }

    if (seconds.length < 2) {
        seconds = "0" + seconds;
    }

    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
}
