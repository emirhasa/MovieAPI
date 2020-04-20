//we'll hold the search data here
const state = {};

//this class gets the state of the actual search data 
class SearchService {

    constructor() {
        this._url = `https://www.omdbapi.com/?apikey=1c095c3d&t=`;
    }

    async getMovieData(searchQuery) {
        //format search string to a query string
        let queryString = encodeURIComponent(searchQuery);
        let url = this._url + queryString;
        let result = null;

        console.log(url);
        try {
            result = await (await fetch(url)).json();
        } catch (e) {
            console.log('error');
            throw new Error('Something went wrong...');
        }

        if (result.Response === "False") return null;
        return result;
    }

    async getSeasonData(movieTitle, seasonNumber) {
        let queryString = encodeURIComponent(movieTitle);
        let url = this._url + queryString;
        let result = null;

        url += `&season=${seasonNumber}`;
        try {
            result = await (await fetch(url)).json();
        }
        catch (e) {
            console.log('error');
            throw new Error('Something went wrong...');
        }

        if (result.Response === "False") return null;
        return result;
    }

    async logSearchQuery(searchQuery) {
        let urlEncodedData = "query=";
        urlEncodedData += encodeURIComponent(searchQuery.trim());

        console.log("Sending query log to server...");
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/Home/LogQuery", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(urlEncodedData);
    }
}

//this class takes care of changing the view
class SearchView {
    constructor() {
        this._DOMStrings = {
            searchButton: document.querySelector('#search__button'),
            searchInput: document.querySelector('#search__input'),
            searchResult: document.querySelector('#search__result'),
            movieSeasons: document.querySelector('.movie__seasons'),
            seasonResult: document.querySelector('#season__result'),
            searchError: document.querySelector('#search__error'),
            searchLoader: document.querySelector('.search__loader')
        }
    }

    getDOMStrings() {
        return this._DOMStrings;
    }

    getInput() {
        return this._DOMStrings.searchInput.value;
    }

    renderMovie(movie) {
        let markup = `
            <div class="movie__title mb-md">
                <h3 class="movie__title">${movie.Title}</h3>
                <hr>
            </div>
            <div class="movie__info">
                <div class="movie__cell">
                    <label class="movie__data-heading">Genre:</label><br>
                    <label class="movie__data-value movie__year">${movie.Genre}</label>
                </div>
                <div class="movie__cell">
                    <label class="movie__data-heading">Year:</label><br>
                    <label class="movie__data-value movie__year">${movie.Released}</label>
                </div>
                <div class="movie__cell">
                    <label class="movie__data-heading">Writer(s):</label><br>
                    <label class="movie__data-value movie__director">${movie.Writer}</label>
                </div>
                <div class="movie__cell">
                    <label class="movie__data-heading">Actors:</label><br>
                    <label class="movie__data-value movie__actors">${movie.Actors}</label>
                 </div>
                <div class="movie__cell">
                    <label class="movie__data-heading">IMDB Rating:</label><br>
                    <label class="movie__data-value movie__rating">${movie.imdbRating} / 10</label>
                </div>
                <div class="movie__cell">
                    <label class="movie__data-heading">Runtime:</label><br>
                    <label class="movie__data-value movie__runtime">${movie.Runtime}</label>
               </div>
                <div class="movie__cell">
                    <label class="movie__data-heading">Language:</label><br>
                    <label class="movie__data-value movie__actors">${movie.Language}</label>
                </div>
                <div class="movie__cell">
                    <label class="movie__data-heading">Type:</label><br>
                    <label class="movie__data-value movie__actors">${movie.Type}</label>
                </div>
                <div class="movie__cell">
                    <label class="movie__data-heading">IMDB Votes:</label><br>
                    <label class="movie__data-value movie__actors">${movie.imdbVotes}</label>
                </div>
                <div class="movie__cell movie__plot">
                    <label class="movie__data-heading">Plot:</label><br>
                    <label class="movie__data-value movie__plot-desc">${movie.Plot}</label>
                </div>

                <div class="movie__picture">
                    <img src="${movie.Poster}" alt="${movie.Title} picture">
                </div>

                <div class="movie__seasons">
                    <p class="movie__seasons-desc">If seasons are available, click below to get more info.</p>
                    %seasons%
                </div>`;

        if (movie.totalSeasons) {
            let seasons = Number.parseInt(movie.totalSeasons);
            if (seasons > 0) {
                let newMarkup = '';
                for (let i = 1; i <= seasons; i++) {
                    newMarkup += `<label class="season-${i}"><a href="#season__result" class="movie__season-btn" data-season="${i}">Season ${i}</a></label><br>`;
                }
                markup = markup.replace('%seasons%', newMarkup);
            }
        } else {
            markup = markup.replace('%seasons%', 'No seasons available');
        }

        this._DOMStrings.searchResult.innerHTML = markup;
    }

