const MyCarList = [
    {
        carId: 1,
        isscooter: true,
        owner: "0xAbC1234567890DEFabc1234567890defABC12345",
        locate: "新北市新莊區新北大道四段199號",
        model: "JET SL 125cc",
        plate: "ABC-1234",
        pricePerHour: 30,
        fdcanstart: 1746835200,
        ldcanstart: 1751241600,
        status: 1, // 可出租
        imageURL: "images/scooter.jpg",
        phone: "0912345678"
    },
    {
        carId: 2,
        isscooter: false,
        owner: "0x1234567890abcdef1234567890ABCDEF12345678",
        locate: "台北市信義區松仁路123號",
        model: "Toyota Yaris",
        plate: "DEF-5678",
        pricePerHour: 250,
        fdcanstart: 1747008000,
        ldcanstart: 1751400000,
        status: 2, // 已被預約
        imageURL: "images/yaris.jpg",
        phone: "0922333444"
    },
    {
        carId: 3,
        isscooter: true,
        owner: "0xaBcDEFabcdef1234567890ABCDEFabcdef123456",
        locate: "桃園市中壢區中山路200號",
        model: "Gogoro VIVA MIX",
        plate: "GOG-1122",
        pricePerHour: 50,
        fdcanstart: 1746900000,
        ldcanstart: 1751300000,
        status: 3, // 正在出租
        imageURL: "images/gogoro.jpg",
        phone: "0933111222"
    },
    {
        carId: 4,
        isscooter: false,
        owner: "0x4567890abcdefABCDEFabcdef1234567890ABCD",
        locate: "台中市西屯區市政路168號",
        model: "Honda CR-V",
        plate: "HND-9988",
        pricePerHour: 350,
        fdcanstart: 1746800000,
        ldcanstart: 1751200000,
        status: 4, // 結束租約
        imageURL: "images/crv.jpg",
        phone: "0955666777"
    },
    {
        carId: 5,
        isscooter: true,
        owner: "0xABCDEFabcdef1234567890abcdefABCDEF123456",
        locate: "高雄市苓雅區成功一路50號",
        model: "SYM DRG 158",
        plate: "SYM-3344",
        pricePerHour: 45,
        fdcanstart: 1746950000,
        ldcanstart: 1751350000,
        status: 5, // 下架
        imageURL: "images/drg.jpg",
        phone: "0966888999"
    }
];

// 導出資料供其他檔案使用
export { MyCarList }; 