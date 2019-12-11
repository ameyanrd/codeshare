import css from "../css/codemirror.css"
import CodeMirror from "./lib/codemirror.js"
import "./mode/javascript/javascript.js"
import "./mode/python/python.js"
import "./theme/dracula.css"
import "./addon/edit/matchbrackets.js"
import "./addon/edit/matchtags.js"
import "phoenix_html"
import socket from "./socket"

let channel = socket.channel("room:lobby", {});
channel.join();
var cm = CodeMirror.fromTextArea(document.getElementById('code'),{
    mode:  "javascript",
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    theme: "dracula"
});

cm.setOption("theme","dracula")

cm.on("beforeChange",(cm, changeobj) => {
    console.log(changeobj);
    channel.push('shout',{
        changeobj: changeobj
    });
})
channel.on('shout', function(payload){
    console.log(payload.changeobj);
})


