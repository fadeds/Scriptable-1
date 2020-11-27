// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: paper-plane;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '中国联通';
    this.en = 'ChinaUnicom';
    this.Run();
  }

  loginheader = {};

  fgCircleColor = Color.dynamic(new Color('#dddef3'), new Color('#fff'));
  percentColor = this.widgetColor;
  textColor1 = Color.dynamic(new Color('#333'), new Color('#fff'));
  textColor2 = this.widgetColor;

  circleColor1 = new Color('#ffbb73');
  circleColor2 = new Color('#ff0029');
  circleColor3 = new Color('#00b800');
  circleColor4 = new Color('#8376f9');
  iconColor = new Color('#827af1');

  format = (str) => {
    return parseInt(str) > 10 ? str : `0${str}`;
  };

  date = new Date();
  arrUpdateTime = [
    this.format(this.date.getMonth() + 1),
    this.format(this.date.getDate()),
    this.format(this.date.getHours()),
    this.format(this.date.getMinutes()),
  ];

  // percent 的计算方式，剩余/总量 * 100 = 百分比| 百分比 * 3.6 ，为显示进度。
  phoneBill = {
    percent: 0,
    label: '话费剩余',
    count: 0,
    unit: '元',
    icon: 'yensign.circle',
    circleColor: this.circleColor1,
  };

  flow = {
    percent: 0,
    label: '流量剩余',
    count: 0,
    unit: 'M',
    icon: 'waveform.path.badge.minus',
    circleColor: this.circleColor2,
  };

  voice = {
    percent: 0,
    label: '语音剩余',
    count: 0,
    unit: '分钟',
    icon: 'mic',
    circleColor: this.circleColor3,
  };

  updateTime = {
    percent: 0,
    label: '更新时间',
    count: `${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`,
    unit: '',
    icon: 'clock',
    circleColor: this.circleColor4,
  };

  canvSize = 282;
  canvWidth = 20; // circle thickness
  canvRadius = 160; // circle radius
  dayRadiusOffset = 60;
  canvTextSize = 40;

  init = async () => {
    try {
      const nowHours = this.date.getHours();
      const updateHours = nowHours > 12 ? 24 : 12;
      this.updateTime.percent = Math.floor(nowHours / updateHours * 100);
      await this.getinfo();
    } catch (e) {
      console.log(e);
    }
  };

  // MB 和 GB 自动转换
  formatFlow(number) {
    const n = number / 1024;
    if (n < 1024) {
      return {count: n.toFixed(2), unit: 'M'};
    }
    return {count: (n / 1024).toFixed(2), unit: 'G'};
  }

  async getinfo() {
    const telNum = this.gettel();
    const url = {
      url: `https://m.client.10010.com/mobileService/home/queryUserInfoSeven.htm?version=iphone_c@7.0403&desmobiel=${telNum}&showType=3`,
      headers: {
        Cookie: this.loginheader.Cookie,
      },
    };
    const signinfo = await this.$request.get(url);
    if (signinfo.code === 'Y') {
      signinfo.data.dataList.forEach(item => {
        if (item.type === 'flow') {
          this.flow.count = item.number;
          this.flow.unit = item.unit;
        }
        if (item.type === 'fee') {
          this.phoneBill.count = item.number;
          this.phoneBill.unit = item.unit;
        }
        if (item.type === 'voice') {
          this.voice.count = item.number;
          this.voice.unit = item.unit;
        }
        if (item.type === 'voice') {
          this.voice.count = item.number;
          this.voice.unit = item.unit;
        }
      });
    }

  }

  gettel() {
    const reqCookie = this.loginheader.Cookie;
    let tel = '';
    if (tel === '' && reqCookie.indexOf(`u_account=`) >= 0)
      tel = reqCookie.match(/u_account=(.*?);/)[1];
    if (tel === '' && reqCookie.indexOf(`c_mobile=`) >= 0) {
      tel = reqCookie.match(/c_mobile=(.*?);/)[1];
    }
    return tel;
  }

  makeCanvas() {
    const canvas = new DrawContext();
    canvas.opaque = false;
    canvas.respectScreenScale = true;
    canvas.size = new Size(this.canvSize, this.canvSize);
    return canvas;
  }

  makeCircle(canvas, radiusOffset, degree, color) {
    let ctr = new Point(this.canvSize / 2, this.canvSize / 2);
    // Outer circle
    const bgx = ctr.x - (this.canvRadius - radiusOffset);
    const bgy = ctr.y - (this.canvRadius - radiusOffset);
    const bgd = 2 * (this.canvRadius - radiusOffset);
    const bgr = new Rect(
        bgx,
        bgy,
        bgd,
        bgd,
    );
    canvas.setStrokeColor(this.fgCircleColor);
    canvas.setLineWidth(this.canvWidth - 14);
    canvas.strokeEllipse(bgr);
    // Inner circle
    canvas.setFillColor(color);
    for (let t = 0; t < degree; t++) {
      const rect_x = ctr.x + (this.canvRadius - radiusOffset) * this.sinDeg(t) -
          this.canvWidth / 2;
      const rect_y = ctr.y - (this.canvRadius - radiusOffset) * this.cosDeg(t) -
          this.canvWidth / 2;
      const rect_r = new Rect(
          rect_x,
          rect_y,
          this.canvWidth - 4,
          this.canvWidth - 4,
      );
      canvas.fillEllipse(rect_r);
    }
  }

  drawText(txt, canvas, txtOffset, fontSize) {
    const txtRect = new Rect(
        this.canvTextSize / 2 - 20,
        txtOffset - this.canvTextSize / 2,
        this.canvSize,
        this.canvTextSize,
    );
    canvas.setTextColor(this.percentColor);
    canvas.setFont(Font.boldSystemFont(fontSize));
    canvas.setTextAlignedCenter();
    canvas.drawTextInRect(`${txt}`, txtRect);
  }

  drawPointText(txt, canvas, txtPoint, fontSize) {
    canvas.setTextColor(this.percentColor);
    canvas.setFont(Font.boldSystemFont(fontSize));
    canvas.drawText(txt, txtPoint);
  }

  sinDeg(deg) {
    return Math.sin((deg * Math.PI) / 180);
  }

  cosDeg(deg) {
    return Math.cos((deg * Math.PI) / 180);
  }

  setCircleText = (stack, data) => {
    const stackCircle = stack.addStack();
    const canvas = this.makeCanvas();
    stackCircle.size = new Size(70, 70);
    this.makeCircle(
        canvas, this.dayRadiusOffset, data.percent * 3.6, data.circleColor);

    this.drawText(data.percent, canvas, 170, 42);
    this.drawPointText(`%`, canvas, new Point(190, 150), 25);
    stackCircle.backgroundImage = canvas.getImage();

    stackCircle.setPadding(20, 0, 0, 0);
    stackCircle.addSpacer();
    const icon = SFSymbol.named(data.icon);
    const imageIcon = stackCircle.addImage(icon.image);
    imageIcon.tintColor = this.iconColor;
    imageIcon.imageSize = new Size(15, 15);
    // canvas.drawImageInRect(icon.image, new Rect(110, 80, 60, 60));
    stackCircle.addSpacer();

    stack.addSpacer(5);
    const stackDesc = stack.addStack();
    stackDesc.size = new Size(70, 60);
    stackDesc.centerAlignContent();
    stackDesc.layoutVertically();
    stackDesc.addSpacer(10);
    const textLabel = this.textFormat.defaultText;
    textLabel.size = 12;
    textLabel.color = this.textColor2;
    this.provideText(data.label, stackDesc, textLabel);
    stackDesc.addSpacer(10);

    const stackDescFooter = stackDesc.addStack();
    stackDescFooter.centerAlignContent();
    const textCount = this.textFormat.title;
    textCount.size = 16;
    textCount.color = this.textColor1;
    this.provideText(`${data.count}`, stackDescFooter, textCount);
    stackDescFooter.addSpacer(2);
    this.provideText(data.unit, stackDescFooter, textLabel);
  };

  renderSmall = async (w) => {
    w.setPadding(5, 5, 5, 5);
    const stackBody = w.addStack();
    stackBody.layoutVertically();
    const stackTop = stackBody.addStack();
    this.setCircleText(stackTop, this.phoneBill);
    const stackBottom = stackBody.addStack();
    this.setCircleText(stackBottom, this.flow);

    const stackFooter = stackBody.addStack();
    stackFooter.addSpacer();
    const text = this.textFormat.defaultText;
    text.color = new Color('#aaa');
    this.provideText(
        `更新时间：${this.arrUpdateTime[0]}-${this.arrUpdateTime[1]} ${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`,
        stackFooter,
        text,
    );
    stackFooter.addSpacer();
    return w;
  };

  renderMedium = async (w) => {
    const stackBody = w.addStack();
    stackBody.layoutVertically();
    const stackTop = stackBody.addStack();
    this.setCircleText(stackTop, this.phoneBill);
    this.setCircleText(stackTop, this.flow);
    const stackBottom = stackBody.addStack();
    this.setCircleText(stackBottom, this.voice);
    this.setCircleText(stackBottom, this.updateTime);
    return w;
  };

  renderLarge = async (w) => {
    return await this.renderMedium(w);
  };

  Run() {
    if (config.runsInApp) {
      const widgetInitConfig = {
        loginheader: 'chavy_tokenheader_10010',
      };
      this.registerAction('颜色配置', async () => {
        await this.setAlertInput(
            `${this.name}颜色配置`, '进度条颜色|底圈颜色\n图标颜色|比值颜色|值颜色', {
              step1: '进度颜色 1',
              step2: '进度颜色 2',
              step3: '进度颜色 3',
              step4: '进度颜色 4',
              inner: '底圈颜色',
              icon: '图标颜色',
              percent: '比值颜色',
              value: '值颜色',
            });
      });
      this.registerAction('账号设置', async () => {
        await this.setAlertInput(
            `${this.name}账号`, '读取 BoxJS 缓存信息', widgetInitConfig);
      });
      this.registerAction('代理缓存', async () => {
        await this.setCacheBoxJSData(widgetInitConfig);
      });
      this.registerAction('基础设置', this.setWidgetConfig);
    }
    const {loginheader, step1, step2, step3, step4, inner, icon, percent, value} = this.settings;
    this.fgCircleColor = new Color(inner) || this.fgCircleColor;
    this.textColor1 = new Color( value) || this.textColor1;
    this.circleColor1 = new Color( step1) || this.circleColor1;
    this.circleColor2 = new Color( step2) || this.circleColor2;
    this.circleColor3 = new Color( step3) || this.circleColor3;
    this.circleColor4 = new Color( step4) || this.circleColor4;
    this.iconColor = new Color( icon) || this.iconColor;
    this.percentColor = new Color( percent) || this.percentColor;

    
    this.loginheader = loginheader ? JSON.parse(loginheader) : {};
  }

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    widget.setPadding(0, 0, 0, 0);
    await this.getWidgetBackgroundImage(widget);
    if (this.widgetFamily === 'medium') {
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === 'large') {
      return await this.renderLarge(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, args.widgetParameter, false); //远程开发环境
