// Reserved for license

import { AsyncInterval } from "@asanrom/async-tools";
import { Monitor } from "../monitor";
import { Config } from "../config/config";
import { User } from "../models/users/user";

"use strict";

interface Task {
    id: string;
    interval: AsyncInterval;
    period: number;
    runOnStartup?: boolean,
}

/**
 * Periodic tasks service
 */
export class TaskService {
    /* Singleton */

    public static instance: TaskService = null;

    public static getInstance(): TaskService {
        if (TaskService.instance) {
            return TaskService.instance;
        } else {
            TaskService.instance = new TaskService();
            return TaskService.instance;
        }
    }

    public tasks: Task[];

    constructor() {
        this.tasks = [];
    }

    private createTask(id: string, period: number, handler: () => Promise<any>, runOnStartup?: boolean) {
        const task: Task = {
            id: id,
            period: period,
            interval: new AsyncInterval(handler, period),
            runOnStartup: runOnStartup,
        };

        task.interval.on("error", err => {
            Monitor.exception(err);
        });

        this.tasks.push(task);
    }

    private startIntervals() {
        for (const task of this.tasks) {
            task.interval.start(task.runOnStartup);
        }
    }

    public start() {
        if (!Config.getInstance().isTaskRunner) {
            return;
        }

        Monitor.status("Task service starting...");

        this.tasks = [];

        // Create the tasks
        this.createTask("clear-unverified-users", 24 * 60 * 60 * 1000, this.clearUnverifiedUsersTasks.bind(this), true);

        // Start
        this.startIntervals();
    }

    /**
     * Task: Clear unverified users
     * Removes unverified users with more than a day
     */
    public async clearUnverifiedUsersTasks() {
        Monitor.info(`[TASK] Running task: Clear unverified users.`);

        const usersRemoved = await User.clearUnverifiedUsers();

        Monitor.info(`Cleared ${usersRemoved} unverified users from the database.`);
    }
}
