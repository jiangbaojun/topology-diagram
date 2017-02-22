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

    function TopologyDiagram(elem, Raphael, options) {
        var self = this;

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
                stroke: '#8FA1AE',
                'stroke-width': 1
            },
            node: {
                'padding-left': 4,
                'padding-top': 3,
                'margin-left': 40,
                'margin-top': 22
            },
            relateTypeEnum: {
                parent: 'parent',
                child: 'child'
            },
            virtualRootNode: {
                virtualRoot: true,
                id: 'virtualRoot',
                x: -40,
                x: 800,
                y: 0,
                width: 0,
                height: 0,
                originalData: null,
                nodeElements: null,
                parentNodes: [],
                childrenNodes: [],
                prevNode: null,
                nextNode: null,
                line: {
                    start: false,
                    end: false
                }
            }

        };
        // left center
        this.align = options.align || 'left';
        this.container = elem;
        this.paper = {
            element: Raphael(this.container, 1000, 1000),
            height: 0,
            width: 0
        };
        this.viewBox = {
            width: 0,
            height: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        };
        // forward reverse
        this.direction = {
            arrow: 'forward',
            node: 'forward'
        };
        this.data = options.data;
        if (options.direction) {
            if (options.direction.arrow) {
                this.direction.arrow = options.direction.arrow;
            }

            if (options.direction.node) {
                this.direction.node = options.direction.node;
            }
        }
        // 通过创建node自动生成的id绑定节点相关信息
        this.nodesHash = {};
        this.nodes = [];
        this.nodeMergeKey = 'id';
        this.nodeMergeHash = {};

        // 虚拟的根节点
        this.virtualRootNode;

        this.ondblclickcallback;
        this.onclickcallback;

        if (options) {
            this.ondblclickcallback = options.ondblclick || null;
            this.onclickcallback = options.onclick || null;
        }

        // click 与 dblclick冲突，不能同时使用
        this.onclick = function (handler, node) {};

        this.ondblclick = function (handler, node) {
            var fun = self.ondblclickcallback,
                data = node.originalData,
                elem = self.container;

            // 设置选中节点
            // self.selected = node;
            // 执行回调函数
            if (typeof fun === 'function') {
                try {
                    fun.call(elem, data, node.id);
                } catch (e) {
                    throw e;
                }
            }
        };

        this.selected = null;
    };

    TopologyDiagram.prototype.createRect = function (x, y, width, id) {
        var config = this.config.rect,
            paper = this.paper.element,
            rect,
            self = this;

        rect = paper.rect(x, y, width, config.height, config.radius).attr({
            fill: config.fill.default,
            'stroke-width': config['stroke-width'],
            stroke: config.stroke.default,
            r: config.radius
        });

        rect.click(function (handler) {
            self.onclick(handler, self.nodesHash[id]);
        });

        rect.dblclick(function (handler) {
            self.ondblclick(handler, self.nodesHash[id]);
        });

        $(rect[0]).attr({
            'data-nodeId': id,
            'id': id + '-rect'
        }).addClass('node node-rect');

        return rect;
    };

    TopologyDiagram.prototype.createImage = function (x, y, src, id) {
        var config = this.config.image,
            paper = this.paper.element,
            image,
            self = this;

        image = paper.image(src, x, y, config.width, config.height).attr({

        });

        image.click(function (handler) {
            self.onclick(handler, self.nodesHash[id]);
        });

        image.dblclick(function (handler) {
            self.ondblclick(handler, self.nodesHash[id]);
        });

        $(image[0]).attr({
            'data-nodeId': id,
            'id': id + '-image'
        }).addClass('node node-image');

        return image;
    };

    TopologyDiagram.prototype.createText = function (x, y, text, id) {
        var config = this.config.text,
            maxLength = config.maxLength,
            paper = this.paper.element,
            title = text,
            textElem,
            self = this;

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

        textElem.click(function (handler) {
            self.onclick(handler, self.nodesHash[id]);
        });

        textElem.dblclick(function (handler) {
            self.ondblclick(handler, self.nodesHash[id]);
        });

        $(textElem[0]).attr({
            'data-nodeId': id,
            'id': id + '-text'
        }).addClass('node node-text');

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

    TopologyDiagram.prototype.selectedNode = function (node) {
        var rect = node.nodeElements.rect,
            // selectedNode = this.selected,
            config = this.config;

        this.selected = node;

        rect.attr({
            fill: config.fill.selected,
            stroke: config.stroke.selected
        });
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

    TopologyDiagram.prototype.createTopologyNode = function (data, parentNode) {
        var currentData = data,
            nodeElements,
            id = this.getId(),
            src = currentData.src,
            text = currentData.text,
            position,
            nodes = this.nodes,
            nodesHash = this.nodesHash,
            nodeMergeHash = this.nodeMergeHash,
            currentNode,
            prevNode,
            parentNodes,
            lastParentNode,
            nodeMergeValue = currentData[this.nodeMergeKey] || null;

        currentNode = {
            id: id,
            x: 0,
            y: 0,
            text: text,
            src: src,
            width: 0,
            height: 0,
            originalData: currentData,
            parentNodes: [],
            childrenNodes: [],
            prevNode: null,
            nextNode: null,
            line: {
                start: false,
                end: false
            },
            offsetY: 0
        };

        // 关联需合并汇聚的节点
        if (nodeMergeValue !== null && nodeMergeHash[nodeMergeValue]) {
            currentNode = nodeMergeHash[nodeMergeValue];
            parentNodes = currentNode.parentNodes;
            lastParentNode = parentNodes[parentNodes.length - 1];

            // 为同级相邻的兄弟节点，添加关联
            if (parentNode.prevNode && lastParentNode.id === parentNode.prevNode.id) {
                this.relateMergeTopologyNode(currentNode, parentNode);
            } else {
                console.warn('node id=' + currentNode.originalData.id + ' is exist! ignore!');
            }

            return null;
        }

        if (parentNode) {
            // 创建下级节点

            if (parentNode.childrenNodes.length > 0) {
                prevNode = parentNode.childrenNodes[parentNode.childrenNodes.length - 1];

                prevNode.nextNode = currentNode;
                currentNode.prevNode = prevNode;
            }
            currentNode.parentNodes = [parentNode];
            parentNode.childrenNodes.push(currentNode);
        }

        // 先创建出节点元素，获取其宽度和高度
        nodeElements = this.createNode(this.virtualRootNode.x, this.virtualRootNode.y, src, text, id);
        currentNode.width = nodeElements.width;
        currentNode.height = nodeElements.height;
        currentNode.nodeElements = nodeElements;

        position = this.CalculateTopologyNodePosition(parentNode, currentNode);

        $.extend(currentNode, {
            x: position.x,
            y: position.y,
            offsetY: position.offsetY
        });

        // 移动节点元素位置
        this.moveTopologyNode(currentNode);

        // 将根节点加入nodes保存
        nodesHash[id] = currentNode;
        nodeMergeHash[nodeMergeValue] = currentNode;

        // 记录根节点
        if (parentNode.virtualRoot === true) {
            nodes.push(currentNode);
        }

        return currentNode;
    };

    TopologyDiagram.prototype.moveTopologyNode = function (node, offset, isRecursion) {
        var nodeElements = node.nodeElements,
            rect = nodeElements.rect,
            text = nodeElements.text,
            image = nodeElements.image,
            x = node.x,
            y = node.y,
            offsetX = x === null ? 0 : x - rect.attrs.x,
            offsetY = y === null ? 0 : y - rect.attrs.y;

        if (offset) {
            offsetX += (offset.x || 0);
            offsetY += (offset.y || 0);

            node.x = x + offsetX;
            node.y = y + offsetY;
        }
        if (offsetX === 0 && offsetY === 0) {
            return;
        }
        rect.attr({
            x: rect.attrs.x + offsetX,
            y: rect.attrs.y + offsetY
        });
        text.attr({
            x: text.attrs.x + offsetX,
            y: text.attrs.y + offsetY
        });
        image.attr({
            x: image.attrs.x + offsetX,
            y: image.attrs.y + offsetY
        });

        this.setViewBox(node);

        if (isRecursion) {
            var children = node.childrenNodes;

            if (!node.mergeNode && children && children.length > 0) {
                for (var i = 0, len = children.length; i < len; i++) {
                    node = children[i];
                    this.moveTopologyNode(node, offset, isRecursion);
                }
            }
        }
    };

    TopologyDiagram.prototype.setTopologyNodePosition = function (node, offset, isRecursion) {
        var x = node.x,
            y = node.y,
            offsetX = 0,
            offsetY = 0;

        if (offset) {
            offsetX += (offset.x || 0);
            offsetY += (offset.y || 0);

            node.x = x + offsetX;
            node.y = y + offsetY;
        }
        if (offsetX === 0 && offsetY === 0) {
            return;
        }

        if (isRecursion) {
            var children = node.childrenNodes;

            if (!node.mergeNode && children && children.length > 0) {
                for (var i = 0, len = children.length; i < len; i++) {
                    node = children[i];
                    this.setTopologyNodePosition(node, offset, isRecursion);
                }
            }
        }
    };

    TopologyDiagram.prototype.relateTopologyNode = function (parentNode, currentNode) {
        var childrenNodes = parentNode.childrenNodes,
            childrenCount = childrenNodes.length,
            childItem,
            isExist = false;

        for (var i = 0; i < childrenCount; i++) {
            childItem = childrenNodes[i];
            if (childItem.id === currentNode.id) {
                isExist = true;
                break;
            }
        }

        if (!isExist) {
            parentNode.childrenNodes.push(currentNode);
            currentNode.parentNodes.push(parentNode);
        }

        // return currentNode;
    };

    TopologyDiagram.prototype.relateMergeTopologyNode = function (currentNode, parentNode) {
        // var nodeMergeHash = this.nodeMergeHash,
        // nodeMergeValue = currentData[this.nodeMergeKey] || null,
        var config = this.config,
            // relateTypeEnum = config.relateTypeEnum,
            nodeHeight = config.rect.height,
            nodeOffsetY = config.node['margin-top'],
            children,
            mergeNode,
            prevNode,
            childItem,
            nextY,
            offsetY;

        // 追加子节点
        mergeNode = currentNode.parentNodes[0];
        children = currentNode.parentNodes[0].childrenNodes;
        parentNode.childrenNodes = children;
        parentNode.mergeNode = mergeNode;
        // 追加父节点
        for (var i = 0, len = children.length; i < len; i++) {
            childItem = children[i];
            childItem.parentNodes.push(parentNode);
        }

        // // 调整需合并节点的位置
        // prevNode = parentNode.prevNode;
        // // if (prevNode.id === mergeNode.id) {
        // //     debugger;
        // //     mergeNode.offsetY = mergeNode.offsetY - nodeHeight - nodeOffsetY;
        // // }
        // debugger;
        // // return;
        // // if (prevNode.offsetY > 0) {
        // //     // debugger;
        // //     nextY = prevNode.y + nodeOffsetY + nodeHeight;
        // //     offsetY = parentNode.y - nextY;
        // //     parentNode.y = nextY;
        // //     // 合并的节点不需要预留向下的偏移量
        // //     parentNode.offsetY = offsetY - (nodeOffsetY + nodeHeight);
        // //     this.moveTopologyNode(parentNode);
        // // }

        // if (prevNode.offsetY > 0) {
        //     parentNode.offsetY += prevNode.offsetY;
        //     parentNode.y = parentNode.y - prevNode.offsetY;
        //     this.moveTopologyNode(parentNode);
        // }
    };

    TopologyDiagram.prototype.CalculateTopologyNodePosition = function (parentNode, currentNode) {
        // relateType必须存在，没有传入则默认为虚拟根节点
        if (!parentNode) {
            parentNode = this.virtualRootNode;
        }

        var config = this.config,
            // nodeWidth = parentNode.width,
            nodeWidth,
            x = parentNode.x,
            y = parentNode.y,
            // relateTypeEnum = config.relateTypeEnum,
            nodeOffset = {
                x: config.node['margin-left'],
                y: config.node['margin-top']
            },
            nodeHeight = config.rect.height,
            positionOffsetY = 0,
            prevNode = currentNode.prevNode,
            // 计算标准偏移量相关参数
            currentItemChild = currentNode.originalData.children,
            currentItemChildCount = currentItemChild.length,
            // 计算offsetTop累计实际偏移量相关参数
            prevNodeChildren,
            prevNodeChildrenCount,
            prevNodeChildItem;

        // x轴正向向展示
        if (this.direction.node === 'forward') {
            nodeWidth = parentNode.width;
            x += nodeWidth + nodeOffset.x;
        } else {
            nodeWidth = currentNode.width;
            x -= nodeWidth + nodeOffset.x;
        }
        // 计算同辈节点中非首个节点的位置
        if (prevNode) {
            // x = prevNode.x;
            y = prevNode.y + nodeHeight + nodeOffset.y;
        }

        if (currentItemChildCount > 1) {
            positionOffsetY = (currentItemChildCount - 1) * (nodeHeight + nodeOffset.y);
        }

        // 计算prevNode节点Y值实际的下偏移量（通过计算累加下级节点的偏移量得到）
        if (prevNode) {
            // 非合并类型节点，追加全部子节点的偏移量
            if (!prevNode.mergeNode) {
                prevNodeChildren = prevNode.childrenNodes;

                prevNodeChildrenCount = prevNodeChildren.length;
                for (var i = 0; i < prevNodeChildrenCount; i++) {
                    prevNodeChildItem = prevNodeChildren[i];
                    prevNode.offsetY += prevNodeChildItem.offsetY;
                }

                y += prevNode.offsetY;
            } else {
                y += prevNode.offsetY;
            }
        }

        return {
            x: x,
            y: y,
            // 全部子节点累计的偏移量
            offsetY: positionOffsetY
        };
    };

    TopologyDiagram.prototype.init = function () {
        var pager = this.paper.element;
        pager.clear();
        this.nodesHash = {};
        this.nodes = [];
        this.nodeMergeHash = {};
        this.virtualRootNode = $.extend(true, {}, this.config.virtualRootNode);
        this.virtualRootNode.originalData = {
            id: 'virtualRoot',
            text: '',
            children: this.data
        };
    };

    TopologyDiagram.prototype.loadTopologyNodes = function () {
        this.init();
        this.AddTopologyNodes(this.data, this.virtualRootNode);
        this.fitTopologyNodesPosition(this.nodes);
        this.createTopologyAllLine();
        this.resetTopologyPager();
    };

    TopologyDiagram.prototype.AddTopologyNodes = function (data, parentNode) {
        var node;

        if (data && data instanceof Array) {
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i],
                    children = item.children;

                // 合并的节点返回null
                node = this.createTopologyNode(item, parentNode);

                if (node) {
                    if (children && children.length > 0) {
                        this.AddTopologyNodes(children, node);
                    }
                } else {
                    break;
                }
            }
        }
    };

    TopologyDiagram.prototype.fitTopologyNodesPosition = function (nodes) {
        var node,
            childrenNodes,
            childrenNodesCount; ;

        for (var i = 0, len = nodes.length; i < len; i++) {
            node = nodes[i];
            childrenNodes = node.childrenNodes;
            childrenNodesCount = childrenNodes.length;

            // 递归遍历非汇聚类型的节点
            if (!node.mergeNode && childrenNodesCount > 0) {
                this.fitTopologyNodesPosition(childrenNodes);
            }

            // 使发散类型的父节点位置居中
            this.moveToMiddleByBranchTypeNode(node);

            // 调整合并类型节点的位置
            this.fitMergeTypeNode(node);

            // 使合并类型的合并节点位置居中
            this.moveToMiddleByMergeTypeNode(node);
        }
    };

    TopologyDiagram.prototype.moveToMiddleByBranchTypeNode = function (node) {
        var children = node.childrenNodes,
            count = children.length,
            first,
            last,
            y,
            offset;

        if (count <= 1) {
            return;
        }
        if (count > 1) {
            first = children[0];
            last = children[count - 1];
            offset = (last.y - first.y) / 2;
            y = first.y + offset;
            node.y = y;
            this.moveTopologyNode(node);
        }
    };

    TopologyDiagram.prototype.fitXByMergeTypeNode = function (node) {
        var parents = node.parentNodes,
            // children = node.childrenNodes,
            parentsCount = parents.length,
            firstNode,
            firstNodeWidth,
            width,
            offsetX,
            maxWidth = 0,
            parentItem,
            direction = this.direction;

        if (parentsCount > 1) {
            firstNode = parents[0];
            firstNodeWidth = firstNode.width;

            for (var i = 1; i < parentsCount; i++) {
                parentItem = parents[i];
                width = parentItem.width;
                if (width > maxWidth) {
                    maxWidth = width;
                }
            }

            if (maxWidth > firstNodeWidth) {
                offsetX = maxWidth - firstNodeWidth;
                this.setTopologyNodePosition(node, {
                    x: (direction.node === 'forward') ? offsetX : -offsetX,
                    y: 0
                }, true);
            }

            this.moveTopologyNode(node, null, true);
        }
    };

    TopologyDiagram.prototype.fitYByMergeTypeNode = function (node) {
        var parents = node.parentNodes,
            parentsCount = parents.length,
            offsetY,
            parentItem,
            nextItem,
            lastItem,
            nodeHeight = this.config.rect.height,
            nodeOffsetY = this.config.node['margin-top'];

        if (parentsCount > 1) {
            // 重新调整汇聚类型的多个父节点位置
            for (var i = 0; i < parentsCount - 1; i++) {
                parentItem = parents[i];
                nextItem = parents[i + 1];
                offsetY = parentItem.offsetY;
                nextItem.offsetY += parentItem.offsetY;
                nextItem.y -= offsetY;
                parentItem.offsetY = 0;
                this.moveTopologyNode(nextItem);
                if (i === parentsCount - 2) {
                    lastItem = nextItem;
                }
            }

            // 暂时注释：勿删
            // 上移汇聚类型节点之后的兄弟节点
            // while (lastItem.nextNode) {
            //     lastItem = lastItem.nextNode;
            //     offsetY = -(nodeHeight + nodeOffsetY);
            //     this.setTopologyNodePosition(lastItem, {
            //         x: 0,
            //         y: offsetY
            //     }, true);
            //     this.moveTopologyNode(lastItem, null, true);
            // }
        }
    };

    TopologyDiagram.prototype.moveToMiddleByMergeTypeNode = function (node) {
        var parents = node.parentNodes,
            parentsCount = parents.length,
            offsetY,
            parentItem,
            lastItem,
            firstItem,
            nodeHeight = this.config.rect.height,
            currentY = node.y + nodeHeight / 2;

        // 使合并类型的合并节点位置居中
        if (parentsCount > 1) {
            firstItem = parents[0];
            lastItem = parents[parentsCount - 1];
            offsetY = currentY - (firstItem.y + (lastItem.y - firstItem.y + nodeHeight) / 2);
            if (offsetY !== 0) {
                for (var i = 0; i < parentsCount; i++) {
                    parentItem = parents[i];
                    parentItem.y += offsetY;
                    this.moveTopologyNode(parentItem);
                }
            }
        }
    };

    TopologyDiagram.prototype.fitMergeTypeNode = function (node) {
        this.fitXByMergeTypeNode(node);
        this.fitYByMergeTypeNode(node);
    };

    TopologyDiagram.prototype.createTopologyAllLine = function () {
        var nodes = this.nodesHash,
            config = this.config,
            pathWidth = config.path['stroke-width'],
            offsetX = this.config.node['margin-left'] / 2,
            direction = this.direction;

        for (var k in nodes) {
            var current = nodes[k],
                parent = current.parentNodes,
                children = current.childrenNodes,
                currentX = direction.node === 'forward' ? (current.x + current.width) : current.x,
                // currentY = current.y + current.height / 2,
                currentY = current.y + current.height / 2,
                // currentX,
                operator = direction.node === 'forward' ? 1 : -1,
                // currentY,
                // 父节点
                parentLength = parent.length,
                parentItem,
                parentItemFirst,
                parentItemEnd,
                parentItemFirstY,
                parentItemEndY,
                parentX,
                parentY,
                // parentX,
                // 子节点
                childrenLength = children.length,
                childItem,
                childItemFirst,
                childItemEnd,
                childItemFirstY,
                childItemEndY,
                childX,
                childY;

            // 一个节点
            if (parentLength === 1) {
                parentItem = parent[0];
                if (!parentItem.virtualRoot && parentItem.childrenNodes.length === 1) {
                    parentX = direction.node === 'forward' ? (parentItem.x + parentItem.width) : parentItem.x;
                    currentX = direction.node === 'forward' ? current.x : (current.x + current.width);
                    this.createStraightLine(parentX, currentY, currentX, currentY, true);
                }
            }
            // 发散的节点
            if (childrenLength > 1) {
                // 前横线
                this.createStraightLine(currentX, currentY, currentX + (operator * offsetX), currentY, false);
                // 竖线
                childItemFirst = children[0];
                childItemEnd = children[childrenLength - 1];
                childItemFirstY = childItemFirst.y + childItemFirst.height / 2 - pathWidth;
                childItemEndY = childItemEnd.y + childItemEnd.height / 2 + pathWidth;

                currentX += operator * offsetX;
                this.createStraightLine(currentX, childItemFirstY, currentX, childItemEndY, false);

                // 后横线
                for (var i = 0, len = childrenLength; i < len; i++) {
                    childItem = children[i];
                    childX = direction.node === 'forward' ? childItem.x : childItem.x + childItem.width;
                    childY = childItem.y + childItem.height / 2;
                    if (!childItem.line.start) {
                        childItem.line.start = true;
                        this.createStraightLine(currentX, childY, childX, childY);
                    }
                }
            }

            // 聚合的节点
            if (parentLength > 1) {
                // 竖线
                parentItemFirst = parent[0];
                parentItemEnd = parent[parentLength - 1];
                parentItemFirstY = parentItemFirst.y + parentItemFirst.height / 2 - pathWidth;
                parentItemEndY = parentItemEnd.y + parentItemEnd.height / 2 + pathWidth;
                currentX = (direction.node === 'forward') ? current.x - offsetX : current.x + current.width + offsetX;
                this.createStraightLine(currentX, parentItemFirstY, currentX, parentItemEndY, false);
                // 后横线
                parentX = direction.node === 'forward' ? current.x : current.x + current.width;
                this.createStraightLine(currentX, currentY, parentX, currentY, true);
                // 前横线
                for (var j = 0; j < parentLength; j++) {
                    parentItem = parent[j];
                    parentX = direction.node === 'forward' ? parentItem.x + parentItem.width : parentItem.x;
                    parentY = parentItem.y + parentItem.height / 2;

                    this.createStraightLine(parentX, parentY, currentX, parentY, false);
                }
            }
        }
    };

    TopologyDiagram.prototype.setViewBox = function (node) {
        var viewBox = this.viewBox,
            top = viewBox.top,
            bottom = viewBox.bottom,
            left = viewBox.left,
            right = viewBox.right,
            currentTop = node.y,
            currentBottom = node.y + node.height,
            currentLeft = node.x,
            currentRight = node.x + node.width;

        if (currentTop < top) {
            viewBox.top = currentTop;
        }

        if (bottom < currentBottom) {
            viewBox.bottom = currentBottom;
        }

        if (currentLeft < left) {
            viewBox.left = currentLeft;
        }

        if (right < currentRight) {
            viewBox.right = currentRight;
        }

        viewBox.width = right - left;
        viewBox.height = bottom - top;
    };

    TopologyDiagram.prototype.resetTopologyPager = function () {
        var viewBox = this.viewBox,
            paper = this.paper.element,
            offset = 10,
            height = viewBox.height + 2 * offset,
            width = viewBox.width + 2 * offset,
            viewBoxX = viewBox.left < 0 ? viewBox.left - offset : -offset,
            viewBoxY = viewBox.top < 0 ? viewBox.top - offset : -offset,
            container = $(this.container),
            containerWidth = 0;

        paper.setSize(width, height);
        paper.setViewBox(viewBoxX, viewBoxY, width, height, false);

        if (this.align === 'center') {
            containerWidth = container.width();
            if (containerWidth > width) {
                container.find('>svg:first').css({
                    left: '50%',
                    'margin-left': '-' + width / 2 + 'px'
                });
            }
        }
    };

    TopologyDiagram.prototype.getId = (function () {
        var id = 0;
        return function () {
            return ++id;
        };
    })();

    var methods = {
        init: function (options) {
            return this.each(function () {
                var topologyDiagram,
                    $elem = $(this);

                topologyDiagram = new TopologyDiagram(this, Raphael, options);
                topologyDiagram.loadTopologyNodes();
                $elem.addClass('topology-diagram').data('topology-diagram', topologyDiagram);
            });
        },
        destroy: function () {
            return this.each(function () {
                var $elem = $(this),
                    topologyDiagram = $elem.data('topology-diagram'),
                    paper = topologyDiagram.paper.element;

                paper.remove();
                $elem.removeClass('topology-diagram');
                $elem.removeData('topology-diagram');
            });
        },
        getSelected: function () {
            var $elem = $(this),
                topologyDiagram = $elem.data('topology-diagram'),
                selected = topologyDiagram.selected ? topologyDiagram.selected.originalData : null;

            return selected;
        },
        addNodes: function (relateId, data, type) {
            var $elem = $(this),
                topology = $elem.data('topology-diagram'),
                relateData,
                // parents,
                // parent,
                // index,
                // grandParent,
                // node,
                // splitNodes,
                children,
                nodes;

            relateData = topology.nodesHash[relateId].originalData;
            // if (type === 'parent') {
            //     // 向关联的父级元素添加子节点
            //     for (var i = 0, len = data.length; i < len; i++) {
            //         node = data[i];
            //         children = node;
            //         while (children && children.length > 0) {
            //             children = children.children;
            //         }
            //         children.children = [relateData];
            //     }
            //     parents = topology.nodesHash[relateId].parentNodes;
            //     debugger;
            //     parent = parents[parents.length - 1];

            //     if (parent.id === 'virtualRoot') {

            //     } else {
            //         grandParent = parent.parentNodes[0];

            //         nodes = grandParent.childrenNodes;
            //         index = nodes.length - 1;
            //         for (i = 0, len = nodes.length; i < len; i++) {
            //             node = nodes[i];
            //             if (node.id === parent.id) {
            //                 index = i;
            //                 break;
            //             }
            //         }

            //         nodes = grandParent.originalData.children;
            //         splitNodes = nodes.splice(index + 1);
            //         nodes = nodes.concat(data);
            //         nodes = nodes.concat(splitNodes);
            //         grandParent.originalData.children = nodes;
            //         if (grandParent.id === 'virtualRoot') {
            //             topology.data = nodes;
            //         }
            //     }
            // } else {
            //     nodes = relateData.children;
            //     children = nodes.concat(data);
            //     // topology.nodesHash[relateId].originalData.children = children;
            //     relateData.children = children;
            // }

            nodes = relateData.children;
            children = nodes.concat(data);

            relateData.children = children;

            topology.loadTopologyNodes();
        }
    };

    jQuery.fn.topology = function () {
        var method = arguments[0],
            arg = arguments;

        if (methods[method]) {
            method = methods[method];
            arg = Array.prototype.slice.call(arguments, 1);
        } else if (typeof (method) === 'object' || !method) {
            method = methods.init;
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.menubar');
            return this;
        }

        return method.apply(this, arg);
    };
})(jQuery, Raphael);
