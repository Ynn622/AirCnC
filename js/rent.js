// 計費單價
const pricePerHour = 30; // wei/h

function calcDurationAndPrice() {
    const startDate = document.getElementById('startDate').value;
    const startTime = document.getElementById('startTime').value;
    const endDate = document.getElementById('endDate').value;
    const endTime = document.getElementById('endTime').value;
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    let ms = end - start;
    if (isNaN(ms) || ms <= 0) {
        document.getElementById('duration').textContent = '0小時';
        document.getElementById('totalPrice').textContent = '$ 0 wei';
        return;
    }
    let hours = Math.floor(ms / (1000 * 60 * 60));
    let days = Math.floor(hours / 24);
    let remainHours = hours % 24;
    let durationStr = '';
    if (days > 0) durationStr += days + '天';
    if (remainHours > 0) durationStr += ' ' + remainHours + '小時';
    if (!durationStr) durationStr = '0小時';
    document.getElementById('duration').textContent = durationStr.trim();
    // 計算金額
    let total = hours * pricePerHour;
    document.getElementById('totalPrice').textContent = `$ ${total} wei`;
}

document.getElementById('startDate').addEventListener('change', calcDurationAndPrice);
document.getElementById('startTime').addEventListener('change', calcDurationAndPrice);
document.getElementById('endDate').addEventListener('change', calcDurationAndPrice);
document.getElementById('endTime').addEventListener('change', calcDurationAndPrice);

document.getElementById('rentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('租車成功！');
});

// 頁面載入時先計算一次
calcDurationAndPrice(); 