import express from "express";
import * as db from "./src/db.ts";
import * as files from "./src/files.ts";
import fs from "fs";
import { ZipArchive } from "archiver";
import { join } from "path";
import { default as convertTP } from "./src/coverter.ts";

const app = express();
app.use(express.urlencoded({ extended: true }));
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

app.get("/translations/:file", (req, res) => {
    res.send(db.getFile(req.params.file));
});
app.get("/history/:page", (req, res) => {
    res.send(db.getHistory(parseInt(req.params.page)));
});
app.get("/translations/:file/:attribute", (req, res) => {
    res.send(db.getTranslations(req.params.file, parseInt(req.params.attribute)));
});
app.post("/translations", (req, res) => {
    try { convertTP(req.body.text); }
    catch(_) { return res.status(400).send({ ok: false }); }
    db.addTranslation(req.body.file, parseInt(req.body.attribute), req.body.text, "TODO");
    res.send({ ok: true });
});

let building = false;
app.post("/build", (_req, res) => {
    if(building) return res.status(429).send({ status: "busy" });
    try {
        building = true;

        const fname = new Date().toISOString() + ".zip";
        const out = fs.createWriteStream(join("builds", fname));
        const archive = new ZipArchive();
        out.on("close", () => {
            db.addExport(fname, "TODO");
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