// 從區塊鏈獲取用戶的租賃資料
// 使用 Ethers.js v6

/**
 * 獲取使用者租賃資料
 * @returns {Promise<Array>} 租賃資料列表
 */
async function fetchMyRentals() {
    try {
        // 檢查錢包是否連接
        if (!(await checkIfConnected())) {
            console.warn("未連接錢包，無法獲取租賃資料");
            return [];
        }
        
        // 創建合約實例
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        
        // 獲取使用者的所有租賃
        const userRentals = await contract.getMyRentals();
        const carIds = userRentals.map(rental => Number(rental.carId));
        
        console.log("用戶租賃車輛ID列表:", carIds);
        
        // 從租賃記錄中提取基本數據，並使用 getCar 方法獲取車輛詳情
        const rentalsData = [];
        for (let i = 0; i < userRentals.length; i++) {
            const rental = userRentals[i];
            const carId = Number(rental.carId);
            
            try {
                // 使用 getCar 獲取車輛詳情
                const car = await contract.getCar(carId);
                
                console.log(`獲取車輛ID ${carId} 的車輛詳情:`, car);
                
                // 將租賃資料與車輛詳情合併
                rentalsData.push({
                    // 租賃資訊
                    carId: carId,
                    renter: rental.renter,
                    startTimestamp: Number(rental.startTimestamp),
                    endTimestamp: Number(rental.endTimestamp),
                    ftotalCost: Number(rental.ftotalCost),
                    isActive: rental.isActive,
                    renterConfirmed: rental.renterConfirmed,
                    ownerConfirmed: rental.ownerConfirmed,
                    extraFeePaid: rental.extraFeePaid,
                    
                    // 車輛詳情
                    carDetails: {
                        isscooter: car.isscooter,
                        owner: car.owner,
                        locate: car.locate,
                        model: car.model,
                        plate: car.plate,
                        pricePerHour: Number(car.pricePerHour),
                        fdcanstart: Number(car.fdcanstart),
                        ldcanstart: Number(car.ldcanstart),
                        status: Number(car.status),
                        imageURL: car.imageURL || 'images/scooter.jpg',
                        phone: car.phone
                    }
                });
            } catch (error) {
                console.error(`獲取車輛ID ${carId} 的詳情時發生錯誤:`, error);
            }
        }
        
        console.log(`已獲取 ${rentalsData.length} 筆租賃與車輛詳情`);
        return rentalsData;
    } catch (error) {
        console.error("獲取租賃資料失敗:", error);
        return [];
    }
}

// 當檔案載入時，初始化 RentalsList
let RentalsList = [];

// 提供一個函數來獲取當前的租賃列表
async function getMyRentalsList() {
    // 重新獲取資料
    RentalsList = await fetchMyRentals();
    return RentalsList;
}

// 初始化獲取資料
// getMyRentalsList().then(rentals => {
//     console.log(`已獲取${rentals.length}筆租賃資料`);
// });

// 導出資料供其他檔案使用
export { RentalsList, getMyRentalsList }; 