<?php
header('Content-Type: application/json');
$conn = new mysqli('localhost','root','','tracnghiem2');
if($conn->connect_error){ echo json_encode(['error'=>'DB Error']); exit; }

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$monhoc = isset($_GET['monhoc']) ? (int)$_GET['monhoc'] : 0;
$lop = isset($_GET['lop']) ? (int)$_GET['lop'] : 0;
$keyword = isset($_GET['keyword']) ? $conn->real_escape_string($_GET['keyword']) : '';

$limit = 20;
$offset = ($page-1)*$limit;

$where = "WHERE 1";
if($monhoc>0) $where .= " AND monhoc_id=$monhoc";
if($lop>0) $where .= " AND lop_id=$lop";
if($keyword!='') $where .= " AND noi_dung LIKE '%$keyword%'";

$totalQuery = $conn->query("SELECT COUNT(*) as total FROM cauhoi $where");
$totalRow = $totalQuery->fetch_assoc();
$total = $totalRow['total'];

$sql = "SELECT id, noi_dung, dapan_a, dapan_b, dapan_c, dapan_d FROM cauhoi $where LIMIT $limit OFFSET $offset";
$result = $conn->query($sql);
$data = [];
while($row=$result->fetch_assoc()){ $data[] = $row; }

echo json_encode(['questions'=>$data,'total'=>$total,'page'=>$page,'limit'=>$limit]);
$conn->close();
?>
