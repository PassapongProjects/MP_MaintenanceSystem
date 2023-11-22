<?php
require '../connection.php';
session_start();
if(!isset($_SESSION['usid'])) {header("refresh:0; url=../logout.php"); exit;}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>รายละเอียดแผน PM</title>
<link rel="stylesheet" href="../style/pm_plan_creation_view_edit.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
<script src="../js/pm_plan_view_edit.js"></script>
</head>
<body>
<!-- The Best Way to Edit is to Load the queried data and assign value to the same element Using the same Javascrit to store data -->

<div id=pg-container>
    <a href='pm_plan_creation.php' id='backLink'>หน้าสร้างแผน</a>
    <div id='header-label-cont'><label id="topic-label"><h3><u>รายละเอียดแผน PM</u></h3></label></div>
    <!-- Inline Div -->
    <div id ="plan-selection-cont">
    <label for="plan-id-select" id="pm-id-label">รหัสแผน PM: </label>
    <select name="plan-code-select" id="plan-code-select" class="plan-select" style="text-align: center;">
        <option value="" selected>--เลือกงานที่ต้องการดูข้อมูล--</option>
        <?php 
        $conQuery = mysqli_query($conn,"SELECT id, `name` FROM pm_plan");
        while($result = mysqli_fetch_assoc($conQuery)) {
            echo("<option value='{$result['id']}'>ID: {$result['id']} || {$result['name']}</option>");
        }
        ?>
        <!-- Populated Options -->
    </select>

    <?php
    $get_planId = isset($_GET['planId']) ? $_GET['planId']  : '';
    $get_planVer = isset($_GET['planVer']) ? $_GET['planVer']  : '';
    echo("
    <input type='hidden' id='get_planId' value='{$get_planId}'>
    <input type='hidden' id='get_planVer' value='{$get_planVer}'>");
    ?>
    <input type="hidden" id= "latest-ver-textbox" value="">
    <label for="version-select" id="version-select-label">ver. </label>
    <select name="version-select" id="version-select" class="plan-select">
        <!-- Populated Options -->
    </select>
    <div id="plan-detail-text-cont">
        <span id="plan-id-span-text"></span>
        <span id="plan-edit-date-span-text"></span>
        <span id="plan-editor-span-text"></span>
        <span id="plan-approver-span-text"></span>
    </div>


    </div>
    <div class = "group-container" id="header-container">
    
    <button type="button" id="Plan-Save-btn" class="proceed-but">บันทึกรายการ</button>
    <br>
<!-- Plan Name --> 
    <label for="plan_name-textbox"><H3>ชื่อแผน: </H3></label>
    <input type="text" id ="plan_name-textbox" maxlength="255" placeholder="ตัวอย่าง​: แผน PM Blister รอบ 2 เดือน">
    <br>
    <br>
<!-- Plan Interval -->
    <label for="plan_interval-textbox"><H3>รอบการทำ: </H3></label>
    <input type="number" min=0 id ="plan_interval-textbox" placeholder="ช่วงเวลา">
    <select name="interval-unit" id="interval-unit-select">
        <option value="">-หน่วย-</option>
        <option value="d">วัน</option>
        <option value="m">เดือน</option>
        <option value="y">ปี</option>
    </select>
    <div id ="radio-part-select-cont">
    <p><H3>รายการเปลี่ยนอะไหล่?</H3></p>
    <input type="radio" name="part-req-radio" id="part-req-radio-confirm" value="1">
    <label for="part-req-radio-confirm">มีการเปลี่ยนอะไหล่</label>
    <br>
    <input type="radio" name="part-req-radio" id="part-req-radio-no" value="0" checked>
    <label for="part-req-radio-no"><u><b>ไม่มี</b></u>การเปลี่ยนอะไหล่</label>
</div>
    <br>
    <label for="plan_dexc-textbox"><H3>คำอธิบายแผน: </H3></label>
    <textarea name="plan_desc" id="plan_desc-textbox" cols="30" rows="10" maxlength="1000" placeholder="คำอธิบายแผน (ไม่มีใส่ - )"></textarea>

    
    <!-- Input value changed after plan creation -->
    

    </div>

    <div class = "group-container" id="items-container">
    <u><h3>รายการตรวจสอบ</h3></u>
    <br>
    <ul>
        <li>M: ทำความสะอาด</li>
        <li>T: ทดสอบประสิทธิภาพ</li>
        <li>R: เปลี่ยนอุปกรณ์/ถ่ายน้ำมัน</li>
        <li>C: ตรวจสอบขันแน่น</li>
        <li>H: Overhaul</li>
        <li>CC: ตรวจสอบโดยช่างซ่อมบำรุง</li>
        <li>+: เติม/เปลี่ยน/อัด สารหล่อลื่น</li>
    </ul>

<!-- Part items {Name | 7 Checkboxs | Howto | Standard }-->
<div id ="pm-table-cont">
    <table id ="pm-items-table" class='table table-bordered part_req_table'>
    <thead>
    <th>ลำดับ</th>
    <th>หัวข้อการตรวจสอบ</th>
    <th>M</th>
    <th>T</th>
    <th>R</th>
    <th>C</th>
    <th>H</th>
    <th>CC</th>
    <th>+</th>
    <th>วิธีการทำงาน</th>
    <th>มาตรฐาน</th>
    <th>ลบรายการ</th>
    </thead>
    <tbody>

    <tr class="pm-items">
            <td class="item-order">1</td>
            <td><input type="text" class="item-name" maxlength="500"></td>
            <td><input type="checkbox" class="checkbox c-clean"></td>
            <td><input type="checkbox" class="checkbox c-test"></td>
            <td><input type="checkbox" class="checkbox c-replace"></td>
            <td><input type="checkbox" class="checkbox c-torque"></td>
            <td><input type="checkbox" class="checkbox c-overhaul"></td>
            <td><input type="checkbox" class="checkbox c-check"></td>
            <td><input type="checkbox" class="checkbox c-oil"></td>
            <td><input type="text" class="work-method" maxlength="500"></td>
            <td><input type="text" class="standard" maxlength="500"></td>
            <td><button type="button" class="remove-item-btn">ลบรายการ</button></td>
        </tr>

    <tr class="add-new-item-row"><td colspan="12"><button type="button" id="add-new-item-btn">เพิ่มรายการ</button></td></tr>

    </tbody>
    </table>
</div>
    </div>


<div id='mr-detail-container'>


<div class='parts-used-container' id='added-parts-field'>
<div id='confirm-req-container'>
<label for='added-parts-field'><h3>รายการอะไหล่ที่ใช้สำหรับงาน</h3></label>
</div>
        <!-- ... (Previous HTML code for the parts used for the job section) ... -->
        <table class='table table-bordered part_req_table' id='added-parts-table'>
        <thead style='text-align:center; vertical-align:middle'>
            <tr>
                <th>หมายเลขอะไหล่</th>
                <th>ชื่ออะไหล่</th>
                <th>สเปค</th>
                <th>จำนวนต้องการ</th>
                <th>หน่วย</th>
                <th>ลบ</th>
            </tr>
        </thead>
        
        <tbody class='added-parts-container'>
        </tbody>
    </table>

    
</div>
<div id='filter-and-part-container'>
<div class='toggle-button-container' style='margin-top: 20px;'>
<button id='toggleButton' class='toggle-button'>ซ่อน/แสดง รายชื่ออะไหล่</button>
</div>
<!-- Spare Part Requisition Field -->
<label for='filter_form' style='margin-top: 5px;' class='part_req_table'><h3>ตัวเลือกอะไหล่</h3></label>
    <div class='form-group part_req_table' id ='filter_form'>
        <label for='searchBox'>ค้นหาชื่อ/สเปค:</label>
        <input type='text' class='form-control' id='searchBox' placeholder='ใส่คำที่ต้องการค้นหา' style='width:35%;'>
    </div>
    
    <!-- Parts List Container -->
    <div id="fetched-part-cont">
    <table class='table table-bordered part_req_table' id="part-list-table">
        <thead style='text-align:center; vertical-align:middle'>
            <tr>
                <th>หมายเลขอะไหล่</th>
                <th>ชื่ออะไหล่</th>
                <th>สเปค</th>
                <th>หน่วย</th>
                <th>เลือก</th>
            </tr>
        </thead>
        
        <tbody class='parts-list-container'>
        </tbody>
    </table>
    </div>     

    <!-- Fetched Part Section -->
    
</div>
    
</div>
<!-- /div of mt5 container -->
</div>
    <!-- Div mr-detail-container -->


<!-- spare-part-requisition-container -->
</div>

</div>
</body>
</html>