<?php
require 'connection.php';
session_start();
if (!isset($_SESSION['user'])) {
    header("refresh:0; url=logout.php");
    exit;
}
echo ("<script>var department_code = {$_SESSION['departmentCode']};</script>");
echo ("<script>var usrank = {$_SESSION['usrank']};</script>");
$url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
$url = strtok($url, '?');
?>

<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <!-- <meta http-equiv="refresh" content="<?php echo '7' ?>;URL='<?php echo $url ?>'">  -->
    <title>หน้าหลัก</title>

    <link rel="stylesheet" href="/style/src/global_bootstrap_4_5_2.min.css">
    <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous"> -->
    <link rel="stylesheet" href="/style/welcome.css">
    <!-- <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script> -->
    <script src="/js/src/global_jquery_3_7_1.min.js"></script>

    <!-- <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script> -->
    <script src="/js/src/global_4_5_2_bootstrap.min.js"></script>

</head>

<body>
    <?php
    if (isset($_GET['informstatus'])) {
        echo "<div class='alert'>
          <span class='closebtn' onclick='this.parentElement.style.display=&#39none&#39';'>&times;</span> 
          <strong>{$_GET['informstatus']}</strong>
        </div>";
    }
    ?>
    <div id="pg-cont">
        <div class="menu">
            <div class="user-information">
                    <span class="user-name">ผู้ใช้งาน: <?php echo("{$_SESSION['user']} {$_SESSION['user_sur']}") ?></span>
                    <span class="user-department">แผนก: <?php echo($_SESSION['department']) ?></span>
                    <span class="user-auth">ตำแหน่ง: <?php echo($_SESSION['role']) ?></span>
            </div>
            <ul >
                <li><a href="logout.php">ออกจากระบบ</a></li>
            </ul>
</div>
        <div class="main-menu" id="menu-container"></div>

    </div>

</body>

