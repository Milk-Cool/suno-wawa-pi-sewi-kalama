import express from "express";
import * as db from "./src/db.ts";
import * as files from "./src/files.ts";
import fs from "fs";
import { ZipArchive } from "archiver";
import { join } from "path";

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
    res.send(files.parseMSBT(req.params.name));
});

app.get("/translations/:file", (req, res) => {
    res.send(db.getFile(req.params.file));
});
app.get("/translations/:file/:attribute", (req, res) => {
    res.send(db.getTranslations(req.params.file, parseInt(req.params.attribute)));
});
app.post("/translations", (req, res) => {
    db.addTranslation(req.body.file, parseInt(req.body.attribute), req.body.text, "TODO");
    res.send({ ok: true });
});

let building = false;
app.post("/build", (_req, res) => {
    if(building) return res.status(429).send({ status: "busy" });
    try {
        building = true;

        const out = fs.createWriteStream(join("builds", new Date().toISOString() + ".zip"));
        const archive = new ZipArchive();
        out.on("close", () => {
            res.send({ ok: true });
        });
        archive.pipe(out);

        for(const file of files.listMSBT()) {
            const translations = db.getFile(file);
            if(translations.length === 0) continue;
            const buf = files.patchMSBT(file, translations);
            archive.append(buf, { name: "mesg/" + files.baseLang + "/" + file });
        }

        archive.finalize();
    } catch(e) {
        console.error(e);
        res.send({ ok: false });
    } finally {
        building = false;
    }
});

app.listen(14339);