import SpeedTest from "../models/speedTest.js";

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "0.0.0.0"
  );
}

// START TEST
export const startTest = async (req, res) => {
  const { user = "anonymous" } = req.body;

  const test = await SpeedTest.create({
    user,
    ipAddress: getClientIp(req),
    status: "running",
    progress: 5,
  });

  res.json({ testId: test._id });
};

// CLIENT SENDS REAL RESULTS
export const submitResults = async (req, res) => {
  const { download, upload, ping, jitter } = req.body;

  const test = await SpeedTest.findByIdAndUpdate(
    req.params.id,
    {
      download,
      upload,
      ping,
      jitter,
      status: "completed",
      progress: 100,
    },
    { new: true },
  );

  res.json(test);
};

// STATUS
export const getTestStatus = async (req, res) => {
  const test = await SpeedTest.findById(req.params.id);
  res.json(test);
};

// SSE STREAM
export const streamTestProgress = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");

  const id = req.params.id;

  const interval = setInterval(async () => {
    const test = await SpeedTest.findById(id);

    if (!test) return;

    res.write(`data: ${JSON.stringify(test)}\n\n`);

    if (test.status === "completed") {
      clearInterval(interval);
      res.end();
    }
  }, 500);

  req.on("close", () => clearInterval(interval));
};
