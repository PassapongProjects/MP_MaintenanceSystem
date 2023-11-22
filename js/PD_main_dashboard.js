$(document).ready(function () {
    function init_navAndLoad() {
        $('body').prepend('<div id="nav-container"></div>');

        $.get({ url: '../global_res/global_sidebar_PD.html' }, function (htmlContent) {
            $('#nav-container').html(htmlContent);
            $.get({ url: '../style/global_sidebar.css' }, function (cssContent) {
                $('<style>').attr('type', 'text/css').html(cssContent).appendTo('head');

                let $els = $('.menu a, .menu header');
                let count = $els.length;
                let grouplength = Math.ceil(count / 3);
                let groupNumber = 0;
                let i = 1;
                $('.menu').css('--count', count + '');
                $els.each(function (j) {
                    if (i > grouplength) {
                        groupNumber++;
                        i = 1;
                    }
                    $(this).attr('data-group', groupNumber);
                    i++;
                });

                $('#nav-container').on('click', '.menu footer button', function (e) {
                    e.preventDefault();
                    $els.each(function (j) {
                        $(this).css('--top', $(this)[0].getBoundingClientRect().top + ($(this).attr('data-group') * -15) - 20);
                        $(this).css('--delay-in', j * .1 + 's');
                        $(this).css('--delay-out', (count - j) * .1 + 's');
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
                background: rgba(114, 114, 114, 0.8) url('../icon/global_loading_gif.gif') 50% 50% no-repeat;
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
            ajaxStart: function () { $('body').addClass("loading"); },
            ajaxStop: function () { $('body').removeClass("loading"); }
        });

    }
    init_navAndLoad();
    // Initial Declaration
    const mode_hidden = $('#selected-mode');
    const labelHeader = $('#main-header-label');
    const main_section_div = $('#main-section');
    const oper_cont = $('#main-oper-div');
    const popup_context = $('.popUpForm-content #form-context');
    const small_popup_div = $('#small-popup');
    const small_popup_content = $('.small-popup-content');
    var whoamiObj;

    async function whoamina() {
        // if (funcArr == null) {
        //     return false;
        // }

        try {
            const response = await $.ajax({
                type: 'POST',
                url: '../Maintenance/fetch_global_ppss.php',
                data: { "functions": [{ "name": "whoamina", "arg": "" }] }
            });

            const parsedResponse = JSON.parse(response);

            if (parsedResponse.status) {
                return parsedResponse.whoamina;
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        }
    }
    function fetchObjects(funcArr = null) {
        // Name As string
        // Arg as array {}
        if (funcArr == null) { return false };
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: 'POST',
                url: 'fetch_main_dashboard.php',
                data: { "functions": funcArr },
                success: function (response) {
                    // Resolve the Promise with the response data
                    response = JSON.parse(response);

                    if (response.status) {
                        resolve(response);
                    }
                    else { resolve(false) };
                },
                error: function (xhr, status, error) {
                    // Reject the Promise with an error message
                    reject(error);
                }
            });
        });
    }



    function isSafeInput(inputString) {
        // Check if the input string is empty or consists only of white spaces
        if (!inputString || inputString.trim() === "") {
            return false;
        }

        // Check for potentially harmful characters
        const harmfulChars = /[\'";`<>]/g; // Add more characters as needed
        if (harmfulChars.test(inputString)) {
            return false;
        }

        // If the input passes all checks, it is considered safe
        return inputString.trim();
    }
    function formatDateThai(dateTime) {
        try {
            const dateParts = dateTime.split(' ');

            const date = dateParts[0];
            const time = dateParts[1];

            const [year, month, day] = date.split('-');
            const [hour, minute, second] = time.split(':');


            const formattedDate = `${day}/${month}/${year}`;
            const formattedTime = `${hour}.${minute} น.`;

            return `${formattedDate} ${formattedTime}`;
        } catch (error) {
            return 'N/A'; // Return 'N/A' if an error occurs
        }
    }
    function convertTimeFormat(inputTime) {
        // Define Thai words for hours, minutes, and seconds
        const thaiHours = 'ชั่วโมง';
        const thaiMinutes = 'นาที';
        const thaiSeconds = 'วินาที';

        function isValidTimeFormat(timeString) {
            const timePattern = /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/;
            return timePattern.test(timeString);
        }

        try {
            if (!isValidTimeFormat(inputTime)) {
                return `- ${thaiHours} - ${thaiMinutes} - ${thaiSeconds}`;
            }

            // Split the input time into hours, minutes, and seconds
            const [hours, minutes, seconds] = inputTime.split(':').map(Number);

            // Create the formatted time string
            let formattedTime = `${hours} ${thaiHours} ${minutes} ${thaiMinutes} ${seconds} ${thaiSeconds}`;

            return formattedTime;
        } catch (error) {
            return `- ${thaiHours} - ${thaiMinutes} - ${thaiSeconds}`;
        }
    }


    function display_operation(menu) {

        let user_rank = whoamiObj.role_rank;

        if (menu === 'show_dashboard_menu' && user_rank >= 1) {
            display_MainDashboard();
            return true;
        } else if (menu === 'show_alert_cp' && user_rank >= 1) {
            display_alert_changepart();
            return true;
        } else if (menu === 'show_med_history' && user_rank >= 1) {
            display_med_history();
            return true;
        } else if (menu === 'show_config_menu' && user_rank >= 2) {
            display_config_menu();
            return true;
        } else if (menu === 'edit_cp_set' && user_rank >= 2) {
            display_edit_cp_set();
            return true;
        } else {
            // not expecting anything here
            alert('ไม่อนุญาติให้เข้าถึง');
            return false;
        }


    }


    function display_edit_cp_set() {
        oper_cont.html("");
        let med_data;
        let cpset_data;
        fetchObjects([{ "name": "fetch_medicine", "arg": "" }, { "name": "fetch_option_for_master_mold", "arg": "" }]).then(function (data) {
            if (data.fetch_medicine.status && data.fetch_option_for_master_mold.status) {
                med_data = data.fetch_medicine.medicine;
                cpset_data = data.fetch_option_for_master_mold.m_set;
                let med_option_html = `<option value="" selected disabled>-- เลือกชนิดยา --</option>`;
                med_data.forEach(med => {
                    med_option_html += `<option value="${med.id}">${med.name}</option>`;
                });

                const cp_set_config_cont = $('<div>').attr('id', "cpset_config_cont");
                oper_cont.append(cp_set_config_cont);

                const operation_bar = $('<div>').addClass('sub-config-container').attr('id', 'cpset-config-operation-bar');
                const main_operation_div = $('<div>').addClass('sub-config-container').attr('id', 'cpset-config-main-div').css('opacity', 0);

                cp_set_config_cont.append(operation_bar, main_operation_div);

                let med_name_select = $('<select>').addClass('cpset-config-select').attr('id', 'cpset-med-select').html(med_option_html);
                let formation_select = $('<select>').addClass('cpset-config-select').attr('id', 'cpset-formation-select').html(`<option value="" selected disabled>-- เลือกรูปแบบ --</option>`).prop('disabled', true);
                const add_new_button = $('<button>').addClass('cpset-operation-btn').attr('id', 'cpset-config-add-new-btn').text('+').css('opacity', 0).prop('disabled', true);
                const cpset_edit_button = $('<button>').addClass('cpset-operation-btn opertion-div-btn').attr('id', 'cpset-config-edit-btn').text('แก้ไขรูปแบบ').css('opacity', 0).prop('disabled', true);
                const cpset_del_button = $('<button>').addClass('cpset-operation-btn operation-div-btn').attr('id', 'cpset-config-del-btn').text('ลบรายการ').css('opacity', 0).prop('disabled', true);
                const operation_btn_cont = $('<div>').addClass('cpset-config-main-oper-sub-div operation-div-btn-cont').append(cpset_edit_button, cpset_del_button);
                const cpset_detail_div = $('<div>').addClass('cpset-config-main-oper-sub-div').attr('id', 'cpset-detail-div');
                operation_bar.append(med_name_select, formation_select, add_new_button);
                main_operation_div.append(operation_btn_cont, cpset_detail_div);

                let formation_data;
                med_name_select.on('change', function () {
                    let med_id = $(this).val();
                    let med_name = $(this).find('option:selected').text();
                    if (med_id == "") {
                        return;
                    }

                    formation_select.empty();
                    main_operation_div.css('opacity', 0);
                    cpset_detail_div.empty();
                    cpset_del_button.css('opacity', 0).prop('disabled', true).off('click');
                    cpset_edit_button.css('opacity', 0).prop('disabled', true).off('click');

                    add_new_button.css('opacity', 1).prop('disabled', false).on('click', function () {
                        cpset_config_popup(med_id, med_name, "new", null, cpset_data, "new_value");
                        $('#edit-popUpForm').css('display', 'block');
                        $('#dark-overlay').css('display', 'block');

                    });
                    fetchObjects([{ "name": "fetch_med_changeset_for_config", "arg": { "med_id": med_id } }]).then(function (data) {

                        if (data.fetch_med_changeset_for_config.status) {
                            formation_data = data.fetch_med_changeset_for_config.all_cp_set_for_med;
                            formation_option_html = `<option value="" selected disabled>-- เลือกรูปแบบ --</option>`;
                            let formatation_cont = 1;
                            formation_data.forEach(cpset_format => {
                                formation_option_html += `<option value="${cpset_format.set_id}">รูปแบบที่ ${formatation_cont}</option>`;
                                formatation_cont += 1;
                            });

                            formation_select.html(formation_option_html).prop('disabled', false);

                        } else {
                            throw new Error('Query Error');
                        }
                    })
                        .catch((error) => {
                            console.log(error);
                            alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                            return false;
                        });

                });



                formation_select.on('change', function () {
                    cpset_detail_div.empty();
                    let formation_value = $(this).val();

                    if (formation_value == "") {
                        return;
                    }

                    let selected_detail = $.grep(formation_data, function (obj) {
                        return obj.set_id == formation_value;
                    });

                    if (selected_detail.length === 1) {
                        selected_detail = selected_detail[0];

                    } else {
                        alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                        return false;
                    }

                    const current_med_id = med_name_select.val();
                    const current_med_name = med_name_select.find('option:selected').text();
                    const current_set = formation_value;
                    const selected_detail_array = selected_detail;


                    let forming_top_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ขึ้นรูป บน :</label></div><div class="cp-name-cont"><label class="cp-name">${selected_detail.avail_form_top_set_name ?? "-ไม่ใช้งาน-"}</label> </div>`);
                    let forming_bot_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ขึ้นรูป ล่าง :</label></div><div class="cp-name-cont"><label class="cp-name">${selected_detail.avail_form_bot_set_name ?? "-ไม่ใช้งาน-"}</label> </div>`);
                    let sealing_top_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ซีล บน :</label></div><div class="cp-name-cont"><label class="cp-name">${selected_detail.avail_seal_top_set_name ?? "-ไม่ใช้งาน-"}</label> </div>`);
                    let sealing_bot_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ซีลล่าง :</label></div><div class="cp-name-cont"><label class="cp-name">${selected_detail.avail_seal_bot_set_name ?? "-ไม่ใช้งาน-"}</label> </div>`);
                    let guide_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ชุดราง :</label></div><div class="cp-name-cont"><label class="cp-name">${selected_detail.avail_cutting_set_name ?? "-ไม่ใช้งาน-"}</label> </div>`);
                    let cutting_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ชุดตัด :</label></div><div class="cp-name-cont"><label class="cp-name">${selected_detail.avail_guide_set_name ?? "-ไม่ใช้งาน-"}</label> </div>`);
                    let perforation_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ชุดปรุ :</label></div><div class="cp-name-cont"><label class="cp-name">${selected_detail.avail_perfor_set_name ?? "-ไม่ใช้งาน-"}</label></div>`);

                    cpset_del_button.css('opacity', 1).prop('disabled', false).on('click', function () {

                        cpset_config_popup(current_med_id, current_med_name, current_set, selected_detail_array, cpset_data, "delete_value");
                        $('#edit-popUpForm').css('display', 'block');
                        $('#dark-overlay').css('display', 'block');
                    });
                    cpset_edit_button.css('opacity', 1).prop('disabled', false).on('click', function () {

                        cpset_config_popup(current_med_id, current_med_name, current_set, selected_detail_array, cpset_data, "update_value");
                        $('#edit-popUpForm').css('display', 'block');
                        $('#dark-overlay').css('display', 'block');
                    });




                    cpset_detail_div.append(forming_top_div, forming_bot_div, sealing_top_div, sealing_bot_div, guide_div, cutting_div, perforation_div);
                    main_operation_div.css('opacity', 1);



                });






            } else {
                throw new Error('Query Error');
            }

        })
            .catch((error) => {
                console.log(error);
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return false;

            });


    }

    function display_MainDashboard() {


        oper_cont.html("");

        fetchObjects([{ "name": "fetch_operatingMachines", "arg": "" }]).then(function (data) {
            if (data.fetch_operatingMachines.status) {
                operating_machine_data = data.fetch_operatingMachines.operating_data;

                operating_machine_data.forEach(oper_machine => {
                    let blister_element = generate_blister_card_element(oper_machine);
                    oper_cont.append(blister_element);
                });

                setInterval(updateDuration, 1000);


                oper_cont.on('click', '.detail-button', function () {
                    const clicked_blis_id = $(this).attr("data-blisId");
                    popup_context.empty();
                    popup_context.html(generate_full_blister_detail(clicked_blis_id));
                    $('#edit-popUpForm').css('display', 'block');
                    $('#dark-overlay').css('display', 'block');

                });

                $('#closepopUp').on("click", () => {
                    const container_div = $('#form-context');
                    $('#edit-popUpForm').css('display', 'none');
                    $('#dark-overlay').css('display', 'none');
                    container_div.html("");
                });


            } else {
                console.log("Function Returned false");
                alert('เกิดข้อผิดพลาดกรุณารีเฟรช');
                return false;
            }




        }).catch(function (error) {
            console.log(error);
            alert('เกิดข้อผิดพลาดกรุณารีเฟรช');
            return false;
        });


    }
    function display_alert_changepart() {
        oper_cont.html("");

        let all_change_part_data;
        let oneMonth_data;



        let main_mold_alert_div = $('<div>').attr('id', 'main-mold_alert');

        let filter_div = $('<div>').addClass('sub-operation-div alert_mold_filter_div');
        let detail_div = $('<div>').addClass('sub-operation-div oneMonth_table_div');
        let oneM_topic_lavel = $('<label>').addClass('cp-alert-topic-label').text('ประวัติปัญหา 1 เดือนย้อนหลัง');
        let oneM_table_cont = $('<div>').attr('id', 'oneM-table-cont').addClass('scroll-table');
        let oneM_table = $('<table>').attr('id', 'oneM-table').addClass('small-detail-table fixed-header-table');
        let oneM_thead = $('<thead>').html(`
        <tr>
        <th>วันที่</th>
        <th>รหัส</th>
        <th>ชื่อ</th>
        <th>ประเภท</th>
        <th>ปัญหาที่พบ</th>
        <th>lot No.</th>
        <th>ยาที่เดิน</th>
        </tr>
        `);
        let oneM_tbody = $('<tbody>');

        oneM_table.append(oneM_thead, oneM_tbody);
        oneM_table_cont.append(oneM_table);
        detail_div.append(oneM_topic_lavel, oneM_table_cont);

        let filter_topic_label = $('<label>').addClass('cp-alert-topic-label').text('ค้นหารายการ Change Part');
        let filter_cont = $('<div>').addClass('filter-section-cont');

        let filter_bar_cont = $('<div>').addClass('filter-section-bar-cont');
        let filter_table_cont = $('<div>').attr('id', 'change-part-filter-table-cont').addClass('scroll-table');
        let change_part_table = $('<table>').attr('id', 'change-part-table').addClass('small-detail-table fixed-header-table');
        let change_part_thead = $('<thead>').html(`
        <tr>
        <th>รหัส</th>
        <th>ชื่อ</th>
        <th>เซ็ต</th>
        <th>ประเภท</th>
        <th>สถานะ</th>
        </tr>
        `);
        let change_part_tbody = $('<tbody>');

        filter_bar_cont.html(`
        <div class="btn-group status-filter status-filter-cont" role="group" aria-label="Status Filter">
  <button type="button" class="btn btn-secondary status-filter-btn active" data-value="fetched_forming_top">ขึ้นรูปบน</button>
  <button type="button" class="btn btn-secondary status-filter-btn" data-value="fetched_forming_bot">ขึ้นรูปล่าง</button>
  <button type="button" class="btn btn-secondary status-filter-btn" data-value="fetched_sealing_top">ซีลบน</button>
  <button type="button" class="btn btn-secondary status-filter-btn" data-value="fetched_sealing_bot">ซีลล่าง</button>
  <button type="button" class="btn btn-secondary status-filter-btn" data-value="fetched_guide">ชุดราง</button>
  <button type="button" class="btn btn-secondary status-filter-btn" data-value="fetched_cutting">ชุดตัด</button>
  <button type="button" class="btn btn-secondary status-filter-btn" data-value="fetched_perforation">ชุดปรุ</button>
</div>`);




        // Fetch change part data

        fetchObjects([{ "name": "fetch_all_mold_data", "arg": "" }]).then(function (data) {
            // List of change parts
            if (data.fetch_all_mold_data.status) {
                all_change_part_data = data.fetch_all_mold_data;

                change_part_table.append(change_part_thead, change_part_tbody);
                filter_table_cont.append(change_part_table);
                filter_cont.append(filter_bar_cont, filter_table_cont);
                filter_div.append(filter_topic_label, filter_cont);

                let selectedFilter = filter_bar_cont.find('.status-filter-btn.active').attr('data-value');
                display_cp_list_table(change_part_table, all_change_part_data, selectedFilter);


                filter_bar_cont.on('click', '.status-filter-btn', function () {

                    filter_bar_cont.find(".status-filter-btn").removeClass("active");
                    // Add active class to the clicked button
                    $(this).addClass("active");
                    let selectedFilter = $(this).attr('data-value');
                    display_cp_list_table(change_part_table, all_change_part_data, selectedFilter);
                });


                change_part_tbody.on("mouseenter", ".change-part-data", function (event) {
                    // Get the tooltip content
                    let mold_code = $(this).attr("data-cp-code");
                    let mold_name = $(this).attr("data-cp-name");
                    let tooltipContent = `${mold_code}: ${mold_name}: <span style="color: #28b974;">คลิกเพื่อดูประวัติโดยละเอียด</span>`;
                    // Create a new tooltip element
                    let tooltip = $('<div>').addClass('floating-text').html(tooltipContent);


                    // Calculate tooltip position based on mouse coordinates
                    let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
                    let y = event.clientY + window.scrollY + 10; // Adjust vertical position

                    // Set tooltip position
                    tooltip.css({ left: x + 'px', top: y + 'px' });


                    // Append the tooltip to the body
                    $('#pg-cont').append(tooltip);

                    // Show the tooltip
                    tooltip.css('display', 'block');


                    $(document).on("mousemove", function (event) {
                        let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
                        let y = event.clientY + window.scrollY + 10; // Adjust vertical position

                        // Update tooltip position
                        tooltip.css({ left: x + 'px', top: y + 'px' });
                    });


                    $(this).mouseleave(function () {
                        tooltip.css('display', 'none');
                        tooltip.remove(); // Remove the tooltip element from the DOM
                    });
                });



                change_part_tbody.on("click", ".change-part-data", function () {

                    let change_part_id = $(this).attr("data-cp-id");

                    fetchObjects([{ "name": "fetch_specific_mold_data", "arg": { "moldId": change_part_id } }]).then(function (data) {

                        if (data.fetch_specific_mold_data.status) {

                            let specific_cp_detail = data.fetch_specific_mold_data.specific_cp_detail;

                            display_alert_changepart_specific_popup(specific_cp_detail, change_part_id);

                            $('#edit-popUpForm').css('display', 'block');
                            $('#dark-overlay').css('display', 'block');


                            $('#closepopUp').on("click", () => {
                                const container_div = $('#form-context');
                                $('#edit-popUpForm').css('display', 'none');
                                $('#dark-overlay').css('display', 'none');
                                container_div.html("");
                            });


                            // Display popup content for this id;
                        } else {
                            console.log('Query Error');
                            alert('เกิดข้อผิดพลาดกรุณารีเฟรช');
                            return;
                        }

                    })
                        .catch(function (error) {
                            console.log(error);
                            alert('เกิดข้อผิดพลาดกรุณารีเฟรช');
                            return;

                        })



                });

            } else {
                console.log("Query Error");
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return;
            }


        })
            .catch(function (error) {
                console.log(error);
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return;
            });

        fetchObjects([{ "name": "fetch_production_mold", "arg": "" }]).then(function (data) {
            // oneMonth History

            if (data.fetch_production_mold.status) {
                oneMonth_data = data.fetch_production_mold.oneMonthMoldProblem;

                oneM_tbody.empty();
                if (oneMonth_data.length > 0) {
                    // Display Table
                    oneMonth_data.forEach(logData => {
                        let newRow = `
                        <tr class="oneM-cp-alert" data-runcode="${logData.runcode}" data-lot_no="${logData.lot_no}" data-med_name= "${logData.med_name}">
                        <td>${formatDateThai(logData.log_time)}</td>
                        <td>${logData.mold_unique_code}</td>
                        <td>${logData.mold_name}</td>
                        <td>${logData.mold_type}</td>
                        <td>${logData.problem_text}</td>
                        <td>${logData.lot_no}</td>
                        <td>${logData.med_name}</td>
                        </tr>
                        `;
                        oneM_tbody.append(newRow);
                    });

                    oneM_tbody.on("mouseenter", ".oneM-cp-alert", function (event) {
                        // Get the tooltip content
                        let itm_lot_no = $(this).attr("data-lot_no");
                        let itm_med_name = $(this).attr("data-med_name");
                        let tooltipContent = `Lot - ${itm_lot_no}: ${itm_med_name}: <span style="color: #28b974;">คลิกเพื่อดูรายละเอียด Lot</span>`;
                        // Create a new tooltip element
                        let tooltip = $('<div>').addClass('floating-text').html(tooltipContent);


                        // Calculate tooltip position based on mouse coordinates
                        let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
                        let y = event.clientY + window.scrollY + 10; // Adjust vertical position

                        // Set tooltip position
                        tooltip.css({ left: x + 'px', top: y + 'px' });


                        // Append the tooltip to the body
                        $('#pg-cont').append(tooltip);

                        // Show the tooltip
                        tooltip.css('display', 'block');


                        $(document).on("mousemove", function (event) {
                            let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
                            let y = event.clientY + window.scrollY + 10; // Adjust vertical position

                            // Update tooltip position
                            tooltip.css({ left: x + 'px', top: y + 'px' });
                        });


                        $(this).mouseleave(function () {
                            tooltip.css('display', 'none');
                            tooltip.remove(); // Remove the tooltip element from the DOM
                        });
                    });



                    oneM_tbody.on("click", ".oneM-cp-alert", function () {
                        // Retrieve the "data-runcode" attribute value
                        let runcode = $(this).attr("data-runcode");

                        // Open a new tab with PD_lot_detail.php and pass the runcode as a query parameter
                        let url = "PD_lot_detail.php?runcode=" + encodeURIComponent(runcode);
                        window.open(url, "_blank");
                    });



                } else {
                    // Display No Problem
                    let newRow = `
                    <tr style="text-align:center">
                    <td colspan="7"><b><u>-- ไม่มีประวัติการแจ้งปัญหาในช่วง 1 เดือน  --</b></u></td>
                    </tr>
                    `;
                    oneM_tbody.append(newRow);
                }


            } else {
                console.log("Query Error");
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return;
            }

        })
            .catch(function (error) {
                console.log(error);
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return;
            });


        main_mold_alert_div.append(detail_div, filter_div);
        oper_cont.append(main_mold_alert_div);

    }
    function display_med_history() {
        oper_cont.html("");

        const config = {
            altInput: true,
            altFormat: "j F Y",
            dateFormat: 'Y-m-d', // Date format (YYYY-MM-DD)
            maxDate: 'today',
            disableMobile: "true",
            onOpen: function (selectedDates, dateStr, instance) {
                // Get the IDs of the start and end date inputs
                const startDateInputId = "startDate";
                const endDateInputId = "endDate";

                // Get the selected dates from both inputs
                const startDate = $("#" + startDateInputId)[0].value;
                const endDate = $("#" + endDateInputId)[0].value;
                // Calculate the minimum and maximum dates for the current input
                let minDate = null;
                let maxDate = null;

                if (instance.input.id === startDateInputId) {
                    // If the current input is the start date, set the minimum date for the end date
                    minDate = null;
                    maxDate = endDate; // Limit end date to today
                } else if (instance.input.id === endDateInputId) {
                    // If the current input is the end date, set the minimum date for the start date
                    minDate = startDate; // No minimum date for start date
                    maxDate = 'today' // Maximum date is the selected end date
                }

                // Update the minDate and maxDate options for the current input
                instance.set("minDate", minDate);
                instance.set("maxDate", maxDate);
            }
        };
        // Display Filtering Box and generate element to be placed inside the main oper div
        let main_med_history_div = $('<div>').attr('id', 'main-med-history');

        let filter_div = $('<div>').addClass('sub-operation-div med-hist-sub-div');
        let detail_div = $('<div>').addClass('sub-operation-div med-hist-sub-div');


        let oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        // Create the start_date_Object and end_date_Object elements
        let start_date_Object = $('<input>').addClass('flatpickr filter-date-input').attr('id', 'startDate').attr('type', 'text').attr('max', new Date().toISOString().split('T')[0]).val(oneMonthAgo.toISOString().split('T')[0]);
        let end_date_Object = $('<input>').addClass('flatpickr filter-date-input').attr('id', 'endDate').attr('type', 'text').attr('max', new Date().toISOString().split('T')[0]).val(new Date().toISOString().split('T')[0]);

        let start_date_div = $('<div>').addClass('flatpickr-cont').append(start_date_Object);
        let end_date_div = $('<div>').addClass('flatpickr-cont').append(end_date_Object);

        let date_label_cont = $('<div>').addClass('label-cont').append($('<label>').addClass('small-label').text('เลือกช่วงเวลาที่ต้องการค้นหา'));

        let datepick_div = $('<div>').addClass('date-picker-cont');

        let filter_text_input_cont = $('<div>').addClass('text-filter-input-cont');
        let filter_text_input_label = $('<label>').addClass('small-label').text('ใส่คำที่ต้องการค้นหา');
        let filter_text_input = $('<input>').addClass('text-filter-input').attr('placeholder', 'เลข Lot / ชื่อยา / ชื่อเครื่องจักร').prop('disabled', true);

        filter_text_input_cont.append(filter_text_input_label, filter_text_input);

        datepick_div.append(start_date_div, $('<span>').text('ถึง'), end_date_div);


        filter_div.append(date_label_cont, datepick_div, filter_text_input_cont);

        filter_div.find('.flatpickr').flatpickr(config);


        let production_table_cont = $('<div>').attr('id', 'production-table-cont');
        let production_table = $('<table>').attr('id', 'production-table');

        let production_thead = $('<thead>').html(`
        <tr>
        <th>เวลาเริ่ม Lot</th>
        <th>Lot No.</th>
        <th>ชื่อยา</th>
        <th>เครื่องที่เดินยา</th>
        <th>เวลาจบ Lot</th>
        <th>ระยะเวลา</th>
        </tr>
        `);

        let production_tbody = $('<tbody>').html(`<tr><td colspan="6"><b><u>-- ระบุช่วงเวลาที่ต้องการค้นหา --</u></b></td></tr>`);

        production_table.append(production_thead, production_tbody);

        production_table_cont.append(production_table);
        detail_div.append(production_table_cont);



        main_med_history_div.append(filter_div, detail_div);
        oper_cont.append(main_med_history_div);


        filter_div.on('change', '.filter-date-input', function () {

            let startDate = (new Date($('#startDate').val())).toISOString().split('T')[0];
            let endDate = (new Date($('#endDate').val())).toISOString().split('T')[0];

            // Query between these date
            fetchObjects([{ "name": "fetch_filter_production", "arg": { "startDate": startDate, "endDate": endDate } }]).then(function (data) {
                const table_body = $('#production-table tbody');
                const filter_input = $('.text-filter-input');
                filter_input.prop('disabled', true);
                table_body.empty();
                if (data.fetch_filter_production.status) {


                    fetch_production_data = data.fetch_filter_production.filtered_production;
                    if (fetch_production_data.length > 0) {

                        generate_production_table();


                        filter_input.prop('disabled', false);

                        filter_input.on('input', function () {
                            let filterVal = $(this).val();
                            generate_production_table(filterVal);
                        });

                        let isScrolling = false;

                        table_body.find('.text-scroll-div').on('scroll', function () {
                            $(this).css('text-overflow', 'clip');
                            let scrollTimeout;
                            let scrollingDiv = $(this);
                            if (isScrolling) {
                                clearTimeout(scrollTimeout);
                            }
                            isScrolling = true;
                            scrollTimeout = setTimeout(function () {
                                // Check if scrolling is still in progress
                                if (!isScrolling) {
                                    // If scrolling has stopped, scroll back to the top
                                    scrollingDiv.scrollLeft(0);
                                    scrollingDiv.css('text-overflow', 'ellipsis');
                                }
                                // Reset the flag
                                isScrolling = false;
                            }, 7000); // Adjust the timeout duration as needed



                        });

                        table_body.on("mouseenter", ".production_lot_row", function (event) {
                            // Get the tooltip content
                            let itm_lot_no = $(this).attr("data-lot_no");
                            let itm_med_name = $(this).attr("data-med_name");
                            let tooltipContent = `Lot - ${itm_lot_no}: ${itm_med_name}: <span style="color: #28b974;">คลิกเพื่อดูรายละเอียด</span>`;
                            // Create a new tooltip element
                            let tooltip = $('<div>').addClass('floating-text').html(tooltipContent);


                            // Calculate tooltip position based on mouse coordinates
                            let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
                            let y = event.clientY + window.scrollY + 10; // Adjust vertical position

                            // Set tooltip position
                            tooltip.css({ left: x + 'px', top: y + 'px' });


                            // Append the tooltip to the body
                            $('#pg-cont').append(tooltip);

                            // Show the tooltip
                            tooltip.css('display', 'block');


                            $(document).on("mousemove", function (event) {
                                let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
                                let y = event.clientY + window.scrollY + 10; // Adjust vertical position

                                // Update tooltip position
                                tooltip.css({ left: x + 'px', top: y + 'px' });
                            });


                            $(this).mouseleave(function () {
                                tooltip.css('display', 'none');
                                tooltip.remove(); // Remove the tooltip element from the DOM
                            });
                        });



                        table_body.on("click", ".production_lot_row", function () {
                            // Retrieve the "data-runcode" attribute value
                            let runcode = $(this).attr("data-runcode");

                            // Open a new tab with PD_lot_detail.php and pass the runcode as a query parameter
                            let url = "PD_lot_detail.php?runcode=" + encodeURIComponent(runcode);
                            window.open(url, "_blank");
                        });


                    } else {
                        // No production in criteria
                        let rowDetail =
                            `<tr>
                        <td colspan='6'><b><u>-- ไม่มีรายการในการค้นหานี้ --</u></b></td>
                        </tr>`
                        table_body.append(rowDetail);
                    }



                } else {
                    console.log('Query Error');
                    alert('เกิดข้อผิดพลาดกรุณารีเฟรช');
                    return false;
                }


            })
                .catch(function (error) {
                    console.log(error);
                    alert('เกิดข้อผิดพลาดกรุณารีเฟรช');
                    return false;

                });

        })




    }

    function display_config_menu() {
        oper_cont.html("");

        const main_config_div = $('<div>').attr('id', 'main-config-div');
        oper_cont.append(main_config_div);

        let mode_bar_div = $('<div>').addClass('sub-config-container').html(`
        <div class="btn-group status-filter status-filter-cont" role="group" aria-label="Status Filter" id="config-mode-filter-cont">
        <button type="button" class="btn btn-secondary status-filter-btn active" data-value="master_mold">CP</button>
  <button type="button" class="btn btn-secondary status-filter-btn" data-value="master_medicine">รายการยา</button>
  <button type="button" class="btn btn-secondary status-filter-btn" data-value="operating_machine">Blister</button>
  <button type="button" class="btn btn-secondary status-filter-btn" data-value="master_mold_status">สถานะ CP</button>
  <button type="button" class="btn btn-secondary status-filter-btn" data-value="master_moldset">เซ็ต CP</button>
  <button type="button" class="btn btn-secondary status-filter-btn" data-value="master_mold_type">ประเภท CP</button>
</div>`);


        let config_operation_div = $('<div>').addClass('sub-config-container');
        let config_operation_label = $('<label>').addClass('specific-detail-topic-label');
        let config_operation_table_div = $('<div>').addClass('scroll-table config-table-cont');
        const config_filter_input = $('<input>').attr('type', 'text').attr('id', 'config-filter-input').attr('placeholder', 'ใส่ชื่อที่ต้องการค้นหา');
        const add_new_button = $('<button>').attr('id', 'add-new-config-btn').text('+');
        const filter_input_div = $('<div>').attr('id', 'config-filer-input-cont').append(config_filter_input, add_new_button);
        config_operation_div.append(config_operation_label, filter_input_div, config_operation_table_div);

        main_config_div.append(mode_bar_div, config_operation_div);

        mode_bar_div.on('click', '.status-filter-btn', function () {

            mode_bar_div.find('.status-filter-btn').removeClass('active');
            $(this).addClass('active');
            let selected_config_table = $(this).attr('data-value');
            let config_label = $(this).text();
            config_filter_input.val("");
            if (selected_config_table == "master_mold") {
                $promise_payload = [{ "name": "fetch_config", "arg": { "tableName": selected_config_table } }, { "name": "fetch_option_for_master_mold", "arg": "" }]
            } else if (selected_config_table == "operating_machine") {
                $promise_payload = [{ "name": "fetch_config", "arg": { "tableName": selected_config_table } }, { "name": "fetch_option_for_real_machine", "arg": "" }]
            }
            else {
                $promise_payload = [{ "name": "fetch_config", "arg": { "tableName": selected_config_table } }]
            }
            fetchObjects($promise_payload).then(function (data) {
                if (data.fetch_config.status) {
                    if (selected_config_table == "master_mold") {
                        if (!data.fetch_option_for_master_mold.status) {
                            throw new Error('Query Error');
                        } else {
                            select_data_for_master_mold = data.fetch_option_for_master_mold;
                        }
                    } else if (selected_config_table == "operating_machine") {
                        if (!data.fetch_option_for_real_machine.status) {
                            throw new Error('Query Error');
                        } else {
                            select_data_for_real_mc = data.fetch_option_for_real_machine.listed_real_mc;
                        }
                    }
                    config_operation_label.text(config_label);

                    current_config_data = data.fetch_config.tableData;
                    generate_config_table(current_config_data, config_operation_table_div, selected_config_table);

                    config_filter_input.on('input', function () {
                        let filtered_text = $(this).val();
                        let filteredArray = [...current_config_data];

                        searchString = filtered_text.replace(/\s/g, '').toLowerCase(); // Remove spaces and normalize to lowercase
                        if (searchString.length > 0) {
                            filteredArray = filteredArray.filter(obj => {
                                // Convert specified properties to lowercase and remove spaces
                                const name_LowerCase = obj.name.replace(/\s/g, '').toLowerCase();
                                const unique_code_LowerCase = obj.unique_code ? obj.unique_code.replace(/\s/g, '').toLowerCase() : "";

                                // Check if the search string is found in any of the specified properties
                                return (
                                    name_LowerCase.includes(searchString) ||
                                    unique_code_LowerCase.includes(searchString)
                                );
                            });
                        }

                        generate_config_table(filteredArray, config_operation_table_div, selected_config_table);

                    });

                } else {
                    console.log("Query Error");
                    alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                    return false;
                }


            })
                .catch(function (error) {
                    console.log(error);
                    alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                    return false;
                });


        });
        add_new_button.on('click', function () {
            const table_mode = $(this).closest('.sub-config-container').find('.config-table-cont #hidden_table_mode').val();
            config_popup(table_mode, "new", null, "new_value");
            $('#edit-popUpForm').css('display', 'block');
            $('#dark-overlay').css('display', 'block');

        });

        mode_bar_div.find('.status-filter-btn.active').trigger('click');



    }

    function cpset_config_popup(med_id, med_name, set_id, item_object, m_set, oper_mode) {
        popup_context.empty();
        const field_container = $('<div>').attr('id', 'config-popup-div');
        const button_container = $('<div>').attr('id', 'config-popup-button-div');
        const confirm_button = $('<button>').attr('type', 'button').addClass('config-popup-oper-btn config-popup-confirm-btn').text('บันทึก');
        const cancel_button = $('<button>').attr('type', 'button').addClass('config-popup-oper-btn config-popup-cancel-btn').text('ยกเลิก');

        button_container.append(confirm_button, cancel_button);

        popup_context.append(field_container, button_container);

        if (oper_mode == "update_value") {

            field_container.html(`
            <div class="input-field-cont">
            <span class="id-span">สำหรับยา: ${med_name}</span>


            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="fk_med_id">
           <input type='hidden' class="element-name-field" value="${med_id}">
            </div>

            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="fk_form_top_set">
            <label class="ele-field-label">ชุดขึ้นรูป (บน): </label>
            <select class='element-name-field'>
            ${generate_option_html_allow_notUsed(item_object.avail_form_top_set_id, m_set)}
            </select>
            </div>

            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="fk_form_bot_set">
            <label class="ele-field-label">ชุดขึ้นรูป (ล่าง): </label>
            <select class='element-name-field'>
            ${generate_option_html_allow_notUsed(item_object.avail_form_bot_set_id, m_set)}
            </select>
            </div>
            
            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="fk_seal_top_set">
            <label class="ele-field-label">ชุดซีล (บน): </label>
            <select class='element-name-field'>
            ${generate_option_html_allow_notUsed(item_object.avail_seal_top_set_id, m_set)}
            </select>
            </div>

            <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="fk_seal_bot_set">
        <label class="ele-field-label">ชุดซีล (ล่าง): </label>
        <select class='element-name-field'>
        ${generate_option_html_allow_notUsed(item_object.avail_seal_bot_set_id, m_set)}
        </select>
        </div>


        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="fk_guide_set">
        <label class="ele-field-label">ชุดราง: </label>
        <select class='element-name-field'>
        ${generate_option_html_allow_notUsed(item_object.avail_guide_set_id, m_set)}
        </select>
        </div>

        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="fk_cut_set">
        <label class="ele-field-label">ชุดตัด: </label>
        <select class='element-name-field'>
        ${generate_option_html_allow_notUsed(item_object.avail_cutting_set_id, m_set)}
        </select>
        </div>

        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="fk_perfor_set">
        <label class="ele-field-label">ชุดปรุ: </label>
        <select class='element-name-field'>
        ${generate_option_html_allow_notUsed(item_object.avail_perfor_set_id, m_set)}
        </select>
        </div>

            </div>
            `);


        } else if (oper_mode == "delete_value") {

            const cpset_detail_div = $('<div>').addClass('cpset-config-main-oper-sub-div popup-cpset-detail-div');
            let forming_top_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ขึ้นรูป บน :</label></div><div class="cp-name-cont"><label class="cp-name">${item_object.avail_form_top_set_name ?? "-ไม่ใช้งาน-"}</label> </div>`);
            let forming_bot_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ขึ้นรูป ล่าง :</label></div><div class="cp-name-cont"><label class="cp-name">${item_object.avail_form_bot_set_name ?? "-ไม่ใช้งาน-"}</label> </div>`);
            let sealing_top_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ซีล บน :</label></div><div class="cp-name-cont"><label class="cp-name">${item_object.avail_seal_top_set_name ?? "-ไม่ใช้งาน-"}</label> </div>`);
            let sealing_bot_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ซีลล่าง :</label></div><div class="cp-name-cont"><label class="cp-name">${item_object.avail_seal_bot_set_name ?? "-ไม่ใช้งาน-"}</label> </div>`);
            let guide_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ชุดราง :</label></div><div class="cp-name-cont"><label class="cp-name">${item_object.avail_cutting_set_name ?? "-ไม่ใช้งาน-"}</label> </div>`);
            let cutting_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ชุดตัด :</label></div><div class="cp-name-cont"><label class="cp-name">${item_object.avail_guide_set_name ?? "-ไม่ใช้งาน-"}</label> </div>`);
            let perforation_div = $('<div>').addClass('cpset-config-general-detail-row').html(`<div class="cpset-config-detail-label-cont"><label class="general-detail-header-label">ชุดปรุ :</label></div><div class="cp-name-cont"><label class="cp-name">${item_object.avail_perfor_set_name ?? "-ไม่ใช้งาน-"}</label></div>`);


            field_container.html(`<span class="operation" style="color:#f00;"><b>ยืนยันการลบรายการ?</b></span>
            <span class="id-span" style="color:#f00;"><b>ลบรายการสำหรับยา</b> ${med_name}</span>`);

            cpset_detail_div.append(forming_top_div, forming_bot_div, sealing_top_div, sealing_bot_div, guide_div, cutting_div, perforation_div);

            field_container.append(cpset_detail_div);


        } else if (oper_mode == "new_value") {

            field_container.html(`
            <div class="input-field-cont">
            <span class="id-span">สำหรับยา: ${med_name}</span>


            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="fk_med_id">
           <input type='hidden' class='element-name-field' value="${med_id}">
            </div>


            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="fk_form_top_set">
            <label class="ele-field-label">ชุดขึ้นรูป (บน): </label>
            <select class='element-name-field'>
            ${generate_option_html_allow_notUsed(null, m_set)}
            </select>
            </div>

            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="fk_form_bot_set">
            <label class="ele-field-label">ชุดขึ้นรูป (ล่าง): </label>
            <select class='element-name-field'>
            ${generate_option_html_allow_notUsed(null, m_set)}
            </select>
            </div>
            
            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="fk_seal_top_set">
            <label class="ele-field-label">ชุดซีล (บน): </label>
            <select class='element-name-field'>
            ${generate_option_html_allow_notUsed(null, m_set)}
            </select>
            </div>

            <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="fk_seal_bot_set">
        <label class="ele-field-label">ชุดซีล (ล่าง): </label>
        <select class='element-name-field'>
        ${generate_option_html_allow_notUsed(null, m_set)}
        </select>
        </div>


        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="fk_guide_set">
        <label class="ele-field-label">ชุดราง: </label>
        <select class='element-name-field'>
        ${generate_option_html_allow_notUsed(null, m_set)}
        </select>
        </div>

        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="fk_cut_set">
        <label class="ele-field-label">ชุดตัด: </label>
        <select class='element-name-field'>
        ${generate_option_html_allow_notUsed(null, m_set)}
        </select>
        </div>

        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="fk_perfor_set">
        <label class="ele-field-label">ชุดปรุ: </label>
        <select class='element-name-field'>
        ${generate_option_html_allow_notUsed(null, m_set)}
        </select>
        </div>

            </div>
            `);


        } else {
            // Expect nothing here
        }

        confirm_button.on('click', function () {
            const all_select_form = field_container.find('.input-field-cont .input-ele-cont select');
            const all_input_form = field_container.find('.input-field-cont .input-ele-cont input[type="text"]');
            const operation_mode = oper_mode;
            let inputflag = true;

            all_input_form.each(function () {
                const inputElement = $(this);

                if (!isSafeInput(inputElement.val())) {
                    inputElement.val('');
                    inputflag = false;
                }

            });

            all_select_form.each(function () {
                const selectElement = $(this);

                if (selectElement.val() === "") {
                    // not use
                    return true;
                }
                if (isNaN(parseInt(selectElement.val()))) {
                    // If the option's value is changed (abnormal...)
                    alert("ข้อมูลไม่ถูกต้อง");
                    inputflag = false;
                    return false;
                }

            });


            if (!inputflag) {
                alert(`ตัวอักษรที่ห้ามใช้( '";<> ) หรือ กรอกข้อมูลไม่ครบถ้วน`);
                return false; // Use "return false" to break out of the loop
            } else {

                const all_col_val = field_container.find('.input-field-cont .input-ele-cont');
                const table = "changepart_set";
                const objId = set_id;

                if (operation_mode === 'update_value' || operation_mode === 'delete_value') {
                    // Dont have to check if mode == insert_value
                    if (isNaN(parseInt(objId))) {
                        alert('เกิดข้อผิดพลาด กรุณารีเฟลช');
                        return false;
                    }
                }

                if (!isSafeInput(table)) {
                    alert('เกิดข้อผิดพลาด กรุณารีเฟลช');
                    return false;
                } else {
                    const resultObject = {}; // Initialize an empty object

                    all_col_val.each(function () {

                        const col_val = $(this);
                        const t_column = col_val.find(".column-name-hidden").val();
                        let t_value = col_val.find(".element-name-field").val();

                        // i type for select
                        let type = 'i';

                        if (t_value === "") {
                            t_value = 'null';
                            type = "s";
                        }

                        resultObject[t_column] = { value: t_value, type: type };
                    });

                    let arg = {
                        tableName: table,
                        objId: objId,
                        columnVal: resultObject
                    };
                    let promise_name;

                    if (operation_mode === 'update_value') {
                        promise_name = "update_cp_set_with_duplication_check";
                    } else if (operation_mode === 'new_value') {
                        promise_name = "insert_cp_set_with_duplication_check";
                    } else if (operation_mode === 'delete_value') {
                        promise_name = "delete_cp_set";
                    } else {
                        // Should not land here
                        alert('Something went wrong');
                        console.log('Haha what are you doing?');
                        return false;
                    }
                    // Sending data

                    fetchObjects([{ "name": promise_name, "arg": arg }]).then(function (data) {
                        if (data[promise_name].status) {
                            // Succeed
                            alert('บันทึกข้อมูลสำเร็จ');
                            location.reload();
                            return;
                        } else {


                            // errorCode 100 (duplicated data)
                            // errorCode 400 (query error)
                            // Failed to update
                            if (promise_name == "insert_cp_set_with_duplication_check" || promise_name == "update_cp_set_with_duplication_check") {
                                let errorCode = data[promise_name].errorCode;
                                if (errorCode == 100) {
                                    alert(`ไม่สามารถบันทึกรายการนี้ได้ มีรูปแบบนี้สำหรับยาชนิดนี้แล้ว`);
                                    return;
                                } else {
                                    // errorCode 400
                                    alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณารีเฟลช`);
                                    return;
                                }

                            } else if (promise_name === 'delete_cp_set') {
                                alert('ไม่สามารถลบรายการนี้ได้');
                                return;
                            } else {
                                alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณารีเฟลช');
                                return;
                            }


                        }

                    })
                        .catch(function (error) {
                            console.log(error);
                        })


                }


            }


        });

        cancel_button.on('click', function () {
            popup_context.empty();
            $('#edit-popUpForm').css('display', 'none');
            $('#dark-overlay').css('display', 'none');
        });



    }




    function config_popup(table_mode, item_id, item_object, oper_mode) {
        popup_context.empty();
        const hidden_mode_input = $('<input>').attr('type', 'hidden').attr('id', 'popup-hidden-mode-input').val(table_mode);
        const hidden_item_id_input = $('<input>').attr('type', 'hidden').attr('id', 'popup-hidden-item_id-input').val(item_id);
        const hidden_oper_mode_input = $('<input>').attr('type', 'hidden').addClass('operation-input-hidden').val(oper_mode);
        const field_container = $('<div>').attr('id', 'config-popup-div');
        const button_container = $('<div>').attr('id', 'config-popup-button-div');
        const confirm_button = $('<button>').attr('type', 'button').addClass('config-popup-oper-btn config-popup-confirm-btn').text('บันทึก');
        const cancel_button = $('<button>').attr('type', 'button').addClass('config-popup-oper-btn config-popup-cancel-btn').text('ยกเลิก');

        button_container.append(confirm_button, cancel_button);

        popup_context.append(hidden_mode_input, hidden_item_id_input, hidden_oper_mode_input, field_container, button_container);
        if (oper_mode == "update_value") {
            if (table_mode == "master_mold") {

                let listed_mold_set = select_data_for_master_mold.m_set;
                let listed_mold_type = select_data_for_master_mold.m_type;
                let listed_mold_status = select_data_for_master_mold.m_status;

                field_container.html(`
            <div class="input-field-cont">
            <span class="id-span">ID: ${item_object.id}</span>
            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="unique_code">
            <label class="ele-field-label">รหัส</label>
            <input type='text' class="element-name-field" value="${item_object.unique_code}" placeholder="รหัส Change Part (YCH-XXX)" maxlength="50" required>
            </div>
            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="name">
            <label class="ele-field-label">ชื่อ CP</label>
            <input type='text' class="element-name-field" value="${item_object.name}" placeholder="ชื่อเรียก" maxlength="255" required>
            </div>
            
            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="fk_moldset">
            <label class="ele-field-label">เซ็ต CP: </label>
            <select class='element-name-field'>
            ${generate_option_html(item_object.fk_moldset, listed_mold_set)}
            </select>
            </div>

            <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="fk_mold_type">
        <label class="ele-field-label">ประเภท CP: </label>
        <select class='element-name-field'>
        ${generate_option_html(item_object.fk_mold_type, listed_mold_type)}
        </select>
        </div>


        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="active_status">
        <label class="ele-field-label">สถานะ: </label>
        <select class='element-name-field'>
        ${generate_option_html(item_object.active_status_id, listed_mold_status)}
        </select>
        </div>

        <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="location">
            <label class="ele-field-label">สถานที่เก็บ</label>
            <input type='text' class="element-name-field" value="${item_object.location}" placeholder="สถานที่เก็บ" maxlength="50" required>
            </div>

            </div>
            `);



            } else {

                if (table_mode == "operating_machine") {
                    let listed_real_machine = select_data_for_real_mc;
                    field_container.html(`
            <div class="input-field-cont">

            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="id">
            <label class="ele-field-label">รหัสเครื่อง</label>
            <select class='element-name-field'>
            ${generate_option_html(item_object.id, listed_real_machine)}
            </select>
            </div>

            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="name">
            <label class="ele-field-label">ชื่อเรียกเครื่อง</label>
            <input type='text' class="element-name-field" value="${item_object.name}" placeholder="ชื่อเรียก" maxlength="255" required>
            </div>
            </div>
            `);
                } else {

                    field_container.html(`
                <div class="input-field-cont">
                <span class="id-span">ID: ${item_object.id}</span>
                <div class="input-ele-cont">
                <input type="hidden" class='column-name-hidden' value="name">
                <label class="ele-field-label">ชื่อรายการ</label>
                <input type='text' class="element-name-field" value="${item_object.name}" placeholder="ชื่อเรียก" maxlength="255" required>
                </div>
                </div>
                `);
                }


            }

        } else if (oper_mode == "delete_value") {

            field_container.html(`<span class="operation" style="color:#f00;"><b>ยืนยันการลบรายการ?</b></span>
            <span class="id-span" style="color:#f00;"><b>ID:</b> ${item_object.id}</span>
            <span class="name-span"><b>รายการ:</b> ${item_object.name}</span>`);


        } else if (oper_mode == "new_value") {

            if (table_mode == "master_mold") {

                let listed_mold_set = select_data_for_master_mold.m_set;
                let listed_mold_type = select_data_for_master_mold.m_type;
                let listed_mold_status = select_data_for_master_mold.m_status;

                field_container.html(`
            <div class="input-field-cont">
            <span class="id-span">ID: สร้างรายการใหม่</span>
            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="unique_code">
            <label class="ele-field-label">รหัส</label>
            <input type='text' class="element-name-field" value="" placeholder="รหัส Change Part (YCH-XXX)" maxlength="50" required>
            </div>
            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="name">
            <label class="ele-field-label">ชื่อ CP</label>
            <input type='text' class="element-name-field" value="" placeholder="ชื่อเรียก" maxlength="255" required>
            </div>
            
            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="fk_moldset">
            <label class="ele-field-label">เซ็ต CP: </label>
            <select class='element-name-field'>
            ${generate_option_html(null, listed_mold_set)}
            </select>
            </div>

            <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="fk_mold_type">
        <label class="ele-field-label">ประเภท CP: </label>
        <select class='element-name-field'>
        ${generate_option_html(null, listed_mold_type)}
        </select>
        </div>


        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="active_status">
        <label class="ele-field-label">สถานะ: </label>
        <select class='element-name-field'>
        ${generate_option_html(null, listed_mold_status)}
        </select>
        </div>

        <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="location">
            <label class="ele-field-label">สถานที่เก็บ</label>
            <input type='text' class="element-name-field" value="" placeholder="สถานที่เก็บ" maxlength="50" required>
            </div>

            </div>
            `);



            } else {

                if (table_mode == "operating_machine") {
                    let listed_real_machine = select_data_for_real_mc;
                    field_container.html(`
            <div class="input-field-cont">

            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="id">
            <label class="ele-field-label">รหัสเครื่อง</label>
            <select class='element-name-field'>
            ${generate_option_html(null, listed_real_machine)}
            </select>
            </div>

            <div class="input-ele-cont">
            <input type="hidden" class='column-name-hidden' value="name">
            <label class="ele-field-label">ชื่อเรียกเครื่อง</label>
            <input type='text' class="element-name-field" value="" placeholder="ชื่อเรียก" maxlength="255" required>
            </div>
            </div>
            `);
                } else {

                    field_container.html(`
                <div class="input-field-cont">
                <span class="id-span">ID: สร้างรายการใหม่</span>
                <div class="input-ele-cont">
                <input type="hidden" class='column-name-hidden' value="name">
                <label class="ele-field-label">ชื่อรายการ</label>
                <input type='text' class="element-name-field" value="" placeholder="ชื่อเรียก" maxlength="255" required>
                </div>
                </div>
                `);
                }


            }



        } else {
            // Not expecting anything here
        }

        confirm_button.on('click', function () {
            const all_select_form = field_container.find('.input-field-cont .input-ele-cont select');
            const all_input_form = field_container.find('.input-field-cont .input-ele-cont input[type="text"]');
            const operation_mode = popup_context.find('.operation-input-hidden').val();
            let inputflag = true;

            all_input_form.each(function () {
                const inputElement = $(this);

                if (!isSafeInput(inputElement.val())) {
                    inputElement.val('');
                    inputflag = false;
                }

            });

            all_select_form.each(function () {
                const selectElement = $(this);

                if (isNaN(parseInt(selectElement.val()))) {
                    // If the option's value is changed (abnormal...)
                    alert("ข้อมูลไม่ถูกต้อง");
                    inputflag = false;
                    return false;
                }

            });


            if (!inputflag) {
                alert(`ตัวอักษรที่ห้ามใช้( '";<> ) หรือ กรอกข้อมูลไม่ครบถ้วน`);
                return false; // Use "return false" to break out of the loop
            } else {

                const all_col_val = field_container.find('.input-field-cont .input-ele-cont');
                const table = hidden_mode_input.val();
                const objId = hidden_item_id_input.val() ?? null;

                if (operation_mode === 'update_value' || operation_mode === 'delete_value') {
                    // Dont have to check if mode == insert_value
                    if (isNaN(parseInt(objId))) {
                        alert('เกิดข้อผิดพลาด กรุณารีเฟลช');
                        return false;
                    }
                }

                if (!isSafeInput(table)) {
                    alert('เกิดข้อผิดพลาด กรุณารีเฟลช');
                    return false;
                } else {
                    const resultObject = {}; // Initialize an empty object

                    all_col_val.each(function () {
                        const col_val = $(this);
                        const t_column = col_val.find(".column-name-hidden").val();
                        const t_value = col_val.find(".element-name-field").val();

                        const elementType = col_val.find(".element-name-field")[0].tagName.toLowerCase();

                        // i type for select
                        const type = elementType === 'select' ? 'i' : 's';

                        resultObject[t_column] = { value: t_value, type: type };
                    });

                    let arg = {
                        tableName: table,
                        objId: objId,
                        columnVal: resultObject
                    };
                    let promise_name;

                    if (operation_mode === 'update_value') {
                        promise_name = "update_config";
                    } else if (operation_mode === 'new_value') {
                        promise_name = "insert_config";
                    } else if (operation_mode === 'delete_value') {
                        promise_name = "delete_config";
                    } else {
                        // Should not land here
                        alert('Something went wrong');
                        console.log('Haha what are you doing?');
                        return false;
                    }
                    // Sending data

                    fetchObjects([{ "name": promise_name, "arg": arg }]).then(function (data) {
                        if (data[promise_name]) {
                            // Succeed
                            alert('บันทึกข้อมูลสำเร็จ');
                            location.reload();
                            return;
                        } else {
                            // Failed to update
                            if (promise_name == "update_config" || promise_name == "insert_config") {
                                alert(`ไม่สามารถบันทึกรายการนี้ได้ มีข้อมูลทับซ้อนในระบบ กรุณาตรวจสอบความถูกต้องของข้อมูล`);
                                return;
                            } else if (promise_name === 'delete_config') {
                                alert('ไม่สามารถลบรายการนี้ได้เนื่องจากมีรายการที่ถูกบันทึกด้วยรายการนี้แล้ว');
                                return;
                            } else {
                                alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณารีเฟลช');
                                return;
                            }


                        }

                    })
                        .catch(function (error) {
                            console.log(error);
                        })


                }


            }


        });

        cancel_button.on('click', function () {
            popup_context.empty();
            $('#edit-popUpForm').css('display', 'none');
            $('#dark-overlay').css('display', 'none');
        });

    }

    function generate_option_html(selected_option = null, options_array) {
        let optionHtml = `<option value="" ${selected_option == null ? "selected" : ""} disabled>-โปรดระบุ-</option>`;
        $.each(options_array, function (id, name) {
            optionHtml += `<option value="${id}" ${id == selected_option ? "selected" : ""}>${name}</option>`;
        });
        return optionHtml;
    }

    function generate_option_html_allow_notUsed(selected_option = null, options_array) {
        let optionHtml = `<option value="" ${selected_option == null ? "selected" : ""}>-ไม่ใช้งาน-</option>`;

        $.each(options_array, function (id, name) {
            optionHtml += `<option value="${id}" ${id == selected_option ? "selected" : ""}>${name}</option>`;
        });
        return optionHtml;
    }

    function generate_config_table(array_data, container_element, table_mode) {

        container_element.empty();
        const hidden_table_mode = $('<input>').attr('type', 'hidden').attr('id', 'hidden_table_mode').val(table_mode);
        let config_table = $('<table>').addClass('small-detail-table config-table');
        let config_thead = $('<thead>');
        let config_tbody = $('<tbody>');
        config_table.append(config_thead, config_tbody);

        container_element.append(hidden_table_mode, config_table);

        config_thead.html(`
        <tr>
        <th>ลำดับ</th>
        <th>id</th>
        ${table_mode == "master_mold" ? "<th>รหัส</th>" : ""}
        <th>ชื่อ</th>
        ${table_mode == "master_mold" ? "<th>สถานะ</th>" : ""}
        <th>#</th>
        </tr>
        `);

        if (array_data.length > 0) {
            let order = 1;

            let status_color;

            array_data.forEach(itmList => {
                if (table_mode == "master_mold") {
                    if (itmList.active_status_id == 1) {
                        status_color = "#1d9800";
                    } else if (itmList.active_status_id == 2) {
                        status_color = "#f60000";
                    } else {
                        status_color = "#ea7f09";
                    }
                }
                let oper_btn_cont = $('<div>').addClass('config-oper-btn-cont');
                let edit_btn = itmList.editable == 1 ? $('<button>').attr('type', 'button').addClass('config-oper-btn config-edit-btn').attr('data-itm-id', itmList.id) : "";
                let del_btn = itmList.deletable == 1 ? $('<button>').attr('type', 'button').addClass('config-oper-btn config-del-btn').attr('data-itm-id', itmList.id) : "";
                oper_btn_cont.append(edit_btn, del_btn)
                let moldCode_th = table_mode == "master_mold" ? $('<td>').html(itmList.unique_code) : "";
                let moldStatus_th = table_mode == "master_mold" ? $(`<td style="color:${status_color};">`).html(itmList.active_status) : "";
                let newRow = $('<tr>').addClass('config-item');
                let order_th = $('<td>').html(order);
                let id_th = $('<td>').html(itmList.id);
                let name_th = $('<td>').html(itmList.name);
                let input_hidden_id = $('<input>').attr('type', 'hidden').addClass('hidden-itm-id').val(itmList.id);
                let oper_th = $('<td>').append(oper_btn_cont, input_hidden_id);

                newRow.append(order_th, id_th, moldCode_th, name_th, moldStatus_th, oper_th);
                config_tbody.append(newRow);
                order += 1;
            });

        } else {
            config_tbody.html('<tr><td colspan="4">-- ไม่มีรายการในหมวดหมู่นี้ --</td></tr>')
        }

        config_tbody.on('click', '.config-oper-btn', function () {
            const clicked_itm_id = $(this).attr('data-itm-id');
            const hidden_itm_id = $(this).closest('tr').find('input.hidden-itm-id').val();
            const table_mode = hidden_table_mode.val();

            if (hidden_itm_id !== clicked_itm_id) {
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                console.log('What are you doing?');
                return false;
            }

            let item_object = $.grep(array_data, function (obj) {
                return obj.id == hidden_itm_id;
            });

            if (item_object.length === 0) {
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return false;
            }

            if ($(this).hasClass('config-edit-btn')) {
                // Display the popup 
                config_popup(table_mode, hidden_itm_id, item_object[0], "update_value");
                $('#edit-popUpForm').css('display', 'block');
                $('#dark-overlay').css('display', 'block');

            } else if ($(this).hasClass('config-del-btn')) {
                // Delete item
                config_popup(table_mode, hidden_itm_id, item_object[0], "delete_value");
                $('#edit-popUpForm').css('display', 'block');
                $('#dark-overlay').css('display', 'block');

            } else {
                // Expect nothing here
            }


        })


    }


    function display_alert_changepart_specific_popup(change_part_detail_array, change_part_id) {
        popup_context.empty();
        const config = {
            altInput: true,
            altFormat: "j F Y",
            dateFormat: 'Y-m-d', // Date format (YYYY-MM-DD)
            maxDate: 'today',
            disableMobile: "true",
            onOpen: function (selectedDates, dateStr, instance) {
                // Get the IDs of the start and end date inputs
                const startDateInputId = "startDate";
                const endDateInputId = "endDate";

                // Get the selected dates from both inputs
                const startDate = $("#" + startDateInputId)[0].value;
                const endDate = $("#" + endDateInputId)[0].value;
                // Calculate the minimum and maximum dates for the current input
                let minDate = null;
                let maxDate = null;

                if (instance.input.id === startDateInputId) {
                    // If the current input is the start date, set the minimum date for the end date
                    minDate = null;
                    maxDate = endDate; // Limit end date to today
                } else if (instance.input.id === endDateInputId) {
                    // If the current input is the end date, set the minimum date for the start date
                    minDate = startDate; // No minimum date for start date
                    maxDate = 'today' // Maximum date is the selected end date
                }

                // Update the minDate and maxDate options for the current input
                instance.set("minDate", minDate);
                instance.set("maxDate", maxDate);
            }
        };
        let specific_cp_div = $('<div>').attr('id', 'cp-popup-div');
        let cp_detail_div = $('<div>').attr('id', 'cp-popup-detail-div').addClass('sub-popup-div');
        let cp_detail_topic_label = $('<label>').addClass('specific-detail-topic-label').text('รายละเอียด Change Part');
        let cp_detail_information_div = $('<div>').attr('id', 'specific_change_part_information_div');
        let cp_specific_production_table_div = $('<div>').addClass('sub-popup-div');
        let cp_specific_production_table_topic_label = $('<label>').addClass('specific-detail-topic-label').text('รายการเดินยาที่เกี่ยวข้อง');
        let cp_specific_production_table_cont = $('<div>').addClass('scroll-table pop-up-scroll-table');
        let cp_specific_production_table = $('<table>').addClass('small-detail-table');

        const mold_id_hidden_input = $('<input>').attr('type', 'hidden').attr('id', 'hidden-mold-id-input').val(change_part_id);



        let cp_information = $('<div>').attr('id', 'mold-info').html(`
        <div class="info-item">
          <span class="info-label">รหัส:</span>
          <span class="info-value">${change_part_detail_array.unique_code}</span>
        </div>
        <div class="info-item">
          <span class="info-label">ชื่อ:</span>
          <span class="info-value">${change_part_detail_array.mold_name}</span>
        </div>
        <div class="info-item">
          <span class="info-label">เซ็ต:</span>
          <span class="info-value">${change_part_detail_array.mold_set}</span>
        </div>
        <div class="info-item">
          <span class="info-label">ประเภท:</span>
          <span class="info-value">${change_part_detail_array.mold_type}</span>
        </div>
        <div class="info-item">
          <span class="info-label">สถานะ:</span>
          <span class="info-value">${change_part_detail_array.mold_status}</span>
        </div>
        <div class="info-item">
          <span class="info-label">สถานที่เก็บ:</span>
          <span class="info-value">${change_part_detail_array.mold_location}</span>
        </div>
      `);

        cp_detail_information_div.append(mold_id_hidden_input, cp_information);

        let timefilter_div = $('<div>').addClass('sub-popup-div').attr('id', 'time-filter-div');
        let oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        let start_date_Object = $('<input>').addClass('flatpickr filter-date-input').attr('id', 'startDate').attr('type', 'text').attr('max', new Date().toISOString().split('T')[0]).val(oneMonthAgo.toISOString().split('T')[0]);
        let end_date_Object = $('<input>').addClass('flatpickr filter-date-input').attr('id', 'endDate').attr('type', 'text').attr('max', new Date().toISOString().split('T')[0]).val(new Date().toISOString().split('T')[0]);

        let start_date_div = $('<div>').addClass('flatpickr-cont').append(start_date_Object);
        let end_date_div = $('<div>').addClass('flatpickr-cont').append(end_date_Object);

        let date_label_cont = $('<div>').addClass('label-cont').append($('<label>').addClass('small-label').text('เลือกช่วงเวลาที่ต้องการค้นหา'));

        let datepick_div = $('<div>').addClass('date-picker-cont');

        datepick_div.append(start_date_div, $('<span>').text('ถึง'), end_date_div);
        timefilter_div.append(date_label_cont, datepick_div);
        datepick_div.find('.flatpickr').flatpickr(config);

        let cp_sepecific_production_thead = $('<thead>').html(`
        <tr>
        <th>เวลาเริ่ม Lot</th>
        <th>Lot No.</th>
        <th>ชื่อยา</th>
        <th>เครื่องที่เดินยา</th>
        <th>สถานะแจ้ง</th>
        <th>หมายเหตุ</th>
        </tr>
        `);
        let cp_sepecific_production_tbody = $('<tbody>').html(`<tr><td colspan="6"><b><u>-- ระบุช่วงเวลาที่ต้องการค้นหา --</u></b></td></tr>`);

        cp_specific_production_table.append(cp_sepecific_production_thead, cp_sepecific_production_tbody);
        cp_specific_production_table_cont.append(cp_specific_production_table);
        cp_detail_div.append(cp_detail_topic_label, cp_detail_information_div);
        cp_specific_production_table_div.append(cp_specific_production_table_topic_label, cp_specific_production_table_cont);

        specific_cp_div.append(cp_detail_div, timefilter_div, cp_specific_production_table_div);
        popup_context.append(specific_cp_div);


        timefilter_div.on('change', '.filter-date-input', function () {
            let moldId = mold_id_hidden_input.val();
            let startDate = (new Date($('#startDate').val())).toISOString().split('T')[0];
            let endDate = (new Date($('#endDate').val())).toISOString().split('T')[0];

            // Query between these date
            fetchObjects([{ "name": "fetch_production_mold", "arg": { "moldId": moldId, "startDate": startDate, "endDate": endDate } }]).then(function (data) {
                display_specific_production_table_body(cp_specific_production_table, data.fetch_production_mold.mold_usage_log);
            })
                .catch(function (error) {
                    console.log(error);
                    alert('พบปัญหา กรุณารีเฟรช');
                    return false;
                });

        });



    }

    function display_specific_production_table_body(tableElement, change_part_array) {
        let cp_sepecific_production_tbody = tableElement.find('tbody');
        cp_sepecific_production_tbody.empty();
        if (change_part_array.length > 0) {

            change_part_array.forEach(pd_log => {

                let newRow = `
            <tr style="background-color:${pd_log.reported_status_id == 0 ? "#ffd0d0" : "#dfffec"}" class="specific-cp-production-detail" data-runcode="${pd_log.runcode}" data-lot_no="${pd_log.lot_no}" data-med_name= "${pd_log.med_name}">
            <td>${formatDateThai(pd_log.log_time)}</td>
            <td>${pd_log.lot_no}</td>
            <td>${pd_log.med_name}</td>
            <td>${pd_log.mc_id}: ${pd_log.mc_name_alias} <br><div class='text-scroll-container'><div class='text-scroll-div'>${pd_log.mc_name_real}</div></div></td>
            <td>${pd_log.reported_status_name}</td>
            <td>${pd_log.problem_text}</td>
            </tr>
            `;

                cp_sepecific_production_tbody.append(newRow);
            });

        } else {
            let newRow = `
            <tr>
            <td colspan="6">-- <b><u>ไม่มีการใช้งานในช่วงเวลานี้</u></b> --</td>
            </tr>
            `;
            cp_sepecific_production_tbody.append(newRow);

        }

        cp_sepecific_production_tbody.on("mouseenter", ".specific-cp-production-detail", function (event) {
            // Get the tooltip content
            $('body').find('.floating-text').remove();
            let itm_lot_no = $(this).attr("data-lot_no");
            let itm_med_name = $(this).attr("data-med_name");
            let tooltipContent = `Lot - ${itm_lot_no}: ${itm_med_name}: <span style="color: #28b974;">คลิกเพื่อดูรายละเอียด Lot</span>`;
            // Create a new tooltip element
            let tooltip = $('<div>').addClass('floating-text').html(tooltipContent);


            // Calculate tooltip position based on mouse coordinates
            let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
            let y = event.clientY + window.scrollY + 10; // Adjust vertical position

            // Set tooltip position
            tooltip.css({ left: x + 'px', top: y + 'px' });


            // Append the tooltip to the body
            $('body').append(tooltip);

            // Show the tooltip
            tooltip.css('display', 'block');


            $(document).on("mousemove", function (event) {
                let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
                let y = event.clientY + window.scrollY + 10; // Adjust vertical position

                // Update tooltip position
                tooltip.css({ left: x + 'px', top: y + 'px' });
            });


            $(this).mouseleave(function () {
                tooltip.css('display', 'none');
                tooltip.remove(); // Remove the tooltip element from the DOM
            });
        });



        cp_sepecific_production_tbody.on("click", ".specific-cp-production-detail", function () {
            // Retrieve the "data-runcode" attribute value
            let runcode = $(this).attr("data-runcode");

            // Open a new tab with PD_lot_detail.php and pass the runcode as a query parameter
            let url = "PD_lot_detail.php?runcode=" + encodeURIComponent(runcode);
            window.open(url, "_blank");
        });


    }


    function display_cp_list_table(tableElemnt, all_cp_data, filter_option) {
        let tbody = tableElemnt.find('tbody');
        tbody.empty();
        let cp_type_data = all_cp_data[filter_option];
        if (cp_type_data.length > 0) {


            cp_type_data.forEach(cp => {
                let newRow = `<tr class='change-part-data' data-cp-id="${cp.mold_id}" data-cp-code="${cp.mold_code}" data-cp-name="${cp.mold_name}">
                <td>${cp.mold_code}</td>
                <td>${cp.mold_name}</td>
                <td>${cp.mold_set}</td>
                <td>${cp.mold_type}</td>
                <td>${cp.mold_status}</td>
                </tr>`;

                tbody.append(newRow);
            });
        } else {
            let newRow = `<tr>
        <td colspan="5">ไม่มีรายการChangePart หมวดนี้</td>
        </tr>`;
            tbody.append(newRow);
        }


    }

    function generate_production_table(filtered_text = "") {
        const table_body = $('#production-table tbody');
        table_body.empty();
        let filteredArray = [...fetch_production_data];

        searchString = filtered_text.replace(/\s/g, '').toLowerCase(); // Remove spaces and normalize to lowercase
        if (searchString.length > 0) {
            filteredArray = fetch_production_data.filter(obj => {
                // Convert specified properties to lowercase and remove spaces
                const lot_no_LowerCase = obj.lot_no.replace(/\s/g, '').toLowerCase();
                const med_name_LowerCase = obj.med_name.replace(/\s/g, '').toLowerCase();
                const mc_name_alias_LowerCase = obj.mc_name_alias == null ? '' : obj.mc_name_alias.replace(/\s/g, '').toLowerCase();
                const mc_name_real_LowerCase = obj.mc_name_real ? obj.mc_name_real.replace(/\s/g, '').toLowerCase() : '';
                // Check if the search string is found in any of the specified properties
                return (
                    lot_no_LowerCase.includes(searchString) ||
                    med_name_LowerCase.includes(searchString) ||
                    mc_name_alias_LowerCase.includes(searchString) ||
                    mc_name_real_LowerCase.includes(searchString)
                );
            });
        }
        // Display the table
        if (filteredArray.length > 0) {
            filteredArray.forEach(lot => {
                let rowDetail = `
                <tr class='production_lot_row' data-runcode="${lot.runcode}" data-lot_no="${lot.lot_no}" data-med_name="${lot.med_name}">
                <td>${formatDateThai(lot.start_time)}</td>
                <td>${lot.lot_no}</td>
                <td>${lot.med_name}</td>
                <td class="mc-name-scroll-td">${lot.mc_id}: ${lot.mc_name_alias} <br><div class='text-scroll-container'><div class='text-scroll-div'>${lot.mc_name_real}</div></div></td>
                <td>${formatDateThai(lot.end_time)}</td>
                <td>${convertTimeFormat(lot.total_lot_time)}</td>
                </tr>
                `;

                table_body.append(rowDetail);
            });
        } else {
            // No production in criteria
            let rowDetail =
                `<tr>
                <td colspan='6'><b><u>-- ไม่มีรายการในการค้นหานี้ --</u></b></td>
                </tr>`
            table_body.append(rowDetail);
        }
        filteredArray = null;
    }


    function generate_blister_card_element(blister_data) {
        // Create the card element
        let card = $('<div>').addClass('blister-card-element');

        // Create the card header
        let header = $('<div>').addClass('card-header').text(`${blister_data.name} รหัสเครื่อง: ${blister_data.mcId}`);
        card.append(header);

        // Create labels for status, start time, and lot number

        let elemt_detail_div = $('<div>').addClass('blister-card-detail-cont');

        let col_1 = $('<div>').addClass('blister-card-detail-column blister-general-column');
        let col_2 = $('<div>').addClass('blister-card-detail-column blister-time-column');
        let col_3 = $('<div>').addClass('blister-card-detail-column blister-button-column');

        let statusLabel = $('<div>').addClass('blister-card-element-label').text('สถานะเครื่อง:');
        let statusValue = $('<div>').addClass('blister-card-element-value').text(blister_data.status_name);
        let lotNumberLabel = $('<div>').addClass('blister-card-element-label').text('Lot Number:');
        let lotNumberValue = $('<div>').addClass('blister-card-element-value').text(blister_data.using_lot_no);
        let setUpTimeLabel = $('<div>').addClass('blister-card-element-label').text('เวลาเริ่มตั้งเครื่อง:');
        let setUpTimeValue = $('<div>').addClass('blister-card-element-value').text(formatDateThai(blister_data.using_setup_start_time));
        let startTimeLabel = $('<div>').addClass('blister-card-element-label').text('เวลาเริ่มเดินยา:');
        let startTimeValue = $('<div>').addClass('blister-card-element-value').text(formatDateThai(blister_data.using_start_time));
        let medNameLabel = $('<div>').addClass('blister-card-element-label').text('ชื่อยา:');
        let medNameValue = $('<div>').addClass('blister-card-element-value').text(blister_data.using_med_name);
        // Create a label for time duration
        let durationLabel = $('<div>').addClass('blister-card-element-label').text('เวลาเดินยา:');
        let durationValue = $('<div>').addClass('blister-card-element-value blister-time-value-div');
        let hidden_start_time = `<input type='hidden' class="blister-card-element-value hidden-start-time-value" value='${blister_data.using_start_time}'>`

        // Calculate and set the time duration

        let startTime = new Date(blister_data.using_start_time);
        let currentTime = new Date();
        let timeDifference = currentTime - startTime;
        let durationHours = Math.floor(timeDifference / 3600000);
        let durationMinutes = Math.floor((timeDifference % 3600000) / 60000);
        let durationSeconds = Math.floor((timeDifference % 60000) / 1000);

        durationValue.text(`${isNaN(durationHours) ? '-' : durationHours} ชั่วโมง ${isNaN(durationMinutes) ? '-' : durationMinutes} นาที ${isNaN(durationSeconds) ? '-' : durationSeconds} วินาที`);

        col_1.append(statusLabel, statusValue, lotNumberLabel, lotNumberValue, medNameLabel, medNameValue, hidden_start_time);
        col_2.append(setUpTimeLabel, setUpTimeValue, startTimeLabel, startTimeValue, durationLabel, durationValue);
        col_3.append(`<button type="button" class="operation-button detail-button" data-blisId="${blister_data.mcId}">ข้อมูล</button>`);
        // Append labels and values to the card
        elemt_detail_div.append(col_1, col_2, col_3);


        card.append(elemt_detail_div);
        // Return the created card element
        return card;


    }

    function generate_full_blister_detail(mcId) {
        try {
            setInterval(updateDuration_General_Detail, 1000);

            let blister_data = $.grep(operating_machine_data, function (mc_data) {
                return mc_data.mcId == mcId
            });

            blister_data = blister_data[0];
            let card = $('<div>').addClass('blister-card-element');

            // Create the card header
            let header = $('<div>').addClass('card-header').text(`${blister_data.name} รหัสเครื่อง: ${blister_data.mcId}`);
            card.append(header);
            card.append($('<input>').attr('type', 'hidden').addClass('hidden-mc-id').val(blister_data.mcId));
            // Create labels for status, start time, and lot number

            let elemt_detail_div = $('<div>').addClass('blister-card-detail-cont');

            let col_1 = $('<div>').addClass('blister-card-detail-column blister-general-column');
            let col_2 = $('<div>').addClass('blister-card-detail-column blister-time-column');
            let col_3 = $('<div>').addClass('blister-card-detail-column blister-button-column');

            let statusLabel = $('<div>').addClass('blister-card-element-label').text('สถานะเครื่อง:');
            let statusValue = $('<div>').addClass('blister-card-element-value').text(blister_data.status_name);
            let lotNumberLabel = $('<div>').addClass('blister-card-element-label').text('Lot Number:');
            let lotNumberValue = $('<div>').addClass('blister-card-element-value').text(blister_data.using_lot_no);
            let setUpTimeLabel = $('<div>').addClass('blister-card-element-label').text('เวลาเริ่มตั้งเครื่อง:');
            let setUpTimeValue = $('<div>').addClass('blister-card-element-value').text(formatDateThai(blister_data.using_setup_start_time));
            let startTimeLabel = $('<div>').addClass('blister-card-element-label').text('เวลาเริ่มเดินยา:');
            let startTimeValue = $('<div>').addClass('blister-card-element-value').text(formatDateThai(blister_data.using_start_time));
            let medNameLabel = $('<div>').addClass('blister-card-element-label').text('ชื่อยา:');
            let medNameValue = $('<div>').addClass('blister-card-element-value').text(blister_data.using_med_name);
            // Create a label for time duration
            let durationLabel = $('<div>').addClass('blister-card-element-label').text('เวลาเดินยา:');
            let durationValue = $('<div>').addClass('blister-card-element-value blister-time-value-div').attr('data-startTime', blister_data.using_start_time);
            let hidden_start_time = `<input type='hidden' class="blister-card-element-value hidden-start-time-value" value='${blister_data.using_start_time}'>`

            // Calculate and set the time duration

            let startTime = new Date(blister_data.using_start_time);
            let currentTime = new Date();
            let timeDifference = currentTime - startTime;
            let durationHours = Math.floor(timeDifference / 3600000);
            let durationMinutes = Math.floor((timeDifference % 3600000) / 60000);
            let durationSeconds = Math.floor((timeDifference % 60000) / 1000);

            durationValue.text(`${isNaN(durationHours) ? '-' : durationHours} ชั่วโมง ${isNaN(durationMinutes) ? '-' : durationMinutes} นาที ${isNaN(durationSeconds) ? '-' : durationSeconds} วินาที`);



            col_1.append(statusLabel, statusValue, lotNumberLabel, lotNumberValue, medNameLabel, medNameValue, hidden_start_time);
            col_2.append(setUpTimeLabel, setUpTimeValue, startTimeLabel, startTimeValue, durationLabel, durationValue);


            let col3_div;
            if (blister_data.state == 1) {
                // Running -> Show Pause / Done
                // Reason must be provide for every time paused
                col3_div = `
                <div class='oper-but-cont'> 
                <button type="button"class="operation-button blister-pause-button" data-blisId='${blister_data.mcId}' data-mode='pause'>หยุดชั่วคราว</button>
                <button type="button"class="operation-button blister-done-button" data-blisId='${blister_data.mcId}' data-mode='lotDone'>จบ Lot</button>
                </div>
                `;
            } else if (blister_data.state == 2) {
                // Setup -> Show start
                col3_div = `
                <div class='oper-but-cont'> 
                <button type="button"class="operation-button blister-start-button" data-blisId='${blister_data.mcId}' data-mode='lotStart'>เริ่มเดินยา</button>
                <button type="button"class="operation-button blister-cancel-setup-button" data-blisId='${blister_data.mcId}' data-mode='cancelSetup'>ยกเลิกการตั้งเครื่อง</button>
                </div>
                `;


            } else if (blister_data.state == 3) {
                // Idle -> Show setup
                col3_div = `
                <div class='oper-but-cont'> 
                <button type="button"class="operation-button blister-setup-button" data-blisId='${blister_data.mcId}' data-mode='setupStart'>เริ่มตั้งเครื่อง Lot ใหม่</button>
                </div>
                `;
            } else if (blister_data.state == 4) {
                // Pause (on Break or sth similar) -> show Continue / Change Mold/ Done
                // Reason must be provide for every time paused
                col3_div = `
                <div class='oper-but-cont'> 
                <button type="button"class="operation-button blister-continue-button" data-blisId='${blister_data.mcId}' data-mode='continue'>เริ่มเดินยาต่อ</button>
                <button type="button"class="operation-button blister-CPchange-button" data-blisId='${blister_data.mcId}' data-mode='cpchange'>เปลี่ยน CP</button>
                <button type="button"class="operation-button blister-done-button" data-blisId='${blister_data.mcId}' data-mode='lotDone'>จบ Lot</button>
                </div>
                `;
            }


            col_3.append(col3_div);
            // Append labels and values to the card

            elemt_detail_div.append(col_1, col_2, col_3);


            let operation_field = $('<div>').addClass('blister_card_operation');
            card.find('.blister_card_operation').remove(); //Remove if it present.


            card.append(elemt_detail_div, operation_field);
            // Return the created card element





            if (blister_data.state == 1) {
                // Start -> Show using molds and total time spent for setup
                generate_general_detail(mcId, blister_data.state);




            } else if (blister_data.state == 2) {


            } else if (blister_data.state == 4) {
                // pause -> Return of mold and change mold
                generate_general_detail(mcId, blister_data.state);
            }


            return card;

        }
        catch (error) {
            console.log(error);
            return false;
        }


    }



    function updateDuration() {

        let blister_elements = $('#main-oper-div').find('.blister-card-element');
        let context_popup_element = popup_context.find('.blister-card-element');

        blister_elements = blister_elements.add(context_popup_element);

        blister_elements.each(function () {

            let blister_element = $(this);

            let durationDivElement = blister_element.find('.blister-card-detail-cont .blister-time-column .blister-time-value-div');
            let blister_start_time = blister_element.find('.blister-card-detail-cont .blister-general-column .hidden-start-time-value').val();

            let startTime = new Date(blister_start_time);
            let currentTime = new Date();
            let timeDifference = currentTime - startTime;
            let durationHours = Math.floor(timeDifference / 3600000);
            let durationMinutes = Math.floor((timeDifference % 3600000) / 60000);
            let durationSeconds = Math.floor((timeDifference % 60000) / 1000);

            durationDivElement.text(`${isNaN(durationHours) ? '-' : durationHours} ชั่วโมง ${isNaN(durationMinutes) ? '-' : durationMinutes} นาที ${isNaN(durationSeconds) ? '-' : durationSeconds} วินาที`);
        });

    }

    function updateDuration_General_Detail() {
        let time_element = popup_context.find('.blister-card-element .blister_card_operation .time-updated-text');

        time_element.each(function () {

            let time_element = $(this);

            let blister_start_time = time_element.attr('data-started-time');

            let startTime = new Date(blister_start_time);
            let currentTime = new Date();
            let timeDifference = currentTime - startTime;
            let durationHours = Math.floor(timeDifference / 3600000);
            let durationMinutes = Math.floor((timeDifference % 3600000) / 60000);
            let durationSeconds = Math.floor((timeDifference % 60000) / 1000);

            time_element.text(`${isNaN(durationHours) ? '-' : durationHours} ชั่วโมง ${isNaN(durationMinutes) ? '-' : durationMinutes} นาที ${isNaN(durationSeconds) ? '-' : durationSeconds} วินาที`);
        });

    }


    function defineChangePartOptionsArray(fetchedPartArray, required) {
        const option = [];
        if (required) {

            fetchedPartArray.forEach(parts => {
                option.push($('<option>', {
                    value: parts.mold_id,
                    text: `${parts.mold_name} รหัส: ${parts.mold_code} `
                }));
            });


        } else {

            fetchedPartArray.forEach(parts => {
                option.push($('<option>', {
                    value: parts.mold_id,
                    text: `${parts.mold_name} รหัส: ${parts.mold_code} `
                }));
            });
        }

        return option;
    }


    function generate_general_detail(mcId, state) {
        let containerDiv = $('<div>').addClass('general_detail_cont');

        fetchObjects([{ "name": "fetch_operatingMachines", "arg": { "mcId": mcId } }]).then(function (data) {

            if (data.fetch_operatingMachines.status) {

                current_machineObject = data.fetch_operatingMachines.operating_data[0];

                let time_row_div = $('<div>').addClass('general-detail-row general-column-inside');

                let total_setup_col_div = $('<div>').addClass('insided-column insided-column-1').html(`<div class="column-label-cont"><label>รวมเวลาตั้งเครื่อง</label></div>`);
                let total_pause_div = $('<div>').addClass('insided-column insided-column-2').html(`<div class="column-label-cont"><label>รวมเวลาหยุด</label></div>`);
                let current_pause_div = $('<div>').addClass('insided-column insided-column-3').html(`<div class="column-label-cont"><label>เวลาหยุดปัจจุบัน</label></div>`);

                total_setup_col_div.append($('<label>').html(`${convertTimeFormat(current_machineObject.using_setup_duration)}`));
                total_pause_div.append($('<label>').html(`${convertTimeFormat(current_machineObject.using_pause_duration)}`));
                current_pause_div.append($('<label>').addClass('time-label').attr('data-started-time', current_machineObject.using_last_stop_time).html('-'));
                if (state == 4) {
                    current_pause_div.find('.time-label').addClass('time-updated-text');
                }

                time_row_div.append(total_setup_col_div, total_pause_div, current_pause_div);

                let forming_top_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ขึ้นรูป บน :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_form_top_unique_code}: ${current_machineObject.using_form_top_name}</label> </div>`);
                let forming_bot_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ขึ้นรูป ล่าง :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_form_bot_unique_code}: ${current_machineObject.using_form_bot_name}</label> </div>`);
                let sealing_top_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ซีล บน :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_seal_top_unique_code}: ${current_machineObject.using_seal_top_name}</label> </div>`);
                let sealing_bot_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ซีลล่าง :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_seal_bot_unique_code}: ${current_machineObject.using_seal_bot_name}</label> </div>`);
                let guide_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ชุดราง :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_guide_unique_code}: ${current_machineObject.using_guide_name}</label> </div>`);
                let cutting_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ชุดตัด :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_cut_unique_code}: ${current_machineObject.using_cut_name}</label> </div>`);
                let perforation_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ชุดปรุ :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_perfor_unique_code == 'N/A' ? 'ไม่ใช้งาน' : current_machineObject.using_perfor_unique_code}: ${current_machineObject.using_perfor_name == 'N/A' ? '-' : current_machineObject.using_perfor_name}</label></div>`);


                containerDiv.append(time_row_div, forming_top_div, forming_bot_div, sealing_top_div, sealing_bot_div, guide_div, cutting_div, perforation_div)

                while (true) {
                    let operation_field_cont = $('#form-context').find('.blister_card_operation');
                    if (operation_field_cont.length > 0) {

                        if (operation_field_cont.find('.general_detail_cont').length > 0) {
                            operation_field_cont.find('.general_detail_cont').remove();
                        }
                        operation_field_cont.append(containerDiv);
                        return true;
                    }
                }



            } else {
                console.log("Function Returned false");
                alert('เกิดข้อผิดพลาดกรุณารีเฟรช');
                return false;
            }


        })
            .catch(function (error) {
                console.log(error);
                alert('เกิดข้อผิดพลาดกรุณารีเฟรช');
                return false;

            });


    }




    function initElements() {


        const fetch_url = {
            "show_dashboard_menu": "show_dashboard_menu",
            "show_alert_cp": "show_alert_cp",
            "show_med_history": "show_med_history",
            "show_config_menu": "show_config_menu",
            "edit_cp_set": "edit_cp_set"
        }

        const mode_name = {
            "show_dashboard_menu": "Dashboard",
            "show_alert_cp": "ประวัติ Change Part",
            "show_med_history": "ประวัติการเดินยา",
            "show_config_menu": "Configuration",
            "edit_cp_set": "แก้ไขชุดเดินยา"
        }

        $('.sidebar .menu-item a').on("click", function (e) {
            e.preventDefault();
            let selectedMenu = fetch_url[$(this).attr("id")];
            let selectedModeName = mode_name[$(this).attr("id")];

            if (selectedMenu) {

                if(display_operation(selectedMenu)) {
                    mode_hidden.val(selectedMenu);
                    labelHeader.html(selectedModeName);
                }
                


            } else {
                console.log(`error with this id: ${(this).attr("id")}`);
            }

        });

        $("#small-popup-close").click(function () {
            small_popup_div.fadeOut();
            small_popup_content.empty();
        });


        $('#closepopUp').on("click", () => {
            const container_div = $('#form-context');
            $('#edit-popUpForm').css('display', 'none');
            $('#dark-overlay').css('display', 'none');
            container_div.html("");
        });
    }


    whoamina().then(function (data) {

        whoamiObj = data;

    initElements();
    })
    .catch((error) => {
        console.log(error);
        alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
        return false;

    });


    function appendRadioErrorInput(parentElement) {
        let key = parentElement.attr('data-element-key');
        let cp_id = parentElement.attr('data-cp-id');

        if (!isNaN(parseInt(cp_id))) {

            const Radio = $('<input>').addClass('moldDone-radio').attr('type', 'radio').attr('name', `${key}-radio`).val('1');
            const Label = $('<label>').css('color', '#2ea84a').html('ไม่เกิดปัญหา');
            const ProblemRadio = $('<input>').addClass('moldDone-radio').attr('type', 'radio').attr('name', `${key}-radio`).val('0');
            const ProblemLabel = $('<label>').css('color', '#ff0000').html('เกิดปัญหา');
            const Input = $('<input>').attr('type', 'text').attr('data-element-key', key).attr('placeholder', 'กรุณาระบุปัญหาที่เกิดกับโมลระหว่างผลิต เช่น ยาเข้าโมล, เกิดความเสียหายกับโมล').attr('maxlength', 255).addClass('moldDone-problem-input').hide(); // Initially hidden
            let radioCont = $('<div>').addClass('moldDone-radio-cont').append(Radio, Label, ProblemRadio, ProblemLabel)
            parentElement.append(radioCont, Input);

            parentElement.on('change', '.moldDone-radio', function () {
                const radioButton = $(this);

                if (radioButton.val() == '0') {
                    // Show the input field when 'Problem' is selected
                    Input.addClass('displayed-input').show();
                } else {
                    // Hide and clear the input field when 'OK' is selected
                    Input.removeClass('displayed-input').hide().val('');
                }

            });
        } else {
            // Handle N/A element
            //nothing for now
        }

    }




    function cpset_UI_display(current_set, new_set) {
        let forming_top_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ขึ้นรูป บน :</label></div><div class="cp-name-cont"><label class="cp-name">${this_mc_data.using_form_top_unique_code}: ${this_mc_data.using_form_top_name}</label> </div>`);
        let forming_bot_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ขึ้นรูป ล่าง :</label></div><div class="cp-name-cont"><label class="cp-name">${this_mc_data.using_form_bot_unique_code}: ${this_mc_data.using_form_bot_name}</label> </div>`);
        let sealing_top_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ซีล บน :</label></div><div class="cp-name-cont"><label class="cp-name">${this_mc_data.using_seal_top_unique_code}: ${this_mc_data.using_seal_top_name}</label> </div>`);
        let sealing_bot_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ซีลล่าง :</label></div><div class="cp-name-cont"><label class="cp-name">${this_mc_data.using_seal_bot_unique_code}: ${this_mc_data.using_seal_bot_name}</label> </div>`);
        let guide_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ชุดราง :</label></div><div class="cp-name-cont"><label class="cp-name">${this_mc_data.using_guide_unique_code}: ${this_mc_data.using_guide_name}</label> </div>`);
        let cutting_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ชุดตัด :</label></div><div class="cp-name-cont"><label class="cp-name">${this_mc_data.using_cut_unique_code}: ${this_mc_data.using_cut_name}</label> </div>`);
        let perforation_div = $('<div>').addClass('general-detail-row').html(`<div class="detail-label-cont"><label class="general-detail-header-label">ชุดปรุ :</label></div><div class="cp-name-cont"><label class="cp-name">${this_mc_data.using_perfor_unique_code == 'N/A' ? 'ไม่ใช้งาน' : this_mc_data.using_perfor_unique_code}: ${this_mc_data.using_perfor_name == 'N/A' ? '-' : this_mc_data.using_perfor_name}</label></div>`);

    }


    $('#edit-popUpForm').on('click', '.oper-but-cont .operation-button', function () {
        let operation_field = $('#edit-popUpForm').find('.blister_card_operation');
        let mode = $(this).attr('data-mode');
        let mcId = $('#form-context').find('.blister-card-element input.hidden-mc-id').val();
        if (mode == 'cpchange') {

            if (confirm('ต้องการแจ้งเปลี่ยน Change part?')) {

                fetchObjects([{ "name": "fetch_operatingMachines", "arg": { "mcId": mcId } }]).then(function (data) {

                    if (!data.fetch_operatingMachines.status) {
                        throw new Error('Query Error');
                    }
                    let operation_detail_field = $('<div>').addClass("operation-detail-cont");
                    let operation_detail_button_cont = $('<div>').addClass("operation-detail-button-cont");
                    let this_mc_data = data.fetch_operatingMachines.operating_data[0];
                    let med_id = this_mc_data.using_med_id;
                    let runcode = this_mc_data.runcode;

                    const avail_object = {
                        "avail_form_top_set": {
                            "id": this_mc_data.using_form_top_id,
                            "unique_code": this_mc_data.using_form_top_unique_code,
                            "name": this_mc_data.using_form_top_name
                        },
                        "avail_form_bot_set": {
                            "id": this_mc_data.using_form_bot_id,
                            "unique_code": this_mc_data.using_form_bot_unique_code,
                            "name": this_mc_data.using_form_bot_name
                        },
                        "avail_seal_top_set": {
                            "id": this_mc_data.using_seal_top_id,
                            "unique_code": this_mc_data.using_seal_top_unique_code,
                            "name": this_mc_data.using_seal_top_name
                        },
                        "avail_seal_bot_set": {
                            "id": this_mc_data.using_seal_bot_id,
                            "unique_code": this_mc_data.using_seal_bot_unique_code,
                            "name": this_mc_data.using_seal_bot_name
                        },
                        "avail_guide_set": {
                            "id": this_mc_data.using_guide_id,
                            "unique_code": this_mc_data.using_guide_unique_code,
                            "name": this_mc_data.using_guide_name
                        },
                        "avail_cutting_set": {
                            "id": this_mc_data.using_cut_id,
                            "unique_code": this_mc_data.using_cut_unique_code,
                            "name": this_mc_data.using_cut_name
                        },
                        "avail_perfor_set": {
                            "id": this_mc_data.using_perfor_id,
                            "unique_code": this_mc_data.using_perfor_unique_code,
                            "name": this_mc_data.using_perfor_name
                        }
                    };




                    for (const key in avail_object) {
                        if (Object.prototype.hasOwnProperty.call(avail_object, key)) {
                            if (!Number.isInteger(parseInt(avail_object[key].id))) {
                                delete avail_object[key];
                            }
                        }
                    }

                    let avail_array = [this_mc_data.using_form_top_id,
                    this_mc_data.using_form_bot_id,
                    this_mc_data.using_seal_top_id,
                    this_mc_data.using_seal_bot_id,
                    this_mc_data.using_guide_id,
                    this_mc_data.using_cut_id,
                    this_mc_data.using_perfor_id];

                    avail_array = avail_array.filter(value => Number.isInteger(parseInt(value))); // Validation for valid id -> Just used for fetching data
                    avail_array.sort((a, b) => a - b);
                    const selectElements = {};
                    fetchObjects([{ "name": "fetch_med_changeset", "arg": { "med_id": med_id, "avail_array": avail_array } }]).then(function (data) {

                        if (!data.fetch_med_changeset.status) {
                            throw new Error('Query Error');
                        }
                        let avail_set = data.fetch_med_changeset.usable_set;
                        let operation_field_cont = $('#form-context').find('.blister_card_operation');
                        operation_field_cont.empty();

                        let formation_select = $('<select>').addClass('cpchange-formation-select').append($('<option>', {
                            value: "",
                            text: "-เลือกเซ็ตโมล-",
                            selected: true,
                            disabled: true
                        }));;


                        let i = 1;
                        avail_set.forEach(set => {
                            formation_select.append($('<option>', {
                                value: set.set_id,
                                text: `รูปแบบที่ ${i}`
                            }));
                            i++;

                        });


                        formation_select.on('change', function () {
                            let selected_id = $(this).val();

                            let matched_set = $.grep(avail_set, function (set) {
                                return set.set_id == selected_id;
                            });

                            let types_avail_mold = { ...matched_set[0] };

                            delete types_avail_mold.set_id;

                            for (const key in types_avail_mold) {
                                if (types_avail_mold.hasOwnProperty(key)) {
                                    // Create a select element and add the relevant class
                                    let options
                                    if (key === 'avail_perforation') {
                                        // not required to be selected
                                        options = defineChangePartOptionsArray(types_avail_mold[key], false);
                                    } else {
                                        options = defineChangePartOptionsArray(types_avail_mold[key], true);
                                    }

                                    let selectObject = $('<select>').addClass('cp_select ' + key).attr('data-key', key);
                                    options.forEach(option => {
                                        selectObject.append(option);
                                    });


                                    selectElements[key] = selectObject;

                                    // Define options for the select element based on the key

                                    // Loop through the options and append them to the select element


                                }
                            }




                            operation_detail_field.find('.cp_selects_cont').each(function () {
                                const $this = $(this);
                                const key = $this.data('key'); // Get the key from the data attribute

                                $this.find('select').remove();

                                if (key && selectElements[key]) {
                                    $this.append(selectElements[key]); // Append the select element based on the key
                                } else {
                                    // If no key is found or no corresponding select element, add an empty select
                                    $this.append($('<select>').addClass('cp_select empty-select').append($('<option>', {
                                        value: "",
                                        text: "ไม่ใช้งาน"
                                    })));
                                }
                            });



                            operation_detail_field.find('.cp_selects_cont .cp_select').each(function () {
                                const $select = $(this);
                                const $options = $select.find('option');
                                const first_optionVal = $options.first().val();

                                if ($options.length === 1) {
                                    $options.first().prop('selected', true);
                                    $select.addClass('onlyOption');
                                    $select.prop('disabled', true);
                                }


                                $select.val(first_optionVal);

                            });



                        });





                        let forming_top_div = $('<div>').addClass("cp_selects_cont avail_form_top_set").attr('data-key', 'avail_form_top_set').html(`<div class="detail-label-cont"><label>ขึ้นรูป บน :</label></div>`);
                        let forming_bot_div = $('<div>').addClass("cp_selects_cont avail_form_bot_set").attr('data-key', 'avail_form_bot_set').html(`<div class="detail-label-cont"><label>ขึ้นรูป ล่าง :</label></div>`);
                        let sealing_top_div = $('<div>').addClass("cp_selects_cont avail_seal_top_set").attr('data-key', 'avail_seal_top_set').html(`<div class="detail-label-cont"><label>ซีล บน :</label></div>`);
                        let sealing_bot_div = $('<div>').addClass("cp_selects_cont avail_seal_bot_set").attr('data-key', 'avail_seal_bot_set').html(`<div class="detail-label-cont"><label>ซีลล่าง :</label></div>`);
                        let guide_div = $('<div>').addClass("cp_selects_cont avail_guide_set").attr('data-key', 'avail_guide_set').html(`<div class="detail-label-cont"><label>ชุดราง :</label></div>`);
                        let cutting_div = $('<div>').addClass("cp_selects_cont avail_cutting_set").attr('data-key', 'avail_cutting_set').html(`<div class="detail-label-cont"><label>ชุดตัด :</label></div>`);
                        let perforation_div = $('<div>').addClass("cp_selects_cont avail_perfor_set").attr('data-key', 'avail_perfor_set').html(`<div class="detail-label-cont"><label>ชุดปรุ :</label></div>`);




                        operation_detail_field.append(formation_select, forming_top_div, forming_bot_div, sealing_top_div, sealing_bot_div, guide_div, cutting_div, perforation_div);

                        const detail_buttons = $('<button>').attr('type', 'button').addClass('operation-button cpchange-confirm-button').text('ยืนยัน');
                        operation_detail_button_cont.html(detail_buttons);

                        operation_field.append(operation_detail_field, operation_detail_button_cont);

                        detail_buttons.on('click', function () {
                            // Prevent the process if the new set is the same as before.
                            let newset_value_array = [];
                            let newset_value_object = {};
                            operation_detail_field.find('.cp_selects_cont .cp_select').each(function () {
                                const value = $(this).val();
                                const key = $(this).attr('data-key');
                                if (key) {
                                    newset_value_object[key] = value;
                                }

                                newset_value_array.push(value);

                            });
                            newset_value_array = newset_value_array.filter(value => Number.isInteger(parseInt(value))); // Validation for valid id -> Just used for fetching data
                            newset_value_array.sort((a, b) => a - b);

                            if (JSON.stringify(newset_value_array) === JSON.stringify(avail_array)) {
                                // Same CP formation
                                alert('รูปแบบที่เลือกเป็นรูปแบบที่ใช้งานในปัจจุบัน ไม่สามารถแจ้งเปลี่ยนซ้ำได้');
                                return false;
                            } else {
                                // Different CP formation
                                if (confirm('ยืนยันการเปลี่ยน Change Part?')) {

                                    const old_set = avail_array;
                                    const new_set = newset_value_array;
                                    const old_set_object = avail_object;
                                    const new_set_object = newset_value_object;
                                    const return_cp_object = {};
                                    const remain_cp_object = {};
                                    const replaced_cp_object = {};

                                    const remain_cp = old_set.filter(value => new_set.includes(value));
                                    const replaced_cp = new_set.filter(value => !old_set.includes(value));


                                    

                                    for (const key in old_set_object) {
                                        if (Object.prototype.hasOwnProperty.call(new_set_object, key)) {
                                            if (new_set_object[key] === old_set_object[key].id) {
                                                //Remain
                                                remain_cp_object[key] = old_set_object[key].id;
                                            } else {
                                                // Replaced
                                                replaced_cp_object[key] = new_set_object[key]
                                                return_cp_object[key] = old_set_object[key].id;
                                            }

                                        } else {
                                            // old doesn't have this key 
                                            return_cp_object[key] = old_set_object[key].id;


                                        }
                                    }

                                    // Define Problem logging for returned_cp

                                    let container = $('<div>').addClass('lotDone-small-popup-cont');
                                    let headerLabelDiv = $('<div>').addClass('header-label-div').append($('<label>').addClass('header-label').text('ปัญหาระหว่างผลิต'));

                                    let forming_top_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'form_top').attr('data-cp-id', return_cp_object.avail_form_top_set ? return_cp_object.avail_form_top_set : 'N/A').html(` <div class="detail-label-cont"> <label class="general-detail-header-label">ขึ้นรูป บน :</label> </div> <div class="cp-name-cont"> <label class="cp-name">${return_cp_object.avail_form_top_set ? `${old_set_object.avail_form_top_set.unique_code}: ${old_set_object.avail_form_top_set.name}` : '-ไม่เปลี่ยนแปลง-'}</label></div>`);

                                    let forming_bot_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'form_bot').attr('data-cp-id', return_cp_object.avail_form_bot_set ? return_cp_object.avail_form_bot_set : 'N/A').html(` <div class="detail-label-cont"> <label class="general-detail-header-label">ขึ้นรูป ล่าง :</label> </div> <div class="cp-name-cont"> <label class="cp-name">${return_cp_object.avail_form_bot_set ? `${old_set_object.avail_form_bot_set.unique_code}: ${old_set_object.avail_form_bot_set.name}` : '-ไม่เปลี่ยนแปลง-'}</label> </div>`);

                                    let sealing_top_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'seal_top').attr('data-cp-id', return_cp_object.avail_seal_top_set ? return_cp_object.avail_seal_top_set : 'N/A').html(` <div class="detail-label-cont"> <label class="general-detail-header-label">ซีล บน :</label> </div> <div class="cp-name-cont"> <label class="cp-name">${return_cp_object.avail_seal_top_set ? `${old_set_object.avail_seal_top_set.unique_code}: ${old_set_object.avail_seal_top_set.name}` : '-ไม่เปลี่ยนแปลง-'}</label> </div>`);

                                    let sealing_bot_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'seal_bot').attr('data-cp-id', return_cp_object.avail_seal_bot_set ? return_cp_object.avail_seal_bot_set : 'N/A').html(` <div class="detail-label-cont"> <label class="general-detail-header-label">ซีลล่าง :</label> </div> <div class "cp-name-cont"> <label class="cp-name">${return_cp_object.avail_seal_bot_set ? `${old_set_object.avail_seal_bot_set.unique_code}: ${old_set_object.avail_seal_bot_set.name}` : '-ไม่เปลี่ยนแปลง-'}</label> </div>`);

                                    let guide_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'guide').attr('data-cp-id', return_cp_object.avail_guide_set ? return_cp_object.avail_guide_set : 'N/A').html(` <div class="detail-label-cont"> <label class="general-detail-header-label">ชุดราง :</label> </div> <div class="cp-name-cont"> <label class="cp-name">${return_cp_object.avail_guide_set ? `${old_set_object.avail_guide_set.unique_code}: ${old_set_object.avail_guide_set.name}` : '-ไม่เปลี่ยนแปลง-'}</label> </div>`);

                                    let cutting_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'cutting').attr('data-cp-id', return_cp_object.avail_cutting_set ? return_cp_object.avail_cutting_set : 'N/A').html(` <div class="detail-label-cont"> <label class="general-detail-header-label">ชุดตัด :</label> </div> <div class="cp-name-cont"> <label class="cp-name">${return_cp_object.avail_cutting_set ? `${old_set_object.avail_cutting_set.unique_code}: ${old_set_object.avail_cutting_set.name}` : '-ไม่เปลี่ยนแปลง-'}</label> </div>`);

                                    let perforation_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'perfor').attr('data-cp-id', return_cp_object.avail_perfor_set ? return_cp_object.avail_perfor_set : 'N/A').html(` <div class="detail-label-cont"> <label class="general-detail-header-label">ชุดปรุ :</label> </div> <div class="cp-name-cont"> <label class="cp-name">${return_cp_object.avail_perfor_set ? `${old_set_object.avail_perfor_set.unique_code}: ${old_set_object.avail_perfor_set.name}` : '-ไม่เปลี่ยนแปลง-'}</label> </div>`);



                                    appendRadioErrorInput(forming_top_div);
                                    appendRadioErrorInput(forming_bot_div);
                                    appendRadioErrorInput(sealing_top_div);
                                    appendRadioErrorInput(sealing_bot_div);
                                    appendRadioErrorInput(guide_div);
                                    appendRadioErrorInput(cutting_div);
                                    appendRadioErrorInput(perforation_div);



                                    small_popup_content.empty();
                                    const conf_btn = $('<button>').attr('type', 'button').attr('id', 'small-popup-confirm-button').html('ยืนยันการแจ้งเปลี่ยน');
                                    const button_cont = $('<div>').addClass('small-popup-lot-done-detail-row').append(conf_btn);


                                    conf_btn.on('click', function () {
                                        // Retrieve and validate safe input then pass the data to PHP.
                                        let validFlag = true;
                                        let mold_usage_object = [];
                                        container.find('.small-popup-lot-done-detail-row').each(function () {



                                            const part_detail = $(this);
                                            const part_key = part_detail.attr('data-element-key') ?? 'N/A';
                                            const part_id = part_detail.attr('data-cp-id') ?? 'N/A';



                                            if (part_key == 'N/A' || part_id == 'N/A') {
                                                return true;
                                            }


                                            // Validate the radio inside each CP element
                                            const radioPair = part_detail.find('.moldDone-radio');
                                            if (!radioPair.is(':checked') && radioPair.length == 2) {
                                                alert('เลือกตัวเลือกไม่ครบถ้วน');
                                                validFlag = false;
                                                return false;
                                            }

                                            const radioValue = radioPair.filter(':checked').val();

                                            if (radioValue == '1') {
                                                change_part_obj = {
                                                    "part_id": part_id,
                                                    "key": part_key,
                                                    "condition": 1,
                                                    "text_code": "no problem"
                                                }
                                                mold_usage_object.push(change_part_obj);
                                                return true;
                                            }
                                            const inputval = isSafeInput(part_detail.find('.displayed-input').val() ?? '');
                                            if (!inputval) {
                                                alert(`กรอกข้อมูลไม่ครบถ้วนหรือมีการใช้ตัวอักษรพิเศษที่ห้ามใช้ '"<>`);
                                                validFlag = false;
                                                return false;
                                            } else {

                                                change_part_obj = {
                                                    "part_id": part_id,
                                                    "key": part_key,
                                                    "condition": 0,
                                                    "text_code": inputval
                                                }
                                                mold_usage_object.push(change_part_obj);
                                                return true;


                                            }
                                        });


                                        if (validFlag) {
                                            // Send the detail;

                                            const passingObject = {
                                                "mcId": mcId,
                                                "remain_cp_obj": remain_cp_object,
                                                "replace_cp_obj": replaced_cp_object,
                                                "return_cp_obj": mold_usage_object,
                                                "remain_cp_array": remain_cp,
                                                "replace_cp_array": replaced_cp,

                                            };

                                    
                                            fetchObjects([{ "name": "return_cpset", "arg": { "detailObject": passingObject } }]).then(function (data) {
                                                if (data.return_cpset.status){
                                                    alert('แจ้งเปลี่ยน Change Part สำเร็จ');
                                                    location.reload();
                                                    return;
                                                }else {
                                                    throw new Error('Query Error');
                                                }
                                                
                                            })
                                                .catch(function (error) {
                                                    console.log(error);
                                                    alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                                                    return;
                                                });
                                        }



                                    });


                                    container.append(headerLabelDiv, forming_top_div, forming_bot_div, sealing_top_div, sealing_bot_div, guide_div, cutting_div, perforation_div, button_cont);

                                    small_popup_content.append(container);
                                    small_popup_div.fadeIn();


                                } else {
                                    return false;
                                }

                            }

                        });



                    });

                })
                    .catch((error) => {
                        console.log(error);
                        alert('เกิดข้อผิดพลาดกรุณารีเฟรช');
                        return false;

                    });
            } else {
                return;
            }




        } else if (mode == 'lotDone') {

            // Handle -> Mold Status Informing
            if (!current_machineObject ?? false) {
                fetchObjects([{ "name": "fetch_operatingMachines", "arg": { "mcId": mcId } }]).then(function (data) {

                    if (data.fetch_operatingMachines.status) {

                        current_machineObject = data.fetch_operatingMachines.operating_data[0];
                    }
                })
                    .catch(function (error) {
                        console.log(error);
                        alert('เกิดข้อผิดพลาด');
                        return;
                    });
            }

            let container = $('<div>').addClass('lotDone-small-popup-cont');
            let headerLabelDiv = $('<div>').addClass('header-label-div').append($('<label>').addClass('header-label').text('ปัญหาระหว่างผลิต'));
            let forming_top_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'form_top').attr('data-cp-id', current_machineObject.using_form_top_id).html(`<div class="detail-label-cont"><label class="general-detail-header-label">ขึ้นรูป บน :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_form_top_unique_code}: ${current_machineObject.using_form_top_name}</label> </div>`);
            let forming_bot_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'form_bot').attr('data-cp-id', current_machineObject.using_form_bot_id).html(`<div class="detail-label-cont"><label class="general-detail-header-label">ขึ้นรูป ล่าง :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_form_bot_unique_code}: ${current_machineObject.using_form_bot_name}</label> </div>`);
            let sealing_top_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'seal_top').attr('data-cp-id', current_machineObject.using_seal_top_id).html(`<div class="detail-label-cont"><label class="general-detail-header-label">ซีล บน :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_seal_top_unique_code}: ${current_machineObject.using_seal_top_name}</label> </div>`);
            let sealing_bot_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'seal_bot').attr('data-cp-id', current_machineObject.using_seal_bot_id).html(`<div class="detail-label-cont"><label class="general-detail-header-label">ซีลล่าง :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_seal_bot_unique_code}: ${current_machineObject.using_seal_bot_name}</label> </div>`);
            let guide_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'guide').attr('data-cp-id', current_machineObject.using_guide_id).html(`<div class="detail-label-cont"><label class="general-detail-header-label">ชุดราง :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_guide_unique_code}: ${current_machineObject.using_guide_name}</label> </div>`);
            let cutting_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'cutting').attr('data-cp-id', current_machineObject.using_cut_id).html(`<div class="detail-label-cont"><label class="general-detail-header-label">ชุดตัด :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_cut_unique_code}: ${current_machineObject.using_cut_name}</label> </div>`);
            let perforation_div = $('<div>').addClass('small-popup-lot-done-detail-row').attr('data-element-key', 'perfor').attr('data-cp-id', current_machineObject.using_perfor_id).html(`<div class="detail-label-cont"><label class="general-detail-header-label">ชุดปรุ :</label></div><div class="cp-name-cont"><label class="cp-name">${current_machineObject.using_perfor_unique_code == 'N/A' ? 'ไม่ใช้งาน' : current_machineObject.using_perfor_unique_code}: ${current_machineObject.using_perfor_name == 'N/A' ? '-' : current_machineObject.using_perfor_name}</label> </div>`);

            appendRadioErrorInput(forming_top_div);
            appendRadioErrorInput(forming_bot_div);
            appendRadioErrorInput(sealing_top_div);
            appendRadioErrorInput(sealing_bot_div);
            appendRadioErrorInput(guide_div);
            appendRadioErrorInput(cutting_div);
            appendRadioErrorInput(perforation_div);



            small_popup_content.empty();
            const button_cont = $('<div>').addClass('small-popup-lot-done-detail-row').append($('<button>').attr('type', 'button').attr('id', 'small-popup-confirm-button').html('ยืนยันจบงาน'));
            container.append(headerLabelDiv, forming_top_div, forming_bot_div, sealing_top_div, sealing_bot_div, guide_div, cutting_div, perforation_div, button_cont);

            small_popup_content.append(container);
            small_popup_div.fadeIn();


            small_popup_content.on('click', '#small-popup-confirm-button', () => {

                // Check if every radio is selected, every problem input with class 'displayed-input' is safely filled
                const change_part_detail_rows = small_popup_content.find('.small-popup-lot-done-detail-row');
                let mold_usage_object = [];
                let validFlag = true;
                change_part_detail_rows.each(function () {
                    let change_part_obj = {};
                    const part_detail = $(this);

                    const part_key = part_detail.attr('data-element-key') ?? false;
                    const part_id = part_detail.attr('data-cp-id') ?? false;

                    if (!part_key) {
                        // Button div etc. (Neigther having key nor id)
                        return true;
                    }

                    if (isNaN(parseInt(part_id))) {
                        // change_part_obj = {
                        //     "part_id":part_id,
                        //     "key":part_key,
                        //     "condition":3,
                        //     "text_code":"not used"
                        // }
                        // mold_usage_object.push(change_part_obj);
                        return true;

                    }



                    const radioPair = part_detail.find('.moldDone-radio');
                    if (!radioPair.is(':checked') && radioPair.length == 2) {
                        alert('เลือกตัวเลือกไม่ครบถ้วน');
                        validFlag = false;
                        return false;
                    }

                    const radioValue = radioPair.filter(':checked').val();

                    if (radioValue == '1') {
                        change_part_obj = {
                            "part_id": part_id,
                            "key": part_key,
                            "condition": 1,
                            "text_code": "no problem"
                        }
                        mold_usage_object.push(change_part_obj);
                        return true;
                    }
                    const inputval = isSafeInput(part_detail.find('.displayed-input').val() ?? '');
                    if (!inputval) {
                        alert(`กรอกข้อมูลไม่ครบถ้วนหรือมีการใช้ตัวอักษรพิเศษที่ห้ามใช้ '"<>`);
                        validFlag = false;
                        return false;
                    } else {

                        change_part_obj = {
                            "part_id": part_id,
                            "key": part_key,
                            "condition": 0,
                            "text_code": inputval
                        }
                        mold_usage_object.push(change_part_obj);
                        return true;


                    }

                });

                if (validFlag) {

                    // Send data to the server to handle lotDone
                    let machineId = $('.blister-card-element .hidden-mc-id').val();
                    fetchObjects([{ "name": "handle_lotDone", "arg": { "machineId": machineId, "part_usage": JSON.stringify(mold_usage_object) } }]).then(function (data) {

                        if (data.handle_lotDone) {
                            alert('จบงานเสร็จสิ้น');
                            location.reload();
                            return true;


                        } else {
                            throw new Error('Query Error');
                        }


                    })
                        .catch(function (error) {
                            console.log(error);
                            alert('เกิดข้อผิดพลาดกรุณารีเฟรช');
                            return false;

                        });

                }

            });

        } else if (mode == 'continue') {

            if (confirm('เริ่มต้นเดินยาต่อ?')) {
                let machineId = $('.blister-card-element .hidden-mc-id').val();
                fetchObjects([{ "name": "handle_continue", "arg": { "machineId": machineId } }]).then(function (data) {
                    if (data.handle_continue) {
                        alert('แจ้งเริ่มต้นเดินยาสำเร็จ');
                        location.reload();
                        return;

                    } else {
                        console.log("Query Error");
                        alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                        return;
                    }


                })
                    .catch(function (error) {
                        console.log(error);
                        alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                        return;

                    });


            } else {
                return;
            }


        } else if (mode == 'pause') {

            small_popup_content.html(` 
        <h2>แจ้งหยุดเครื่อง</h2>
        <label for="reason">สาเหตุการหยุด</label>
        <input type="text" class="pause_reason_input" name="reason" placeholder="ระบุสาเหตุการหยุดเครื่อง"required>
        <br>
        <button id="small-popup-confirm-button">ยืนยันแจ้งหยุด</button>`);
            small_popup_div.fadeIn();



            small_popup_content.on('click', '#small-popup-confirm-button', () => {
                // Sent data to server and update the state.
                let machineId = $('.blister-card-element .hidden-mc-id').val();
                let reason = isSafeInput(small_popup_content.find('.pause_reason_input').val());
                if (!reason) {
                    alert(`กรอกข้อมูลไม่ครบถ้วน หรือ มีการใช้ตัวอักษรต้องห้าม เช่น '";<>`);
                    return;
                }

                fetchObjects([{ "name": "handle_pause", "arg": { "machineId": machineId, "pause_reason": reason } }]).then(function (data) {
                    if (data.handle_pause) {
                        alert('แจ้งหยุดสำเร็จ');
                        location.reload();
                        return;
                    } else {
                        console.log('Query Error');
                        alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                        return;
                    }



                })
                    .catch(function (error) {
                        console.log(error);
                        alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                        return;

                    });


            });



        }
        else if (mode == 'lotStart') {

            // StartButton clicked
            let confirmation_div = $('<div>').html('<label>ยืนยันเลข lot</label>').addClass('middle-div').append($('<input>').attr('type', 'text').addClass('lot_no_input').attr('data-key', 'lot_no_id'));
            const detail_buttons = `
        <button type="button" class="operation-button confirm-button">ยืนยัน</button>`;

            let operation_detail_field = $('<div>').addClass("operation-detail-cont");
            let operation_detail_button_cont = $('<div>').addClass("operation-detail-button-cont");
            operation_detail_field.append(confirmation_div);
            operation_detail_button_cont.append(detail_buttons);

            operation_field.append(operation_detail_field, operation_detail_button_cont);

            operation_field.on('click', ".operation-detail-button-cont .confirm-button", () => {

                let machineId = $('.blister-card-element .hidden-mc-id').val();
                let confirmed_lot = operation_field.find('.middle-div .lot_no_input').val();

                if (confirmed_lot == '') {
                    alert('กรุณาระบุเลข Lot');
                    return false;
                }

                fetchObjects([{ "name": "handle_lotStart", "arg": { "machineId": machineId, "confirmedLot": confirmed_lot } }]).then(function (data) {
                    if (data.handle_lotStart.status) {
                        // Code -> 200 GO, 400 ERROR , 401 -> confirmed lot mismatch

                        if (data.handle_lotStart.code == 200) {
                            alert('แจ้งเริ่มต้นเดินยา');
                            location.reload();
                            return;
                        } else if (data.handle_lotStart.code == 401) {
                            let confirmMsg = `เลข Lot ไม่ตรงกันกับตอนเริ่มต้น 
            เดิม: ${data.handle_lotStart.old_lot}
            ใหม่: ${confirmed_lot}
ยืนยันเพื่อนใช้เลขใหม่ / ยกเลิกเพื่อกลับไปแก้ไข
                    `;
                            if (confirm(confirmMsg)) {
                                // two times confirmation
                                if (confirm('ขั้นตอนนี้จะแก้ไขเลข Lot ที่เคยระบุไว้ ยืนยันการดำเนินการต่อ?')) {
                                    // Change the lot number
                                    fetchObjects([{ "name": "handle_lotStart", "arg": { "machineId": machineId, "confirmedLot": confirmed_lot, "second_times": 'true' } }]).then(function (second_data) {
                                        if (second_data.handle_lotStart.code == 200) {
                                            alert('แจ้งเริ่มต้นเดินยาสำเร็จ');
                                            location.reload();
                                            return;
                                        } else {
                                            console.log('Query Error');
                                            alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                                            return false;
                                        }

                                    });


                                }

                            }
                            return false;
                        } else if (data.handle_lotStart.code == 400) {
                            console.log('Query Error');
                            alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                            return false;
                        }


                    } else {
                        console.log('Query Error');
                        alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                        return false;
                    }

                }).catch(function (error) {
                    console.log(error);
                    alert('เกิดข้อผิดพลาด');
                    return false;

                });


            });


        } else if(mode == 'cancelSetup'){

            if (!confirm('ต้องการยกเลิกการตั้งเครื่อง')){
                return false;
            }else {
                // change mc state and CP state just act like nothing happened
                let machineId = $('.blister-card-element .hidden-mc-id').val();
                fetchObjects([{ "name": "handle_cancelSetup", "arg": { "machineId": machineId } }]).then(function (data) { 

                    if (data.handle_cancelSetup.status){    
                        alert('ยกเลิกการตั้งเครื่องเสร็จสิ้น');
                        location.reload();
                        return;


                    }else {
                        throw new Error('Query Error');
                    }



            }).catch(function (error) {
                console.log(error);
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return false;

            });
        }
        }else if (mode == 'setupStart') {

            if (!confirm('ยืนยันการเริ่มตั้งเครื่อง?')) {
                return false;
            } else {
                // Set up
                // Show select able changepart for each part -> All must be slected before start

                let medicines;
                let operation_detail_field = $('<div>').addClass("operation-detail-cont");
                let operation_detail_button_cont = $('<div>').addClass("operation-detail-button-cont");
                let med_select_div = $('<div>').addClass("cp_selects_main_cont").html(`<div class="detail-label-cont"><label>เลือกยา :</label></div>`);
                let set_select_div = $('<div>').addClass("cp_selects_main_cont").html(`<div class="detail-label-cont"><label>เซ็ตโมล :</label></div>`);
                const selectElements = {};
                fetchObjects([{ "name": "fetch_medicine", "arg": "" }]).then(function (data) {
                    if (data.fetch_medicine.status) {
                        medicines = data.fetch_medicine.medicine;
                        let med_select_elemnt = $('<select>').addClass('med_select').attr('data-key', 'onuse_med_id');
                        med_select_elemnt.append($('<option>', {
                            value: "",
                            text: "-เลือกยา-",
                            selected: true,
                            disabled: true
                        }));

                        medicines.forEach(med => {
                            med_select_elemnt.append($('<option>', {
                                value: med.id,
                                text: med.name,
                            }));
                        });

                        med_select_div.append(med_select_elemnt);


                        med_select_div.on('change', ".med_select", function () {

                            set_select_div.find('select').remove();

                            let set_select_elemnt = $('<select>').addClass('med_select').attr('data-key', 'med_set');
                            set_select_elemnt.append($('<option>', {
                                value: "",
                                text: "-เลือกเซ็ตโมล-",
                                selected: true,
                                disabled: true
                            }));

                            operation_detail_field.find('.cp_selects_cont .cp_select').remove();



                            fetchObjects([{ "name": "fetch_med_changeset", "arg": { "med_id": $(this).val() } }]).then(function (data) {
                                if (data.fetch_med_changeset.status) {
                                    let avail_set
                                    avail_set = data.fetch_med_changeset.usable_set;
                                    let i = 1;
                                    avail_set.forEach(set => {
                                        set_select_elemnt.append($('<option>', {
                                            value: set.set_id,
                                            text: `รูปแบบที่ ${i}`
                                        }));
                                        i++;

                                    });

                                    set_select_div.append(set_select_elemnt);


                                    set_select_elemnt.on('change', function () {
                                        let selected_id = $(this).val();

                                        let matched_set = $.grep(avail_set, function (set) {
                                            return set.set_id == selected_id;
                                        });

                                        let types_avail_mold = { ...matched_set[0] };

                                        delete types_avail_mold.set_id;




                                        // Loop through each key in types_avail_mold
                                        for (const key in types_avail_mold) {
                                            if (types_avail_mold.hasOwnProperty(key)) {
                                                // Create a select element and add the relevant class
                                                let options
                                                if (key === 'avail_perforation') {
                                                    // not required to be selected
                                                    options = defineChangePartOptionsArray(types_avail_mold[key], false);
                                                } else {
                                                    options = defineChangePartOptionsArray(types_avail_mold[key], true);
                                                }

                                                let selectObject = $('<select>').addClass('cp_select ' + key).attr('data-key', key);
                                                options.forEach(option => {
                                                    selectObject.append(option);
                                                });


                                                selectElements[key] = selectObject;

                                                // Define options for the select element based on the key

                                                // Loop through the options and append them to the select element


                                            }
                                        }

                                        // Add data attribute to .cp_selects_cont elements
                                        operation_detail_field.find('.cp_selects_cont').each(function () {
                                            const $this = $(this);
                                            const key = $this.data('key'); // Get the key from the data attribute

                                            $this.find('select').remove();

                                            if (key && selectElements[key]) {
                                                $this.append(selectElements[key]); // Append the select element based on the key
                                            } else {
                                                // If no key is found or no corresponding select element, add an empty select
                                                $this.append($('<select>').addClass('cp_select empty-select').append($('<option>', {
                                                    value: "",
                                                    text: "ไม่ใช้งาน"
                                                })));
                                            }
                                        });



                                        operation_detail_field.find('.cp_selects_cont .cp_select').each(function () {
                                            const $select = $(this);
                                            const $options = $select.find('option');
                                            $select.val($select.find('option:first').val());
                                            if ($options.length === 1) {
                                                $options.first().prop('selected', true);
                                                $select.addClass('onlyOption');
                                                $select.prop('disabled', true);
                                            }
                                        });


                                    });



                                }

                            })


                        });

                        let lot_no_input_div = $('<div>').addClass("cp_selects_main_cont").attr('data-key', 'lot_no_id').html(`<div class="detail-label-cont"><label>เลข Lot</label></div>`).append($('<input>').attr('type', 'text').addClass('lot_no_input').attr('data-key', 'lot_no_id'));
                        let forming_top_div = $('<div>').addClass("cp_selects_cont avail_form_top_set").attr('data-key', 'avail_form_top_set').html(`<div class="detail-label-cont"><label>ขึ้นรูป บน :</label></div>`);
                        let forming_bot_div = $('<div>').addClass("cp_selects_cont avail_form_bot_set").attr('data-key', 'avail_form_bot_set').html(`<div class="detail-label-cont"><label>ขึ้นรูป ล่าง :</label></div>`);
                        let sealing_top_div = $('<div>').addClass("cp_selects_cont avail_seal_top_set").attr('data-key', 'avail_seal_top_set').html(`<div class="detail-label-cont"><label>ซีล บน :</label></div>`);
                        let sealing_bot_div = $('<div>').addClass("cp_selects_cont avail_seal_bot_set").attr('data-key', 'avail_seal_bot_set').html(`<div class="detail-label-cont"><label>ซีลล่าง :</label></div>`);
                        let guide_div = $('<div>').addClass("cp_selects_cont avail_guide_set").attr('data-key', 'avail_guide_set').html(`<div class="detail-label-cont"><label>ชุดราง :</label></div>`);
                        let cutting_div = $('<div>').addClass("cp_selects_cont avail_cutting_set").attr('data-key', 'avail_cutting_set').html(`<div class="detail-label-cont"><label>ชุดตัด :</label></div>`);
                        let perforation_div = $('<div>').addClass("cp_selects_cont avail_perfor_set").attr('data-key', 'avail_perfor_set').html(`<div class="detail-label-cont"><label>ชุดปรุ :</label></div>`);




                        operation_detail_field.append(lot_no_input_div, med_select_div, set_select_div, forming_top_div, forming_bot_div, sealing_top_div, sealing_bot_div, guide_div, cutting_div, perforation_div);

                        const detail_buttons = `
         <button type="button" class="operation-button confirm-button">ยืนยัน</button>`;


                        operation_detail_button_cont.html(detail_buttons);

                        operation_field.append(operation_detail_field, operation_detail_button_cont, `<input type='hidden' class="operation-detail-mode" value="setupTostart">`);

                        operation_field.on('click', ".operation-detail-button-cont .confirm-button", () => {
                            let allSelectors = operation_field.find('.operation-detail-cont .med_select, .operation-detail-cont .cp_select');
                            let allTextInput = operation_field.find('.operation-detail-cont .lot_no_input');
                            let machineId = $('.blister-card-element .hidden-mc-id').val();
                            let mergedArray = $([...allSelectors, ...allTextInput]);

                            let isEmpty = false;
                            let selectValues = { "machineId": machineId };

                            mergedArray.each(function () {
                                let value = this.value;
                                let notemptyselect = $(this).hasClass('empty-select') ? false : true;
                                if (value === '' && notemptyselect) {
                                    isEmpty = true;
                                    return false; // Exit the loop early if an empty select is found
                                } else {
                                    let dataKey = $(this).attr('data-key') ?? false;
                                    if (dataKey) {
                                        selectValues[dataKey] = (value != '' ? value : 'noUse');
                                    }
                                }
                            });

                            if (isEmpty) {
                                alert('กรุณากรอกข้อมูลให้ครบ');
                                return;
                            } else {
                                // Use the selectValues object that contains key-value pairs
                                // Assign data to the database
                                if (confirm('ยืนยันการบันทึกข้อมูล')) {

                                    fetchObjects([{ "name": "handle_setupStart", "arg": { "keyData": selectValues } }]).then(function (data) {
                                        if (data.handle_setupStart) {
                                            alert('แจ้งเริ่มต้นตั้งเครื่องเสร็จสิ้น');
                                            location.reload();
                                            return;

                                        } else {
                                            console.log('Query Error');
                                            alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                                            return false;
                                        }

                                    }).catch(function (error) {
                                        console.log(error);
                                        alert('เกิดข้อผิดพลาด');
                                        return false;

                                    });
                                }
                            }
                        });


                    } else {
                        alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                        return false;
                    }


                })
                    .catch(function (error) {
                        console.log(error);
                        return false;

                    });
            }
        }

    });




});