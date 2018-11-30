/* globals APIKEY */



const movieDataBaseURL = "https://api.themoviedb.org/3/";
let imgurl = null;
let localTime = "";
let searchString = "";
let DataTimeOut = 3600;
let imageSizes = [];

let imageUrlKey = "";
let imageSizeKey = "";
let select = "";
let selectKey = "";

document.addEventListener("DOMContentLoaded", init);

function init() {
    console.log(APIKEY);
    addEventListeners();
    saveDataToLocalStorage();
    getPosterSizeAndURL()


    getLocalStorageData();
    document.querySelector("#modleButtonDiv").addEventListener("click", showOverlay);
    document
        .querySelector(".cancelButton")
        .addEventListener("click", hideOverlay);
    document.querySelector(".overlay").addEventListener("click", hideOverlay);

    document.querySelector(".saveButton").addEventListener("click", function (e) {
        let cheeseList = document.getElementsByName("modalValue");
        let cheeseType = null;
        for (let i = 0; i < cheeseList.length; i++) {
            if (cheeseList[i].checked) {
                cheeseType = cheeseList[i].value;
                break;
            }
        }
        alert(cheeseType);
        console.log("You picked " + cheeseType);
        hideOverlay(e);
    });

}

function addEventListeners() {
    let searchButton = document.querySelector(".searchButtonDiv")
    searchButton.addEventListener("click", startSearch);
}

function startSearch() {
    console.log("start search");
    searchString = document.querySelector("#search-input").value;
    if (!searchString) {
        alert("enter valid data");
        return;
    }
    getSearchResult();
}

function getLocalStorageData() {
    //load image size and baseURL from local storage
    // doesn't exist
    //the data is there but stale (over 1 hour old)
    getPosterSizeAndURL();
    // else it does exist and is less than 1 hour old
    //load from local storage
    if (localStorage.getItem(localTime)) {
        console.log("Getting saved date from local storage");

        let savedDate = localStorage.getItem(localTime);
        savedDate = new Date(savedDate);
        console.log(savedDate);

        imgurl = localStorage.getItem(imgurl);
        imageSizes = localStorage.getItem(imageSizes);

        console.log("Saved URL: " + imgurl);
        console.log("Saved ImagesSizes: " + imageSizes);

        let seconds = calculateElapsedTime(savedDate);
        if (seconds > DataTimeOut) {
            console.log("Local storage data is stale..");
            saveDataToLocalStorage();
            getPosterSizeAndURL();
        }
    } else {
        saveDataToLocalStorage();
    }
}

function saveDataToLocalStorage() {
    console.log("Saving date to local storage..");
    let now = new Date();
    localStorage.setItem(localTime, now);
    console.log(now);
}

function getPosterSizeAndURL() {
    let url = `${movieDataBaseURL}configuration?api_key=${APIKEY}`;

    fetch(url)
        .then(function (response) {
            return response.json();

        })
        .then(function (data) {
            console.log(data);
            imgurl = data.images.secure_base_url;
            imageSizes = data.images.poster_sizes;

            localStorage.setItem(imageUrlKey, JSON.stringify(imgurl));
            localStorage.setItem(imageSizeKey, JSON.stringify(imageSizes));

            console.log("Image URL and Sizes saved in local storage");
            console.log(imgurl);
            console.log(imageSizes);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getSearchResult() {
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&query=${searchString}`;
    fetch(url)
        .then(response => response.json())
        .then((data) => {
            console.log(data);

            createPage(data);

        })
        .catch(function (error) {
            alert(error);
        });
}

function createPage(data, T) {
    // let content = document.querySelector("#search-results>.content");
    // let title = document.querySelector("#search-results>.title");
    let message = document.createElement("h2");
    let content = "";
    let title = "";
    if (T == "s") {
        content = document.querySelector("#search-results>.content");
        title = document.querySelector("#search-results>.title");
        document.getElementById("search-results").classList.add("active");
        document.getElementById("recommend-results").classList.remove("active");

    } else {
        content = document.querySelector("#recommend-results>.content");
        title = document.querySelector("#recommend-results>.title");
        document.getElementById("recommend-results").classList.add("active");
        document.getElementById("search-results").classList.remove("active");
    }

    message = document.createElement("h2");
    content.innerHTML = "";
    title.innerHTML = "";

    content.innerHTML = "";
    title.innerHTML = "";

    if (data.total_results == 0) {
        message.innerHTML = `No Results found for${searchString}`;
    } else {
        message.innerHTML = `Total results = ${data.total_results} for ${searchString}`;
    }
    title.appendChild(message);
    creatMovieCards(data.results);
    let documentFragment = new DocumentFragment();
    documentFragment.appendChild(creatMovieCards(data.results));

    content.appendChild(documentFragment);
    let Clist = document.querySelectorAll(".contenet>div");

    Clist.forEach(function (item) {
        item.addElementListener("click", getRecommedation);
    })

}

function creatMovieCards(result) {
    let documnetFragment = new DocumentFragment();
    result.forEach(function (movie) {

        let movieCard = document.createElement("div");
        let section = document.createElement("section");
        let image = document.createElement("img");
        let videoTitle = document.createElement("p");
        let videoDate = document.createElement("p");
        let videoRating = document.createElement("p");
        let videoOverview = document.createElement("p");

        videoTitle.textContent = movie.title;
        videoDate.textContent = movie.release_date;
        videoRating.textContent = movie.vote_average;
        videoOverview.textContent = movie.overview;

        image.src = `${imgurl}${imageSizes[2]}${movie.poster_path}`;
        movieCard.setAttribute("data-title", movie.title);
        movieCard.setAttribute("data-id", movie.id);

        movieCard.className = "movieCard";
        section.className = "imageSection";

        section.appendChild(image);
        movieCard.appendChild(section);
        movieCard.appendChild(videoTitle);
        movieCard.appendChild(videoDate);
        movieCard.appendChild(videoRating);
        movieCard.appendChild(videoOverview);

        documnetFragment.appendChild(movieCard);
    });
    return documnetFragment;
}

function getRecommedation() {
    let movieTitle = this.getAttribute("data-title");

    let movieID = this.getAttribute("data-id");
    console.log("you clicked: " + movieTitle + "" + movieID);

    let url = `https://api.themoviedb.org/3/movie/${movieID}/recommendations?api_key=${APIKEY}`;
    fetch(url)
        .then(response => response.json())
        .then((data) => {
            console.log(data);
            createPage(data);
        })
        .catch((error) => console.log(error));
}


function showOverlay(e) {
    e.preventDefault();
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("hide");
    overlay.classList.add("show");
    showModal(e);
}

function showModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("off");
    modal.classList.add("on");
    select = localStorage.getItem(selectKey);
    alert(select);
    if (select) {
        if (select == "movie") {
            document.getElementById("tv").checked = true;
            document.getElementById("movie").checked = false;
        } else if (select == "tv") {
            document.getElementById("tv").checked = false;
            document.getElementById("movie").checked = true;
        } else {
            document.getElementById("tv").checked = false;
            document.getElementById("movie").checked = false;
        }
    }
}

function hideOverlay(e) {
    e.preventDefault();
    e.stopPropagation(); // don't allow clicks to pass through
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    hideModal(e);
}

function hideModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("on");
    modal.classList.add("off");
}

function calculateElapsedTime(savedDate) {
    let now = new Date(); //Current date
    //console.log(now);

    let elapsedTime = now.getTime() - savedDate.getTime();

    let seconds = Math.ceil(elapsedTime / 1000);
    console.log("Elapsed Time: " + seconds + " seconds");

    return seconds;
}
