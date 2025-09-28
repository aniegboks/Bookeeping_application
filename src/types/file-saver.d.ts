import { saveAs } from "file-saver";

// Example usage
const blob = new Blob(["Hello world!"], { type: "text/plain;charset=utf-8" });
saveAs(blob, "hello.txt", { autoBom: true });
