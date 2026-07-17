const loadFile = async (name) => {
    for(const child of Array.from(document.querySelector("#table > tbody").children))
        child.remove();

    const f1 = await fetch(`/files/${name}`);
    const j1 = await f1.json();
    const f2 = await fetch(`/files/${name}?en=1`);
    const j2 = await f2.json();
    const f3 = await fetch(`/translations/${name}`);
    const j3 = await f3.json();

    for(const pair of j1) {
        const tr = document.createElement("tr");

        const td1 = document.createElement("td");
        td1.innerText = pair.text;
        tr.appendChild(td1);

        const td2 = document.createElement("td");
        td2.innerText = j2.find(x => x.attribute === pair.attribute).text;
        tr.appendChild(td2);

        const td3 = document.createElement("td");
        const inp = document.createElement("textarea");
        inp.value = j3.find(x => x.attribute === pair.attribute)?.tokipona || "";
        inp.style.height = "16px";
        td3.appendChild(inp);
        const button = document.createElement("button");
        button.addEventListener("click", async () => {
            const f = await fetch("/translations", { method: "POST", body: new URLSearchParams({
                file: name,
                attribute: pair.attribute.toString(),
                text: inp.value
            }) });
            f.status === 403 ? alert("you're not logged in!") : f.status === 200 ? alert("saved!") : alert("invalid toki pona text");
        });
        button.innerText = "save";
        td3.appendChild(button);
        tr.appendChild(td3);

        document.querySelector("#table > tbody").appendChild(tr);
    }
};
(async () => {
    const f = await fetch("/files");
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