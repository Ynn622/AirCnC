// 地圖相關變數
let map;
let marker;
let selectedLocation = null;

// 格式化地址
function formatAddress(address) {
    if (!address) return '地址未知';
    const {
        country,         // 中華民國 或 Taiwan
        state,           // 台灣
        county,          // 新竹縣、台中市等
        city,            // 台北市（有些縣轄市也會出現在 city）
        suburb,          // 區，如中山區、大安區
        town,            // 鎮、鄉
        village,         // 村、里
        neighbourhood,   // 鄰、社區
        road,            // 路、街
        pedestrian,      // 步道名稱
        house_number     // 門牌號碼
    } = address;

    // 組合行政區：從大到小
    const adminParts = [
        state,
        county || city,                          // 有些資料是用 county，有些是 city
        suburb || town || village || neighbourhood
    ];

    // 組合街道與門牌
    const streetParts = [
        road || pedestrian || '',                // 道路名稱
        house_number ? house_number + '號' : ''
    ];

    // 過濾掉空字串並串接
    const formattedAddress = [...adminParts, ...streetParts]
        .filter(Boolean) // 過濾 undefined/null/空字串
        .join('');
    console.log('格式化後的地址:', formattedAddress);
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
                                address: formatAddress(data.address),
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
                    address: formatAddress(data.address),
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

                        // 初始化 selectedLocation
                        selectedLocation = {
                            // 如果結果中有 address 欄位，使用它，否則使用 display_name
                            address: result.address ? formatAddress(result.address) : result.display_name,
                            lat: parseFloat(result.lat),
                            lng: parseFloat(result.lon)
                        };
                        
                        // 如果沒有正確的地址，嘗試使用反向地理編碼獲取完整地址資訊
                        if (!result.address) {
                            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${result.lat}&lon=${result.lon}&zoom=18&addressdetails=1`)
                                .then(response => response.json())
                                .then(data => {
                                    if (data && data.address) {
                                        selectedLocation.address = formatAddress(data.address);
                                    }
                                })
                                .catch(error => console.error('獲取詳細地址失敗:', error));
                        }
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

// 圖片上傳、裁剪功能
const uploadImgBox = document.getElementById('uploadImgBox');
const carImgInput = document.getElementById('carImgInput');
const cropperImage = document.getElementById('cropperImage');
const cropperModal = new bootstrap.Modal(document.getElementById('cropperModal'));
let selectedFile = null; // 儲存選擇的檔案
let croppedImage = null; // 儲存裁剪後的圖片
let cropper = null;

uploadImgBox.addEventListener('click', () => {
    carImgInput.click();
});

carImgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // 檢查檔案大小
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 10) {
            alert("圖片檔案過大，可能會影響載入速度。建議使用小於10MB的圖片。");
        }
        
        // 顯示裁剪模態框
        const reader = new FileReader();
        reader.onload = (e) => {
            // 設置裁剪圖片的來源
            cropperImage.src = e.target.result;
            
            // 打開裁剪模態框
            cropperModal.show();
            
            // 如果存在前一個裁剪實例，則銷毀它
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            
            // 判斷是否為手機版或平板
            const isMobile = window.innerWidth < 768;
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1200;
            
            // 根據設備尺寸調整裁剪器設置
            const cropperOptions = {
                aspectRatio: 1, // 裁剪框比例 (1:1)
                viewMode: 2, // 限制裁剪框，讓整個圖像都可見
                guides: true, // 顯示裁剪參考線
                background: true, // 顯示網格背景
                autoCropArea: 0.9, // 初始裁剪區域大小為圖片的 90%
                responsive: true, // 在窗口調整時重新渲染
                minCropBoxWidth: isMobile ? 220 : (isTablet ? 280 : 320), // 根據設備調整裁剪框最小寬度
                minCropBoxHeight: isMobile ? 220 : (isTablet ? 280 : 320), // 根據設備調整裁剪框最小高度
                checkOrientation: true, // 檢查圖片方向並自動修正
                wheelZoomRatio: 0.1, // 滑鼠滾輪縮放比例，更小更精細
                toggleDragModeOnDblclick: true, // 雙擊切換拖動/裁剪模式
                highlight: true, // 高光顯示裁剪框
                cropBoxMovable: true, // 允許移動裁剪框
                cropBoxResizable: true, // 允許調整裁剪框大小
                dragMode: 'move', // 預設拖動模式為移動畫布
                modal: true, // 顯示裁剪區域黑色遮罩
            };
            
            // 非手機版才設置最小容器寬高
            if (!isMobile) {
                cropperOptions.minContainerWidth = 800;
                cropperOptions.minContainerHeight = 500;
            }
            
            // 初始化裁剪器
            cropper = new Cropper(cropperImage, cropperOptions);
        };
        reader.readAsDataURL(file);
    }
});

// 確認裁剪按鈕點擊事件
document.getElementById('confirmCrop').addEventListener('click', () => {
    if (cropper) {
        // 顯示正在處理的提示
        document.getElementById('confirmCrop').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 處理中...';
        document.getElementById('confirmCrop').disabled = true;
        
        // 獲取原始裁剪區域的尺寸
        const data = cropper.getData();
        const originalWidth = Math.round(data.width);
        const originalHeight = Math.round(data.height);
        
        // 判斷是否為手機設備
        const isMobile = window.innerWidth < 768;
        
        // 根據設備不同選擇不同的輸出尺寸，手機上使用較小的尺寸以節省資源
        let outputWidth, outputHeight;
        if (isMobile) {
            // 手機版使用較小的尺寸
            outputWidth = Math.max(Math.min(originalWidth, 800), 500);
            outputHeight = Math.max(Math.min(originalHeight, 800), 500);
        } else {
            // 桌面版使用較大的尺寸
            outputWidth = Math.max(Math.min(originalWidth, 1200), 800);
            outputHeight = Math.max(Math.min(originalHeight, 1200), 800);
        }
        
        // 使用 setTimeout 使處理在UI更新後進行，避免阻塞界面
        setTimeout(() => {
            try {
                // 獲取裁剪的圖片 canvas，使用高質量設置
                const canvas = cropper.getCroppedCanvas({
                    width: outputWidth,
                    height: outputHeight,
                    fillColor: '#fff',
                    imageSmoothingEnabled: true,
                    imageSmoothingQuality: 'high',
                    maxWidth: 4096, // 防止某些瀏覽器對大尺寸 canvas 的限制
                    maxHeight: 4096 // 防止某些瀏覽器對大尺寸 canvas 的限制
                });
                
                // 根據設備選擇合適的圖片格式和壓縮率
                const imageFormat = isMobile ? 'image/jpeg' : 'image/png';
                const imageQuality = isMobile ? 0.9 : 1.0;
                
                // 將裁剪後的圖片轉換為 Blob 對象
                canvas.toBlob((blob) => {
                    // 創建預覽圖片
                    const croppedImageUrl = URL.createObjectURL(blob);
                    // 顯示裁剪後的圖片預覽
                    uploadImgBox.innerHTML = `<img src="${croppedImageUrl}" style="width:100%;height:100%;object-fit:cover;">`;
                    // 保存選擇的文件(裁剪後的Blob)
                    selectedFile = blob;
                    // 給Blob添加名稱和類型，以便上傳到Cloudinary
                    selectedFile.name = isMobile ? 'cropped-image.jpg' : 'cropped-image.png';
                    selectedFile.lastModified = new Date().getTime();
                    
                    console.log(`裁剪後圖片尺寸: ${outputWidth}x${outputHeight}, 格式: ${imageFormat}, 大小約: ${Math.round(blob.size / 1024)}KB`);
                    
                    // 恢復按鈕狀態
                    document.getElementById('confirmCrop').innerHTML = '確認裁剪';
                    document.getElementById('confirmCrop').disabled = false;
                    
                    // 關閉裁剪模態框
                    cropperModal.hide();
                }, imageFormat, imageQuality);
            } catch (error) {
                console.error('裁剪過程中發生錯誤:', error);
                alert('圖片裁剪失敗，請重試！');
                
                // 恢復按鈕狀態
                document.getElementById('confirmCrop').innerHTML = '確認裁剪';
                document.getElementById('confirmCrop').disabled = false;
            }
        }, 100);
    }
});

// 裁剪控制按鈕事件處理
document.querySelector('.cropper-controls').addEventListener('click', function(event) {
    const target = event.target.closest('[data-method]');
    if (!target) return;
    
    const method = target.getAttribute('data-method');
    const option = target.getAttribute('data-option');
    
    if (!cropper) return;
    
    switch (method) {
        case 'zoom':
            cropper.zoom(parseFloat(option));
            break;
        case 'rotate':
            cropper.rotate(parseFloat(option));
            break;
        case 'scaleX':
            const scaleX = cropper.getData().scaleX;
            cropper.scaleX(scaleX === 1 ? -1 : 1);
            break;
        case 'scaleY':
            const scaleY = cropper.getData().scaleY;
            cropper.scaleY(scaleY === 1 ? -1 : 1);
            break;
        case 'reset':
            cropper.reset();
            break;
    }
});

// 窗口大小變化時調整裁剪器
window.addEventListener('resize', () => {
    if (cropper) {
        // 當視窗大小變化時，重新調整裁剪器尺寸
        setTimeout(() => {
            cropper.resize();
            
            // 檢查當前裝置類型，並調整裁剪大小和比例
            const isMobile = window.innerWidth < 768;
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1200;
            
            // 根據設備類型調整容器的顯示方式
            if (isMobile) {
                document.querySelector('.img-container').style.height = '50vh';
            } else if (isTablet) {
                document.querySelector('.img-container').style.height = '65vh';
            } else {
                document.querySelector('.img-container').style.height = '80vh';
            }
        }, 200);
    }
});

// 監聽裁剪模態框顯示事件，確保裁剪器初始化後正確顯示
document.getElementById('cropperModal').addEventListener('shown.bs.modal', () => {
    if (cropper) {
        // 確保裁剪器在模態框顯示後進行調整
        setTimeout(() => {
            cropper.resize();
            
            // 處理模態框視窗大小調整
            const modalContent = document.querySelector('.modal-xl .modal-content');
            const modalDialog = document.querySelector('.modal-xl .modal-dialog');
            const imgContainer = document.querySelector('.img-container');
            const isMobile = window.innerWidth < 768;
            
            if (!isMobile) {
                // 桌面版視窗優化
                modalDialog.style.display = 'flex';
                modalDialog.style.alignItems = 'center';
                modalDialog.style.justifyContent = 'center';
                modalDialog.style.minHeight = '100vh';
                imgContainer.style.maxHeight = window.innerHeight * 0.8 + 'px';
            } else {
                // 移動版視窗優化
                modalDialog.style.margin = '10px auto';
            }
        }, 300);
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
        // 判斷是否為手機設備
        const isMobile = window.innerWidth < 768;
        
        // 顯示上傳中狀態，手機版顯示更簡化的提示
        if (isMobile) {
            uploadImgBox.innerHTML = '<div class="uploading"><div class="spinner"></div>上傳中...</div>';
        } else {
            uploadImgBox.innerHTML = '<div class="uploading"><div class="spinner"></div>上傳中，請稍候...</div>';
        }
        
        // 檢查文件大小，如果太大可能需要額外壓縮
        const fileSizeMB = selectedFile.size / (1024 * 1024);
        
        // 根據設備和文件大小決定是否需要進一步壓縮
        let fileToUpload = selectedFile;
        
        if (fileSizeMB > (isMobile ? 5 : 10)) {
            console.warn(`檔案大小為 ${fileSizeMB.toFixed(2)}MB，${isMobile ? '在手機上' : ''}可能上傳較慢或失敗`);
            // 這裡可以添加額外的壓縮邏輯，但為了保持圖片質量，我們暫時不實施
        }
        
        console.log(`準備上傳的圖片：大小 ${Math.round(selectedFile.size / 1024)}KB`);
        // 上傳裁剪後的圖片到 Cloudinary
        const imageUrl = await uploadToCloudinary(fileToUpload);
        
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
            } else if (error.reason == "Price must be greater than zero") {
                alert("價格必須大於零，請檢查您的輸入！");
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

// 優化移動設備上的交互體驗
function setupMobileEnhancements() {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1200;
    
    // 針對桌面版進行優化
    if (!isMobile && !isTablet) {
        // 給桌面版增加鍵盤快捷鍵
        document.addEventListener('keydown', function(e) {
            if (!cropper || !document.getElementById('cropperModal').classList.contains('show')) return;
            
            switch (e.key) {
                case 'ArrowLeft': // 向左旋轉
                    if (e.ctrlKey || e.metaKey) cropper.rotate(-90);
                    break;
                case 'ArrowRight': // 向右旋轉
                    if (e.ctrlKey || e.metaKey) cropper.rotate(90);
                    break;
                case '=': // 放大 (= 鍵，通常與 + 在同一個鍵位)
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault(); // 防止觸發瀏覽器原生縮放
                        cropper.zoom(0.1);
                    }
                    break;
                case '-': // 縮小
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault(); // 防止觸發瀏覽器原生縮放
                        cropper.zoom(-0.1);
                    }
                    break;
                case 'r': // 重置
                    cropper.reset();
                    break;
            }
        });
    }
    
    if (isMobile) {
        // 在移動設備上，檢測抖動設備的動作來旋轉圖片
        let lastAcceleration = { x: 0, y: 0, z: 0 };
        let shakeThreshold = 15;
        let lastShake = 0;
        
        // 監聽設備運動事件
        window.addEventListener('devicemotion', function(event) {
            if (!cropper || !document.getElementById('cropperModal').classList.contains('show')) return;
            
            let now = Date.now();
            if ((now - lastShake) < 800) return; // 避免過於頻繁的觸發
            
            const acceleration = event.accelerationIncludingGravity;
            
            const deltaX = Math.abs(acceleration.x - lastAcceleration.x);
            const deltaY = Math.abs(acceleration.y - lastAcceleration.y);
            const deltaZ = Math.abs(acceleration.z - lastAcceleration.z);
            
            if ((deltaX > shakeThreshold && deltaY > shakeThreshold) || 
                (deltaX > shakeThreshold && deltaZ > shakeThreshold) || 
                (deltaY > shakeThreshold && deltaZ > shakeThreshold)) {
                
                lastShake = now;
                // 抖動設備時旋轉圖片90度
                cropper.rotate(90);
            }
            
            lastAcceleration = { 
                x: acceleration.x, 
                y: acceleration.y, 
                z: acceleration.z 
            };
        });
        
        // 優化裁剪模態框在移動設備上的顯示
        document.getElementById('cropperModal').addEventListener('shown.bs.modal', function() {
            // 強制滾動到頂部，避免在某些移動設備上的定位問題
            window.scrollTo(0, 0);
            // 避免頁面可滾動，專注於裁剪操作
            document.body.style.overflow = 'hidden';
            // 在移動設備上確保模態框正確置中顯示
            document.querySelector('.modal-dialog').style.marginTop = '0';
            document.querySelector('.modal-dialog').style.marginBottom = '0';
            // 優化移動端裁剪體驗
            document.querySelector('.img-container').style.height = '50vh';
            
            // 增加提示訊息
            const tipElement = document.createElement('div');
            tipElement.className = 'mobile-gesture-tip';
            tipElement.style.cssText = 'position: fixed; bottom: 70px; left: 0; right: 0; text-align: center; color: #666; font-size: 12px; background: rgba(255,255,255,0.7); padding: 8px; z-index: 2000; border-radius: 4px; margin: 0 auto; width: 90%;';
            tipElement.innerHTML = '使用雙指可以放大縮小，抖動手機可旋轉圖片';
            document.body.appendChild(tipElement);
            
            // 3秒後隱藏提示
            setTimeout(() => {
                if (document.body.contains(tipElement)) {
                    tipElement.style.opacity = '0';
                    tipElement.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => {
                        if (document.body.contains(tipElement)) {
                            document.body.removeChild(tipElement);
                        }
                    }, 500);
                }
            }, 3000);
        });
        
        document.getElementById('cropperModal').addEventListener('hidden.bs.modal', function() {
            // 恢復頁面滾動
            document.body.style.overflow = '';
            
            // 移除可能殘留的提示元素
            const tip = document.querySelector('.mobile-gesture-tip');
            if (tip && document.body.contains(tip)) {
                document.body.removeChild(tip);
            }
        });
    }
}

// 在頁面載入時設置移動設備優化
$(document).ready(function() {
    setupMobileEnhancements();
});