    renderSeason(season) {
        let markup = `
        <div class="season">
            <div class="season__title mb-md">
                ${season.Title} Season ${season.Season}
                <hr>
            </div>
            ${ season.Episodes.map(episode => this._renderEpisode(episode)).join('')}
        </div>`;

        this._DOMStrings.seasonResult.innerHTML = markup;
    }

    _renderEpisode(episode) {
        return `            
        <div class="season__episode">
            <div class="episode__header">
                <label class="episode__no">Episode ${episode.Episode}</label>
                <label class="episode__title">${episode.Title}</label>
            </div>
        </div>`;
    }

    clearResults() {
        this._DOMStrings.searchResult.innerHTML = 'No data to display';
        this.clearSeasonResults();
    }

    clearSeasonResults() {
        this._DOMStrings.seasonResult.innerHTML = '';
    }

    displayError() {
        this._DOMStrings.searchError.classList.add('error-label--visible');
    }

    clearError() {
        this._DOMStrings.searchError.classList.remove('error-label--visible');
    }

    displayLoader() {
        this._DOMStrings.searchLoader.classList.add('search__loader--visible');
    }

    clearLoader() {
        this._DOMStrings.searchLoader.classList.remove('search__loader--visible');
    }
}

//this class acts as a main controller to "route" requests(events) and invoke changes
class MainController {
    constructor() {
        this._searchView = new SearchView();
        this._searchService = new SearchService();
        this._DOM = this._searchView.getDOMStrings();
        this._setupEventListeners();
    }

    _setupEventListeners() {
        //event listeners for submitting the search query
        this._DOM.searchButton.addEventListener('click', () => this._querySubmitted());
        this._DOM.searchInput.addEventListener('keyup', (event) => { event.preventDefault(); if (event.key === 'Enter') { this._querySubmitted() } });
        this._DOM.searchResult.addEventListener('click', (event) => { const element = event.target; if (element.classList.contains('movie__season-btn')) { this._loadSeason(element.dataset.season) } });
    }

    async _querySubmitted() {
        //function responsible for handling submittance of search query
        const query = this._searchView.getInput();

        if (!query || !query.trim()) {
            this._searchView.displayError();
        } else {
            this._searchView.clearError();
            try {
                this._searchView.displayLoader();
                state.movie = await this._searchService.getMovieData(query);
                if (state.movie) {
                    console.log(state.movie);
                } else {
                    state.movie = null;
                    this._searchView.clearResults();
                }
                this._searchView.clearLoader();
            }
            catch {
                alert("Something went wrong");
            }

            if (state.movie) {
                this._searchView.renderMovie(state.movie);
            }

            this._searchService.logSearchQuery(query);
        }
    }

    async _loadSeason(seasonNumber) {

        try {
            state.season = await this._searchService.getSeasonData(state.movie.Title, seasonNumber);
            if (state.season) {
                console.log(state.season);
            } else {
                state.season = null;
                this._searchView.clearSeasonResults();
            }
        }
        catch {
            alert("Something went wrong");
        }

        if (state.season) {
            this._searchView.renderSeason(state.season);
        }

    }

}

var mainCtrl = new MainController();

