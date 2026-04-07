import SpeedTest from "../models/speedTest.js";

export const saveResult = async (req, res) => {
  try {
    const {
      userId,
      downloadMbps,
      uploadMbps,
      pingMs,
      jitterMs,
      location,
      deviceType,
    } = req.body;

    const speedTest = await SpeedTest.create({
      user: userId,
      downloadSpeed: downloadMbps,
      uploadSpeed: uploadMbps,
      ping: pingMs,
      jitter: jitterMs,
      serverLocation: location || "Nairobi",
      deviceType: deviceType || "unknown",
    });

    return res.status(201).json(speedTest);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save speed test result" });
  }
};

export const getResult = async (req, res) => {
  try {
    const speedTest = await SpeedTest.findById(req.params.id).lean();
    if (!speedTest) {
      return res.status(404).json({ error: "Result not found" });
    }
    return res.status(200).json(speedTest);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch result" });
  }
};
