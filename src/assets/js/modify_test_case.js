import { BaseData, Action, ScriptTypeRadios, callees } from './change_test_case.js'
export { ScriptTypeRadios, callees };

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
        this.deleteWidgetButton.onclick = (() => { parent.removeCallListen(this); }).bind(this);
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
export class CallListenScriptList {
    scripts = [];
    div;
    s = 0;

    // Create widget list
    constructor() {
        
    }

    init(div) {
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

export var scriptList = new CallListenScriptList();

export function changCampaign(cid) {

    $.ajax({
        type: "POST",
        url: "campaign_hotline",
        datatype: "json",
        data: { 
            campaign_id: cid
        },
        success: response => { 
            callees.length = 0;

            for (let line of response.split("\n")) {
                callees.push(line);
            }
            

            for (let s of scriptList.scripts) {
                if (s.types.radios[1].checked) {
                    s.data.refreshPhone();
                }
            }
        },
    });

    
}