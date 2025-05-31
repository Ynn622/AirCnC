// 使用智能合約獲取車輛資料並顯示在租車頁面
// 使用 Ethers.js v6

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

// 計算租賃時長和費用
function calcDurationAndPrice(pricePerHour) {
    const startDateTime = document.getElementById('startDateTime').value;
    const endDateTime = document.getElementById('endDateTime').value;

    if (!startDateTime || !endDateTime) {
        document.getElementById('duration').textContent = '0小時';
        document.getElementById('totalPrice').textContent = '$ 0 wei';
        return { hours: 0, total: 0 };
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    let ms = end - start;
    if (isNaN(ms) || ms <= 0) {
        document.getElementById('duration').textContent = '0小時';
        document.getElementById('totalPrice').textContent = '$ 0 wei';
        return { hours: 0, total: 0 };
    }
    
    // 計算小時數
    let hours = Math.floor(ms / (1000 * 60 * 60));
    let days = Math.floor(hours / 24);
    let remainHours = hours % 24;
    
    // 格式化顯示
    let durationStr = '';
    if (days > 0) durationStr += days + '天';
    if (remainHours > 0) durationStr += ' ' + remainHours + '小時';
    if (!durationStr) durationStr = '0小時';
    
    document.getElementById('duration').textContent = durationStr.trim();
    
    // 計算金額
    let total = BigInt(hours) * BigInt(pricePerHour);
    document.getElementById('totalPrice').textContent = `$ ${total} wei`;
    
    return { 
        hours: hours, 
        total: total,
        startTimestamp: Math.floor(start.getTime() / 1000),
        endTimestamp: Math.floor(end.getTime() / 1000)
    };
}

// 時間戳轉換為日期字串
function timeToStr(timestamp) {
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

// 檢查連接並獲取合約實例
async function getContractInstance() {
    try {
        // 確保錢包已連接
        if (!(await checkIfConnected())) {
            alert("請先連接MetaMask錢包以預約租車！");
            return null;
        }
        
        // 使用 ethers.BrowserProvider 創建 provider (Ethers v6)
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // 創建合約實例
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        return contract;
    } catch (error) {
        console.error("獲取合約實例時發生錯誤:", error);
        alert("連接智能合約失敗，請確保MetaMask已連接至正確網絡！");
        return null;
    }
}

// 獲取車輛資料
async function getCarDetails(carId) {
    try {
        // 顯示加載中動畫
        showLoading();
        
        // 獲取合約實例（只讀）
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        
        // 調用合約的 getCar 方法獲取車輛詳細信息
        const car = await contract.getCar(carId);
        
        // 轉換數據結構
        const vehicle = {
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
        };
        
        return vehicle;
    } catch (error) {
        console.error("獲取車輛數據失敗:", error);
        alert("獲取車輛數據失敗，請稍後再試！");
        return null;
    } finally {
        // 隱藏加載中動畫
        hideLoading();
    }
}

// 頁面載入完成時執行
$(document).ready(async function() {
    // 添加使用者圖標點擊事件
    $('#user-icon-btn').on('click', function() {
        connect();
    });
    
    // 檢查是否已連接錢包
    const isConnected = await checkIfConnected();
    console.log("錢包連接狀態:", isConnected);
    
    // 從 URL 獲取車輛 ID
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = parseInt(urlParams.get('id'));
    
    if (!vehicleId) {
        alert('車輛ID無效！');
        window.location.href = 'index.html';
        return;
    }
    
    // 獲取車輛詳細信息
    const vehicle = await getCarDetails(vehicleId);

    if (vehicle) {
        // 更新頁面內容
        $('.rent-detail-img img').attr('src', vehicle.image).on('error', function() {
            $(this).attr('src', 'images/scooter.jpg'); // 圖片加載失敗時使用預設圖片
        });
        
        $('.rent-detail-info h1').text(vehicle.model);
        $('#address-text').text(vehicle.location);
        
        // 更新詳細資訊表格
        $('#owner-text').text(`${vehicle.owner.slice(0,8)}...`);
        $('#plate-text').text(`${vehicle.plate}`);
        $('#price-text').text(`${vehicle.pricePerHour} wei/h`);

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
                // alert('開始時間不能大於結束時間！');
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
        $('#rentForm').on('submit', async function(e) {
            e.preventDefault();
            
            if (!isConnected) {
                alert("請先連接MetaMask錢包以預約租車！");
                return;
            }
            
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

            try {
                // 獲取租賃計算結果
                const rentCalc = calcDurationAndPrice(vehicle.pricePerHour);
                
                if (rentCalc.hours <= 0) {
                    alert('租車時間至少要1小時！');
                    return;
                }
                
                // 顯示處理中狀態
                showLoading();
                
                // 獲取合約實例
                const contract = await getContractInstance();
                if (!contract) {
                    return;
                }
                
                console.log("租賃信息:", {
                    carId: vehicleId,
                    totalCost: rentCalc.total.toString(),
                    startTimestamp: rentCalc.startTimestamp,
                    endTimestamp: rentCalc.endTimestamp
                });
                
                // 調用合約的 rentCar 方法
                const tx = await contract.rentCar(
                    vehicleId,
                    rentCalc.total,
                    BigInt(rentCalc.startTimestamp),
                    BigInt(rentCalc.endTimestamp),
                    { value: rentCalc.total } // 支付租車費用
                );
                
                // 等待交易確認
                $('#loading p').text('交易提交中，請稍等...');
                const receipt = await tx.wait();
                
                console.log("租車交易收據:", receipt);
                
                alert('預約租車成功！');
                window.location.href = 'index.html';
                
            } catch (error) {
                console.error("租車失敗:", error);
                
                if (error.message && error.message.includes("user rejected")) {
                    alert("您已取消交易！");
                } else {
                    alert("預約租車失敗: " + error.message);
                }
            } finally {
                hideLoading();
            }
        });

        // 頁面載入時先計算一次
        calcDurationAndPrice(vehicle.pricePerHour);

        // 導航按鈕點擊事件
        $('#navigation-btn').click(function() {
            const address = $('#address-text').text();
            const encodedAddress = encodeURIComponent(address);
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
        });
    } else {
        alert('找不到車輛資訊！');
        window.location.href = 'index.html';
    }
});