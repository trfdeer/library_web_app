"use strict";

// TODO Add content to Home and Contact Page

import * as db from "./datastore.js";
import * as itbooks from "./itbookapi.js";

let userProfileForm = document.querySelector("#user-profile");

db.get("users", "default").then((res) => {
    if (!res) {
        (async function () {
            await createUser();
        })();
    }

    document
        .querySelector(".profile-image")
        .setAttribute("src", "data:image/jpeg;base64," + btoa(res.profileImg));
    userProfileForm.elements.userName.value = res.name;

    for (let i = 0; i < res.borrowed.length; i++) {
        db.get("books", res.borrowed[i]["isbn"], "isbn").then((book) => {
            addBookRow({
                title: book.title,
                isbn: res.borrowed[i]["isbn"],
                date: res.borrowed[i]["date"],
                due: res.borrowed[i]["due"],
            });
        });
    }
});

userProfileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    db.get("users", "default").then((userData) => {
        userData.name = e.target.elements.userName.value;
        db.update("users", userData);
        alert("Updated!");
    });
});

document.querySelector("#img").addEventListener("change", (e) => {
    let file = e.target.files[0];
    var reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
        db.get("users", "default").then((userData) => {
            userData.profileImg = e.target.result;
            db.update("users", userData);
            document
                .querySelector(".profile-image")
                .setAttribute(
                    "src",
                    "data:image/jpeg;base64," + btoa(userData.profileImg)
                );
            alert("Updated!");
        });
    };
});

function addBookRow(book) {
    let row = document.createElement("tr");
    row.dataset.isbn = book.isbn;

    let bookName = document.createElement("td");
    bookName.textContent = book.title;
    row.appendChild(bookName);

    let borrowDate = document.createElement("td");
    borrowDate.textContent = new Date(book.date).toLocaleDateString();
    row.appendChild(borrowDate);

    let dueDate = document.createElement("td");
    dueDate.textContent = new Date(book.due).toLocaleDateString();
    row.appendChild(dueDate);

    document.querySelector("tbody").appendChild(row);
}
async function createUser() {
    let id = "default";
    let userName = "";
    while (userName == "") {
        userName = prompt("Enter your name: ", "");
    }

    fetch("/static/images/blank.png").then((res) => {
        res.blob().then((e) => {
            let reader = new FileReader();
            reader.readAsBinaryString(e);
            reader.onload = (ev) => {
                db.add("users", {
                    id: id,
                    name: userName,
                    profileImg: ev.target.result,
                    borrowed: [],
                });
            };
        });
    });
    return id;
}

document.querySelector("table").addEventListener("click", (e) => {
    if (e.target.tagName == "TD") {
        let isbn = e.target.parentElement.dataset.isbn;
        /// itbooks.getBookDetails(isbn)
        db.get("books", isbn, "isbn").then((book) => {
            document.querySelector(".book-info .title").textContent =
                book["title"];
            document.querySelector(".book-info .subtitle").textContent =
                book["subtitle"];
            document.querySelector(".book-info .author").textContent =
                book["author"];
            document.querySelector(".book-info .description").textContent =
                book["description"];
            document
                .querySelector(".book-info img")
                .setAttribute("src", URL.createObjectURL(book["cover"]));

            document
                .querySelectorAll(".book-info .buttons .btn")
                .forEach((el) => {
                    el.dataset.isbn = isbn;
                });
            document.querySelector(".book-info").classList.add("shown");
        });
    }
});

document
    .querySelector(".book-info .card-title i")
    .addEventListener("click", (_) => {
        document.querySelector(".book-info").classList.remove("shown");
    });

document
    .querySelector(".book-info .return-button")
    .addEventListener("click", (e) => {
        let isbn = e.target.dataset.isbn;
        db.get("users", "default").then((user) => {
            let pos = -1;
            for (let i = 0; i < user.borrowed.length; i++) {
                if (user.borrowed[i]["isbn"] == e.target.dataset.isbn) {
                    pos = i;
                    break;
                }
            }
            user.borrowed.splice(pos, 1);
            db.update("users", user);
        });
        db.remove("books", isbn);
    });

document
    .querySelector(".book-info .reissue-button")
    .addEventListener("click", (e) => {
        db.get("users", "default").then((user) => {
            for (let i = 0; i < user.borrowed.length; i++) {
                if (user.borrowed[i]["isbn"] == e.target.dataset.isbn) {
                    let due = user.borrowed[i].due;
                    due.setDate(due.getDate() + 15);
                    user.borrowed[i].due = due;
                    db.update("users", user);
                }
            }
        });
    });
