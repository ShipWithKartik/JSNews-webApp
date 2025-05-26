const API_KEY = "50948890f895466290f50c3a164e08cc";
const URL = "https://newsapi.org/v2/everything?q=";

document.addEventListener("DOMContentLoaded", () => {
    const userPreferences = JSON.parse(localStorage.getItem("userTopics"));
    if (!userPreferences) {
        showPreferencesModal();
    } 
    else {
        renderNavbar(userPreferences);
        fetchNews("India");
    }
});

async function fetchNews(query) {
    try {
        const formattedQuery = query.toLowerCase();
        const res = await fetch(`${URL}${formattedQuery}&apiKey=${API_KEY}`);
        if (!res.ok) throw new Error('Network response was not ok ' + res.statusText);
        
        const data = await res.json();
        
        if (data.articles && data.articles.length > 0) {
            bindData(data.articles);
        } 
        else {
            displayNoArticlesMessage();
        }
    } 
    catch (error) {
        console.error('Fetch error:', error);
    }
}

function displayNoArticlesMessage() {
    const cardsContainer = document.getElementById('cards-container');
    cardsContainer.innerHTML = `<p>No articles found for this topic. Please try another one.</p>`;
}

function bindData(articles) {
    const cardsContainer = document.getElementById('cards-container');
    const newsCardsTemplate = document.getElementById('template-news-card');

    cardsContainer.innerHTML = '';
    articles.forEach(article => {
        if (!article.urlToImage) return;
        const cardClone = newsCardsTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector('#news-img');
    const newsTitle = cardClone.querySelector('#news-title');
    const newsSource = cardClone.querySelector('#news-source');
    const newsDesc = cardClone.querySelector('#news-desc');

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    newsSource.innerHTML = `${article.source.name} • ${date}`;

    cardClone.querySelector('.card').addEventListener('click', () => {
        window.open(article.url, '_blank');
    });
}

let currSelectedNav = null;
function onNavItemClick(topic) {
    fetchNews(topic);
    currSelectedNav.classList.remove('active');
    currSelectedNav = document.getElementById(topic);
    currSelectedNav.classList.add('active');
}

document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('news-input').value;
    if (!query) return;
    fetchNews(query);
    currSelectedNav?.classList.remove('active');
    currSelectedNav = null;
});

function reload() {
    window.location.reload();
}

function showPreferencesModal() {
    const modal = document.getElementById("preferencesModal");
    modal.style.display = "flex";

    document.getElementById("savePreferences").addEventListener("click", () => {
        const selectedTopics = Array.from(document.querySelectorAll('#topics-list input:checked'))
            .map(input => input.value);
        
        localStorage.setItem("userTopics", JSON.stringify(selectedTopics));
        modal.style.display = "none";
        renderNavbar(selectedTopics);
    });
}


function renderNavbar(topics) {
    const navLinks = document.querySelector(".nav-links ul");
    navLinks.innerHTML = "";

    topics.forEach(topic => {
        const navItem = document.createElement("li");
        navItem.classList.add("hover-link", "nav-item");
        navItem.textContent = topic;
        navItem.id = topic.toLowerCase();
        navItem.onclick = () => onNavItemClick(topic.toLowerCase());
        navLinks.appendChild(navItem);
    });
}

