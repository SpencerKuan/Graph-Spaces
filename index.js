
/* 
    QuadGraph
    A graph of connected nodes with optional associated values for each node.

    Each node has 4 connections, one for each side.
    Each connection is a bi-directional reference to another node.
*/

class QuadGraph {
    constructor(nodes){
        this.nodes = nodes ?? [];
        this.valuePool = new Map();
    }

    get length(){
        return this.nodes.length;
    }

    /**
     * 
     * @param {Array} node 
     * @param {*} value 
     * @returns {Array} The input node or an array of 4 nulls.
     */

    add(node = [null, null, null, null], value){
        this.nodes.push(node);
        if (value !== undefined) this.valuePool.set(node, value);

        return node;
    }

    /**
     * 
     * @param {Number} index 
     * @param {*} value 
     */
    setValue (index, value){
        this.valuePool.set(this.nodes[index], value);
    }

    /**
     * Adds a number of empty nodes to the graph, much like Array.fill()
     * @param {*} num 
     */

    populate(num){
        for(var i = 0; i < num; i ++) this.add();
    }

    /**
     * 
     * @param {Number} firstIndex The index of the first node in the nodes array to link. 
     * @param {Number} firstSide A number 0-3 corresponding to the side of the first node to link.
     * @param {Number} secondIndex The index of the second node in the nodes array to link.
     * @param {Number} secondSide Another side number 0-3
     */

    link(firstIndex, firstSide, secondIndex, secondSide){
        /* 
            For sides:
                right: 0
                down: 1
                left: 2
                up: 3
        */

        var prev = this.nodes[firstIndex][firstSide] || this.nodes[secondIndex][secondSide];
        if (prev) return false;

        this.nodes[firstIndex][firstSide] = {
            num: secondIndex,
            side: secondSide
        };

        this.nodes[secondIndex][secondSide] = {
            num: firstIndex,
            side: firstSide
        };
    }

    /**
     * 
     * @param {*} firstIndex 
     * @param {*} firstSide 
     * @param {*} secondIndex 
     * @param {*} secondSide 
     */

    unlink(firstIndex, firstSide, secondIndex, secondSide){
        if (this.nodes[firstIndex][firstSide]?.num != secondIndex) return false;
        if (this.nodes[secondIndex][secondSide]?.num != firstIndex) return false;

        this.nodes[firstIndex][firstSide] = null;
        this.nodes[secondIndex][secondSide] = null;
    }

    /**
     * 
     * @param {Number} index The index of the node to start building from.
     * @param {Number} turn 
     * @returns a node object with the following properties:
        - index: The index of the node in the nodes array.
        - node: The node itself.
        - turn: The number of turns from the starting node.
        - next(i): A function that returns the next node in the specified direction (0-3)
        - value: The value of the node. (this can be set)
        - left, right, up, down: The next node to the left, right, up, or down.
     */

    build (index, turn = 0){
        var self = this;

        var nodes = this.nodes;
        var node = nodes[index];

        var res =  {
            index: index,
            node: node,
            turn: turn,

            next(i){
                var connection = res.node[(i + res.turn) % 4];

                var newIndex = connection?.num;
                var newTurn = ((connection?.side + 2 - i + 4) % 4);

                if (nodes[newIndex]) {
                    return self.build(newIndex, newTurn);
                } else {
                    return null;
                }
            },
            get value(){
                return self.valuePool.get(this.node);
            },
            set value(value){
                self.valuePool.set(this.node, value);
            },
            get right(){
                return res.next(0);
            },
            get down(){
                return res.next(1);
            },
            get left(){
                return res.next(2);
            },
            get up(){
                return res.next(3);
            }
        };

        return res;
    }

    /**
     * 
     * @param {Number} width 
     * @param {Number} height 
     * @returns {QuadGraph} A graph of nodes connected in a grid. The graph is ordered left to right, top to bottom.
     */
    static grid(width, height){
        var graph = new QuadGraph();
        graph.populate(width * height);

        for(var i = 0; i < width; i ++){
            for(var j = 0; j < height; j ++){
                var index = i + j * width;

                if (i > 0) graph.link(index, 3, index - 1, 1);
                if (j > 0) graph.link(index, 2, index - width, 0);
            }
        }

        return graph;
    }
}


/*
     
    Creating an infinite tile:

          ...   ...   ...
           |     |     |
    ... - [0] - [1] - [0] - ...
           |     |     |   
    ... - [2] - [3] - [2] - ...
           |     |     |
    ... - [0] - [1] - [0] -  ...
           |     |     |
          ...   ...   ...

*/

var graph = new QuadGraph([
    [null, null, null, null], // 0
    [null, null, null, null], // 1
    [null, null, null, null], // 2
    [null, null, null, null]  // 3
]);

// 0 - 1 - 0
graph.link(0, 0, 1, 2);
graph.link(1, 0, 2, 2);

// 0 - 2 - 0
graph.link(0, 1, 2, 3);
graph.link(2, 1, 0, 3);

// 2 - 3 - 2
graph.link(2, 0, 3, 2);
graph.link(3, 0, 2, 2);

// 1 - 3 - 1
graph.link(1, 1, 3, 3);
graph.link(3, 1, 1, 3);

// Set the value of the nodes
graph.setValue(0, "node 0");
graph.setValue(1, "node 1");
graph.setValue(2, "node 2");
graph.setValue(3, "node 3");

var node = graph.build(0);
console.log(node.value);

for(var i = 0; i < 10; i ++){
    let direction = Math.floor(Math.random() * 4);
    node = node.next(direction);

    console.log(`Moved ${["right", "down", "left", "up"][direction]}, found ${node.value}`);
}