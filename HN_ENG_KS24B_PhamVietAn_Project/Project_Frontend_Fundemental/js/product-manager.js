function getTests() {
    return JSON.parse(localStorage.getItem("testList")) || [];
}

function getCategories() {
    return JSON.parse(localStorage.getItem("category")) || [];
}

function setTests(data) {
    localStorage.setItem("testList", JSON.stringify(data));
}

let testTableBody = document.getElementById("product-table-body");
let searchInput = document.getElementById("search-input");
let sortSelect = document.getElementById("sort-select");
let pagination = document.getElementById("pagination");
let deleteModal = new bootstrap.Modal(document.getElementById("delete-test"));
let confirmDeleteBtn = document.getElementById("confirm-delete");

let currentPage = 1;
let perPage = 8;
let deleteId = null;

function renderTestTable(data) {
    testTableBody.innerHTML = "";
    const categories = getCategories();
    let start = (currentPage - 1) * perPage;
    let end = start + perPage;
    let paginatedItems = data.slice(start, end);

    paginatedItems.forEach(test => {
        const category = categories.find(c => c.id === test.categoryId);
        const categoryDisplay = category ? `${category.categoryEmoji} ${category.categoryName}` : "Không xác định";
        let row = document.createElement("tr");
        row.innerHTML = `
            <td class="text-center">${test.id}</td>
            <td>${test.testName}</td>
            <td>${categoryDisplay}</td>
            <td>${test.questions.length}</td>
            <td>${test.playTime} phút</td>
            <td class="text-center">
                <button class="btn btn-warning" onclick="window.location.href='../pages/edit-test.html?id=${test.id}'">Sửa</button>
                <button class="btn btn-danger" data-id="${test.id}" data-bs-toggle="modal" data-bs-target="#delete-test">Xoá</button>
            </td>
        `;
        testTableBody.appendChild(row);
    });

    document.querySelectorAll(".btn-danger").forEach(btn => {
        btn.addEventListener("click", () => {
            deleteId = parseInt(btn.getAttribute("data-id"));
        });
    });
}

function renderPagination(data) {
    let totalPages = Math.ceil(data.length / perPage);
    pagination.innerHTML = "";

    let backBtn = document.createElement("button");
    backBtn.className = `back-page ${currentPage === 1 ? "disabled-page" : ""}`;
    backBtn.innerHTML = "&lt;";
    backBtn.disabled = currentPage === 1;
    backBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updateTestTable();
        }
    });
    pagination.appendChild(backBtn);

    for (let i = 1; i <= totalPages; i++) {
        let pageBtn = document.createElement("button");
        pageBtn.className = `page-btn ${i === currentPage ? "this-page" : ""}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener("click", () => {
            currentPage = i;
            updateTestTable();
        });
        pagination.appendChild(pageBtn);
    }

    let nextBtn = document.createElement("button");
    nextBtn.className = `next-page ${currentPage === totalPages ? "disabled-page" : ""}`;
    nextBtn.innerHTML = "&gt;";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateTestTable();
        }
    });
    pagination.appendChild(nextBtn);
}

function updateTestTable() {
    let tests = getTests();
    let filtered = tests.filter(item =>
        item.testName.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    switch (sortSelect.value) {
        case "nameUp":
            filtered.sort((a, b) => a.testName.localeCompare(b.testName));
            break;
        case "nameDown":
            filtered.sort((a, b) => b.testName.localeCompare(a.testName));
            break;
        case "timeUp":
            filtered.sort((a, b) => a.playTime - b.playTime);
            break;
        case "timeDown":
            filtered.sort((a, b) => b.playTime - a.playTime);
            break;
    }

    renderTestTable(filtered);
    renderPagination(filtered);
}

searchInput.addEventListener("input", () => {
    currentPage = 1;
    updateTestTable();
});

sortSelect.addEventListener("change", () => {
    currentPage = 1;
    updateTestTable();
});

confirmDeleteBtn.addEventListener("click", () => {
    if (deleteId !== null) {
        let tests = getTests();
        let updated = tests.filter(t => t.id !== deleteId);
        setTests(updated);
        deleteModal.hide();
        updateTestTable();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    updateTestTable();
});
