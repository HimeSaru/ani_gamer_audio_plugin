
(function (){

    function GainController(mPlayer){
        var root = document.createElement("div");
        root.id = "gain_controller";
        root.className = "vjs-playback-rate vjs-menu-button vjs-menu-button-popup vjs-control vjs-button";

        var textContainer = document.createElement("div");
        textContainer.className = "vjs-playback-rate-value";
        root.appendChild(textContainer);

        var textTitle = document.createElement("div");
        textTitle.style.fontSize = "10px";
        textTitle.style.position = "absolute";
        textTitle.style.top = "-2px"
        textTitle.style.width = "42px";
        textTitle.innerText = "Gain";
        textContainer.appendChild(textTitle);

        var textValue = document.createElement("div");
        textValue.style.marginTop = "6px";
        textContainer.appendChild(textValue);
        
        var btn = document.createElement("button");
        btn.className = "vjs-playback-rate vjs-menu-button vjs-menu-button-popup vjs-button";
        btn.type = "button";
        btn.title = "Gain";
        root.appendChild(btn);

        var audioCtx = new AudioContext();
        var source = audioCtx.createMediaElementSource(mPlayer);
        var gainNode = audioCtx.createGain();
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        textValue.innerText = gainNode.gain.value;

        var menu = new Menu();
        menu.onGainChange = function(value){
            gainNode.gain.value = value;
            textValue.innerText = value;
        }
        root.appendChild(menu);

        return root;
    }

    function Menu(){
        root = document.createElement("div");
        root.className = "vjs-menu";
        root.style.padding = "10px";

        var row1 = document.createElement("div");
        row1.className = "vjs-menu-item vjs-danmu-opacity";
        root.appendChild(row1);
        
        var row1title = document.createElement("h3");
        row1title.innerText = "增益大小 " + 1;
        row1.appendChild(row1title);

        var row1input = document.createElement("input");
        row1input.className = "DanmuOpacityRange";
        row1input.type = "range";
        row1input.max = 10;
        row1input.min = 1;
        row1input.step = 1;
        row1input.value = 1;
        row1.appendChild(row1input);

        row1input.oninput = function(ev){
            row1title.innerText = "增益大小 " + row1input.value;
            root.onGainChange(row1input.value);
        };

        root.onGainChange = function(value){};
        return root;
    }

    function videoOnReady (mPlayer) {
        var container = document.getElementById("video-container");
        var controlBar = container.getElementsByClassName("vjs-control-bar")[0];
        controlBar.appendChild(new GainController(mPlayer));
    }

    
    function checkPlayer(){
        var mPlayer = document.getElementById("ani_video_html5_api");
        if(mPlayer){
            console.log("player ready.");
            videoOnReady(mPlayer);
        } else {
            setTimeout(function(){
                checkPlayer();
            } , 1000);
        }
    };
    
    checkPlayer();

})();


/**
 * @license Copyright 2017 - Chris West - MIT Licensed
 * Prototype to easily set the volume (actual and perceived), loudness,
 * decibels, and gain value.
 */
function MediaElementAmplifier(mediaElem) {
    this._context = new (window.AudioContext || window.webkitAudioContext);
    this._source = this._context.createMediaElementSource(this._element = mediaElem);
    this._source.connect(this._gain = this._context.createGain());
    this._gain.connect(this._context.destination);
  }
  [
    'getContext',
    'getSource',
    'getGain',
    'getElement',
    [
      'getVolume',
      function(opt_getPerceived) {
        return (opt_getPerceived ? this.getLoudness() : 1) * this._element.volume;
      }
    ],
    [
      'setVolume',
      function(value, opt_setPerceived) {
        var volume = value / (opt_setPerceived ? this.getLoudness() : 1);
        if (volume > 1) {
          this.setLoudness(this.getLoudness() * volume);
          volume = 1;
        }
        this._element.volume = volume;
      }
    ],
    [ 'getGainValue', function() { return this._gain.gain.value; } ],
    [ 'setGainValue', function(value) { this._gain.gain.value = value; } ],
    [ 'getDecibels', function() { return 20 * Math.log10(this.getGainValue()); } ],
    [ 'setDecibels', function(value) { this.setGainValue(Math.pow(10, value / 20)); } ],
    [ 'getLoudness', function() { return Math.pow(2, this.getDecibels() / 10); } ],
    [ 'setLoudness', function(value) { this.setDecibels(10 * Math.log2(value)); } ]
  ].forEach(function(name, fn) {
    if ('string' == typeof name) {
      fn = function() { return this[name.replace('get', '').toLowerCase()]; };
    }
    else {
      fn = name[1];
      name = name[0];
    }
    MediaElementAmplifier.prototype[name] = fn;
});