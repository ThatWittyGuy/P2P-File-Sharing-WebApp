"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, CopyIcon } from "lucide-react";
import { useSocket } from "./SP";
import toast from "react-hot-toast";
import { TailSpin } from "react-loader-spinner";
import Peer from "simple-peer";
import FileUpload from "./FU";
import FileUploadBtn from "./FUButton";
import FileDownload from "./FD";
import ShareLink from "./ShareLink";
import { useSearchParams } from "next/navigation";
import { Dots_v3 } from "@/components/ui/dots";
import { EyeCatchingButton_v1 } from "@/components/ui/shimmerButton";

const ShareCard = () => {
  const { socket, userId, setpeerState } = useSocket();

  const [partnerId, setpartnerId] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [isCopied, setisCopied] = useState(false);
  const [currentConnection, setcurrentConnection] = useState(false);
  const peerRef = useRef<any>();
  const [myId, setmyId] = useState<any>(); // Renamed from userId to avoid conflict
  const [signalingData, setsignalingData] = useState<any>();
  const [acceptCaller, setacceptCaller] = useState(false);
  const [terminateCall, setterminateCall] = useState(false);
  const [fileUpload, setfileUpload] = useState<any>();
  const fileInputRef = useRef<any>();
  const [downloadFile, setdownloadFile] = useState<any>();
  const [fileUploadProgress, setfileUploadProgress] = useState<number>(0);
  const [fileDownloadProgress, setfileDownloadProgress] = useState<number>(0);
  const [fileNameState, setfileNameState] = useState<any>();
  const [fileSending, setfileSending] = useState(false);
  const [fileReceiving, setfileReceiving] = useState(false);
  const searchParams = useSearchParams();

  const [showContent, setShowContent] = useState(false);

  // New state for drag & drop
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // New state for transfer stats
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [uploadEta, setUploadEta] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [downloadEta, setDownloadEta] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const workerRef = useRef<Worker>();

  const addUserToSocketDB = () => {
    const onConnect = () => {
      setmyId(userId); // Use the stable userId from useSocket
      socket.emit("details", {
        socketId: socket.id,
        uniqueId: userId,
      });
    };
    socket.on("connect", onConnect);

    // Return a cleanup function
    return () => {
      socket.off("connect", onConnect);
    };
  };

  function CopyToClipboard(value: any) {
    setisCopied(true);
    toast.success("Copied");
    navigator.clipboard.writeText(value);
    setTimeout(() => {
      setisCopied(false);
    }, 3000);
  }

  useEffect(() => {
    workerRef.current = new Worker("/w.js");

    const cleanupAddUser = addUserToSocketDB();

    if (searchParams.get("code")) {
      setpartnerId(String(searchParams.get("code")));
    }

    const handleSignaling = (data: any) => {
      setacceptCaller(true);
      setsignalingData(data);
      setpartnerId(data.from);
    };

    const handlePeerNotFound = () => {
      setisLoading(false);
      toast.error("Peer not found. Please check the token and try again.");
    };

    const handleWorkerMessage = (event: any) => {
      if (event.data?.progress) {
        setfileDownloadProgress(Number(event.data.progress));
        setDownloadSpeed(event.data.speed || 0); // Get speed from worker
        setDownloadEta(event.data.eta || 0); // Get ETA from worker
      } else if (event.data?.blob) {
        setdownloadFile(event.data?.blob);
        setfileDownloadProgress(0);
        setfileReceiving(false);
        setDownloadSpeed(0); // Reset stats
        setDownloadEta(0);
      }
    };

    const handleCallAccepted = (data: any) => {
      if (peerRef.current) {
        peerRef.current.signal(data.signalData);
      }
    };

    socket.on("signaling", handleSignaling);
    socket.on("peer-not-found", handlePeerNotFound);
    socket.on("callAccepted", handleCallAccepted);
    workerRef.current?.addEventListener("message", handleWorkerMessage);

    console.log(socket);

    return () => {
      peerRef.current?.destroy();

      // Specific cleanup
      cleanupAddUser();
      socket.off("signaling", handleSignaling);
      socket.off("peer-not-found", handlePeerNotFound);
      socket.off("callAccepted", handleCallAccepted);
      workerRef.current?.removeEventListener("message", handleWorkerMessage);

      workerRef.current?.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callUser = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:numb.viagenie.ca",
            credential: "muazkh",
            username: "webrtc@live.com",
          },
        ],
      },
    });
    peerRef.current = peer;

    peer.on("signal", (data) => {
      socket.emit("send-signal", {
        from: userId, // Use stable userId
        signalData: data,
        to: partnerId,
      });
    });

    peer.on("data", (data) => {
      const parsedData = JSON.parse(data);

      if (parsedData.chunk) {
        setfileReceiving(true);
        handleReceivingData(parsedData.chunk);
      } else if (parsedData.done) {
        handleReceivingData(parsedData);
        toast.success("File received successfully");
      } else if (parsedData.info) {
        handleReceivingData(parsedData);
      }
    });

    peer.on("connect", () => {
      console.log("PEER CONNECTED (CALLER)");
      setisLoading(false);
      setcurrentConnection(true);
      setterminateCall(true);
      toast.success(`Successful connection with ${partnerId}`);
      setpeerState(peer); // Use stable setpeerState
    });

    peer.on("close", () => {
      setpartnerId("");
      setcurrentConnection(false);
      toast.error(`${partnerId} disconnected`);
      setfileUpload(false);
      setterminateCall(false);
      setpartnerId("");
      setpeerState(undefined);
    });

    // *** THIS IS THE FIX ***
    peer.on("error", (err: any) => {
      const errString = err ? err.toString() : "Unknown error";

      // These are non-fatal errors that simple-peer emits during handshake
      if (
        errString.includes("OperationError") ||
        errString.includes("ERR_DATA_CHANNEL") ||
        errString.includes("User-Initiated Abort") ||
        errString.includes("Failure to send data") // <-- ADDED THIS CHECK
      ) {
        console.warn(
          "[WARN] Peer connection non-fatal error (caller):",
          errString
        );
        return; // Don't show a toast, don't reset state.
      }

      // These are real errors.
      console.error("[ERROR] Peer connection fatal error (caller):", errString);
      toast.error("A fatal connection error occurred.");

      // Since it's fatal, trigger the cleanup.
      setisLoading(false);
      setcurrentConnection(false);
      setterminateCall(false);
      setpartnerId("");
      setpeerState(undefined);
    });
  };

  const acceptUser = () => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: [
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:numb.viagenie.ca",
            credential: "muazkh",
            username: "webrtc@live.com",
          },
        ],
      },
    });

    peerRef.current = peer;
    setpeerState(peer); // Use stable setpeerState
    peer.on("signal", (data) => {
      socket.emit("accept-signal", {
        signalData: data,
        to: partnerId,
      });
    });

    peer.on("data", (data) => {
      const parsedData = JSON.parse(data);

      if (parsedData.chunk) {
        setfileReceiving(true);
        handleReceivingData(parsedData.chunk);
      } else if (parsedData.done) {
        handleReceivingData(parsedData);
        toast.success("File received successfully");
      } else if (parsedData.info) {
        handleReceivingData(parsedData);
      }
    });

    peer.on("connect", () => {
      console.log("PEER CONNECTED (RECEIVER)");
      setcurrentConnection(true);
      setacceptCaller(false);
      setterminateCall(true);
      toast.success(`Successful connection with ${partnerId}`);
    });

    peer.signal(signalingData.signalData);

    peer.on("close", () => {
      setpartnerId("");
      setcurrentConnection(false);
      toast.error(`${partnerId} disconnected`);
      setfileUpload(false);
      setterminateCall(false);
      setpartnerId("");
      setpeerState(undefined);
    });

    // *** THIS IS THE FIX ***
    peer.on("error", (err: any) => {
      const errString = err ? err.toString() : "Unknown error";

      // These are non-fatal errors that simple-peer emits during handshake
      if (
        errString.includes("OperationError") ||
        errString.includes("ERR_DATA_CHANNEL") ||
        errString.includes("User-Initiated Abort") ||
        errString.includes("Failure to send data") // <-- ADDED THIS CHECK
      ) {
        console.warn(
          "[WARN] Peer connection non-fatal error (receiver):",
          errString
        );
        return; // Don't show a toast, don't reset state.
      }

      // These are real errors.
      console.error(
        "[ERROR] Peer connection fatal error (receiver):",
        errString
      );
      toast.error("A fatal connection error occurred.");

      // Since it's fatal, trigger the cleanup.
      setcurrentConnection(false);
      setacceptCaller(false);
      setterminateCall(false);
      setpartnerId("");
      setpeerState(undefined);
    });
  };

  const handleConnectionMaking = () => {
    setisLoading(true);
    if (partnerId && partnerId.length == 10) {
      callUser();
    } else {
      setisLoading(false);
      toast.error("Invalid token entered.");
    }
  };

  const handleFileUploadBtn = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e: any) => {
    setfileUpload(e.target.files);
  };

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (currentConnection) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (!currentConnection) {
      toast.error("Please connect to a peer before uploading a file.");
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 1) {
        toast.error("You can only upload one file at a time.");
      }
      setfileUpload(e.dataTransfer.files); // Set the file list
      e.dataTransfer.clearData();
    }
  };
  // ------------------------------

  function handleReceivingData(data: any) {
    if (data.info) {
      workerRef.current?.postMessage({
        status: "fileInfo",
        fileSize: data.fileSize,
      });
      setfileNameState(data.fileName);
    } else if (data.done) {
      const parsed = data;
      const fileSize = parsed.fileSize;
      workerRef.current?.postMessage("download");
    } else {
      setdownloadFile("sjdf");
      workerRef.current?.postMessage(data);
    }
  }

  const handleWebRTCUpload = () => {
    const peer = peerRef.current;
    if (!peer || !fileUpload || fileUpload.length === 0) {
      toast.error("No peer connected or no file selected.");
      return;
    }
    // Initial check
    if (!peer.writable) {
      toast.error("Peer is not connected or writable. Cannot send file.");
      return;
    }

    const file = fileUpload[0];
    const chunkSize = 16 * 1024; 
    let offset = 0;
    const uploadStartTime = Date.now(); // Start timer for speed calculation
    setUploadSpeed(0);
    setUploadEta(0);

    const readAndSendChunk = () => {
      const chunk = file.slice(offset, offset + chunkSize);
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          if (!peerRef.current || !peerRef.current.writable) {
            console.warn("Peer connection closed, aborting send.");
            setfileSending(false);
            return; // Stop the loop
          }

          if (offset === 0) {
            setfileSending(true);
            const fileInfo = {
              info: true,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
            };
            peer.write(JSON.stringify(fileInfo));
          }

          if (event.target?.result) {
            const chunkData: any = event.target.result;
            const uint8ArrayChunk = new Uint8Array(chunkData);

            const progressPayload = {
              chunk: Array.from(uint8ArrayChunk),
              progress: (offset / file.size) * 100,
            };
            peer.write(JSON.stringify(progressPayload));

            offset += chunk.size; // Use the actual chunk size read
            setfileUploadProgress((offset / file.size) * 100);

            // Calculate speed and ETA
            const elapsedTime = (Date.now() - uploadStartTime) / 1000; // in seconds
            const speed = offset / elapsedTime; // bytes/sec (offset is now the total sent)
            const remaining = file.size - offset;
            const eta = remaining / speed; // in seconds

            setUploadSpeed(speed);
            setUploadEta(eta);

            if (offset < file.size) {
              readAndSendChunk(); // Continue loop
            } else {
              peer.write(
                JSON.stringify({
                  done: true,
                  fileName: file.name,
                  fileSize: file.size,
                  fileType: file.type,
                })
              );
              setfileUploadProgress(100);
              setfileSending(false);
              toast.success("Sended file successfully");
              setUploadSpeed(0); // Reset stats
              setUploadEta(0);
            }
          }
        } catch (err: any) {
          // Catch errors like "write after end"
          console.error("File send error:", err.message);
          if (
            err.message.includes("write after end") ||
            err.message.includes("Failure to send data")
          ) {
            toast.error("Failed to send file. Peer disconnected.");
          } else {
            toast.error("An unknown file sending error occurred.");
          }
          setfileSending(false);
          setfileUploadProgress(0);
          setUploadSpeed(0);
          setUploadEta(0);
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        toast.error("Error reading file.");
        setfileSending(false);
      };

      reader.readAsArrayBuffer(chunk);
    };

    readAndSendChunk();
  };

  return (
    <>
      <Card
        className={cn(
          "sm:max-w-[450px] max-w-[95%] z-10 relative transition-all", // Added relative
          isDraggingOver && "border-primary ring-2 ring-primary" // Drag-over style
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag-over overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 rounded-xl">
            <p className="font-semibold text-lg">Drop file to upload</p>
          </div>
        )}

        <CardHeader>
          <CardTitle>z1ppie</CardTitle>
          <CardDescription>
            Share files securely using peer-to-peer (P2P) technology.
          </CardDescription>
        </CardHeader>
        {}
        <CardContent className="mt-1">
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col gap-y-1">
                <Label htmlFor="name">My Token</Label>
                <div className="flex flex-row justify-left items-center space-x-2">
                  <div className="flex border rounded-md px-3 py-2 text-sm h-10 w-full bg-muted items-center">
                    {showContent ? myId ? myId : <Dots_v3 /> : <Dots_v3 />}
                  </div>
                  <Button
                    type="button"
                    className="p-4"
                    onClick={() => CopyToClipboard(userId)}
                    disabled={myId ? false : true}
                  >
                    {isCopied ? (
                      <Check size={15} color="green" />
                    ) : (
                      <CopyIcon size={15} />
                    )}
                  </Button>
                  <ShareLink userCode={myId} />
                </div>
              </div>

              <div className="flex flex-col gap-y-1">
                <Label htmlFor="name">Peer's Token</Label>
                <div className="flex flex-row justify-left items-center space-x-2">
                  <Input
                    id="name"
                    placeholder="Input Peer's Token"
                    onChange={(e) => setpartnerId(e.target.value)}
                    disabled={terminateCall}
                    value={partnerId}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center justify-center p-4 w-[160px]"
                    onClick={handleConnectionMaking}
                    disabled={terminateCall}
                  >
                    {isLoading ? (
                      <>
                        <div className="scale-0 hidden dark:flex dark:scale-100">
                          <TailSpin color="white" height={18} width={18} />
                        </div>
                        <div className="scale-100 flex dark:scale-0 dark:hidden">
                          <TailSpin color="black" height={18} width={18} />
                        </div>
                      </>
                    ) : (
                      <p>Connect</p>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-y-1">
                <Label htmlFor="name">Connection Status</Label>
                <div className="flex flex-row justify-left items-center space-x-2">
                  <div className=" border rounded-lg  px-3 py-2 text-sm h-10 w-full ease-in-out duration-500 transition-all select-none flex items-center">
                    {currentConnection
                      ? `Connected to ${partnerId}`
                      : "No connection"}
                  </div>
                  <>
                    {terminateCall ? (
                      <Button
                        variant="destructive"
                        type="button"
                        // className="p-4 w-[160px] text-red-600 border-red-400 hover:bg-red-300 animate-in slide-in-from-right-[30px]"
                        onClick={() => {
                          peerRef.current.destroy();
                        }}
                      >
                        Terminate
                      </Button>
                    ) : null}
                  </>
                </div>
              </div>

              {/* file upload */}
              <div className="flex flex-col border rounded-lg  px-3 py-2 text-sm w-full ease-in-out duration-500 transition-all gap-y-2">
                <div>
                  <Label className=" font-semibold text-[16px]">
                    Upload a file
                  </Label>
                </div>
                <div>
                  <FileUploadBtn
                    inputRef={fileInputRef}
                    uploadBtn={handleFileUploadBtn}
                    handleFileChange={handleFileChange}
                  />
                </div>

                {fileUpload ? (
                  <FileUpload
                    fileName={fileUpload[0]?.name}
                    fileProgress={fileUploadProgress}
                    handleClick={handleWebRTCUpload}
                    showProgress={fileSending}
                    transferSpeed={uploadSpeed}
                    eta={uploadEta}
                  />
                ) : null}
              </div>

              {/* download file */}
              {downloadFile ? (
                <>
                  <FileDownload
                    fileName={fileNameState}
                    fileReceivingStatus={fileReceiving}
                    fileProgress={fileDownloadProgress}
                    fileRawData={downloadFile}
                    transferSpeed={downloadSpeed}
                    eta={downloadEta}
                  />
                </>
              ) : null}
            </div>
          </form>
        </CardContent>
        {acceptCaller ? (
          <CardFooter className="flex justify-center">
            <div>
              <EyeCatchingButton_v1 onClick={acceptUser}>
                Click here to connect to {signalingData.from}
              </EyeCatchingButton_v1>
            </div>
          </CardFooter>
        ) : null}
      </Card>
    </>
  );
};

export default ShareCard;