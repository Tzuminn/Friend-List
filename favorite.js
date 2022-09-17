const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 12

const users = JSON.parse(localStorage.getItem('favoriteUser')) || []
let filteredUsers = []

const userPanel = document.querySelector('#user-panel')
const paginator = document.querySelector('#paginator')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

//印出使用者清單
function renderUserList(data) {
  let userHTML = ''

  data.forEach((data) => {
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

//新增移除按鈕
function removeFromFavorite(id) {
  const userIndex = users.findIndex((user) => user.id === id)
  users.splice(userIndex, 1)
  localStorage.setItem('favoriteUser', JSON.stringify(users))
  renderUserList(users)
}

//監聽 -> 點擊大頭貼顯示詳細資訊、點擊按鈕從我的最愛移除
userPanel.addEventListener("click", function onPanelClicked(event) {
  const target = event.target
  if (target.matches(".card-img-top")) {
    showUserInfo(Number(target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(target.dataset.id))
  }
})

renderUserList(users)