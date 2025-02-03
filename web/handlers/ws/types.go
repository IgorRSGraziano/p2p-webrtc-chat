package ws

import (
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Message struct {
	Type    string `json:"type"`
	Payload string `json:"payload"`
}

type Peer struct {
	conn *websocket.Conn
}

var (
	peers = make(map[*websocket.Conn]*Peer)
	lock  = sync.Mutex{}
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
