/*******************
 * COMMON HELPERS
 *******************/
const SUBJECTS_ALL = [
  "Toán","Ngữ văn","Tiếng Anh","Lịch sử","Địa lý",
  "Vật lý","Hóa học","Sinh học","Tin học","GDCD"
];

const CLASSES_BY_LEVEL = {
  "Tiểu học": [1,2,3,4,5],
  "THCS": [6,7,8,9],
  "THPT": [10,11,12]
};

function getUser() {
  return {
    username: localStorage.getItem('username') || '',
    role: localStorage.getItem('role') || ''
  };
}
function saveUser(username, role){
  localStorage.setItem('username', username);
  localStorage.setItem('role', role);
}
function ensureStores(){
  if(!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify({}));
  if(!localStorage.getItem('exams')) localStorage.setItem('exams', JSON.stringify([])); // list of exams created by GV
  if(!localStorage.getItem('results')) localStorage.setItem('results', JSON.stringify([])); // HS results
}

/*******************
 * INDEX.HTML (AUTH)
 *******************/
(function bindAuthPage(){
  if(!document.getElementById('authHeader')) return; // not on index.html
  ensureStores();

  const btnShowLogin = document.getElementById('btnShowLogin');
  const btnShowRegister = document.getElementById('btnShowRegister');
  const loginCard  = document.getElementById('loginCard');
  const regCard    = document.getElementById('registerCard');

  const showLogin = ()=>{
    loginCard.classList.remove('hidden');
    regCard.classList.add('hidden');
    document.getElementById('authArea').scrollIntoView({behavior:'smooth'});
  };
  const showRegister = ()=>{
    regCard.classList.remove('hidden');
    loginCard.classList.add('hidden');
    document.getElementById('authArea').scrollIntoView({behavior:'smooth'});
  };

  btnShowLogin.onclick = showLogin;
  btnShowRegister.onclick = showRegister;
  document.getElementById('ctaStart').onclick = showLogin;
  document.getElementById('ctaRegister').onclick = showRegister;
  document.getElementById('linkToRegister').onclick = (e)=>{e.preventDefault();showRegister();};
  document.getElementById('linkToLogin').onclick = (e)=>{e.preventDefault();showLogin();};

  // Register (demo local)
  document.getElementById('btnRegister').onclick = ()=>{
    const u = document.getElementById('regUser').value.trim();
    const p = document.getElementById('regPass').value.trim();
    const r = document.getElementById('regRole').value;
    if(!u || !p){ alert('Vui lòng nhập đủ tên và mật khẩu'); return; }
    const users = JSON.parse(localStorage.getItem('users'));
    if(users[u]){ alert('Tên đăng nhập đã tồn tại'); return; }
    users[u] = { pass:p, role:r };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Tạo tài khoản thành công. Mời đăng nhập!');
    showLogin();
  };

  // Login (demo local)
  document.getElementById('btnLogin').onclick = ()=>{
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value.trim();
    const r = document.getElementById('loginRole').value;
    if(!u || !p){ alert('Nhập đủ thông tin'); return; }
    const users = JSON.parse(localStorage.getItem('users'));
    const ok = users[u] && users[u].pass === p && users[u].role === r;
    if(!ok){ alert('Sai thông tin hoặc vai trò'); return; }
    saveUser(u, r);
    window.location.href = 'app.html';
  };
})();

/*******************
 * APP.HTML
 *******************/
(function bindApp(){
  if(!document.getElementById('appHeader')) return; // not on app.html
  ensureStores();

  const {username, role} = getUser();
  if(!username || !role){ window.location.href = 'index.html'; return; }

  // Header
  document.getElementById('welcomeUser').textContent = `Xin chào, ${username} (${role==='student'?'HS':'GV'})`;
  document.getElementById('btnLogout').onclick = ()=>{
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
  };

  // Sidebar menu
  const menuPractice = document.getElementById('menuPractice');
  const menuResults  = document.getElementById('menuResults');
  const menuCreate   = document.getElementById('menuCreate');
  if(role==='teacher'){ menuCreate.classList.remove('hidden'); }

  menuPractice.onclick = ()=> switchPanel('practicePage');
  menuResults.onclick  = ()=> { switchPanel('resultsPage'); renderResults(); };
  menuCreate.onclick   = ()=> { switchPanel('createPage'); resetCreateForm(); };

  // Default open
  switchPanel('practicePage');

  // HS practice flow
  setupPracticeFlow();

  // GV create flow
  setupCreateFlow();

})();

/************
 * PANELS
 ************/
