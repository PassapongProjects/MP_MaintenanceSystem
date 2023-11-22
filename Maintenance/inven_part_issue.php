<?php 
require '../connection.php';
session_start();
if(!isset($_SESSION['usid'])) {header("refresh:0; url=../logout.php"); exit;}
if($_SESSION['usrank'] < 2) {
    header('Content-Type: text/html; charset=utf-8');
    header("refresh:0; url=../welcome.php?informstatus=" . urlencode("ไม่อนุญาตให้เข้าถึง"));
    exit;}

$thaiDays = array(
    'อาทิตย์', 'จันทร์', 'อังคาร',
    'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'
);

$thaiMonths = array(
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม',
    'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน',
    'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
);

$thaiDay = date('w');
$thaiMonth = date('n') - 1; // Adjust to array index

$thaiDate = "วัน {$thaiDays[$thaiDay]} ที่ " . date('j') . " " . " เดือน " . $thaiMonths[$thaiMonth] . " ปี " . (date('Y'));

?>
<!DOCTYPE html>
<html>
<head>
    <title>MP Part Issue</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="../style/inven_part_issue.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="../js/inven_part_issue.js"></script>

</head>
<body>
    <div id="pg-container">
       <div id="information-cont">
        <h3>งานเบิกอะไหล่</h3>

        <div id='user-info'>
            <?php echo("
            <label>ผู้ใช้งาน: {$_SESSION['user']}</label>
            <label>ตำแหน่ง: {$_SESSION['role']}</label>
            <label>หน่วยงาน: {$_SESSION['department']}</label>
            <label>{$thaiDate}</label>
            "); ?>
        </div>

       </div> 
       <div id="filter-container">
    <label for="filter-mr-code">รหัสรายการเบิก/รหัสงาน:</label>
    <input type="text" id="filter-mr-code">
    
    <label for="filter-job-type">ประเภท:</label>
    <select id="filter-job-type">
        <option value="">ทั้งหมด</option>
        <!-- Populate options using JavaScript -->
    </select>
    
    <label for="filter-status">สถานะ:</label>
    <select id="filter-status">
        <option value="">ทั้งหมด</option>
        <!-- Populate options using JavaScript -->
    </select>
</div>
       <div id="req-list-cont">
        

       </div>
    </div>
</body>
</html>
