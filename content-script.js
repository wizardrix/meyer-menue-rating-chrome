function initSidebarObserver() {
    console.log("init sidebar observer");
    const sidebar = document.getElementById("sidebar");
    const sidebarObserver = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.target.nodeName === "DETAILS-VIEW") {
                detailsContainer = mutation.addedNodes.item(0);
                loadRatingIntoDetailsView(detailsContainer);
            }
        }
    });
    sidebarObserver.observe(sidebar, {
        subtree: true,
        childList: true
    });
}

function initCalendarObserver() {
    console.log("init calendar observer");
    // Menüs werden erst im Nachhinein in den Kalender geladen, daher beobachte Änderungen
    // und ziehe die Menüs heraus (haben class "headline").
    const calendar = document.getElementById("calendar");
    const calendarObserver = new MutationObserver((mutationList, observer) => {
        console.log("mutation");
        const menuElements = [];
        for (const mutation of mutationList) {
            const mutationElement = mutation.target.parentElement;
            if (mutationElement.classList.contains("headline")) {
                //console.log(mutationElement.innerHTML);
                menuElements.push(mutationElement.parentElement);
                mutationElement.parentElement.addEventListener("click", event => {
                    console.log("Menü geklickt!");
                    // if (!thumbsAdded) {
                    //     //console.log(document.getElementsByClassName("sidebar-actions").item(0));
                    //     addThumbs(document.getElementById("sidebar"));
                    //     thumbsAdded = true;
                    // }
                });
            }
        }

        console.log(menuElements);
    });
    calendarObserver.observe(calendar, {
        subtree: true,
        characterData: true
    });
}

async function loadRatingIntoDetailsView(detailsContainer) {
    const menuId = document.getElementsByClassName("detail-image")[0].children[0].src.split("/").at(-1);
    const menuName = document.getElementsByClassName("detail-headline")[0].children[0].innerText;
    console.log(menuId + ": " + menuName);

    const menu = await chrome.storage.sync.get(menuId)
    const rating = typeof menu[menuId] === "undefined" ? -1 : menu[menuId].rating;
    const ratingElement = createRatingElement(rating, (val) => saveRating(menuId, menuName, val));

    detailsContainer.childNodes.forEach((child) => {
        if (typeof child.classList !== "undefined" && child.classList.contains("sidebar-frame")) {
            detailsContainer.insertBefore(ratingElement, child);
        }
    });

}

function createRatingElement(curValue, changeListener) {
    console.log(curValue);
    const ratingElement = document.createElement("div");
    ratingElement.classList.add("rating");
    for (let val = 1; val <= 5; val++) {
        const radioStar = createRadioStar(val, val == curValue);
        ratingElement.appendChild(createRadioStar(val, val == curValue, changeListener));
    }
    return ratingElement;
}

function createRadioStar(value, checked, changeListener) {
    const radio = document.createElement("input");
    radio.setAttribute("type", "radio");
    radio.setAttribute("name", "rating");
    radio.setAttribute("value", value);
    radio.checked = checked;
    radio.addEventListener("change", () => changeListener(value));
    return radio;
}

function loadRatingById(menuId) {
    chrome.storage.sync.get([menuId]);
}

function saveRating(menuId, name, rating) {
    chrome.storage.sync.set({
        [menuId]: {
            name: name,
            rating: rating
        }
    })
}

chrome.storage.sync.get(null, menus => console.log(menus));
chrome.storage.sync.getBytesInUse(null, bytes => console.log(bytes));

const main = document.getElementById("main");
const mainObserver = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.addedNodes.length > 0) {
            initSidebarObserver();
            initCalendarObserver();
        }
    }
});
mainObserver.observe(main, {
    childList: true
});

initCalendarObserver();
initSidebarObserver();