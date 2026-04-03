import crypto from "crypto";

const CHUNK_SIZE = 64 * 1024; // 64 KB
const TEST_DURATION_MS = 10_000;

export const streamDownload = (req, res) => {
  res.set({
    "Content-Type": "application/octet-stream",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "X-Content-Type-Options": "nosniff",
    "Transfer-Encoding": "chunked",
  });

  const startTime = Date.now();
  let isClosed = false;

  req.on("close", () => (isClosed = true));

  const sendChunk = () => {
    if (isClosed) return;
    const elapsed = Date.now() - startTime;
    if (elapsed >= TEST_DURATION_MS) return res.end();

    const chunk = crypto.randomBytes(CHUNK_SIZE);
    const canContinue = res.write(chunk);

    if (canContinue) setImmediate(sendChunk);
    else res.once("drain", sendChunk);
  };

  sendChunk();
};
