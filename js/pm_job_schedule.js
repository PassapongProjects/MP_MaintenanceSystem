
$(document).ready(function() {
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
  

  
  function convertToThaiDate(inputDate) {
    // Parse the input date string
    const parts = inputDate.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    // Create a Date object
    const date = new Date(year, month - 1, day); // Month is zero-based

    // Options for formatting as a Thai date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    
    // Convert to Thai date string
    const thaiDate = date.toLocaleDateString('th-TH', options);

    return thaiDate;
}

  function savingPlan(state) {
    // Check validatopn of all input field 
    // -> Both new plan and update should have the same field value.
    let sideDiv = $(".side-div");
    let planId = sideDiv.find("#pmPlanSelect").val();
    let mcId = sideDiv.find("#mcSelect").val();
    let planDate = sideDiv.find("#plan-date").val(); //(yyyy-mm-dd)
    let jobId = sideDiv.find("#scheduledJobId").val();
    let engIdArray = [];

    sideDiv.find("#asg-eng-table .eng-row").each(function () {
      let engId = $(this).attr("data-engId");
      if (engId != "") {
      engIdArray.push(engId);
      }
    });

    if (planId && mcId && planDate) {
      // Data to be sent is ready.

      let scheduleInformation = {"jobId":jobId,"planId":planId,"mcId":mcId,"planDate":planDate,"asgEngId":engIdArray,"state":state};

      $.ajax({
            url: 'fetch_pm_job_schedule.php', // Replace with your server-side script URL
            method: 'POST',
            data: { requiredTopic: [{"name":"editJobSchedule","arg":scheduleInformation}]
          },
            success: function(data) {
              response = JSON.parse(data);
              if(response.editJobSchedule) {
                alert("บันทึกสำเร็จ");
                location.reload();
              }else {
                alert("มีการบันทึกข้อมูลที่ผิดพลาด กรุณาลองอีกครั้งหลังรีเฟรช");
                location.reload();
              }
                
            },
            error: function(xhr, status, error) {
                console.error('Error fetching job data:', error);
            }
        });

    } else {
      alert("ข้อมูลไม่ครบถ้วน");
      return false;
    }
  
  
  }


  $(".side-div").on("click",".edit-btn",function() {
    if($(this).attr("id") =="newPlan-save-btn") {
      savingPlan("new");
    }else if($(this).attr("id") =="updatePlan-save-btn") {
      savingPlan("update");
    }else if($(this).attr("id") =="deletePlan-save-btn") {
      if(confirm("ยืนยันที่จะยกเลิกแผน PM นี้")){
      savingPlan("delete");
      }
    }
    
  })

  function displayAssignedEmployeeTable(divId) {
    let empAsgSideDivHtml = `
    <div id="asg-eng-div">
    <div class="borderdiv">
    <div class="header-label-cont"> 
    <label class="header-label">ช่างได้รับมอบหมาย</label>
    </div>
    <div id="asg-eng-table-cont">
    <table id="asg-eng-table">
  <thead>
    <tr>
    <th>ลำดับ</th>
    <th>พนักงาน</th>
    <th colspan="2">ชื่อ - นามสกุล</th>
    </tr>
  </thead>
  <tbody>
    <tr class="eng-row" data-engId="">
    <td class="td-order">1</td>
    <td class="td-operation"><select class="eng-selection">
    <option value="" selected disabled>-เลือก-</option>
    </select></td>
    <td colspan="2" class="td-engName">--</td>
    </tr>
  <tr id="add-eng-row">
  <td colspan="4"><button type="button" id="add-asgn-eng-but" disabled>เพิ่มช่าง</button></td>
  </tr>

  </tbody>

    </table>
    </div>
    <div class="edit-btn-cont">
    <button type="button" id="newPlan-save-btn" class="edit-btn">บันทึก</button>
    </div>
    </div>

    </div>
    
<!-- END ASG JOB DIV -->`;
    let divContainer = $("#"+divId);
    divContainer.hide();
    divContainer.html(empAsgSideDivHtml);



    let jobId =  $(".side-div #scheduledJobId").val()
    if(jobId != "") {
      // Update Plan 
      divContainer.find("#newPlan-save-btn").attr("id","updatePlan-save-btn");
      divContainer.find("#newPlan-save-btn").text("อัพเดท");
      divContainer.find(".edit-btn-cont").append(`<button type="button" id="deletePlan-save-btn" class="edit-btn">ลบงาน</button>`);
      $.ajax({
        url: 'fetch_pm_job_schedule.php',
        method: 'POST',
        data: { requiredTopic: [{"name":"fetchAssignedEng", "arg": {"pmCode":jobId}}]
      },
        success: function (data) {
          let response = JSON.parse(data);
          if (response.status && response.fetchAssignedEng != null) {
            if(response.fetchAssignedEng.length >=1) {

            response.fetchAssignedEng.forEach(asg_eng => {
              let addempRow = ` 
              <tr class="eng-row added-eng-row" data-engId="${asg_eng.empId}">
              <td class="td-order">1</td>
              <td class="td-operation"><button class='del-asg-but'>ลบ</button></td>
              <td colspan="2" class="td-engName">รหัส: ${asg_eng.empId} ${asg_eng.empName} ${asg_eng.empSurname}</td>
              </tr>`;
              
              $(".side-div #asg-eng-table tbody tr:nth-last-child(2)").before(addempRow);

            });

            $(".side-div #asg-eng-table .eng-row").each(function(index) {
              $(this).find("td.td-order").text(index + 1);
          })

          fetch_eng_table()
          .then(function(employeeData) {
      
            let selector = divContainer.find("#asg-eng-table .eng-selection");
            selector.html(`<option value="" selected disabled>-เลือก-</option>`);
            allemp = employeeData;
            employeeData.forEach(eng => {
             selector.append($('<option>', {
                value: eng.empID,
                text: "รหัส: "+ eng.empID + ": " + eng.empName
                
            }))
            });
            validateSelectEng();
      
          })
          .catch(function(error) {
            console.error('Error fetching employee data:', error);
          });


          
        }else {console.log("No assigned_emp");}
          }else {
            //console.log("Invalid Fetching Assigned Employee or null returned");
        }
          
        },
        error: function (xhr, status, error) {
          reject(error); // Reject the promise in case of an error
        }
      });


    }

    fetch_eng_table()
          .then(function(employeeData) {
      
            let selector = divContainer.find("#asg-eng-table .eng-selection");
            selector.html(`<option value="" selected disabled>-เลือก-</option>`);
            allemp = employeeData;
            employeeData.forEach(eng => {
             selector.append($('<option>', {
                value: eng.empID,
                text: "รหัส: "+ eng.empID + ": " + eng.empName
                
            }))
            });
      
          })
          .catch(function(error) {
            console.error('Error fetching employee data:', error);
          });

   
    
    divContainer.show();
  }
  

  // function fetch_eng_table () {

  //   $.ajax({
  //     url: 'fetch_pm_job_schedule.php', // Replace with your server-side script URL
  //     method: 'POST',
  //     data: { requiredTopic: [{"name":"employeeData"}]
  //   },
  //     success: function(data) {
  //         // Render the updated job dashboard with the latest job data
  //         response = JSON.parse(data);
  //         if(response.status) {
  //          employee = response.employeeData;
  //         }
  //         else {employee = [];}
  //     },
  //     error: function(xhr, status, error) {
  //         console.error('Error fetching job data:', error);
  //     }
  // });
  

  // }

  function fetch_eng_table() {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: 'fetch_pm_job_schedule.php',
        method: 'POST',
        data: { requiredTopic: [{ "name": 'employeeData' }] },
        success: function (data) {
          const response = JSON.parse(data);
          if (response.status) {
            const employee = response.employeeData;
            resolve(employee); // Resolve the promise with the employee data
          } else {
            resolve([]); // Resolve with an empty array if no data is available
          }
        },
        error: function (xhr, status, error) {
          reject(error); // Reject the promise in case of an error
        }
      });
    });
  }
 
  
  function displayPlanEdit(divId) {
    let divContainer = $("#"+divId);
    

    let jobEditSideDivHtml = `<div id="edit-job-div" class="selectorDiv">
    <div class="borderdiv">
  <div class="header-label-cont">
  <label class="header-label">แก้ไขตารางงาน PM</label>
  </div>
  <input type="hidden" id="scheduledJobId" value="">
  
  <select id="mcSelect" data-state="edit_mode">
    <option value="" selected disabled>-เลือกเครื่อง-</option>
  </select>
  <select id="pmPlanSelect" disabled>
    <option value="" selected disabled>-เลือกแผน-</option>
  </select>
  <label for="plan-date">วันที่จะดำเนินการ</label>
  <input type="text" id="plan-date" class="flatpickr plan-date-input" disabled>
  <span class="plan-name-text"></span>
  <span class="plan-desc-text"></span>
  <span class="plan-intrv-text"></span>
  <span class="mc-name-text"></span>
  </div>
  </div>`;

    
    divContainer.html(jobEditSideDivHtml);
    flatpickr(".flatpickr", {
      altInput: true,
      altFormat: "d F Y",
      locale: {
          firstDayOfWeek: 1, // Monday as the first day of the week
          weekdays: {
              shorthand: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
              longhand: [
                  'อาทิตย์',
                  'จันทร์',
                  'อังคาร',
                  'พุธ',
                  'พฤหัสบดี',
                  'ศุกร์',
                  'เสาร์',
              ],
          },
          months: {
              shorthand: [
                  'ม.ค.',
                  'ก.พ.',
                  'มี.ค.',
                  'เม.ย.',
                  'พ.ค.',
                  'มิ.ย.',
                  'ก.ค.',
                  'ส.ค.',
                  'ก.ย.',
                  'ต.ค.',
                  'พ.ย.',
                  'ธ.ค.',
              ],
              longhand: [
                  'มกราคม',
                  'กุมภาพันธ์',
                  'มีนาคม',
                  'เมษายน',
                  'พฤษภาคม',
                  'มิถุนายน',
                  'กรกฎาคม',
                  'สิงหาคม',
                  'กันยายน',
                  'ตุลาคม',
                  'พฤศจิกายน',
                  'ธันวาคม',
              ],
          },
      },
      dateFormat: 'Y-m-d', // Custom Thai date format
      minDate: 'today', // Limit end date to today
      defaultDate: 'today',
  });
  
    let planSelector = $("#"+divId+" #pmPlanSelect");

    let mcSelector = $("#"+divId+" #mcSelect");

    $(".plan-name-text").html("<u>ชื่อแผน:</u> "+"-");
    $(".plan-desc-text").html("<u>รายละเอียดแผน:</u> "+"-");
    $(".plan-intrv-text").html("<u>รอบการทำ:</u> "+"-");
    $(".mc-name-text").html("<u>เครื่องจักร</u>: "+"-");
    $.ajax({
      url: 'fetch_pm_job_schedule.php',
      type: 'POST',
      data: { requiredTopic: [{"name":"machineData"}]
      },
      success: function(response) {
          response = JSON.parse(response);
          if(response.status){
          // Append Machine Option
          response.machineData.forEach(machine => {
              
            mcSelector.append($('<option>', {
              value: machine.mc_id,
              text: machine.mc_id + ": " + machine.mc_name
          }));

          });

          }
      },
      error: function(xhr, status, error) {
          console.error('AJAX Error:', error);
      }
  });
  //   $.ajax({
  //     url: 'fetch_pm_job_schedule.php',
  //     type: 'POST',
  //     data: { requiredTopic: [{"name":"pmJobData"},{"name":"machineData"}]
  //     },
  //     success: function(response) {
  //         response = JSON.parse(response);
  //         if(response.status){

  //         jobData=response.pmJobData;
  //         // Append Machine Option
  //         response.machineData.forEach(machine => {
              
  //           mcSelector.append($('<option>', {
  //             value: machine.mc_id,
  //             text: machine.mc_id + ": " + machine.mc_name,
  //         }));

  //         });
         

  //         }
  //     },
  //     error: function(xhr, status, error) {
  //         console.error('AJAX Error:', error);
  //     }
  // });


  }

  
   // Call this function to initiate the data retrieval and logging
  

  function displayPlanCreation(divId) {

    let jobCreationSideDivHtml = `<div id="new-job-div" class="selectorDiv">
    <div class="borderdiv">
  <div class="header-label-cont">
  <label class="header-label">กำหนดแผน PM ใหม่</label>
  </div>
  <input type="hidden" id="scheduledJobId" value="">
  
  <select id="mcSelect" data-state="new_mode">
    <option value="" selected disabled>-เลือกเครื่อง-</option>
  </select>
  <select id="pmPlanSelect" disabled>
    <option value="" selected disabled>-เลือกแผน-</option>
  </select>
  <label for="plan-date">วันที่จะดำเนินการ</label>
  <input type="text" id="plan-date" class="flatpickr plan-date-input" disabled>
  <span class="plan-name-text"></span>
  <span class="plan-desc-text"></span>
  <span class="plan-intrv-text"></span>
  <span class="mc-name-text"></span>
  </div>
  </div>`;

    let divContainer = $("#"+divId);
    divContainer.html(jobCreationSideDivHtml);
    flatpickr(".flatpickr", {
      altInput: true,
      altFormat: "d F Y",
      locale: {
          firstDayOfWeek: 1, // Monday as the first day of the week
          weekdays: {
              shorthand: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
              longhand: [
                  'อาทิตย์',
                  'จันทร์',
                  'อังคาร',
                  'พุธ',
                  'พฤหัสบดี',
                  'ศุกร์',
                  'เสาร์',
              ],
          },
          months: {
              shorthand: [
                  'ม.ค.',
                  'ก.พ.',
                  'มี.ค.',
                  'เม.ย.',
                  'พ.ค.',
                  'มิ.ย.',
                  'ก.ค.',
                  'ส.ค.',
                  'ก.ย.',
                  'ต.ค.',
                  'พ.ย.',
                  'ธ.ค.',
              ],
              longhand: [
                  'มกราคม',
                  'กุมภาพันธ์',
                  'มีนาคม',
                  'เมษายน',
                  'พฤษภาคม',
                  'มิถุนายน',
                  'กรกฎาคม',
                  'สิงหาคม',
                  'กันยายน',
                  'ตุลาคม',
                  'พฤศจิกายน',
                  'ธันวาคม',
              ],
          },
      },
      dateFormat: 'Y-m-d', // Custom Thai date format
      minDate: 'today', // Limit end date to today
      defaultDate: 'today',
  });
  
    let planSelector = $("#"+divId+" #pmPlanSelect");

    let mcSelector = $("#"+divId+" #mcSelect");

    $(".plan-name-text").html("<u>ชื่อแผน:</u> "+"-");
    $(".plan-desc-text").html("<u>รายละเอียดแผน:</u> "+"-");
    $(".plan-intrv-text").html("<u>รอบการทำ:</u> "+"-");
    $(".mc-name-text").html("<u>เครื่องจักร</u>: "+"-");

    $.ajax({
      url: 'fetch_pm_job_schedule.php',
      type: 'POST',
      data: { requiredTopic: [{"name":"planHeaderData"},{"name":"machineData"}]
      },
      success: function(response) {
          response = JSON.parse(response);
          if(response.status){
            // Append Plan Option
            response.planHeaderData.forEach(pmPlanHeader => {

              planSelector.append($('<option>', {
                value: pmPlanHeader.planId,
                text: pmPlanHeader.planId + ": " + pmPlanHeader.planName
            }));

            });
            
          // Append Machine Option

          response.machineData.forEach(machine => {
              
            mcSelector.append($('<option>', {
              value: machine.mc_id,
              text: machine.mc_id + ": " + machine.mc_name,
          }));

          });
         


          }
      },
      error: function(xhr, status, error) {
          console.error('AJAX Error:', error);
      }
  });
  
 
  
  }

