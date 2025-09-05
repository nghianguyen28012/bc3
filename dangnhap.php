<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "tracnghiem2");
if ($conn->connect_error) {
    die(json_encode(["status" => "fail", "message" => "Không thể kết nối CSDL"]));
}

$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');
$quyen_id = intval($_POST['quyen_id'] ?? 0);

if ($username === '' || $password === '' || $quyen_id === 0) {
    echo json_encode(["status" => "fail", "message" => "Thiếu dữ liệu"]);
    exit;
}

$stmt = $conn->prepare("SELECT id, password, ho_ten, email, quyen_id FROM nguoidung WHERE username = ? AND quyen_id = ?");
$stmt->bind_param("si", $username, $quyen_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($password, $row['password'])) {
        echo json_encode([
            "status" => "success",
            "message" => "Đăng nhập thành công",
            "user" => [
                "id" => $row['id'],
                "ho_ten" => $row['ho_ten'],
                "email" => $row['email'],
                "quyen_id" => $row['quyen_id']
            ]
        ]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Sai mật khẩu"]);
    }
} else {
    echo json_encode(["status" => "fail", "message" => "Không tìm thấy tài khoản"]);
}

$stmt->close();
$conn->close();
?>
