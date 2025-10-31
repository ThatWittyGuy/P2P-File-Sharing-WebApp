// export function truncateString(input: string): string {
//     if (input.length <= 30) {
//       return input;
//     } else {
//       const truncatedPart = input.substring(0, 27); // Take the first 17 characters
//       const lastThreeCharacters = input.substring(input.length - 3); // Take the last 3 characters
//       return truncatedPart + "..." + lastThreeCharacters;
//     }
//   }
  
export function truncateString(input: string): string {
  if (input.length <= 30) {
    return input;
  } else {
    const truncatedPart = input.substring(0, 27); // Take the first 17 characters
    const lastThreeCharacters = input.substring(input.length - 3); // Take the last 3 characters
    return truncatedPart + "..." + lastThreeCharacters;
  }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}