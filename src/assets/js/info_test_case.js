
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

/**
 * Widget
 */
class Widget {
    actionList = [];
    div;

    // Getter
    get phone() { return this.div.getElementsByClassName('phone')[0]; }
    get scriptTypes() { return this.div.getElementsByClassName('script-type'); }
    get status() { return this.div.getElementsByClassName('status')[0]; }
    get expectedState() { return this.div.getElementsByClassName('expected-state')[0]; }
    get expectedCallee() { return this.div.getElementsByClassName('expected-callee')[0]; }
    get realState() { return this.div.getElementsByClassName('real-state')[0]; }
    get realCallee() { return this.div.getElementsByClassName('real-callee')[0]; }
    get tBody() { return this.div.getElementsByTagName('tbody')[0]; }
    get addButton() { return this.div.getElementsByClassName('add-button')[0]; }

    // Constructor
    constructor(parent) {
        this.div = document.createElement('div');
        this.div.classList.add('row');
        this.setHTML();

        // Set temp name for srciptType
        for (let i = 0; i < this.scriptTypes.length; ++i) {
            this.scriptTypes[i].name = "t" + parent.s;
        }
    }

    // Add action into action list
    addAction() {
        let action = new Action(this.tBody);
        this.actionList.push(action);
        this.tBody.appendChild(action.row);
    }

    // Set HTML
    setHTML() {
        this.div.innerHTML = /*html*/`
            <div class="widget">
                <div class="row">
                    <label class="col-sm-3 control-label">Loại Kịch bản</label>

                    <label class="col-sm-3 control-label">
                        <input type="radio" value="call" class="script-type" disabled/>
                        Kịch bản Gọi
                    </label>

                    <label class="col-sm-3 control-label">
                        <input type="radio" value="listen" class="script-type" disabled/>
                        Kịch bản Nghe
                    </label>
                </div>
                <div class="hr-line-dashed"></div>

                <div class="row">
                    <label class="col-sm-2 control-label">Máy</label>
                    <div class="col-sm-5"><input type="text" class="phone form-control" disabled></div>
                </div>
                <div class="hr-line-dashed"></div>

                <div class="row">
                    <label class="col-sm-2 control-label">Trạng thái</label>
                    <div class="col-sm-5"><input type="text" class="status form-control" disabled></div>
                </div>
                <div class="hr-line-dashed"></div>

                <div class="row">
                    <label class="col-sm-2 control-label">Kết quả dự kiến</label>
                    <div class="col-sm-5"><input type="text" class="expected-state form-control" disabled></div>
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
                        <input type="text" class="expected-callee form-control" disabled>
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
class WidgetList {
    widgets = [];
    div;

    // Create widget list
    constructor(div) {
        this.div = div;
    }

    // Add a widget
    addWidget() {
        let widget = new Widget(this);
        this.widgets.push(widget);
        this.div.appendChild(widget.div);
    }
}

