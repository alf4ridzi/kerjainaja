package handlers

import (
	"fmt"
	"sync"

	"github.com/gin-gonic/gin"
)

type SSEClient struct {
	ctx  *gin.Context
	ch   chan string
	done chan struct{}
}

var (
	sseClients = make(map[*SSEClient]struct{})
	sseMutex   sync.Mutex
)

func HandleEventStream() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Writer.Header().Set("Content-Type", "text/event-stream")
		ctx.Writer.Header().Set("Cache-Control", "no-cache")
		ctx.Writer.Header().Set("Connection", "keep-alive")

		client := &SSEClient{
			ctx:  ctx,
			ch:   make(chan string),
			done: make(chan struct{}),
		}

		sseMutex.Lock()
		sseClients[client] = struct{}{}
		sseMutex.Unlock()

		go func() {
			<-ctx.Done()
			sseMutex.Lock()
			delete(sseClients, client)
			sseMutex.Unlock()
			close(client.done)
		}()

		for {
			select {
			case msg := <-client.ch:
				fmt.Fprint(ctx.Writer, msg)
				ctx.Writer.Flush()
			case <-client.done:
				return
			}
		}
	}
}

func BroadcastEventWithType(eventType, jsonData string) {
	sseMutex.Lock()
	defer sseMutex.Unlock()

	for client := range sseClients {
		select {
		case client.ch <- fmt.Sprintf("event: %s\ndata:%s\n\n", eventType, jsonData):
		default:
		}
	}
}
