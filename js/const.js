// 添加加載動畫
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// BigInt 格式化為帶逗號的字串
function formatBigIntWithCommas(bigIntValue) {
    return bigIntValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 添加使用者圖標點擊事件
$('#user-icon-btn').on('click', function () {
    connect();
});