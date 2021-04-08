const wsRefresh = () => {
    const ws = new WebSocket('ws://localhost:12000/ws-refresh')
    ws.onopen = () => ws.send('ws-refresh: opened connection')
    ws.onclose = () => console.log("ws-refresh: session was killed")
    ws.onmessage = (message) => {
        try {
            const obj = JSON.parse(message.data);
            console.log(obj)
            switch(obj.event) {
                case "refresh":
                    switch(obj.type) {
                        case "page": location.reload(); break;
                    }
                    break;
            }
        } catch(e) {
            console.log(`message received`, message.data)
        }
    }
}