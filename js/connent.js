// 連接錢包
async function connect(){
    if(await checkIfConnected()){
        console.log("已連線錢包");
        if (window.location.href != "self.html"){
            window.location.href = "self.html";
        }
    }else{
        console.log("即將開始連接錢包");
        // 檢查是否安裝MetaMask
        if (window.ethereum) {
            try {
                var account = await ethereum.request({ method: "eth_requestAccounts" });
                console.log(account);
                window.location.href = "self.html";
            } catch (error) {
                if (error.code === 4001) {
                    // 使用者拒絕了連接請求
                    console.log("使用者拒絕了連接請求");
                    alert("連接被拒絕，請重新嘗試！");
                } else {
                    console.error("連接錢包失敗:", error);
                    alert("連接失敗，請稍後再試！");
                }
            }
        } else {
            alert("請先安裝MetaMask");
        }
    }
}

// 檢查是否連線錢包
async function checkIfConnected() {
    if (window.ethereum) {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            console.log("已連線錢包，帳號：", accounts[0]);
            return true;
        } else {
            console.log("尚未連線錢包");
            return false;
        }
    } else {
        console.log("未安裝 MetaMask");
        return false;
    }
}

// 取得鏈 ID
async function getChainId() {
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("鏈 ID：", chainId);
    return chainId;
}

//根據Chain ID取得網路名稱
async function getChainNameByID(chainid) {
    let url = "https://chainid.network/chains.json";
    var chainlist = null;
    await $.getJSON(url, function (data) {
        chainlist = data;
    });
    for (let i = 0; i < chainlist.length; i++) {
        if (chainlist[i].chainId == chainid) {
            return chainlist[i].name;
        }
    }
    return "Unknown";
}

// 取得錢包帳號
async function getAccount() {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    console.log("錢包帳號：",accounts);
    if (accounts.length === 0) {
        console.log("沒有可用的帳號");
        alert("沒有可用的帳號，請先連接錢包");
        window.location.href = "index.html";
    }
    return accounts[0];
}

// 取得錢包餘額
async function getBalance(provider, account) {
    const balance = await provider.getBalance(account);
    return ethers.formatUnits(balance, 18).slice(0, 10);
}

// 建立 provider
async function createProvider() {
    provider = new ethers.BrowserProvider(window.ethereum);
    console.log("已建立 provider，鏈 ID：", await provider.getNetwork());
    return provider;
}