// API網址設定變數，以防後續網址變更
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 12

const users = []
let filteredUsers = []

const userPanel = document.querySelector('#user-panel')
const paginator = document.querySelector('#paginator')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const favoriteList = JSON.parse(localStorage.getItem('favoriteList')) || []

//印出使用者清單(主頁和收藏後的清單)
function renderUserList(data) {
  let userHTML = ''
  data.forEach((data) => {
    if (favoriteList.some(user => user.id === item.id)) {
      userHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${data.avatar}" class="card-img-top user-image" data-id="${data.id}"alt="user-avatar" data-bs-toggle="modal" data-bs-target="#user-modal">
              <div class="card-body">
                <h6 class="card-title mb-2">${data.name} ${data.surname}</h6>
                  <div class="card-footer">
                    <a href="#" class="btn btn-outline-danger btn-remove-favorite" data-id="${data.id}">移除最愛💔</a>
                    </div>
              </div>
            </div>
          </div>
        </div>
      `
    } else {
      userHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${data.avatar}" class="card-img-top user-image" data-id="${data.id}"alt="user-avatar" data-bs-toggle="modal" data-bs-target="#user-modal">
              <div class="card-body">
                <h6 class="card-title mb-2">${data.name} ${data.surname}</h6>
                  <div class="card-footer">
                    <a href="#" class="btn btn-outline-danger btn-add-favorite" data-id="${data.id}">加入最愛❤</a>
                    </div>
              </div>
            </div>
          </div>
        </div>
      `
    }
  })
  userPanel.innerHTML = userHTML
}

//串接使用者詳細資料
function showUserInfo(id) {
  const modalTitle = document.querySelector("#user-modal-title")
  const modalImage = document.querySelector("#user-modal-image")
  const modalDescription = document.querySelector("#user-modal-description")

  //清空內容
  modalTitle.textContent = ''
  modalImage.textContent = ''
  modalDescription.textContent = ''

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data

    modalTitle.innerText = `${data.name}  ${data.surname}`
    modalImage.innerHTML = `<img src="${data.avatar}" alt="user-poster" class="img-fuid">`
    modalDescription.innerHTML = `
      <p class="user-modal-email">Email: ${data.email}</p>
      <p class="user-modal-gender">Gender: ${data.gender}</p>
      <p class="user-modal-age">Age: ${data.age}</p>
      <p class="user-modal-region">Region: ${data.region}</p>
      <p class="user-modal-birthday">Birthday: ${data.birthday}</p>
    `
  })
}

// 渲染頁碼
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 分頁用函式
function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users

  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

//新增到我的最愛
// function addToFavorite(id) {
//   const list = JSON.parse(localStorage.getItem('favoriteUser')) || [] 
//   const user = users.find((user) => user.id === id)

//   if (list.some((user) => user.id === id)) {
//     return alert('已經在我的最愛清單當中!')
//   }

//   list.push(user)
//   localStorage.setItem('favoriteUser', JSON.stringify(list))  
// }

// 優化:顯示已加入最愛
// 加入最愛
function addToFavorite(id) {
  const newFavorite = users.find(user => user.id === id)
  favoriteList.push(newFavorite)
  localStorage.setItem('favoriteUser', JSON.stringify(favoriteList))
}
// 移除最愛
function deleteFavorite(id) {
  const favoritedIndex = favoriteList.findIndex(user => user.id === id)
  if (favoritedIndex < 0) return
  favoriteList.splice(favoritedIndex, 1)
  localStorage.setItem('favoriteUser', JSON.stringify(favoriteList))
}

// 切換移除最愛
function styleDeleteFavorite(style) {
  style.classList.remove('btn-add-favorite')
  style.classList.add('btn-remove-favorite')
  style.innerText = '移除最愛💔'
}
// 切換加入最愛
function styleAddToFavorite(style) {
  style.classList.remove('btn-remove-favorite')
  style.classList.add('btn-add-favorite')
  style.innerText = '加入最愛❤'
}


//監聽 -> 點擊大頭貼顯示詳細資訊、點擊按鈕加入我的最愛
userPanel.addEventListener("click", function onPanelClicked(event) {
  const target = event.target
  if (target.matches(".card-img-top")) {
    showUserInfo(Number(target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(target.dataset.id))
    styleDeleteFavorite(target)
  } else if (event.target.matches('.btn-remove-favorite')) {
    deleteFavorite(Number(target.dataset.id))
    styleAddToFavorite(target)
  }
})

// 監聽換頁
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
})

//搜尋功能
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword) ||
    user.surname.toLowerCase().includes(keyword)
  )

  if (filteredUsers.length === 0) {
    alert("無此姓名，請重新輸入!")
    searchInput.value = ' '
    return
  }

  renderPaginator(filteredUsers.length)
  renderUserList(getUsersByPage(1))
})

axios.get(INDEX_URL).then((response) => {
  users.push(...response.data.results)
  renderPaginator(users.length)
  renderUserList(getUsersByPage(1))
})
