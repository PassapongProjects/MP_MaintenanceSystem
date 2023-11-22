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
    <title>แก้ไขรายการเครื่องจักร/อะไหล่</title>
    <!-- Include Bootstrap CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" href="../style/registry_mc_part_config.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script src="../js/registry_mc_part_config.js"></script>

</head>

<body>
    <div id="pg-cont">
        <div class="top-section section">
            <div class="full-bar" id="top-mode-section">
                <!-- Mode and Operation Goes here -->
                <label for="filter-text-input">ค้นหารายการ: </label>
                <input type="text" class="text-field-input" id="filter-text-input" placeholder="ใส่คำค้นหา">

                <select id="mode-select" class="select">
                    <option value="mc" selected>รายการเครื่องจักร</option>
                    <option value="part">รายการอะไหล่</option>
                </select>

                <button type="button" class="operation-btn new-btn" id="new-object-btn">สร้างรายการใหม่</button>
            </div>

            <div class="table-cont" id="top-filter-table-cont">
                <!-- TABLE GOES HERE -->

            </div>


        </div>

        <div class="section" id="mid-section-div">
            <div class="header-label-cont"><label class="header-label" id="operation-header-label"></label></div>

            <div id="operation-input-field-cont">
                

            </div>

        </div>



    </div>
    <div class="popUpForm" id="edit-popUpForm">
        <div class="popUpForm-content">
            <div class="close-btn"><label style="font-size: 1.5rem;font-weight:bold">แจ้งเตือน ! - ระบุสาเหตุการเปลี่ยนแปลงจำนวนคงคลัง</label><label id="closepopUp">&times;</label></div>
            <div id=form-context>
            <!-- Form element -->

            </div>
        </div>
    </div>

    <!-- Dark Overlay -->
    <div class="overlay" id="dark-overlay"></div>
</body>

</html>