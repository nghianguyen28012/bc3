<?php
header('Content-Type: application/json');

// Kết nối MySQL
$conn = new mysqli('localhost', 'root', '', 'tracnghiem2');
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi kết nối CSDL']);
    exit;
}

// Lấy dữ liệu từ request
$mon = isset($_POST['mon']) ? intval($_POST['mon']) : 0;
$lop = isset($_POST['lop']) ? intval($_POST['lop']) : 0;

// Kiểm tra dữ liệu đầu vào
if (empty($mon) || $lop <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Thiếu thông tin (môn, lớp)']);
    exit;
}

// Truy vấn tất cả câu hỏi theo môn học & lớp học
$sql = "
    SELECT c.id, c.de_id, c.noi_dung, c.dapan_a, c.dapan_b, c.dapan_c, c.dapan_d, c.dapan_dung
    FROM cauhoi c
    INNER JOIN de d ON c.de_id = d.id
    WHERE d.monhoc_id = ? AND d.lop_id = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $mon, $lop);
$stmt->execute();
$result = $stmt->get_result();

$questions = [];
while ($row = $result->fetch_assoc()) {
    $questions[] = $row;
}

// Trả về JSON
if (count($questions) > 0) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Lấy danh sách câu hỏi thành công',
        'so_cau' => count($questions),
        'questions' => $questions
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Không tìm thấy câu hỏi nào'
    ]);
}

$conn->close();
?>
