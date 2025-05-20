// 圖片上傳互動
const uploadImgBox = document.getElementById('uploadImgBox');
const carImgInput = document.getElementById('carImgInput');
uploadImgBox.addEventListener('click', () => carImgInput.click());
carImgInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadImgBox.innerHTML = `<img src="${e.target.result}" style="max-width:90%;max-height:90%;border-radius:12px;">`;
        };
        reader.readAsDataURL(this.files[0]);
    }
});
// 車輛類型切換
document.getElementById('typeScooter').onclick = function () {
    this.classList.add('active');
    document.getElementById('typeCar').classList.remove('active');
};
document.getElementById('typeCar').onclick = function () {
    this.classList.add('active');
    document.getElementById('typeScooter').classList.remove('active');
};