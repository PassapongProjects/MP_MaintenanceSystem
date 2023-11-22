$(document).ready(function() {
    // jQuery code to load HTML and CSS into a PHP page

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

// This file's content
const mode_hidden = $('#selected-mode');
const labelHeader = $('.header-label-cont');
const card_container = $('.card-container');
const new_button_div = $('#new-button-cont');

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


// Function to enable scrolling

function fetchObjects(funcArr = null) {
    // Name As string
    // Arg as array {}
    if (funcArr ==null) {return false};
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'POST',
            url: 'fetch_registry_state_config.php',
            data: {"functions":funcArr},
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

// Every mode should be displayed the same way, just change the way that card element is displayed

function display_card_elements(table) {
    card_container.html("");

    fetchObjects([{"name":"fetch_config_detail","arg":{tableName:table}}]).then(function(data){
        if (!data.fetch_config_detail.status){alert('ผิดพลาดกรุณารีเฟลช'); return false;}

        new_button_div.html(`<button type="button" id='new-button' data-itemMode="${table}">สร้างรายการใหม่</button>`);


        if(table=='employee'){
            //Employee table
            fetchObjects([{"name":"fetch_config_detail","arg":{tableName:'department'}}]).then(function(extradata){
                if (!extradata.fetch_config_detail.status){alert('ผิดพลาดกรุณารีเฟลช'); return false;}
                
                departmentData = extradata.fetch_config_detail.tableData;

                objectsArrays = data.fetch_config_detail.tableData; 
                objectsArrays.forEach(item => {
                    let newCard = generate_card_elements(item);
                    card_container.append(newCard);
                });

            })
            .catch(function(error){
                console.log(error);
        
            });
        }else{
            // Normal table
        objectsArrays = data.fetch_config_detail.tableData; 
        objectsArrays.forEach(item => {
            let newCard = generate_card_elements(item);
            card_container.append(newCard);
        });
        }
    })
    .catch(function(error) {
        console.log(error);
    });
}


function display_delete_form(ele_mode, ele_id) {
    const container_div = $('#form-context');
    container_div.html("");

    let content = $.grep(objectsArrays,function(obj){
        return obj.id == ele_id;
        });
        
        if (content.length != 1) {
            alert('ผิดพลาดกรุณารีเฟลช'); return false;
        }else {content = content[0];}
    
        let context = `
        <input type='hidden' class="element-tableName-hidden" value="${ele_mode}">
        <input type='hidden' class="element-id-hidden" value="${ele_id}">
        <span class="operation" style="color:#f00;"><b>ยืนยันการลบรายการ?</b></span>
        <span class="id-span" style="color:#f00;"><b>ID:</b> ${ele_id}</span>
        <span class="name-span"><b>รายการ:</b> ${content[1]}</span>

        <div class="button-field-cont">
        <button type='button' class="update-button btn btn-primary">ลบรายการ</button>
        <button type='button' class="cancel-button btn btn-danger">ยกเลิก</button>
        </div>
        `;

    container_div.html(context);
    container_div.append(`<input type="hidden" class="operation-input-hidden" value="delete_value">`);
}


function display_new_form(ele_mode){
// mode is table name ...
const container_div = $('#form-context');
container_div.html("");
// Some mode has to display more than Name such as employee / Auth_Type may be na

let context;
if(ele_mode.toLowerCase() =='employee') {

    let optionHtml = `<option value='' disabled selected>-เลือก-</option>`;
    departmentData.forEach(department => {
        let newoption = `<option value='${department.id}'}>${department.name}</option>`;
        optionHtml+=(newoption);
    });


    context = `
        <input type='hidden' class="element-tableName-hidden" value="${ele_mode}">
        <div class="input-field-cont">
        <span class="id-span">ID: สร้างรายการใหม่</span>
        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="name">
        <label class="ele-field-label">ชื่อ: </label>
        <input type='text' class="element-name-field" value="" placeholder="ชื่อเรียก" maxlength="255" required>
        </div>
    
        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="surname">
        <label class="ele-field-label">นามสกุล: </label>
        <input type='text' class="element-name-field" value="" placeholder="นามสกุล" maxlength="255" required>
        </div>
    
        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="tel">
        <label class="ele-field-label">โทร: </label>
        <input type='text' class="element-name-field" value="" placeholder="10 หลักไม่มีขีด '-'" maxlength="10" required>
        </div>
    
        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="department">
        <label class="ele-field-label">แผนก: </label>
        <select class='element-name-field'>
        ${optionHtml}
        </select>
    
        </div>
    
    
        </div>
        <div class="button-field-cont">
        <button type='button' class="update-button btn btn-primary">บันทึก</button>
        <button type='button' class="cancel-button btn btn-danger">ยกเลิก</button>
        </div>
    `;
    
}else if(ele_mode.toLowerCase() =='auth_type'){


context = `
    <input type='hidden' class="element-tableName-hidden" value="${ele_mode}">
    <div class="input-field-cont">
    <span class="id-span">ID: สร้างรายการใหม่</span>
    <div class="input-ele-cont">
    <input type="hidden" class='column-name-hidden' value="name">
    <label class="ele-field-label">ชื่อ: </label>
    <input type='text' class="element-name-field" value="" placeholder="ชื่อเรียก" maxlength="255" required>
    </div>

    <div class="input-ele-cont">
    <input type="hidden" class='column-name-hidden' value="rank">
    <label class="ele-field-label">การอนุญาต:</label>
    <select class='element-name-field'>
    <option value='' disabled selected>-เลือก-</option>
    <option value="5">5 (สูงกว่า Director)</option>
    <option value="4">4 (ระดับ Director)</option>
    <option value="3">3 (ระดับ Manager)</option>
    <option value="2">2 (ระดับ HOD)</option>
    <option value="1">1 (ระดับ Operator)</option>
    </select>
    </div>

    </div>
    <div class="button-field-cont">
    <button type='button' class="update-button btn btn-primary">บันทึก</button>
    <button type='button' class="cancel-button btn btn-danger">ยกเลิก</button>
    </div>
`;

} else {
// Ordinary type, only name is editable

let name_field = 'name';
if (ele_mode.toLowerCase()=='status'){
    name_field = 'status_name';
}

context = `
    <input type='hidden' class="element-tableName-hidden" value="${ele_mode}">
    <input type='hidden' class="element-id-hidden" value="">
    <div class="input-field-cont">
    <span class="id-span">ID: สร้างรายการใหม่</span>
    <div class="input-ele-cont">
    <input type="hidden" class='column-name-hidden' value="${name_field}">
    <label class="ele-field-label">ชื่อ: </label>
    <input type='text' class="element-name-field" value="" placeholder="ชื่อเรียก" maxlength="255" required>
    </div>
    </div>
    <div class="button-field-cont">
    <button type='button' class="update-button btn btn-primary">บันทึก</button>
    <button type='button' class="cancel-button btn btn-danger">ยกเลิก</button>
    </div>
`;

}
container_div.html(context);
container_div.append(`<input type="hidden" class="operation-input-hidden" value="new_value">`);
}



function display_edit_form(ele_mode, ele_id){
// mode is table name ...
const container_div = $('#form-context');
container_div.html("");
// Some mode has to display more than Name such as employee / Auth_Type may be na


let content = $.grep(objectsArrays,function(obj){
return obj.id == ele_id;
});

if (content.length != 1) {
    alert('ผิดพลาดกรุณารีเฟลช'); return false;
}else {content = content[0];}

let context;
if(ele_mode.toLowerCase() =='employee') {

    let optionHtml = ``;
    departmentData.forEach(department => {
        let newoption = `<option value='${department.id}' ${department.id ==content.department?"selected":''}>${department.name}</option>`;
        optionHtml+=(newoption);
    });


    context = `
        <input type='hidden' class="element-tableName-hidden" value="${ele_mode}">
        <input type='hidden' class="element-id-hidden" value="${ele_id}">
        <div class="input-field-cont">
        <span class="id-span">ID: ${ele_id}</span>
        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="name">
        <label class="ele-field-label">ชื่อ: </label>
        <input type='text' class="element-name-field" value="${content.name}" placeholder="ชื่อเรียก" maxlength="255" required>
        </div>
    
        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="surname">
        <label class="ele-field-label">นามสกุล: </label>
        <input type='text' class="element-name-field" value="${content.surname}" placeholder="นามสกุล" maxlength="255" required>
        </div>
    
        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="tel">
        <label class="ele-field-label">โทร: </label>
        <input type='text' class="element-name-field" value="${content.tel}" placeholder="10 หลักไม่มีขีด '-'" maxlength="10" required>
        </div>
    
        <div class="input-ele-cont">
        <input type="hidden" class='column-name-hidden' value="department">
        <label class="ele-field-label">แผนก: </label>
        <select class='element-name-field'>
        ${optionHtml}
        </select>
    
        </div>
    
    
        </div>
        <div class="button-field-cont">
        <button type='button' class="update-button btn btn-primary">บันทึก</button>
        <button type='button' class="cancel-button btn btn-danger">ยกเลิก</button>
        </div>
    `;
    
}else if(ele_mode.toLowerCase() =='auth_type'){


context = `
    <input type='hidden' class="element-tableName-hidden" value="${ele_mode}">
    <input type='hidden' class="element-id-hidden" value="${ele_id}">
    <div class="input-field-cont">
    <span class="id-span">ID: ${ele_id}</span>
    <div class="input-ele-cont">
    <input type="hidden" class='column-name-hidden' value="name">
    <label class="ele-field-label">ชื่อ: </label>
    <input type='text' class="element-name-field" value="${content.name}" placeholder="ชื่อเรียก" maxlength="255" required>
    </div>

    <div class="input-ele-cont">
    <input type="hidden" class='column-name-hidden' value="rank">
    <label class="ele-field-label">การอนุญาต:</label>
    <select class='element-name-field'>
    <option value="5" ${content.rank==5?'selected':''}>5 (สูงกว่า Director)</option>
    <option value="4" ${content.rank==4?'selected':''}>4 (ระดับ Director)</option>
    <option value="3" ${content.rank==3?'selected':''}>3 (ระดับ Manager)</option>
    <option value="2" ${content.rank==2?'selected':''}>2 (ระดับ HOD)</option>
    <option value="1" ${content.rank==1?'selected':''}>1 (ระดับ Operator)</option>
    </select>
    </div>

    </div>
    <div class="button-field-cont">
    <button type='button' class="update-button btn btn-primary">บันทึก</button>
    <button type='button' class="cancel-button btn btn-danger">ยกเลิก</button>
    </div>
`;

} else {
// Ordinary type, only name is editable

let name_field = 'name';
if (ele_mode.toLowerCase()=='status'){
    name_field = 'status_name';
}

context = `
    <input type='hidden' class="element-tableName-hidden" value="${ele_mode}">
    <input type='hidden' class="element-id-hidden" value="${ele_id}">
    <div class="input-field-cont">
    <span class="id-span">ID: ${ele_id}</span>
    <div class="input-ele-cont">
    <input type="hidden" class='column-name-hidden' value="${name_field}">
    <label class="ele-field-label">ชื่อ: </label>
    <input type='text' class="element-name-field" value="${content[1]}" placeholder="ชื่อเรียก" maxlength="255" required>
    </div>
    </div>
    <div class="button-field-cont">
    <button type='button' class="update-button btn btn-primary">บันทึก</button>
    <button type='button' class="cancel-button btn btn-danger">ยกเลิก</button>
    </div>
`;

}
container_div.html(context);
container_div.append(`<input type="hidden" class="operation-input-hidden" value="update_value">`);
}




function generate_card_elements(item) {
    let element;
    let departSelf;
    if (item.table=='employee'){
    departSelf = $.grep(departmentData,function(obj){
        return obj.id == item.department;
    });

    if (departSelf.length==0) {
        departSelf = ['N/A'];
    }
    }
    if (!item.editable) {
        // Disable editing
        if(item.table =='employee'){
            // Show many Field
            element = `
            <div class="card disabled-card" data-itemId="${item.id}" data-itemMode="${item.table}">
                <div class="card-body">
                    <h5 class="card-title title-text">ชื่อ: ${item.name}</h5>
                    <p class="card-text id-text"><b>ID:</b> ${item.id}</p>
                    <p class="card-text name-text"><b>รายการ:</b> ${item.name}</p>
                    <p class="card-text tel-text"><b>โทร:</b> ${item.tel}</p>
                    <p class="card-text department-text"><b>แผนก:</b> ${departSelf[0].name ?? 'N/A'}</p>
                    <div class="card-actions" style="text-align:center;">
                    <p>---ไม่สามารถเปลี่ยนแปลงได้---</p>
                    </div>
                </div>
            </div>
            `;
        }else if(item.table =='auth_type'){
            // Show Rank
            element = `
            <div class="card disabled-card" data-itemId="${item[0]}" data-itemMode="${item.table}">
                <div class="card-body">
                    <h5 class="card-title title-text">ชื่อ: ${item[1]}</h5>
                    <p class="card-text id-text"><b>ID:</b> ${item[0]}</p>
                    <p class="card-text name-text"><b>รายการ:</b> ${item[1]}</p>
                    <p class="card-text rank-text"><b>ระดับอนุญาต:</b> ${item.rank}</p>
                    <div class="card-actions" style="text-align:center;">
                        <p>---ไม่สามารถเปลี่ยนแปลงได้---</p>
                    </div>
                </div>
            </div>
            `;
        }else {
            // Ordinary card
            element = `
            <div class="card disabled-card" data-itemId="${item[0]}" data-itemMode="${item.table}">
                <div class="card-body">
                    <h5 class="card-title title-text">ชื่อ: ${item[1]}</h5>
                    <p class="card-text id-text"><b>ID:</b> ${item[0]}</p>
                    <p class="card-text name-text"><b>รายการ:</b> ${item[1]}</p>
                    <div class="card-actions" style="text-align:center;">
                        <p>---ไม่สามารถเปลี่ยนแปลงได้---</p>
                    </div>
                </div>
            </div>
            `;
        }

    }else {
        // Enable editing items
        if(item.table =='employee'){
            // Show many Field
            element = `
            <div class="card" data-itemId="${item.id}" data-itemMode="${item.table}">
                <div class="card-body">
                    <h5 class="card-title title-text">ชื่อ: ${item.name}</h5>
                    <p class="card-text id-text"><b>ID:</b> ${item.id}</p>
                    <p class="card-text name-text"><b>รายการ:</b> ${item.name}</p>
                    <p class="card-text tel-text"><b>โทร:</b> ${item.tel}</p>
                    <p class="card-text department-text"><b>แผนก:</b> ${departSelf[0].name ?? 'N/A'}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary btn-edit">แก้ไข</button>
                        <button class="btn btn-danger btn-delete">ลบ</button>
                    </div>
                </div>
            </div>
            `;

        }else if(item.table =='auth_type'){
            // Show Rank
            element = `
            <div class="card" data-itemId="${item.id}" data-itemMode="${item.table}">
                <div class="card-body">
                    <h5 class="card-title title-text">ชื่อ: ${item.name}</h5>
                    <p class="card-text id-text"><b>ID:</b> ${item.id}</p>
                    <p class="card-text name-text"><b>รายการ:</b> ${item.name}</p>
                    <p class="card-text rank-text"><b>ระดับอนุญาต:</b> ${item.rank}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary btn-edit">แก้ไข</button>
                        <button class="btn btn-danger btn-delete">ลบ</button>
                    </div>
                </div>
            </div>
            `;
        }else {
        element = `
            <div class="card" data-itemId="${item[0]}" data-itemMode="${item.table}">
                <div class="card-body">
                    <h5 class="card-title title-text">ชื่อ: ${item[1]}</h5>
                    <p class="card-text id-text"><b>ID:</b> ${item[0]}</p>
                    <p class="card-text name-text"><b>รายการ:</b> ${item[1]}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary btn-edit">แก้ไข</button>
                        <button class="btn btn-danger btn-delete">ลบ</button>
                    </div>
                </div>
            </div>
            `;
        }
    }

    return element;
}


function initElements(){
    const fetch_url = {
        "mc_type":"mc_type",
        "mc_rank":"mc_rank",
        "eng_group":"group_type",
        "mc_status":"status",
        "purchase_job_type":"job",
        "department":"department",
        "user_rank":"auth_type",
        "user_config":"employee"
    }

    const mode_name = {
        "mc_type":"ประเภทเครื่องจักร",
        "mc_rank":"ความสำคัญเครื่องจักร",
        "eng_group":"ส่วนงานวิศวะกรรม",
        "mc_status":"สถานะเครื่องจักร",
        "purchase_job_type":"หมายเหตุการซื้อ",
        "department":"แผนก",
        "user_rank":"ตำแหน่ง",
        "user_config":"เพื่ม/แก้ไข พนักงาน"
    }



    $('.sidebar .menu-item a').on("click",function(e){
        e.preventDefault();
        let selectedMenu = fetch_url[$(this).attr("id")];
        let selectedModeName = mode_name[$(this).attr("id")];
        if(selectedMenu) {
            mode_hidden.val(selectedMenu);
            labelHeader.html(selectedModeName);
            display_card_elements(selectedMenu);


        }else{
            console.log(`error with this id: ${(this).attr("id")}`);
        }

    });

    $('.card-container').on("click",'.card .btn-delete',function(){

        // delete item
        let element_id = $(this).closest('.card').attr('data-itemId');
        let element_mode = $(this).closest('.card').attr('data-itemMode');

        if (element_mode != mode_hidden.val()){ alert('ผิดพลาด กรุณารีเฟรช'); location.reload(); return false;}
        display_delete_form(element_mode,element_id);
        $('#edit-popUpForm').css('display','block');
        $('#dark-overlay').css('display','block');

        
    })

    $('#new-button-cont').on("click",'#new-button',function(){
        let element_mode = $(this).attr("data-itemMode");

        if (element_mode != mode_hidden.val()){ alert('ผิดพลาด กรุณารีเฟรช'); location.reload(); return false;}
        display_new_form(element_mode);
        $('#edit-popUpForm').css('display','block');
        $('#dark-overlay').css('display','block');
    });


    $('.card-container').on("click",'.card .btn-edit',function(){
        let element_id = $(this).closest('.card').attr('data-itemId');
        let element_mode = $(this).closest('.card').attr('data-itemMode');

        if (element_mode != mode_hidden.val()){ alert('ผิดพลาด กรุณารีเฟรช'); location.reload(); return false;}
        display_edit_form(element_mode,element_id);
        $('#edit-popUpForm').css('display','block');
        $('#dark-overlay').css('display','block');
    });
    
    $('#closepopUp').on("click",()=>{
        const container_div = $('#form-context');
        $('#edit-popUpForm').css('display','none');
        $('#dark-overlay').css('display','none');
        container_div.html("");
    });

    $('#form-context').on("click",".cancel-button",function(){
        const container_div = $('#form-context');
        $('#edit-popUpForm').css('display','none');
        $('#dark-overlay').css('display','none');
        container_div.html("");
        
    });
    $('#form-context').on("click",".update-button",function(){
        const all_select_form = $(this).closest('#form-context').find('.input-field-cont .input-ele-cont select');
        const all_input_form = $(this).closest('#form-context').find('.input-field-cont .input-ele-cont input[type="text"]');
        const operation_mode = $('#form-context').find('.operation-input-hidden').val();
        let inputflag = true;

        all_input_form.each(function() {
            const inputElement = $(this);
            
            if (!isSafeInput(inputElement.val())) {
                inputElement.val('');
                inputflag = false;
            }
          
        });

        all_select_form.each(function(){
            const selectElement = $(this);

            if(isNaN(parseInt(selectElement.val()))){
                // If the option's value is changed (abnormal...)
                alert("ข้อมูลไม่ถูกต้อง");
                inputflag = false;
                return false;
            }

        });


        if(!inputflag){
            alert(`ตัวอักษรที่ห้ามใช้( '";<> ) หรือ กรอกข้อมูลไม่ครบถ้วน`);
            return false; // Use "return false" to break out of the loop
        }else {
            // Process the updating
    
            const all_col_val = $(this).closest('#form-context').find('.input-field-cont .input-ele-cont');
            const table = $(this).closest('#form-context').find('.element-tableName-hidden').val();
            const objId = $(this).closest('#form-context').find('.element-id-hidden').val() ?? null;
   
            if (operation_mode==='update_value' || operation_mode ==='delete_value'){
                // Dont have to check if mode == insert_value
                if (isNaN(parseInt(objId))){
                    alert('เกิดข้อผิดพลาด กรุณารีเฟลช');
                    return false;
                }
            }
            
            if(!isSafeInput(table)) {
                alert('เกิดข้อผิดพลาด กรุณารีเฟลช');
                return false;
            }else {                
                const resultObject = {}; // Initialize an empty object

                all_col_val.each(function(){
                    const col_val = $(this);
                    const t_column = col_val.find(".column-name-hidden").val();
                    const t_value =  col_val.find(".element-name-field").val();
        
                    const elementType = col_val.find(".element-name-field")[0].tagName.toLowerCase();

                    // i type for select
                    const type = elementType==='select'?'i':'s';
        
                    resultObject[t_column] = { value: t_value, type: type };
                });

                let arg = {
                    tableName:table,
                    objId:objId,
                    columnVal: resultObject
                };
                let promise_name;

                if (operation_mode ==='update_value') {
                    promise_name = "update_config_detail";
                }else if(operation_mode==='new_value'){
                    promise_name = "insert_config_detail";
                }else if(operation_mode==='delete_value'){
                    promise_name = "delete_config_detail";
                }else {
                    // Should not land here
                    alert('Something went wrong');
                    console.log('Haha what are you doing?');
                    return false;
                }
                // Sending data
                fetchObjects([{"name":promise_name,"arg":arg}]).then(function(data){ 
                    if (data[promise_name]) {
                        // Succeed
                        alert('บันทึกข้อมูลสำเร็จ');
                        location.reload();
                        return;
                    }else {
                        // Failed to update

                        if(promise_name==='delete_config_detail'){
                            alert('ไม่สามารถลบรายการนี้ได้เนื่องจากติดเงื่อนไข');
                        return;
                        }else {
                            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณารีเฟลช');
                            return;
                        }

                        
                    }

                })
                .catch(function(error) {
                    console.log(error);
                })
                

            }

            
        }
        
    });

}



initElements();
});