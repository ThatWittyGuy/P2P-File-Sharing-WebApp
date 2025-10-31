# P2P File Sharing Webapp ⚡

**A modern, secure, and serverless P2P file-sharing web app.**

This P2P File Sharing Webapp allows for blazingly fast, direct peer-to-peer file sharing and chat, all from within the browser. It uses a lightweight backend *only* for signaling (to "introduce" two peers), while all data (files, chat) is sent directly between users via an encrypted WebRTC data channel.

---

## ✨ Features

Here's a detailed breakdown of all the features built into this webapp.

### Feature List (Bullet Points)

* **Secure P2P File Transfer:** Files are sent directly between peers using an encrypted WebRTC `RTCDataChannel`. No file data ever touches the server.
* **Serverless Data Path:** The Node.js backend is used *only* for signaling (matchmaking peers) via Socket.io, not for file proxying.
* **Drag & Drop UI:** Easily drag and drop your file onto the share card to initiate a transfer (when connected).
* **Real-time Chat:** A built-in chat module that also operates over the same secure P2P data channel.
* **Real-time Transfer Stats:** Monitor transfer progress with a percentage bar, live transfer speed (e.g., MB/s), and an estimated time of arrival (ETA).
* **Efficient File Chunking:** Large files are broken into 16KB chunks and sent sequentially for reliable transfer and progress tracking.
* **Web Worker Processing:** File receiving and re-assembly (blob creation) are handled in a background web worker (`w.js`), preventing the main UI from freezing on large files.
* **1-Click Connection:** Share your session via a unique 10-digit token, a direct URL, or a scannable QR code.
* **Modern & Responsive UI:** Built with Next.js (App Router), Tailwind CSS, and Shadcn/ui for a clean, responsive experience on desktop and mobile.
* **Dark/Light Mode:** Includes a theme toggler.
* **Robust Connection Handling:** Provides user-friendly toasts for connection failures, such as "Peer not found" or when a peer disconnects.

### Features in Detail (Table)

| Feature | Description | Technical Implementation |
| :--- | :--- | :--- |
| **P2P File Transfer** | Utilizes **WebRTC** (`simple-peer`) to create a direct `RTCDataChannel` for serverless file transfers. | `client/app/ShareCard.tsx` (fn: `handleWebRTCUpload`) |
| **Signaling Server** | A lightweight **Node.js/Socket.io** server manages the WebRTC handshake (SDP/ICE) to "introduce" peers. | `server/index.js` (events: `send-signal`, `accept-signal`) |
| **Real-time Chat** | A built-in chat component that sends JSON-stringified messages over the same P2P `RTCDataChannel`. | `client/app/Chat.tsx` (fn: `handleSendMessage`, `peer.on('data')`) |
| **Drag & Drop** | Users can drag a file directly onto the share card (when connected) to select it for transfer. | `client/app/ShareCard.tsx` (fns: `handleDragOver`, `handleDrop`) |
| **Transfer Stats** | Displays live progress (%), transfer speed (MB/s), and ETA for both uploads and downloads. | `client/app/w.ts` (worker) & `client/app/ShareCard.tsx` |
| **Web Worker** | File chunks are received and assembled into a Blob in a separate thread to avoid blocking the main UI. | `client/public/w.js` & `client/app/w.ts` |
| **Unique Tokens** | Uses `nanoid` to generate a 10-digit unique ID for each user to initiate a connection. | `client/app/SP.tsx` (Socket Provider) |
| **Shareable Links** | Provides a "Share" button to generate a direct URL (`/share?code=...`) or a **QR Code**. | `client/app/ShareLink.tsx` (using `qrcode.react`) |
| **Modern UI/UX** | Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Shadcn/ui**. | `client/` directory |
| **Error Handling** | Provides user-friendly toasts for connection failures, such as "Peer not found". | `server/index.js` (emits `peer-not-found`) |

---

## ⚙️ How It Works (Architecture)

The project is split into two parts: the frontend (`client`) and the signaling backend (`server`). The magic of this app is that the server **never touches your files**.

1.  **Client 1 (Peer A)** opens the webapp. It connects to the `server` via Socket.io and is given a unique 10-digit token (e.g., `ABC1234567`).
2.  **Peer A** sends this token to **Client 2 (Peer B)** (via text, email, etc.).
3.  **Peer B** enters the token `ABC1234567` and clicks "Connect". Peer B's browser sends this token to the `server`.
4.  The server sees that Peer A is associated with this token and initiates a **WebRTC handshake**:
    * It relays an "offer" from Peer A to Peer B.
    * It relays an "answer" from Peer B back to Peer A.
    * It relays **ICE candidates** (potential network paths) between both peers.
5.  Once the handshake is complete, a direct, secure **`RTCDataChannel` (P2P connection)** is established between Peer A and Peer B's browsers.
    
6.  The `server`'s job is now done. All further communication, including chat messages and file chunks, is sent *directly* between Peer A and Peer B.

---

## 🛠️ Tech Stack

| Category | Client (Frontend) | Server (Backend) |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Node.js, Express |
| **Language** | TypeScript | JavaScript |
| **Real-time** | `simple-peer` (WebRTC) | `socket.io` |
| **Styling** | Tailwind CSS | N/A |
| **UI Components** | Shadcn/ui, Aceternity UI | N/A |
| **Async** | Web Workers | N/A |
| **Utilities** | Framer Motion, `nanoid` | `cors`, `dotenv` |

---

## 🚀 Getting Started (Local Development)

To run this project locally, you must run *both* the server and the client.

### Prerequisites

* Node.js (v18 or later)
* npm or yarn

### T.B.C
T.B.C