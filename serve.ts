import express from "express";
import convert from "./src/coverter.ts";

const app = express();

app.use(express.static("public"));

console.log(convert("sina wile pona la, o pilin e nena  lon tenpo ni!"))

app.listen(14339);