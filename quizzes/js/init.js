function Reder() {
     ClearId();

    var cach_transform = "";
    if (typeof $("#tree>g").attr("transform") != 'undefined') {
        cach_transform = $("#tree>g").attr("transform");
    }

    d3.select("#tree").remove();

    var i = 0;

    var tree = d3.layout.tree().size([500, 1000]);

    var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.y, d.x]; });

    var x = 85, y = 0, z = 1;
    if (cach_transform != "") {
        var temp_trabsform = cach_transform.split(" ");
        for (var i = 0; i < temp_trabsform.length; i++) {
            var temp_string = temp_trabsform[i].split("(");

            if (temp_string[0] == "translate") {
                temp_string[1] = temp_string[1].substring(0, temp_string[1].length - 1);

                var temp = temp_string[1].split(",");
                x = parseFloat(temp[0]);
                y = parseFloat(temp[1]);
            } else if (temp_string[0] == "scale") {
                z = parseFloat(temp_string[1].substring(0, temp_string[1].length - 1))
            }
        }
    }

    var svg = d3.select("#target_tree").append("svg")
        .attr("id", "tree")
        .attr("width", "100%")
        .attr("height", 500)
        .call(d3.behavior.zoom()
            .on("zoom", function () {
                svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
            })
            .translate([x, y])
            .scale(z)
        )
        .append("g");

    update(root);
    function update(source) {
        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) { d.y = d.depth * 180; });

        // Declare the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) { return d.id || (d.id = ++i); });

        // Enter the nodes.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .on("click", function ClickItemOnTree(d) {
                if (!IsSaveSelectQuestion()) {
                    if (!confirm('You have unsaved changes on this question, do you want to discard them?')) {
                        return;
                    }
                }

                if (typeof root.children != "undefined") {
                    var children = [];
                    root._selected = false;
                    for (var i = 0; i < root.children.length; i++) {
                        children.push(root.children[i]);
                    }

                    while (children.length > 0) {
                        var temp = children.shift();
                        temp._selected = false;

                        if (temp.children) {
                            for (var i = 0; i < temp.children.length; i++) {
                                children.push(temp.children[i]);
                            }
                        }
                    }
                }

                d._selected = true;
                selected = d;
                Reder();

                SetSelectQuestion();
            })
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        nodeEnter.append("circle")
            .attr("r", 15)
            .style("fill", function (d) {
                if (d._selected) {
                    return "#ccc";
                } else {
                    return "#fff";
                }
            });

        nodeEnter.append("text")
            .attr("x", function (d) {
                return d.children || d._children ? -18 : 18;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function (d) { return d.name; })
            .style("fill-opacity", 1);

        // Declare the links…
        var link = svg.selectAll("path.link")
            .data(links, function (d) { return d.target.id; });

        // Enter the links.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", diagonal);
    }

    if (cach_transform != "") {
        $("#tree>g").attr("transform", cach_transform);
    }
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
    var next_id = selected.children.length - 1;
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
function IsSaveSelectQuestion() {
    //name
    if (typeof selected.name != "undefined") {
        if (selected.name != $('#select_title')[0].value) {
            return false;
        }
    } else {
        if ($('#select_title')[0].value != '') {
            return false;
        }
    }

    //body
    if (typeof selected.body != "undefined") {
        if (selected.body != $('#body_text')[0].value) {
            return false;
        }
    } else {
        if ($('#body_text')[0].value != '') {
            return false;
        }
    }

    //children
    if (typeof selected.children != "undefined") {
        for (var i = 0; i < selected.children.length; i++) {
            if (typeof selected.children[i].answer_text != "undefined") {
                if (selected.children[i].answer_text != $('#answers_table_' + i)[0].value) {
                    return false;
                }
            } else {
                if ($('#answers_table_' + i)[0].value != '') {
                    return false;
                }
            }

            if (typeof selected.children[i].score != 'undefined') {
                if (selected.children[i].score.toString() != $('#score_table_' + i)[0].value) {
                    return false;
                }
            } else {
                if ($('#score_table_' + i)[0].value != '') {
                    return false;
                }
            }
        }
    }

    return true;
}

function UpdateOutput() {
    var result = _.clone(root);

    var buffer = [];
    buffer.push(result);

    while (buffer.length > 0) {
        var temp = buffer.shift();

        ClearItemOfD3(temp);

        if (typeof temp.children != "undefined") {
            for (var i = 0; i < temp.children.length; i++) {
                buffer.push(temp.children[i]);
            }
        }
    }

    $("#json_questions").attr("value", JSON.stringify(result));
}

function ClearItemOfD3(item) {
    if (typeof item._selected != "undefined") {
        delete item._selected;
    }

    if (typeof item.depth != "undefined") {
        delete item.depth;
    }

    if (typeof item.x != "undefined") {
        delete item.x;
    }

    if (typeof item.y != "undefined") {
        delete item.y;
    }

    if (typeof item.id != "undefined") {
        delete item.id;
    }

    if (typeof item.parent != "undefined") {
        delete item.parent;
    }
}
function Init() {
    root._selected = true;
    selected       = root;

    Reder();
    ResetZoomAndPan();
    SetSelectQuestion();
    UpdateOutput();
}

$(document).ready(function () {
    root = json_obj;
    Init();

    var frame = wp.media({
        title: "Select an item",
        button: { text: "Add to question" },
        frame: 'select',
        multiple: false
    });

    frame.on("select", function () {
        var item = frame.state().get('selection').toJSON();
        selected.item = { name: item[0].name, type: item[0].type, url: item[0].url };
        $('#uri_item').html('Name: ' + selected.item.name + ' - Type: ' + selected.item.type + ' Url: ' + selected.item.url);
        UpdateOutput();
    });

    $(".set_custom_item").on("click", function (e) {
        e.preventDefault();

        frame.open();
    });
    
    $('#target_add').click(function(e) {
        e.preventDefault();

        var result = prompt("Please enter the new answers title", "");

        if (result != null) {
            AddItemToSelected(result);
        }

        UpdateOutput();
    });

    $('#target_delete').click(function(e) {
        e.preventDefault();

        if (selected == root) {
            alert('Can\'t remove the root element');
        } else {
            if (confirm('Are you sure you want to delete (' + selected.name + ') the selected question?')) {
                if (!RemoveSelected()) {
                    alert('Can\'t remove the this element');
                }
            }
        }

        UpdateOutput();
    });

    $('#target_clear').click(function(e) {
        e.preventDefault();

        if (confirm('Are you sure you want to remove all questions?')) {
            root           = { "name": "root" };
            root._selected = true;
            selected       = root;

            SetSelectQuestion();
            Reder();
        }

        UpdateOutput();
    });

    $('#target_reset').click(function(e) {
        e.preventDefault();

        ResetZoomAndPan();
        Reder();
    });

    $('#select_update').click(function (e) {
        e.preventDefault();

        UpdateSelectQuestion();
        UpdateOutput();
    });

    $('#clear_custom_item').click(function (e) {
        e.preventDefault();

        delete selected.item;
        $('#uri_item').html('');
        UpdateOutput();
    });

    $('#copy_from_old').click(function (e) {
        e.preventDefault();

        var target = $('#select_copy_from_old').val();
        if (target != null) {
            if (confirm('Are you sure you want to copy the questions (the current questions will be lost)?')) {
                $.ajax({
                    type: "POST",
                    url: "../../quizzes/get/?id=" + target,
                    dataType: "json",
                    success: function (response) {
                        if (typeof response.questions != 'undefined') {
                            root = response.questions;
                            Init();
                        }
                    }
                });
            }
        }
    });
});
