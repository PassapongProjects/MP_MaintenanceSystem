<?php
require '../connection_PD.php';
session_start();
if (!isset($_SESSION['usid'])) {
    header("refresh:0; url=../logout.php");
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>รายละเอียดการเดินยา</title>
    
    <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous"> -->
    <link rel="stylesheet" href="../style/src/global_bootstrap_4_5_2.min.css">
    
    <link rel="stylesheet" href="../style/PD_lot_detail.css">
    <!-- <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script> -->
    <script src="../js/src/global_jquery_3_7_1.min.js"></script>

    <!-- <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script> -->
    <script src="../js/src/global_4_5_2_bootstrap.min.js"></script>

</head>

<body>
    <?php
    if (!isset($_GET['runcode'])) {
        echo ("<h1>ไม่พบงาน</h1>");
        exit;
    } else {
        $runcode = $_GET['runcode'];
    }


    function formatDate($dateTime)
    {
        try {
            $formatted = date('d/m/Y H.i น.', strtotime($dateTime));
            return $formatted;
        } catch (Exception $e) {
            return 'N/A';
        }
    }

    function formatDuration($timeDuration)
    {
        try {
            $parts = explode(':', $timeDuration);
            $hours = (int)$parts[0];
            $minutes = (int)$parts[1];

            $formatted = "{$hours} ชั่วโมง {$minutes} นาที";
            return $formatted;
        } catch (Exception $e) {
            return 'N/A';
        }
    }

    function timePercentage($partialTime, $totalTime)
    {
        try {
            $partialSeconds = strtotime($partialTime) - strtotime('00:00:00');
            $totalSeconds = strtotime($totalTime) - strtotime('00:00:00');

            if ($totalSeconds === 0) {
                return '0%'; // Avoid division by zero
            }

            $percentage = ($partialSeconds / $totalSeconds) * 100;
            return strval(round($percentage, 2)) . '%';
        } catch (Exception $e) {
            return 'N/A';
        }
    }


    $dataQuery = "SELECT
    pdl.`fk_machine_id` AS mcId,
    IFNULL(pdl.lot_no, 'N/A') AS using_lot_no,
    IFNULL(pdl.fk_med_id, 'N/A') AS using_med_id,
    IFNULL(med.`name`, 'N/A') AS using_med_name,
    IFNULL(mt_machine.name,'รหัสเครื่องมีการเปลี่ยนแปลง') AS using_machine_name,
    IFNULL(pdl.mc_alias_name,'N/A') AS using_mc_alias_name,
    IFNULL(pdl.lot_setup_start_time, 'N/A') AS using_setup_start_time,
    IFNULL(pdl.lot_start_time, 'N/A') AS using_start_time,
    IFNULL(pdl.lot_end_time, 'N/A') AS using_end_time,
    IFNULL(pdl.lot_setup_duration, 'N/A') AS using_setup_duration,
    IFNULL(pdl.lot_process_duration, 'N/A') AS using_process_duration,
    IFNULL(pdl.lot_pause_duration, 'N/A') AS using_pause_duration,
    IFNULL(pdl.lot_duration, 'N/A') AS using_lot_duration,
    IFNULL(form_top.`name`, 'N/A') AS using_form_top_name,
    IFNULL(form_bot.`name`, 'N/A') AS using_form_bot_name,
    IFNULL(seal_top.`name`, 'N/A') AS using_seal_top_name,
    IFNULL(seal_bot.`name`, 'N/A') AS using_seal_bot_name,
    IFNULL(guide.`name`, 'N/A') AS using_guide_name,
    IFNULL(cut.`name`, 'N/A') AS using_cut_name,
    IFNULL(perfor.`name`, 'N/A') AS using_perfor_name,
    IFNULL(form_top.`id`, 'N/A') AS using_form_top_id,
    IFNULL(form_bot.`id`, 'N/A') AS using_form_bot_id,
    IFNULL(seal_top.`id`, 'N/A') AS using_seal_top_id,
    IFNULL(seal_bot.`id`, 'N/A') AS using_seal_bot_id,
    IFNULL(guide.`id`, 'N/A') AS using_guide_id,
    IFNULL(cut.`id`, 'N/A') AS using_cut_id,
    IFNULL(perfor.`id`, 'N/A') AS using_perfor_id,
    IFNULL(form_top.`unique_code`, 'N/A') AS using_form_top_unique_code,
    IFNULL(form_bot.`unique_code`, 'N/A') AS using_form_bot_unique_code,
    IFNULL(seal_top.`unique_code`, 'N/A') AS using_seal_top_unique_code,
    IFNULL(seal_bot.`unique_code`, 'N/A') AS using_seal_bot_unique_code,
    IFNULL(guide.`unique_code`, 'N/A') AS using_guide_unique_code,
    IFNULL(cut.`unique_code`, 'N/A') AS using_cut_unique_code,
    IFNULL(perfor.`unique_code`, 'N/A') AS using_perfor_unique_code
FROM
    production_log AS pdl
LEFT JOIN
    master_medicine AS med ON pdl.fk_med_id = med.id
LEFT JOIN
    master_mold AS form_top ON pdl.fk_form_top_id = form_top.id
LEFT JOIN
    master_mold AS form_bot ON pdl.fk_form_bot_id = form_bot.id
LEFT JOIN
    master_mold AS seal_top ON pdl.fk_seal_top_id = seal_top.id
LEFT JOIN
    master_mold AS seal_bot ON pdl.fk_seal_bot_id = seal_bot.id
LEFT JOIN
    master_mold AS guide ON pdl.fk_guide_id = guide.id
LEFT JOIN
    master_mold AS cut ON pdl.fk_cut_id = cut.id
LEFT JOIN
    master_mold AS perfor ON pdl.fk_perfor_id = perfor.id
LEFT JOIN
    MP_MT.mc AS mt_machine ON pdl.fk_machine_id = mt_machine.id
WHERE
    pdl.runcode = ? 
LIMIT 1;";


    $cp_condition_query = "SELECT
    mold_l.log_time AS log_time,
    mold_l.fk_mold_id AS moldId,
    mold_cs.`name` AS condition_name,
    master_mold.unique_code AS mold_code,
    master_mold.`name` AS mold_name,
    master_mold.fk_mold_type AS mold_type_id,
    mold_type.`name` AS mold_type_name,
    master_mold.fk_moldset AS mold_set_id,
    mold_set.`name` AS mold_set_name,
    mold_l.text_code AS reported_text,
    mold_l.fk_condition_status AS condition_id
FROM
    mold_condition_log AS mold_l
LEFT JOIN
    master_mold_condition_status AS mold_cs ON mold_l.fk_condition_status = mold_cs.id
LEFT JOIN
    master_mold AS master_mold ON mold_l.fk_mold_id = master_mold.id
LEFT JOIN
    master_mold_type AS mold_type ON master_mold.fk_mold_type = mold_type.`id`
LEFT JOIN
    master_moldset AS mold_set ON master_mold.fk_moldset = mold_set.`id`
WHERE
    mold_l.runcode = ?
ORDER BY
    log_time ASC, mold_type_id ASC;";

    $event_log_query = "SELECT
    e_log.log_time AS log_time,
    st_from.`name` AS stateFrom_name,
    st_to.`name` AS stateTo_name,
    e_log.reason AS text_reason
    FROM
    event_log AS e_log
    LEFT JOIN master_mc_state AS st_from ON e_log.state_from = st_from.id
    LEFT JOIN master_mc_state AS st_to ON e_log.state_to = st_to.id
    WHERE
    e_log.fk_run_code = ?
    ORDER BY e_log.log_time ASC;";


    // Create prepared statements for each query
    $event_log_stmt = $connPD->prepare($event_log_query);
    $cp_condition_stmt = $connPD->prepare($cp_condition_query);
    $data_stmt = $connPD->prepare($dataQuery);

    $event_log_stmt->bind_param("s", $runcode);
    $cp_condition_stmt->bind_param("s", $runcode);
    $data_stmt->bind_param("s", $runcode);

    // Execute each statement
    $event_log_stmt->execute();
    $event_log_result = $event_log_stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $event_log_stmt->close();


    $cp_condition_stmt->execute();
    $cp_condition_result = $cp_condition_stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $cp_condition_stmt->close();


    $data_stmt->execute();

    $fetchedResult = $data_stmt->get_result();
    if($fetchedResult->num_rows >0){
        $data_result = $fetchedResult->fetch_all(MYSQLI_ASSOC);
        $data_stmt->close();
        $data_result = $data_result[0];
    }else {
        echo ("<h1>ไม่พบงาน</h1>");
        exit;
    }
    
    
    // Now you have the results in separate variables: $event_log_result, $cp_condition_result, and $data_result


    ?>

    <div id="pg-cont">

        <div class="section-div" id="header-section">

            <div class="header-label-cont"><label class="header-label">รายระเอียดการเดินยา</label></div>


        </div>

        <div class="section-div" id="detail-section">

            <label class="section-topic-label">ข้อมูลทั่วไป</label>

            <div class="side-div-cont">


                <div class="sub1-section-div side-div" id="general-section">
                    <div class="sub-section-topic-label">
                        <label>General</label>
                    </div>

                    <div class="div-label-content">
                        <div class="inline-label-cont">
                            <label class="inline-topic-label">Lot No.</label>
                            <label class="inline-value-label"><?php echo $data_result['using_lot_no']; ?></label>
                        </div>


                        <div class="inline-label-cont">
                            <label class="inline-topic-label">ชื่อยา</label>
                            <label class="inline-value-label"><?php echo $data_result['using_med_name']; ?></label>
                        </div>

                        <div class="inline-label-cont">
                            <label class="inline-topic-label">เครื่องที่ดำเนินการ</label>
                            <label class="inline-value-label"><?php echo "{$data_result['mcId']}: {$data_result['using_mc_alias_name']} <br> <div class='text-scroll-container'><div class='text-scroll-div'>{$data_result['using_machine_name']}</div></div>"; ?></label>
                        </div>
                    </div>

                </div>

                <div class="sub1-section-div side-div" id="time-section">
                    <div class="sub-section-topic-label">
                        <label>Time</label>
                    </div>
                    <div class="sub2-section-div ">

                        <div class="div-label-content">
                            <div class="inline-label-cont">
                                <label class="inline-topic-label">เวลาเริ่มตั้งเครื่อง</label>
                                <label class="inline-value-label"><?php echo formatDate($data_result['using_setup_start_time']); ?></label>
                            </div>

                            <div class="inline-label-cont">
                                <label class="inline-topic-label">เวลาเริ่มเดินยา</label>
                                <label class="inline-value-label"><?php echo formatDate($data_result['using_start_time']); ?></label>
                            </div>

                            <div class="inline-label-cont">
                                <label class="inline-topic-label">เวลาจบ Lot</label>
                                <label class="inline-value-label"><?php echo formatDate($data_result['using_end_time']); ?></label>
                            </div>


                            <div class="inline-label-cont">
                                <label class="inline-topic-label">ระยะเวลาที่ใช้ตั้งเครื่อง</label>
                                <label class="inline-value-label"><?php echo formatDuration($data_result['using_setup_duration']) . " (" . timePercentage($data_result['using_setup_duration'], $data_result['using_lot_duration']) . ")"; ?></label>
                            </div>

                            <div class="inline-label-cont">
                                <label class="inline-topic-label">ระยะเวลาที่เดินยาจริง (ไม่รวมหยุด)</label>
                                <label class="inline-value-label"><?php echo formatDuration($data_result['using_process_duration']) . " (" . timePercentage($data_result['using_process_duration'], $data_result['using_lot_duration']) . ")"; ?></label>
                            </div>

                            <div class="inline-label-cont">
                                <label class="inline-topic-label">รวมระยะเวลาหยุดระหว่าง Lot</label>
                                <label class="inline-value-label"><?php echo formatDuration($data_result['using_pause_duration']) . " (" . timePercentage($data_result['using_pause_duration'], $data_result['using_lot_duration']) . ")"; ?></label>
                            </div>

                            <div class="inline-label-cont">
                                <label class="inline-topic-label">เวลารวมทั้งหมด</label>
                                <label class="inline-value-label"><?php echo formatDuration($data_result['using_lot_duration']); ?></label>
                            </div>


                        </div>

                    </div>



                </div>


            </div>

        </div>


        <div class="section-div" id="cp-section">

            <label class="section-topic-label">รายการ Change Part ที่ใช้เดินยา</label>

            <div class="table-cont" id="cp-usage-table-cont">
                <table class="fixed-thead-table" id="cp-usage-table">
                    <thead>
                        <tr>
                            <th>เวลาบันทึก</th>
                            <th>รหัส</th>
                            <th>ชื่อ</th>
                            <th>ประเภท</th>
                            <th>เซ็ตโมล</th>
                            <th>สถานะบันทึก</th>
                            <th>หมายเหตุ</th>

                        </tr>

                    </thead>
                    <tbody>

                        <?php
                        foreach ($cp_condition_result as $moldItem) {

                            $log_time = formatDate($moldItem['log_time']);
                            $bg_color = $moldItem['condition_id'] == 0 ? "#ffd0d0" : "#dfffec";
                            $report_text = $moldItem['condition_id'] == 1 ? '-' : $moldItem['reported_text'];
                            $tr = "<tr style='background-color:{$bg_color};'>
                            <td>{$log_time}</td>
                            <td>{$moldItem['mold_code']}</td>
                            <td>{$moldItem['mold_name']}</td>
                            <td>{$moldItem['mold_type_name']}</td>
                            <td>{$moldItem['mold_set_name']}</td>
                            <td>{$moldItem['condition_name']}</td>
                            <td>{$report_text}</td>
                            </tr>";

                            echo $tr;
                        }
                        ?>


                    </tbody>

                </table>
            </div>

        </div>

        <div class="section-div" id="event-section">

            <label class="section-topic-label">บันทึกเหตุการณ์</label>

            <div class="table-cont" id="event-log-table-cont">
                <table class="fixed-thead-table" id="event-log-table">
                    <thead>
                        <tr>
                            <th>เวลาบันทึก</th>
                            <th>สถานะเดิม</th>
                            <th>สถานะใหม่</th>
                            <th>หมายเหตุ</th>
                        </tr>

                    </thead>
                    <tbody>

                        <?php
                        foreach ($event_log_result as $event) {

                            $log_time = formatDate($event['log_time']);

                            $tr = "<tr'>
                            <td>{$log_time}</td>
                            <td>{$event['stateFrom_name']}</td>
                            <td>{$event['stateTo_name']}</td>
                            <td>{$event['text_reason']}</td>
                            </tr>";
                            echo $tr;
                        }

                        ?>


                    </tbody>

                </table>
            </div>

        </div>

    </div>
    <script>
        $(document).ready(function() {
            $('.text-scroll-div').on('scroll', function() {
                $(this).css('text-overflow', 'clip');
            });
        });
    </script>
</body>

</html>