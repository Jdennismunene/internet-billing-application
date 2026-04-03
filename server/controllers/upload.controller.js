import { bytesToMbps } from "../utils/speedCalc.js";
import SpeedTest from "../models/speedTest.js";

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB

export const receiveUpload = (req, res) => {
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > MAX_UPLOAD_BYTES) {
    return res.status(413).json({ error: "Payload too large. Max 100 MB." });
  }

  const startTime = Date.now();
  let bytesReceived = 0;

  req.on("data", (chunk) => (bytesReceived += chunk.length));

  req.on("end", async () => {
    const durationMs = Date.now() - startTime;
    const mbps = bytesToMbps(bytesReceived, durationMs);

    // Optional: Save upload speed to DB
    await SpeedTest.create({
      user: someUserId,
      uploadSpeed: mbps,
      testedAt: new Date(),
    });

    return res.status(200).json({ bytesReceived, durationMs, mbps });
  });

  req.on("error", (err) => {
    console.error("[upload] Stream error:", err.message);
    return res.status(500).json({ error: "Upload stream failed" });
  });
};
