"use strict";

function rule(t, e) {
  return !!([0, 1, 2, 3, 4, 5, 6].includes(t) && (e %= 180, e < 0 && (e += 180), e >= 0 && e <= 65 || e >= 115 && e <= 180))
}

function throttle(t, e) {
  var i = null;
  return function(r) {
    var n = +new Date;
    if (!(null != i && n - i <= e)) return i = n, t.apply(this, [r])
  }
}

function segmentsIntr(t, e, i, r) {
  var n = (t.x - i.x) * (e.y - i.y) - (t.y - i.y) * (e.x - i.x),
    s = (t.x - r.x) * (e.y - r.y) - (t.y - r.y) * (e.x - r.x);
  if (n * s >= 0) return !1;
  var a = (i.x - t.x) * (r.y - t.y) - (i.y - t.y) * (r.x - t.x),
    o = a + n - s;
  return !(a * o >= 0)
}

function stopUnusual(t, e, i, r) {
  var n = 1e-4;
  return Math.abs(t) <= n && Math.abs(e) <= n
}
var GAME_CANVAS_ID = "waterfulGameCanvas",
  Waterful = function() {};
Waterful.prototype.preload = function(t) {
  var e = this._queue = new createjs.LoadQueue,
    i = [{
      id: "ring_red",
      src: "../images/ring_red_3d4cdb2d.png"
    }, {
      id: "ring_yellow",
      src: "../images/ring_yellow_57a7c690.png"
    }, {
      id: "ring_green",
      src: "../images/ring_green_e1def943.png"
    }, {
      id: "bubble",
      src: "../images/bubble_a40ddd0e.png"
    }, {
      id: "flashAnim",
      src: "../images/flashAnim_d1757ace.png"
    }, {
      id: "magnetAnim",
      src: "../images/magnetAnim_4b463a82.png"
    }, {
      id: "needle",
      src: "../images/needle_4f68f7d2.png"
    }],
    r = [{
      id: "bingo",
      src: "../images/sounds/bingo_96dc9c57.mp3"
    }];
  i = i.concat(r), e.loadManifest(i), createjs.Sound.initializeDefaultPlugins(), createjs.Sound.alternateExtensions = ["mp3"], createjs.Sound.registerSounds(r), e.addEventListener("progress", function(e) {
    t(e)
  }.bind(this))
};
Waterful.prototype.init = function(t) {
  this._options = t,
  this.enlarging = !1,
  this.magneting = !1,
  this.addForceLeft = !1,
  this.addForceRight = !1,
  this._score = {
    left: t.score.left || [],
    right: t.score.right || []
  };
  Object.defineProperty(this._score, "total", {
    get: function() {
      return this.left.length + this.right.length
    }
  });
  this._idleBubbles = {
    left: [],
    right: []
  };
  this.totalRings = this._score.total + t.red + t.yellow + t.green;
  this._mute = !1;
  this.initStage();
  this.initRings(t);
  this.eventBinding();
};
Waterful.prototype.initStage = function() {
  function createNeedle(t, e) { //针
    var i = new createjs.SpriteSheet({
        images: [t._queue.getResult("needle")],
        frames: {
          width: 84,
          height: 270
        }
      }),
      r = new createjs.Sprite(i);
    return r.x = e, r.y = 242, r
  }

  function createFlashAnim(t, e) { //圈中针，闪光动画
    var i = new createjs.SpriteSheet({
        images: [t._queue.getResult("flashAnim")],
        frames: {
          width: 332,
          height: 168
        },
        animations: {
          run: {
            frames: [0, 1, 2, 3, 4],
            speed: .2
          }
        }
      }),
      r = new createjs.Sprite(i);
    return r.x = e, r.y = 174, r.on("animationend", function() {
      t._stage.removeChild(this)//TODO
    }), r
  }

  function createMagnetAnim(t, e) { //磁铁动画
    var i = new createjs.SpriteSheet({
        images: [t._queue.getResult("magnetAnim")],
        frames: {
          width: 118,
          height: 118
        },
        animations: {
          run: {
            frames: [0, 1, 2, 3, 4, 5],
            speed: .8
          }
        }
      }),
      r = new createjs.Sprite(i);
    return r.x = e, r.y = 196, r
  }
  var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    o = this._engine = Engine.create();
  o.world.gravity.y = .2;
  var canvasW = 660,
    canvasH = 570,
    g = 29,
    c = 26,
    l = 2 * (g - c);
  World.add(o.world, [Bodies.rectangle(canvasW / 2, 0, canvasW, l, {
    isStatic: !0
  }), Bodies.rectangle(canvasW / 2, canvasH, canvasW, l, {
    isStatic: !0
  }), Bodies.rectangle(0, canvasH / 2, l, canvasH, {
    isStatic: !0
  }), Bodies.rectangle(canvasW, canvasH / 2, l, canvasH, {
    isStatic: !0
  }), Bodies.rectangle(194, 317, 2, 144, {
    isStatic: !0
  }), Bodies.rectangle(217, 317, 2, 144, {
    isStatic: !0
  }), Bodies.rectangle(443, 318, 2, 144, {
    isStatic: !0
  }), Bodies.rectangle(466, 318, 2, 144, {
    isStatic: !0
  }), Bodies.circle(206, 420, 34, {
    isStatic: !0
  }), Bodies.circle(455, 420, 34, {
    isStatic: !0
  }), Bodies.rectangle(206, 477, 21, 50, {
    isStatic: !0
  }), Bodies.rectangle(455, 477, 21, 50, {
    isStatic: !0
  }), Bodies.rectangle(206, 246, 21, 2, {
    isStatic: !0,
    friction: 0
  }), Bodies.rectangle(455, 246, 21, 2, {
    isStatic: !0,
    friction: 0
  })]), Engine.run(o), Events.on(this._engine, "beforeUpdate", function(t) {
    if (this.addForceLeft || this.addForceRight) {
      if (this.addForceLeft) {
        var e = 1;
        this.addForceLeft = !1
      }
      if (this.addForceRight) {
        var e = -1;
        this.addForceRight = !1
      }
      this._rings.forEach(function(ring) {
        if (ring.active) {
          var x = ring.body.position.x,
            y = ring.body.position.y;
          Matter.Body.applyForce(ring.body, { //左右水花产生力量
            x: x,
            y: y
          }, {
            x: .02 * e,
            y: -.03
          });
          Matter.Body.setAngularVelocity(ring.body, e * Math.PI / 24);
        }
      })
    }
  }.bind(this)),
  this._stage = new createjs.Stage(GAME_CANVAS_ID),
  this._needles = {};
  var d = this._needles.left = createNeedle(this, 164),
    _ = this._needles.right = createNeedle(this, 413);
  this._stage.addChild(d, _), this._flashAnim = {
    left: createFlashAnim(this, 38),
    right: createFlashAnim(this, 287)
  }, this._magnetAnim = {
    left: createMagnetAnim(this, 144),
    right: createMagnetAnim(this, 393)
  }
};
 Waterful.prototype.initRings = function(t) {
  this._rings = [];
  this._staticRings = [];
  this._score.left.forEach(function(t, e) {
   this.addStaticRing(t, e, "left")
  }.bind(this));
  this._score.right.forEach(function(t, e) {
   this.addStaticRing(t, e, "right")
  }.bind(this));
  this.addRing("ring_red", t.red);
  this.addRing("ring_yellow", t.yellow);
  this.addRing("ring_green", t.green);
  if (t.priceRing && this._rings[0]) {
    var e = this._rings[0];
    Matter.Body.setPosition(e.body, {
      x: 206,
      y: 216
    });
    e.active = !1;
  }
  this._stage.update();
};
Waterful.prototype.addStaticRing = function(t, e, i) {
  var r = new createjs.SpriteSheet({
      images: [waterful._queue.getResult("ring_" + t)],
      frames: {
        width: 62,
        height: 62
      }
    }),
    n = new createjs.Sprite(r),
    s = n.getBounds();
  n.regX = s.width / 2,
  n.regY = s.height / 2,
  n.x = "left" === i ? 206 : 455,
  n.y = 380 - 14 * e,
  n.gotoAndStop(0),
  this._stage.addChild(n),
  this._staticRings.push(n)
};
Waterful.prototype.addRing = function(type, amount) {
  function i() {
    var t = 580 * Math.random() + 40;
    return t > 140 && t < 270 || t > 380 && t < 530 ? i() : t
  }
  for (var r = 0, n = []; r < amount; r++) {
    var x = i(),
        y = 400 * Math.random() + 50,
        o = new Ring(x, y, 26, type, this);
    this._rings.push(o);
    this._stage.addChild(o.texture);
    n.push(o.body);
  }
  Matter.World.add(this._engine.world, n);
};
var Ring = function(x, y, radius, type, env) {
  this.active = !0;
  this.color = type.replace("ring_", "");
  var s = new createjs.SpriteSheet({
    images: [env._queue.getResult(type)],
    frames: {
      width: 62,
      height: 62
    },
    animations: {
      normal: {
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
        speed: .3
      },
      prepare: {
        frames: [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0],
        speed: .1
      }
    }
  });
  this.texture = new createjs.Sprite(s, "normal");
  var a = this.texture.getBounds();
  this.texture.regX = a.width / 2,
  this.texture.regY = a.height / 2,
  this.texture.stop(),
  this.texture.x = x,
  this.texture.y = y,
  this.texture.on("animationend", function(t) {//控制圈圈掉落到不同的高度，角度和幅度调整
    var e = t.currentTarget;
    e.y < 400 ? t.target.gotoAndPlay("prepare") : t.target.gotoAndPlay("normal")
  });
  this.body = Matter.Bodies.circle(this.texture.x, this.texture.y, radius, {
    frictionAir: .02,
    restitution: .15
  });
};
Ring.prototype.update = function(t) {
  var texture = this.texture,
    body = this.body,
    x = texture.x,
    y = texture.y,
    rotation = texture.rotation,
    a = t.enlarging ? 24 : 16,// 内环半径
    startPoint = { //根据旋转角度算出内环水平直径的开始和结束坐标
      x: x - a * Math.cos(rotation * (Math.PI / 180)),
      y: y - a * Math.sin(rotation * (Math.PI / 180))
    },
    endPoint = { //根据旋转角度算出内环水平直径的开始和结束坐标
      x: x + a * Math.cos(-rotation * (Math.PI / 180)),
      y: y + a * Math.sin(rotation * (Math.PI / 180))
    },
    u = { //左侧探测线段的两点
      x: 206,
      y: 216
    },
    g = { //左侧探测线段的两点
      x: 206,
      y: 400
    },
    c = { //右侧探测线段的两点
      x: 455,
      y: 216
    },
    l = { //右侧探测线段的两点
      x: 455,
      y: 400
    };
  if (segmentsIntr(startPoint, endPoint, u, g)) { //内环直径与 mn 或 uv 相交，证明进针成功
    if (this.afterCollision(t, "left")) return; //进针动画播放
  } else if (segmentsIntr(startPoint, endPoint, c, l) && this.afterCollision(t, "right")) return;
  var d = Math.round(texture.x),
    _ = Math.round(body.position.x),
    f = Math.round(texture.y),
    p = Math.round(body.position.y);
  if (d !== _ || f !== p) { //保证createjs产生的动画和metter重力系统产生的动画频率一致
    texture.paused && texture.play(), texture.rotation = 180 * body.angle / Math.PI;
  }else if (!texture.paused && texture.stop(), stopUnusual(body.velocity.x, body.velocity.y, d, f)) {// 圈圈静止于针顶部，添加横向作用力，助其掉落
    var m = 1;
    (d < 206 || d > 400 && d < 455) && (m = -1), Matter.Body.applyForce(body, {
      x: body.position.x,
      y: body.position.y
    }, {
      x: .005 * m,
      y: 0
    })
  }
  texture.x = body.position.x;
  texture.y = body.position.y;
};
Ring.prototype.afterCollision = function(t, direction) { //圈中后，进针处理
  var i = this.texture.currentFrame,
    r = this.texture.rotation;
  if (!rule(i, r) || t._score[direction].length > 8 || this.body.velocity.y <= 0) return !1; //不符合进针条件
  this.texture.scaleX = 1, this.texture.scaleY = 1;
  var n = t._score[direction].length;
  return createjs.Tween.get(this.texture).to({
    y: 380 - 14 * n
  }, (380 - 14 * n) / .21).call(function() {
    t._staticRings.push(this)
  }),
  Matter.World.remove(t._engine.world, this.body),
  this.body = null,
  this.active = !1,
  this.update = function() {
    var t = this.texture,
      e = t.currentFrame;
    //微调圈进针后的动画和位置
    0 === e ? t.gotoAndStop(0) : this.frameCounter || (this.frameCounter = 5, t.gotoAndStop(--e)), --this.frameCounter, t.x < 200 && ++t.x, t.x > 213 && t.x < 300 && --t.x, t.x > 462 && --t.x, t.x > 400 && t.x < 448 && ++t.x;
    var i = Math.round(t.rotation) % 180;
    i < 0 && (i += 180), i > 0 && i <= 90 ? t.rotation = i - 1 : i > 90 && i < 180 ? t.rotation = i + 1 : 0 === e && (this.update = function() {})
  },
  t.score(direction, this.color),
  !t._mute && createjs.Sound.play("bingo", {
    interrupt: createjs.Sound.INTERRUPT_ANY
  }), !0
};
Waterful.prototype.eventBinding = function() {
  document.querySelector(".waterful_ctrls_btn.type_left").addEventListener("touchstart", function(t) {
    t.preventDefault(), t.target.classList.add("active"), this.addForceLeft = !0;
    var e = this.getBubbleLeft();
    e && (this._stage.addChild(e), e.gotoAndPlay("run"))
  }.bind(this));
  document.querySelector(".waterful_ctrls_btn.type_right").addEventListener("touchstart", function(t) {
    t.preventDefault(), t.target.classList.add("active"), this.addForceRight = !0;
    var e = this.getBubbleRight(this);
    e && (e && this._stage.addChild(e), e.gotoAndPlay("run"))
  }.bind(this));
  document.querySelector(".waterful_ctrls_btn.type_left").addEventListener("touchend", function(t) {
    t.target.classList.remove("active")
  });
  document.querySelector(".waterful_ctrls_btn.type_right").addEventListener("touchend", function(t) {
    t.target.classList.remove("active")
  });
  document.querySelector(".waterful_music").addEventListener("click", function() {
    this.toggleMute()
  }.bind(this));
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", function(t) {
    if (!t.paused) {
      for (var e = 0; e < this._rings.length; e++) this._rings[e].update(this);
      if (this.gamma)
        for (var e = 0; e < this._staticRings.length; e++) {
          if (this.gamma < 0) {
            var i = this._staticRings[e].x - .1;
            i < 200 && (i = 200), i > 400 && i < 448 && (i = 448)
          } else if (this.gamma > 0) {
            var i = this._staticRings[e].x + .1;
            i > 213 && i < 300 && (i = 213), i > 462 && (i = 462)
          }
          this._staticRings[e].x = i
        }
      this._stage.update(t)
    }
  }.bind(this));
  this.deviceorientationCb = function(t) {
    var e = t.gamma;
    this.gamma = e, e < -70 && (e = -70), e > 70 && (e = 70), this._engine.world.gravity.x = t.gamma / 70 * .4
  }.bind(this);
  window.addEventListener("deviceorientation", this.deviceorientationCb, !1)
};
Waterful.prototype.getBubbleLeft = throttle(function() { //左边水泡
  if (this._idleBubbles.left.length) return this._idleBubbles.left.shift();
  var t = new createjs.Sprite(new createjs.SpriteSheet({
    images: [this._queue.getResult("bubble")],
    frames: {
      width: 320,
      height: 480
    },
    animations: {
      run: [0, 14, null, .3]
    }
  }));
  return t.x = 0, t.y = 90, t.on("animationend", function() {
    this._stage.removeChild(t), this._idleBubbles.left.push(t)
  }.bind(this)), t
}, 300);
Waterful.prototype.getBubbleRight = throttle(function() { //右边水泡
  if (this._idleBubbles.right.length) return this._idleBubbles.right.shift();
  var t = new createjs.Sprite(new createjs.SpriteSheet({
    images: [this._queue.getResult("bubble")],
    frames: {
      width: 320,
      height: 480
    },
    animations: {
      run: [0, 14, null, .3]
    }
  }));
  return t.x = 660, t.y = 190, t.scaleX = -1, t.on("animationend", function() {
    this._stage.removeChild(t), this._idleBubbles.right.push(t)
  }.bind(this)), t
}, 300);
Waterful.prototype.score = function(t, e) {
  "left" === t ? this._score.left.push(e) : "right" === t && this._score.right.push(e), this._stage.addChild(this._flashAnim[t]), this._flashAnim[t].gotoAndPlay("run");
  var i = this._options;
  i.callbacks.score(this._score), this._score.total === this.totalRings && i.callbacks.end(this._score)
};
Waterful.prototype.toggleMute = function() {
  document.querySelector(".waterful_music").classList.toggle("type_mute"), this._mute = !this._mute
};
Waterful.prototype.restart = function(t) {
  this._score = {
    left: [],
    right: []
  },
  this.enlarging = !1,
  this.magneting = !1,
  this.addForceLeft = !1,
  this.addForceRight = !1,
  this._rings.forEach(function(t) {
    this._stage.removeChild(t.texture), t.body && Matter.World.remove(this._engine.world, t.body)
  }.bind(this)),
  this._staticRings.forEach(function(t) {
    this._stage.removeChild(t)
  }.bind(this)),
  this.initRings(t);
};
Waterful.prototype.pause = function() {
  createjs.Ticker.pause = !0;
  for (var t = 0; t < this._rings.length; t++) {
    var e = this._rings[t].body;
    e && Matter.Sleeping.set(e, !0)
  }
  window.removeEventListener("deviceorientation", this.deviceorientationCb)
};
Waterful.prototype.resume = function() {
  createjs.Ticker.pause = !1;
  for (var t = 0; t < this._rings.length; t++) {
    var e = this._rings[t].body;
    e && Matter.Sleeping.set(e, !1)
  }
  window.addEventListener("deviceorientation", this.deviceorientationCb, !1)
};
Waterful.prototype.enlarge = function() {
  if (!this.enlarging && !this.magneting) {
    this.enlarging = !0;
    var t = document.querySelector(".waterful_skills_btn_enlarge");
    t.classList.add("anim_countdown");
    for (var e = 0, i = this._rings.length; e < i; e++) {
      var r = this._rings[e];
      r.active && (r.texture.scaleX = 1.5, r.texture.scaleY = 1.5)
    }
    var n = this;
    setTimeout(function() {
      t.classList.remove("anim_countdown"), n.enlarging = !1;
      for (var e = 0, i = n._rings.length; e < i; e++) {
        var r = n._rings[e];
        r.active && (r.texture.scaleX = 1, r.texture.scaleY = 1)
      }
    }, 12100)
  }
};
Waterful.prototype.magnet = function() {
  if (!this.magneting && !this.enlarging) {
    var t = this._score.left.length,
      e = this._score.right.length;
    if (!(t >= 9 && e >= 9)) {
      this.magneting = !0,
      this._stage.addChild(this._magnetAnim.left, this._magnetAnim.right),
      this._magnetAnim.left.gotoAndPlay("run"),
      this._magnetAnim.right.gotoAndPlay("run"),
      "vibrate" in navigator && navigator.vibrate(1300);
      var i = this._rings.slice(0).sort(function(t, e) {
        return t.texture.y < e.texture.y ? 1 : t.texture.y > e.texture.y ? -1 : 0
      });
      i = i.filter(function(t) {
        return t.active
      }),
      i.splice(2);
      var r = [];
      t < 9 ? (r.push(206), e < 9 && r.push(454)) : e < 9 && r.push(454), r.forEach(function(t, e) {
        var n = i[e],
          s = this;
        return n ? (Matter.World.remove(this._engine.world, n.body), n.body = null, n.active = !1, n.update = function() {}, n.texture.gotoAndStop(n.texture.currentFrame), void createjs.Tween.get(n.texture).to({
          alpha: 0
        }, 300).to({
          alpha: 1
        }, 300).to({
          alpha: 0
        }, 200).to({
          alpha: 1
        }, 200).to({
          alpha: 0
        }, 100).to({
          alpha: 1
        }, 100).to({
          alpha: 0
        }, 50).to({
          alpha: 1
        }, 50).call(function() {
          this.gotoAndStop(0), this.rotation = 0, this.x = r[e], this.y = 240, this.scaleX = 1, this.scaleY = 1;
          var t = "";
          t = 206 === r[e] ? "left" : "right", s._stage.removeChild(s._magnetAnim.left, s._magnetAnim.right);
          var i = s._score[t].length;
          createjs.Tween.get(this).to({
            y: 380 - 14 * i
          }, (380 - 14 * i) / .21), s.score(t, n.color), !s._mute && createjs.Sound.play("bingo", {
            interrupt: createjs.Sound.INTERRUPT_ANY
          }), s.magneting = !1
        })) : void(this.magneting = !1)
      }.bind(this))
    }
  }
};
