    let pageSize = 8;
    let currentPage = 1;
    let editingCategoryId = null;
  
    function getCategories() {
        return JSON.parse(localStorage.getItem("category")) || [];
    }
    
    function setCategories(categories) {
        localStorage.setItem("category", JSON.stringify(categories));
    }
    
    function ensureInitData() {
        if (!localStorage.getItem("category")) {
            setCategories(defaultCategories);
        }
    }
    
    function getNextCategoryId() {
        let categories = getCategories();
        if (categories.length === 0) {
            return 1;
        };
        return Math.max(...categories.map(cat => cat.id)) + 1;
    }
    
    function renderTable() {
        let categories = getCategories();
        let tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
    
        let start = (currentPage - 1) * pageSize;
        let currentData = categories.slice(start, start + pageSize);
    
        currentData.forEach((item) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.id}</td>
            <td class="text-start">${item.categoryEmoji} ${item.categoryName}</td>
            <td>
            <button class="btn btn-warning" onclick="openEditModal(${item.id})" data-bs-toggle="modal" data-bs-target="#edit-category">Sửa</button>
            <button class="btn btn-danger" onclick="confirmDelete(${item.id})" data-bs-toggle="modal" data-bs-target="#delete-category">Xoá</button>
            </td>`;
        tbody.appendChild(tr);
        });
    
        renderPagination();
    }
    
    function renderPagination() {
        let categories = getCategories();
        let totalPages = Math.ceil(categories.length / pageSize);
        let container = document.querySelector(".split-pages");
    
        let isFirstPage = currentPage === 1;
        let isLastPage = currentPage === totalPages;
    
        container.innerHTML = `
        <button class="back-page ${isFirstPage ? 'disabled-page' : ''}" 
                onclick="changePage(currentPage - 1)" 
                ${isFirstPage ? 'disabled' : ''}>
            &lt;
        </button>`;
    
        for (let i = 1; i <= totalPages; i++) {
        container.innerHTML += `
            <button class="page-btn ${i === currentPage ? 'this-page' : ''}" onclick="changePage(${i})">${i}</button>`;
        }
    
        container.innerHTML += `
        <button class="next-page ${isLastPage ? 'disabled-page' : ''}" 
                onclick="changePage(currentPage + 1)" 
                ${isLastPage ? 'disabled' : ''}>
            &gt;
        </button>`;
    }
    
    
    function changePage(page) {
        let totalPages = Math.ceil(getCategories().length / pageSize);
        if (page < 1 || page > totalPages) {
            return;
        };
        currentPage = page;
        renderTable();
    }
    
    function validateCategory(name, emoji, idToIgnore = null, errorId) {
        let categories = getCategories();
        let errorEl = document.getElementById(errorId);
        errorEl.textContent = "";
    
        if (!name.trim()) {
            errorEl.textContent = "Tên danh mục không được để trống.";
            return false;
        }
        if (name.length > 20) {
            errorEl.textContent = "Tên danh mục không được vượt quá 20 ký tự.";
            return false;
        }
        if ([...emoji].length !== 1) {
            errorEl.textContent = "Emoji phải là 1 ký tự.";
            return false;
        }
    
        let lowercaseName = name.toLowerCase();
        if (categories.some(cat => cat.categoryName.toLowerCase() === lowercaseName && cat.id !== idToIgnore)) {
            errorEl.textContent = "Tên danh mục đã tồn tại.";
            return false;
        }
    
        return true;
    }
    
    
    
    function openEditModal(id) {
        let categories = getCategories();
        let category = categories.find((cat) => cat.id === id);
        editingCategoryId = id;
        document.getElementById("edit-name").value = category.categoryName;
        document.getElementById("edit-emoji").value = category.categoryEmoji;
    
        // Focus vào ô emoji sau khi modal mở (chờ một chút để modal hiển thị xong)
        setTimeout(() => {
            document.getElementById("edit-emoji").focus();
        }, 300);
    }
    
    
    function confirmDelete(id) {
        let deleteBtn = document.querySelector("#delete-category .btn-danger");
        deleteBtn.setAttribute("onclick", `deleteCategory(${id})`);
    }
    
    function deleteCategory(id) {
        // Xoá danh mục trong category
        let categories = getCategories();
        categories = categories.filter((cat) => cat.id !== id);
        setCategories(categories);
    
        // Xoá tất cả bài test có categoryId = id trong testList
        let tests = JSON.parse(localStorage.getItem("testList")) || [];
        tests = tests.filter(test => test.categoryId !== id);
        localStorage.setItem("testList", JSON.stringify(tests));
    
        renderTable();
        bootstrap.Modal.getInstance(document.getElementById("delete-category")).hide();
    }
    
    
    function saveNewCategory() {
        let name = document.getElementById("add-name").value.trim();
        let emoji = document.getElementById("add-emoji").value.trim();
        if (!validateCategory(name, emoji, null, "add_error")) return;
    
        let categories = getCategories();
        let newCategory = {
            id: getNextCategoryId(),
            categoryName: name,
            categoryEmoji: emoji,
        };
        categories.push(newCategory);
        setCategories(categories);
        document.getElementById("add-name").value = "";
        document.getElementById("add-emoji").value = "";
        document.getElementById("add_error").textContent = "";
        bootstrap.Modal.getInstance(document.getElementById("add-category")).hide();
        renderTable();
    }

    function saveEditCategory() {
        let name = document.getElementById("edit-name").value.trim();
        let emoji = document.getElementById("edit-emoji").value.trim();
        if (!validateCategory(name, emoji, editingCategoryId, "edit_error")) return;
    
        let categories = getCategories();
        let index = categories.findIndex((cat) => cat.id === editingCategoryId);
        if (index !== -1) {
            categories[index].categoryName = name;
            categories[index].categoryEmoji = emoji;
            setCategories(categories);
            renderTable();
            document.getElementById("edit_error").textContent = "";
            bootstrap.Modal.getInstance(document.getElementById("edit-category")).hide();
        }
    }
    
  
document.addEventListener("DOMContentLoaded", () => {
    ensureInitData();
    renderTable();
});
  