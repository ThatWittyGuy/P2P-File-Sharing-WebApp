// let chunks:any = [];
// let startTime:any;
// let fileSize;
// let chunkSize = 16000;
// let currentChunk = 0;
// let totalChunks:any;
// let currentProgress = 0;
// let prevProgress = 0;

// self.addEventListener("message", (event) => {
//   if (event.data.status === "fileInfo") {
//     fileSize = event.data.fileSize;
//     totalChunks = Math.ceil(fileSize / chunkSize);
//   } else if (event.data === "download") {
//     const blob = new Blob(chunks, { type: "application/octet-stream" });
//     const endTime = performance.now();
//     const elapsedTime = endTime - startTime;

//     // Sending both the blob and the elapsed time to the main thread
//     self.postMessage({
//       blob: blob,
//       timeTaken: elapsedTime,
//     });

//     // Reset chunks and currentChunk for future data chunks
//     chunks = [];
//     currentChunk = 0;
//   } else {
//     // If this is the first event, start the timer
//     if (!startTime) {
//       startTime = performance.now();
//     }

//     // Append data to the chunks array
//     chunks.push(new Uint8Array(event.data));

//     // Calculate progress and send it to the main thread
//     currentChunk++;
//     const progress = (currentChunk / totalChunks) * 100;

//     // To reduce the frequency of progress updates, only send updates when there's a significant change
//     const roundedProgress = Math.floor(progress);
//     if (roundedProgress !== prevProgress) {
//       prevProgress = roundedProgress;
//       self.postMessage({
//         progress: prevProgress,
//       });
//     }
//   }
// });

let chunks: any = [];
let startTime: any;
let fileSize: number = 0;
let totalBytesReceived: number = 0;

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