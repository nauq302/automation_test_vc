
class CallScriptData extends BaseData {

    constructor(parent, div) {
        super(parent,div);
        this.setHTML();
    }

    get defaultState() { return this.div.getElementsByClassName('default-state')[0]; }
    get defaultCallee() { return this.div.getElementsByClassName('default-callee')[0]; }

    setHTML() {
        this.div.innerHTML = /*html*/ `
            <div class="row">
                <label class="col-sm-2 control-label">Số di động gọi</label>
                <div class="col-sm-5"><input type="text" class="phone form-control"></div>
            </div>
            <div class="hr-line-dashed"></div>


            <div class="row">
                <label class="col-sm-2 control-label">Kết quả dự kiến</label>
                <div class="col-sm-5"><input type="text" class="default-state form-control"></div>
            </div>
            <div class="hr-line-dashed"></div>

            <div class="row">
                <label class="col-sm-2 control-label">Máy nghe dự kiến</label>
                <div class="col-sm-5">
                    <input type="text" class="default-callee form-control">
                    <small>Mỗi máy cách nhau bởi dấu ,</small>
                </div>
            </div>
        `;
    }

    setDataName(count) {
        this.phone.name = 'phone_' + count;
        this.defaultState.name = 'defaultState_' + count;
        this.defaultCallee.name = 'defaultCallee_' + count;
    }
}



class ListenScriptData extends BaseData {
    
    constructor(parent, div) {
        super(parent,div);
        this.setHTML();
    }

    get ringTime() { return this.div.getElementsByClassName('ring-time')[0]; }

    setHTML() {
        this.div.innerHTML = /*html*/ `
            <div class="row">
                <label class="col-sm-2 control-label">Chọn máy nghe</label>
                <div class="col-sm-5">
                    <select class="phone form-control select2_demo_1"></select>
                </div>
            </div>
            <div class="hr-line-dashed"></div>


            <div class="row">
                <label class="col-sm-2 control-label">Thời gian rung chuông (giây)</label>
                <div class="col-sm-5"><input type="number" class="ring-time form-control"></div>
            </div>
            <div class="hr-line-dashed"></div>
        `;

        this.refreshPhone();
    }

    refreshPhone() {
        this.phone.innerHTML = "";
        for (let c of callees) {
            let option = document.createElement('option');
            option.text = c;
            this.phone.add(option);
        }
    }

    setDataName(count) {
        this.phone.name = 'phone_' + count;
        this.ringTime.name = 'ringTime_' + count;
    }
}  

$(".select2_demo_1").select2({
    theme: 'bootstrap4',
});

/**
 * CallListenScript
 */
 class CallListenScript {
    actions = [];
    div;
    data;
    types;

    // Getter
    get id() { return this.div.getElementsByClassName('id')[0]; }
    get types() { return this.div.getElementsByClassName('type'); }
    get tBody() { return this.div.getElementsByTagName('tbody')[0]; }
    get addButton() { return this.div.getElementsByClassName('add-button')[0]; }
    get deleteWidgetButton() { return this.div.getElementsByClassName('delete-widget')[0]; }

    // Constructor
    constructor(parent) {
        this.div = document.createElement('div');
        this.div.classList.add('row');
        
        this.setHTML();
        this.data = new CallScriptData(this, this.div.getElementsByClassName('data')[0]);

        this.types = new ScriptTypeRadios(this, this.div.getElementsByClassName('types')[0], parent.s);

        // Set add button action
        this.addButton.onclick = (() => { this.addAction(); }).bind(this);

        // Set delete button action 
        this.deleteWidgetButton.onclick = (() => { parent.removeWidget(this); }).bind(this);
    }

    setCallScript() {
        this.data = new CallScriptData(this, this.div.getElementsByClassName('data')[0]);
    }

    setListenScript() {
        this.data = new ListenScriptData(this, this.div.getElementsByClassName('data')[0]);
    }

    // Add action into action list
    addAction() {
        let action = new Action(this);
        this.actions.push(action);
        this.tBody.appendChild(action.row);
    }

    // Remove a action from action list
    removeAction(action) {
        this.actions.splice(this.actions.indexOf(action), 1);
        this.tBody.removeChild(action.row);
    }

    // Set HTML
    setHTML() {
        this.div.innerHTML = /*html*/`
            <div class="widget">
                <div class="row">
                    <div class="col-sm-1">
                        <button type="button" class="delete-widget form-control">
                            <i class="fa fa-minus"></i>
                        </button>
                    </div>
                </div>
                <div class="hr-line-dashed"></div>

                <input type="hidden" class="id">

                <div class="row types">
                    <label class="col-sm-3 control-label">Chọn loại Kịch bản</label>

                    <label class="col-sm-3 control-label">
                        <input type="radio" value="call" class="type" checked/>
                        Kịch bản Gọi
                    </label>

                    <label class="col-sm-3 control-label">
                        <input type="radio" value="listen" class="type"/>
                        Kịch bản Nghe
                    </label>
                </div>
                <div class="hr-line-dashed"></div>

                <div class="data"></div>
                <div class="hr-line-dashed"></div>

                <div class="row">
                    <label class="col-sm-3 control-label">Danh sách Hành động</label>
                    <button class="add-button col-sm-2 btn btn-primary" type="button">Thêm Hành động</button>
                </div>

                <div class="row">
                    <div class="table-responsive col-sm-11">
                        <table class="table table-striped table-bordered table-hover">
                            <thead class="form-group">
                                <tr>
                                    <th>Hành động</th>
                                    <th>Giá trị</th>
                                    <th>Note</th>
                                    <th>Xóa</th>
                                </tr>
                            </thead>
                            <tbody class="tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="hr-line-dashed"></div>
        `;
    }

    // Set data name for submit
    setDataName(count) {
        this.types.setDataName(count);

        this.id.name = 'id_' + count;
        this.data.setDataName(count);

        for (let i = 0; i < this.actions.length; ++i) {
            this.actions[i].setDataName(count, i);
        }

        this.addSize(count);
    }

    // Add size
    addSize(count) {
        let input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'size_' + count;
        input.value = this.actions.length;
        this.div.appendChild(input);
    }
}



/**
 * 
 */
class CallListenScriptList {
    scripts = [];
    div;
    s = 0;

    // Create widget list
    constructor(div) {
        this.div = div;
    }

    // Add a widget
    addScript() {
        let script = new CallListenScript(this);
        this.scripts.push(script);
        this.div.appendChild(script.div);
        ++this.s;
    }

    // 
    removeCallListen(script) {
        this.scripts.splice(this.scripts.indexOf(script), 1);
        this.div.removeChild(script.div);
        --this.s;
    }

    setDataName() {
        for (let i = 0; i < this.scripts.length; ++i) {
            this.scripts[i].setDataName(i);
        }

        this.addSize();
    }

    addSize() {
        let input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'size';
        input.value = this.scripts.length;
        this.div.appendChild(input);
    }
}

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;

    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", e => {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted valu
        es*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;

        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");

        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                    b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", e => {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; ++i) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", e => { closeAllLists(e.target); });
}

function changCampaign(campaignId) {
    $.ajax({
        type: "POST",
        url: "campaign_hotline",
        datatype: "json",
        data: { 
            campaign_id: campaignId
        },
        success: (response) => { 
            callees = response.split('\n');
            
            for (let s of scriptList.scripts) {
                if (s.types.radios[ScriptTypeRadios.LISTEN].checked == true) {
                    s.data.refreshPhone();
                }
            }
        }
        
    });
}