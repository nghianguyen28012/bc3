<?php
header('Content-Type: application/json');

// Kết nối MySQL
$conn = new mysqli('localhost', 'root', '', 'tracnghiem2');
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi kết nối CSDL']);
    exit;
}

// Lấy dữ liệu từ request (JSON hoặc form-data)
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    $data = $_POST; // fallback cho form-data
}

$mon     = isset($data['mon']) ? $data['mon'] : '';
$lop     = isset($data['lop']) ? intval($data['lop']) : 0;
$ten_de  = isset($data['ten_de']) ? trim($data['ten_de']) : 'Đề thủ công';
$nguoidung_id = isset($data['nguoidung_id']) ? intval($data['nguoidung_id']) : 1;
// $questions = isset($data['questions']) ? $data['questions'] : [];
$questions = isset($data['questions']) ? $data['questions'] : [];
if (is_string($questions)) {
    $questions = json_decode($questions, true); // ép về mảng
}


// Kiểm tra dữ liệu đầu vào
if (empty($mon) || $lop <= 0 || empty($questions)) {
    echo json_encode(['status' => 'error', 'message' => 'Thiếu thông tin (môn, lớp, câu hỏi)']);
    exit;
}

// Bắt đầu transaction
$conn->begin_transaction();

try {
    // 1. Lưu đề vào bảng de
    $sql = "INSERT INTO de (ten_de, lop_id, monhoc_id, nguoidung_id, ngay_tao) VALUES (?, ?, ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("siii", $ten_de, $lop, $mon, $nguoidung_id);
    $stmt->execute();
    $de_id = $stmt->insert_id;

    // 2. Lưu danh sách câu hỏi vào bảng cauhoi
    $sql = "INSERT INTO cauhoi (de_id, noi_dung, dapan_a, dapan_b, dapan_c, dapan_d, dapan_dung) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    foreach ($questions as $q) {
        $noi_dung   = $q['noi_dung'] ?? '';
        $dapan_a    = $q['dapan_a'] ?? '';
        $dapan_b    = $q['dapan_b'] ?? '';
        $dapan_c    = $q['dapan_c'] ?? '';
        $dapan_d    = $q['dapan_d'] ?? '';
        $dapan_dung = $q['dapan_dung'] ?? '';

        $stmt->bind_param("issssss", $de_id, $noi_dung, $dapan_a, $dapan_b, $dapan_c, $dapan_d, $dapan_dung);
        $stmt->execute();
    }

    // Commit transaction
    $conn->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Tạo đề thủ công thành công!',
        'de_id' => $de_id,
        'ten_de' => $ten_de,
        'so_cau' => count($questions)
    ]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => 'Lỗi khi lưu: ' . $e->getMessage()]);
}

$conn->close();
?>
