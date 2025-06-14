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

// 計算時間差（小時）
function calculateTimeDifference(startTimestamp, endTimestamp) {
    const startDate = new Date(startTimestamp * 1000);
    const endDate = new Date(endTimestamp * 1000);
    
    // 計算時間差（毫秒）
    const timeDiff = endDate - startDate;
    
    // 將時間差轉換為小時
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    
    return hours;
}

// 標籤切換功能
function setupTabsAndFilters() {
    // 車輛類型變數 (true為汽車，false為機車)
    window.isCarType = false;
    
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
    
    // 車輛類型開關事件
    $('#vehicleTypeSwitch').change(function() {
        window.isCarType = $(this).is(':checked');
        console.log("切換車輛類型：", window.isCarType ? "汽車" : "機車");
        
        // 觸發過濾器變更事件來更新顯示
        $('#dataFilter').trigger('change');
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
    
    // 獲取當前選擇的車輛類型 (true為汽車，false為機車)
    const isCarType = window.isCarType;
    console.log("渲染車主資料，車輛類型:", isCarType ? "汽車" : "機車");
    
    // 這裡從 MyCarList 獲取資料並根據 filter 和車輛類型進行過濾
    MyCarList.forEach(car => {
        // 先根據車輛類型過濾
        if (car.isscooter == isCarType) {
            return; // 如果車輛類型不匹配，則跳過此車輛
        }
        
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
            const statusInfo = getStatusInfo(car);
            const startTimestamp = car.rentalDetails.startTimestamp;
            const endTimestamp = car.rentalDetails.endTimestamp;
            const card = $(`
                <div class="uploaded-card">
                    <img src="${car.imageURL}" alt="${car.model}" class="vehicle-img" onerror="this.src='images/scooter.jpg'">
                    <div class="card-info">
                        <h2>${car.model}</h2>
                        <div class="status-info"> ${statusInfo.icon} &nbsp;${statusInfo.text}</div>
                        <div><b>地址</b>：${car.locate} <i class="fa-solid fa-location-dot" style="cursor:pointer" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(car.locate)}', '_blank')"></i></div>
                        <div><b>車牌</b>：${car.plate}</div>
                        <div><b>計費方式</b>：$${formatBigIntWithCommas(car.pricePerHour)} wei/h</div>
                        ${(car.status >= 2 && car.status <= 4) ? `<div><b>總費用</b>：$${formatBigIntWithCommas(car.rentalDetails.ftotalCost)} wei（共${calculateTimeDifference(startTimestamp, endTimestamp)}小時）</div>
                                                                <div><b>預約人</b>：${car.rentalDetails.renter ? car.rentalDetails.renter.slice(0, 8) + '...' : '未知'}</div>
                                                                <div><b>被預約日期</b>：${timeToStr(startTimestamp)} ~ ${timeToStr(endTimestamp)}</div>` : 
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
    
    // 獲取當前選擇的車輛類型 (true為汽車，false為機車)
    const isCarType = window.isCarType;
    console.log("渲染租賃資料，車輛類型:", isCarType ? "汽車" : "機車");
    
    // 這裡從 RentalsList 獲取資料並根據 filter 進行過濾
    RentalsList.forEach(rental => {
        // 使用租賃數據中包含的車輛詳情
        const carDetails = rental.carDetails || {};
        
        // 先根據車輛類型過濾
        if (carDetails.isscooter == isCarType) {
            return; // 如果車輛類型不匹配，則跳過此車輛
        }

        // 根據 filter 條件過濾
        let shouldShow = false;
        const nowTimeStamp = Math.floor(Date.now() / 1000);
        
        switch(filter) {
            case 'all':
                shouldShow = true;
                break;
            case 'reserved':
                shouldShow = rental.carDetails.status === 2; // 已預約
                break;
            case 'renting':
                shouldShow = rental.carDetails.status === 3; // 租賃進行中
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
                        <div><b>聯絡電話</b>：<a href="tel:${carDetails.phone}">${carDetails.phone || '未知'}</a></div>
                        <div><b>車牌</b>：${carDetails.plate || '未知'}</div>
                        <div><b>計費方式</b>：$${formatBigIntWithCommas(carDetails.pricePerHour)} wei/h</div>
                        <div><b>預約日期</b>：${timeToStr(rental.startTimestamp)} ~ ${timeToStr(rental.endTimestamp)}</div>
                        <div><b>總費用</b>：$${formatBigIntWithCommas(rental.ftotalCost)} wei</div>
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
function getStatusInfo(car) {
    switch(car.status) {
        case 1: // 已上傳待租
            if (car.ldcanstart < Math.floor(Date.now() / 1000)) {
                return {icon: '<i class="fa-solid fa-circle-exclamation"></i>', text: '已上傳待租（過期）' };
            }
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
            return { icon: '<i class="fa-solid fa-circle-question"></i>', text: '未知狀態' };
    }
}

// 根據車輛狀態產生對應按鈕
function getButtonByStatus(car) {
    switch(car.status) {
        case 1: // 已上傳待租
            return `<div><button class="remove-btn" data-carid="${car.carId}">下架車輛</button></div>`;
        case 2: // 已被預約
            if (car.rentalDetails.ownerConfirmed) {
                // 如果車主已確認，顯示「已確認租車」按鈕
                return `<div><button class="confirm-btn" disabled>已確認租車</button></div>`;
            } 
            return `<div><button class="confirm-btn" data-carid="${car.carId}">確認租車</button></div>`;
        case 3: // 出租中
            if (car.rentalDetails.renterConfirmed) {
                // 如果租戶未確認，顯示「租客未還車」按鈕
                return `<div><button class="confirm-return-btn" disabled>租客未還車</button></div>`;
            }
            return `<div><button class="confirm-return-btn" data-carid="${car.carId}" data-endTime="${car.rentalDetails.endTimestamp}">確認還車</button></div>`;
        default:
            return '';
    }
}

// 根據租賃狀態產生對應按鈕
function getRentalButtonByStatus(rental) {
    const nowTimeStamp = Math.floor(Date.now() / 1000);
    
    if (rental.carDetails.status === 3) {
        if(!rental.renterConfirmed) {
            // 如果租賃活躍但租戶確認為假，顯示「已確認還車」按鈕
            return `<div><button class="confirm-return-btn" disabled>已確認還車</button></div>`;
        } else {
            // 正常租賃中，顯示「確認還車」按鈕
            return `<div><button class="confirm-return-btn" data-carid="${rental.carId}" data-endTime="${rental.endTimestamp}" data-feePerHour="${rental.carDetails.pricePerHour}">確認還車</button></div>`;
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
    $("#userName").attr("data-address",userName);
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

        const errorMessages = {
            "Can't change your car status": "無法下架，車輛狀態不允許下架！\n請確認車輛是否已被預約或正在出租中！",
            "Not the car owner": "無法下架，您不是車主！\n請確認是否已登入正確的帳戶！",
        };

        if (error.message && error.message.includes("user rejected")) {
            alert("您已取消操作！");
        } else if (error.reason && errorMessages[error.reason]) {
            alert(errorMessages[error.reason]);
        } else {
            alert("確認還車失敗: " + (error.message || "未知錯誤"));
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
        
        const errorMessages = {
            "Only renter or owner can confirm start": "無法確認租車，只有租客或車主可以確認開始租車！\n請確認是否已登入正確的帳戶！",
            "Car has not been rented": "無法確認租車，車輛尚未被租用！\n請確認車輛是否已被預約！",
        };

        if (error.message && error.message.includes("user rejected")) {
            alert("您已取消操作！");
        } else if (error.reason && errorMessages[error.reason]) {
            alert(errorMessages[error.reason]);
        } else {
            alert("確認還車失敗: " + (error.message || "未知錯誤"));
        }
    } finally {
        hideLoading();
    }
}

// 處理確認還車操作
async function handleConfirmReturn(carId, endTime, feePerHour) {
    try {
        showLoading();
        console.log("開始確認還車，車輛ID:", carId, "結束時間:", endTime, "每小時費用:", feePerHour);
        // 創建合約實例
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        
        // 檢查結束時間是否已過
        let nowTimeStamp = Math.floor(Date.now() / 1000);
        let overTimeHour = 0; // 超時小時數
        let overFee = 0; // 超時費用

        // 如果結束時間已過，計算超時費用)
        if (!!feePerHour && endTime < nowTimeStamp) {
            overTimeHour = Math.ceil((nowTimeStamp - endTime) / 3600); // 計算超時小時數
            overFee = overTimeHour * feePerHour; // 計算超時費用
            // 如果結束時間已過，提示用戶
            if (confirm(`車輛已超時，是否確認還車？\n超時小時數：${overTimeHour}\n超時費用： ${formatBigIntWithCommas(overFee)} wei`)) {
                // 如果用戶確認，則繼續還車流程
                console.log("用戶確認還車，超時小時數:", overTimeHour, "超時費用:", overFee);
            } else {
                // 如果用戶取消，則不進行還車操作
                alert("已取消還車操作！");
                return;
            }
        }

        console.log("開始確認還車，車輛ID:", carId, "超時小時數:", overTimeHour, "超時費用:", overFee);

        // 調用合約確認還車方法
        const tx = await contract.endRental(carId, overTimeHour,{value: overFee});
        
        // 等待交易確認
        $('#loading p').text('交易提交中，請稍等...');
        const receipt = await tx.wait();
        
        console.log("確認還車交易收據:", receipt);
        
        alert('已確認還車！');
        
        // 重新載入資料
        await refreshData();
        
    } catch (error) {
        console.error("確認還車失敗:", error);
        
        const errorMessages = {
            "Car is not currently rented": "無法確認還車，車輛目前未被租用！\n請確認車輛是否正在出租中！",
            "Only renter or owner can confirm return": "無法確認還車，只有租客或車主可以確認還車！\n請確認是否已登入正確的帳戶！",
            "No active rental": "無法確認還車，車輛非租車狀態！\n請確認車輛是否正在出租中！",
            "Renter needs to pay extra fee": "無法確認還車，需要支付超時費用！\n請確認是否已支付超時費用！",
            "Insufficient ETH for overtime": "無法確認還車，餘額不足以支付超時費用！\n請確認您的錢包餘額是否足夠！",
            "Contract has insufficient balance": "無法確認還車，合約餘額不足以支付退款！\n請聯繫管理員處理！",
        };

        if (error.message && error.message.includes("user rejected")) {
            alert("您已取消操作！");
        } else if (error.reason && errorMessages[error.reason]) {
            alert(errorMessages[error.reason]);
        } else {
            alert("確認還車失敗: " + (error.message || "未知錯誤"));
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

        const cancelErrorMessages = {
            "Only renter can cancel": "無法下架，只有租客可以取消預約！\n請確認是否已取消預約！",
            "Rental already started": "無法下架，租賃已經開始！\n請確認車輛是否正在出租中！",
            "Rental already cancelled or does not exist": "無法下架，車輛已被取消預約或不存在！",
            "Owner has insufficient balance for refund": "無法取消預約，車主餘額不足以退款！"
        };

        if (error.message && error.message.includes("user rejected")) {
            alert("您已取消操作！");
        } else if (error.reason && cancelErrorMessages[error.reason]) {
            alert(cancelErrorMessages[error.reason]);
        } else {
            alert("取消預約失敗: " + (error.message || "未知錯誤"));
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
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        console.log("監聽合約事件：", contract);
        
        // 監聽合約
        if (contract) {
            // CarRented 事件
            let CarRented = false;
            contract.on('CarRented', async (carId, renter, owner) => {
                if (CarRented) return; // 防止重複處理
                CarRented = true; // 標記為已處理

                if (owner.toLowerCase() == $("#userName").attr("data-address")) {
                    // 重新生成卡片以顯示新預約
                    showLoading();
                    await getMyCarList();
                    renderOwnerData($('#dataFilter').val());
                    hideLoading();
                    console.log(`新預約已添加：ID ${carId}, 預約人 ${renter}`);
                }
                CarRented = false; // 重置標記
            });

            // RentalCancelled 事件
            let RentalCancelled = false;
            contract.on('RentalCancelled', async (carId, renter, owner) => {
                if (RentalCancelled) return; // 防止重複處理
                RentalCancelled = true; // 標記為已處理
                
                if (owner.toLowerCase() == $("#userName").attr("data-address")) {
                    // 重新生成卡片以顯示新預約
                    showLoading();
                    await getMyCarList();
                    renderOwnerData($('#dataFilter').val());
                    hideLoading();
                    console.log(`取消預約通知：ID ${carId}, 取消人 ${renter}`);
                }
                RentalCancelled = false; // 重置標記
            });

            // RentalStart 事件
            let RentalStart = false;
            contract.on('RentalStart', async (carId, renter, owner) => {
                if (RentalStart) return; // 防止重複處理
                RentalStart = true; // 標記為已處理

                if (owner.toLowerCase() == $("#userName").attr("data-address")) {
                    // 重新生成卡片以顯示新預約
                    showLoading();
                    await getMyCarList();
                    renderOwnerData($('#dataFilter').val());
                    hideLoading();
                    console.log(`租車開始通知：ID ${carId}, 租客 ${renter}`);
                }
                if (renter.toLowerCase() == $("#userName").attr("data-address")) {
                    // 重新生成租賃資料
                    showLoading();
                    await getMyRentalsList();
                    renderRentalData($('#dataFilter').val());
                    hideLoading();
                    console.log(`租車開始通知：ID ${carId}, 租客 ${renter}`);
                }
                RentalStart = false; // 重置標記
            });

            // Renterreturn 事件
            let Renterreturn = false;
            contract.on('Renterreturn', async (carId, renter, owner) => {
                if (Renterreturn) return; // 防止重複處理
                Renterreturn = true; // 標記為已處理

                if (owner.toLowerCase() == $("#userName").attr("data-address")) {
                    // 重新生成卡片以顯示新預約
                    showLoading();
                    await getMyCarList();
                    renderOwnerData($('#dataFilter').val());
                    hideLoading();
                    console.log(`還車通知：ID ${carId}, 租客 ${renter}`);
                }
                Renterreturn = false; // 重置標記
            });

            // RentalEnded 事件
            let RentalEnded = false;
            contract.on('RentalEnded', async (carId, renter, owner) => {
                if (RentalEnded) return; // 防止重複處理
                RentalEnded = true; // 標記為已處理

                if (renter.toLowerCase() == $("#userName").attr("data-address")) {
                    // 重新生成租賃資料
                    showLoading();
                    await getMyRentalsList();
                    renderRentalData($('#dataFilter').val());
                    hideLoading();
                    console.log(`租車開始通知：ID ${carId}, 租客 ${renter}`);
                }
                RentalEnded = false; // 重置標記
            });
        }

        // 更新用戶資料
        await updateUserInfo();
        
        // 設置標籤和過濾器
        setupTabsAndFilters();
        
        // 設置車輛類型開關的默認狀態（默認為機車）
        window.isCarType = false;
        $('#vehicleTypeSwitch').prop('checked', false);
        
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
            const endTime = $(this).data('endtime');
            const feePerHour = $(this).data('feeperhour');
            if (confirm('確認車輛已歸還？')) {
                handleConfirmReturn(carId, endTime, feePerHour);
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
