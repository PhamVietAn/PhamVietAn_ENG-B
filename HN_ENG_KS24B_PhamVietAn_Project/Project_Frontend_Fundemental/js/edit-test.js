let editingQuestionIndex = null;

// Lấy bài test theo ID
function getTestById(id) {
    const tests = JSON.parse(localStorage.getItem("testList")) || [];
    return tests.find(test => test.id === id);
}

// Hiển thị dữ liệu bài test lên form khi load trang
function populateTestData() {
    const urlParams = new URLSearchParams(window.location.search);
    const testId = parseInt(urlParams.get("id"));
    const test = getTestById(testId);
    if (!test) return;

    document.getElementById("test-name").value = test.testName;
    document.getElementById("num-test").value = test.playTime;

    const select = document.getElementById("select-category");
    const categories = JSON.parse(localStorage.getItem("category")) || [];
    categories.forEach(cat => {
        let option = document.createElement("option");
        option.value = cat.id;
        option.textContent = `${cat.categoryEmoji} ${cat.categoryName}`;
        if (cat.id === test.categoryId) option.selected = true;
        select.appendChild(option);
    });

    renderQuestionTable(test.questions);
}

// Hiển thị danh sách câu hỏi trong bảng
function renderQuestionTable(questions) {
    const tbody = document.getElementById("test-data");
    tbody.innerHTML = "";

    questions.forEach((q, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td class="text-start">${q.content}</td>
            <td>
                <button class="btn btn-warning btn-edit-question" data-index="${index}" data-bs-toggle="modal" data-bs-target="#add-test">Sửa</button>
                <button class="btn btn-danger btn-delete-question" data-index="${index}">Xoá</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll(".btn-edit-question").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.getAttribute("data-index"));
            openEditQuestionModal(index);
        });
    });

    document.querySelectorAll(".btn-delete-question").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.getAttribute("data-index"));
            deleteQuestion(index);
        });
    });
}

// Mở modal sửa câu hỏi
function openEditQuestionModal(index) {
    const urlParams = new URLSearchParams(window.location.search);
    const testId = parseInt(urlParams.get("id"));
    const test = getTestById(testId);
    const question = test.questions[index];
    editingQuestionIndex = index;

    document.getElementById("input-name-answer").value = question.content;

    const modalBody = document.querySelector("#add-test .modal-body");
    modalBody.querySelectorAll(".input-group").forEach(el => el.remove());

    question.answers.forEach(ans => {
        addAnswerRow(ans.answer, ans.isCorrected || false);
    });

    document.getElementById("question-error").style.display = "none";
}

// Thêm dòng đáp án
document.getElementById("btn-add-answer").addEventListener("click", () => {
    addAnswerRow();
});

function addAnswerRow(text = "", correct = false) {
    const group = document.createElement("div");
    group.className = "input-group mb-3";
    group.innerHTML = `
        <div class="input-group-text">
            <input class="form-check-input mt-0" type="checkbox" ${correct ? "checked" : ""}>
        </div>
        <input type="text" class="form-control" value="${text}" placeholder="Nhập câu trả lời">
        <button class="btnTrash"><img src="../assets/icons/Trash_Full.svg" alt=""></button>
    `;
    group.querySelector(".btnTrash").addEventListener("click", () => group.remove());

    document.getElementById("answer-list").appendChild(group);
}


// Xoá câu hỏi
function deleteQuestion(index) {
    if (!confirm("Bạn có chắc chắn muốn xoá câu hỏi này không?")) return;

    const urlParams = new URLSearchParams(window.location.search);
    const testId = parseInt(urlParams.get("id"));
    const tests = JSON.parse(localStorage.getItem("testList")) || [];
    const testIndex = tests.findIndex(t => t.id === testId);

    if (testIndex !== -1) {
        tests[testIndex].questions.splice(index, 1);
        localStorage.setItem("testList", JSON.stringify(tests));
        renderQuestionTable(tests[testIndex].questions);
    }
}

// Thêm đáp án
document.getElementById("btn-add-answer").addEventListener("click", () => {
    addAnswerRow();
});

// Lưu câu hỏi (thêm hoặc sửa)
document.getElementById("confirm-save").addEventListener("click", () => {
    const questionText = document.getElementById("input-name-answer").value.trim();
    const groups = document.querySelectorAll(".modal-body .input-group");
    let answers = [];
    let isValid = true;
    let hasCorrect = false;

    groups.forEach(g => {
        const text = g.querySelector("input[type='text']").value.trim();
        const checked = g.querySelector("input[type='checkbox']").checked;
        if (text.length < 1 || text.length > 200) isValid = false;
        if (checked) hasCorrect = true;
        answers.push({ answer: text, isCorrected: checked });
    });

    const errorBox = document.getElementById("question-error");
    if (!questionText || questionText.length > 500 || answers.length < 2 || !hasCorrect || !isValid) {
        errorBox.textContent = "Vui lòng nhập đúng định dạng câu hỏi và câu trả lời (>=2, có đáp án đúng).";
        errorBox.style.display = "block";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const testId = parseInt(urlParams.get("id"));
    const tests = JSON.parse(localStorage.getItem("testList")) || [];
    const index = tests.findIndex(t => t.id === testId);
    if (index === -1) return;

    if (editingQuestionIndex !== null) {
        tests[index].questions[editingQuestionIndex] = { content: questionText, answers };
        editingQuestionIndex = null;
    } else {
        tests[index].questions.push({ content: questionText, answers });
    }

    localStorage.setItem("testList", JSON.stringify(tests));
    renderQuestionTable(tests[index].questions);

    // Reset modal
    document.getElementById("input-name-answer").value = "";
    document.querySelectorAll(".modal-body .input-group").forEach(el => el.remove());
    errorBox.style.display = "none";
    bootstrap.Modal.getInstance(document.getElementById("add-test")).hide();
});

// Lưu thông tin bài test
document.querySelector(".btnSave").addEventListener("click", () => {
    const testName = document.getElementById("test-name").value.trim();
    const playTime = parseInt(document.getElementById("num-test").value);
    const categoryId = parseInt(document.getElementById("select-category").value);
    const errorBox = document.getElementById("test-error");

    const urlParams = new URLSearchParams(window.location.search);
    const testId = parseInt(urlParams.get("id"));

    const tests = JSON.parse(localStorage.getItem("testList")) || [];
    const index = tests.findIndex(t => t.id === testId);
    if (index === -1) return;

    const nameExist = tests.some((t, i) => i !== index && t.testName.toLowerCase() === testName.toLowerCase());

    if (!testName || testName.length < 5 || testName.length > 100 || nameExist) {
        errorBox.textContent = "Tên bài test không hợp lệ hoặc đã tồn tại.";
        errorBox.style.display = "block";
        return;
    }

    if (!categoryId || !Number.isInteger(playTime) || playTime <= 0 || playTime > 120) {
        errorBox.textContent = "Vui lòng chọn danh mục và nhập thời gian hợp lệ (<= 120 phút).";
        errorBox.style.display = "block";
        return;
    }

    tests[index].testName = testName;
    tests[index].playTime = playTime;
    tests[index].categoryId = categoryId;

    localStorage.setItem("testList", JSON.stringify(tests));
    alert("Cập nhật bài test thành công!");
    errorBox.style.display = "none";
});

// Khi trang đã load
document.addEventListener("DOMContentLoaded", () => {
    populateTestData();
});
