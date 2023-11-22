<?php
require '../connection.php';
session_start();
if (!isset($_SESSION['usid'])) {
    header("refresh:0; url=../logout.php");
    exit;
}
if($_SESSION['usrank'] < 2) {
    header('Content-Type: text/html; charset=utf-8');
    header("refresh:0; url=../welcome.php?informstatus=" . urlencode("ไม่อนุญาตให้เข้าถึง"));
    exit;}
?>
<!DOCTYPE html>
<html>

<head>
    <title>ตั้งค่ารายละเอียด</title>
    <!-- Include Bootstrap CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="../style/registry_state_config.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script src="../js/registry_state_config.js"></script>

</head>

<body>
    <div id="pg-cont">
        <input type="hidden" id="selected-mode" value="">
        <!--  List of items and mode -->
        <div class="sidebar">
            <header>การตั้งค่า</header>
            <ul>
                <li class="menu-item"><a href="#" id="mc_type">ประเภทเครื่องจักร</a></li>
                <li class="menu-item"><a href="#" id="mc_rank">Rank เครื่องจักร</a></li>
                <li class="menu-item"><a href="#" id="eng_group">ส่วนงานวิศวะกรรม</a></li>
                <li class="menu-item"><a href="#" id="mc_status">สถานะเครื่องจักร</a></li>
                <li class="menu-item"><a href="#" id="department">แผนก</a></li>
                <li class="menu-item"><a href="#" id="purchase_job_type">หมายเหตุการซื้อ</a></li>
                <li class="menu-item"><a href="#" id="user_rank">ตำแหน่ง</a></li>
                <li class="menu-item"><a href="#" id="user_config">เพิ่ม/แก้ไข พนักงาน</a></li>
            </ul>
        </div>




        <div class="main-section-div" id="main-section">
            <!-- Details and action -->

            <div class="header-label-cont">กรุณาเลือกโหมด</div>
            <div id="new-button-cont"></div>
            <div class="main-card-container">
                <div class="card-container">


                </div>
            </div>


        </div>



    </div>
    <div class="popUpForm" id="edit-popUpForm">
        <div class="popUpForm-content">
            <div class="close-btn"><label style="font-size: 1.5rem;font-weight:bold">รายการแก้ไข</label><label id="closepopUp">&times;</label></div>
            <div id=form-context>
            <!-- Form element -->

            </div>
        </div>
    </div>

    <!-- Dark Overlay -->
    <div class="overlay" id="dark-overlay"></div>
</body>

</html>