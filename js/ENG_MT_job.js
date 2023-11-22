$(document).ready(function(){

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
        // addLoadingCSS();
        // $(document).on({
        //   ajaxStart: function() { $('body').addClass("loading"); },
        //  ajaxStop: function() { $('body').removeClass("loading"); }    
        // });
    
    }
    init_navAndLoad();

        function createJobElement(job) {
            let jobElement='';
            if (job.jobType =='BD'){
            let statclass = '';
            let stattext ='';
            if (job.status === 'pending') {
              statclass= 'status-pending';
              stattext = 'รอตรวจสอบ';
            } else if (job.status === 'processing') {
              statclass= 'status-processing';
              stattext = 'อยูู่ระว่างการซ่อม';
            } else if (job.status === 'done') {
              statclass ='status-done';
              stattext = 'สำเร็จ';
            }
            // Add more conditions for other status values if needed
            
                    let formattedInformDate = new Date(job.inform_date).toLocaleString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                     jobElement = `
                        <div class="col-md-4 mb-4">
                            <div class="card fix-card">
                                <div class="card-body">
                                    <input type='hidden' value= '${job.id}'>
                                    <input type='hidden' value= '${job.status}' id='j${job.id}-status'>
                                    <h5 class="card-title"><b>งานแจ้งซ่อม:</b> ${job.job_no}</h5>
                                    <p class="card-text"><b>หมายเลขเครื่องจักร:</b> ${job.machine_id}</p>
                                    <p class="card-text"><b>ชื่อเครื่องจักร:</b> <br>&emsp;${job.machine_name}</p>
                                    <p class="card-text"><b>สถานที่:</b> <br>&emsp;${job.machine_location}</p>
                                    <p class="card-text"><b>วันที่แจ้ง:</b> ${formattedInformDate} น.</p>
                                    <p class="card-text"><b>อาการแจ้ง:</b> <br>&emsp;${job.inform_reason}</p>
                                    <p class="card-text"><b>มอบหมาย:</b> <br>&emsp;รหัสพนักงาน: ${job.asg_eng}:<br>&emsp;${job.asg_emp_name} ${job.asg_emp_sur}</p>
                                    <p class="card-text ${statclass}"><b>สถานะ:</b> ${stattext}</p>
                                    <a href="#" class="btn btn-primary gotoJobPage" data-jobId="${job.job_all_id}" data-jobType="BD">รายละเอียด</a>
                                </div>
                            </div>
                        </div>
                    `;}else if(job.jobType =='PM') {
                        // Card Element of pm jobs

                        let statclass = '';
                        let stattext ='';
                        if (job.status === 'planned') {
                        statclass= 'status-pending';
                        stattext = 'รอตรวจสอบ';
                        } else if (job.status === 'processing') {
                        statclass= 'status-processing';
                        stattext = 'อยูู่ระว่างการดำเนินการ';
                        } else if (job.status === 'done') {
                        statclass ='status-done';
                        stattext = 'สำเร็จ';
                        }

                        let formattedInformDate = new Date(job.plannedDate).toLocaleString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        });

                         jobElement = `
                        <div class="col-md-4 mb-4">
                            <div class="card pm-card">
                                <div class="card-body">
                                    <input type='hidden' value= '${job.job_all_id}'>
                                    <input type='hidden' value= '${job.status}' id='j${job.job_all_id}-status'>
                                    <h5 class="card-title"><b>งาน PM:</b> ${job.pmJobCode}</h5>
                                    <p class="card-text"><b>หมายเลขเครื่องจักร:</b> ${job.job_mc_id}</p>
                                    <p class="card-text"><b>ชื่อเครื่องจักร:</b> <br>&emsp;${job.mcName}</p>
                                    <p class="card-text"><b>สถานที่:</b> <br>&emsp;${job.mcLoc}</p>
                                    <p class="card-text"><b>วันที่วางแผน:</b> ${formattedInformDate} น.</p>
                                    <p class="card-text"><b>แผน PM:</b> <br>&emsp;${job.planName}</p>
                                    <p class="card-text ${statclass}"><b>สถานะ:</b> ${stattext}</p>
                                    <a href="#" class="btn btn-primary gotoJobPage" data-jobId="${job.job_all_id}" data-jobType="PM">รายละเอียด</a>
                                </div>
                            </div>
                        </div>
                    `;
                        

                    }

                    return jobElement;
                }
        
                // Function to dynamically render job elements
                function renderJobDashboard(jobs) {
                    var jobListElement = $("#jobList");
                    jobListElement.empty(); // Clear any existing elements
        
                    jobs.forEach(function(job) {
                        var jobElement = createJobElement(job);
                        jobListElement.append(jobElement);
                    });
                }
        
                // Function to simulate going to the job management page
                function goToJobManagementPage(jobid) {
                     // Get the job object based on the jobNo
                     var job = jobs.find(function(item) {
                        return item.job_all_id === jobid;
                    });
        
                    if (job) {
                        let form = document.createElement('form');
                        if (job.jobType =='BD'){
                        // Create a form dynamically to submit the job data via POST method
                        let statusValue = $(`#j${job.id}-status`).val();
                        form.method = 'POST';
                        if(statusValue === 'done'){form.action = 'done_job_details.php'}else{
                        form.action = 'job_management_page.php';} // Replace with the actual URL of the job management page
        
                        // Create hidden input fields to pass the job data
                        let jobIDInput = document.createElement('input');
                        jobIDInput.type = 'hidden';
                        jobIDInput.name = 'job_id';
                        jobIDInput.value = job.id;
                        form.appendChild(jobIDInput);

                        // Append the form to the body and submit it
                        document.body.appendChild(form);
                        form.submit();
                        }else if(job.jobType =='PM') {
                            let status = job.status;
                            
                            if(status === 'done'){
                                form.method = 'GET';
                                form.action = 'pm_show_done_job.php'
                        }else{
                            form.method = 'POST';
                            form.action = 'pm_plan_management.php';} // Replace with the actual URL of the job management page


                        let allJobIDInput = document.createElement('input');
                        allJobIDInput.type = 'hidden';
                        allJobIDInput.name = 'allJobId';
                        allJobIDInput.value = job.job_all_id;
                        
                        form.appendChild(allJobIDInput);

                        let pmCodeInput = document.createElement('input');
                        pmCodeInput.type = 'hidden';
                        pmCodeInput.name = 'pmJobCode';
                        pmCodeInput.value = job.pmJobCode;
                        
                        form.appendChild(pmCodeInput);

                        // Append the form to the body and submit it
                        document.body.appendChild(form);
                        form.submit();
                        }
                    } else {
                        console.error('Job not found:', jobNo);
                    }
                }
        function sortJobsOrder(jobArray) {
            return jobArray.sort((a, b) => {
                // Custom order for 'status' property: 'pending/planned' -> 'processing' -> 'done'
                const statusOrder = {
                    'pending': 1,
                    'planned': 1, // Both 'pending' and 'planned' have the same priority
                    'processing': 2,
                    'done': 3,
                };
            
                // Custom order for 'jobType' property: 'BD' before 'PM'
                const jobTypeOrder = {
                    'BD': 1,
                    'PM': 2,
                };
            
                // Compare 'status' first
                const statusA = statusOrder[a.status] || 0;
                const statusB = statusOrder[b.status] || 0;
            
                if (statusA !== statusB) {
                    return statusA - statusB;
                }
            
                // If 'status' is the same, compare 'jobType'
                const jobTypeA = jobTypeOrder[a.jobType] || 0;
                const jobTypeB = jobTypeOrder[b.jobType] || 0;
            
                if (jobTypeA !== jobTypeB) {
                    return jobTypeA - jobTypeB;
                }
            
                // If 'jobType' is also the same, you can add additional criteria here.
            
                // If all criteria are equal, maintain the original order.
                return 0;
            });

        }
        
        
                function fetchLatestJobData() {
                    $.ajax({
                        url: 'fetch_MTjob_details.php', // Replace with your server-side script URL
                        method: 'post',
                        dataType: 'json',
                        success: function(data) {
                            // Render the updated job dashboard with the latest job data
                            
                            jobs = data.all_jobs;
                            asg_array = data.asg_jobs;
                            filterJobsByStatus();
                            
                            
                        },
                        error: function(xhr, status, error) {
                            console.error('Error fetching job data:', error);
                        }
                    });
                }
        
                // Function to fetch and update job data every 5 seconds
                function updateJobDashboard(status) {
                    fetchLatestJobData();
                    filterJobsByStatus()
                }
        
               
                function filterJobsByStatus() {
                    let status = $(".status-filter-btn.active").attr("data-status");
                    let statusPm = $(".status-filter-btn.active").attr("data-status-pm");
                    let engMode = $(".eng-filter-btn.active").attr("data-eng");
                    let engIdCode = $("#usssaaaawexasq").val();
                    let filteredJobs = jobs;
                    if (engMode ==='self-eng') {
                        let asgn_job_array = asg_array[engIdCode];
        
                       filteredJobs = filteredJobs.filter(function(job) {
                        return  asgn_job_array.includes(job.job_no) || asgn_job_array.includes(job.pmJobCode);
                       })
                    }

                    filteredJobs = sortJobsOrder(filteredJobs);




                    if (status === "all") {
                        renderJobDashboard(filteredJobs);
                        updateTotalJobCount(filteredJobs);
                    } else {
                        filteredJobs = filteredJobs.filter(function(job) {
                            return job.status === status || job.status === statusPm;
                        });
                        updateTotalJobCount(filteredJobs);
                        renderJobDashboard(filteredJobs);
                    }
                }

                function updateTotalJobCount(filteredArray) {
                    var totalJobCount = filteredArray.length;
                    $("#totalJobCount span").text(totalJobCount);
                }

                // Function to handle status filter button click
                $(".status-filter-btn").click(function() {
                    // Remove active class from all buttons
                    $(".status-filter-btn").removeClass("active");
                    // Add active class to the clicked button
                    $(this).addClass("active");
        
                    // Get the status value from the data attribute of the clicked button
                   // var status = $(this).attr("data-status");
                    
                    // Filter jobs based on the selected status
                    filterJobsByStatus();
                });
                
                $(".eng-filter-btn").click(function() {
                    // Remove active class from all buttons
                    $(".eng-filter-btn").removeClass("active");
                    // Add active class to the clicked button
                    $(this).addClass("active");

                    filterJobsByStatus()
                });
                
                $("#jobList").on("click",".gotoJobPage",function(){                 
                    goToJobManagementPage($(this).attr("data-jobId"));
                })

                fetchLatestJobData();
        
                // Update the job dashboard every 5 seconds
                setInterval(updateJobDashboard, 5000); // 5000 milliseconds = 5 seconds
                //renderJobDashboard(jobs);
 });    