// 從區塊鏈獲取使用者上傳的車輛資料
// 使用 Ethers.js v6

/**
 * 獲取使用者上傳的車輛列表
 * @returns {Promise<Array>} 車輛資料列表
 */
async function fetchMyCars() {
    try {
        // 檢查錢包是否連接
        if (!(await checkIfConnected())) {
            console.warn("未連接錢包，無法獲取車輛資料");
            return [];
        }
        
        // 創建合約實例
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        
        // 獲取使用者上傳的車輛
        const cars = await contract.getMyCars();
        
        // 格式化車輛資料
        return cars.map(car => ({
            carId: Number(car.carId),
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
        }));
    } catch (error) {
        console.error("獲取上傳車輛資料失敗:", error);
        return [];
    }
}

// 當檔案載入時，初始化 MyCarList
let MyCarList = [];

// 提供一個函數來獲取當前的車輛列表
async function getMyCarList() {
    // 如果尚未載入或需要強制刷新，則重新獲取資料
    MyCarList = await fetchMyCars();
    return MyCarList;
}

// 初始化獲取資料
// getMyCarList().then(cars => {
//     console.log(`已獲取${cars.length}輛上傳車輛資料`);
// });

// 導出資料供其他檔案使用
export { MyCarList, getMyCarList }; 