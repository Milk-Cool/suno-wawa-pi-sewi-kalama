import "dotenv/config";
import * as db from "./src/db.ts";
import { parseArgs } from "util";
import { randomBytes } from "crypto";

const { values } = parseArgs({
    options: {
        user: {
            type: "string",
            short: "u",
            multiple: true
        }
    }
});
if(values.user && values.user.length) {
    for(const user of values.user) {
        if(db.userExists(user)) {
            console.log(`${user} ! exists`);
            continue;
        }
        const token = randomBytes(32).toString("hex");
        db.addUser(user, token);
        console.log(`${user} : ${token}`);
    }
    process.exit(0);
}

import express from "express";
import * as files from "./src/files.ts";
import fs from "fs";
import { ZipArchive } from "archiver";
import { join } from "path";
import { default as convertTP } from "./src/coverter.ts";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
db.init();

if(!fs.existsSync("builds"))
    fs.mkdirSync("builds");

app.use(express.static("public"));
app.get("/files", (_req, res) => {
    res.send(files.listMSBT());
});
app.get("/files/:name", (req, res) => {
    if(req.params.name.includes("..") || req.params.name.includes("/") || req.params.name.includes("\\")) return res.status(400).send({ ok: false });
    res.send(files.parseMSBT(req.params.name, req.query.en ? files.enLang : files.baseLang));
});

app.post("/auth", (req, res) => {
    const name = db.authUser(req.body.token);
    if(!name) return res.status(401).send({ ok: false });
    return res.cookie("token", req.body.token, { sameSite: "lax" }).redirect("/pages/root.html");
});

app.get("/history/:page", (req, res) => {
    res.send(db.getHistory(parseInt(req.params.page)));
});

app.get("/translations/:file", (req, res) => {
    res.send(db.getFile(req.params.file));
});
app.get("/translations/:file/:attribute", (req, res) => {
    res.send(db.getTranslations(req.params.file, parseInt(req.params.attribute)));
});
app.post("/translations", (req, res) => {
    const name = db.authUser(req.cookies?.token || "");
    if(!name) return res.status(403).send({ ok: false });

    try { convertTP(req.body.text); }
    catch(_) { return res.status(400).send({ ok: false }); }
    db.addTranslation(req.body.file, parseInt(req.body.attribute), req.body.text, name);
    res.send({ ok: true });
});

let building = false;
app.post("/build", (req, res) => {
    const name = db.authUser(req.cookies?.token || "");
    if(!name) return res.status(403).send({ ok: false });

    if(building) return res.status(429).send({ status: "busy" });
    try {
        building = true;

        const fname = new Date().toISOString() + ".zip";
        const out = fs.createWriteStream(join("builds", fname));
        const archive = new ZipArchive();
        out.on("close", () => {
            db.addExport(fname, name);
            res.send({ ok: true });
        });
        archive.pipe(out);

        for(const file of files.listMSBT()) {
            const translations = db.getFile(file);
            if(translations.length === 0) continue;
            const buf = files.patchMSBT(file, translations);
            archive.append(buf, { name: "mesg/" + files.baseLang + "/" + file });
        }

        for(const f of fs.readdirSync("fonts")) archive.file(join("fonts", f), { name: "mesg/Font/" + f });

        archive.finalize();
    } catch(e) {
        console.error(e);
        res.status(500).send({ ok: false });
    } finally {
        building = false;
    }
});
app.get("/builds", (_req, res) => {
    res.send(db.getExports());
});
app.use("/builds", express.static("builds"));

app.listen(14339);