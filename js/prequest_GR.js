$(document).ready(function () {
    function init_navAndLoad() {
        $('body').prepend('<div id="nav-container"></div>');

        $.get({ url: '../global_res/global_sidebar_EN.html' }, function (htmlContent) {
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
            ajaxStart: function () { $('body').addClass("loading"); },
            ajaxStop: function () { $('body').removeClass("loading"); }
        });

    }



    async function whoamina() {
        // if (funcArr == null) {
        //     return false;
        // }

        try {
            const response = await $.ajax({
                type: 'POST',
                url: 'fetch_global_ppss.php',
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
                url: 'fetch_prequest.php',
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

    function allowOnlyIntegers(inputElement) {
        let rawVal = inputElement.val();
        let cleanedVal = rawVal.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        let value = parseInt(cleanedVal);
        if (isNaN(value) || value <= 0) {
            value = 0; // Clear the input if not valid
        }
        inputElement.val(value);
    }

    function allowFloatingPoint(inputElement) {
        let rawVal = inputElement.val();
        let cleanedVal = rawVal.replace(/^0+|[^0-9.]/g, '');
        let parts = cleanedVal.split('.');
        if (parts[0] == '') {
            parts[0] = '0';
        }
        if (parts.length > 2) {
            parts.pop();
        }
        cleanedVal = parts.join('.');
        inputElement.val(cleanedVal);

    }

    function label_value_div(label_text, value_text) {
        const return_div = $('<div>').addClass('label-value-cont label-element-cont');

        const element_label = $('<label>').addClass('info-label').text(label_text + ": ");
        const element_value = $('<label>').addClass('info-value').html(`${value_text}`);

        return_div.append(element_label, element_value);

        return return_div;
    }
    function picture_to_li(pic_ul, pic_obj = {}, ref_itm_code = null) {
        // Direct picture display (used when just uploaded)
        function file_to_link(file, fileName) {

            const imageLink = $('<a>')
                .text(fileName)
                .attr('href', URL.createObjectURL(file))
                .attr('target', '_blank');

            return imageLink;

        }

        function key_to_link(img_uq_id, fileName) {

            const imageLink = $('<a>')
                .text(fileName)
                .attr('href', `global_show_images.php?image_id=${img_uq_id}&fk_itmCode=${ref_itm_code}`)
                .attr('target', '_blank');

            return imageLink;

        }

        // One dimensional array containing ID's of pictures
        let li_array = [];
        if (getObjectLength(pic_obj) >= 1) {
            let order = 1;
            $.each(pic_obj, function (key, file) {
                let new_link;

                if (file == 99) {
                    new_link = key_to_link(key, `รูปที่ #${order}`);
                } else {
                    new_link = file_to_link(file, `รูปที่ #${order}`);
                }

                const remove_btn = $('<button>').attr('type', 'button').addClass('pic-li-remove-btn').text('ลบ');
                const new_li = $('<li>').append(new_link, remove_btn);

                remove_btn.on('click', function () {
                    delete pic_obj[key];
                    picture_to_li(pic_ul, pic_obj, ref_itm_code);
                });

                li_array.push(new_li);
                order++;
            });
        } else {
            li_array.push($('<li>').text('-- ไม่มีรายการ --'));
        }


        pic_ul.empty();

        li_array.forEach(li => {
            pic_ul.append(li);
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

    function calculateDateDiff(targetDate) {

        try {

            const parts = targetDate.split("-");
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Month is zero-based
            const day = parseInt(parts[2]);

            // Create Date objects for today and the target date
            const today = (new Date()).getTime();
            const target = (new Date(year, month, day)).getTime();

            // Calculate the time difference in milliseconds
            const timeDiff = target - today;

            // Calculate the number of days
            const daysDiff = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60 * 24));

            if (isNaN(daysDiff)) {
                throw new Error('Error Conversion');
            }

            if (timeDiff > 0) {
                return `<span style="color:#097d46;">(เหลืออีก ${daysDiff} วัน)</span>`;
            } else {

                return `<span style="color:#ff0000;">(ผ่านมาแล้ว ${daysDiff} วัน)</span>`;
            }


        } catch (error) {
            return "";
        }
    }
    function formatDate(inputDate) {
        try {
            const parts = inputDate.split('-');
            if (parts.length !== 3) {
                return '-';
            }

            const year = parts[0];
            const month = parts[1];
            const day = parts[2];

            return `${day}/${month}/${year}`;
        } catch (error) {
            return 'N/A'; // Return 'N/A' if an error occurs
        }
    }

    function formatTime(inputTime) {
        try {
            const parts = inputTime.split(':');
            if (parts.length !== 3) {
                return 'Invalid Time';
            }

            const hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);

            return `${hours} ชั่วโมง ${minutes} นาที`;
        } catch (error) {
            return 'N/A'; // Return 'N/A' if an error occurs
        }
    }

    function formatDateTime(dateTime) {
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

    function show_item_popup_content(prCode, itmObj = null, mode = "view") {

        const itmCode = itmObj === null ? false : itmObj.pr_itm_itm_code;

        const btn_div = $('<div>').addClass('center-btn-cont');
        const record_btn = $('<button>').attr('type', 'button').addClass('oper-btn record_btn').text('บันทึก');
        const itm_detail_cont = $('<div>').attr('id', 'popup-itm-detail-cont');



        popupContent.empty();

        fetchObjects([{ "name": "fetch_part_list", "arg": "" }, { "name": "fetch_requested_pr_part_id", "arg": { "prCode": prCode } }]).then(function (data) {

            let requested_part_id = data.fetch_requested_pr_part_id.requested_part_id;


            if (mode === "view") {

                const uploaded_img = {};

                fetchObjects([{ "name": "fetch_uploaded_img_key", "arg": { "itmCode": itmCode } }]).then(function (data) {

                    if (data.fetch_uploaded_img_key.status) {

                        data.fetch_uploaded_img_key.uploaded_img_key.forEach(img_key => {
                            uploaded_img[img_key] = 99;
                        });

                        const info_struct = {
                            "itmCode": itmObj.pr_itm_itm_code,
                            "id": itmObj.pr_itm_part_id,
                            "name": itmObj.pr_itm_part_name,
                            "spec": itmObj.pr_itm_part_spec,
                            "req_val": itmObj.pr_itm_req_quan,
                            "note": itmObj.pr_itm_note,
                            "cf_val": itmObj.pr_itm_cf_quan,
                            "itm_status": itmObj.pr_itm_itm_status,
                            "gr_val": itmObj.pr_itm_gr_quan,
                            "pic_obj": uploaded_img,
                        }

                        generate_popup_item_detail(itm_detail_cont, info_struct, uploaded_img, mode);




                    } else {
                        throw new Error('Fetching img_key error');
                    }

                });

                record_btn.remove();


            } else if (mode == "gr") {

                const uploaded_img = {};

                fetchObjects([{ "name": "fetch_uploaded_img_key", "arg": { "itmCode": itmCode } }]).then(function (data) {

                    if (data.fetch_uploaded_img_key.status) {

                        data.fetch_uploaded_img_key.uploaded_img_key.forEach(img_key => {
                            uploaded_img[img_key] = 99;
                        });

                        const info_struct = {
                            "itmCode": itmObj.pr_itm_itm_code,
                            "id": itmObj.pr_itm_part_id,
                            "name": itmObj.pr_itm_part_name,
                            "spec": itmObj.pr_itm_part_spec,
                            "req_val": itmObj.pr_itm_req_quan,
                            "cf_val": itmObj.pr_itm_cf_quan,
                            "note": itmObj.pr_itm_note,
                            "itm_status": itmObj.pr_itm_itm_status,
                            "gr_val": itmObj.pr_itm_gr_quan,
                            "pic_obj": uploaded_img,
                        }

                        generate_popup_item_detail(itm_detail_cont, info_struct, uploaded_img, mode);




                    } else {
                        throw new Error('Fetching img_key error');
                    }

                });


                record_btn.off();
                record_btn.on('click', function () {
                    // UPDATE and further approval -> sub item approval
                    // Validate if approved_quan <= req_quan

                    const remain_gr_quan_value = itm_detail_cont.find('.remain-gr-quantity-input').val();
                    const gr_quan_value = itm_detail_cont.find('.gr-quantity-input').val();

                    const remain_gr_quan = (isNaN(parseFloat(remain_gr_quan_value)) || remain_gr_quan_value <= 0) ? false : parseFloat(remain_gr_quan_value)
                    const gr_quan = (isNaN(parseFloat(gr_quan_value)) || gr_quan_value <= 0) ? false : parseFloat(gr_quan_value)

                    if ((remain_gr_quan == false || gr_quan == false) || (gr_quan > remain_gr_quan)) {
                        alert('จำนวน GR ไม่ถูกต้อง');
                        return false;
                    }


                    // Proceed
                    popupContent.empty();

                    const detail_div = $('<div>').addClass('center-elements');
                    const real_poInput = $('<input>').attr('type', 'text').attr('id', 'real-pr-input').attr('placeholder', 'ระบุเลขอ้างอิง GR');
                    const confirm_done_btn = $('<button>').attr('type', 'button').addClass('oper-btn record_btn').text('รับสินค้า');

                    const element_real_pr_input = $('<div>').addClass('label-element-cont-center').append($('<label>').addClass('info-label').text("เลขอ้างอิง: "), real_poInput);

                    const center_btn_div = $('<div>').addClass('center-btn-cont');

                    detail_div.append(element_real_pr_input);
                    center_btn_div.append(confirm_done_btn);

                    popupContent.append(detail_div, center_btn_div);


                    confirm_done_btn.on('click', function () {

                        let po_input = (real_poInput.val() == "" ? "-" : real_poInput.val());

                        let real_po = isSafeInput(po_input);

                        if (real_po === false) {
                            alert('ห้ามการใช้อักขระพิเศษในการกรอกข้อมูล');
                            return false;
                        }else if(real_po == "-"){

                            real_po = "null";
                        }

                        if (!confirm("ยืนยันการดำเนินการรับสินค้าหรือไม่?")) {
                            return false;
                        }

                        fetchObjects([{ "name": "gr_item", "arg": { "itmCode": itmCode, "gr_quan": gr_quan, "prCode": prCode,"refCode":real_po } }]).then(function (data) {
                            if (data.gr_item.status) {
                                alert('รับสินค้าสำเร็จ');
                                if (data.gr_item.all_done){
                                    location.reload();
                                }else {
                                    appendFormField(page, prCode, false);
                                    close_btn.trigger('click');
                                }
                              
                                return true;
                            }else {
                                throw new Error('Query Error');
                            }

                        })
                            .catch((error) => {
                                console.log(error);
                                alert('เกิดข้อผิดพลาดกรุณารีเฟรช');
                                return false;
                            });

                    });





                });
                btn_div.append(record_btn);

            } else if (mode == "cancel") {

                const uploaded_img = {};

                fetchObjects([{ "name": "fetch_uploaded_img_key", "arg": { "itmCode": itmCode } }]).then(function (data) {

                    if (data.fetch_uploaded_img_key.status) {

                        data.fetch_uploaded_img_key.uploaded_img_key.forEach(img_key => {
                            uploaded_img[img_key] = 99;
                        });

                        const info_struct = {
                            "itmCode": itmObj.pr_itm_itm_code,
                            "id": itmObj.pr_itm_part_id,
                            "name": itmObj.pr_itm_part_name,
                            "spec": itmObj.pr_itm_part_spec,
                            "req_val": itmObj.pr_itm_req_quan,
                            "cf_val": itmObj.pr_itm_cf_quan,
                            "note": itmObj.pr_itm_note,
                            "itm_status": itmObj.pr_itm_itm_status,
                            "gr_val": itmObj.pr_itm_gr_quan,
                            "pic_obj": uploaded_img,
                        }

                        generate_popup_item_detail(itm_detail_cont, info_struct, uploaded_img, mode);




                    } else {
                        throw new Error('Fetching img_key error');
                    }

                });


                record_btn.off();
                record_btn.on('click', function () {

                    // This gr_quan is actually canceled quan
                    const remain_gr_quan_value = itm_detail_cont.find('.remain-gr-quantity-input').val();
                    const gr_quan_value = itm_detail_cont.find('.gr-quantity-input').val();

                    const remain_gr_quan = (isNaN(parseFloat(remain_gr_quan_value)) || remain_gr_quan_value <= 0) ? false : parseFloat(remain_gr_quan_value)
                    const gr_quan = (isNaN(parseFloat(gr_quan_value)) || gr_quan_value <= 0) ? false : parseFloat(gr_quan_value)

                    if ((remain_gr_quan === false || gr_quan === false) || (gr_quan > remain_gr_quan)) {
                        alert('จำนวนยกเลิกไม่ถูกต้อง');
                        return false;
                    }


                    // Proceed

                    if (!confirm("ยืนยันการยกเลิกการรับสินค้าหรือไม่?")) {
                        return false;
                    }

                    fetchObjects([{ "name": "cancel_gr_item", "arg": { "itmCode": itmCode, "prCode": prCode } }]).then(function (data) {
                        if (data.cancel_gr_item.status) {
                            alert('ยกเลิกสินค้าสำเร็จ');
                            if (data.cancel_gr_item.all_done) {
                                location.reload();
                            }else {
                                appendFormField(page, prCode, false);
                                close_btn.trigger('click');
                            }
                
                            return true;
                        }

                    })
                        .catch((error) => {
                            console.log(error);
                            return false;
                        });



                });
                btn_div.append(record_btn);


            }

            else {

                throw new Error('Invalid Mode');
            }

            popupContent.append(itm_detail_cont, btn_div);

            popupElement.css('display', 'block');
            overlayElement.css('display', 'block');


        })
            .catch((error) => {
                popupContent.empty();
                console.log(error);
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return false;
            });


    }

    function generate_popup_item_detail(container, info_obj, uploaded_img = {}, viewMode) {
        // Display_img_type -> file for first time uploaded / link for fetching later

        container.empty();

        viewMode = viewMode.toLowerCase();

        const left_div_cont = $('<div>').addClass('popup-item-detal-column-side-div');
        const right_div_cont = $('<div>').addClass('popup-item-detal-column-side-div');

        const info_itmCode = info_obj.itmCode ?? null;
        const info_id_val = info_obj.id;
        const info_name_val = info_obj.name;
        const info_spec_val = info_obj.spec;

        const info_remain_gr_val = isNaN(parseFloat(info_obj.cf_val) - parseFloat(info_obj.gr_val)) ? 0 : (parseFloat(info_obj.cf_val) - parseFloat(info_obj.gr_val));
        const info_note_val = info_obj.note ?? "";
        const info_pic_obj = info_obj.pic_obj ?? {}; // Containing Li of each picture's link

        const element_id = label_value_div('รหัสอะไหล่', info_id_val);
        const element_name = label_value_div('ชื่อ', info_name_val);
        const element_spce = label_value_div('สเปค', info_spec_val);

        const remain_gr_quan_input = $('<input>').attr('type', 'text').addClass('remain-gr-quantity-input quantity-input').attr('placeholder', 'จำนวนที่ต้องรับคงเหลือ').val(info_remain_gr_val);
        const text_area_input = $('<textarea>').css('resize', 'none').addClass('info-textarea-input').attr('placeholder', 'รายละเอียดเพิ่มเติม').val(info_note_val);

        const element_remain_gr_quan = $('<div>').addClass('label-element-cont').append($('<label>').addClass('info-label').text("จำนวนต้องรับคงเหลือ: "), remain_gr_quan_input);
        const element_note_text_area = $('<div>').addClass('label-element-cont').append($('<label>').addClass('info-label').text("รายละเอียดเพิ่มเติม: "), text_area_input);
        const element_picture_list_cont = $('<div>').addClass('item-pic-div pic-div');

        const element_picture_list = $('<ul>').addClass('pic-ul');
        // appeend_li_value
        picture_to_li(element_picture_list, info_pic_obj, info_itmCode);




        remain_gr_quan_input.on('input', function () {

            allowFloatingPoint($(this));
        });




        element_picture_list_cont.append(element_picture_list);

        left_div_cont.append(element_id, element_name, element_spce, element_remain_gr_quan);
        right_div_cont.append(element_note_text_area, element_picture_list_cont);


        if (viewMode === "view") {
            remain_gr_quan_input.prop('disabled', true);
            text_area_input.prop('disabled', true);

            element_picture_list.find('.pic-li-remove-btn').remove();

        } else if (viewMode === "gr") {
            remain_gr_quan_input.prop('disabled', true);
            text_area_input.prop('disabled', true);

            element_picture_list.find('.pic-li-remove-btn').remove();
            // Add approved req quan field
            const gr_quan_input = $('<input>').attr('type', 'text').addClass('gr-quantity-input quantity-input').attr('placeholder', 'ระบุจำนวนที่ GR').val(info_remain_gr_val);
            const element_gr_req_quan = $('<div>').addClass('label-element-cont').append($('<label>').addClass('info-label').text("จำนวน GR: "), gr_quan_input);


            gr_quan_input.on('input', function () {

                allowFloatingPoint($(this));

                let current_input = parseFloat($(this).val());
                let max_val = parseFloat(info_remain_gr_val);


                if (!isNaN(current_input) && !isNaN(max_val)) {
                    if (current_input > max_val) {
                        $(this).val('0'); // Reset input value to 0
                    }
                }

            });

            element_remain_gr_quan.after(element_gr_req_quan);
        } else if (viewMode === "cancel") {
            remain_gr_quan_input.prop('disabled', true);
            text_area_input.prop('disabled', true);

            element_picture_list.find('.pic-li-remove-btn').remove();
            // Add approved req quan field
            const gr_quan_input = $('<input>').attr('type', 'text').addClass('gr-quantity-input quantity-input').attr('placeholder', 'ระบุจำนวนที่ยกเลิก').val(info_remain_gr_val).prop('disabled', true);
            const element_gr_req_quan = $('<div>').addClass('label-element-cont').append($('<label>').addClass('info-label').text("จำนวน ยกเลิก: "), gr_quan_input);


            gr_quan_input.on('input', function () {

                $(this).val(info_remain_gr_val);

            });

            element_remain_gr_quan.after(element_gr_req_quan);

        }



        container.append(left_div_cont, right_div_cont);

    }

    function generate_form_field(prCode = null, access = false) {

        return new Promise((resolve, reject) => {
            if (page.find('#form-field').length !== 0) {
                page.find('#form-field').remove();
            }

            fetchObjects([{ "name": "fetch_group_type_selection", "arg": "" }, { "name": "fetch_requested_pr", "arg": { "prCode": prCode } }]).then(function (data) {
                if (data.fetch_group_type_selection.status && data.fetch_requested_pr.status) {



                    const group_obj = data.fetch_group_type_selection.group;
                    const job_obj = data.fetch_group_type_selection.job;

                    let current_PR = data.fetch_requested_pr.tableData[prCode];
                    const pr_Status = current_PR.prStatus;
                    // status: 0 -> Temporary: Editable and Removable items,
                    // status: 1 -> Wait for approval: display approval table


                    const container = $('<div>').addClass('block-container').attr('id', 'form-field');

                    // group_job_block
                    const group_job_block = $('<div>').addClass('sub-form-field').attr('id', 'group-job-block');

                    const prCodeText = current_PR.prCode ? current_PR.prCode : "รายการใหม่";
                    const selected_group = current_PR.prGroup ? current_PR.prGroup : "";
                    const selected_type = current_PR.prType ? current_PR.prType : "";
                    const selected_reqBy_date = (new Date((Math.max(new Date(current_PR.reqByDate ? current_PR.reqByDate : null), (new Date()))))).toISOString().split('T')[0];
                    const prCode_label = $('<label>').attr('id', 'prCode-label').html(`Ref: <b>${prCodeText}<b>`);
                    const group_select_div = $('<div>').addClass('inline-label-select').append($('<label>').addClass('topic-label').text('หน่วยงาน: ').css('font-weight', 'bold'));
                    const job_select_div = $('<div>').addClass('inline-label-select').append($('<label>').addClass('topic-label').text('ประเภทงาน: ').css('font-weight', 'bold'));

                    const group_select_element = $('<select>').addClass('group-job-select-element').attr('id', 'group-select').html(object_to_options(group_obj, selected_group, "obj"));
                    const job_select_element = $('<select>').addClass('group-job-select-element').attr('id', 'job-select').html(object_to_options(job_obj, selected_type, "obj"));

                    if (selected_group !== "") {
                        group_select_element.val(selected_group);
                    }
                    if (selected_type !== "") {
                        job_select_element.val(selected_type);
                    }

                    const req_date_select_div = $('<div>').addClass('inline-label-select').append($('<label>').addClass('topic-label').text('ต้องการภายใน: ').css('font-weight', 'bold'));
                    const req_date_select_element = $('<input>').attr('type', 'text').addClass('flatpickr').attr('id', 'req-date-select');




                    req_date_select_div.append(req_date_select_element);

                    req_date_select_div.find('.flatpickr').flatpickr({
                        altInput: true,
                        altFormat: "j F Y",
                        dateFormat: 'Y-m-d', // Date format (YYYY-MM-DD)
                        minDate: 'today',
                        disableMobile: "true",
                        defaultDate: selected_reqBy_date,
                    });

                    if (parseInt(pr_Status) > 1) {
                        group_select_element.prop('disabled', true);
                        job_select_element.prop('disabled', true);
                        req_date_select_div.find('.flatpickr').remove();

                        req_date_select_div.append(` ${formatDate(current_PR.reqByDate)} ${calculateDateDiff(current_PR.reqByDate)}`);

                    }

                    group_select_div.append(group_select_element);
                    job_select_div.append(job_select_element);

                    group_job_block.append(prCode_label, group_select_div, job_select_div, req_date_select_div);



                    // End group_job_block

                    const detail_table_block = $('<div>').addClass('sub-form-field').attr('id', 'detail-table-block');

                    const detail_table_cont = $('<div>').addClass('scroll-table-cont').attr('id', 'pr-detail-table-cont');



                    const detail_table = $('<table>').addClass('small-table fixed-header-table').attr('id', 'pr-detail-table');

                    const detail_thead = $('<thead>').html(`
    <tr>
    <th>#</th>
    <th class="part-detail-fixed-column">รายการ</th>
    <th>จำนวนที่รับแล้ว</th>
    <th>จำนวนที่ต้องรับคงเหลือ</th>
    <th>สถานะ</th>
    <th></th>
    </tr>
    `);

                    const detail_tbody = $('<tbody>');

                    let order = 1;
                    $.each(current_PR.itmlist, function (itmCode, detail_obj) {

                        const itm_status = detail_obj.pr_itm_itm_status;

                        if (itm_status == 5) {
                            return true;
                        }

                        const item_view_btn = $('<button>').attr('type', 'button').addClass('bg-oper-btn bg-oper-btn-view-item bg-view-item-btn').attr('data-itmCode', detail_obj.pr_itm_itm_code);
                        const item_gr_btn = $('<button>').attr('type', 'button').addClass('bg-oper-btn bg-oper-btn-gr-item bg-gr-item-btn').attr('data-itmCode', detail_obj.pr_itm_itm_code);
                        const item_cancel_gr_btn = $('<button>').attr('type', 'button').addClass('bg-oper-btn bg-oper-btn-cancel-gr-item bg-cancel-gr-item-btn').attr('data-itmCode', detail_obj.pr_itm_itm_code);

                        let newRow = `
        <tr class="itm-detail-row">
        <td>${order}</td>
        <td>ID: ${detail_obj.pr_itm_part_id} - ${detail_obj.pr_itm_part_name}<br><div class="scroll-inline-text">${detail_obj.pr_itm_part_spec}</div></td>
        <td>${detail_obj.pr_itm_gr_quan}</td>
        <td>${itm_status == 4 ? 0 :(parseFloat(detail_obj.pr_itm_cf_quan) - parseFloat(detail_obj.pr_itm_gr_quan))}</td>
        <td>${detail_obj.pr_itm_itm_status_name}</td>
        <td>${itm_status == 3 ? item_gr_btn.prop('outerHTML') : ""} ${itm_status == 3 ? item_cancel_gr_btn.prop('outerHTML') : ""} ${(itm_status > 2 && itm_status != 6) ? item_view_btn.prop('outerHTML') : ""}</td>
        </tr>
        `;
                        order++;
                        detail_tbody.append(newRow);
                    });


                    if (whoamiObj.usrank < 2) {
                        // If lower than HOD - Remove canceling btn
                        detail_tbody.find(".itm-detail-row .bg-cancel-gr-item-btn").remove();
                    }

                    // View Only (after approving)
                    detail_tbody.find(".itm-detail-row ").on('click', '.bg-view-item-btn', function () {
                        let itmCode = $(this).attr('data-itmCode');
                        let itmObj = current_PR.itmlist[itmCode];
                        show_item_popup_content(prCode, itmObj, "view");

                    });

                    detail_tbody.find(".itm-detail-row ").on('click', '.bg-gr-item-btn', function () {
                        let itmCode = $(this).attr('data-itmCode');
                        let itmObj = current_PR.itmlist[itmCode];
                        show_item_popup_content(prCode, itmObj, "gr");

                    });

                    detail_tbody.find(".itm-detail-row ").on('click', '.bg-cancel-gr-item-btn', function () {
                        let itmCode = $(this).attr('data-itmCode');
                        let itmObj = current_PR.itmlist[itmCode];
                        show_item_popup_content(prCode, itmObj, "cancel");

                    });


                    detail_table.append(detail_thead, detail_tbody);

                    detail_table_cont.append(detail_table);
                    detail_table_block.append(detail_table_cont);
                    container.append(group_job_block, detail_table_block);
                    resolve(container);
                } else {
                    throw new Error('Query Error');
                }
            })
                .catch((error) => {
                    console.log(error);
                    alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                    resolve(false);
                });

        });
    }
    async function appendFormField(parentElement, prCode, access) {
        try {
            const formField = await generate_form_field(prCode, access);
            parentElement.append(formField);
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }

    function filterPrTableObject(searchString, inputObject) {
        // Create an empty result object to store the filtered data.
        let resultObject = {};

        searchString = searchString.toLowerCase();
        // Loop through the input object.
        $.each(inputObject, function (key, value) {
            if (
                value.itmlist &&
                Object.values(value.itmlist).some(function (item) {
                    return (
                        item.pr_itm_part_name.toLowerCase().includes(searchString) ||
                        item.pr_itm_part_id.toLowerCase().includes(searchString) ||
                        item.pr_itm_itm_code.toLowerCase().includes(searchString) ||
                        item.pr_itm_part_spec.toLowerCase().includes(searchString) ||
                        item.pr_itm_prCode.toLowerCase().includes(searchString) ||
                        item.pr_itm_itm_real_pr.toLowerCase().includes(searchString)
                    );
                })
            ) {
                // If any item within the 'itmlist' property matches the search criteria,
                // include the whole object in the result.
                resultObject[key] = value;
            }
        });

        return resultObject;
    }
    function generate_tooltip(element, contentText) {
        element.on('mouseenter', function (event) {

            $('body').find('.floating-text').remove();
            let tooltipContent = contentText
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


            element.on("mousemove", function (event) {

                let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
                let y = event.clientY + window.scrollY + 10; // Adjust vertical position

                // Update tooltip position
                tooltip.css({ left: x + 'px', top: y + 'px' });
            });


            element.mouseleave(function () {
                tooltip.css('display', 'none');
                tooltip.remove(); // Remove the tooltip element from the DOM
            });
        });
    }
    function object_to_options(obj, selected_val = null, mode = "obj") {
        selected_val = selected_val ?? "";

        let option_html = `<option value="" ${selected_val === "" ? "selected" : ""} disabled>-- โปรดระบุ --</option>`;

        if (mode === "obj") {
            $.each(obj, function (id, name) {

                option_html += `<option value="${id}" ${selected_val == id ? "selected" : ""} >${name}</option>`;

            });
        } else if (mode === "arr") {
            obj.forEach(row => {
                option_html += `<option value="${row.id}" ${selected_val == row.id ? "selected" : ""} >${row.name}</option>`;
            });
        }


        return option_html;

    }
    function getObjectLength(obj) {
        let count = 0;
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                count++;
            }
        }
        return count;
    }
    function generated_requested_table(tableData) {
        // Return table element

        const table = $('<table>').addClass('small-table fixed-header-table').attr('id', 'requested-table');
        const thead = $('<thead>').html(`
    <tr>
    <th>#</th>
    <th>Ref.</th>
    <th>วันที่แจ้ง</th>
    <th class="part-detail-fixed-column">รายการ</th>
    <th>ต้องการก่อนวันที่</th>
    <th>สถานะ</th>
    </tr>
    `);

        const tbody = $('<tbody>');


        if (getObjectLength(tableData) > 0) {


            let itmOrder = 1;

            $.each(tableData, function (key, value) {
                let dataRow = tableData[key];
                let itmlist = $("<div>").addClass('item-list-div');
                let itmUl = $('<ul>').addClass('item-list-tr-ul');
                itmlist.append(itmUl);

                $.each(dataRow.itmlist, function (itmId, itmVal) {
                    let itmRow = dataRow.itmlist[itmId];
                    itmUl.append($('<li>').text(`${itmRow.pr_itm_part_id}: ${itmRow.pr_itm_part_name}`));
                });

                let newRow = $('<tr>').attr('data-prCode', `${dataRow.prCode}`).addClass('pr-data-detail').html(`
            <td>${itmOrder}</td>
            <td>${dataRow.prCode}<br># - ${dataRow.real_pr} </td>
            <td>${formatDate(dataRow.informDate)}</td>
            <td>${itmlist.prop('outerHTML')}</td>
            <td>${formatDate(dataRow.reqByDate)}</td>
            <td>${dataRow.prStatus_name}</td>
        `);

                let content = `Ref. <span style="color:#28b974;">${dataRow.prCode}</span> คลิกเพื่อดูรายละเอียด`;
                generate_tooltip(newRow, content);



                newRow.on('click', () => {

                    appendFormField(page, dataRow.prCode, false);

                });
                itmOrder += 1;
                tbody.append(newRow);
            });




        } else {
            let newRow = `<tr><td colspan="6" style="text-align:center;"><b><u>-- ไม่มีรายการแจ้งซื้อ --</u></b></td></tr>`;
            tbody.append(newRow);
        }

        table.append(thead, tbody);


        return table;
    }
    function generate_requested_element(tableData) {
        const container = $('<div>').addClass('block-container');
        const filter_bar = $('<input>').attr('type', 'text').addClass('filter-bar-input').attr('placeholder', 'กรอกคำค้นหา');
        const table_cont = $('<div>').addClass('scroll-table-cont');
        const table_element = generated_requested_table(tableData);
        const bar_div = $('<div>').addClass('inline-element-div').attr('id', 'requested-inline-element-div');

        bar_div.append(filter_bar)



        filter_bar.on('input', function () {
            let searchString = $(this).val();
            let filter_obj = filterPrTableObject(searchString, tableData);

            let filtered_table = generated_requested_table(filter_obj);

            container.find('.scroll-table-cont #requested-table').remove();

            container.find('.scroll-table-cont').append(filtered_table);

        })


        table_cont.append(table_element);

        container.append(bar_div, table_cont);

        return container;
    }



    function init_elements() {
        let tableData;


        close_btn.on('click', () => {
            popupContent.empty();
            popupElement.css('display', 'none');
            overlayElement.css('display', 'none');
        });

        $("#small-popup-close").click(function () {
            small_popup_div.fadeOut();
            small_popup_content.empty();
        });

        whoamina().then(function (data) {

            whoamiObj = data;

            fetchObjects([{ "name": "fetch_requested_pr", "arg": { "for_gr": true } }]).then(function (data) {
                if (data.fetch_requested_pr.status) {
                    tableData = data.fetch_requested_pr.tableData;
                    const requestedPR_element = generate_requested_element(tableData);
                    page.prepend(requestedPR_element);
                } else {
                    throw new Error('Query Erorr');
                }

            });
        })
            .catch((error) => {
                console.log(error);
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return false;

            });


    }


    init_navAndLoad();

    //Const Declaration

    const page = $('#pg-cont');
    var whoamiObj;
    const small_popup_div = $('#small-popup');
    const small_popup_content = $('.small-popup-content');
    const popupElement = $('#edit-popUpForm');
    const overlayElement = $('#dark-overlay');

    const popupContent = $('#form-context');
    const close_btn = $('#closepopUp');
    // ENd Const Declaration

    init_elements();

});