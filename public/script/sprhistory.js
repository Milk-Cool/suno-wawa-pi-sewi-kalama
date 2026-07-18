(async () => {
    const f = await fetch(`/history/sprites`);
    const j = await f.json();
    for(const sprite of j) {
        const el = document.createElement("li");
        el.innerText = `#${sprite.id} / by ${sprite.author} / ${new Date(sprite.time).toUTCString()}\n${sprite.file}`;
        document.querySelector("#history").appendChild(el);
    }
})();