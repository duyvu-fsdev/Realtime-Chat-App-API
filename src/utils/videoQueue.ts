import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import { Queue, Worker } from "bullmq";
import ffmpeg from "fluent-ffmpeg";
import fsPromises from "fs/promises";
import path from "path";
import { Attachment } from "../db/models";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const videoQueue = new Queue("video-processing", { connection: { host: "localhost", port: 6379 } });
const addToQueue = async (data: { originalPath: string; attachmentId: number; userId: number }) => {
  await videoQueue.add("process-video", data);
};

// function parseTimemark(timemark: string): number {
//   const parts = timemark.split(":").map(parseFloat);
//   if (parts.length === 3) {
//     const [hours, minutes, seconds] = parts;
//     return hours * 3600 + minutes * 60 + seconds;
//   }
//   return 0;
// }

const worker = new Worker(
  "video-processing",
  async (job) => {
    const { originalPath, attachmentId, userId } = job.data;
    const dir = path.dirname(originalPath);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const newFilename = `${uniqueSuffix}-${userId}-optimized.mp4`;
    const outputPath = path.join(dir, newFilename);

    const duration = await new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(originalPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration || 0);
        }
      });
    });

    await new Promise<void>((resolve, reject) => {
      ffmpeg(originalPath)
        .output(outputPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .audioBitrate("128k")
        .size("?x720")
        .outputOptions(["-preset medium", "-crf 28"])
        // .on("progress", (progress) => {
        //   if (progress.timemark && duration) {
        //     const currentTime = parseTimemark(progress.timemark);
        //     const percent = (currentTime / duration) * 100;
        //     console.log(`Processing: ${percent.toFixed(2)}%`);
        //   }
        // })
        .on("end", () => resolve())
        .on("error", reject)
        .run();
    });

    await fsPromises.unlink(originalPath);

    const attachment = await Attachment.findByPk(attachmentId);
    if (attachment) {
      attachment.url = outputPath.replace("uploads/", "");
      attachment.size = (await fsPromises.stat(outputPath)).size;
      await attachment.save();
    }
  },
  {
    connection: { host: "localhost", port: 6379 },
  }
);

worker.on("failed", (job, err) => {
  console.error("❌ Job failed:", err);
});

export default { addToQueue };
