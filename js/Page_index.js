// 獲取可用車輛並顯示在首頁
// 使用 Ethers.js v6

// 將日期時間戳轉換為格式化字串
function timeToStr(timestamp){
    // 轉換為日期（需要乘以 1000）
    const date = new Date(timestamp * 1000);
    // 輸出當地格式的日期（例如台灣時間）
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

// 檢查連接並獲取合約實例
async function getContractInstance() {
    try {
        // 使用 ethers.BrowserProvider 創建 provider (Ethers v6)
        const provider = new ethers.BrowserProvider(window.ethereum);
        // 創建合約實例 (唯讀模式，無需 signer)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        return contract;
    } catch (error) {
        console.error("獲取合約實例時發生錯誤:", error);
        return null;
    }
}

// 獲取所有可用車輛
async function fetchAvailableCars(isscooter) {
    try {
        // 顯示加載中動畫
        showLoading();
        
        // 獲取合約實例
        const contract = await getContractInstance();
        if (!contract) {
            console.error("無法獲取合約實例");
            return "Error";
        }

        // 調用合約的 getAvailableCars 方法獲取可用車輛 ID 列表
        const availableCarIds = await contract.getAvailableCars();
        console.log("可用車輛 ID:", availableCarIds);

        // 存儲所有車輛數據的數組
        const vehiclesData = [];

        // 對每個可用車輛 ID，獲取車輛詳細信息
        for (const carId of availableCarIds) {
            try {
                const car = await contract.getCar(carId);
                if (car.isscooter===isscooter) {
                    // 將合約返回的數據轉換為易於使用的對象
                    vehiclesData.push({
                        id: Number(car.carId),
                        isscooter: car.isscooter,
                        model: car.model,
                        pricePerHour: car.pricePerHour.toString(),
                        location: car.locate,
                        image: car.imageURL,
                        owner: car.owner,
                        plate: car.plate,
                        phone: car.phone,
                        status: Number(car.status),
                        startTimestamp: Number(car.fdcanstart),
                        endTimestamp: Number(car.ldcanstart),
                        isActive: Number(car.status) === 2 || Number(car.status) === 3  // 2=已預約, 3=使用中
                    });
                }
            } catch (error) {
                console.error(`獲取車輛 ID ${carId} 的詳細信息時發生錯誤:`, error);
            }
        }

        console.log("篩選的車輛數據:", vehiclesData);
        return vehiclesData;
    } catch (error) {
        console.error("獲取可用車輛時發生錯誤:", error);
        return [];
    } finally {
        // 隱藏加載中動畫
        hideLoading();
    }
}

// 過濾車輛資料
function filterVehicles(vehicles, filters) {
    return vehicles.filter(vehicle => {
        // 依據車型過濾
        if (filters.model && !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) {
            return false;
        }
        
        // 依據價格區間過濾
        const price = parseInt(vehicle.pricePerHour);
        if (filters.minPrice && price < parseInt(filters.minPrice)) {
            return false;
        }
        if (filters.maxPrice && price > parseInt(filters.maxPrice)) {
            return false;
        }
        
        // 依據日期範圍過濾
        if (filters.startDate && filters.endDate) {
            const startDateTimestamp = Math.floor(new Date(filters.startDate).getTime() / 1000);
            const endDateTimestamp = Math.floor(new Date(filters.endDate).getTime() / 1000);
            
            // 檢查篩選的日期範圍是否完全被包含在車輛可租借日期範圍內
            // 條件：租借開始日期需大於等於車輛可租借開始日期，且租借結束日期需小於等於車輛可租借結束日期
            if (startDateTimestamp < vehicle.startTimestamp || endDateTimestamp > vehicle.endTimestamp) {
                return false;
            }
        }
        
        return true;
    });
}

// 動態生成租車卡片
async function generateRentalCards(isscooter, filters = {}) {
    try {
        const rentalListContainer = document.getElementById('rentalList');
        // 顯示加載中動畫
        showLoading();
        
        // 獲取車輛數據
        const vehicles = await fetchAvailableCars(isscooter); // false 代表汽車，true 代表機車
        
        // 檢查是否有錯誤
        if (vehicles === "Error") {
            rentalListContainer.innerHTML = '<div class="error-message">載入時發生錯誤<br>請先安裝MetaMask!</div>';
            hideLoading();
            return;
        }

        // 如果有過濾條件，應用過濾
        const filteredVehicles = filters && Object.keys(filters).length > 0 
            ? filterVehicles(vehicles, filters) 
            : vehicles;

        // 檢查是否有可用車輛
        if (!filteredVehicles || filteredVehicles.length === 0) {
            rentalListContainer.innerHTML = '<div class="no-cars-message">無符合條件的車輛</div>';
            hideLoading();
            return;
        }

        // 清空容器
        rentalListContainer.innerHTML = '';
        
        // 為每個車輛創建卡片
        filteredVehicles.forEach(vehicle => {
            const card = document.createElement('div');
            card.className = 'rent-card col-md-6';
            card.innerHTML = `
                <img src="${vehicle.image}" alt="${vehicle.model}" class="vehicle-img" onerror="this.onerror=null;this.src='images/Noimage.png';">
                <div class="card-info">
                    <h2>${vehicle.model}</h2>
                    <div><span><b>車主</b>：</span>${vehicle.owner.slice(0,8)}...</div>
                    <div style="cursor:pointer" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vehicle.location)}', '_blank')"><span><b>地點</b>：</span>${vehicle.location}</div>
                    <div><span><b>聯絡電話</b>：</span>${vehicle.phone}</div>
                    <div><span><b>車牌</b>：</span>${vehicle.plate} </div>
                    <div><span><b>計費方式</b>：</span>${formatBigIntWithCommas(vehicle.pricePerHour)} wei/h</div>
                    <div><span><b>可租借日期</b>：</span>${timeToStr(vehicle.startTimestamp)} ~ ${timeToStr(vehicle.endTimestamp)}</div>
                    <button class="rent-btn" onclick="window.location.href='rent.html?id=${vehicle.id}'" ${vehicle.isActive ? 'disabled' : ''}>
                        ${vehicle.isActive ? '已出租' : '預約租車'}
                    </button>
                </div>
            `;
            rentalListContainer.appendChild(card);
        });
        
        hideLoading();
    } catch (error) {
        console.error("生成租車卡片時發生錯誤:", error);
        document.getElementById('rentalList').innerHTML = '<div class="error-message">載入車輛資料時發生錯誤</div>';
        hideLoading();
    }
}

// 處理搜尋功能
function setupSearchFunctionality(isScooter) {
    // 初始化搜尋相關元素
    const searchModelInput = document.getElementById('searchModel');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const dateRangePickerInput = document.getElementById('dateRangePicker');
    const resetButton = document.getElementById('resetBtn');
    
    // 初始化 Flatpickr 日期範圍選擇器
    let dateRangePicker = flatpickr("#dateRangePicker", {
        mode: "range",
        showMonths: 2, // 顯示兩個月份
        locale: "zh", // 繁體中文
        dateFormat: "Y-m-d",
        position: "auto", // 自動調整彈出位置
        onChange: function(selectedDates) {
            // 日期選擇變更後立即執行搜尋
            if (selectedDates.length === 2) {
                performSearch();
            }
        }
    });
    
    // 執行搜尋的函數
    function performSearch() {
        const filters = {
            model: searchModelInput.value.trim(),
            minPrice: minPriceInput.value.trim() ? minPriceInput.value.trim() : null,
            maxPrice: maxPriceInput.value.trim() ? maxPriceInput.value.trim() : null
        };
        
        // 獲取選擇的日期範圍
        const selectedDates = dateRangePicker.selectedDates;
        if (selectedDates && selectedDates.length === 2) {
            filters.startDate = selectedDates[0];
            filters.endDate = selectedDates[1];
        }
        
        // 移除空值
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });
        
        // 執行過濾搜尋
        generateRentalCards(isScooter, filters);
    }
    
    // 重置按鈕事件
    resetButton.addEventListener('click', function() {
        searchModelInput.value = '';
        minPriceInput.value = '';
        maxPriceInput.value = '';
        dateRangePicker.clear(); // 清空日期選擇器
        generateRentalCards(isScooter);
    });
    
    // 搜尋車型欄位失焦時進行搜尋
    searchModelInput.addEventListener('blur', performSearch);
    
    // 輸入欄位按 Enter 鍵也進行搜尋
    searchModelInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.target.blur(); // 失焦以觸發 blur 事件進行搜尋
        }
    });
    
    // 其他輸入欄位改變時也進行搜尋
    minPriceInput.addEventListener('change', performSearch);
    maxPriceInput.addEventListener('change', performSearch);
}

// 頁面載入時生成卡片
window.addEventListener('DOMContentLoaded', function() {
    // 添加使用者圖標點擊事件
    document.getElementById('user-icon-btn').addEventListener('click', function() {
        connect();
    });
    
    // 從 URL 獲取 - 是否為機車的參數
    const urlParams = new URLSearchParams(window.location.search);
    const isScooter = urlParams.get('isScooter') === 'false' ? false : true;
    console.log("是否為機車：", isScooter);
    
    // 設置搜尋功能
    setupSearchFunctionality(isScooter);
    
    // 獲取&顯示 車輛信息
    generateRentalCards(isScooter);
});
