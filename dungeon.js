var cellSize = 25;
var height;
var width;
var dungeon;

window.onload = function() {

    canvas = document.getElementById("gc");
    context = canvas.getContext("2d");
    generateButton = document.getElementById("generateButton");
    evolveButton = document.getElementById("evolveButton");
    connectButton = document.getElementById("connectButton");


    // Wenn der "Generate"-Button geklickt wird
    generateButton.onclick = function() {
        width = parseInt(document.getElementById("width").value);
        height = parseInt(document.getElementById("height").value);

        var canvasWidth = width * cellSize;
        var canvasHeight = height * cellSize;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        dungeon = createDungeon(width, height);
        drawDungeon(dungeon);
        writeConnectionStatus();
    };
    generateButton.onclick();

    evolveButton.onclick = function() {
        dungeon = evolveDungeon(dungeon);
        drawDungeon(dungeon);
        writeConnectionStatus();
    };

    connectButton.onclick = function() {
        // find first non-wall tile

        writeConnectionStatus(true);
    };
}

function createDungeon(width, height) {
    var dungeon = new Array(height);
    for (var i = 0; i < height; i++) {
        dungeon[i] = new Array(width);
        for (var j = 0; j < width; j++) {
            // 45 percent chance of wall
            dungeon[i][j] = Math.random() < 0.5;
        }
    }
    return dungeon;
}

function countWallNeighbors(dungeon, x, y) {
    var count = 0;
    for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
            if (dx == dy && dx == 0)
                continue;
            var xx = x + dx;
            var yy = y + dy;
            if (xx >= 0 && x < width && yy >= 0 && yy < height && dungeon[yy][xx]) {
                count += 1;
            }
        }
    }
    return count;
}

function evolveDungeon(dungeon) {
    console.log("Evolving dungeon...");
    var newDungeon = createDungeon(width, height);
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var count = countWallNeighbors(dungeon, j, i);
            var isWall = dungeon[i][j];
            newDungeon[i][j] = (isWall && count >= 4) || (!isWall && count >= 5);
        }
    }

    return newDungeon;
}

function drawDungeon(dungeon) {
    console.log("Drawing dungeon");
    canvas.strokeStyle = "Black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < dungeon.length; i++) {
        var row = dungeon[i];
        for (var j = 0; j < row.length; j++) {
            if (row[j])
                context.fillStyle = "LightBlue";
            else
                context.fillStyle = "DarkSlateGrey";
            context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            // context.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
}

function isConnected(dungeon, xStart, yStart, color = false) {
    var visitedMask = new Array(height);
    for (var i = 0; i < height; i++) {
        visitedMask[i] = new Array(width);
        for (var j = 0; j < width; j++) {
            visitedMask[i][j] = false;
        }
    }

    var stack = [[xStart, yStart]];
    while (stack.length > 0) {
        var current = stack.shift();
        var x = current[0];
        var y = current[1];
        if (visitedMask[y][x])
            continue;

        visitedMask[y][x] = true;

        if (color) {
            context.fillStyle = "red";
            context.globalAlpha = 0.5;
            context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            context.globalAlpha = 1.0;
        }

        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (dx == dy && dx == 0)
                    continue;
                var xx = x + dx;
                var yy = y + dy;
                if (xx >= 0 && x < width && yy >= 0 && yy < height && !dungeon[yy][xx]) {
                    stack.push([xx, yy]);
                }
            }
        }
    }

    for (var i = 0; i < height; i++)
        for (var j = 0; j < width; j++) {
            // If dungeon[i][j] is a floor tile which was _not_ visited, return false.
            if (!dungeon[i][j] && !visitedMask[i][j])
                return false;
        }

    return true;
}

function writeConnectionStatus(color=false) {
    var result;
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            if (!dungeon[i][j]) {
                result = {x: j, y: i};
                break;
            }
        }
        if (result)
            break;
    }
    var connected = isConnected(dungeon, result.x, result.y, color);
    document.getElementById("connectionStatus").innerHTML = connected ? "Connected!" : "Not connected.";
}

