import css from "../css/codemirror.css"
import CodeMirror from "./lib/codemirror.js"
import "./addon/mode/loadmode.js"
import "./mode/meta.js"
import "./mode/python/python.js"
import "./theme/dracula.css"
import "./addon/display/fullscreen.js"
import "./addon/display/fullscreen.css"
import "./addon/edit/matchbrackets.js"
import "./addon/edit/closebrackets.js"
import "phoenix_html"
import socket from "./socket"

let channel = socket.channel("room:lobby", {});
channel.join();

var cm = CodeMirror.fromTextArea(document.getElementById('code'),{
    mode:  "javascript",
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    theme: "dracula",
    autoCloseBrackets: true,
    extraKeys: {
        "F11": function(cm) {
          cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        "Esc": function(cm) {
          if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        }
      }
});


cm.on("beforeChange",(cm, changeobj) => {
    console.log(changeobj);
        if(changeobj.origin!=undefined){
        channel.push('shout',{
            changeobj: changeobj
        });
    }
})
channel.on('shout', function(payload){
    console.log(payload.changeobj);


})


