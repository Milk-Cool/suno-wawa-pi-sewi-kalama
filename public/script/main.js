const link = (id, loc) => document.getElementById(id).addEventListener("click", () => document.querySelector("#content").src = loc);
link("root", "/pages/root.html");
link("exports", "/pages/exports.html");
link("files", "/pages/files.html");
link("history", "/pages/history.html");
link("login", "/pages/login.html");
link("sprites", "/pages/sprites.html");

document.querySelector("#root").click();