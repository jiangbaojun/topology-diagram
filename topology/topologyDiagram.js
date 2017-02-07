/*!
 * topology diagram v1.1.0 -  jQuery raphael plug
 *
 * Includes jquery.js
 * Includes raphael.js
 *
 * Copyright © 2017-2017 huangqing
 * Released under the MIT license
 *
 * Date: 2017-01-20
 */

(function ($, Raphael) {
    'use strict';

    function TopologyDiagram(elem, Raphael, data) {
        this.config = {
            rect: {
                width: 'auto',
                height: 22,
                stroke: {
                    default: '#C1C5CA',
                    selected: '#B2C9E0'
                },
                'stroke-width': 1,
                fill: {
                    default: '#F4F4F4',
                    selected: '#EBF4FD'
                },
                radius: 3
            },
            image: {
                width: 16,
                height: 16
            },
            text: {
                'text-anchorstring': 'start',
                'font-family': '微软雅黑',
                'font-size': 12,
                'maxLength': 8
            },
            path: {
                'arrow-end': 'opan-wide-long',
                stroke: '#274355',
                'stroke-width': 1
            },
            node: {
                'padding-left': 4,
                'padding-top': 3,
                'margin-left': 40,
                'margin-top': 44,
                startPosition: {
                    x: 100,
                    y: 100
                }
            },
            relateTypeEnum: {
                parent: 'parent',
                child: 'child'
            }
        };
        this.container = elem;
        this.paper = {
            element: Raphael(this.container),
            height: 0,
            width: 0
        };
        this.viewBox = {
            width: 0,
            height: 0

        };
        this.data = data;
        // 通过创建node自动生成的id绑定节点相关信息
        this.nodes = {};
    };

    TopologyDiagram.prototype.createRect = function (x, y, width, id) {
        var config = this.config.rect,
            paper = this.paper.element,
            rect;

        rect = paper.rect(x, y, width, config.height, this.config.radius).attr({
            fill: config.fill.default,
            'stroke-width': config['stroke-width'],
            stroke: config.stroke,
            r: config.radius
        });

        $(rect[0]).attr({
            'data-nodeId': id,
            'id': id + '-rect'
        });

        return rect;
    };

    TopologyDiagram.prototype.createImage = function (x, y, src, id) {
        var config = this.config.image,
            paper = this.paper.element,
            image;

        image = paper.image(src, x, y, config.width, config.height).attr({

        });

        $(image[0]).attr({
            'data-nodeId': id,
            'id': id + '-image'
        });

        return image;
    };

    TopologyDiagram.prototype.createText = function (x, y, text, id) {
        var config = this.config.text,
            maxLength = config.maxLength,
            paper = this.paper.element,
            title = text,
            textElem;

        if (text.length > maxLength) {
            text = text.slice(0, maxLength) + '...';
        }
        // 文字是以开始位置文字的水平中轴线为基线
        y = y + (config['font-size'] / 2) + 1;
        textElem = paper.text(x, y, text).attr({
            'font-size': config['font-size'],
            'text-anchor': 'start',
            'title': title,
            id: id + '-text'
        });

        $(textElem[0]).attr({
            'data-nodeId': id,
            'id': id + '-text'
        });

        return textElem;
    };

    TopologyDiagram.prototype.createNode = function (x, y, src, text, id) {
        var config = this.config,
            paddingLeft = config.node['padding-left'],
            paddingTop = config.node['padding-top'],
            rectElem,
            rectWidth,
            imageElem,
            textElem,
            startX = x,
            nextX,
            endX,
            startY = y,
            nextY,
            bBox;

        nextX = startX + paddingLeft;
        nextY = startY + paddingTop;
        imageElem = this.createImage(nextX, nextY, src, id);

        bBox = imageElem.getBBox();
        nextX = nextX + bBox.width + paddingLeft;
        textElem = this.createText(nextX, nextY, text, id);

        bBox = textElem.getBBox();
        endX = nextX + bBox.width + paddingLeft;

        rectWidth = Math.abs(endX - startX);
        rectElem = this.createRect(startX, startY, rectWidth, id);

        textElem.toFront();
        imageElem.toFront();

        return {
            image: imageElem,
            text: textElem,
            rect: rectElem,
            width: rectWidth,
            height: config.rect.height
        };
    };

    TopologyDiagram.prototype.createPath = function (startX, startY, middleX, middleY, endX, endY, hasArrow) {
        var config = this.config.path,
            paper = this.paper.element;

        return paper.path('M' + startX + ' ' + startY +
            'L' + middleX + ' ' + middleY +
            'L' + endX + ' ' + endY
        ).attr({
            'stroke-width': config['stroke-width'],
            'stroke': config.stroke,
            'arrow-end': hasArrow === false ? 'none' : config['arrow-end']
        });
    };

    TopologyDiagram.prototype.createStraightLine = function (startX, startY, endX, endY, hasArrow) {
        return this.createPath(startX, startY, endX, endY, endX, endY, hasArrow);
    };

    TopologyDiagram.prototype.createBrokenLine = function (startX, startY, endX, endY) {
        var middleX = startX,
            middleY = endY;

        return this.createPath(startX, startY, middleX, middleY, endX, endY);
    };

    TopologyDiagram.prototype.createTopologyNode = function (data, index, siblingsTotal, relateNode, relateType) {
        var currentData = data,
            currentNode,
            nodeElements,
            id = this.getId(),
            src = currentData.src,
            text = currentData.text,
            config = this.config,
            relateTypeEnum = config.relateTypeEnum,
            position,
            nodes = this.nodes;

        position = this.CalculateTopologyNodePosition(relateNode, relateType, index, siblingsTotal);

        nodeElements = this.createNode(position.x, position.y, src, text, id);

        // 创建下级节点
        if (relateType === relateTypeEnum.child) {
            currentNode = {
                id: id,
                x: position.x,
                y: position.y,
                width: nodeElements.width,
                height: nodeElements.height,
                originalData: currentData,
                nodeElements: nodeElements,
                parentNodes: relateNode ? [relateNode] : [],
                childrenNodes: [],
                lines: []
            };

            if (relateNode) {
                relateNode.childrenNodes.push(currentNode);
            }
        } else if (relateType === relateTypeEnum.parent) {
            // 创建父级节点
            currentNode = {
                id: id,
                x: position.x,
                y: position.y,
                width: nodeElements.width,
                height: nodeElements.height,
                originalData: currentData,
                nodeElements: nodeElements,
                parentNodes: [],
                childrenNodes: relateNode ? [relateNode] : [],
                lines: []
            };

            if (relateNode) {
                relateNode.parentNodes.push(currentNode);
            }
        }

        // if (relateNode) {
        //     //this.relateTopologyNode(relateNode, currentNode, relateType);
        // }

        nodes[id] = currentNode;

        return currentNode;
    };

    TopologyDiagram.prototype.relateTopologyNode = function (relateNode, currentNode, relateType) {
        var relateTypeEnum = this.config.relateTypeEnum;
        // 当前关联的节点为子节点
        if (relateType === relateTypeEnum.child) {
            relateNode.childrenNodes.push(currentNode);
            currentNode.parentNodes.push(relateNode);
        } else if (relateType === relateTypeEnum.parent) {
            // 当前关联的节点为父节点
            currentNode.childrenNodes.push(currentNode);
            relateNode.parentNodes.push(relateNode);
        }

        // return currentNode;
    };

    TopologyDiagram.prototype.CalculateTopologyNodePosition = function (relateNode, relateType, index, siblingsTotal) {
        var config = this.config,
            startPosition = config.node.startPosition,
            position = $.extend({}, startPosition),
            x = position.x,
            y = position.y,
            width = 0,
            height = config.rect.height,
            relateTypeEnum = config.relateTypeEnum,
            offset = {
                x: config.node['margin-left'],
                y: config.node['margin-top']
            };

        if (relateNode) {
            width = relateNode.width;
            x = relateNode.x;
            y = relateNode.y;
        }

        if (relateType === relateTypeEnum.child) {
            x += width + offset.x;
        } else if (relateType === relateTypeEnum.parent) {
            x -= offset.x;
        }

        if (siblingsTotal === 1) {
            position.x = x;
            position.y = y;
            return position;
        }

        var middleIndex = Math.ceil(siblingsTotal / 2);
        // 包含奇数个节点
        if (siblingsTotal % 2 === 1) {
            if (index < middleIndex) {
                y = y - (middleIndex - index) * offset.y;
            } else if (index > middleIndex) {
                y = y + (index - middleIndex) * offset.y;
            }
            // 包含偶数个节点
        } else if (siblingsTotal % 2 === 0) {
            middleIndex += 1;
            if (index < middleIndex) {
                y = y - (middleIndex - index) * offset.y + height / 2;
            } else if (index >= middleIndex) {
                y = y + (index - middleIndex + 1) * offset.y - height / 2;
            }
        }

        position.x = x;
        position.y = y;

        // var parent = parent || {},
        //     nodeElements,
        //     // children = childNodes,
        //     start = {
        //         X: parent.x || 0,
        //         y: parent.y || 0
        //     },
        //     next = {
        //         x: start.x,
        //         y: start.y
        //     },
        //     end = {
        //         x: start.x,
        //         y: start.y
        //     },
        //     offset = {
        //         x: 0,
        //         y: 2 * (this.rect.height + 2 * (this.node.padding))
        //     },
        //     pathInfo,
        //     nodeInfo;

        // if (children && children.length > 0) {
        //     // 计算子节点的位置
        //     for (var i = 0, len = children.length; i < len; i++) {
        //         // this.createStraightLine(start.x, start.y, end.x, end.y);
        //     }
        // }

        // return {
        //     x: 100,
        //     y: 100
        // };

        return position;
    };

    TopologyDiagram.prototype.loadTopologyNodes = function () {
        this.AddTopologyNodes(this.data, null, this.config.relateTypeEnum.child);
        this.createTopologyAllLine();
    };

    TopologyDiagram.prototype.AddTopologyNodes = function (data, relateNode, relateType) {
        // var config = this.config,
        //     relateTypeEnum = config.relateTypeEnum,
        //     node;

        var node;

        if (data && data instanceof Array) {
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i];

                node = this.createTopologyNode(item, i + 1, len, relateNode, relateType);

                if (item.children && item.children.length > 0) {
                    this.AddTopologyNodes(item.children, node, relateType);
                }
            }
            // if (item.children && item.children.length > 0) {
            //     var children = item.children,
            //         childItem;

            //     for (var j = 0, jlen = children.length; j < jlen; j++) {
            //         childItem = children[j];

            //         // this.createTopologyNode(childItem, j + 1, jlen, node, relateTypeEnum.child);
            //         this.AddTopologyNodes(data);
            //     }
            // }
        }
    };

    TopologyDiagram.prototype.createTopologyAllLine = function () {
        var nodes = this.nodes,
            // config = this.config,
            // node = config.node,
            // offset = {
            //     x: node['margin-top'],
            //     y: node['margin-left']
            // },
            offsetX = this.config.node['margin-left'] / 2;

        for (var k in nodes) {
            var parent = nodes[k],
                children = parent.childrenNodes,
                parentX = parent.x + parent.width,
                parentY = parent.y + parent.height / 2;

            if (children && children.length > 0) {
                this.createStraightLine(parentX, parentY, parentX + offsetX, parentY, false);
            }

            for (var i = 0, len = children.length; i < len; i++) {
                var childItem = children[i],
                    childX = childItem.x,
                    childY = childItem.y + childItem.height / 2;

                if (parentY === childY) {
                    this.createStraightLine(parentX + offsetX, parentY, childX, childY);
                } else {
                    // this.createStraightLine(parentX, parentY, childX - offsetX, parentY);
                    this.createBrokenLine(parentX + offsetX, parentY, childX, childY);
                }
            }
        }
    };

    TopologyDiagram.prototype.createAllTopology = function () {
        this.createTopologyAllNode();
        this.createTopologyAllLine();
    };

    TopologyDiagram.prototype.getId = (function () {
        var id = 0;
        return function () {
            return ++id;
        };
    })();

    var topology = jQuery.fn.topology;

    // topology = function (data) {
    //     topologyDiagram = new TopologyDiagram(this, Raphael, data);
    // };

    // topology.addNode = function (data) {

    // };

    $.fn.extend({
        topology: function (data) {
            var topologyDiagram = new TopologyDiagram(this[0], Raphael, data);
            topologyDiagram.loadTopologyNodes();
        }
    });
})(jQuery, Raphael);
