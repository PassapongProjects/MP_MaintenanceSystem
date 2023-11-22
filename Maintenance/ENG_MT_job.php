<?php
require '../connection.php';
session_start();
if(!isset($_SESSION['usid'])) {header("refresh:0; url=../logout.php");}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Job Dashboard</title>
    <!-- Include Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="../style/ENG_MT_job.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script src="../js/ENG_MT_job.js"></script>
</head>
<body>
    <!-- <a href="../welcome.php" style="display: inline-block; padding: 10px 20px; margin-left: 10px; margin-top: 10px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; border: 1px solid #2980b9;">หน้าหลัก</a> -->
    <?php 
    if (isset($_GET['confirm_result'])){
        echo("<div class='alert'>
        <span class='closebtn' onclick='this.parentElement.style.display= &#39none&#39';'>&times;</span> 
        <strong>{$_GET['confirm_result']}</strong>
      </div>");
    }
    $usid = $_SESSION['usid'];

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
    <div class="container-lg mt-5">
    <div id='user-info'>
            <?php echo("
            <label>ผู้ใช้งานปัจจุบัน: {$_SESSION['user']}</label>
            <label>ตำแหน่ง: {$_SESSION['role']}</label>
            <label>หน่วยงาน: {$_SESSION['department']}</label>
            <label>{$thaiDate}</label>
            "); ?>
        </div>
        <h2>รายการงาน</h2>
        <div class="row">
            <div class="col-md-12">
                <p id="totalJobCount">งานทั้งหมด: <span>0</span> รายการ</p>
            </div>
        </div>
        <div id="filter-bar">
        <div class="btn-group status-filter" role="group" aria-label="Status Filter" id="status-filter-cont">
            <button type="button" class="btn btn-secondary status-filter-btn" data-status="all">ทั้งหมด</button>
            <button type="button" class="btn btn-secondary status-filter-btn active" data-status="pending" data-status-pm="planned">รอตรวจสอบ</button>
            <button type="button" class="btn btn-secondary status-filter-btn" data-status="processing">อยู่ระหว่างการซ่อม</button>
            <button type="button" class="btn btn-secondary status-filter-btn" data-status="done">สำเร็จ</button>
        </div>
        <div class="btn-group eng-filter" role="group" aria-label="Eng Filter" id="eng-filter-cont">
            <button type="button" class="btn btn-secondary eng-filter-btn active" data-eng="self-eng">งานที่ได้รับมอบหมาย</button>
            <button type="button" class="btn btn-secondary eng-filter-btn" data-eng="all-eng">งานของทุกคน</button>
        </div>

        </div>
        <?php echo ("<input type='hidden' id='usssaaaawexasq' value='{$usid}'>");?>
        <div id="jobList" class="row mt-3">
        
            <!-- Job elements will be dynamically added here -->
        </div>
    </div>

</body>
</html>
