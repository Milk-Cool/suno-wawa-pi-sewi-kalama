const upd = async page => {
    for(const child of Array.from(document.querySelector("#history").children))
        child.remove();
    const f = await fetch(`/history/${page}`);
    const j = await f.json();
    for(const translation of j) {
        const el = document.createElement("li");
        el.innerText = `#${translation.id} / by ${translation.author} / ${new Date(translation.time).toUTCString()}\nfile ${translation.file}, attribute #${translation.attribute}:\n${translation.tokipona}`;
        document.querySelector("#history").appendChild(el);
    }
};
let page = 0;
upd(0);

document.querySelector("#prev").addEventListener("click", () => {
    if(page === 0) return;
    page--;
    upd(page);
});
document.querySelector("#next").addEventListener("click", () => {
    if(document.querySelector("#history").children.length === 0) return;
    page++;
    upd(page);
});