var subs = ['₁', '₂', '₃', '₄'];
var rows = 4;
var columns = 5;

function createInitialMatrix() {
    var defaultData = [
     [0, 1, 3, 2, -1],
     [1000, 3, 1, -5, -2],
     [-3, 4, 1, 4, -1],
     [4, 0, -2, -3, 4]
     ];
    var title = document.createElement('h2');
    title.innerHTML = "Solver the system of linear equations";
    document.body.appendChild(title);
    var initialText = document.createElement('p');
    initialText.innerHTML = "Please enter your numbers into the matrix " +
        "(matrix must not have linearly dependent rows, and must be compatible) and press 'Submit'.";
    document.body.appendChild(initialText);
    var initMatrix = document.createElement('div');
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            var index = (i + 1) + "" + (j + 1);
            var input = document.createElement('input');
            input.type = "text";
            input.size = "8";
            input.id = index;
            input.setAttribute('value', defaultData[i][j]);
            input.setAttribute('onchange','isAllowedValue(' + index + ');');
            initMatrix.appendChild(input);
            var textElem;
            if (j < columns - 2) {
                textElem = document.createTextNode('X' + subs[j] + ' + ');
                initMatrix.appendChild(textElem);
            }
            if (j == columns - 2) {
                textElem = document.createTextNode('X' + subs[j] + ' = ');
                initMatrix.appendChild(textElem);
            }
        }
        initMatrix.appendChild(document.createElement('br'));
    }
    var submitButton = document.createElement('input');
    submitButton.id = "submit";
    submitButton.type = "submit";
    submitButton.value = "Submit";
    submitButton.setAttribute('onclick','solve();');
    initMatrix.appendChild(submitButton);
    document.body.appendChild(initMatrix);
}

function isAllowedValue(index) {
    var element = document.getElementById(index);
    var value = checkValue(element.value);
    try {
        if (value == 1) {
            throw new Error("Empty input!");
        }
        if (value == 2) {
            throw new Error("Not a number!");
        }
        if (value == 3) {
            throw new Error("Out of range! Correct range from -5000 to 5000");
        }
    }
    catch(err) {
        alert(err.message);
        element.value = element.getAttribute('value');
    }
}

function checkValue(value) {
    if (value == '') {
        return 1;
    }
    else if (value != 0) {
        if (!(value / value)) {
            return 2;
        }
        else if (value < -5000 || value > 5000) {
            return 3;
        }
        else {
            return 0;
        }
    }
    else {
        return 0;
    }
}

