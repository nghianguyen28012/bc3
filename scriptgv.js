const user = JSON.parse(localStorage.getItem("user")) || { ho_ten: "Thầy/Cô" };
document.getElementById("teacherName").textContent = user.ho_ten;

const subjects = [
  { name: "Toán", icon: "📐" },
  { name: "Ngữ văn", icon: "📖" },
  { name: "Tiếng Anh", icon: "🗣️" },
  { name: "Lịch sử", icon: "🏺" },
  { name: "Địa lý", icon: "🌍" },
  { name: "Sinh học", icon: "🧬" },
  { name: "Vật lý", icon: "⚡️" },
  { name: "Hóa học", icon: "🧪" },
  { name: "GDCD", icon: "⚖️" },
  { name: "Tin học", icon: "💻" }
];

function hideAllSections() {
  ["createOptions", "subjectList", "classList", "examList"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
}

function showRandomForm() {
  var dataFetch = {
    mon: 1,
    lop: 1
  };

  // Chuyển object sang dạng x-www-form-urlencoded
  let formEncoded = new URLSearchParams();
  for (let key in dataFetch) {
    formEncoded.append(key, dataFetch[key]);
  }

  fetch("gvchoncautaodengaunhien.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded" // báo cho server biết là form-encode
    },
    body: formEncoded.toString() // gửi dữ liệu encode
  })
    .then(res => res.json())
    .then(data => {
      console.log("Dữ liệu trả về:", data);
      if (!data || !data.status) {
        alert("Không tạo được đề ngẫu nhiên");
        return;
      } else {
        alert("Tạo được đề ngẫu nhiên");
        return;
      }
      // localStorage.setItem("deThi", JSON.stringify(data));
      // window.location.href = "lb.html";
    })
    .catch(err => console.error("Lỗi fetch:", err));
}


function showCreateOptions() {
  hideAllSections();
  document.getElementById("createOptions").classList.remove("hidden");
}

function showSubjects() {
  hideAllSections();
  document.getElementById("subjectList").classList.remove("hidden");

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
  for (let i = 1; i <= 12; i++) {
    const btn = document.createElement("button");
    btn.textContent = `Lớp ${i}`;
    btn.onclick = () => showExams(subject, i);
    container.appendChild(btn);
  }
}

function showExams(subject, classNum) {
  hideAllSections();
  document.getElementById("examList").classList.remove("hidden");

  const examList = document.getElementById("exams");
  examList.innerHTML = "";
  [1, 2, 3].forEach(soDe => {
    const btn = document.createElement("button");
    btn.textContent = `Đề số ${soDe}`;
    btn.onclick = () => {
      fetch(`layde.php?subject=${subject}&class=${classNum}&sode=${soDe}`)
        .then(res => res.json())
        .then(data => {
          if (!data || !data.cauHoi || data.cauHoi.length === 0) {
            alert("Đề thi không khả dụng.");
            return;
          }
          localStorage.setItem("deThi", JSON.stringify(data));
          window.location.href = "lb.html";
        });
    };
    examList.appendChild(btn);
  });
}

// ================== Modal logic cho tự chọn ==================
let currentPage = 1;
let totalPages = 1;
let selectedQuestions = [];

function createRandomExam() {
  fetch('gvchoncautaodengaunhien.php')
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        alert("Đề ngẫu nhiên đã được tạo!");
      }
    });
}

function createCustomExam() {
  document.getElementById('questionModal').classList.remove('hidden');
  loadFilters();
  loadQuestions();
}

function closeModal() {
  document.getElementById('questionModal').classList.add('hidden');
}

function loadFilters() {
  const subSelect = document.getElementById("filterSubject");
  subSelect.innerHTML = `<option value="">Tất cả môn</option>`;
  subjects.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = s.name;
    subSelect.appendChild(opt);
  });
  const clsSelect = document.getElementById("filterClass");
  clsSelect.innerHTML = `<option value="">Tất cả lớp</option>`;
  for (let i = 1; i <= 12; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `Lớp ${i}`;
    clsSelect.appendChild(opt);
  }
}

function loadQuestions() {
  const subject = document.getElementById("filterSubject").value;
  const lop = document.getElementById("filterClass").value;
  fetch(`gvchoncautaode.php?page=${currentPage}&subject=${subject}&lop=${lop}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("questionList");
      tbody.innerHTML = "";
      totalPages = data.totalPages;
      document.getElementById("pageInfo").textContent = `${currentPage}/${totalPages}`;
      data.questions.forEach(q => {
        const tr = document.createElement("tr");
        const checked = selectedQuestions.includes(q.id) ? "checked" : "";
        tr.innerHTML = `
          <td><input type="checkbox" value="${q.id}" ${checked} onchange="toggleSelect(${q.id})"></td>
          <td>${q.noi_dung}</td>
          <td>${q.dapan_a}</td>
          <td>${q.dapan_b}</td>
          <td>${q.dapan_c}</td>
          <td>${q.dapan_d}</td>
        `;
        tbody.appendChild(tr);
      });
      updateSelectedCount();
    });
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    loadQuestions();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    loadQuestions();
  }
}

function toggleSelect(id) {
  if (selectedQuestions.includes(id)) {
    selectedQuestions = selectedQuestions.filter(q => q !== id);
  } else {
    selectedQuestions.push(id);
  }
  updateSelectedCount();
}

function updateSelectedCount() {
  document.getElementById("selectedCount").textContent = `Đã chọn: ${selectedQuestions.length} câu`;
}

function selectAll() {
  document.querySelectorAll("#questionList input[type=checkbox]").forEach(cb => {
    if (!cb.checked) {
      cb.checked = true;
      selectedQuestions.push(parseInt(cb.value));
    }
  });
  selectedQuestions = [...new Set(selectedQuestions)];
  updateSelectedCount();
}

function deselectAll() {
  document.querySelectorAll("#questionList input[type=checkbox]").forEach(cb => {
    cb.checked = false;
  });
  selectedQuestions = selectedQuestions.filter(id => !document.querySelector(`#questionList input[value="${id}"]`));
  updateSelectedCount();
}

function saveCustomExam() {
  const ten_de = document.getElementById("examName").value;
  if (!ten_de || selectedQuestions.length === 0) {
    alert("Nhập tên đề và chọn ít nhất một câu!");
    return;
  }
  fetch('save_custom_exam.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ten_de, cauhoi_ids: selectedQuestions })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      if (data.status === 'success') closeModal();
    });
}
