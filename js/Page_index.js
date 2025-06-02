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

// 動態生成租車卡片
async function generateRentalCards(isscooter) {
    try {
        const rentalListContainer = document.getElementById('rentalList');
        // 獲取車輛數據
        const vehicles = await fetchAvailableCars(isscooter); // false 代表汽車，true 代表機車
        
        // 檢查是否有錯誤
        if (vehicles === "Error") {
            rentalListContainer.innerHTML = '<div class="error-message">載入時發生錯誤<br>請先安裝MetaMask!</div>';
            return;
        }

        // 檢查是否有可用車輛
        if (!vehicles || vehicles.length === 0) {
            rentalListContainer.innerHTML = '<div class="no-cars-message">目前沒有可用的車輛</div>';
            return;
        }

        // 清空容器
        rentalListContainer.innerHTML = '';
        
        // 為每個車輛創建卡片
        vehicles.forEach(vehicle => {
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
                    <div><span><b>計費方式</b>：</span>${vehicle.pricePerHour} wei/h</div>
                    <div><span><b>可租借日期</b>：</span>${timeToStr(vehicle.startTimestamp)} ~ ${timeToStr(vehicle.endTimestamp)}</div>
                    <button class="rent-btn" onclick="window.location.href='rent.html?id=${vehicle.id}'" ${vehicle.isActive ? 'disabled' : ''}>
                        ${vehicle.isActive ? '已出租' : '預約租車'}
                    </button>
                </div>
            `;
            rentalListContainer.appendChild(card);
        });
    } catch (error) {
        console.error("生成租車卡片時發生錯誤:", error);
        document.getElementById('rentalList').innerHTML = '<div class="error-message">載入車輛資料時發生錯誤</div>';
    }
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
    console.log("是否為機車：",isScooter)
    // 獲取&顯示 車輛信息
    generateRentalCards(isScooter);
});
