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
        let rentals = [];
        
        // 遍歷每輛車，直接使用 car 物件
        for (let i = 0; i < cars.length; i++) {
            let rental = {};
            const carId = Number(cars[i].carId);
            
            // 檢查車輛狀態是否需要獲取租賃資料
            if (cars[i].status != 1 && cars[i].status != 5) {
                rental = await contract.rentals(carId);
                //console.log(`獲取車輛 ${carId} 的租賃資料:`, rental);
            }
            
            // 將租賃資料添加到陣列，使用 carId 作為索引
            while (rentals.length <= carId) {
                rentals.push({});
            }
            
            rentals[carId] = rental ? {
                carId: Number(rental.carId),
                renter: rental.renter,
                startTimestamp: Number(rental.startTimestamp),
                endTimestamp: Number(rental.endTimestamp),
                ftotalCost: Number(rental.ftotalCost),
                isActive: rental.isActive,
                renterConfirmed: rental.renterConfirmed,
                ownerConfirmed: rental.ownerConfirmed,
                extraFeePaid: rental.extraFeePaid,
            } : {};
        }

        // 格式化車輛資料
        return cars.map(car => {
            const carId = Number(car.carId);
            return {
                rentalDetails: rentals[carId] || {},
                carId: carId,
                isscooter: car.isscooter,
                owner: car.owner,
                locate: car.locate,
                model: car.model,
                plate: car.plate,
                pricePerHour: Number(car.pricePerHour),
                fdcanstart: Number(car.fdcanstart),
                ldcanstart: Number(car.ldcanstart),
                status: Number(car.status),
                imageURL: car.imageURL || 'images/NoImage.png',
                phone: car.phone
            };
        });
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
    console.log(`已獲取 ${MyCarList.length} 輛上傳車輛資料，當前車輛列表:`, MyCarList);
    // 返回當前的車輛列表
    return MyCarList;
}

// 初始化獲取資料
// getMyCarList().then(cars => {
//     console.log(`已獲取${cars.length}輛上傳車輛資料`);
// });

// 導出資料供其他檔案使用
export { MyCarList, getMyCarList }; 