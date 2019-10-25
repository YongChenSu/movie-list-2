(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')
  const pagination = document.getElementById('pagination')
  const modeSwitcher = document.getElementById('mode-switcher')
  const ITEM_PER_PAGE = 12
  const dataPanel = document.getElementById('data-panel')

  let isListMode = false
  let paginationData = []
  let currentPageNumber = 1

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    // displayDataList(data)
    getTotalPages(data)
    getPageData(1, data)
  }).catch((err) => console.log(err))

  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    }
  })

  function getCardMode(data) {
    let cardContent = ''
    data.forEach(function (item, index) {
      cardContent += `
        <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h5 class="card-title">${item.title}</h5>
            </div>

            <!-- "More" button -->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <!-- 'Favorite Button' -->
              <button class='btn btn-info btn-add-favorite' data-id='${item.id}'>+</button>
            </div>
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = cardContent
  }

  function getListMode(data) {
    let listContent = ''
    data.forEach(function (item, index) {
      listContent += `
        <div class='col-12 d-flex justify-content-between border-top py-2 mx-2'>
          <h6 class='mt-2'>${item.title}</h6>
          <div class='jsutify-content-end'>
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
            <button class='btn btn-info btn-add-favorite' data-id='${item.id}'>+</button>
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = listContent
  }

  // modeSwitcher.addEventListener('click', event => {
  //   if (event.target.matches('.fa-th')) {
  //     getCardMode(data)
  //   } else if (event.target.matches('.fa-bars')) {
  //     getListMode(data)
  //   }
  // })

  modeSwitcher.addEventListener('click', event => {
    isListMode = event.target.matches('.fa-bars') ? true : false
    getPageData(currentPageNumber)
  })

  // function displayDataList(data) {
  //   let htmlContent = ''
  //   data.forEach(function (item, index) {
  //     htmlContent += `
  //       <div class="col-sm-3">
  //         <div class="card mb-2">
  //           <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
  //           <div class="card-body movie-item-body">
  //             <h5 class="card-title">${item.title}</h5>
  //           </div>

  //           <!-- "More" button -->
  //           <div class="card-footer">
  //             <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
  //             <!-- 'Favorite Button' -->
  //             <button class='btn btn-info btn-add-favorite' data-id='${item.id}'>+</button>
  //           </div>
  //         </div>
  //       </div>
  //     `
  //   })

  //   dataPanel.innerHTML = htmlContent
  // }

  function displayDataList(data) {
    //if there is no data show empty message
    if (data.length === 0) return dataPanel.innerHTML = ` 
      <div class='text-secondary p-3'>
        <h4><i class="far fa-sad-tear pr-2"></i>No movie found!</h4>
      </div>
    `
    //otherwise, display movies based on display mode
    dataPanel.innerHTML = isListMode ? getListMode(data) : getCardMode(data)
  }

  function showMovie(id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id
    console.log(url)

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results
      console.log(data)

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  searchForm.addEventListener('submit', event => {
    event.preventDefault()

    const regex = new RegExp(searchInput.value, 'i')

    results = data.filter(movie => movie.title.match(regex))
    console.log(results)
    // displayDataList(results)
    getTotalPages(results)
    getPageData(1, results)

    searchInput.value = ''
  })

  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} has alredy in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  function updatePaginationStatus(pageNum) {
    pagination.children[pageNum].classList.toggle('active')
  }

  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    pageItemContent += `
      <li class="page-item">
      <a class="page-link" href="javsscript:;" data-page="previous">&laquo</a>
      </li>
      `

    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }

    pageItemContent += `
      <li class="page-item">
        <a class="page-link" href="javsscript:;" data-page="next">&raquo</a>
      </li>
    `

    pagination.innerHTML = pageItemContent
    updatePaginationStatus(1)
  }



  // listen to pagination click event
  pagination.addEventListener('click', event => {
    updatePaginationStatus(currentPageNumber)

    switch (event.target.dataset.page) {
      case 'previous':
        currentPageNumber = currentPageNumber - 1 || 1
        break
      case 'next':
        const currentTotalPage = pagination.children.length - 2
        currentPageNumber = Math.min(currentPageNumber + 1, currentTotalPage)
        break
      default:
        currentPageNumber = Number(event.target.dataset.page)
    }

    getPageData(currentPageNumber)

    updatePaginationStatus(currentPageNumber)
  })

  function getPageData(pageNum, data) {
    currentPageNumber = pageNum || currentPageNumber
    paginationData = data || paginationData
    let offset = (currentPageNumber - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)
  }
})()
