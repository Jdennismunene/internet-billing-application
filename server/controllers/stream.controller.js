import crypto from "crypto";

const CHUNK_SIZE = 256 * 1024; // 256KB
const TEST_DURATION = 10_000;

// DOWNLOAD → server sends data
export const streamDownload = (req, res) => {
  res.set({
    "Content-Type": "application/octet-stream",
    "Cache-Control": "no-store",
    "Transfer-Encoding": "chunked",
  });

  const start = Date.now();
  let closed = false;
  req.on("close", () => (closed = true));

  function send() {
    if (closed) return;
    if (Date.now() - start > TEST_DURATION) return res.end();

    const chunk = crypto.randomBytes(CHUNK_SIZE);
    const ok = res.write(chunk);

    if (ok) setImmediate(send);
    else res.once("drain", send);
  }

  send();
};

// UPLOAD → server measures upload Mbps
export const streamUpload = (req, res) => {
  let totalBytes = 0;
  const start = process.hrtime();

  req.on("data", (chunk) => {
    totalBytes += chunk.length;
  });

  req.on("end", () => {
    const diff = process.hrtime(start);
    const seconds = diff[0] + diff[1] / 1e9;

    const mbps = (totalBytes * 8) / (seconds * 1_000_000);

    return res.json({
      uploadMbps: Number(mbps.toFixed(2)),
      bytes: totalBytes,
      seconds: Number(seconds.toFixed(3)),
    });
  });

  req.on("error", () => {
    res.status(500).json({ error: "Upload failed" });
  });
};
