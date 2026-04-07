import { bytesToMbps } from "../utils/speedCalc.js";
// import SpeedTest from "../models/speedTest.js"; // optional for DB

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB

export const receiveUpload = (req, res) => {
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);

  if (contentLength > MAX_UPLOAD_BYTES) {
    return res.status(413).json({ error: "Payload too large. Max 100 MB." });
  }

  const startTime = Date.now();
  let bytesReceived = 0;

  // Stream chunks manually
  req.on("data", (chunk) => {
    bytesReceived += chunk.length;
    console.log(
      "Received chunk:",
      chunk.length,
      "Total so far:",
      bytesReceived,
    );
  });

  req.on("end", () => {
    const durationMs = Date.now() - startTime;
    const mbps = bytesToMbps(bytesReceived, durationMs);
    console.log("Upload finished. Total bytes:", bytesReceived);

    // Optional: Save to DB
    // await SpeedTest.create({
    //   user: someUserId || null,
    //   uploadSpeed: mbps,
    //   testedAt: new Date(),
    // });

    res.status(200).json({ bytesReceived, durationMs, mbps });
  });

  req.on("error", (err) => {
    console.error("[upload] Stream error:", err.message);
    res.status(500).json({ error: "Upload stream failed" });
  });
};
