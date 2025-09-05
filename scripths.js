const user = JSON.parse(localStorage.getItem("user")) || { ho_ten: "Học sinh" };
document.getElementById("studentName").textContent = user.ho_ten;

const subjects = [
  { name: "Toán", icon: "📐" },
  { name: "Ngữ văn", icon: "📖" },
  { name: "Tiếng Anh", icon: "🗣️" },
  { name: "Lịch sử", icon: "🏺" },
  { name: "Địa lý", icon: "🌍" },
  { name: "Sinh học", icon: "🧬" },
  { name: "GDCD", icon: "⚖️" },
  { name: "Tin học", icon: "💻" },
  { name: "Vật lý", icon: "⚡️" },
  { name: "Hóa học", icon: "🧪" }
  
];

function showSubjects() {
  document.getElementById("subjectList").classList.remove("hidden");
  document.getElementById("classList").classList.add("hidden");
  document.getElementById("examList").classList.add("hidden");

  const container = document.getElementById("subjects");
  container.innerHTML = "";

  subjects.forEach(subject => {
    const btn = document.createElement("button");
    btn.innerHTML = `${subject.icon} ${subject.name}`;
    btn.onclick = () => showClasses(subject.name);
    container.appendChild(btn);
  });
}

function showClasses(subject) {
  document.getElementById("classList").classList.remove("hidden");
  document.getElementById("examList").classList.add("hidden");

  const container = document.getElementById("classes");
  container.innerHTML = "";

  const startClass = (subject === "Hóa học" || subject === "Vật lý") ? 8 : 1;

  for (let i = startClass; i <= 12; i++) {
    const btn = document.createElement("button");
    btn.textContent = `Lớp ${i}`;
    btn.onclick = () => showExams(subject, i);
    container.appendChild(btn);
  }
}

function showExams(subject, grade) {
  document.getElementById("examList").classList.remove("hidden");

  const container = document.getElementById("exams");
  container.innerHTML = "";

  for (let i = 1; i <= 3; i++) {
    const card = document.createElement("button");
    card.textContent = `${subject} - Lớp ${grade} - Bài ${i}`;
    container.appendChild(card);
  }
}

function viewResults() {
  alert("Chức năng xem kết quả đang được phát triển!");
}
