let currentPage = 1;
let perPage = 8;
let pagination = document.querySelector(".split-pages");

// Lấy dữ liệu từ localStorage
function getTestData() {
  let data = localStorage.getItem("testList");
  return data ? JSON.parse(data) : [];
}

// Lưu dữ liệu vào localStorage
function saveTestData(data) {
  localStorage.setItem("testList", JSON.stringify(data));
}

// Lấy biểu tượng danh mục theo ID
function getCategoryLabel(id) {
  let categoryList = JSON.parse(localStorage.getItem("category")) || [];
  let cat = categoryList.find(c => c.id === id);
  return cat ? `${cat.categoryEmoji} ${cat.categoryName}` : "📚 Khác";
}

// Render danh sách bài test
function renderTests(tests) {
  let container = document.querySelector(".test-container");
  container.innerHTML = "";

  if (tests.length === 0) {
    container.innerHTML = "<p class='text-center text-muted'>Không có bài test nào</p>";
    return;
  }

  tests.forEach(test => {
    container.insertAdjacentHTML("beforeend", `
      <div class="task d-flex align-items-center">
        <img src="${test.image || "../assets/images/default.jpg"}" alt="">
        <div class="m-auto">
          <p>${getCategoryLabel(test.categoryId)}</p>
          <h5>${test.testName}</h5>
          <p>${test.questions.length} câu hỏi - ${test.playAmount} lượt chơi</p>
        </div>
        <button class="btn-play btn btn-warning" onclick="playQuestion(${test.id})">Chơi</button>
      </div>
    `);
  });
}

// Render phân trang
function renderPagination(data) {
  let totalPages = Math.ceil(data.length / perPage);
  let isFirstPage = currentPage === 1;
  let isLastPage = currentPage === totalPages;

  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  pagination.innerHTML = `
    <button class="back-page ${isFirstPage ? "disabled-page" : ""}" ${isFirstPage ? "disabled" : ""}>&lt;</button>
    ${Array.from({ length: totalPages }, (_, i) => `
      <button class="page-btn ${currentPage === i + 1 ? "this-page" : ""}">${i + 1}</button>
    `).join("")}
    <button class="next-page ${isLastPage ? "disabled-page" : ""}" ${isLastPage ? "disabled" : ""}>&gt;</button>
  `;

  pagination.querySelector(".back-page")?.addEventListener("click", () => {
    if (!isFirstPage) {
      currentPage--;
      updateTable();
    }
  });

  pagination.querySelector(".next-page")?.addEventListener("click", () => {
    if (!isLastPage) {
      currentPage++;
      updateTable();
    }
  });

  pagination.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentPage = parseInt(btn.textContent);
      updateTable();
    });
  });
}

// Cập nhật bảng hiển thị theo trang
function updateTable() {
  let tests = getTestData();
  let start = (currentPage - 1) * perPage;
  let currentTests = tests.slice(start, start + perPage);
  renderTests(currentTests);
  renderPagination(tests);
}

// Chơi bài test
function playQuestion(id) {
  console.log("Chơi bài test ID:", id);
  // location.href = `play.html?id=${id}`;
}

// Chơi ngẫu nhiên
function playRandom() {
  let tests = getTestData();
  if (tests.length === 0) return;
  let random = tests[Math.floor(Math.random() * tests.length)];
  playQuestion(random.id);
}

// Sắp xếp theo lượt chơi
function ascending() {
  let sorted = getTestData().sort((a, b) => a.playAmount - b.playAmount);
  saveTestData(sorted);
  currentPage = 1;
  updateTable();
}

function descending() {
  let sorted = getTestData().sort((a, b) => b.playAmount - a.playAmount);
  saveTestData(sorted);
  currentPage = 1;
  updateTable();
}

// Khi load trang
document.addEventListener("DOMContentLoaded", () => {
  updateTable();
});
