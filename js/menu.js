import "./connent.js";
// 響應式漢堡選單
const hamburger = $('#hamburgerMenu');
const nav = $('#mainNav');
hamburger.click(function () {
    nav.toggleClass('active');
})

// 連線
$("#user-icon-btn").click(connect);