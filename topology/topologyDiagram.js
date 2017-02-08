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
                'margin-top': 44
            },
            relateTypeEnum: {
                parent: 'parent',
                child: 'child'
            }
        };
        this.container = elem;
        this.paper = {
            element: Raphael(this.container, 1000, 1000),
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
        // 虚拟的根节点
        this.virtualRootNode = {
            virtualRoot: true,
            id: 'virtualRoot',
            x: 100,
            y: 200,
            width: 0,
            height: 0,
            originalData: null,
            nodeElements: null,
            parentNodes: [],
            childrenNodes: [],
            prevNode: null,
            nextNode: null,
            lines: []
        };
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

    // TopologyDiagram.prototype.createTopologyNode = function (data, index, siblingsTotal, relateNode, relateType) {
    //     var currentData = data,
    //         nodeElements,
    //         id = this.getId(),
    //         src = currentData.src,
    //         text = currentData.text,
    //         config = this.config,
    //         relateTypeEnum = config.relateTypeEnum,
    //         position,
    //         nodes = this.nodes,
    //         currentNode,
    //         prevNode;

    //     currentNode = {
    //         id: id,
    //         x: 0,
    //         y: 0,
    //         width: 0,
    //         height: 0,
    //         // x: position.x,
    //         // y: position.y,
    //         // width: nodeElements.width,
    //         // height: nodeElements.height,
    //         // nodeElements: nodeElements,
    //         originalData: currentData,
    //         parentNodes: [],
    //         childrenNodes: [],
    //         prevNode: null,
    //         nextNode: null,
    //         lines: []
    //     };

    //     if (relateNode) {
    //         // 创建下级节点
    //         if (relateType === relateTypeEnum.child) {
    //             if (relateNode.childrenNodes.length > 0) {
    //                 prevNode = relateNode.childrenNodes[relateNode.childrenNodes.length - 1];

    //                 prevNode.nextNode = currentNode;
    //                 currentNode.prevNode = prevNode;
    //             }
    //             currentNode.parentNodes = [relateNode];
    //             relateNode.childrenNodes.push(currentNode);
    //             // 创建父级节点
    //         } else if (relateType === relateTypeEnum.parent) {
    //             if (relateNode.parentNodes.length > 0) {
    //                 prevNode = relateNode.parentNodes[relateNode.parentNodes.length - 1];
    //                 prevNode.nextNode = currentNode;
    //                 currentNode.prevNode = prevNode;
    //             }
    //             currentNode.childrenNodes = [relateNode];
    //             relateNode.parentNodes.push(currentNode);
    //         }
    //     }

    //     position = this.CalculateTopologyNodePosition(relateNode, relateType, index, siblingsTotal, currentNode);

    //     nodeElements = this.createNode(position.x, position.y, src, text, id);

    //     $.extend(currentNode, {
    //         x: position.x,
    //         y: position.y,
    //         width: nodeElements.width,
    //         height: nodeElements.height,
    //         nodeElements: nodeElements
    //     });

    //     nodes[id] = currentNode;

    //     return currentNode;
    // };

    TopologyDiagram.prototype.createTopologyNode = function (data, siblingsIndex, siblingsCount, relateNode, relateType) {
        var currentData = data,
            nodeElements,
            id = this.getId(),
            src = currentData.src,
            text = currentData.text,
            config = this.config,
            relateTypeEnum = config.relateTypeEnum,
            position,
            nodes = this.nodes,
            currentNode,
            prevNode;

        currentNode = {
            id: id,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            // x: position.x,
            // y: position.y,
            // width: nodeElements.width,
            // height: nodeElements.height,
            // nodeElements: nodeElements,
            originalData: currentData,
            parentNodes: [],
            childrenNodes: [],
            prevNode: null,
            nextNode: null,
            siblingsIndex: siblingsIndex,
            siblingsCount: siblingsCount,
            lines: []
        };

        if (relateNode) {
            // 创建下级节点
            if (relateType === relateTypeEnum.child) {
                if (relateNode.childrenNodes.length > 0) {
                    prevNode = relateNode.childrenNodes[relateNode.childrenNodes.length - 1];

                    prevNode.nextNode = currentNode;
                    currentNode.prevNode = prevNode;
                }
                currentNode.parentNodes = [relateNode];
                relateNode.childrenNodes.push(currentNode);
                // 创建父级节点
            } else if (relateType === relateTypeEnum.parent) {
                if (relateNode.parentNodes.length > 0) {
                    prevNode = relateNode.parentNodes[relateNode.parentNodes.length - 1];
                    prevNode.nextNode = currentNode;
                    currentNode.prevNode = prevNode;
                }
                currentNode.childrenNodes = [relateNode];
                relateNode.parentNodes.push(currentNode);
            }
        }

        position = this.CalculateTopologyNodePosition(relateNode, currentNode, relateType);

        nodeElements = this.createNode(position.x, position.y, src, text, id);

        $.extend(currentNode, {
            x: position.x,
            y: position.y,
            width: nodeElements.width,
            height: nodeElements.height,
            nodeElements: nodeElements
        });

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

    TopologyDiagram.prototype.CalculateTopologyNodePosition = function (relateNode, currentNode, relateType) {
        // relateType必须存在，没有传入则默认为虚拟根节点
        if (!relateNode) {
            relateNode = this.virtualRootNode;
        }

        var config = this.config,
            position = {},
            width = relateNode.width,
            x = relateNode.x,
            y = relateNode.y,
            height = config.rect.height,
            relateTypeEnum = config.relateTypeEnum,
            offset = {
                x: config.node['margin-left'],
                y: config.node['margin-top']
            },
            siblingsCount = currentNode.siblingsCount,
            siblingsIndex = currentNode.siblingsIndex,
            siblingsIsOdd = siblingsCount % 2 === 1,
            siblingsMiddleIndex = Math.ceil(siblingsCount / 2),
            prevNode = currentNode.prevNode,
            // 计算偏移量相关参数
            currentItemChild = currentNode.originalData.children,
            currentItemChildCount = currentItemChild.length,
            currentItemChildMiddleIndex = Math.ceil(currentItemChildCount / 2),
            nodeHeight = config.rect.height,
            // prevNodeOffsetYBottom = currentNode.prevNode.offsetY.bottom,
            offsetY = {
                top: 0,
                bottom: 0
            };

        if (relateType === relateTypeEnum.child) {
            x += width + offset.x;
        } else if (relateType === relateTypeEnum.parent) {
            x -= offset.x;
        }

        // 创建节点兄弟节点个数为1
        if (siblingsCount === 1) {
            position.x = x;
            position.y = y;
        } else {
            // 计算同辈节点中首个节点的起始位置
            if (siblingsIndex === 1) {
                y = y - (siblingsMiddleIndex - siblingsIndex) * offset.y;
                if (!siblingsIsOdd) {
                    y -= height;
                }
            } else {
                x = prevNode.x;
                y = prevNode.y + offset.y;
            }

            position.x = x;
            position.y = y;
        }

        // 计算节点y值坐标的偏移量
        // if (currentItemChildCount > 1) {
        //     if (currentItemChildCount % 2 === 0) {
        //         offsetY.bottom = Math.abs((currentItemChild[currentItemChildCount - 1].y - currentItemChild[0].y) / 2) + nodeHeight / 2 + nodeOffseY;
        //     } else {
        //         offsetY.bottom = Math.abs(currentItemChild[currentItemChildCount - 1].y - currentItemChild[currentItemChildMiddleIndex - 1].y);
        //     }
        // }

        return position;
    };

    // TopologyDiagram.prototype.CalculateTopologyNodePosition = function (relateNode, relateType, index, siblingsTotal, currentNode) {
    //     // relateType必须存在，没有传入则默认为虚拟根节点
    //     if (!relateNode) {
    //         relateNode = this.virtualRootNode;
    //     }

    //     var config = this.config,
    //         position = {},
    //         width = relateNode.width,
    //         x = relateNode.x,
    //         y = relateNode.y,
    //         height = config.rect.height,
    //         relateTypeEnum = config.relateTypeEnum,
    //         offset = {
    //             x: config.node['margin-left'],
    //             y: config.node['margin-top']
    //         },
    //         // 计算偏移量相关参数
    //         currentItemChild = currentNode.originalData.children,
    //         currentItemChildCount = currentItemChild.length,
    //         currentItemChildMiddleIndex = Math.ceil(currentItemChildCount / 2),
    //         nodeHeight = config.rect.height,
    //         prevNodeOffsetYBottom = currentNode.prevNode.offsetY.bottom,
    //         offsetY = {
    //             top: 0,
    //             bottom: 0
    //         };

    //     if (relateType === relateTypeEnum.child) {
    //         x += width + offset.x;
    //     } else if (relateType === relateTypeEnum.parent) {
    //         x -= offset.x;
    //     }

    //     // 创建节点兄弟节点个数为1
    //     if (siblingsTotal === 1) {
    //         position.x = x;
    //         position.y = y;
    //         // 创建节点兄弟节点个数大于1
    //     } else {
    //         var middleIndex = Math.ceil(siblingsTotal / 2);
    //         // 包含奇数个节点
    //         if (siblingsTotal % 2 === 1) {
    //             if (index < middleIndex) {
    //                 y = y - (middleIndex - index) * offset.y;
    //             } else if (index > middleIndex) {
    //                 y = y + (index - middleIndex) * offset.y;
    //             }
    //             // 包含偶数个节点
    //         } else if (siblingsTotal % 2 === 0) {
    //             middleIndex += 1;
    //             if (index < middleIndex) {
    //                 y = y - (middleIndex - index) * offset.y + height / 2;
    //             } else if (index >= middleIndex) {
    //                 y = y + (index - middleIndex + 1) * offset.y - height / 2;
    //             }
    //         }

    //         position.x = x;
    //         position.y = y;
    //     }

    //     // 计算节点y值坐标的偏移量
    //     if (currentItemChildCount > 1) {
    //         if (currentItemChildCount % 2 === 0) {
    //             offsetY.bottom = Math.abs((currentItemChild[currentItemChildCount - 1].y - currentItemChild[0].y) / 2) + nodeHeight / 2 + nodeOffseY;
    //         } else {
    //             offsetY.bottom = Math.abs(currentItemChild[currentItemChildCount - 1].y - currentItemChild[currentItemChildMiddleIndex - 1].y);
    //         }
    //     }

    //     return position;
    // };

    TopologyDiagram.prototype.loadTopologyNodes = function () {
        this.AddTopologyNodes(this.data, this.virtualRootNode, this.config.relateTypeEnum.child);
        this.createTopologyAllLine();
    };

    TopologyDiagram.prototype.AddTopologyNodes = function (data, relateNode, relateType) {
        var node;
        // offsetY = 0,
        // childrenNodes = [],
        // childrenCount = 0,
        // childMiddleIndex = 1,
        // nodeHeight = this.config.rect.height,
        // nodeOffseY = this.config.node['margin-top'];

        if (data && data instanceof Array) {
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i],
                    children = item.children;

                node = this.createTopologyNode(item, i + 1, len, relateNode, relateType);

                if (children && children.length > 0) {
                    this.AddTopologyNodes(children, node, relateType);
                }
                // 计算下一个同级节点的y值偏移量
                // childrenNodes = node.childrenNodes;
                // childrenCount = childrenNodes.length;
                // if (childrenCount > 1) {
                //     childMiddleIndex = Math.ceil(childrenCount / 2);

                //     if (childrenCount % 2 === 0) {
                //         offsetY = Math.abs((childrenNodes[childrenCount - 1].y - childrenNodes[0].y) / 2) + nodeHeight / 2 + nodeOffseY;
                //     } else {
                //         offsetY = Math.abs(childrenNodes[childrenCount - 1].y - childrenNodes[childMiddleIndex - 1].y);
                //     }
                // }
            }
        }
    };

    TopologyDiagram.prototype.createTopologyAllLine = function () {
        var nodes = this.nodes,
            config = this.config,
            pathWidth = config.path['stroke-width'],
            offsetX = this.config.node['margin-left'] / 2;

        for (var k in nodes) {
            var parent = nodes[k],
                children = parent.childrenNodes,
                parentX = parent.x + parent.width,
                parentY = parent.y + parent.height / 2,
                childrenLength,
                childItem,
                childX,
                childY;

            if (children && children.length > 0) {
                childrenLength = children.length;
                // 中间的横线
                this.createStraightLine(parentX, parentY, parentX + offsetX, parentY, false);
                // 上竖线
                childItem = children[0];
                childY = childItem.y + childItem.height / 2 - pathWidth;
                this.createStraightLine(parentX + offsetX, parentY, parentX + offsetX, childY, false);
                // 下竖线
                childItem = children[childrenLength - 1];
                childY = childItem.y + childItem.height / 2 + pathWidth;
                this.createStraightLine(parentX + offsetX, parentY, parentX + offsetX, childY, false);

                for (var i = 0, len = childrenLength; i < len; i++) {
                    childItem = children[i];
                    childX = childItem.x;
                    childY = childItem.y + childItem.height / 2;

                    this.createStraightLine(parentX + offsetX, childY, childX, childY);
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
