"use strict";

const API_URL = "https://tgrp-cxany.herokuapp.com/https://api.itbook.store/1.0";

export async function search(term) {
    return await (
        await fetch(API_URL + "/search/" + encodeURIComponent(term))
    ).json();
}
export async function newReleases() {
    return await (await fetch(API_URL + "/new")).json();
}
export async function getBookDetails(isbn) {
    return await (await fetch(API_URL + "/books/" + isbn)).json();
}
