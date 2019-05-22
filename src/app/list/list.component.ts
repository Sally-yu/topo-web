import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NzMessageService} from 'ng-zorro-antd';
import {UrlService} from '../url.service';
import * as go from 'gojs';
import {UUID} from 'angular2-uuid';
import {Router} from '@angular/router';


declare var $: any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  loading=false;
  diagram;
  workSpc;
  listUrl = this.url.workUrl;
  timeOutId = 0;

  //连线动效用参数
  opacity = 1;
  down = true;

  constructor(
    private http: HttpClient,
    private message: NzMessageService,
    private url: UrlService,
    private router: Router
  ) {
  }

  getWorkSpc() {
    const data = {
      opt: 'all',
      workspace: {}
    };
    this.http.post(this.listUrl, data).subscribe(res => {
      this.workSpc = res;
    }, error1 => {
      this.message.info(error1);
      // console.log(error1);
    });
  }

  // 点选一行编辑，跳转到编辑页面;key传null为新增跳转
  rowSelected(key) {
    if (key) { //修改
      this.router.navigate(['/topo/item/' + key]);
      // console.log(this.currWork);
    } else if (key == null) { //新增
      this.router.navigate(['/topo/item/' + UUID.UUID()]);
    }
  }

  // 在列表中删除
  delete(key) {
    this.http.post(this.listUrl, {opt: 'delete', workspace: {key: key}}).subscribe(res => {
        this.message.success('删除成功');
        this.getWorkSpc();
      },
      error1 => {
        // console.log(error1);
        this.message.warning('删除失败:' + error1.error);
      });
  }

  //预览不可编辑
  preview(key) {
    if (key) {
      $('#diagram').css('transform', 'rotateX(0deg)');
      this.stopLoop();
      let data = this.workSpc.filter(d => d.key === key)[0]; // 当前选中设备
      this.diagram.model = go.Model.fromJson(data);
      this.diagram.model.linkFromPortIdProperty = 'fromPortId';
      this.diagram.model.linkToPortIdProperty = 'toPortId';
      this.loop();
    } else {
      $('#diagram').css('transform', 'rotateX(90deg)');
      this.diagram.model = go.Model.fromJson({});
    }
  }

  release(key) {
    this.loading=true;
    let data = this.workSpc.filter(d => d.key === key)[0]; // 当前选中设备
    console.log(data)
    //删除
    this.http.post(this.listUrl, {opt: 'delete', workspace: {key:key}}).subscribe(res => {
      }
    );
    //新增
    this.http.post(this.listUrl, {opt:'save',workspace:data}).subscribe(res => {
      if (res) {
        this.message.success('操作成功');
        this.loading=false;
        // this.getWorkSpc();
      }
    }, error1 => {
      // console.log(error1);
      this.message.info('操作失败:' + error1);
    });
  }

  //初始化布局图和工具栏
  initDiagram() {
    let $ = go.GraphObject.make;
    let self = this;
    const imgUrl = this.url.imgUrl + '/';

    function showLinkLabel(e) {
      const label = e.subject.findObject('LABEL');
      if (label !== null) {
        label.visible = (e.subject.fromNode.data.category === 'Conditional');
      }
    }

    self.diagram = $(go.Diagram, 'diagram',  // must name or refer to the DIV HTML element
      {
        'LinkDrawn': showLinkLabel,  // this DiagramEvent listener is defined below
        'LinkRelinked': showLinkLabel,
      });

    self.diagram.isReadOnly = true;

    function nodeStyle() {
      return [
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        {
          locationSpot: go.Spot.Center
        }
      ];
    }

    function makePort(name, align, spot, output, input) {
      var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
      // the port is basically just a transparent rectangle that stretches along the side of the node,
      // and becomes colored when the mouse passes over it
      return $(go.Shape,
        {
          fill: 'transparent',  // changed to a color in the mouseEnter event handler
          strokeWidth: 0,  // no stroke
          width: horizontal ? NaN : 8,  // if not stretching horizontally, just 8 wide
          height: !horizontal ? NaN : 8,  // if not stretching vertically, just 8 tall
          alignment: align,  // align the port on the main Shape
          stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
          portId: name,  // declare this object to be a "port"
          fromSpot: align,  // declare where links may connect at this port
          fromLinkable: output,  // declare whether the user may draw links from here
          toSpot: spot,  // declare where links may connect at this port
          toLinkable: input,  // declare whether the user may draw links to here
          cursor: 'pointer',
          // show a different cursor to indicate potential link point
        }
      );
    }

    self.diagram.nodeTemplateMap.add('picture',  // picture
      $(go.Node, 'Auto',
        nodeStyle(),
        {
          locationSpot: go.Spot.Center,  // the location is the center of the Shape
          locationObjectName: 'PIC',
          selectionAdorned: false,  // no selection handle when selected
          resizable: true, resizeObjectName: 'PIC',  // user can resize the Shape
          rotatable: true, rotateObjectName: 'PIC',  // rotate the Shape without rotating the label
          layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
        },
        $(go.Picture,
          {name: 'PIC', width: 80, height: 80, imageStretch: go.GraphObject.UniformToFill},
          new go.Binding('source', 'src'),
        ),
        // Shape.fill is bound to Node.data.color
        // four named ports, one on each side:
        makePort('T', go.Spot.Top, go.Spot.Top, true, true),
        makePort('L', go.Spot.Left, go.Spot.Left, true, true),
        makePort('R', go.Spot.Right, go.Spot.Right, true, true),
        makePort('B', go.Spot.Bottom, go.Spot.Bottom, true, true),
      ));

    self.diagram.nodeTemplateMap.add('Comment',
      $(go.Node, 'Auto', nodeStyle(),
        $(go.Shape, 'Rectangle',
          {fill: '#DEE0A3', strokeWidth: 0}),
        $(go.TextBlock,
          {
            margin: 5,
            maxSize: new go.Size(200, NaN),
            wrap: go.TextBlock.WrapFit,
            textAlign: 'center',
            editable: true,
            font: 'bold 12pt Helvetica, Arial, sans-serif',
            stroke: '#454545'
          },
          new go.Binding('text').makeTwoWay()),
      ));

    self.diagram.nodeTemplateMap.add('shape',
      $(go.Node, 'Auto',
        nodeStyle(),
        {
          locationSpot: go.Spot.Center,  // the location is the center of the Shape
          locationObjectName: 'SHAPE',
          selectionAdorned: false,  // no selection handle when selected
          resizable: true, resizeObjectName: 'SHAPE',  // user can resize the Shape
          rotatable: true, rotateObjectName: 'SHAPE',  // rotate the Shape without rotating the label
          // don't re-layout when node changes size
          layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
        },
        $(go.Shape,
          {
            name: 'SHAPE',
            strokeWidth: 2,
            stroke: 'black',
            fill: 'transparent',
            width: 80,
            height: 80
          },
          new go.Binding('figure', 'svg').makeTwoWay()
        ),
        // Shape.fill is bound to Node.data.color
        // four named ports, one on each side:
        makePort('T', go.Spot.Top, go.Spot.TopSide, true, true),
        makePort('L', go.Spot.Left, go.Spot.LeftSide, true, true),
        makePort('R', go.Spot.Right, go.Spot.RightSide, true, true),
        makePort('B', go.Spot.Bottom, go.Spot.BottomSide, true, true),
      ));

    self.diagram.nodeTemplateMap.add('',
      $(go.Node, 'Auto',
        nodeStyle(),
        {
          locationSpot: go.Spot.Center,  // the location is the center of the Shape
          locationObjectName: 'PICTURE',
          selectionAdorned: false,  // no selection handle when selected
          resizable: true, resizeObjectName: 'PICTURE',  // user can resize the Shape
          rotatable: true, rotateObjectName: 'PICTURE',  // rotate the Shape without rotating the label
          // don't re-layout when node changes size
          layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
        },
        $(go.Picture,
          {
            name: 'PICTURE',  // named so that the above properties can refer to this GraphObject
            width: 80, height: 80, imageStretch: go.GraphObject.Uniform
          },
          new go.Binding('source', 'svg', function (svg) {
            return imgUrl + svg + '.svg';
          }).makeTwoWay(),
        ),
        $(go.Shape, 'Circle',
          {
            alignment: go.Spot.TopRight, alignmentFocus: go.Spot.TopRight,
            width: 20, height: 20, strokeWidth: 0
          },
          new go.Binding('fill', 'status', function (s) {
            let color = '#9d9d9d';
            if (s == '1') {
              color = '#00cc00';
            } else if (s == '0') {
              color = '#ee0000';
            }
            return color;
          })
        ),
        makePort('T', go.Spot.Top, go.Spot.TopSide, true, true),
        makePort('L', go.Spot.Left, go.Spot.LeftSide, true, true),
        makePort('R', go.Spot.Right, go.Spot.RightSide, true, true),
        makePort('B', go.Spot.Bottom, go.Spot.BottomSide, true, true),
      )
    );

    self.diagram.toolManager.hoverDelay = 300;  // 300 milliseconds

    function spotConverter(dir) {
      if (dir === 'L') {
        return go.Spot.LeftSide;
      }
      if (dir === 'R') {
        return go.Spot.RightSide;
      }
      if (dir === 'T') {
        return go.Spot.TopSide;
      }
      if (dir === 'B') {
        return go.Spot.BottomSide;
      }
    }

    self.diagram.linkTemplate =
      $(go.Link, {
          toShortLength: -2,
          fromShortLength: -2,
          layerName: 'Background',
          routing: go.Link.Orthogonal, //直角
          corner: 15,
        },
        $(go.Shape, {isPanelMain: true, stroke: '#41BFEC'/* blue*/, strokeWidth: 10},
          new go.Binding('stroke', 'color')),
        $(go.Shape, {isPanelMain: true, stroke: 'white', strokeWidth: 3, name: 'PIPE', strokeDashArray: [20, 40]})
      );

    // temporary links used by LinkingTool and RelinkingTool are also orthogonal:

    self.diagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    self.diagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
  }

  //动画循环
  loop() {
    this.stopLoop();
    var self = this;
    var diagram = self.diagram;
    self.timeOutId = setTimeout(function () {
      var oldskips = diagram.skipsUndoManager;
      diagram.skipsUndoManager = true;
      diagram.links.each(function (link) {
        var shape = link.findObject('PIPE');
        var off = shape.strokeDashOffset - 3;
        // animate (move) the stroke dash
        shape.strokeDashOffset = (off <= 0) ? 60 : off;
        // animte (strobe) the opacity:
        if (self.down) {
          self.opacity = self.opacity - 0.01;
        } else {
          self.opacity = self.opacity + 0.003;
        }
        if (self.opacity <= 0) {
          self.down = !self.down;
          self.opacity = 0;
        }
        if (self.opacity > 1) {
          self.down = !self.down;
          self.opacity = 1;
        }
        shape.opacity = self.opacity;
      });
      diagram.skipsUndoManager = oldskips;
      self.loop();
    }, 60);
  }

  //停止动画循环
  stopLoop() {
    clearTimeout(this.timeOutId);
  }

  ngOnInit() {
    this.getWorkSpc();
    this.initDiagram();
    this.diagram.commandHandler.increaseZoom(0.5);
  }

}
