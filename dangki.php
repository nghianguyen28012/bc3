<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "tracnghiem2");
if ($conn->connect_error) {
    die(json_encode(["status" => "fail", "message" => "Lỗi kết nối CSDL"]));
}

// Lấy dữ liệu từ form
$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');
$ho_ten   = trim($_POST['ho_ten'] ?? '');
$email    = trim($_POST['email'] ?? '');
$quyen_id = intval($_POST['quyen_id'] ?? 0);

// Kiểm tra dữ liệu rỗng
if ($username === '' || $password === '' || $ho_ten === '' || $email === '' || $quyen_id === 0) {
    echo json_encode(["status" => "fail", "message" => "Thiếu dữ liệu"]);
    exit;
}

// Kiểm tra trùng username
$stmt = $conn->prepare("SELECT id FROM nguoidung WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(["status" => "fail", "message" => "Tên đăng nhập đã tồn tại"]);
    exit;
}
$stmt->close();

// Mã hóa mật khẩu
$hashed = password_hash($password, PASSWORD_BCRYPT);

// Thêm người dùng mới
$stmt = $conn->prepare("INSERT INTO nguoidung (username, password, ho_ten, email, quyen_id, ngay_tao) VALUES (?, ?, ?, ?, ?, NOW())");
$stmt->bind_param("ssssi", $username, $hashed, $ho_ten, $email, $quyen_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Đăng ký thành công"]);
} else {
    echo json_encode(["status" => "fail", "message" => $stmt->error]);
}
$stmt->close();
$conn->close();
?>
