// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    window.addEventListener("batterystatus", onBatteryStatus, true);
    // document.getElementById('deviceready').classList.add('ready');
    fillList();
}



function onBatteryStatus(status) {
    setBattery(status.level)
}

function saveNewItem() {
    const container = document.getElementById("top-list-container");
    const list = JSON.parse(window.localStorage.getItem("list")) || [];
    console.log(list);
    const elem = {
        title: document.getElementById("title").value,
        subtitle: document.getElementById("subtitle").value,
        img: document.getElementById("img-url").value,
        url: document.getElementById("click-url").value,
    };
    addToList([elem])

    window.localStorage.setItem("list", JSON.stringify([...list, elem]));

}

const addToList = (list) => {
    const container = document.getElementById("top-list-container");
    list.forEach((elem) => {
            container.innerHTML +=  `
            <div class="card" style="width: 18rem; cursor: pointer; margin: 2rem">
                <img src="${elem.img}" class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title">${elem.title}</h5>
                    <p class="card-text">${elem.subtitle}</p>
                </div>
            </div>
`
    }

    );
};

function fillList() {
    console.log(window.localStorage.getItem("list"));
    const storage = window.localStorage;


    const  list = JSON.parse(window.localStorage.getItem("list"));

    if (!list) {
        fetch("https://6184fd3523a2fe0017fff2ce.mockapi.io/list")
            .then(res => res.json())
            .then(data => {
                window.localStorage.setItem("list", JSON.stringify(data));
                addToList(data)

            })
    } else {
        addToList(list)
    }
}

const setBattery = (percent) => {
    console.log(percent);
    document.getElementById("result").setAttribute("style", "width:calc("+percent+"% * 0.73)");
}