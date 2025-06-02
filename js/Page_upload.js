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
    
    // 新增定位功能
    const locateMeButton = document.getElementById('locateMe');
    locateMeButton.addEventListener('click', function() {
        if (navigator.geolocation) {
            // 顯示定位中的提示訊息
            locateMeButton.disabled = true;
            locateMeButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lon = position.coords.longitude;
                    const lat = position.coords.latitude;
                    const coordinate = ol.proj.fromLonLat([lon, lat]);
                    
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
                    
                    // 反向地理編碼
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`)
                        .then(response => response.json())
                        .then(data => {
                            selectedLocation = {
                                address: formatAddress(data.display_name),
                                lat: lat,
                                lng: lon
                            };
                            
                            // 恢復按鈕狀態
                            locateMeButton.disabled = false;
                            locateMeButton.innerHTML = '<i class="fa-solid fa-crosshairs"></i>';
                        })
                        .catch(error => {
                            console.error('反向地理編碼出錯:', error);
                            
                            // 即使無法獲取地址，仍設置座標
                            selectedLocation = {
                                address: `經度: ${lon.toFixed(6)}, 緯度: ${lat.toFixed(6)}`,
                                lat: lat,
                                lng: lon
                            };
                            
                            // 恢復按鈕狀態
                            locateMeButton.disabled = false;
                            locateMeButton.innerHTML = '<i class="fa-solid fa-crosshairs"></i>';
                        });
                },
                function(error) {
                    // 處理錯誤
                    let errorMessage = '無法取得您的位置';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = '您拒絕了定位請求，請在瀏覽器設定中允許定位功能';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = '位置資訊無法獲取';
                            break;
                        case error.TIMEOUT:
                            errorMessage = '獲取位置請求超時';
                            break;
                    }
                    alert(errorMessage);
                    
                    // 恢復按鈕狀態
                    locateMeButton.disabled = false;
                    locateMeButton.innerHTML = '<i class="fa-solid fa-crosshairs"></i>';
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            alert('您的瀏覽器不支援定位功能');
        }
    });

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
$(document).ready(async function() {
    // 檢查錢包連接狀態
    if (!await checkIfConnected()) {
        alert("請先點擊右上角「個人頁面」圖示，連接MetaMask錢包！");
        window.location.href = "index.html"; // 如果未連接，跳轉到首頁
    } else {
        console.log("已連接錢包");
    }

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
        locale: "zh", // 繁體中文
        dateFormat: "Y-m-d",
        minDate: "today", // 限制只能選擇今天及之後的日期
        position: "auto", // 自動調整彈出位置
    });
    
    // 添加用戶圖標點擊事件
    $('#user-icon-btn').on('click', function() {
        connect(); // 呼叫連接函數
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

// 轉換eth單位函數 - 將字符串轉換為wei
function convertToWei(valueStr, unit) {
    const unitDecimals = {
        Ether: 18,
        Finney: 15,
        Szabo: 12,
        Gwei: 9,
        Mwei: 6,
        Kwei: 3,
        wei: 0,
    };
    return ethers.parseUnits(valueStr, unitDecimals[unit]);
  }

// 時間戳轉換函數 - 將日期字符串轉換為台灣時區(GMT+8)的unix時間戳
function dateToTimestamp(dateStr) {
    const date = new Date(dateStr);
    // 設定時間為當天的早上8點 (台灣時區的0點)
    date.setHours(0, 0, 0, 0);
    return Math.floor(date.getTime() / 1000);
}

// 檢查連接並獲取合約實例
async function getContractInstance() {
    // 檢查是否已連接錢包
    if (!await checkIfConnected()) {
        alert("請先連接錢包！");
        return null;
    }

    try {
        // 使用 ethers.BrowserProvider 創建 provider (Ethers v6)
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        console.log("Signer 地址：", await signer.getAddress());
        
        // 創建合約實例
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        return contract;
    } catch (error) {
        console.error("獲取合約實例時發生錯誤:", error);
        alert("連接智能合約失敗，請確保MetaMask已連接至正確網絡！");
        return null;
    }
}

$('.upload-form').on("submit", async function(e){
    e.preventDefault();
    
    const requiredFields = ['#address-text', '#model-text', '#plate-text', '#fee-text', '#phone-text'];
    const emptyField = requiredFields.find(selector => $(selector).val().trim() === "");
    
    // 基本表單驗證
    if (!selectedFile){
        alert("請上傳照片！");
        return;
    } else if (emptyField){
        alert("請填寫所有資料！");
        return;
    } else if ($('#dateRangePicker').val() == "") {
        alert("請選擇可預約日期範圍！");
        return;
    }
    
    try {
        // 顯示上傳中狀態
        uploadImgBox.innerHTML = '<div class="uploading">上傳中...</div>';
        
        // 上傳到 Cloudinary
        const imageUrl = await uploadToCloudinary(selectedFile);
        
        // 更新預覽為上傳後的圖片
        uploadImgBox.innerHTML = `<img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover;">`;
        
        console.log('上傳的圖片網址:', imageUrl);
        
        // 收集所有表單資料
        const formData = {
            imageUrl: imageUrl,
            address: $('#address-text').val(),
            model: $('#model-text').val(),
            plate: $('#plate-text').val(),
            phone: $('#phone-text').val(),
            feeInWei: $('#fee-text').val(),
            isscooter: $('#typeScooter').hasClass('active') ? true : false, // true為機車，false為汽車
            dateRange: $('#dateRangePicker').val()
        };
        
        // 處理日期範圍，轉換為開始和結束的時間戳（台灣時區）
        const dateRange = formData.dateRange.split(" 至 ");
        formData.startDate = dateToTimestamp(dateRange[0]);
        formData.endDate = dateRange.length > 1 ? dateToTimestamp(dateRange[1]) : formData.startDate;
        
        // 處理費用，轉換為wei (Ethers v6)
        const feeUnit = $('#fee-unit').val();

        formData.feeInWei = convertToWei(formData.feeInWei, feeUnit);
        
        console.log('表單資料:', formData);

        // 獲取合約實例
        const contract = await getContractInstance();
        if (!contract) return;
        
        // 顯示交易狀態模態框
        $('#txStatusModal').css('display', 'flex');
        $('#txStatusMessage').text('請在MetaMask確認交易...');
        
        try {
            // 呼叫智能合約的addCar方法
            const tx = await contract.addCar(
                formData.isscooter,              // _isscooter: 是否為機車
                formData.address,                // _locate: 地址
                formData.model,                  // _model: 型號
                formData.plate,                  // _plate: 車牌
                formData.feeInWei,               // _pricePerHour: 每小時價格
                formData.startDate,              // _fdcanstart: 可租用開始日期
                formData.endDate,                // _ldcanstart: 可租用結束日期
                formData.imageUrl,               // _imageURL: 圖片URL
                formData.phone                   // _phone: 聯絡電話
            );
            
            // 更新模態框狀態，顯示交易正在處理中
            $('#txStatusMessage').text('交易已提交，等待區塊鏈確認...');
            
            // 等待交易確認
            const receipt = await tx.wait();
            console.log("交易收據:", receipt);
            
            // 交易成功
            $('.status-title').text('成功');
            $('#txStatusMessage').text('車輛上傳成功！即將跳轉至個人頁面...');
            
            // 延遲2秒後跳轉，讓用戶可以看到成功訊息
            setTimeout(() => {
                window.location.href = "self.html"; // 上傳完成後跳轉到個人頁面
            }, 2000);
        } catch (error) {
            // 如果在交易執行過程中發生錯誤，在這裡處理
            console.error("交易執行錯誤:", error);
            $('#txStatusModal').css('display', 'none');
            
            if (error.message.includes("rejected")) {
                alert("您已取消交易！");
            } else if (error.reason) {
                alert(`交易失敗：${error.reason}`);
            } else {
                alert("交易失敗，請稍後再試！");
            }
            // 不抛出錯誤，以免進入外層的catch塊
            return;
        }
        
    } catch (error) {
        console.error("上傳過程中發生錯誤:", error);
        
        // 隱藏交易狀態模態框
        $('#txStatusModal').css('display', 'none');
        
        if (error.message && error.message.includes("rejected")) {
            alert("您已取消交易！");
        } else if (error.message && error.message.includes("Cloudinary")) {
            alert("圖片上傳失敗，請檢查您的網絡連接並重試！");
        } else {
            alert("上傳失敗，請檢查您的輸入並重試：" + error.message);
        }
        
        // 重設上傳區域，允許重新上傳
        uploadImgBox.innerHTML = '<i class="fa-solid fa-plus"></i><span>點擊上傳圖片</span>';
    }
})