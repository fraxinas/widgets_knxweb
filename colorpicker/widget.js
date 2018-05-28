var widgetColorPickerInput=null;
var widgetColorPickerFarbtastic=null;
jQuery(function($) {
  // Create colorpicker dialog
  $("#widget-colorpicker-dialog").dialog( { 
    title: 'Color picker',
    width: 215,
    height: 320,
    autoOpen: false,
    modal: false, //true,
    resizable: false,
    buttons: [
      {
          text: "Ok",
          click: function() {
            widgetColorPickerInput.color = widgetColorPickerFarbtastic.color;
            widgetColorPickerInput.rgb = widgetColorPickerFarbtastic.rgb;
            widgetColorPickerInput.red = Math.round(widgetColorPickerFarbtastic.rgb[0] * 255);
            widgetColorPickerInput.green = Math.round(widgetColorPickerFarbtastic.rgb[1] * 255);
            widgetColorPickerInput.blue = Math.round(widgetColorPickerFarbtastic.rgb[2] * 255);
            widgetColorPickerInput.hsl = widgetColorPickerFarbtastic.hsl;
            $(this).dialog("close"); 
          }
      },
      {
          text: "Cancel",
          click: function() { $(this).dialog("close"); }
      }
    ]
  });

  widgetColorPickerFarbtastic = $.farbtastic('#widget-colorpicker-dialog-picker');
});

function RGBWfromColorAndW(color, w) {
  rgbw = color.substr(1) + ("00" + w.toString(16)).substr(-2);
  return rgbw
}

// Open color picker
function openWidgetColorPicker(input) {
  widgetColorPickerInput=input;
  console.log("openWidgetColorPicker input=%o",input);
  widgetColorPickerFarbtastic.owner = input;
  widgetColorPickerFarbtastic.linkTo(input.updatePicker);
  $("#widget-colorpicker-dialog-color").val(input.color);
  widgetColorPickerFarbtastic.setColor(input.color);
  $("#widget-colorpicker-dialog").dialog("open");
  console.log("openWidgetColorPicker color="+input.color)
  $("#red,#green,#blue,#white").slider({
        orientation:"horizontal",
        range:"min",
        max:255,
        slide:input.sliderUpdate,
        option: {owner: input}
      });
  input.refreshHTML();
}

function hexFromRGB(r,g,b){
  var hex = [r.toString(16),g.toString(16),b.toString(16)];
  $.each(hex,function(nr,val){
    if(val.length===1){
      hex[nr]="0"+val;
    }
  });
  return hex.join("").toUpperCase();
}

function CColorPicker(conf) {
  this.isResizable=true;
  this.init(conf);

  this.color='#123456'; // #123456
  this.hsl=''; // [0.3, 0.4, 0.5]
  this.rgb = []; // rgb[0]*255 => this.red ...
  this.rgbw = 0x00000000;
  this.red=0; // 0 to 255
  this.green=0; // 0 to 255
  this.blue=0; // 0 to 255
  this.white=0;
  this.needs_commit = true;
  this.pending_rgbw = 0;

  $(this.div).click(function() {
    openWidgetColorPicker(this.owner);
  });

  this.refreshHTML();
}

CColorPicker.type='colorpicker';
UIController.registerWidget(CColorPicker);
CColorPicker.prototype = new CWidget();

// Refresh HTML from config
CColorPicker.prototype.refreshHTML = function() {
//   console.log("CColorPicker.prototype.refreshHTML");

  if (this.conf.getAttribute("border")=='true') 
    this.div.css('border', "1px solid " + this.conf.getAttribute("border-color")); 
  else
    this.div.css('border','');

  if (this.conf.getAttribute("picture")!="")
  {
    $('.picture', this.div).css('background-image', 'url(' + getImageUrl(this.conf.getAttribute("picture")) + ')');
    $('.picture', this.div).css('background-color', '');
  } else 
  {
    if (this.conf.getAttribute("color")!="") $('.picture', this.div).css('background-color', this.conf.getAttribute("color"));
    $('.picture', this.div).css('background-image', '');
  }

  console.log("CColorPicker.prototype.refreshHTML R="+this.red+" G="+this.green+" B="+this.blue+" W="+this.white+" rgb=%o", this.rgb);

  $("#red").slider("value",this.red);
  $("#green").slider("value",this.green);
  $("#blue").slider("value",this.blue);
  $("#white").slider("value",this.white);

  $("#widget-colorpicker-dialog-color").css('background-color',this.color);
  $('#widget-colorpicker-dialog-color').val(this.color)

  // pour les tests :
  if (this.color!="") $('.picture', this.div).css('background-color', this.color);
  $('.picture', this.div).css('background-image', '');

}

