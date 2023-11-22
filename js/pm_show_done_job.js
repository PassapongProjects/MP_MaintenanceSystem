$(document).ready(function() {
function checkProblemTable() {
    let trNum = $("#fix-detail-cont #problem-description-table tbody").find("tr").length;
    if(trNum ==1 ) {
      $noProbrow = `<tr class='no-prob-row'><td colspan='12' style='text-align:center;font-weight:bold;text-decoration:italic; background-color:#e5f4e3'>--ไม่มีรายการปัญหา--</td></tr>`;
      $("#fix-detail-cont #problem-description-table tbody .add-new-item-row").before($noProbrow);

    }else {
      $("#fix-detail-cont #problem-description-table tbody .no-prob-row").remove();
    }
  }

  function init_navAndLoad(){
    $('body').prepend('<div id="nav-container"></div>');

    $.get({url:'../global_res/global_sidebar_EN.html'}, function (htmlContent) {
        $('#nav-container').html(htmlContent);
        $.get({url:'../style/global_sidebar.css'}, function (cssContent) {
            $('<style>').attr('type','text/css').html(cssContent).appendTo('head');

            let $els = $('.menu a, .menu header');
            let count = $els.length;
            let grouplength = Math.ceil(count/3);
            let groupNumber = 0;
            let i = 1;
            $('.menu').css('--count',count+'');
            $els.each(function(j){
                if ( i > grouplength ) {
                    groupNumber++;
                    i=1;
                }
                $(this).attr('data-group',groupNumber);
                i++;
            });
        
            $('#nav-container').on('click','.menu footer button',function(e){
                e.preventDefault();
                $els.each(function(j){
                    $(this).css('--top',$(this)[0].getBoundingClientRect().top + ($(this).attr('data-group') * -15) - 20);
                    $(this).css('--delay-in',j*.1+'s');
                    $(this).css('--delay-out',(count-j)*.1+'s');
                });
                $('.menu').toggleClass('closed');
                e.stopPropagation();
            });
        
            // run animation once at beginning for demo



        });
    });

    function addLoadingCSS() {
        // Define your custom CSS rules
        $body = $("body");
        var customCSS = `
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                background: rgba(114, 114, 114, 0.8) url('https://i.stack.imgur.com/FhHRx.gif') 50% 50% no-repeat;
            }
    
            body.loading .modal {
                overflow: hidden;
            }
    
            body.loading .modal {
                display: block;
            }
        `;
        // Create a <style> element and append the CSS rules
        $('<style>')
            .attr('type', 'text/css')
            .html(customCSS)
            .appendTo('head');
            $body.append('<div class="modal"><!-- Place at bottom of page --></div>')
    }
    addLoadingCSS();
    $(document).on({
      ajaxStart: function() { $('body').addClass("loading"); },
     ajaxStop: function() { $('body').removeClass("loading"); }    
    });

}
init_navAndLoad();
$(document).on({
  ajaxStart: function() { $('body').addClass("loading"); },
 ajaxStop: function() { $('body').removeClass("loading"); }    
});

function formatDateAndTime(inputDateStr) {
    const dateParts = inputDateStr.split(" ");
    const date = dateParts[0];
    const time = dateParts[1];

    const [year, month, day] = date.split("-");
    const [hours, minutes, seconds] = time.split(":");
    return `${day}/${month}/${year} ${hours}:${minutes} น.`;
}


function formatTime(timeData) {
    const timeComponents = timeData.split(":");
    const hours = parseInt(timeComponents[0], 10);
    const minutes = parseInt(timeComponents[1], 10);
    const seconds = parseInt(timeComponents[2], 10);

    const formattedTime = `${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที`;
    return formattedTime;
}

    function formatDate(inputDate) {
        //From yyyy-mm-dd to dd/mm/yyyy
        var parts = inputDate.split("-");
        if (parts.length !== 3) {
            return "Invalid date format";
        }
        
        var year = parts[0];
        var month = parts[1];
        var day = parts[2];
        
        return day + "/" + month + "/" + year;
    }
    function disableFormElements(condition) {
        if(condition){
        $(".pm-items .checkbox").prop("disabled", true);
        }
    }



    function fetchPlanData(pmJobCode){
        $.ajax({
            url: 'fetch_pm_plan_done_detail.php', // Replace with your server-side script URL
            method: 'POST',
            data: {
                pmJobCode: pmJobCode
            },
            success: function(data) {
                let planInformation = JSON.parse(data);
                displayPlanData(planInformation);
                //disableFormElements(true);
            },
            error: function(xhr, status, error) {
                console.error('Error fetching job data:', error);
            }
        });
    }

    function displayHeaderMachineData(machineData){
        $("#plan-mcId-span-text").html("หมายเลขเครื่อง: "+machineData.machineId);
        $("#plan-mcName-span-text").html(machineData.machineName);
        $("#plan-mcLoc-span-text").html("สถานที่ตั้งเครื่อง: "+machineData.machineLoc);

    }
    function displayPlanData(jsonData) {
        // Header
        var plan_name = $("#plan_name-textbox");
        var interv = $("#plan_interval-textbox");
        var interv_unit = $("#interval-unit-select");
        var partRadioConfirm = $("#part-req-radio-confirm");
        var partRadioNo = $("#part-req-radio-no");
        var plan_description= $("#plan_desc-textbox");
        if(jsonData.planHeader.interv_unit == 'd'){
            interval_unit_text = "วัน"
        }else if(jsonData.planHeader.interv_unit =='m') {
            interval_unit_text = "เดือน";
        }else if(jsonData.planHeader.interv_unit =='y'){
            interval_unit_text ="ปี";
        }else {
            interval_unit_text = "?";
        }
        //Detail Data
        $("#plan-name-span-text").html("ชื่อแผน: "+jsonData.planHeader.plan_name);
        $("#plan-id-span-text").html("รหัสแผน: "+jsonData.planHeader.pmCode);
        $("#plan-edit-date-span-text").html(formatDate(jsonData.planHeader.edit_date));
        $("#plan-editor-span-text").html("ผู้ปรับปรุงแผน: "+jsonData.planHeader.editor);
        $("#plan-approver-span-text").html("ผู้อนุมัติแผน: "+jsonData.planHeader.approver);
        $("#interval-span-text").html("รอบการทำ: "+jsonData.planHeader.interv+" "+interval_unit_text);

        plan_name.val(jsonData.planHeader.plan_name);
        interv.val(jsonData.planHeader.interv);
        interv_unit.val(jsonData.planHeader.interv_unit);
        if(jsonData.planHeader.part_req == 1){
            partRadioConfirm.prop("checked",true);
            $('#mr-detail-container').show();
        }else{
            partRadioNo.prop("checked",true);
        }

        plan_description.val(jsonData.planHeader.plan_description);

        //Items
        $("#pm-items-table tbody").empty();
        var order = 1;
        jsonData.planItems.forEach(items => {
            let itemRow = `
            <tr class="pm-items" data-item-id="${items.id}">
            <td class="item-order" style="width: 50px;">${order}</td>
            <td class="item-topic">${items.ck_topic}</td>
            <td class="mark-items">${items.dt_clean == 1 ? '✔' : ''}</td>
            <td class="mark-items">${items.dt_test == 1 ? '✔' : ''}</td>
            <td class="mark-items">${items.dt_replace == 1 ? '✔' : ''}</td>
            <td class="mark-items">${items.dt_torque == 1 ? '✔' : ''}</td>
            <td class="mark-items">${items.dt_ovhaul == 1 ? '✔' : ''}</td>
            <td class="mark-items">${items.dt_check == 1 ? '✔' : ''}</td>
            <td class="mark-items">${items.dt_oil == 1 ? '✔' : ''}</td>
            <td class="item-work-mthd">${items.work_mthd}</td>
            <td class="item-std-check">${items.std_check}</td>
            </tr>`;
            order++;
            $("#pm-items-table tbody").append(itemRow);
        });


        // Item-fix-table
        // Display Changed Part First
        // sort order CP -> PI -> PB
    let customSortOrder = ["CP", "PI", "PB"];

// Sort the jobDetails array
    jsonData.jobDetails.sort(function(a, b) {
  var typeA = a.itm_type.toUpperCase();
  var typeB = b.itm_type.toUpperCase();
  
  // Get the index of each type in the customSortOrder array
  var indexA = customSortOrder.indexOf(typeA);
  var indexB = customSortOrder.indexOf(typeB);
  
  // If both types are in the customSortOrder array, compare their positions
  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB;
  }
  
  // If only one type is in the customSortOrder array, prioritize it
  if (indexA !== -1) {
    return -1;
  }
  if (indexB !== -1) {
    return 1;
  }
  
  // If neither type is in the customSortOrder array, compare them alphabetically
  return typeA.localeCompare(typeB);
});

        jsonData.jobDetails.forEach(problem => {
            let problemRow = ``;
            const color = problem.comple === 1 ? '#ebfbf2' : '#fdd3d3';
                const status = problem.comple ===1 ? '<b>สำเร็จ</b>' : '<b>ไม่สำเร็จ</b>';
                const statusColor =  problem.comple ===1 ? '#1e970f' : '#eb3c3c';
            if(problem.itm_type.toLowerCase() =="cp") {
                const mrCode = problem.part_mr ? problem.part_mr: 'ไม่มีรายการ';
               problemRow = `<tr data-ct="initial" class="part-changed-problem" style="background-color:${color};">
               <td><span style="color:${statusColor};">${status}</span><br>${formatDate(problem.rec_date)}</td>
               <td>เปลี่ยนอะไหล่<br>ID:${problem.part_changed}: ${problem.name}<br>รหัสเบิก:<b>${mrCode}</b></td>
               <td>จำนวน<br>${problem.partUsedQuan || '-'} ${problem.part_unit}</td>
               <td>${problem.item_problem}</td>
               <td>${problem.item_sol}</td>
               `;
            }else {
                // Plan Item and Custom Item Row
                problemRow = `<tr data-ct="initial" class="part-changed-problem" style="background-color:${color};">
               <td><span style="color:${statusColor};">${status}</span><br>${formatDate(problem.rec_date)}</td>
               <td>${problem.ck_topic}</td>
               <td>${problem.wk_method}</td>
               <td>${problem.item_problem}</td>
               <td>${problem.item_sol}</td>
               `;

            }
            
            $('#problem-description-table tbody').append(problemRow);
        })
// Handle Assigned Mechanic & Record Mechanic

        $('#plannedDateVal').html(formatDate(jsonData.jobTimeData.plannedDate));
        $('#actDateVal').html(formatDateAndTime(jsonData.jobTimeData.actDate));
        $('#doneDateVal').html(formatDateAndTime(jsonData.jobTimeData.doneDate));
        $('#jobTimeVal').html(formatTime(jsonData.jobTimeData.totalTime));
        let recEngVal = jsonData.jobTimeData.recEngId ? `${jsonData.jobTimeData.recEngId}: ${jsonData.jobTimeData.recEngName} ${jsonData.jobTimeData.recEngSurname}` : 'ผิดพลาด';
        $('#doneEngVal').html(recEngVal);

        if(jsonData.assignedEng) {
            $("#asg-eng-cont .no-asg-eng-row").remove();
            jsonData.assignedEng.forEach(asg_eng => {  
                let asg_row = `
                <tr class='add-asg-eng-row'>
                <td>${asg_eng.empId}</td>
                <td colspan="2" style="font-size:14px;">${asg_eng.empName} ${asg_eng.empSurname}</td>
                <td>${asg_eng.tel_number}</td>
               
                </tr>
                `;

                $("#asg-eng-cont tbody").append(asg_row);
            });

        }

       
           
        }   


        window.fetchPlanData = fetchPlanData;
    window.displayHeaderMachineData = displayHeaderMachineData;
        })