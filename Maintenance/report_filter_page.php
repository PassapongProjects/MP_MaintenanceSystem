<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("refresh:0; url=../logout.php");
    exit;
}
// if($_SESSION['usrank'] < 2) {
//     header('Content-Type: text/html; charset=utf-8');
//     header("refresh:0; url=../welcome.php?informstatus=" . urlencode("ไม่อนุญาตให้เข้าถึง"));
//     exit;}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Statistic</title>
    <!-- Include Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="../style/report_filter_style.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js" integrity="sha512-3gJwYpMe3QewGELv8k/BX9vcqhryRdzRMxVfq6ngyWXwo03GFEzjsUm8Q7RZcHPHksttq7/GFoxjCVUjkjvPdw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.2/dist/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../js/report_filter_page.js"></script>
</head>

<body>
    <div id=page-container>
        <div class="container mt-4" id="filter-container">
            <h1>Report</h1>
            <form id="filterForm">
                <div class="form-group">
                    <input type='hidden' id='filter_type_val' value=''>
                    <label for="filterType">กรองตาม:</label>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="filterType" id="machineRadio" value="machine" checked>
                        <label class="form-check-label" for="machineRadio">เครื่องจักร</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="filterType" id="partRadio" value="part">
                        <label class="form-check-label" for="partRadio">อะไหล่</label>
                    </div>
                </div>
                <div class="form-group">
                    <select class="form-control" id="selectOptions" name="selectOptions">
                        <!-- Options will be populated using jQuery -->
                    </select>
                </div>
            </form>
            <div class="filter-date-container">
                <label for="dateRange">ช่วงเวลา:</label>
                <label class="radio-inline">
                    <input type="radio" name="dateRangeOption" value="allTime" id="allTimeRadio" checked> ทั้งหมด
                </label>
                <label class="radio-inline">
                    <input type="radio" name="dateRangeOption" value="betweenRange" id="dateRangeRadio"> ระหว่างช่วง
                </label>
                <div id="dateRangeInputs">
                    <input type="text" id="startDate" name="startDate" class="flatpickr filterdate-input">
                    <label for="startDate">to</label>
                    <input type="text" id="endDate" name="endDate" class="flatpickr filterdate-input">
                </div>
            </div>
        </div>


        <div class="container mt-4" id="after-option-selected-container">
            

        </div>

    </div>

</body>

</html>