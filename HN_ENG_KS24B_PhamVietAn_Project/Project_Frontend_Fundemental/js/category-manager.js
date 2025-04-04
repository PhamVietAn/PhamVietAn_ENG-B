const category = [
    {
        id: 1,
        categoryName: "Đời sống",
        categoryEmoji: "🏠"
    },
    {
        id: 2,
        categoryName: "Khoa học",
        categoryEmoji: "🧠"
    }
]

document.addEventListener("DOMContentLoaded", () => {
    saveUser(category)
})

function saveUser(users) {
    localStorage.setItem("category", JSON.stringify(category))
}

