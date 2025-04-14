let testList = JSON.parse(localStorage.getItem("testList")) || [];
let categoryList = JSON.parse(localStorage.getItem("category")) || [];
let questionList = [];
let editingIndex = -1; // -1 là thêm mới, >=0 là sửa

// Load danh mục
function loadCategories() {
    const select = document.getElementById("select-category");
    categoryList.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = `${cat.categoryEmoji} ${cat.categoryName}`;
        select.appendChild(option);
    });
}
loadCategories();

// Tạo input câu trả lời
function createAnswerInput() {
    const div = document.createElement("div");
    div.className = "input-group mb-3";
    div.innerHTML = `
        <div class="input-group-text">
            <input class="form-check-input mt-0" type="checkbox">
        </div>
        <input type="text" class="form-control" placeholder="Nhập câu trả lời">
        <button class="btnTrash"><img src="../assets/icons/Trash_Full.svg" alt=""></button>
    `;
    div.querySelector(".btnTrash").onclick = () => div.remove();
    return div;
}

// Thêm câu trả lời mới
document.getElementById("btn-add-answer").onclick = () => {
    const inputGroup = createAnswerInput();
    const modalBody = document.querySelector(".modal-body");
    modalBody.insertBefore(inputGroup, document.getElementById("btn-add-answer"));
};

// Xử lý lưu câu hỏi (thêm hoặc sửa)
document.getElementById("confirm-save").onclick = () => {
    const questionContent = document.getElementById("input-name-answer").value.trim();
    const inputs = document.querySelectorAll(".modal-body .form-control");
    const checkboxes = document.querySelectorAll(".modal-body input[type=checkbox]");
    let answers = [];
    let isValid = true;
    let hasCorrect = false;

    answers = Array.from(inputs).slice(1).map((input, i) => {
        const answerText = input.value.trim();
        if (answerText.length < 1 || answerText.length > 200) isValid = false;
        if (checkboxes[i].checked) hasCorrect = true;
        return {
            answer: answerText,
            isCorrected: checkboxes[i].checked
        };
    });

    if (!questionContent || questionContent.length > 500 || answers.length < 2 || !hasCorrect || !isValid) {
        document.getElementById("question-error").style.display = "block";
        document.getElementById("question-error").textContent = "Vui lòng nhập đúng định dạng câu hỏi và câu trả lời (>=2, có đáp án đúng).";
        return;
    }

    const newQuestion = {
        content: questionContent,
        answers
    };

    if (editingIndex >= 0) {
        questionList[editingIndex] = newQuestion;
        editingIndex = -1;
    } else {
        questionList.push(newQuestion);
    }

    renderQuestions();
    document.getElementById("question-error").style.display = "none";
    document.getElementById("input-name-answer").value = "";
    document.querySelectorAll(".modal-body .input-group.mb-3").forEach(el => el.remove());
    document.querySelector('[data-bs-dismiss="modal"]').click();
    document.querySelector("#exampleModalLabel").textContent = "Thêm câu hỏi";
};

// Hiển thị danh sách câu hỏi
function renderQuestions() {
    const tbody = document.getElementById("test-data");
    tbody.innerHTML = "";
    questionList.forEach((q, i) => {
        tbody.innerHTML += `
            <tr>
                <td>${i}</td>
                <td class="text-start">${q.content}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-2" onclick="editQuestion(${i})">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteQuestion(${i})">Xoá</button>
                </td>
            </tr>
        `;
    });
}

// Xoá câu hỏi
function deleteQuestion(index) {
    if (confirm("Bạn có chắc chắn muốn xoá câu hỏi này không?")) {
        questionList.splice(index, 1);
        renderQuestions();
    }
}

// Sửa câu hỏi
function editQuestion(index) {
    editingIndex = index;
    const question = questionList[index];

    document.getElementById("input-name-answer").value = question.content;

    // Xoá input cũ
    document.querySelectorAll(".modal-body .input-group.mb-3").forEach(el => el.remove());

    // Tạo lại input mới
    const modalBody = document.querySelector(".modal-body");
    question.answers.forEach(ans => {
        const div = createAnswerInput();
        div.querySelector(".form-control").value = ans.answer;
        div.querySelector("input[type=checkbox]").checked = ans.isCorrected;
        modalBody.insertBefore(div, document.getElementById("btn-add-answer"));
    });

    // Đổi tiêu đề modal
    document.querySelector("#exampleModalLabel").textContent = "Sửa câu hỏi";

    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById("add-test"));
    modal.show();
}

// Lưu bài test
document.querySelector(".btnSave").onclick = () => {
    const testName = document.getElementById("test-name").value.trim();
    const categoryId = +document.getElementById("select-category").value;
    const playTime = +document.getElementById("num-test").value;
    const errorBox = document.getElementById("test-error");

    const nameExist = testList.some(test => test.testName.toLowerCase() === testName.toLowerCase());

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

    if (questionList.length < 1) {
        errorBox.textContent = "Bài test cần ít nhất 1 câu hỏi.";
        errorBox.style.display = "block";
        return;
    }

    const newId = testList.length > 0 ? Math.max(...testList.map(t => t.id)) + 1 : 1;

    const newTest = {
        id: newId,
        testName,
        categoryId,
        playTime,
        playAmount: 0,
        image: "../assets/images/1691652401-free-flying-money-illustration-wg8di.jpg",
        questions: questionList
    };

    testList.push(newTest);
    localStorage.setItem("testList", JSON.stringify(testList));
    alert("Thêm bài test thành công!");
    location.reload();
};
