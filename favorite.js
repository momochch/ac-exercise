const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

// 把dataPanel抓出來
const dataPanel = document.querySelector('#data-panel')

// render(渲染)意思:把資料處理之後，變成html元素放到dom tree或html裡面
// 此處多用一個參數data將資料傳進來是為了增加函式的複用性，在不同情境下可以被重複使用，寫成"function renderMovieList(movies)"會讓他們綁在一起，未來如果要的不是movies的資料，還要再回來改這裡是多費工
// 盡量讓每個函式都只做一件事情就好
// rawHTML負責裝我們解析data後產生的html
function renderMovieList(data) {
  let rawHTML = ''
  // need title, image
  data.forEach((item) => {
    console.log(item)
    rawHTML += `<div class="col-sm-3">        
          <div class="card">
            <img
              src= "${POSTER_URL + item.image}"
              class="card-img-top" alt="movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"             data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}

// 找單一電影的資料用id找，絕對不會重複
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    //response.data.results
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

// find回傳元素，findIndex回傳該元素的位置，此處刪除只是刪除資料的位置而非資料本身，所以用findIndex
function removeFromFavorite(id) {
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  // return console.log(movieIndex)，點選"X"時，console出該筆資料位置
  movies.splice(movieIndex, 1)
  // 資料起始movieIndex，deleteCount=1(刪除1個)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}

// 按btn-show-movie後，可以將modal上資料做改變
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  }
  else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)
