import { spawnSync } from "child_process";

export default function convert(op: "decode" | "encode", path: string, out: string = "") {
    // TODO: Windows compatibility maybe?
    if(spawnSync("./textool", [op, path].concat(out ? [out] : []), { stdio: "inherit" }).status !== 0) throw new Error(".tex conversion failed");
}