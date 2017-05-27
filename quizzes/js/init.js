function Reder() {
    
}

function ClearId() {
    var children = [];
    delete root.id;

    if (typeof root.children != "undefined") {
        for (var i = 0; i < root.children.length; i++) {
            children.push(root.children[i]);
        }

        while (children.length > 0) {
            var temp = children.shift();
            delete temp.id;

            if (temp.children) {
                for (var i = 0; i < temp.children.length; i++) {
                    children.push(temp.children[i]);
                }
            }
        }
    }
}

function AddItemToSelected(name) {
    if (!selected.children) {
        selected.children = [];
    }

    selected.children.push({ "name": name });

    Reder();

    var table = $('#answers_table');
    var next_id = table.find('tr').length - 1;
    table.append('<tr><td>' + name + '</td><td>:</td><td><input id="answers_table_' +
        next_id + '" autocomplete="off" type="text" placeholder="Answer text" /></td>' +
        '<td><input type="number" id="score_table_' + next_id + '"></td></tr>');
}

function RemoveSelected() {
    if (typeof selected.parent == "undefined") {
        return false;
    }

    var delete_id = selected.id;
    selected = selected.parent;
    var new_array = [];
    for (var i = 0; i < selected.children.length; i++) {
        if (selected.children[i].id != delete_id) {
            new_array.push(selected.children[i]);
        }
    }

    selected.children = new_array;
    selected._selected = true;

    Reder();
    return true;
}

function ResetZoomAndPan() {
    $("#tree>g").attr("transform", "translate(85,0) scale(1)");
}

function SetSelectQuestion() {
    var table = $('#answers_table');
    table.empty();

    $('#select_title')[0].value = selected.name;

    if (typeof selected.body != "undefined") {
        $('#body_text')[0].value = selected.body;
    } else {
        $('#body_text')[0].value = '';
    }

    if (typeof selected.item != "undefined") {
        $('#uri_item').html('Name: ' + selected.item.name + ' - Type: ' + selected.item.type + ' Url: ' + selected.item.url);
    } else {
        $('#uri_item').html('');
    }

    if (typeof selected.children != "undefined") {
        table.append('<tr><th>Quiz name</th><th></th><th>Anser text</th><th>Score</th></tr>');
        for (var i = 0; i < selected.children.length; i++) {
            table.append('<tr><td>' + selected.children[i].name +
                '</td><td>:</td><td><input id="answers_table_' + i +
                '" autocomplete="off" type="text" placeholder="Answer text" /></td>' +
                '<td><input type="number" id="score_table_' + i + '"></td>' + '</tr>');

            if (typeof selected.children[i].answer_text != "undefined") {
                $("#answers_table_" + i)[0].value = selected.children[i].answer_text;
            }

            if (typeof selected.children[i].score != 'undefined') {
                $('#score_table_' + i)[0].value = selected.children[i].score;
            }
        }
    }
}

function UpdateSelectQuestion() {
    selected.name    = $('#select_title')[0].value;
    selected.body    = $('#body_text')[0].value;

    if (typeof selected.children != "undefined") {
        for (var i = 0; i < selected.children.length; i++) {
            if (typeof $('#answers_table_' + i)[0].value != 'undefined') {
                selected.children[i].answer_text = $('#answers_table_' + i)[0].value;
            }

            var score = $('#score_table_' + i)[0].value;
            if ($.isNumeric(score)) {
                selected.children[i].score = parseInt(score);
            }
        }
    }
}
