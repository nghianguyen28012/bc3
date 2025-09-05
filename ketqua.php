<?php
header('Content-Type: application/json');

// Kết nối MySQL
$conn = new mysqli('localhost', 'root', '', 'tracnghiem2');
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi kết nối CSDL']);
    exit;
}

// Nhận dữ liệu từ client (JSON hoặc form-data)
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    $data = $_POST; // fallback cho form-data
}

$de_id   = isset($data['de_id']) ? intval($data['de_id']) : 0;
$answers = isset($data['answers']) ? $data['answers'] : [];

if (is_string($answers)) {
    $answers = json_decode($answers, true);
}

// Kiểm tra dữ liệu đầu vào
if ($de_id <= 0 || empty($answers)) {
    echo json_encode(['status' => 'error', 'message' => 'Thiếu thông tin (de_id hoặc answers)']);
    exit;
}

// Lấy danh sách câu hỏi trong đề từ DB
$sql = "SELECT id, noi_dung, dapan_a, dapan_b, dapan_c, dapan_d, dapan_dung 
        FROM cauhoi WHERE de_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $de_id);
$stmt->execute();
$result = $stmt->get_result();

$questions = [];
$so_cau_dung = 0;

while ($row = $result->fetch_assoc()) {
    $tra_loi_user = null;

    // Tìm câu trả lời user gửi lên
    foreach ($answers as $ans) {
        if ($ans['cauhoi_id'] == $row['id']) {
            $tra_loi_user = $ans['tra_loi'];
            if ($tra_loi_user === $row['dapan_dung']) {
                $so_cau_dung++;
            }
            break;
        }
    }

    $questions[] = [
        'id' => $row['id'],
        'noi_dung' => $row['noi_dung'],
        'dapan_a' => $row['dapan_a'],
        'dapan_b' => $row['dapan_b'],
        'dapan_c' => $row['dapan_c'],
        'dapan_d' => $row['dapan_d'],
        'dapan_dung' => $row['dapan_dung'],
        'tra_loi' => $tra_loi_user
    ];
}

// Tính điểm (thang 10)
$tong_cau = count($questions);
$diem = $tong_cau > 0 ? round(($so_cau_dung / $tong_cau) * 10, 2) : 0;

echo json_encode([
    'status' => 'success',
    'de_id' => $de_id,
    'tong_cau' => $tong_cau,
    'so_cau_dung' => $so_cau_dung,
    'diem' => $diem,
    'questions' => $questions
]);

$stmt->close();
$conn->close();
?>
