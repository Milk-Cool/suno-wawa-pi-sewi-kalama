const loadFile = async (name) => {
    for(const child of Array.from(document.querySelector("#preview").children))
        child.remove();

    const upload = document.createElement("input");
    upload.type = "file";
    document.querySelector("#preview").appendChild(upload);

    const submit = document.createElement("button");
    submit.innerText = "save";
    submit.addEventListener("click", async () => {
        const file = upload.files[0];
        if(!file) return alert("upload something first :(");
        const form = new FormData();
        form.append("file", name);
        form.append("png", file);
        const f = await fetch("/sprites", {
            method: "POST",
            body: form
        });
        if(f.status !== 200) return alert("some kind of error occured !!");
        alert("saved!");
    });
    document.querySelector("#preview").appendChild(submit);

    document.querySelector("#preview").appendChild(document.createElement("br"));
    const a = document.createElement("a");
    a.href = `/sprites/get?file=${encodeURIComponent(name)}`;
    a.download = name + ".png";
    a.innerText = "download original sprite";
    document.querySelector("#preview").appendChild(a);
    document.querySelector("#preview").appendChild(document.createElement("br"));

    const img = document.createElement("img");
    img.style.maxWidth = "500px";
    img.src = `/sprites/get?file=${encodeURIComponent(name)}`;
    document.querySelector("#preview").appendChild(img);
    const imgTranslated = document.createElement("img");
    imgTranslated.style.maxWidth = "500px";
    imgTranslated.addEventListener("error", () => imgTranslated.remove());
    imgTranslated.src = `/sprites/translated?file=${encodeURIComponent(name)}`;
    document.querySelector("#preview").appendChild(imgTranslated);
};
(async () => {
    const f = await fetch("/sprites");
    const j = await f.json();
    for(const file of j) {
        const el = document.createElement("li");
        const a = document.createElement("a");
        a.innerText = file;
        a.href = `javascript:void(0)`;
        a.addEventListener("click", () => {
            loadFile(file);
        });
        el.appendChild(a);
        document.querySelector("#files").appendChild(el);
    }
})();