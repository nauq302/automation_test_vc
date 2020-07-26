


/**
 * CallListenScript
 */
class CallListenScript {
    actionList = [];
    div;

    // Getter
    get phone() { return this.div.getElementsByClassName('phone')[0]; }
    get types() { return this.div.getElementsByClassName('type'); }
    get status() { return this.div.getElementsByClassName('status')[0]; }
    get defaultState() { return this.div.getElementsByClassName('default-state')[0]; }
    get defaultCallee() { return this.div.getElementsByClassName('default-callee')[0]; }
    get tBody() { return this.div.getElementsByTagName('tbody')[0]; }
    get addButton() { return this.div.getElementsByClassName('add-button')[0]; }
    get deleteWidgetButton() { return this.div.getElementsByClassName('delete-widget')[0]; }

    // Constructor
    constructor(parent) {
        this.div = document.createElement('div');
        this.div.classList.add('row');
        this.setHTML();

        // Set temp name for srciptType
        for (let i = 0; i < this.scriptTypes.length; ++i) {
            this.types[i].name = "t" + parent.s;
        }

        // Set add button action
        this.addButton.onclick = (() => { this.addAction() }).bind(this);

        // Set delete button action 
        this.deleteWidgetButton.onclick = (() => { parent.removeWidget(this); }).bind(this);
    }

    // Add action into action list
    addAction() {
        let action = new Action(this.tBody);
        this.actionList.push(action);
        this.tBody.appendChild(action.row);
    }

    // Remove a action from action list
    removeAction(action) {
        this.actionList.remove(action);
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

                <div class="row">
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

                <div class="row">
                    <label class="col-sm-2 control-label">Chọn máy</label>
                    <div class="col-sm-5"><input type="text" class="phone form-control"></div>
                </div>
                <div class="hr-line-dashed"></div>

                <div class="row">
                    <label class="col-sm-2 control-label">Trạng thái</label>
                    <div class="col-sm-5"><input type="text" class="status form-control"></div>
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
        for (let i = 0; i < this.types.length; ++i) {
            this.types[i].name = 'scriptType_' + count;
        }

        this.phone.name = 'phone_' + count;
        this.status.name = 'status_' + count;
        this.defaultState.name = 'defaultState_' + count;
        this.defaultCallee.name = 'defaultCallee_' + count;

        for (let i in this.actionList) {
            this.actionList[i].setDataName(count, i);
        }

        this.addSize(count);
    }

    // Add size
    addSize(count) {
        let input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'size_' + count;
        input.value = this.actionList.length;
        this.div.appendChild(input);
    }
}

/**
 * 
 */
class CallListenScriptList {
    widgets = [];
    div;
    s = 0;

    // Create widget list
    constructor(div) {
        this.div = div;
    }

    // Add a widget
    addCallListen() {
        let widget = new CallListenScript(this);
        this.widgets.push(widget);
        this.div.appendChild(widget.div);
        ++this.s;
    }

    // 
    removeCallListen(widget) {
        this.widgets.splice(this.widgets.indexOf(widget), 1);
        this.div.removeChild(widget.div);
    }

    setDataName() {
        for (let i in this.widgets) {
            this.widgets[i].setDataName(i);
        }

        this.addSize();
    }

    addSize() {
        let input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'size';
        input.value = this.widgets.length;
        this.div.appendChild(input);
    }
}

