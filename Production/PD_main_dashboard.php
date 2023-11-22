<?php
session_start();
header('Content-Type: text/html; charset=utf-8');
if ( !isset($_SESSION['usid']) || !($_SESSION['departmentCode'] == 2 || $_SESSION['departmentCode'] == 6)){
    header("refresh:0; url=../welcome.php?informstatus=" . urlencode("ไม่อนุญาตให้เข้าถึง"));
    exit;
}
?>
<!DOCTYPE html>
<html>

<head>
    <title>PD Operation</title>
    <!-- Include Bootstrap CSS -->
    <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"> -->
    
    <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" /> -->
    <link rel="stylesheet" href="../style/src/global_ajax_lib_font_awesome.min.css">
    
    <!-- <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"> -->
    <link rel="stylesheet" href="../style/src/global_bootstrap_4_5_2.min.css">
    
    <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css"> -->
    <link rel="stylesheet" href="../style/src/global_flatpickr.min.css">
    
    <link rel="stylesheet" href="../style/PD_main_dashboard.css">
    
    <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js" integrity="sha512-3gJwYpMe3QewGELv8k/BX9vcqhryRdzRMxVfq6ngyWXwo03GFEzjsUm8Q7RZcHPHksttq7/GFoxjCVUjkjvPdw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script> -->
    <script src="../js/src/global_jquery_3_7_1.min.js"></script>
    
    <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script> -->
    <script src="../js/src/global_popper.min.js"></script>
    
    <!-- <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script> -->
    <script src="../js/src/global_4_5_2_bootstrap.min.js"></script>
    
    <!-- <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script> -->
    <script src="../js/src/global_flatpickr.min.js"></script>
    
    <script src="../js/PD_main_dashboard.js"></script>

</head>

<body>
    <div id="pg-cont">
        <input type="hidden" id="selected-mode" value="">
        <!--  List of items and mode -->
        <div class="sidebar">
            <header>รายการ</header>
            <ul>
                <li class="menu-item"><a href="#" id="show_dashboard_menu">Dashboard</a></li>
                <li class="menu-item"><a href="#" id="show_alert_cp">ประวัติ ChangePart</a></li>
                <li class="menu-item"><a href="#" id="show_med_history">ประวัติการเดินยา</a></li>
                <li class="menu-item"><a href="#" id="edit_cp_set">แก้ไขชุดเดินยา</a></li>
                <li class="menu-item"><a href="#" id="show_config_menu">Configuration</a></li>
            </ul>
        </div>




        <div class="main-section-div" id="main-section">
            <!-- Details and action -->

            <div class="header-label-cont" id="main-header-label">กรุณาเลือกรายการทำงาน</div>
            
            <div class="main-div-element" id="main-oper-div">
                <div class="blister-cart-element">
                    <!-- Detail of blister cards -->



                </div>

            </div>


        </div>



    </div>

    <div class="small-popup" id="small-popup">
        <!-- Popup Content -->
        <span class="popup-close" id="small-popup-close">&times;</span>
        <div class="small-popup-content">
            
           
        </div>
    </div>


    <div class="popUpForm" id="edit-popUpForm">
        <div class="popUpForm-content">
            <div class="close-btn"><label style="font-size: 1.5rem;font-weight:bold">รายละเอียด</label><label id="closepopUp">&times;</label></div>
            <div id=form-context>
            <!-- Form element -->

            </div>
        </div>
    </div>

    <!-- Dark Overlay -->
    <div class="overlay" id="dark-overlay"></div>
</body>

</html>