<script>
    $(document).ready(function() {

        function generate_main_menu() {

            const section_label = {
                "mt": "Maintenance",
                "st": "ข้อมูลสถิติ",
                "rg": "Registry",
                "iv": "คลังอะไหล่",
                "pd": "ฝ่ายผลิต",


            }
            let menuItems = [{
                    label: "แจ้งซ่อม",
                    url: "Maintenance/PD_down_inform.php",
                    section: "mt",
                    imgFile: "icon/welcome_fix_inform.png",
                    department: "MT",
                    reqRank:"1"
                },
                {
                    label: "งานช่าง",
                    url: "Maintenance/ENG_MT_job.php",
                    section: "mt",
                    imgFile: "icon/welcome_fix.png",
                    department: "MT",
                    reqRank:"1"
                },

                {
                    label: "ขอเบิกอะไหล่",
                    url: "Maintenance/inven_sub_part_request.php",
                    section: "iv",
                    imgFile: "icon/welcome_part_request.png",
                    department: "MT",
                    reqRank:"1"
                },
                {
                    label: "อนุมัติเบิกอะไหล่",
                    url: "Maintenance/inven_part_issue.php",
                    section: "iv",
                    imgFile: "icon/welcome_issue_confirm.png",
                    department: "MT",
                    reqRank:"2"
                },

                {
                    label: "ปฏิทินแผน PM",
                    url: "Maintenance/pm_job_schedule.php",
                    section: "mt",
                    imgFile: "icon/welcome_pm_adj.png",
                    department: "MT",
                    reqRank:"2"
                },
                {
                    label: "สร้างแผน PM",
                    url: "Maintenance/pm_plan_creation.php",
                    section: "mt",
                    imgFile: "icon/welcome_pm_create.png",
                    department: "MT",
                    reqRank:"2"
                },
                {
                    label: "Statistical report",
                    url: "Maintenance/report_filter_page.php",
                    section: "st",
                    imgFile: "icon/welcome_statistical_chart.png",
                    department: "MT",
                    reqRank:"1"
                },
                {
                    label: "Breakdown Chart",
                    url: "Maintenance/report_chart_main.php",
                    section: "st",
                    imgFile: "icon/welcome_bd_chart.png",
                    department: "MT",
                    reqRank:"1"
                },
                {
                    label: "รายการเครื่องจักร/อะไหล่",
                    url: "Maintenance/registry_mc_part_config.php",
                    section: "rg",
                    imgFile: "icon/welcome_mc_part_config.png",
                    department: "MT",
                    reqRank:"2"
                },
                {
                    label: "แจ้งความต้องการอะไหล่",
                    url: "Maintenance/prequest_inform.php",
                    section: "iv",
                    imgFile: "icon/welcome_request_part.png",
                    department: "MT",
                    reqRank:"2"
                },
                {
                    label: "รับสินค้า (GR)",
                    url: "Maintenance/prequest_GR.php",
                    section: "iv",
                    imgFile: "icon/welcome_gr.png",
                    department: "MT",
                    reqRank:"2"
                },
                {
                    label: "Production Dashboard",
                    url: "Production/PD_main_dashboard.php",
                    section: "pd",
                    imgFile: "icon/PD_dashboard.png",
                    department: "PD",
                    reqRank:"0"
                },
                {
                    label: "Configuration",
                    url: "Maintenance/registry_state_config.php",
                    section: "rg",
                    imgFile: "icon/welcome_setting.png",
                    department: "MT",
                    reqRank:"2"
                },
                {
                    label: "จัดการบัญชีบุคลากร",
                    url: "Maintenance/user_config.php",
                    section: "rg",
                    imgFile: "icon/welcome_user_config.png",
                    department: "MT PD",
                    reqRank:"3"
                }
            ];

            if(department_code == 1 ){
                // MT
                menuItems = menuItems.filter(item => item.department.includes("MT"));


            }else if(department_code == 2){
                //PD
                menuItems = menuItems.filter(item => item.department.includes("PD"));
            }

            const menuContainer = $("#menu-container");


            // Loop through the menu items array and generate menu items dynamically using jQuery
            menuItems.forEach(menuItem => {
                const item_section = menuItem.section;
                let section_div = page.find(`#${item_section}`);
                if (section_div.length == 0) {
                    section_div = $('<div>').attr('id', item_section).addClass("section-div");
                    section_div.append($('<label>').addClass('section-label').text(section_label[item_section]));
                    section_div.append($('<div>').addClass('section-card-div'));
                    menuContainer.append(section_div);
                }

                const section_card_div = section_div.find('.section-card-div');

                const menuDiv = $("<div>").addClass("menu-item");
                const menuImg = $("<img>").addClass("menu-img").attr('src', menuItem.imgFile);
                const menuLink = $("<div>").addClass("menu-detail");
                const menuLabel = $("<label>").addClass('menu-item-label').text(menuItem.label);

                if(usrank < menuItem.reqRank){
                    menuDiv.addClass('forbidden-operaion');
                }

                menuLink.append(menuLabel);
                menuDiv.append(menuImg, menuLink);
                section_card_div.append(menuDiv);

                menuDiv.on('click', function() {
                    if(usrank <menuItem.reqRank){
                        return;
                    }
                    location.href = menuItem.url;

                });

            });

        }
        const page = $('#pg-cont');
        generate_main_menu();

        if (department_code == 1) {
            // Ajax to update stock

            $.ajax({
                        url: '/Maintenance/global_stock_adjust.php', 
                        method: 'post',
                        success: function(data) {
                            // Just an empty success callback
                            data = JSON.parse(data);

                            if (data.status) {
                                console.log('Update_SS_OK');
                                alert('มีการปรับปรุง Safety Stock อัตโนมัติ');
                            } else {
                                throw new Error(data.err);
                            }
                        },
                        error: function(xhr, status, error) {
                            console.log(error);
                        }
                    });
        }


    });
</script>

</html>