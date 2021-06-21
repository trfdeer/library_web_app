import Dexie from "./vendor/dexie.js";

document.querySelector("#reset").addEventListener("click", (e) => {
    if (confirm("Do you REALLY want to delete all data?")) {
        const db = new Dexie("BiblioDb");
        db.delete().then((_) => {
            alert("All data has been deleted.");
            window.location.assign("/");
        });
    }
});