function solve() {
    var matrix = [
        [0],
        [0],
        [0],
        [0],
        [0]
    ];
    var origin = [
        [0],
        [0],
        [0],
        [0]
    ];
    var vectorX = [];
    var vectorE = [];
    var vectorAX = [];
    var vectorB = [];
    for (var i = 0; i < rows + 1; i++) {                    //creation of working matrices
        for (var j = 0; j < columns; j++) {
            if (i < rows && j < columns - 1) {
                matrix[i][j] = origin[i][j] = document.getElementById((i + 1) + "" + (j + 1)).value;
            }
            if (i < rows && j == columns - 1) {
                matrix[i][j] = vectorB[i] = document.getElementById((i + 1) + "" + (j + 1)).value;
            }
            if (i == rows && j < columns - 1) {
                matrix[i][j] = j;
            }
        }
    }
    if (document.getElementById('solve_block')) {
        document.body.removeChild(document.getElementById('solve_block'));
    }
    var solveBlock = document.createElement('div');
    solveBlock.id = "solve_block";
    solveBlock.appendChild(document.createElement('br'));
    try {
        for (i = 1; i < matrix.length - 1; i++) {           //transformation to row echelon form
            var maxItem = searchMax(i - 1);
            swapRows(maxItem.indexX, i - 1);
            swapColumns(maxItem.indexY, i - 1);
            for (j = i; j < matrix.length - 1; j++) {
                var multiplier = matrix[j][i - 1] / matrix[i - 1][i - 1];
                var flag = 1;
                for (var k = 0; k < matrix[0].length; k++) {
                    matrix[j][k] -= multiplier * matrix[i - 1][k];
                    if (k < matrix[0].length - 1 && matrix[j][k] != 0) {
                        flag = 0;
                    }
                    if (flag == 1 && k == matrix[0].length - 1) {
                        if (matrix[j][k] != 0) {
                            flag = -1;
                        }
                    }
                }
                if (flag == 1) {
                    throw new Error("The system has linearly dependent rows!");
                }
                if (flag == -1) {
                    throw new Error("The system is not compatible!");
                }
            }
            showInterMatrix();
        }
        for (i = matrix.length - 2; i >= 0; i--) {          //calculation of the results
            var temp = 0;
            for (j = i + 1; j < matrix[0].length - 1; j++) {
                temp += matrix[i][j] * vectorX[matrix[matrix.length - 1][j]];
            }
            vectorX[matrix[matrix.length - 1][i]] = (matrix[i][matrix[0].length - 1] - temp) / matrix[i][i];
        }
        for (i = 0; i < origin.length; i++) {
            var sum = 0;
            for (j = 0; j < origin[0].length; j++) {
                sum += origin[i][j] * vectorX[j];
            }
            vectorAX[i] = sum;
        }
        for (i = 0; i < vectorAX.length; i++) {             //calculation of the vector of errors
            vectorE[i] = vectorB[i] - vectorAX[i];
        }
        showResults();
        document.body.appendChild(solveBlock);
    }
    catch(err) {
        if (document.getElementById('solve_block')) {
            document.body.removeChild(document.getElementById('solve_block'));
        }
        solveBlock = document.createElement('div');
        solveBlock.id = "solve_block";
        solveBlock.appendChild(document.createElement('br'));
        solveBlock.innerHTML = '<p id="error">' + err.message + '</p>';
        document.body.appendChild(solveBlock);
    }

    function searchMax(searchIndex) {
        var maxItem = {value: matrix[searchIndex][searchIndex], indexX: searchIndex, indexY: searchIndex};
        for (var i = searchIndex; i < matrix.length - 1; i++) {
            for (var j = searchIndex; j < matrix[0].length - 1; j++) {
                if (Math.abs(maxItem.value) < Math.abs(matrix[i][j])) {
                    maxItem.value = matrix[i][j];
                    maxItem.indexX = i;
                    maxItem.indexY = j;
                }
            }
        }
        return maxItem;
    }

    function swapRows(rowA, rowB) {
        var tempItem;
        for (var i = 0; i < matrix[0].length; i++) {
            tempItem = matrix[rowA][i];
            matrix[rowA][i] = matrix[rowB][i];
            matrix[rowB][i] = tempItem;
        }
    }

    function swapColumns(colA, colB) {
        var tempItem;
        for (var i = 0; i < matrix.length; i++) {
            tempItem = matrix[i][colA];
            matrix[i][colA] = matrix[i][colB];
            matrix[i][colB] = tempItem;
        }
    }

    function showInterMatrix() {
        var div = document.createElement('div');
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                var input = document.createElement('input');
                input.type = "text";
                input.size = "8";
                input.value = (+matrix[i][j]).toFixed(3);
                input.disabled = true;
                div.appendChild(input);
                var textElem;
                if (j < columns - 2) {
                    textElem = document.createTextNode('X' + subs[matrix[rows][j]] + ' + ');
                    div.appendChild(textElem);
                }
                if (j == columns - 2) {
                    textElem = document.createTextNode('X' + subs[matrix[rows][j]] + ' = ');
                    div.appendChild(textElem);
                }
            }
            div.appendChild(document.createElement('br'));
        }
        div.appendChild(document.createElement('br'));
        solveBlock.appendChild(div);
    }

    function showResults() {
        var results = document.createElement('div');
        results.id = "results";
        results.innerHTML = "<h3>Results</h3>";
        results.innerHTML += "<b>Vector X:</b><br>";
        for (var i = 0; i < vectorX.length; i++) {
            results.innerHTML += 'X' + subs[i] + ' = ' + vectorX[i].toFixed(3) + '<br>';
        }
        results.innerHTML += "<br><b>Vector E:</b><br>";
        for (i = 0; i < vectorE.length; i++) {
            results.innerHTML += 'E' + subs[i] + ' = ' + vectorE[i].toFixed(20) + '<br>';
        }
        solveBlock.appendChild(results);
    }
}

