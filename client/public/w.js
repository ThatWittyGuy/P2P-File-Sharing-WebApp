let chunks = [];
let startTime;
let fileSize = 0;
let totalBytesReceived = 0;

self.addEventListener("message", (event) => {
  if (event.data.status === "fileInfo") {
    // New file starting, reset stats
    fileSize = event.data.fileSize;
    chunks = [];
    totalBytesReceived = 0;
    startTime = performance.now(); // Start timer on file info
  } else if (event.data === "download") {
    // File done, create blob
    const blob = new Blob(chunks, { type: "application/octet-stream" });
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;

    self.postMessage({
      blob: blob,
      timeTaken: elapsedTime,
    });

    // Reset for next file
    chunks = [];
    totalBytesReceived = 0;
    startTime = undefined;
  } else {
    // This is a chunk
    const chunkData = new Uint8Array(event.data);
    chunks.push(chunkData);
    totalBytesReceived += chunkData.length;

    const progress = (totalBytesReceived / fileSize) * 100;
    const elapsedTime = (performance.now() - startTime) / 1000; // in seconds
    const speed = totalBytesReceived / elapsedTime; // bytes/sec
    const remainingBytes = fileSize - totalBytesReceived;
    const eta = remainingBytes / speed; // in seconds

    // Post progress, speed, and ETA back to main thread
    self.postMessage({
      progress: progress,
      speed: speed,
      eta: eta,
    });
  }
});