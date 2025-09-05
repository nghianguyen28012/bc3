<?php
header('Content-Type: application/json');
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$noidung = $data['noidung'];
$monhoc_id = $data['monhoc_id'];

$stmt = $conn->prepare("INSERT INTO cauhoi (noidung, monhoc_id) VALUES (?, ?)");
$stmt->bind_param("si", $noidung, $monhoc_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "id" => $stmt->insert_id]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