function planDetailViewBtnClick(planId,planVer) {
  if (confirm("ต้องการดูรายละเอียดแผน?")) {
    location.href = `pm_plan_view_edit.php?planId=${planId}&planVer=${planVer}`;
  }
}
$("#calendar").on("click",".plan-view-btn-tooltip",function(){
  let eventElement = $(this).closest(".popout");
  let planId = eventElement.find(".planId-view-box").val();
  let planVer = eventElement.find(".planVer-view-box").val();
  planDetailViewBtnClick(planId,planVer);
})
function calendarLoad() {

  var calendarEl = document.getElementById("calendar");
var calendar = new FullCalendar.Calendar(calendarEl, {

  eventMouseEnter: function(info) {
    var tooltips = document.getElementsByClassName('popout');
    for (var i = 0; i < tooltips.length; i++) {
      tooltips[i].remove();
    }
    var tooltip = document.createElement('div');
    let description = `
    <input type="hidden" class="jobCodeId" value="${info.event.extendedProps.jobCode}">
    <input type="hidden" class="planId-view-box" value="${info.event.extendedProps.planId}">
    <input type="hidden" class="planVer-view-box" value="${info.event.extendedProps.planVer}">
    <ol class="infolist">
        <li><b>รหัสงาน:</b> ${info.event.extendedProps.jobCode}</li>
        <li><b>รหัสแผน:</b> ${info.event.extendedProps.planId}</li>
        <li><b>ชื่อแผน:</b> ${info.event.extendedProps.planName}</li>
        <li><b>รายละเอียดแผน:</b> ${info.event.extendedProps.planDesc}</li>
        <li><b>version:</b> ${info.event.extendedProps.planVer}</li>
        <li><b>รหัสเครื่อง:</b> ${info.event.extendedProps.mcId}</li>
        <li><b>ชื่อเครื่อง:</b> ${info.event.extendedProps.mcName}</li>
        <li><b>สถานะงาน:</b> ${info.event.extendedProps.jobStatus}</li>
    </ol>`;

    let planViewBtn = `<div class="plan-view-btn-tooltip-cont"><button type='button' class="plan-view-btn-tooltip">รายการตรวจเช็ค</button></div>`;
      tooltip.className = 'popout';
      tooltip.innerHTML = description + planViewBtn; // Replace with your property name
      
      info.el.appendChild(tooltip);
    
  },

  eventMouseLeave: function(info) {
    var tooltips = document.getElementsByClassName('popout');
    for (var i = 0; i < tooltips.length; i++) {
      tooltips[i].remove();
    }
  },
  eventClick: function(info) {
    info.jsEvent.preventDefault();
        
        // Check if the clicked element is the custom button
        if ($(info.jsEvent.target).hasClass('plan-view-btn-tooltip')) {
            // Call your custom function here
            info.jsEvent.target.trigger("click");
        }else {
    let pmCode = info.event.extendedProps.jobCode;
    let jobStatus = info.event.extendedProps.jobStatus;
    if(jobStatus=='planned') {
    $(".side-div").html("");
    $(".side-div").css("flex-direction","");
    displayPlanEdit("left-side-div-cont");
    $(".side-div #scheduledJobId").val(pmCode)
                                  .trigger('change');
    }else if(jobStatus=='done') {
      // GOTO Done Page sending get data
      if(confirm("ต้องการแสดงหน้ารายละเอียดงาน?")){
      location.href = `pm_show_done_job.php?pmJobCode=${pmCode}`;
      }

    }
  }
                         
                            

  },
  eventDrop: function(info) {
    let jobCode = info.event.extendedProps.jobCode;
    let newDate = info.event.startStr
    $.ajax({
      url: 'fetch_pm_job_schedule.php', // Replace with your server-side script URL
      method: 'POST',
      data: { requiredTopic: [{"name":"dropEventSchedule","arg":{"pmCode":jobCode,"newDateStr":newDate}}]
    },
      success: function(data) {
        response = JSON.parse(data);
        if(response.dropEventSchedule) {
          alert("เปลี่ยนวันสำเร็จ");
          
        }else {
          alert("มีการบันทึกข้อมูลที่ผิดพลาด กรุณาลองอีกครั้งหลังรีเฟรช");
          location.reload();
        }
          
      },
      error: function(xhr, status, error) {
          console.error('Error fetching job data:', error);
      }
  });
  },
  eventConstraint: {
    start: new Date().toISOString().substr(0, 10) // Today's date in ISO format (YYYY-MM-DD)
  },
  eventDragStop:function(info){
    var tooltips = document.getElementsByClassName('popout');
    for (var i = 0; i < tooltips.length; i++) {
      tooltips[i].remove();
    }
  },
    initialView: 'dayGridMonth',
    });
   
      
  $.ajax({
    url: 'fetch_pm_job_schedule.php',
    type: 'POST',
    data: { requiredTopic: [{"name":"pmJobData"}]
    },
    success: function(response) {
        response = JSON.parse(response);
        if(response.status){
          pmItemData = response.pmJobData;
        jobData=response.pmJobData;
        // Append Machine Option
        pmJobsSrc = [];
        jobData.forEach(pmJob => {
          let status = pmJob.jobStatus;
          let statusCode;
          let color;
          let backgroundColor;
          let borderColor;
          if(status=='done'){
            statusCode = 'done';
            backgroundColor = 'lightgray';
            borderColor = 'gray';
            color = 'black';
            editable=false;
          }else if(status=='planned'){
            statusCode = 'planned';
            backgroundColor = '#D4FFC3';
            borderColor = 'green';
            color = 'black';
            editable=true;
          }else if(status=='processing'){
            statusCode ='processing';
            backgroundColor = 'lightblue';
            borderColor = 'blue';
            color = 'black';
            editable = false;
            
          }else {
            statusCode='error';
            backgroundColor = 'red';
            borderColor = 'red';
            color = 'red';
          }

          pmJobsSrc.push({
            id:pmJob.pmJobCode,
            title: pmJob.pmJobCode + " เครื่อง: "+pmJob.job_mc_id,
            start: pmJob.plannedDate,
            classNames:"eventObject",
            textColor:color,
            backgroundColor:backgroundColor,
            borderColor:borderColor,
            allDay: true,
            editable: false,
            startEditable: editable,
            extendedProps: {
              jobCode: pmJob.pmJobCode,
              planId: pmJob.planId,
              planName: pmJob.planName,
              planDesc:pmJob.planDesc,
              planVer: pmJob.planVer,
              mcId: pmJob.job_mc_id,
              mcName: pmJob.mcName,
              jobStatus: statusCode
            }

          });

        });
        

        calendar.addEventSource(pmJobsSrc);
        }
    },
    error: function(xhr, status, error) {
        console.error('AJAX Error:', error);
    }
});
calendar.render();
}

 $(".side-div").on("change","#mcSelect", function () {
        let pmPlanSelector = $(".side-div #pmPlanSelect");
        let planDateInput = $(".side-div .plan-date-input");
        let mcSelect = $(".side-div #mcSelect");
        pmPlanSelector.val("");
        pmPlanSelector.prop("disabled",false);
        planDateInput.prop("disabled",true);
        $(".side-div #scheduledJobId").val("");
        $(".plan-name-text").html("<u>ชื่อแผน:</u> "+"-");
        $(".plan-desc-text").html("<u>รายละเอียดแผน:</u> "+"-");
        $(".plan-intrv-text").html("<u>รอบการทำ:</u> "+"-");
        $(".mc-name-text").html("<u>เครื่องจักร</u>: "+"-");
        $("#right-side-div-cont").html(""); 
        
        
        if($(this).attr("data-state") == "edit_mode") {
          
          pmPlanSelector.html(`<option value="" selected disabled>-เลือกแผน-</option>`);
          jobData.forEach(job => {
            if (job.job_mc_id == mcSelect.val() && job.jobStatus =="planned") {
            pmPlanSelector.append($('<option>', {
              value: job.planId,
              text: job.planId + ": " + job.planName
          }))

          
        }
          });
          if(pmPlanSelector.find("option").length ==1) {
            pmPlanSelector.find("option[value='']").text("--ไม่มีแผนที่ดำเนินอยู่--");
          }


        }
      
        

      });
      $('.side-div').on("change","#scheduledJobId",function(){
       if($(this).val() != "") {
        $(this).closest(".side-div").find("select").prop("disabled",true);
        let pmPlanSelector = $(".side-div #pmPlanSelect");
        let planDateInput = $(".side-div .plan-date-input");
        let mcSelector = $(".side-div #mcSelect");
        jobData.forEach(job => {
          if(job.pmJobCode == $(this).val()) {
            mcSelector.html("");
            mcSelector.val(job.job_mc_id);
            mcSelector.append($('<option>', {
              value: job.job_mc_id,
              text: job.job_mc_id + ": " + job.mcName,
          }))

            pmPlanSelector.html("");
            pmPlanSelector.append($('<option>', {
              value: job.planId,
              text: job.planId + ": " + job.planName
          }))
            pmPlanSelector.val(job.planId);
            pmPlanSelector.trigger('change');
            planDateInput.val(job.plannedDate);
          }
        });
        // ERROR DUPLICATE EMPLOYEE
        // displayAssignedEmployeeTable("right-side-div-cont");
       }
  })


      $(".side-div").on("change","#pmPlanSelect", function () {
        let pmPlanSelector = $(".side-div #pmPlanSelect");
        let planDateInput = $(".side-div .plan-date-input");
        let mcSelector = $(".side-div #mcSelect");
        $(".side-div #scheduledJobId").val("");
        if(pmPlanSelector.val() != "") {
        // Check if Already Planned
        if(mcSelector.attr("data-state")=="new_mode"){
        $.ajax({
          url: 'fetch_pm_job_schedule.php',
          type: 'POST',
          data: { requiredTopic: [{"name":"pmJobData", "arg": {"planId": pmPlanSelector.val(),"mc_id":mcSelector.val()}}]
          },
          success: function(response) {
              response = JSON.parse(response);
              if(response.status  && response.pmJobData[0].jobStatus =="planned"){
                // Append Plan Option
                if(response.pmJobData.length ==1) {
                  // Already Planned Job
                  let information = response.pmJobData[0];
                  planDateInput.prop("disabled",true);
                  let confirmMsg = `แผน: ${information.planName}\n\nสำหรับเครื่อง: รหัส ${information.mc_id}: ${information.mcName}\n\nมีการลงตารางการทำไว้แล้ว\n
                  รหัสงาน: ${information.pmJobCode}
                  วันที่: ${convertToThaiDate(information.plannedDate)}\n\nต้องการแก้ไขงานแทนหรือไม่`;
                  if(confirm(confirmMsg)) {
                    // Pass Information To Edit Planned Job

                    $(".side-div").html("");
                    $(".side-div").css("flex-direction","");
                    displayPlanEdit("left-side-div-cont");
                    $(".side-div #scheduledJobId").val(information.pmJobCode)
                                                  .trigger('change');

                  }else {
                    alert("ยกเลิกการสร้างงาน");
                    $(".side-div").html("");
                    $(".side-div").css("flex-direction","");
                    displayPlanCreation("left-side-div-cont");
                  }
                }
    
              }else {
                // No Planned Job
                
                $.ajax({
                  url: 'fetch_pm_job_schedule.php',
                  type: 'POST',
                  data: { requiredTopic: [{"name":"planHeaderData","arg":{"planId":pmPlanSelector.val()}}]
                  },
                  success: function(response) {
                      response = JSON.parse(response);
                      if(response.status){
                  let planInformation = response.planHeaderData[0];
                  planDateInput.prop("disabled",false);

                  if(planInformation.planInterv_unit == 'd'){
                    interval_unit_text = "วัน"
                }else if(planInformation.planInterv_unit =='m') {
                    interval_unit_text = "เดือน";
                }else if(planInformation.planInterv_unit =='y'){
                    interval_unit_text ="ปี";
                }else {
                    interval_unit_text = "?";
                }

                  $(".plan-name-text").html("<u>ชื่อแผน:</u> "+planInformation.planName);
                  $(".plan-desc-text").html("<u>รายละเอียดแผน:</u> "+planInformation.planDesc);
                  $(".plan-intrv-text").html("<u>รอบการทำ:</u> "+planInformation.planInterv+" "+interval_unit_text);
                  $(".mc-name-text").html("<u>เครื่องจักร:</u> "+$(".side-div #mcSelect option:selected").text());

                  displayAssignedEmployeeTable("right-side-div-cont");
                      }
                  },
                  error: function(xhr, status, error) {
                      console.error('AJAX Error:', error);
                  }
              });
                  
                
              }
          },
          error: function(xhr, status, error) {
              console.error('AJAX Error:', error);
          }
      });
    }else if(mcSelector.attr("data-state")=="edit_mode"){
      let jobCode = "";
      jobData.forEach(job => {
        if(job.planId == pmPlanSelector.val() && job.job_mc_id == mcSelector.val()) {
          jobCode = job.pmJobCode;
          $(".side-div #scheduledJobId").val(jobCode);
          $(this).closest(".side-div").find("select").prop("disabled",true);
          return;
        }
      });
      if($(".side-div #scheduledJobId").val==""){
      alert("ข้อมูลผิดพลาดกรุณารีเฟรช"); 
      location.reload();
      return;
      }

      $.ajax({
        url: 'fetch_pm_job_schedule.php',
        type: 'POST',
        data: { requiredTopic: [{"name":"planHeaderData","arg":{"planId":pmPlanSelector.val()}}]
        },
        success: function(response) {
            response = JSON.parse(response);
            if(response.status){
        let planInformation = response.planHeaderData[0];
        planDateInput.prop("disabled",false);

        if(planInformation.planInterv_unit == 'd'){
          interval_unit_text = "วัน"
      }else if(planInformation.planInterv_unit =='m') {
          interval_unit_text = "เดือน";
      }else if(planInformation.planInterv_unit =='y'){
          interval_unit_text ="ปี";
      }else {
          interval_unit_text = "?";
      }

        $(".plan-name-text").html("<u>ชื่อแผน:</u> "+planInformation.planName);
        $(".plan-desc-text").html("<u>รายละเอียดแผน:</u> "+planInformation.planDesc);
        $(".plan-intrv-text").html("<u>รอบการทำ:</u> "+planInformation.planInterv+" "+interval_unit_text);
        $(".mc-name-text").html("<u>เครื่องจักร:</u> "+$(".side-div #mcSelect option:selected").text());
        displayAssignedEmployeeTable("right-side-div-cont");
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', error);
        }
    });


    }
      
    }
      });


      function validateSelectEng() {
        let engIdArray = [];
        $(".side-div #asg-eng-table .eng-row").each(function () {
          let engId = $(this).attr("data-engId");
          if (engId != "") {
          engIdArray.push(engId);
          }
        });
        $(".side-div #asg-eng-table .eng-selection option").each(function () {
          let optionValue = $(this).val();
          // Check if the selected value is in the engIdArray
          $(this).prop("disabled",false);
          if ($.inArray(optionValue, engIdArray) !== -1) {
              // Disable the option with the selected value
              $(this).prop("disabled",true);
          }
      });
      }

      function validateNewRow () {
        let latestRow = $(".side-div #asg-eng-table tr:eq(-2)");
        

        $(".side-div #asg-eng-table .eng-row").each(function(index) {
          $(this).find("td.td-order").text(index + 1);
      })
          latestRow.find(".eng-selection").html(`<option value="" selected disabled>-เลือก-</option>`);
          allemp.forEach(eng => {
            latestRow.find(".eng-selection").append($('<option>', {
              value: eng.empID,
              text: "รหัส: "+ eng.empID + ": " + eng.empName
          }))

          });
          validateSelectEng();
      
      }
      $(".side-div").on("click", "#asg-eng-table #add-asgn-eng-but", function() {

        let latestRow = $(".side-div #asg-eng-table tr:eq(-2)");
        
        if(latestRow.find(".del-asg-but").length == 0) {
          // IF before low is not selected -> dont add
          return;
        }
        // Addrow -> Retreive EngID -> Remove (Will cause error if selected value still exists -> change selected items to delete button)
        // New Row still needs to be appended.
        // After 
        let newrow = `<tr class="eng-row" data-engId="">
        <td class="td-order">0</td>
        <td class="td-operation"><select class="eng-selection">
        <option value="" selected disabled>-เลือก-</option>
        </select></td>
        <td colspan="2" class="td-engName">--</td>
        </tr>`;
        
        
        $(".side-div #asg-eng-table #add-eng-row").before(newrow); // add new row

        $(".side-div #asg-eng-table #add-asgn-eng-but").prop("disabled",true);
        validateNewRow();

        $(".side-div #asg-eng-table .del-asg-but").prop("disabled",false);

      });

      $(".side-div").on("change", "#asg-eng-table .eng-selection",function () {
        let thisrow = $(this).closest(".eng-row");
        thisrow.attr("data-engId",$(this).val());
        thisrow.find(".td-operation").html("<button class='del-asg-but'>ลบ</button>")
        $(".side-div #asg-eng-table #add-asgn-eng-but").prop("disabled",false);
        allemp.forEach(eng => {
          if(eng.empID == $(this).val()){
            thisrow.find(".td-engName").html("รหัส: "+eng.empID+" "+eng.empName+" "+eng.empSurname)
          }
        });
        

      })

      $(".side-div").on("click", "#asg-eng-table .del-asg-but",function () {
        if ($(".side-div #asg-eng-table").find(".eng-row").length ==1) {
          return;
        }
        if ($(".side-div #asg-eng-table").find(".eng-row").length ==2) {
          let index = $('.side-div #asg-eng-table .del-asg-but').index(this);
        // Select the other button by its index (for example, the first button)
          let lastDelBut= $('.side-div #asg-eng-table .del-asg-but').eq(1 - index);
          
          lastDelBut.prop("disabled",true);
        }
        let thisrow = $(this).closest(".eng-row");
        thisrow.remove();
        $(".side-div #asg-eng-table .eng-row").each(function(index) {
          $(this).find("td.td-order").text(index + 1);
      })
      validateSelectEng();
      })



      $("#create-plan").click(function() {
        // Call your JavaScript function for creating a plan
        $(".side-div").html("");
        $(".side-div").css("flex-direction","");
        displayPlanCreation("left-side-div-cont");
    });

    // Function to handle "Edit Plan" click
    $("#edit-plan").click(function() {
        // Call your JavaScript function for editing a plan
        $(".side-div").html("");
        $(".side-div").css("flex-direction","");
        displayPlanEdit("left-side-div-cont");
    });

    // Function to handle "Update Plan" click
    $("#update-plan").click(function() {
        // Call your JavaScript function for updating a plan
        location.href="pm_plan_creation.php";
    });
    $("#view-part").click(function() {
      // Call your JavaScript function for creating a plan
      displayTotalPartMode();
  });


    //Handle PartBox
    $(".side-div").on("change","#intervSelect",function() {
      $(".side-div").find(".partUse-tbl-cont, .header-label-cont").remove();
      let val = $(this).val();
      loadPartandPlan(val).done(function(data){
        displayPartUse("left-side-div-cont");
        $("#left-side-div-cont .header-label-cont label").html(`อะไหล่ที่ใช้ล่วงหน้า ${val} สัปดาห์`);
        displayPartBuyMore("right-side-div-cont");

      });
    });

    function displayTotalPartMode() {
      $(".side-div").css("flex-direction","column");
      $(".side-div").html("");
      $("#left-side-div-cont").html(`<div class="header-label-group-cont">
      <select id="intervSelect">
      <option value="1">1 สัปดาห์</option>
      <option value="2">2 สัปดาห์</option>
      <option value="3">3 สัปดาห์</option>
      <option value="4" selected>4 สัปดาห์</option>
      <option value="5">5 สัปดาห์</option>
      <option value="6">6 สัปดาห์</option>
      </select>
      </div>`);
      loadPartandPlan(4).done(function(data){
        displayPartUse("left-side-div-cont");
        displayPartBuyMore("right-side-div-cont");
      });
      

    }
    function displayPartUse(divId) {
      let divContainer = $("#"+divId);
      let tableHtml = `
      <div class="header-label-cont"><label>อะไหล่ที่ใช้ล่วงหน้า 4 สัปดาห์</label></div>
      <div class="partUse-tbl-cont">
      <table class="partUse-tbl">
      <thead>
        <tr>
          <th>วันที่</th>
          <th>งาน</th>
          <th colspan="2">อะไหล่</th>
          <th>ใช้</th>
          <th>คงเหลือ</th>
        </tr>
      </thead>
      <tbody>
       
      </tbody>
      </table></div>`;
      divContainer.append(tableHtml);
      if (partAndJobData != undefined) {
        partAndJobData.forEach(jobItem => {
          if(parseFloat(jobItem.reqQuan) > parseFloat(jobItem.stockQuan)){
            var bgColor = '#f7ebd8';
            var fontColor = 'red';
          }else {
            var bgColor = '#e7f3e7';
            var fontColor = 'inherit';
          }
          $("#"+divId+" .partUse-tbl tbody").append(` 
        <tr class="partDataRow" style="background-color:${bgColor};">
        <td class="td-date">${convertToThaiDate(jobItem.plannedDate)}</td>
        <td class="td-jobCode">${jobItem.pmJobCode}</td>
        <td class="td-partData" colspan="2">${jobItem.partId}: ${jobItem.partName}:\n${jobItem.partSpec}</td>
        <td class="td-reqQuan">${jobItem.reqQuan}</td>
        <td class="td-realStockQuan" style="color:${fontColor};">${jobItem.stockQuan}</td>
      </tr>`);
        });
      }else {
        $("#"+divId+" .partUse-tbl tbody").append("<tr class='partDataRow'><td colspan='6' style='text-align:center;font-weight:bold;'>--ไม่มีรายการอะไหล่ที่ต้องใช้--</td></tr>");
      }
      
      
      
    }
    function displayPartBuyMore(divId) {
      let divContainer = $("#"+divId);
      let tableHtml = `
      <div class="header-label-cont"><label>อะไหล่ที่ต้องซื้อเพิ่ม</label></div>
      <div class="partUse-tbl-cont">
      <table class="partUse-tbl">
      <thead>
        <tr>
          <th colspan="2">อะไหล่</th>
          <th>ใช้รวม</th>
          <th>คงเหลือ</th>
          <th>สั่งแล้ว</th>
          <th>ต้องสั่ง</th>
        </tr>
      </thead>
      <tbody>
       
      </tbody>
      </table></div>`;
      divContainer.append(tableHtml);

      if (quantityAndJobData!=undefined) {
        let flag = false;
        quantityAndJobData.forEach(quantityItem => {
          if(parseFloat(quantityItem.totalReqQuan) > (parseFloat(quantityItem.stockQuan) + parseFloat(quantityItem.ordered_stockQuan))){
            flag = true;
            let needOrderQuan = parseFloat(quantityItem.totalReqQuan) - (parseFloat(quantityItem.stockQuan) + parseFloat(quantityItem.ordered_stockQuan));
            var bgColor = '#f7ebd8';
            $("#"+divId+" .partUse-tbl tbody").append(` 
        <tr class="partDataRow" style="background-color:${bgColor};">
        <td class="td-partData" colspan="2" style="font-weight:bold;">${quantityItem.partId}: ${quantityItem.partName}:\n${quantityItem.partSpec}</td>
        <td class="td-reqQuan">${quantityItem.totalReqQuan}</td>
        <td class="td-realStockQuan">${quantityItem.stockQuan}</td>
        <td class="td-onOrdered" style="color:darkgreen;">${quantityItem.ordered_stockQuan}</td>
        <td class="td-orderQuanReq" style="color:#ff4141;">${needOrderQuan}</td>
      </tr>`);
          }
        });

        if(!flag) {
          $("#"+divId+" .partUse-tbl tbody").append("<tr class='partDataRow'><td colspan='6' style='text-align:center;font-weight:bold;'>--ไม่มีรายการอะไหล่ที่ต้องใช้--</td></tr>");
        }
      }else {
        $("#"+divId+" .partUse-tbl tbody").append("<tr class='partDataRow'><td colspan='6' style='text-align:center;font-weight:bold;'>--ไม่มีรายการอะไหล่ที่ต้องใช้--</td></tr>");
      }
      


    }
    
    function loadPartandPlan(interV) {
      return $.ajax({
        url: 'fetch_pm_job_schedule.php',
        method: 'post',
        data:{ requiredTopic: [{"name":"getPartAndJob","arg":{"dateRange":interV}}]
      },
        success: function(data) {
           response = JSON.parse(data);
           if(response.status) {
                  partAndJobData = response.getPartAndJob.reqPartData;
                  quantityAndJobData = response.getPartAndJob.quantityInfo;
           }else {
             partAndJobData = [];
             quantityAndJobData =[];
           }
        }
    });
    }





    displayTotalPartMode();
    calendarLoad();

  
    function listenToSSE() {
      var eventSource = new EventSource('pm_job_change_sse.php');
      
      eventSource.onmessage = function (event) {
          var data = JSON.parse(event.data);
          if(data.event =="Reload") {

            const filteredPmItemData = pmItemData.filter(pmItem => pmItem.jobStatus !== 'done');
            const filteredDataResult = data.result.filter(Items => {
              return filteredPmItemData.some(pmItem => pmItem.pmJobCode === Items.pm_code);
            });
            

            const pmCodeStatusMap = {};

            filteredPmItemData.forEach(pmItem => {
            pmCodeStatusMap[pmItem.pmJobCode] = pmItem.jobStatus;
});

// Iterate through the second filtered array and compare statuses
            filteredDataResult.forEach(Items => {
            const pmCode = Items.pm_code;
            let status = Items.status;

            if (pmCodeStatusMap.hasOwnProperty(pmCode)) {
            const pmItemStatus = pmCodeStatusMap[pmCode];

    // Compare the statuses here
            if (pmItemStatus === status) {
              //console.log(`pmCode: ${pmCode} - Status is the same: ${status}`);
    } else {
      eventSource.close();
      status = status=='done' ? 'เสร็จสิ้น': 'กำลังดำเนินการ';
      alert(`งาน ${pmCode} เปลี่ยนสถานะเป็น ${status}`);
      location.reload();
    }
  }
});

          }


          eventSource.close();
      };
      
  }
  
  // Delay the initial event listening and then trigger it every 5 seconds // 5000 milliseconds (5 seconds)
  setInterval(listenToSSE, 5000); // Repeat every 5 seconds
    });
