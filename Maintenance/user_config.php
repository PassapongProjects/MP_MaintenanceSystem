<?php
require '../connection.php';
session_start();
if (!isset($_SESSION['usid'])) {
    header("refresh:0; url=logout.php");
    exit;
}
if ($_SESSION['usrank'] < 3) {
    header('Content-Type: text/html; charset=utf-8');
    header("refresh:0; url=welcome.php?informstatus=" . urlencode("ไม่อนุญาตให้เข้าถึง"));
    exit;
}
?>
<!DOCTYPE html>
<html>

<head>
    <title>User Configuration</title>
    <!-- Include Bootstrap CSS -->
    <!-- <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"> -->
    <link rel="stylesheet" href="../style/src/global_bootstrap_4_5_2.min.css">
     <link rel="stylesheet" href="../style/src/fontawesome-free-6.4.2-web/css/all.min.css">
    <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"> -->
    <link rel="stylesheet" href="../style/user_config.css">

    <!-- <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script> -->
    <script src="../js/src/global_jquery_3_7_1.min.js"></script>

    <!-- <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script> -->
    <script src="../js/src/global_4_5_2_bootstrap.min.js"></script>

    <script src="../js/user_config.js"></script>

</head>

<body>



    <div id="pg-cont">
        <div class="top-section section">
            <div class="full-bar" id="top-mode-section">
                <!-- Mode and Operation Goes here -->
                <label for="filter-text-input">ค้นหาพนักงาน: </label>
                <input type="text" class="text-field-input" id="filter-text-input" placeholder="ใส่คำค้นหา (ชื่อ / นามสกุล / โทรศัพท์)">

                
            </div>

            <div class="table-cont" id="top-filter-table-cont">
                <!-- TABLE GOES HERE -->

            </div>


        </div>

        <div class="section hide" id="mid-section-div">
            <div class="header-label-cont"><label class="header-label" id="operation-header-label"></label></div>

            <div id="operation-input-field-cont">


            </div>

        </div>



    </div>
    <div class="popUpForm" id="edit-popUpForm">
        <div class="popUpForm-content">
            <div class="close-btn"><label style="font-size: 1.5rem;font-weight:bold">แจ้งเตือน !</label><label id="closepopUp">&times;</label></div>
            <div id=form-context>
                <!-- Form element -->

            </div>
        </div>
    </div>

    <!-- Dark Overlay -->
    <div class="overlay" id="dark-overlay"></div>




</body>

</html>