// Called by eibcommunicator when a feedback object value has changed
CColorPicker.prototype.updateObject = function(obj,value) {
//   console.log("CColorPicker.prototype.updateObject "+obj+ " = "+value+ " pending_rgbw="+this.pending_rgbw);
  if (!value)
    return;

  if (obj==this.conf.getAttribute("feedback-color"))
  {
    this.color = value;
  }
  if (obj==this.conf.getAttribute("feedback-RGBW"))
  {
    if (this.pending_rgbw && value != this.pending_rgbw) {
    /* !!!HACK!!! prevents delayed feedback updates from causing a toggle-loop */
//       console.log("not pending! ignore!");
      return;
    }
    this.pending_rgbw = 0;
    this.needs_commit = false;
    this.color = "#"+value.substring(0,6);
    this.white = parseInt(value.substring(6,9),16);
    this.rgbw = value;

    widgetColorPickerFarbtastic.setColor(this.color);
//     console.log("updateObject RGBW rgbw="+this.rgbw+ " color="+value+" white="+this.white);
  }
  if (obj==this.conf.getAttribute("feedback-red"))
  {
    this.red = parseFloat(value);
    this.rgb[0] = this.red / 255;
    this.color = widgetColorPickerFarbtastic.pack(this.rgb);
  }
  if (obj==this.conf.getAttribute("feedback-green"))
  {
    this.green = parseFloat(value);
    this.rgb[1] = this.green / 255;
    this.color = widgetColorPickerFarbtastic.pack(this.rgb);
  }
  if (obj==this.conf.getAttribute("feedback-blue"))
  {
    this.blue = parseFloat(value);
    this.rgb[2] = this.blue / 255;
    this.color = widgetColorPickerFarbtastic.pack(this.rgb);
  }
  if (obj==this.conf.getAttribute("feedback-HSL"))
  {
    this.hsl = value;
    widgetColorPickerFarbtastic.setHSL(this.hsl);
    this.rgb = widgetColorPickerFarbtastic.HSLToRGB(this.hsl);
    this.color = widgetColorPickerFarbtastic.pack(this.rgb);
  }
  this.rgb = widgetColorPickerFarbtastic.unpack(this.color);
  this.hsl = widgetColorPickerFarbtastic.RGBToHSL(this.rgb);
  this.red = Math.round(this.rgb[0] * 255);
  this.green = Math.round(this.rgb[1] * 255);
  this.blue = Math.round(this.rgb[2] * 255);
  this.rgbw = RGBWfromColorAndW(this.color, this.white);

  this.refreshHTML();
  this.needs_commit = true;
};

// Called by Color Slider update
CColorPicker.prototype.sliderUpdate = function (event, ui) {
  var owner = $(this).slider("option").option.owner;
  owner.needs_commit = false;
  
  owner[event.target.id] = ui.value;
//   console.log("CColorPicker.prototype.sliderUpdate NEW R="+owner.red+" G="+owner.green+" B="+owner.blue+" W="+owner.white+" rgb=%o", owner.rgb);

  var hex=hexFromRGB(owner.red,owner.green,owner.blue);
  owner.color = "#"+hex;
  owner.rgb = widgetColorPickerFarbtastic.unpack(owner.color);
  owner.rgbw = RGBWfromColorAndW(owner.color, owner.white);
  widgetColorPickerFarbtastic.setColor(owner.color);
  console.log("CColorPicker.prototype.sliderUpdate NEW  R="+owner.red+" G="+owner.green+" B="+owner.blue+" W="+owner.white+" rgb=%o", owner.rgb);
  owner.commitValues();
}

