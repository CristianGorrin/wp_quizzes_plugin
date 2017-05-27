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
