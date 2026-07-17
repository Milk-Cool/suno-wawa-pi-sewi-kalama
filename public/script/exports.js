(async () => {
    const f = await fetch("/builds");
    const j = await f.json();
    for(const build of j) {
        const el = document.createElement("li");
        const a = document.createElement("a");
        a.innerText = `#${build.id} / by ${build.author} / ${new Date(build.time).toUTCString()}`;
        a.href = `/builds/${build.file}`;
        el.appendChild(a);
        document.querySelector("#exports").appendChild(el);
    }
})();
document.querySelector("#build").addEventListener("click", async () => {
    if(!confirm("this will take some time and will block others from building for the duration of the build. proceed anyway?")) return;
    document.querySelector("#build").disabled = true;
    document.querySelector("#build").innerText = "build started. please don't close or refresh the page";
    const f = await fetch("/build", { method: "POST" });
    if(f.status === 403) alert("you're not logged in!");
    else if(f.status !== 200) alert("something went wrong! please contact the administrators");
    location.reload();
});