// 從 rentalData.js 導入資料
import { rentalList } from './rentalData.js';

// 驗證時間格式（只能選擇整點）
function validateTimeFormat(datetime) {
    const minutes = datetime.split('T')[1].split(':')[1];
    return minutes === '00';
}

// 驗證時間順序
function validateTimeOrder(startDateTime, endDateTime) {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    return start < end;
}

function calcDurationAndPrice(pricePerHour) {
    const startDateTime = document.getElementById('startDateTime').value;
    const endDateTime = document.getElementById('endDateTime').value;

    if (!startDateTime || !endDateTime) {
        document.getElementById('duration').textContent = '0小時';
        document.getElementById('totalPrice').textContent = '$ 0 wei';
        return;
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
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

$(document).ready(function() {
    // 從 URL 獲取車輛 ID
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = parseInt(urlParams.get('id'));

    // 查找對應的車輛資料
    const vehicle = rentalList.find(v => v.id === vehicleId);

    if (vehicle) {
        // 更新頁面內容
        $('.rent-detail-img img').attr('src', vehicle.image);
        $('.rent-detail-info h1').text(vehicle.model);
        $('#address-text').text(vehicle.location);
        
        // 更新詳細資訊表格
        $('#owner-text').text(`${vehicle.owner.slice(0,8)}`);
        $('#plate-text').text(`${vehicle.plate}`);
        $('#price-text').text(`$${vehicle.pricePerHour} wei/h`);

        // 更新可用日期
        const startDate = timeToStr(vehicle.startTimestamp);
        const endDate = timeToStr(vehicle.endTimestamp);
        $('.rent-detail-date span').eq(1).text(`${startDate} - ${endDate}`);

        // 設定日期時間選擇器的範圍
        const startDateTime = new Date(vehicle.startTimestamp * 1000);
        const endDateTime = new Date(vehicle.endTimestamp * 1000);
        
        // 設定最小和最大日期時間
        const minDateTime = startDateTime.toISOString().slice(0, 16);
        const maxDateTime = endDateTime.toISOString().slice(0, 16);
        
        $('#startDateTime').attr('min', minDateTime);
        $('#startDateTime').attr('max', maxDateTime);
        $('#endDateTime').attr('min', minDateTime);
        $('#endDateTime').attr('max', maxDateTime);

        // 設定初始值為最小日期時間
        $('#startDateTime').val(minDateTime);
        $('#endDateTime').val(minDateTime);

        // 監聽日期時間變更
        $('#startDateTime, #endDateTime').on('change', function() {
            const startDateTime = $('#startDateTime').val();
            const endDateTime = $('#endDateTime').val();

            // 移除之前的狀態類別
            $(this).removeClass('error success');

            // 驗證時間格式
            if (!validateTimeFormat(startDateTime) || !validateTimeFormat(endDateTime)) {
                alert('時間只能選擇整點！');
                $(this).addClass('error');
                $(this).val(minDateTime);
                return;
            }

            // 驗證時間順序
            if (!validateTimeOrder(startDateTime, endDateTime)) {
                alert('開始時間不能大於結束時間！');
                $('#endDateTime').addClass('error');
                $('#endDateTime').val(startDateTime);
                return;
            }

            // 添加成功狀態
            $(this).addClass('success');
            calcDurationAndPrice(vehicle.pricePerHour);
        });

        // 添加輸入框焦點效果
        $('#startDateTime, #endDateTime').on('focus', function() {
            $(this).parent().addClass('focused');
        }).on('blur', function() {
            $(this).parent().removeClass('focused');
        });

        // 表單提交處理
        $('#rentForm').on('submit', function(e) {
            e.preventDefault();
            const startDateTime = $('#startDateTime').val();
            const endDateTime = $('#endDateTime').val();

            // 提交前再次驗證
            if (!validateTimeFormat(startDateTime) || !validateTimeFormat(endDateTime)) {
                alert('時間只能選擇整點！');
                return;
            }

            if (!validateTimeOrder(startDateTime, endDateTime)) {
                alert('開始時間不能大於結束時間！');
                return;
            }

            alert('租車成功！');
        });

        // 頁面載入時先計算一次
        calcDurationAndPrice(vehicle.pricePerHour);

    } else {
        alert('找不到車輛資訊！');
        window.location.href = 'index.html';
    }
});

// 時間戳轉換為日期字串
function timeToStr(timestamp) {
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
} 

// 導航
$('#navigation-btn').click(function() {
    const address = $('.rent-detail-address').text();
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodedAddress}`, '_blank');
});