import { spawnSync } from "child_process";

export default function convert(path: string) {
    // TODO: Windows compatibility maybe?
    if(spawnSync("wine", ["msbt/MSBTConverter.exe", path], { stdio: "inherit" }).status !== 0) throw new Error("MSBT conversion failed");
}