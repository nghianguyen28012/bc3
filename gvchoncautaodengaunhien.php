<?php
header('Content-Type: application/json');

// Kết nối MySQL
$conn = new mysqli('localhost', 'root', '', 'tracnghiem2');
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi kết nối CSDL']);
    exit;
}

// Lấy dữ liệu từ request
$mon     = isset($_POST['mon']) ? $_POST['mon'] : '';
$lop     = isset($_POST['lop']) ? intval($_POST['lop']) : 0;
$so_cau  = isset($_POST['so_cau']) ? intval($_POST['so_cau']) : 20; // mặc định 20 câu
$ten_de  = isset($_POST['ten_de']) ? trim($_POST['ten_de']) : 'Đề ngẫu nhiên';
$nguoidung_id = isset($_POST['nguoidung_id']) ? $_POST['nguoidung_id'] : 1; //tạm gán user_id = 1, bạn có thể lấy từ session

// Kiểm tra dữ liệu đầu vào
if (empty($mon) || $lop <= 0 || $so_cau <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Thiếu thông tin (môn, lớp, số câu)']);
    exit;
}

// Lấy danh sách câu hỏi ngẫu nhiên (không trùng nội dung)
$sql = "
    SELECT c.*
    FROM cauhoi c
    INNER JOIN de d ON c.de_id = d.id
    WHERE d.monhoc_id = ? AND d.lop_id = ?
    GROUP BY c.noi_dung
    ORDER BY RAND()
    LIMIT ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sii", $mon, $lop, $so_cau);
$stmt->execute();
$result = $stmt->get_result();

$questions = [];
while ($row = $result->fetch_assoc()) {
    $questions[] = $row;
}

// Nếu không có câu hỏi thì báo lỗi
if (count($questions) === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Không tìm thấy câu hỏi phù hợp']);
    exit;
}

// Bắt đầu transaction để đảm bảo lưu đồng bộ
$conn->begin_transaction();

try {
    // 1. Lưu thông tin đề thi vào bảng de
    $sql = "INSERT INTO de (ten_de, lop_id, monhoc_id, nguoidung_id, ngay_tao) VALUES (?, ?, ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("siii", $ten_de, $lop, $mon, $nguoidung_id);
    $stmt->execute();
    $de_id = $stmt->insert_id;

    // 2. Lưu danh sách câu hỏi vào cauhoi
    $sql = "INSERT INTO cauhoi (de_id, noi_dung, dapan_a, dapan_b, dapan_c, dapan_d, dapan_dung) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    foreach ($questions as $q) {
        $stmt->bind_param(
            "issssss",
            $de_id,
            $q['noi_dung'],
            $q['dapan_a'],
            $q['dapan_b'],
            $q['dapan_c'],
            $q['dapan_d'],
            $q['dapan_dung']
        );
        $stmt->execute();
    }


    // Commit transaction
    $conn->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Tạo đề ngẫu nhiên và lưu thành công!',
        'de_id' => $de_id,
        'ten_de' => $ten_de,
        'so_cau' => count($questions),
        'questions' => $questions
    ]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => 'Lỗi khi lưu dữ liệu: ' . $e->getMessage()]);
}

$conn->close();
?>
