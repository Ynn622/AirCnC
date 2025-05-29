const RentalsList = [
    {
        carId: 1,
        renter: "0x1111222233334444555566667777888899990000",
        startTimestamp: 1750000000,
        endTimestamp: 1750032000,
        ftotalCost: 90,
        isActive: true,              // 租賃進行中
        renterConfirmed: true,
        ownerConfirmed: true,
        extraFeePaid: false
    },
    {
        carId: 2,
        renter: "0x2222333344445555666677778888999900001111",
        startTimestamp: 1749900000,
        endTimestamp: 1749936000,
        ftotalCost: 100,
        isActive: false,
        renterConfirmed: false,
        ownerConfirmed: false,
        extraFeePaid: false
    },
    {
        carId: 3,
        renter: "0x3333444455556666777788889999000011112222",
        startTimestamp: 1749800000,
        endTimestamp: 1749836000,
        ftotalCost: 120,
        isActive: false,             // 已結束
        renterConfirmed: true,       // 雙方已確認
        ownerConfirmed: true,
        extraFeePaid: true           // 有支付額外費用（例如超時）
    }
];

// 導出資料供其他檔案使用
export { RentalsList }; 