function switchPanel(id){
  document.querySelectorAll('.content .panel').forEach(p=>p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

/**************************************
 * PRACTICE: Level -> Class -> Subject
 **************************************/
function setupPracticeFlow(){
  // Bind level chips
  document.querySelectorAll('#levelRow .chip').forEach(ch=>{
    ch.onclick = ()=> chooseLevel(ch.dataset.level);
  });

  // Back from test
  const backBtn = document.getElementById('btnBackToExams');
  backBtn.onclick = ()=>{
    switchPanel('practicePage');
    document.getElementById('testPage').classList.add('hidden');
  };
}

let selectedLevel = '';
let selectedClassNum = null;
let selectedSubject = '';

function chooseLevel(level){
  selectedLevel = level;
  const classRow = document.getElementById('classRow');
  classRow.innerHTML = '';
  document.getElementById('subjectGridMain').classList.add('hidden');
  document.getElementById('examList').classList.add('hidden');
  document.getElementById('subjectTitle').classList.add('hidden');
  document.getElementById('examTitle').classList.add('hidden');

  const classes = CLASSES_BY_LEVEL[level] || [];
  classes.forEach(num=>{
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = `Lớp ${num}`;
    chip.onclick = ()=> chooseClass(num);
    classRow.appendChild(chip);
  });
  classRow.classList.remove('hidden');
}

function chooseClass(num){
  selectedClassNum = num;
  selectedSubject = '';
  const grid = document.getElementById('subjectGridMain');
  grid.innerHTML = '';

  // Filter subjects: Vật lý & Hóa học chỉ từ lớp 8+
  const subjects = SUBJECTS_ALL.filter(s=>{
    if((s==='Vật lý' || s==='Hóa học') && num < 8) return false;
    return true;
  });

  subjects.forEach(s=>{
    const div = document.createElement('div');
    div.className = 'subject-card';
    div.innerHTML = `<i class="fa-regular fa-circle-check"></i><div><b>${s}</b><div class="muted">Chọn để xem các bộ đề</div></div>`;
    div.onclick = ()=> chooseSubject(s);
    grid.appendChild(div);
  });

  document.getElementById('subjectTitle').classList.remove('hidden');
  grid.classList.remove('hidden');

  // reset exam list
  document.getElementById('examList').classList.add('hidden');
  document.getElementById('examTitle').classList.add('hidden');
}

function chooseSubject(sub){
  selectedSubject = sub;
  const examList = document.getElementById('examList');
  examList.innerHTML = '';

  const exams = loadExamsFor(selectedLevel, selectedClassNum, selectedSubject);
  const items = exams.length ? exams : defaultExams(selectedSubject);

  items.forEach(ex=>{
    const card = document.createElement('div');
    card.className = 'exam-card';
    card.innerHTML = `
      <h4>${ex.title}</h4>
      <div class="exam-meta">
        <span><i class="fa-regular fa-clock"></i> ${ex.duration || 15}'</span>
        <span><i class="fa-regular fa-circle-question"></i> ${ex.questions ? ex.questions.length : 10} câu</span>
      </div>
      <button class="solid" onclick='startExam(${JSON.stringify(ex)})'><i class="fa-solid fa-play"></i> Làm bài</button>
    `;
    examList.appendChild(card);
  });

  document.getElementById('examTitle').classList.remove('hidden');
  examList.classList.remove('hidden');
}

function defaultExams(subject){
  // tạo 3 đề mẫu (auto-generate 10 câu nếu chưa có)
  const q = genSampleQuestions(subject, 10);
  return [
    { title:`${subject} - Đề 01`, duration:15, questions:q },
    { title:`${subject} - Đề 02`, duration:15, questions:q },
    { title:`${subject} - Đề 03`, duration:15, questions:q }
  ];
}

function loadExamsFor(level, cls, subject){
  const exams = JSON.parse(localStorage.getItem('exams')||'[]');
  return exams.filter(e=> e.level===level && e.classNum===cls && e.subject===subject);
}

/****************************
 * TEST: render & submission
 ****************************/
let currentExam = null;

function startExam(exam){
  currentExam = exam.questions && exam.questions.length ? exam : { ...exam, questions: genSampleQuestions(selectedSubject, 10) };
  renderTest(currentExam);
  switchPanel('testPage');
}

function renderTest(exam){
  document.getElementById('testHeading').textContent =
    `Bài: ${exam.title} — ${selectedSubject} (Lớp ${selectedClassNum}, ${selectedLevel})`;
  const wrap = document.getElementById('questionWrap');
  wrap.innerHTML = '';
  exam.questions.forEach((q,idx)=>{
    const box = document.createElement('div');
    box.className = 'question';
    box.innerHTML = `
      <h4>Câu ${idx+1}. ${q.content}</h4>
      <div class="options">
        ${['A','B','C','D'].map(opt=>`
          <label class="option">
            <input type="radio" name="q${idx}" value="${opt}"> ${opt}. ${q.answers[opt] || ''}
          </label>
        `).join('')}
      </div>
    `;
    wrap.appendChild(box);
  });

  document.getElementById('btnSubmitTest').onclick = submitTest;
}

function submitTest(){
  if(!currentExam) return;
  let correct = 0, total = currentExam.questions.length;
  const detail = [];
  currentExam.questions.forEach((q,idx)=>{
    const checked = document.querySelector(`input[name="q${idx}"]:checked`);
    const ans = checked ? checked.value : null;
    const ok = ans === q.correct;
    if(ok) correct++;
    detail.push({ your: ans, correct: q.correct });
  });

  const score = Math.round((correct/total)*10*10)/10; // thang 10, 1 số lẻ
  alert(`Bạn đúng ${correct}/${total} câu. Điểm: ${score}`);

  // save result
  const {username} = getUser();
  const results = JSON.parse(localStorage.getItem('results')||'[]');
  results.push({
    user: username,
    at: new Date().toISOString(),
    level: selectedLevel,
    classNum: selectedClassNum,
    subject: selectedSubject,
    title: currentExam.title,
    score,
    correct,
    total
  });
  localStorage.setItem('results', JSON.stringify(results));

  // về danh sách đề
  switchPanel('practicePage');
}

/********************
 * HS: KẾT QUẢ
 ********************/
function renderResults(){
  const {username} = getUser();
  const results = (JSON.parse(localStorage.getItem('results')||'[]'))
    .filter(r=>r.user===username)
    .sort((a,b)=> new Date(b.at)-new Date(a.at));

  const wrap = document.getElementById('resultsTableWrap');
  if(!results.length){
    wrap.innerHTML = `<p class="muted">Chưa có kết quả nào.</p>`;
    return;
  }
  const rows = results.map(r=>`
    <tr>
      <td>${new Date(r.at).toLocaleString()}</td>
      <td>${r.level}</td>
      <td>${r.classNum}</td>
      <td>${r.subject}</td>
      <td>${r.title}</td>
      <td><b>${r.score}</b> (${r.correct}/${r.total})</td>
    </tr>
  `).join('');

  wrap.innerHTML = `
    <table class="results-table">
      <thead>
        <tr>
          <th>Thời gian</th><th>Trình độ</th><th>Lớp</th>
          <th>Môn</th><th>Đề</th><th>Kết quả</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  document.getElementById('btnClearResults').onclick = ()=>{
    if(confirm('Xóa toàn bộ lịch sử kết quả của bạn?')){
      const all = JSON.parse(localStorage.getItem('results')||'[]');
      const remain = all.filter(r=>r.user!==username);
      localStorage.setItem('results', JSON.stringify(remain));
      renderResults();
    }
  };
}

/********************
 * GV: TẠO ĐỀ
 ********************/
function setupCreateFlow(){
  const lv = document.getElementById('examLevelSelect');
  const cl = document.getElementById('examClassSelect');
  const addQ = document.getElementById('btnAddQ');
  const save = document.getElementById('btnSaveExam');

  lv.onchange = ()=>{
    cl.innerHTML = `<option value="">Chọn lớp *</option>`;
    const nums = CLASSES_BY_LEVEL[lv.value] || [];
    nums.forEach(n=>{
      const opt = document.createElement('option');
      opt.value = String(n);
      opt.textContent = `Lớp ${n}`;
      cl.appendChild(opt);
    });
  };

  addQ.onclick = addQuestionBox;
  save.onclick = saveExamFromForm;
}

function resetCreateForm(){
  document.getElementById('examTitleInput').value = '';
  document.getElementById('examSubjectSelect').value = '';
  document.getElementById('examLevelSelect').value = '';
  document.getElementById('examClassSelect').innerHTML = `<option value="">Chọn lớp *</option>`;
  document.getElementById('questionsContainer').innerHTML = '';
}

function addQuestionBox(){
  const wrap = document.getElementById('questionsContainer');
  const index = wrap.children.length + 1;
  const box = document.createElement('div');
  box.className = 'qbox';
  box.innerHTML = `
    <b>Câu ${index}</b>
    <input class="q-content" type="text" placeholder="Nội dung câu hỏi *">
    <div class="row">
      <input class="q-a" type="text" placeholder="Đáp án A *">
      <input class="q-b" type="text" placeholder="Đáp án B *">
    </div>
    <div class="row">
      <input class="q-c" type="text" placeholder="Đáp án C">
      <input class="q-d" type="text" placeholder="Đáp án D">
    </div>
    <label>Đáp án đúng:
      <select class="q-correct">
        <option value="A">A</option><option value="B">B</option>
        <option value="C">C</option><option value="D">D</option>
      </select>
    </label>
  `;
  wrap.appendChild(box);
}

function saveExamFromForm(){
  const title = document.getElementById('examTitleInput').value.trim();
  const subject = document.getElementById('examSubjectSelect').value;
  const level = document.getElementById('examLevelSelect').value;
  const classNum = Number(document.getElementById('examClassSelect').value);

  if(!title || !subject || !level || !classNum){
    alert('Vui lòng nhập đủ Tên đề, Môn, Trình độ, Lớp.');
    return;
  }
  // enforce rule: Vật lý / Hóa học từ lớp 8+
  if((subject==='Vật lý' || subject==='Hóa học') && classNum < 8){
    alert('⚠️ Vật lý/Hóa học chỉ có từ lớp 8 trở lên.');
    return;
  }

  const qs = [...document.querySelectorAll('#questionsContainer .qbox')].map(box=>({
    content: box.querySelector('.q-content').value.trim(),
    answers: {
      A: box.querySelector('.q-a').value.trim(),
      B: box.querySelector('.q-b').value.trim(),
      C: box.querySelector('.q-c').value.trim(),
      D: box.querySelector('.q-d').value.trim()
    },
    correct: box.querySelector('.q-correct').value
  })).filter(q=> q.content && q.answers.A && q.answers.B); // tối thiểu có nội dung + A,B

  if(qs.length === 0){
    alert('Thêm ít nhất 1 câu hỏi (cần nội dung + đáp án A/B).');
    return;
  }

  const exams = JSON.parse(localStorage.getItem('exams')||'[]');
  exams.push({ title, subject, level, classNum, duration: 15, questions: qs });
  localStorage.setItem('exams', JSON.stringify(exams));

  alert('✅ Đã lưu đề. Học sinh sẽ thấy trong mục Làm bài.');
  resetCreateForm();
}

/********************
 * Utils: sample Qs
 ********************/
function genSampleQuestions(subject, n=10){
  const out = [];
  for(let i=1;i<=n;i++){
    out.push({
      content: `Câu hỏi ${i} của môn ${subject}?`,
      answers: { A:'Phương án A', B:'Phương án B', C:'Phương án C', D:'Phương án D' },
      correct: ['A','B','C','D'][Math.floor(Math.random()*4)]
    });
  }
  return out;
}




fetch('get_questions.php')
  .then(res => res.json())
  .then(data => {
    data.forEach(q => {
      // Hiển thị câu hỏi lên giao diện
      console.log(q.noidung);
    });
  });



  const answers = {
  "1": "a",
  "2": "c",
  "3": "b"
};

fetch('submit_answers.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(answers)
})
  .then(res => res.json())
  .then(result => {
    alert(`Bạn được ${result.score} điểm`);
  });






document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");








  // Đăng ký
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);

      const res = await fetch("dangki.php", { method: "POST", body: formData });
      const data = await res.json();

      if (data.status === "success") {
        alert("Đăng ký thành công!");
        registerForm.reset();
      } else {
        alert("Đăng ký thất bại: " + data.message);
      }
    });
  }





  // Đăng nhập
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);

      const res = await fetch("dangnhap.php", { method: "POST", body: formData });
      const data = await res.json();

      if (data.status === "success") {
        alert("Đăng nhập thành công!");

        // Lưu thông tin người dùng
        localStorage.setItem("user", JSON.stringify(data.user));

        // Phân quyền chuyển trang
        if (data.user.quyen_id == 3) {
          window.location.href = "app.html"; // Học sinh
        } else {
          window.location.href = "dashboard.html"; // Giảng viên hoặc admin
        }
      } else {
        alert("Đăng nhập thất bại: " + data.message);
      }
    });
  }
});





document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Ngăn form gửi đi mặc định

  const formData = new FormData(this);

  fetch("dangnhap.php", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Chuyển hướng theo quyền
        switch (data.user.quyen_id) {
          case 2:
            window.location.href = "gv.html";
            break;
          case 3:
            window.location.href = "hs.html";
            break;
          default:
            alert("Tài khoản không hợp lệ!");
        }
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error("Lỗi đăng nhập:", error);
      alert("Đã xảy ra lỗi khi đăng nhập.");
    });
});
