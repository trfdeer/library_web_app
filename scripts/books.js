"use strict";

import * as itbooks from "./itbookapi.js";
import * as db from "./datastore.js";

function writeBookElement(book, target) {
    let bookElement = document.createElement("div");
    bookElement.classList.add("book", "grid");

    let bookCover = document.createElement("img");
    bookCover.setAttribute("src", book["image"]);
    let title = document.createElement("h2");
    title.textContent = book["title"];

    let subtitle = document.createElement("p");
    subtitle.textContent = book["subtitle"];

    let buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("buttons");

    let infoButton = document.createElement("button");
    infoButton.classList.add("btn", "info-button");
    infoButton.dataset["isbn"] = book["isbn13"];
    infoButton.textContent = "More Info";

    let borrowButton = document.createElement("button");
    borrowButton.classList.add("btn", "borrow-button");
    borrowButton.dataset["isbn"] = book["isbn13"];
    borrowButton.textContent = "Borrow";

    buttonsContainer.appendChild(infoButton);
    buttonsContainer.appendChild(borrowButton);
    bookElement.appendChild(bookCover);
    bookElement.appendChild(title);
    bookElement.appendChild(subtitle);
    bookElement.appendChild(buttonsContainer);

    target.appendChild(bookElement);
}

let searchForm = document.querySelector("form.search-form");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let q = searchForm.elements.q.value;
    itbooks.search(q).then((results) => {
        let msg = "";
        if (results["total"] == 0) {
            msg = "No results Found";
        } else {
            msg = "10 / " + results["total"] + " results showing";
        }
        document.querySelector("#book-list").innerHTML = "";
        document.querySelector("#status").textContent = msg;
        let count = results["total"] > 10 ? 10 : results["total"];
        for (let i = 0; i < count; i++) {
            writeBookElement(
                results.books[i],
                document.querySelector("#book-list")
            );
        }
    });
});

document.querySelector(".books").addEventListener("click", (e) => {
    if (e.target.classList.contains("info-button")) {
        let isbn = e.target.dataset["isbn"];
        itbooks.getBookDetails(isbn).then((book) => {
            document.querySelector(".book-info .title").textContent =
                book["title"];
            document.querySelector(".book-info .subtitle").textContent =
                book["subtitle"];
            document.querySelector(".book-info .author").textContent =
                book["authors"];
            document.querySelector(".book-info .description").textContent =
                book["desc"];
            document
                .querySelector(".book-info img")
                .setAttribute("src", book["image"]);
            document.querySelector(".book-info").classList.add("shown");
        });
    } else if (e.target.classList.contains("borrow-button")) {
        let isbn = e.target.dataset["isbn"];
        itbooks.getBookDetails(isbn).then((book) => {
            document.querySelector(".book-borrow .title").textContent =
                book["title"];
            document.querySelector(".book-borrow .author").textContent =
                book["authors"];
            document.querySelector("#borrow-form").elements.isbn.value = isbn;
            document.querySelector(".book-borrow").classList.add("shown");
        });
    }
});

document
    .querySelector(".book-info .card-title i")
    .addEventListener("click", (_) => {
        document.querySelector(".book-info").classList.remove("shown");
    });

document
    .querySelector(".book-borrow .card-title i")
    .addEventListener("click", (_) => {
        document.querySelector(".book-borrow").classList.remove("shown");
    });

document.querySelector("#borrow-form").addEventListener("submit", (e) => {
    e.preventDefault();
    let userId = e.target.elements.accountNumber.value;
    let isbn = e.target.elements.isbn.value;

    db.get("users", userId).then((user) => {
        if (user) {
            if (user.borrowed.some((x) => x.isbn == isbn)) {
                alert("You've already borrowed this book");
            } else {
                if (user.borrowed.length < 5) {
                    itbooks.getBookDetails(isbn).then((book) => {
                        fetch(
                            "https://tgrp-cxany.herokuapp.com/" + book["image"]
                        ).then((resp) =>
                            resp.blob().then((cover) => {
                                db.add("books", {
                                    isbn: book["isbn13"],
                                    title: book["title"],
                                    author: book["authors"],
                                    subtitle: book["subtitle"],
                                    description: book["desc"],
                                    cover: cover,
                                });
                            })
                        );
                        let date = new Date(Date.now());
                        let due = new Date();
                        due.setDate(date.getDate() + 30);

                        user.borrowed.push({
                            isbn: isbn,
                            date: date,
                            due: due,
                        });
                        db.update("users", user);
                        document
                            .querySelector(".book-borrow")
                            .classList.remove("shown");
                    });
                } else {
                    alert("You've already borrowed 5 books.");
                }
            }
        } else {
            alert("Invalid User Id");
        }
    });
});
