// utils/speedCalc.js

/**
 * Converts bytes + duration into Mbps.
 * Remember: ISPs advertise Megabits (Mb), not Megabytes (MB).
 * 1 byte = 8 bits. Always multiply first.
 */
export const bytesToMbps = (bytes, durationMs) => {
  if (durationMs <= 0) return 0;

  const bits = bytes * 8;
  const seconds = durationMs / 1000;

  return parseFloat((bits / seconds / 1_000_000).toFixed(2));
};

/**
 * Jitter = average absolute difference between consecutive RTT samples.
 * This is the RFC 3550 definition used by most speed test tools.
 */
export const calculateJitter = (rttSamples = []) => {
  if (rttSamples.length < 2) return 0;

  let total = 0;
  for (let i = 1; i < rttSamples.length; i++) {
    total += Math.abs(rttSamples[i] - rttSamples[i - 1]);
  }

  return parseFloat((total / (rttSamples.length - 1)).toFixed(2));
};
