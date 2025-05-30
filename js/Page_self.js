import { MyCarList } from './getMyCarsData.js';
import { RentalsList } from './getMyRentalsData.js';

// 將資料暴露到全局作用域
window.MyCarList = MyCarList;
window.RentalsList = RentalsList;

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
            renderOwnerData(filterValue);
        } else if(activeTab === 'rental-data') {
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
                    <img src="${car.imageURL}" alt="${car.model}" class="vehicle-img">
                    <div class="card-info">
                        <h2>${car.model}</h2>
                        <div class="status-info"> ${statusInfo.icon} &nbsp;${statusInfo.text}</div>
                        <div><b>地址</b>：${car.locate} <i class="fa-solid fa-location-dot"></i></div>
                        <div><b>車牌</b>：${car.plate}</div>
                        <div><b>計費方式</b>：$${car.pricePerHour} wei/h</div>
                        ${car.status === 3 ? `<div><b>被預約日期</b>：${timeToStr(car.fdcanstart)} ~ ${timeToStr(car.ldcanstart)}</div>` : 
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
        // 從 rentalList 中找到對應的車輛詳情
        const carDetails = MyCarList.find(car => car.carId === rental.carId) || {};
        
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
                shouldShow = !rental.isActive && (rental.endTimestamp > nowTimeStamp); // 已預約未開始
                break;
            case 'history':
                shouldShow = !rental.isActive && (rental.endTimestamp < nowTimeStamp); // 已結束
                break;
        }
        
        if(shouldShow) {
            const rentalStatusInfo = getRentalStatusInfo(rental);
            const card = $(`
                <div class="uploaded-card">
                    <img src="${carDetails.imageURL || 'images/scooter.jpg'}" alt="${carDetails.model || '車輛'}" class="vehicle-img">
                    <div class="card-info">
                        <h2>${carDetails.model || '未知車型'}</h2>
                        <div class="status-info">${rentalStatusInfo.icon} ${rentalStatusInfo.text}</div>
                        <div><b>車主</b>：${carDetails.owner ? carDetails.owner.slice(0,8) + '...' : '未知'}</div>
                        <div><b>地址</b>：${carDetails.locate || '未知'} <i class="fa-solid fa-location-dot"></i></div>
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
    if(rental.isActive) {
        return {icon: '<i class="fa-solid fa-car-side"></i>', text: '租車中'};
    } else if (rental.endTimestamp > nowTimeStamp) {
        return {icon: '<i class="fa-solid fa-calendar-check"></i>', text: '已預約'};
    } else if (rental.endTimestamp < nowTimeStamp) {
        return {icon: '<i class="fa-solid fa-clock-rotate-left"></i>', text: '已結束租用'};
    } else {
        return {icon: '<i class="fa-solid fa-circle-question"></i>', text: '等待確認'};
    }
}

// 根據車輛狀態產生對應按鈕
function getButtonByStatus(car) {
    switch(car.status) {
        case 1: // 已上傳待租
            return `<div><button class="remove-btn">下架車輛</button></div>`;
        case 2: // 已被預約
            return `<div><button class="confirm-btn">確認租車</button></div>`;
        case 3: // 出租中
            return `<div><button class="confirm-return-btn">確認還車</button></div>`;
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
        if(rental.renterConfirmed === false) {
            // 如果租賃活躍但租戶確認為假，顯示「已確認還車」按鈕
            return `<div><button class="confirm-return-btn" disabled>已確認還車</button></div>`;
        } else {
            // 正常租賃中，顯示「確認還車」按鈕
            return `<div><button class="confirm-return-btn">確認還車</button></div>`;
        }
    } else if(rental.endTimestamp > nowTimeStamp) {
        // 未過期的預約
        if(rental.renterConfirmed) {
            // 如果租戶已確認，顯示已確認按鈕（不可點擊）和取消預約按鈕
            return `<div><button class="confirm-btn" disabled>已確認租車</button> <button class="cancel-btn">取消預約</button></div>`;
        } else {
            // 如果租戶未確認，顯示確認租車按鈕和取消預約按鈕
            return `<div><button class="confirm-btn">確認租車</button> <button class="cancel-btn">取消預約</button></div>`;
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

// 頁面載入初始化
$(async function() {
    try {
        const chainId = ethereum.request({ method: 'eth_chainId' });
        console.log("鏈 ID:", chainId);
        
        // 更新用戶資料
        await updateUserInfo();
        
        // 設置標籤和過濾器
        setupTabsAndFilters();
        
        // 默認顯示車主資料
        $('.tab-btn[data-tab="owner-data"]').trigger('click');
        
    } catch (error) {
        console.error("初始化錯誤:", error);
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
        console.log("切換帳號", accounts);
        createProvider();
        await updateUserInfo();
    });
}
