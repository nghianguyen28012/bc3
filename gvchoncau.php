<?php
header('Content-Type: application/json');

$conn = new mysqli('localhost','root','','tracnghiem2');
if($conn->connect_error){
    echo json_encode([]);
    exit;
}

// Lấy tất cả câu hỏi từ bảng `cauhoi`
$sql = "SELECT id, noi_dung, dapan_a, dapan_b, dapan_c, dapan_d, dapan_dung FROM cauhoi";
$result = $conn->query($sql);
$data = [];

if($result && $result->num_rows>0){
    while($row = $result->fetch_assoc()){
        $data[] = $row;
    }
}

echo json_encode($data);
$conn->close();
?>
