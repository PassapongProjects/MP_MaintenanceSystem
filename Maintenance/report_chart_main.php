<?php
require '../connection.php';
session_start();
if (!isset($_SESSION['usid'])) {
    header("refresh:0; url=../logout.php");
    exit;
}
// if($_SESSION['usrank'] < 2) {
//     header('Content-Type: text/html; charset=utf-8');
//     header("refresh:0; url=../welcome.php?informstatus=" . urlencode("ไม่อนุญาตให้เข้าถึง"));
//     exit;}
?>
<!DOCTYPE html>
<html>

<head>
    <title>ภาพรวม Breakdown</title>
    <!-- Include Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="../style/report_chart_main.css">
    <script src="https://www.gstatic.com/charts/loader.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script src="../js/report_chart_main.js"></script>

</head>

<body>



    <div id="pg-cont">

        <div class="section" id="nav-section">
            <a href="../welcome.php" class="nav-link button-style">หน้าหลัก</a>
            <a href="report_filter_page.php" class="nav-link button-style">ค้นหารายการโดยละเอียด</a>
        </div>

        <div class="section t-section">
            <!-- This section contain main chart and filtering element for the main chart -->
            <div class="filter-bar" id="top-section-filter">
                <div class="filter-el-cont">

                    <button type="button" id="download-btn-yearly" class="download-btn">ดาวน์โหลดตาราง (ปี)</button>
                </div>

                <div class="filter-el-cont">
                    <select class="selector main-chart-selector" id="main-chart-mode-selector">
                        <option value="count">จำนวนแจ้งซ่อม</option>
                        <option value="totalDown">รวมเวลาจอด</option>
                        <option value="responseTime">เวลาเฉลี่ยที่ใช้เข้าตรวจสอบ</option>
                    </select>

                </div>

                <div class="filter-el-cont">
                    <select class="selector main-chart-selector" id="year-selector">
                        <!-- OPTIONS ARE POPULATED FROM AVAILABLE YEAR IN DATA BASE -->
                        <?php
                        $res = mysqli_query($conn, "SELECT DISTINCT EXTRACT(YEAR FROM fix_job.inform_date) AS allYear FROM fix_job ORDER BY allYear DESC;");
                        if (mysqli_num_rows($res) > 0) {
                            while ($e_year = mysqli_fetch_array($res)) {
                                echo "<option value='{$e_year[0]}'>{$e_year[0]}</option>";
                            }
                        } // If not any year in the database, which is rarely happen, JS will handle adding current year to the option.
                        ?>
                    </select>
                </div>


            </div>
            <div id="mainchart-cont">

                <div class="chart-element" id="mainchart-element">

                    <!-- THIS IS MAIN CHART -->

                </div>


            </div>

        </div>
        <div class="section m-section">
            <!-- This section contain table displaying ordered machine by downtime and break down number reported -->
            <div class="filter-bar" id="mid-section-filter">

                <div class="filter-el-cont">

                    <button type="button" id="download-btn-monthly" class="download-btn">ดาวน์โหลดตาราง (เดือน)</button>
                </div>

                <div class="filter-el-cont">
                    <select class="selector" id="month-selector">
                        <option value="1">มกราคม</option> <!-- January -->
                        <option value="2">กุมภาพันธ์</option> <!-- February -->
                        <option value="4">เมษายน</option> <!-- April -->
                        <option value="3">มีนาคม</option> <!-- March -->
                        <option value="5">พฤษภาคม</option> <!-- May -->
                        <option value="6">มิถุนายน</option> <!-- June -->
                        <option value="7">กรกฎาคม</option> <!-- July -->
                        <option value="8">สิงหาคม</option> <!-- August -->
                        <option value="9">กันยายน</option> <!-- September -->
                        <option value="10">ตุลาคม</option> <!-- October -->
                        <option value="11">พฤศจิกายน</option> <!-- November -->
                        <option value="12">ธันวาคม</option> <!-- December -->
                    </select>
                </div>

            </div>

            <div class="side-element-cont">
                <div class="group-table-label">
                    <label for="dw-time-element-cont" class="table-label" id="dw-time-element-label"></label>
                    <div class="element-cont order-table-element-cont" id="dw-time-element-cont">

                        <!-- THIS IS DOWN TIME TABLE -->

                    </div>
                </div>
                <div class="group-table-label">
                    <label for="bd-count-element-cont" class="table-label" id="bd-count-element-label"></label>
                    <div class="element-cont order-table-element-cont" id="bd-count-element-cont">

                        <!-- THIS IS BD COUNT TABLE -->

                    </div>
                </div>

            </div>

        </div>





</body>

</html>