// Called by Farbtastic colorpicker update
CColorPicker.prototype.updatePicker = function(value) {

  if (!this.owner.needs_commit) {
    this.owner.needs_commit = true;
    return;
  }

//   console.log("CColorPicker.prototype.updatePicker PREVIOUS R="+this.owner.red+" G="+this.owner.green+" B="+this.owner.blue+" W="+this.owner.white+" rgb=%o", this.owner.rgb);
  this.owner.color = value;
  this.owner.rgb = widgetColorPickerFarbtastic.unpack(this.owner.color);
  this.owner.rgbw = RGBWfromColorAndW(value, this.owner.white);

  this.owner.red = Math.round(this.owner.rgb[0] * 255);
  this.owner.green = Math.round(this.owner.rgb[1] * 255);
  this.owner.blue = Math.round(this.owner.rgb[2] * 255);

  console.log("CColorPicker.prototype.updatePicker NEW R="+this.owner.red+" G="+this.owner.green+" B="+this.owner.blue+" W="+this.owner.white+" rgb=%o", this.owner.rgb);

  this.owner.commitValues();
};

CColorPicker.prototype.commitValues = function() {
  this.refreshHTML();
  
  //if (this.conf.getAttribute("picture")=="")
  //{
    if (this.color!="") $('.picture', this.div).css('background-color', this.color);
    $('.picture', this.div).css('background-image', '');
  //}

//   if (this.rgb) {
//     this.hsl = widgetColorPickerFarbtastic.RGBToHSL(this.rgb);
//   }

  if (!_editMode)
  {
    var actions = $("actionlist[id=slidestop-action]", this.conf);
    if (actions.length==0 || !actions.length) {
      var actions=this.conf.ownerDocument.createElement('actionlist');
      actions.setAttribute('id', "slidestop-action");
      this.conf.appendChild(actions);
      actions = $(actions);
    }
    if (this.conf.getAttribute("command-color")!="") {
      var action = $("action[id='" + this.conf.getAttribute("command-color") + "']", actions);
      if ( action.attr("type") == "set-value" ) {
        action.remove();
      } 
      actions.append($("<action type='set-value' id='" + this.conf.getAttribute("command-color") + "' value='" + this.color + "'></action>")[0]);
    }
    if (this.conf.getAttribute("command-red")!="") {
      var action = $("action[id='" + this.conf.getAttribute("command-red") + "']", actions);
      if ( action.attr("type") == "set-value" ) {
        action.remove();
      } 
      actions.append($("<action type='set-value' id='" + this.conf.getAttribute("command-red") + "' value='" + this.red + "'></action>")[0]);
    }
    if (this.conf.getAttribute("command-blue")!="") {
      var action = $("action[id='" + this.conf.getAttribute("command-blue") + "']", actions);
      if ( action.attr("type") == "set-value" ) {
        action.remove();
      } 
      actions.append($("<action type='set-value' id='" + this.conf.getAttribute("command-blue") + "' value='" + this.blue + "'></action>")[0]);
    }
    if (this.conf.getAttribute("command-green")!="") {
      var action = $("action[id='" + this.conf.getAttribute("command-green") + "']", actions);
      if ( action.attr("type") == "set-value" ) {
        action.remove();
      } 
      actions.append($("<action type='set-value' id='" + this.conf.getAttribute("command-green") + "' value='" + this.green + "'></action>")[0]);
    }
    if (this.conf.getAttribute("command-RGBW")!="") {
      console.log("commitValues RGBW %o", this.rgbw);
      var action = $("action[id='" + this.conf.getAttribute("command-RGBW") + "']", actions);
      if ( action.attr("type") == "set-value" ) {
        action.remove();
      } 
      actions.append($("<action type='set-value' id='" + this.conf.getAttribute("command-RGBW") + "' value='" + this.rgbw + "'></action>")[0]);
    }
    /* TODO  a dupliquer pour les autres commadn-xxx */ 
    /*actions.append($("<action type='set-value' id='" + this.conf.getAttribute("command-color") + "' value='" + this.color + "'></action>")[0]);
    actions.append($("<action type='set-value' id='" + this.conf.getAttribute("command-red") + "' value='" + this.red + "'></action>")[0]);
    actions.append($("<action type='set-value' id='" + this.conf.getAttribute("command-blue") + "' value='" + this.blue + "'></action>")[0]);
    actions.append($("<action type='set-value' id='" + this.conf.getAttribute("command-green") + "' value='" + this.green + "'></action>")[0]);*/
    if (actions.length>0) {
      console.log("CColorPicker.prototype.commitValues execute");
      EIBCommunicator.executeActionList(actions);
      this.pending_rgbw = this.rgbw; /* !!!HACK!!! */
    }
  }
};
