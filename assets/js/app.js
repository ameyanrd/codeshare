import css from "../css/codemirror.css"
import CodeMirror from "./lib/codemirror.js"
import "./mode/javascript/javascript.js"
import "./mode/python/python.js"
import "./theme/dracula.css"
import "./addon/edit/matchbrackets.js"
import "./addon/edit/matchtags.js"
import "phoenix_html"
//import socket from "./socket"
import { Presence, Socket } from "phoenix"

class OnlineUsers {
    displayUsers() {
        function renderOnlineUsers(presence) {
            let response = ""
            presence.list((user, { metas: [first, ...rest] }) => {
                let cursorColor = first["cursor_color"]
                response += `<p style="color:${cursorColor};">${user}</p>`
            })
            let userList = document.getElementById("userList")
            userList.innerHTML = response
        }
        presence.onSync(() => renderOnlineUsers(presence))
        channel.join()
    }
}
function generateColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


let user = document.getElementById("user").innerText
var userColor = generateColor()
let socket = new Socket("/socket", { params: { user: user, userColor: userColor } })
socket.connect()
let channel = socket.channel("room:lobby", {});
let presence = new Presence(channel)
const u = new OnlineUsers()
u.displayUsers()

var cm = CodeMirror.fromTextArea(document.getElementById('code'), {
    mode: "javascript",
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    theme: "dracula"
});

cm.setOption("theme", "dracula")

cm.on("beforeChange", (cm, changeobj) => {
    console.log(changeobj);
    channel.push('shout', {
        changeobj: changeobj
    });
})
channel.on('shout', function (payload) {
    console.log(payload.changeobj);
})


