package ws

import (
	"encoding/json"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func Handle(ctx *gin.Context) {
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		fmt.Println("Upgrade error:", err)
		return
	}

	handlePeer(conn)
}

func handlePeer(conn *websocket.Conn) {
	peer := &Peer{conn: conn}
	lock.Lock()
	peers[conn] = peer
	lock.Unlock()

	defer func() {
		lock.Lock()
		delete(peers, conn)
		lock.Unlock()
		conn.Close()
	}()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Read error:", err)
			return
		}

		var message Message
		if err := json.Unmarshal(msg, &message); err != nil {
			fmt.Println("Unmarshal error:", err)
			continue
		}

		signalPeers(conn, message)
	}
}

func signalPeers(sender *websocket.Conn, message Message) {
	lock.Lock()
	defer lock.Unlock()

	for conn := range peers {
		if conn != sender {
			if err := conn.WriteJSON(message); err != nil {
				fmt.Println("Write error:", err)
			}
		}
	}
}
