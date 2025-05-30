const CONTRACT_ADDRESS = "0x760eA502a700a859A81728A7654B51e0F81765EF";
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
                "internalType": "string",
                "name": "model",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "plate",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "pricePerHour",
                "type": "uint256"
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
                "indexed": false,
                "internalType": "uint256",
                "name": "rentstart",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "rentend",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "totalCost",
                "type": "uint256"
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
            }
        ],
        "name": "Caroffline",
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
                "indexed": false,
                "internalType": "uint256",
                "name": "extraHours",
                "type": "uint256"
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
                "indexed": false,
                "internalType": "uint256",
                "name": "refundedAmount",
                "type": "uint256"
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
            }
        ],
        "name": "RentalStart",
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
                "internalType": "uint256",
                "name": "_fdcanstart",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_ldcanstart",
                "type": "uint256"
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
                "internalType": "uint256",
                "name": "fdcanstart",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "ldcanstart",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "status",
                "type": "uint256"
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
                "internalType": "uint256",
                "name": "overtimeHours",
                "type": "uint256"
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
                        "internalType": "uint256",
                        "name": "fdcanstart",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "ldcanstart",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "status",
                        "type": "uint256"
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
                        "internalType": "uint256",
                        "name": "fdcanstart",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "ldcanstart",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "status",
                        "type": "uint256"
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
                        "internalType": "uint256",
                        "name": "startTimestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "endTimestamp",
                        "type": "uint256"
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
                "internalType": "uint256",
                "name": "_carId",
                "type": "uint256"
            }
        ],
        "name": "getRentalById",
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
                        "internalType": "uint256",
                        "name": "startTimestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "endTimestamp",
                        "type": "uint256"
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
                "internalType": "struct DecentralizedCarRental.RentalInfo",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getstatus2",
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
        "inputs": [],
        "name": "getstatus3",
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
        "inputs": [],
        "name": "getstatus4",
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
        "inputs": [],
        "name": "getstatus5",
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
                "internalType": "uint256",
                "name": "rentstart",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "rentend",
                "type": "uint256"
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
        "name": "rentalDetails",
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
                "internalType": "uint256",
                "name": "startTimestamp",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "endTimestamp",
                "type": "uint256"
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
                "internalType": "uint256",
                "name": "startTimestamp",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "endTimestamp",
                "type": "uint256"
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