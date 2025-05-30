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
        const rentals = await contract.getMyRentals();
        
        // 格式化租賃資料
        return rentals.map(rental => ({
            carId: Number(rental.carId),
            renter: rental.renter,
            startTimestamp: Number(rental.startTimestamp),
            endTimestamp: Number(rental.endTimestamp),
            ftotalCost: Number(rental.ftotalCost),
            isActive: rental.isActive,
            renterConfirmed: rental.renterConfirmed,
            ownerConfirmed: rental.ownerConfirmed,
            extraFeePaid: rental.extraFeePaid
        }));
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
getMyRentalsList().then(rentals => {
    console.log(`已獲取${rentals.length}筆租賃資料`);
});

// 導出資料供其他檔案使用
export { RentalsList, getMyRentalsList }; 