import { MyCarList, getMyCarList } from './getMyCarsData.js';
import { RentalsList, getMyRentalsList } from './getMyRentalsData.js';

// 將資料暴露到全局作用域
window.MyCarList = MyCarList;
window.RentalsList = RentalsList;
window.getMyCarList = getMyCarList;
window.getMyRentalsList = getMyRentalsList;

// 時間戳轉換為日期字串
function timeToStr(timestamp) {
    // 轉換為日期（需要乘以 1000）
    const date = new Date(timestamp * 1000);
    
    // 獲取年、月、日
    const year = date.getFullYear();
    // 月份從0開始，所以加1，並確保是兩位數
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // 獲取小時和分鐘，確保是兩位數
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // 輸出格式為 yyyy-mm-dd hh:mm
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 標籤切換功能
function setupTabsAndFilters() {
    // 標籤切換
    $('.tab-btn').click(function() {
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        const tabId = $(this).data('tab');
        $('.data-container').removeClass('active');
        
        if(tabId === 'owner-data') {
            $('#ownerDataContainer').addClass('active');
            updateFilterOptions('owner');
        } else if(tabId === 'rental-data') {
            $('#rentalDataContainer').addClass('active');
            updateFilterOptions('rental');
        }
    });
    
    // 過濾器變更事件
    $('#dataFilter').change(function() {
        const filterValue = $(this).val();
        const activeTab = $('.tab-btn.active').data('tab');
        
        if(activeTab === 'owner-data') {
            console.log("過濾車主資料，選擇的過濾器:", filterValue);
            renderOwnerData(filterValue);
        } else if(activeTab === 'rental-data') {
            console.log("過濾租賃資料，選擇的過濾器:", filterValue);
            renderRentalData(filterValue);
        }
    });
}

// 更新過濾器選項
function updateFilterOptions(tabType) {
    const filterSelect = $('#dataFilter');
    filterSelect.empty();
    
    if(tabType === 'owner') {
        filterSelect.append('<option value="all">全部</option>');
        filterSelect.append('<option value="available">已上傳待租</option>');
        filterSelect.append('<option value="reserved">已被預約</option>');
        filterSelect.append('<option value="renting">出租中</option>');
        filterSelect.append('<option value="history">歷史出租</option>');
    } else if(tabType === 'rental') {
        filterSelect.append('<option value="all">全部</option>');
        filterSelect.append('<option value="reserved">已預約</option>');
        filterSelect.append('<option value="renting">租車中</option>');
        filterSelect.append('<option value="history">歷史租車</option>');
    }
    
    // 觸發過濾器變更事件來更新顯示
    filterSelect.trigger('change');
}

// 渲染車主資料
function renderOwnerData(filter) {
    const container = $('#ownerDataContainer');
    container.empty();
    
    // 這裡從 MyCarList 獲取資料並根據 filter 進行過濾
    MyCarList.forEach(car => {
        // 根據 filter 條件過濾
        let shouldShow = false;
        
        switch(filter) {
            case 'all':
                shouldShow = true;
                break;
            case 'available':
                shouldShow = car.status === 1; // 可出租
                break;
            case 'reserved':
                shouldShow = car.status === 2; // 已被預約
                break;
            case 'renting':
                shouldShow = car.status === 3; // 出租中
                break;
            case 'history':
                shouldShow = car.status === 4 || car.status === 5; // 歷史出租 (包含已結束租車和已被下架)
                break;
        }
        
        if(shouldShow) {
            const statusInfo = getStatusInfo(car.status);
            const card = $(`
                <div class="uploaded-card">
                    <img src="${car.imageURL}" alt="${car.model}" class="vehicle-img" onerror="this.src='images/scooter.jpg'">
                    <div class="card-info">
                        <h2>${car.model}</h2>
                        <div class="status-info"> ${statusInfo.icon} &nbsp;${statusInfo.text}</div>
                        <div><b>地址</b>：${car.locate} <i class="fa-solid fa-location-dot" style="cursor:pointer" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(car.locate)}', '_blank')"></i></div>
                        <div><b>車牌</b>：${car.plate}</div>
                        <div><b>計費方式</b>：$${car.pricePerHour} wei/h</div>
                        ${(car.status===2 || car.status===3) ? `<div><b>被預約日期</b>：${timeToStr(car.fdcanstart)} ~ ${timeToStr(car.ldcanstart)}</div>` : 
                                        `<div><b>提供日期</b>：${timeToStr(car.fdcanstart)} ~ ${timeToStr(car.ldcanstart)}</div>`}
                        ${getButtonByStatus(car)}
                    </div>
                </div>
            `);
            container.append(card);
        }
    });
    
    // 如果沒有資料顯示提示
    if(container.children().length === 0) {
        container.append('<div class="no-data">沒有符合條件的資料</div>');
    }
}

// 渲染已租資料
function renderRentalData(filter) {
    const container = $('#rentalDataContainer');
    container.empty();
    
    // 這裡從 RentalsList 獲取資料並根據 filter 進行過濾
    RentalsList.forEach(rental => {
        // 使用租賃數據中包含的車輛詳情
        const carDetails = rental.carDetails || {};

        // 根據 filter 條件過濾
        let shouldShow = false;
        const nowTimeStamp = Math.floor(Date.now() / 1000);
        
        switch(filter) {
            case 'all':
                shouldShow = true;
                break;
            case 'renting':
                shouldShow = rental.isActive; // 租賃進行中
                break;
            case 'reserved':
                shouldShow = rental.carDetails.status === 2; // 已預約未開始
                break;
            case 'history':
                shouldShow = rental.carDetails.status === 4; // 已結束
                break;
        }
        
        if(shouldShow) {
            const rentalStatusInfo = getRentalStatusInfo(carDetails);
            const card = $(`
                <div class="uploaded-card">
                    <img src="${carDetails.imageURL || 'images/scooter.jpg'}" alt="${carDetails.model || '車輛'}" class="vehicle-img" onerror="this.src='images/scooter.jpg'">
                    <div class="card-info">
                        <h2>${carDetails.model || '未知車型'}</h2>
                        <div class="status-info">${rentalStatusInfo.icon} ${rentalStatusInfo.text}</div>
                        <div><b>車主</b>：${carDetails.owner ? carDetails.owner.slice(0,8) + '...' : '未知'}</div>
                        <div><b>地址</b>：${carDetails.locate || '未知'} <i class="fa-solid fa-location-dot" style="cursor:pointer" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(carDetails.locate || '')}', '_blank')"></i></div>
                        <div><b>聯絡電話</b>：${carDetails.phone || '未知'}</div>
                        <div><b>車牌</b>：${carDetails.plate || '未知'}</div>
                        <div><b>計費方式</b>：$${carDetails.pricePerHour || 0} wei/h</div>
                        <div><b>預約日期</b>：${timeToStr(rental.startTimestamp)} ~ ${timeToStr(rental.endTimestamp)}</div>
                        <div><b>總費用</b>：$${rental.ftotalCost} wei</div>
                        ${getRentalButtonByStatus(rental)}
                    </div>
                </div>
            `);
            container.append(card);
        }
    });
    
    // 如果沒有資料顯示提示
    if(container.children().length === 0) {
        container.append('<div class="no-data">沒有符合條件的資料</div>');
    }
}

// 根據狀態取得車輛狀態資訊
function getStatusInfo(status) {
    switch(status) {
        case 1: // 已上傳待租
            return {icon: '<i class="fa-solid fa-circle-up"></i>', text: '已上傳待租' };
        case 2: // 已被預約
            return {icon: '<i class="fa-solid fa-calendar-check"></i>', text: '已被預約' };
        case 3: // 出租中
            return {icon: '<i class="fa-solid fa-car-side"></i>', text: '出租中' };
        case 4: // 歷史租車
            return {icon: '<i class="fa-solid fa-clock-rotate-left"></i>', text: '已結束出租' };
        case 5: // 已被下架
            return {icon: '<i class="fa-solid fa-box-archive"></i>', text: '已被下架' };
        default:
            return {icon: '<i class="fa-solid fa-circle-question"></i>', text: '未知狀態'};
    }
}

// 根據租賃狀態取得狀態資訊
function getRentalStatusInfo(rental) {
    const nowTimeStamp = Math.floor(Date.now() / 1000);
    switch(rental.status) {
        case 2: // 已預約
            return {icon: '<i class="fa-solid fa-calendar-check"></i>', text: '已預約'};
        case 3: // 租車中
            return { icon: '<i class="fa-solid fa-car-side"></i>', text: '租車中' };
        case 4: // 已結束租用
            return {icon: '<i class="fa-solid fa-clock-rotate-left"></i>', text: '已結束租用'};
        default:
            return { icon: '<i class="fa-solid fa-circle-question"></i>', text: '等待確認' };
    }
}

// 根據車輛狀態產生對應按鈕
function getButtonByStatus(car) {
    switch(car.status) {
        case 1: // 已上傳待租
            return `<div><button class="remove-btn" data-carid="${car.carId}">下架車輛</button></div>`;
        case 2: // 已被預約
            return `<div><button class="confirm-btn" data-carid="${car.carId}">確認租車</button></div>`;
        case 3: // 出租中
            return `<div><button class="confirm-return-btn" data-carid="${car.carId}">確認還車</button></div>`;
        case 4: // 已結束租車
            return '';
        default:
            return '';
    }
}

// 根據租賃狀態產生對應按鈕
function getRentalButtonByStatus(rental) {
    const nowTimeStamp = Math.floor(Date.now() / 1000);
    
    if(rental.isActive) {
        if(!rental.renterConfirmed) {
            // 如果租賃活躍但租戶確認為假，顯示「已確認還車」按鈕
            return `<div><button class="confirm-return-btn" disabled>已確認還車</button></div>`;
        } else {
            // 正常租賃中，顯示「確認還車」按鈕
            return `<div><button class="confirm-return-btn" data-carid="${rental.carId}">確認還車</button></div>`;
        }
    } else if(rental.carDetails.status === 2) {
        // 未過期的預約
        if(rental.renterConfirmed) {
            // 如果租戶已確認，顯示已確認按鈕（不可點擊）和取消預約按鈕
            return `<div><button class="confirm-btn" disabled>已確認租車</button> <button class="cancel-btn" data-carid="${rental.carId}">取消預約</button></div>`;
        } else {
            // 如果租戶未確認，顯示確認租車按鈕和取消預約按鈕
            return `<div><button class="confirm-btn" data-carid="${rental.carId}">確認租車</button> <button class="cancel-btn" data-carid="${rental.carId}">取消預約</button></div>`;
        }
    } else {
        // 已過期的預約，不顯示按鈕
        return '';
    }
}

// 更新個人資料
async function updateUserInfo() {
    const userName = await getAccount();
    $("#userName").text(userName.slice(0, 6) + "..." + userName.slice(-4));
    $("#userBalance").text(await getBalance(provider, userName) + " Ether");
    $("#chainName").text(await getChainNameByID(ethObj.chainId));
}

// 處理車輛下架操作
async function handleRemoveCar(carId) {
    try {
        showLoading();
        
        // 創建合約實例
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        
        // 調用合約的 removeCar 方法
        const tx = await contract.setCarAvailability(carId);
        
        // 等待交易確認
        $('#loading p').text('交易提交中，請稍等...');
        const receipt = await tx.wait();
        
        console.log("下架車輛交易收據:", receipt);
        
        alert('車輛已成功下架！');
        
        // 重新載入資料
        await refreshData();
        
    } catch (error) {
        console.error("下架車輛失敗:", error);
        
        if (error.message && error.message.includes("user rejected")) {
            alert("您已取消操作！");
        } else {
            alert("下架車輛失敗: " + error.message);
        }
    } finally {
        hideLoading();
    }
}

// 處理確認租車操作
async function handleConfirmRental(carId) {
    try {
        showLoading();

        console.log("開始確認租車，車輛ID:", carId);

        // 創建合約實例
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        
        // 調用合約確認租車方法
        const tx = await contract.startRental(carId);
        
        // 等待交易確認
        $('#loading p').text('交易提交中，請稍等...');
        const receipt = await tx.wait();
        
        console.log("確認租車交易收據:", receipt);
        
        alert('已確認租車！');
        
        // 重新載入資料
        await refreshData();
        
    } catch (error) {
        console.error("確認租車失敗:", error);
        
        if (error.message && error.message.includes("user rejected")) {
            alert("您已取消操作！");
        } else {
            alert("確認租車失敗: " + error.message);
        }
    } finally {
        hideLoading();
    }
}

// 處理確認還車操作
async function handleConfirmReturn(carId) {
    try {
        showLoading();
        
        // 創建合約實例
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        
        // 調用合約確認還車方法
        const tx = await contract.confirmReturn(carId);
        
        // 等待交易確認
        $('#loading p').text('交易提交中，請稍等...');
        const receipt = await tx.wait();
        
        console.log("確認還車交易收據:", receipt);
        
        alert('已確認還車！');
        
        // 重新載入資料
        await refreshData();
        
    } catch (error) {
        console.error("確認還車失敗:", error);
        
        if (error.message && error.message.includes("user rejected")) {
            alert("您已取消操作！");
        } else {
            alert("確認還車失敗: " + error.message);
        }
    } finally {
        hideLoading();
    }
}

// 處理取消預約操作
async function handleCancelRental(carId) {
    try {
        showLoading();
        
        // 創建合約實例
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        console.log("取消預約合約實例:", contract);
        // 調用合約取消租車方法
        const tx = await contract.cancelRental(carId);
        
        // 等待交易確認
        $('#loading p').text('交易提交中，請稍等...');
        const receipt = await tx.wait();
        
        console.log("取消預約交易收據:", receipt);
        
        alert('已取消預約！');
        
        // 重新載入資料
        await refreshData();
        
    } catch (error) {
        console.error("取消預約失敗:", error);
        
        if (error.message && error.message.includes("user rejected")) {
            alert("您已取消操作！");
        } else {
            alert("取消預約失敗: " + error.message);
        }
    } finally {
        hideLoading();
    }
}

// 刷新頁面資料
async function refreshData() {
    try {
        showLoading();
        
        // 重新獲取資料
        await getMyCarList();
        await getMyRentalsList();
        
        // 更新顯示
        const activeTab = $('.tab-btn.active').data('tab');
        if (activeTab === 'owner-data') {
            renderOwnerData($('#dataFilter').val());
        } else if (activeTab === 'rental-data') {
            renderRentalData($('#dataFilter').val());
        }
        
    } catch (error) {
        console.error("刷新資料失敗:", error);
    } finally {
        hideLoading();
    }
}

// 頁面載入初始化
$(async function() {
    try {
        showLoading();
        
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("鏈 ID:", chainId);
        
        // 更新用戶資料
        await updateUserInfo();
        
        // 設置標籤和過濾器
        setupTabsAndFilters();
        
        // 重新獲取資料
        await refreshData();
        
        // 默認顯示車主資料
        $('.tab-btn[data-tab="owner-data"]').trigger('click');
        
        // 綁定按鈕事件
        $(document).on('click', '.remove-btn', function() {
            const carId = $(this).data('carid');
            if (confirm('確定要下架此車輛嗎？')) {
                handleRemoveCar(carId);
            }
        });
        
        $(document).on('click', '.confirm-btn', function() {
            const carId = $(this).data('carid');
            if (confirm('確認取得機車，要開始租車嗎？')) {
                handleConfirmRental(carId);
            }
        });
        
        $(document).on('click', '.confirm-return-btn', function() {
            const carId = $(this).data('carid');
            if (confirm('確認車輛已歸還？')) {
                handleConfirmReturn(carId);
            }
        });
        
        $(document).on('click', '.cancel-btn', function() {
            const carId = $(this).data('carid');
            if (confirm('確定要取消此預約嗎？')) {
                handleCancelRental(carId);
            }
        });
        
    } catch (error) {
        console.error("初始化錯誤:", error);
    } finally {
        hideLoading();
    }
});

// 將函數暴露到全局作用域，供 HTML 內的事件使用
window.timeToStr = timeToStr;
window.setupTabsAndFilters = setupTabsAndFilters;
window.updateFilterOptions = updateFilterOptions;
window.renderOwnerData = renderOwnerData;
window.renderRentalData = renderRentalData;
window.getStatusInfo = getStatusInfo;
window.getRentalStatusInfo = getRentalStatusInfo;
window.getButtonByStatus = getButtonByStatus;
window.getRentalButtonByStatus = getRentalButtonByStatus;
window.updateUserInfo = updateUserInfo;

// 網路和帳戶變更監聽器
if (window.ethereum) {
    // 切換網路
    window.ethereum.on("chainChanged", async function(accounts) {
        console.log("切換網路", accounts);
        createProvider();
        await updateUserInfo();
    });

    // 切換帳號
    window.ethereum.on("accountsChanged", async function(accounts) {
        console.log("切換帳號中...");
        createProvider();
        try {
            await updateUserInfo();

            // 重新獲取資料
            await refreshData();

            // 默認顯示車主資料
            $('.tab-btn[data-tab="owner-data"]').trigger('click');
        }
        catch (error) {
            console.error("更新用戶資料失敗:", error);
        }
    });
}
