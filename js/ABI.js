const CONTRACT_ADDRESS = "0xb03b3D3628c949b3849E8fdDdA9f1E2d0DBfAE19";
const ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "carId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "isscooter",
                "type": "bool"
            }
        ],
        "name": "CarListed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "carId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "renter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "CarRented",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "carId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "renter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "extraCost",
                "type": "uint256"
            }
        ],
        "name": "ExtraCharged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "carId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "renter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "RentalCancelled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "carId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "renter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "RentalEnded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "carId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "renter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "RentalStart",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "carId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "renter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "Renterreturn",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bool",
                "name": "_isscooter",
                "type": "bool"
            },
            {
                "internalType": "string",
                "name": "_locate",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_model",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_plate",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_pricePerHour",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "_fdcanstart",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "_ldcanstart",
                "type": "uint32"
            },
            {
                "internalType": "string",
                "name": "_imageURL",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_phone",
                "type": "string"
            }
        ],
        "name": "addCar",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_carId",
                "type": "uint256"
            }
        ],
        "name": "cancelRental",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "cars",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "carId",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isscooter",
                "type": "bool"
            },
            {
                "internalType": "address payable",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "locate",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "model",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "plate",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "pricePerHour",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "fdcanstart",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "ldcanstart",
                "type": "uint32"
            },
            {
                "internalType": "uint8",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "string",
                "name": "imageURL",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "phone",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_carId",
                "type": "uint256"
            },
            {
                "internalType": "uint64",
                "name": "overtimeHours",
                "type": "uint64"
            }
        ],
        "name": "endRental",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAvailableCars",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_carId",
                "type": "uint256"
            }
        ],
        "name": "getCar",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "carId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isscooter",
                        "type": "bool"
                    },
                    {
                        "internalType": "address payable",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "locate",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "model",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "plate",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "pricePerHour",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint32",
                        "name": "fdcanstart",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "ldcanstart",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint8",
                        "name": "status",
                        "type": "uint8"
                    },
                    {
                        "internalType": "string",
                        "name": "imageURL",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "phone",
                        "type": "string"
                    }
                ],
                "internalType": "struct DecentralizedCarRental.Car",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMyCars",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "carId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isscooter",
                        "type": "bool"
                    },
                    {
                        "internalType": "address payable",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "locate",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "model",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "plate",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "pricePerHour",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint32",
                        "name": "fdcanstart",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "ldcanstart",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint8",
                        "name": "status",
                        "type": "uint8"
                    },
                    {
                        "internalType": "string",
                        "name": "imageURL",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "phone",
                        "type": "string"
                    }
                ],
                "internalType": "struct DecentralizedCarRental.Car[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMyRentals",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "carId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address payable",
                        "name": "renter",
                        "type": "address"
                    },
                    {
                        "internalType": "uint64",
                        "name": "startTimestamp",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "endTimestamp",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint256",
                        "name": "ftotalCost",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isActive",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "renterConfirmed",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "ownerConfirmed",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "extraFeePaid",
                        "type": "bool"
                    }
                ],
                "internalType": "struct DecentralizedCarRental.RentalInfo[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "getOwnerBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextCarId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "ownerBalances",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "ownerToCarIds",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_carId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalCost",
                "type": "uint256"
            },
            {
                "internalType": "uint64",
                "name": "rentstart",
                "type": "uint64"
            },
            {
                "internalType": "uint64",
                "name": "rentend",
                "type": "uint64"
            }
        ],
        "name": "rentCar",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "rentals",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "carId",
                "type": "uint256"
            },
            {
                "internalType": "address payable",
                "name": "renter",
                "type": "address"
            },
            {
                "internalType": "uint64",
                "name": "startTimestamp",
                "type": "uint64"
            },
            {
                "internalType": "uint64",
                "name": "endTimestamp",
                "type": "uint64"
            },
            {
                "internalType": "uint256",
                "name": "ftotalCost",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "renterConfirmed",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "ownerConfirmed",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "extraFeePaid",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "renterToCarIds",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_carId",
                "type": "uint256"
            }
        ],
        "name": "setCarAvailability",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_carId",
                "type": "uint256"
            }
        ],
        "name": "startRental",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]