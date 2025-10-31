// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Upload } from "lucide-react";
// import { Progress } from "@/components/ui/progress";
// import { truncateString } from "./f";

// type fileUploadProps = {
//   fileName: string;
//   fileProgress: number;
//   handleClick: any;
//   showProgress: boolean;
// };

// const FileUpload = ({
//   fileName,
//   fileProgress,
//   handleClick,
//   showProgress,
// }: fileUploadProps) => {
//   return (
//     <div className="flex flex-col border rounded-lg  px-3 py-3 text-sm w-full gap-y-2">
//       <div className="flex justify-between items-center">
//         <div className="flex">{truncateString(fileName)}</div>
//         <div className="flex">
//           <Button
//             type="button"
            
//             className="h-[30px] px-2"
//             onClick={() => {
//               handleClick();
//             }}
//           >
//             <Upload size={15} />
//           </Button>
//         </div>
//       </div>

//       {showProgress ? (
//         <div>
//           <Progress value={fileProgress} className="h-1" />
//         </div>
//       ) : null}
//     </div>
//   );
// };

// export default FileUpload;
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatBytes, truncateString } from "./f";

type fileUploadProps = {
  fileName: string;
  fileProgress: number;
  handleClick: any;
  showProgress: boolean;
  transferSpeed: number;
  eta: number;
};

const FileUpload = ({
  fileName,
  fileProgress,
  handleClick,
  showProgress,
  transferSpeed,
  eta,
}: fileUploadProps) => {
  const formatTime = (seconds: number) => {
    if (seconds === Infinity || isNaN(seconds) || seconds < 0) return "...";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <div className="flex flex-col border rounded-lg  px-3 py-3 text-sm w-full gap-y-2">
      <div className="flex justify-between items-center">
        <div className="flex">{truncateString(fileName)}</div>
        <div className="flex">
          <Button
            type="button"
            className="h-[30px] px-2"
            onClick={() => {
              handleClick();
            }}
            disabled={showProgress}
          >
            <Upload size={15} />
          </Button>
        </div>
      </div>

      {showProgress ? (
        <div>
          <Progress value={fileProgress} className="h-1" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatBytes(transferSpeed)}/s</span>
            <span>ETA: {formatTime(eta)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FileUpload;