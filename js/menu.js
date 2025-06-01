import "./connent.js";
// 響應式漢堡選單
const hamburger = $('#hamburgerMenu');
const nav = $('#mainNav');
hamburger.click(function () {
    nav.toggleClass('active');
})