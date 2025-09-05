<?php
$conn = new mysqli("localhost", "root", "", "tracnghiem2");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại"]));
}

$monhoc_id = $_GET['monhoc_id'];
$lop_id = $_GET['lop_id'];
$sode = $_GET['sode'];

$sqlDe = "SELECT * FROM de WHERE monhoc_id = $monhoc_id AND lop_id = $lop_id LIMIT 1 OFFSET " . ($sode - 1);
$resultDe = $conn->query($sqlDe);

$de = null;
$cauHoi = [];

if ($resultDe && $resultDe->num_rows > 0) {
  $de = $resultDe->fetch_assoc();
  $de_id = $de['id'];

  $sqlCH = "SELECT * FROM cauhoi WHERE de_id = $de_id";
  $resultCH = $conn->query($sqlCH);

  while ($row = $resultCH->fetch_assoc()) {
    $cauHoi[] = $row;
  }
}

$conn->close();

echo json_encode([
  "ten_de" => $de ? $de['ten_de'] : "",
  "cauHoi" => $cauHoi
]);
?>
