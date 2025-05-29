// 地圖相關變數
let map;
let marker;
let selectedLocation = null;

// 格式化地址
function formatAddress(address) {
    // 移除郵遞區號和國家
    let parts = address.split(',').map(part => part.trim());
    parts = parts.filter(part => !part.match(/^\d{3,6}$/) && part !== '臺灣');
    
    // 反轉地址順序
    parts.reverse();
    
    // 組合地址
    let formattedAddress = '';
    if (parts.length >= 2) {
        // 主要地址（區、里、路）
        formattedAddress = parts.slice(0, -1).join('');
        // 加入地標（如果有的話）
        if (parts[parts.length - 1].includes('站') || parts[parts.length - 1].includes('路')) {
            formattedAddress = parts[parts.length - 1] + ' ' + formattedAddress;
        }
    } else {
        formattedAddress = parts.join('');
    }
    
    return formattedAddress;
}

// 初始化地圖
function initMap() {
    // 預設位置（台灣中心）
    const defaultLocation = [121, 23.5];
    
    // 創建地圖
    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(defaultLocation),
            zoom: 7
        })
    });

    // 創建標記圖層
    const markerLayer = new ol.layer.Vector({
        source: new ol.source.Vector()
    });
    map.addLayer(markerLayer);

    // 點擊地圖時更新標記
    map.on('click', function(evt) {
        const coordinate = evt.coordinate;
        
        // 清除舊標記
        markerLayer.getSource().clear();
        
        // 添加新標記
        const feature = new ol.Feature({
            geometry: new ol.geom.Point(coordinate)
        });
        markerLayer.getSource().addFeature(feature);

        // 反向地理編碼
        const lonLat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lonLat[1]}&lon=${lonLat[0]}&zoom=18&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
                selectedLocation = {
                    address: formatAddress(data.display_name),
                    lat: lonLat[1],
                    lng: lonLat[0]
                };
            });
    });

    // 添加搜尋功能
    const searchInput = document.getElementById('searchBox');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchText = searchInput.value;
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&countrycodes=tw&limit=1`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        const result = data[0];
                        const coordinate = ol.proj.fromLonLat([parseFloat(result.lon), parseFloat(result.lat)]);
                        
                        // 更新地圖視圖
                        map.getView().animate({
                            center: coordinate,
                            zoom: 17,
                            duration: 1000
                        });

                        // 清除舊標記
                        markerLayer.getSource().clear();
                        
                        // 添加新標記
                        const feature = new ol.Feature({
                            geometry: new ol.geom.Point(coordinate)
                        });
                        markerLayer.getSource().addFeature(feature);

                        selectedLocation = {
                            address: formatAddress(result.display_name),
                            lat: parseFloat(result.lat),
                            lng: parseFloat(result.lon)
                        };
                    }
                });
        }
    });
}

// 當頁面載入完成時初始化地圖和日期選擇器
$(document).ready(function() {
    // 點擊位置圖標時開啟地圖模態框
    $('#locationIcon').click(function() {
        $('#mapModal').modal('show');
        // 確保地圖已初始化
        if (!map) {
            initMap();
        } else {
            // 重新調整地圖大小
            map.updateSize();
        }
    });

    // 確認位置按鈕點擊事件
    $('#confirmLocation').click(function() {
        if (selectedLocation) {
            $('#address-text').val(selectedLocation.address);
            $('#mapModal').modal('hide');
        }
    });

    // 初始化 Flatpickr 日期範圍選擇器
    flatpickr("#dateRangePicker", {
        mode: "range",
        showMonths: 2, // 顯示兩個月份
        locale: "zh", // 如果需要繁體中文
        dateFormat: "Y-m-d",
        minDate: "today", // 限制只能選擇今天及之後的日期
        position: "auto", // 自動調整彈出位置
    });
});

// 上傳圖片到 Cloudinary
async function uploadToCloudinary(file) {
    const cloudName = 'di4uqbo11'; // 請替換成您的 Cloudinary Cloud Name
    const uploadPreset = 'AirCnC'; // 請替換成您的 Upload Preset

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url; // 返回安全的 HTTPS 網址
        } else {
            throw new Error('上傳失敗');
        }
    } catch (error) {
        console.error('上傳圖片時發生錯誤:', error);
        throw error;
    }
}

// 原有的上傳圖片功能
const uploadImgBox = document.getElementById('uploadImgBox');
const carImgInput = document.getElementById('carImgInput');
let selectedFile = null; // 儲存選擇的檔案

uploadImgBox.addEventListener('click', () => {
    carImgInput.click();
});

carImgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        // 使用 FileReader 顯示本地預覽
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadImgBox.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
    }
});

// 車輛類型切換
$('#typeScooter').on("click",function(){
    $(this).addClass('active');
    $('#typeCar').removeClass('active');
})
$('#typeCar').on("click", function () {
    $(this).addClass('active');
    $('#typeScooter').removeClass('active');
})

$('.upload-form').on("submit", async function(e){
    e.preventDefault();
    if (!selectedFile){
        alert("請上傳照片！")
    } else if ($('#address-text').val() == "" || $('#model-text').val() == "" || $('#plate-text').val() == "" || $('#fee-text').val() == ""){
        alert("請填寫所有資料！");
    } else {
        try {
            // 顯示上傳中狀態
            uploadImgBox.innerHTML = '<div class="uploading">上傳中...</div>';
            
            // 上傳到 Cloudinary
            const imageUrl = await uploadToCloudinary(selectedFile);
            
            // 更新預覽為上傳後的圖片
            uploadImgBox.innerHTML = `<img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover;">`;
            
            // 在這裡可以使用 imageUrl 來獲取上傳後的圖片網址
            console.log('上傳的圖片網址:', imageUrl);
            
            // 收集所有表單資料
            const formData = {
                imageUrl: imageUrl,
                address: $('#address-text').val(),
                model: $('#model-text').val(),
                plate: $('#plate-text').val(),
                fee: $('#fee-text').val(),
                type: $('#typeScooter').hasClass('active') ? 'scooter' : 'car',
                dateRange: $('#dateRangePicker').val()
            };
            
            // TODO: 在這裡處理表單資料，例如發送到後端或區塊鏈
            console.log('表單資料:', formData);
            
            alert("上傳成功！");
        } catch (error) {
            alert('圖片上傳失敗，請重試');
            uploadImgBox.innerHTML = '<i class="fa-solid fa-plus"></i><span>點擊上傳圖片</span>';
        }
    }
})