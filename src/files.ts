import fs from "fs";
import { join, } from "path";
import { tmpdir } from "os";
import { parse, stringify } from "yaml";
import convert from "./msbt.ts";
import type { Translation } from "./db.ts";
import { default as convertTP } from "./coverter.ts";
import { randomBytes } from "crypto";

export const baseLang = join("US", "USes");
export const enLang = join("US", "USen");

export type LocalizedString = {
    attribute: number;
    text: string;
};

export function listMSBT() {
    return fs.readdirSync(join("romfs", "mesg", baseLang)).filter(x => x.endsWith(".msbt"));
}
export function convertMSBT(path: string, lang = baseLang) {
    convert(join("romfs", "mesg", lang, path));
}
export function parseMSBT(path: string, lang = baseLang) {
    const fullpath = join("romfs", "mesg", lang, path + ".yaml");
    if(!fs.existsSync(fullpath)) // we do not edit the original file so it should be fine
        convertMSBT(path, lang);
    const parsed = parse(fs.readFileSync(fullpath, "utf-8"), { schema: "failsafe" });
    // @ts-ignore
    return Object.values(parsed.Messages).map(x => ({ attribute: parseInt(x.Attribute.toString(), 16), text: x.Contents } as LocalizedString));
}
export function patchMSBT(path: string, translations: Translation[]) {
    convertMSBT(path, baseLang);
    console.log("convert to yaml", path);
    const parsed = parse(fs.readFileSync(join("romfs", "mesg", baseLang, path + ".yaml"), "utf-8"), { schema: "failsafe" });
    parsed.SizePerAttribute = 5; // CRUTCH: MSBTConverter incorrectly determines the size as 9 bytes
    for(const k in parsed.Messages) {
        const all = translations.filter(x => x.attribute === parseInt(parsed.Messages[k].Attribute.toString(), 16));
        if(all.length === 0) continue;
        const translated = convertTP(all.sort((a, b) => b.time - a.time)[0].tokipona);
        parsed.Messages[k].Contents = translated;
        parsed.Messages[k].Attribute = parsed.Messages[k].Attribute.toString().padStart(10, "0");
    }

    const p = join(tmpdir(), randomBytes(4).toString("hex") + ".msbt.yaml");
    fs.writeFileSync(p, stringify(parsed, { nullStr: "" }).replace(/(?<=^\s*)"null":$/gm, `null:`)); // CRUTCH: we have null as our key sometimes
    
    convert(p);
    console.log("convert to msbt", path);
    return fs.readFileSync(p.replace(/\.yaml$/, ""));
}