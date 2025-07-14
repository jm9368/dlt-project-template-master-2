// Reserved for license

"use strict";

/**
 * FFmpeg configuration.
 */
export class FFmpegConfig {

    /**
     * Gets the configuration instance.
     */
    public static getInstance(): FFmpegConfig {
        if (FFmpegConfig.instance) {
            return FFmpegConfig.instance;
        }

        const config: FFmpegConfig = new FFmpegConfig();

        config.ffprobeBinary = process.env.FFPROBE_PATH || "/usr/bin/ffprobe";
        config.ffmpegBinary = process.env.FFMPEG_PATH || "/usr/bin/ffmpeg";

        FFmpegConfig.instance = config;

        return config;
    }
    private static instance: FFmpegConfig = null;

    public ffprobeBinary: string;
    public ffmpegBinary: string;

    constructor() {
        this.ffprobeBinary = "/usr/bin/ffprobe";
        this.ffmpegBinary = "/usr/bin/ffmpeg";
    }
}
