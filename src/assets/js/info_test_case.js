
let active;

class Action {
    row;

    get action() { return this.row.getElementsByClassName('action')[0]; }
    get value() { return this.row.getElementsByClassName('value')[0]; }
    get note() { return this.row.getElementsByClassName('note')[0]; }
    get delete() { return this.row.getElementsByClassName('delete')[0]; }

    constructor() {
        this.row = document.createElement('tr');
        this.setHTML();
    }

    setHTML() {
        this.row.innerHTML = /*html*/`
            <td class="col-sm-2"><input type="text" class="action form-control" disabled/></td>
            <td class="col-sm-2"><input type="text" class="value form-control" disabled/></td>
            <td class="col-sm-3"><textarea class="note form-control" disabled></textarea></td>
        `;
    }

}

Action.typeDict = {
    "press": "Press (Phím bấm sẽ thực hiện)",
    "wait": "Wait (Thời gian chờ đợi)",
    "play": "Play (Phát một file ghi âm khi vào hội thoại)",
    "delay": "Delay (Thời gian chờ trước khi thực hiện cuộc gọi)",
}



class CallScriptData {
    div;

    get status() { return this.div.getElementsByClassName('status')[0]; }
    get expectedState() { return this.div.getElementsByClassName('expected-state')[0]; }
    get expectedCallee() { return this.div.getElementsByClassName('expected-callee')[0]; }
    get realState() { return this.div.getElementsByClassName('real-state')[0]; }
    get realCallee() { return this.div.getElementsByClassName('real-callee')[0]; }

    constructor(div) {
        this.div = div;
        this.setHTML();
    }

    setHTML() {
        this.div.innerHTML = /*html*/`
            <div class="row">
                <label class="col-sm-2 control-label">Trạng thái</label>
                <div class="col-sm-5"><input type="text" class="status form-control"></div>
            </div>
            <div class="hr-line-dashed"></div>

            <div class="row">
                <label class="col-sm-2 control-label">Kết quả dự kiến</label>
                <div class="col-sm-5"><input type="text" class="expected-state form-control"></div>
            </div>
            <div class="hr-line-dashed"></div>

            <div class="row">
                <label class="col-sm-2 control-label">Kết quả thực tế</label>
                <div class="col-sm-5"><input type="text" class="real-state form-control"></div>
            </div>
            <div class="hr-line-dashed"></div>

            <div class="row">
                <label class="col-sm-2 control-label">Máy nghe dự kiến</label>
                <div class="col-sm-5">
                    <input type="text" class="expected-callee form-control">
                    <small>Mỗi máy cách nhau bởi dấu ,</small>
                </div>
            </div>
            <div class="hr-line-dashed"></div>

            <div class="row">
                <label class="col-sm-2 control-label">Máy nghe thực tế</label>
                <div class="col-sm-5">
                    <input type="text" class="real-callee form-control">
                </div>
            </div>
        `;
    }
}

class ListenScriptData {
    div;

    get ringTime() { return this.div.getElementsByClassName('ring-time')[0]; }
    constructor(div) {
        this.div = div;
        this.setHTML();
    }

    setHTML() {
        this.div.innerHTML = /*html*/`
            <div class="row">
                <label class="col-sm-2 control-label">Thời gian rung chuông (giây)</label>
                <div class="col-sm-5"><input type="text" class="ring-time form-control"></div>
            </div>
        `;
    }
}
/**
 * Widget
 */
class CallListenScript {
    actions = [];
    div;
    data;

    // Getter
    get id() { return this.div.getElementsByClassName('id')[0]; }
    get phone() { return this.div.getElementsByClassName('phone')[0]; }
    get types() { return this.div.getElementsByClassName('type'); }
    get tBody() { return this.div.getElementsByTagName('tbody')[0]; }

    type;

    // Constructor
    constructor(type) {
        this.div = document.createElement('div');
        this.div.classList.add('row');
        this.setHTML();

        this.type = type;

        if (type == 'call') {

            this.data = new CallScriptData(this.div.getElementsByClassName('data')[0]);

            this.data.status.disabled = !active;
            this.data.expectedState.disabled = !active;
            this.data.realState.disabled = !active;
            this.data.expectedCallee.disabled = !active;
            this.data.realCallee.disabled = !active;

        } else {
            this.data = new ListenScriptData(this.div.getElementsByClassName('data')[0]);
            this.data.ringTime.disabled = true;
        }
    }

    // Add action into action list
    addAction() {
        let action = new Action();
        this.actions.push(action);
        this.tBody.appendChild(action.row);
    }

    // Set data name for submit
    setDataName() {
        if (this.type == 'call') {
            this.data.status.name = 'status_' + this.id.value;
            this.data.expectedState.name = 'expectedState_' + this.id.value;
            this.data.expectedCallee.name = 'expectedCallee_' + this.id.value;
            this.data.realState.name = 'realState_' + this.id.value;
            this.data.realCallee.name = 'realCallee_' + this.id.value;
        }
    }

    // Set HTML
    setHTML() {
        this.div.innerHTML = /*html*/`
            <div class="widget">
                <input type="hidden" class="id">
                <div class="row">
                    <label class="col-sm-3 control-label">Loại Kịch bản</label>

                    <label class="col-sm-3 control-label">
                        <input type="radio" value="call" class="type" disabled/>
                        Kịch bản Gọi
                    </label>

                    <label class="col-sm-3 control-label">
                        <input type="radio" value="listen" class="type" disabled/>
                        Kịch bản Nghe
                    </label>
                </div>
                <div class="hr-line-dashed"></div>

                <div class="row">
                    <label class="col-sm-2 control-label">Máy</label>
                    <div class="col-sm-5"><input type="text" class="phone form-control" disabled></div>
                </div>
                <div class="hr-line-dashed"></div>

                

                <div class="data">
                    
                </div>
                
                <div class="hr-line-dashed"></div>


                <div class="row">
                    <label class="col-sm-3 control-label">Danh sách Hành động</label>
                </div>

                <div class="row">
                    <div class="table-responsive col-sm-11">
                        <table class="table table-striped table-bordered table-hover">
                            <thead class="form-group">
                                <tr>
                                    <th>Hành động</th>
                                    <th>Giá trị</th>
                                    <th>Note</th>
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
}

/**
 * 
 */
class CallListenScriptList {
    scripts = [];
    div;

    // Create widget list
    constructor(div) {
        this.div = div;
    }

    // Add a widget
    addScript(type) {
        let script = new CallListenScript(type);
        this.scripts.push(script);
        this.div.appendChild(script.div);
    }

    setDataName() {
        for (let s of this.scripts) {
            s.setDataName();
        }
    }
}

