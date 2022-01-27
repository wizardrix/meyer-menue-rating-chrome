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

// The menus are loaded into the calendar after the side finished loading,
// therefore we need to listen on the calendar element once
// The switching of the week is observed by the mainObserver
function initCalendarObserver() {
    console.log("init calendar observer");
    const calendar = document.getElementById("calendar");
    if (!calendar) {
        console.log("no calendar found");
        return;
    }

    const calendarObserver = new MutationObserver((mutationList, observer) => {
        loadRatingsIntoCalendar();
    });
    calendarObserver.observe(calendar, {
        subtree: true,
        characterData: true
    });
}

function loadRatingsIntoCalendar() {
    console.log("load ratings");
    document.querySelectorAll("[data-image]").forEach(element => {
        const menuId = element.getAttribute("data-image").split("/").at(-1);
        const headlineElement = element.nextSibling.firstChild.childNodes[1];
        loadRatingIntoElement(headlineElement, menuId);
    });
}

function fillStarRatingElement(ratingElement, rating) {
    ratingElement.textContent = "";
    for (let i = 1; i <= 5; i++) {
        const starElement = document.createElement("span");
        starElement.classList.add("star-icon");
        if (rating >= i) {
            starElement.classList.add("filled");
            starElement.innerHTML = "&starf;";
        } else {
            starElement.innerHTML = "&star;";
        }
        ratingElement.appendChild(starElement);
    }
}

async function loadRatingIntoElement(element, menuId) {
    const menu = await loadRatingById(menuId);
    if (typeof menu[menuId] !== "undefined") {
        let ratingElement;
        element.childNodes.forEach(child => {
            if (child.classList.contains("rating-display")) {
                ratingElement = child;
            }
        });
        if (!ratingElement) {
            ratingElement = document.createElement("div");
            ratingElement.classList.add("rating-display");
            element.appendChild(ratingElement);
        }
        fillStarRatingElement(ratingElement, menu[menuId].rating);
    }
}

async function loadRatingIntoDetailsView(detailsContainer) {
    const menuId = document.getElementsByClassName("detail-image")[0].children[0].src.split("/").at(-1);
    const menuName = document.getElementsByClassName("detail-headline")[0].children[0].innerText;
    console.log(menuId + ": " + menuName);

    const menu = await loadRatingById(menuId);
    const rating = typeof menu[menuId] === "undefined" ? -1 : menu[menuId].rating;
    const ratingElement = createRatingElement(rating, (val) => {
        saveRating(menuId, menuName, val);
        loadRatingsIntoCalendar();
    });

    detailsContainer.childNodes.forEach((child) => {
        if (typeof child.classList !== "undefined" && child.classList.contains("sidebar-frame")) {
            detailsContainer.insertBefore(ratingElement, child);
        }
    });

}

function createRatingElement(curValue, changeListener) {
    console.log(curValue);
    const ratingElement = document.createElement("div");
    ratingElement.classList.add("rating-input");
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
    return chrome.storage.sync.get(menuId);
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

// to load the ratings into the calendar, when the week is switched,
// we need to listen for child addition to the main element
const main = document.getElementById("main");
const mainObserver = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.addedNodes.length > 0) {
            initSidebarObserver();
            if (document.querySelectorAll("[data-image]").length > 0) {
                loadRatingsIntoCalendar();
            } else {
                initCalendarObserver();
            }
        }
    }
});
mainObserver.observe(main, {
    childList: true
});

initSidebarObserver();
initCalendarObserver();