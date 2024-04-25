const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = [] //拿來放電影清單
let filteredMovies = [] //搜尋出來的電影

// 把dataPanel抓出來
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount){
const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
let rawHTML = ''

for (let page = 1; page <= numberOfPages; page ++){
  rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
}

paginator.innerHTML = rawHTML

}


// 按到第X頁顯示第Y~Z的電影
// page 1 -> movies 0 - 11；page 2 -> movies 12 - 23...
// movies有兩種情形:所有80部電影清單；搜尋後的電影清單
// filteredMovies.length ? filteredMovies : movies 意思是如果filteredMovies.length是有東西的(>0)，就給我filteredMovies，如果是空的就給我movies
function getMoviesByPage(page){
  
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = ( page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
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

// 拿出local storage東西
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  // isMovieMatched是含式，find(含式)
  // (movie) => movie.id === id )也就是 
  // "function isMovieMatched(movie){
  //   return movie.id === id
  // }" 縮寫
 
  if (list.some((movie) => movie.id === id)){
    return alert('此電影已經在收藏清單中')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
 }

// 按btn-show-movie後，可以將modal上資料做改變
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  }
  else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event){
if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)

renderMovieList(getMoviesByPage(page))
// console.log(event.target.dataset.page)
})


searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 加入event.preventDefault()就會停留在此頁面
  event.preventDefault()
  // .trim()字串去頭尾的空白；toLowerCase:全部轉為小寫
  const keyword = searchInput.value.trim().toLowerCase()
  // filteredMovies存放搜尋完的結果
  

  // 1: for of loop，如果movie.title有包含keyword，就放進filteredMovies[]
  //   for (const movie of movies){
  //     if (movie.title.toLowerCase().includes(keyword)){
  //     filteredMovies.push(movie)
  //   }
  // }

  //2. filter 是陣列用的方法，會把陣列裡每一個元素都丟進條件函示裡面去檢查，如果有成功，元素就會被留下，不成功就丟掉
  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  )
  // 當keyword輸入找不到東西時，跳出alert
  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword : ' + keyword)
  }
  // 當keyword沒有輸入任何東西時，跳回全部電影選單:不寫程式，但如果想要keyword被輸入空白時跳出alert，可加入下列
  // if(!keyword.length){
  //   return alert('Please enter a valid string')
  // }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})


axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  // 先console出來確認要的data外面沒有再包一層
  //    console.log(movies)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))

})
  .catch((error) => console.log(error))


