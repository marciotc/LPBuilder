
window.modal = {
    minimum: {
        title: 14,
        x: 0,
        y: 20,
        w: 220,
        h: 170
    },
    timers:{
        resize: null,
        expand: null,
    },
    state: {
        "preview-modal": {
            title: 'Web',
            coords:{
                x: 0,
                y: 20,
                w: window.innerWidth - bounds.sidebar - 386,
                h: 600
            }
        },
        "mobile-modal": {
            title: 'Mobile',
            locked:true,
            coords:{
                x: window.innerWidth - 375,
                y: 20,
                w: 375,
                h: 812
            }
        },
        "code-modal": {
            title: 'Code',
            coords:{
                x: 0,
                y: 621,
                w: window.innerWidth - bounds.sidebar - 386,
                h: window.innerHeight - 20 - 600
            }
        }
    },
    template: (id, coords, content="") => {
        const state = modal.state[id];
        const locked = state.locked || state.isMaximized;
        const zIndexNum = modal.zIndex.list.length-modal.zIndex.list.indexOf(id)
        return `
            <div id="${id}" draggable="true" ondragstart="modal.drag.start(event)" ondragend="modal.drag.end(event)" class="md-form ${state.isMinimized?'collapsed':''}" onclick="modal.zIndex.toFront('${id}')" style="z-index:${zIndexNum};top: ${coords.y}px;left: ${coords.x}px;min-width:${coords.w}px;min-height:${state.isMinimized? modal.minimum.title :coords.h}px">
                <header ondblclick="modal.toggle.minimize('${id}')" >
                    <div class="size-controls">
                        <div class="resizers">
                            <div class="expand left nw"></div>
                            ${locked? '':`<div class="expand right ne" draggable="true" ondragstart="modal.expand.start(event, 'ne')" ondrag="modal.expand.isDragging(event)" ondragend="modal.expand.end(event)"></div>`}
                        </div>
                    </div>
                    <div class="size-buttons">
                        <a onclick="modal.toggle.maximize('${id}')" class="maximize" title="Maximize"></a>
                        <a onclick="modal.toggle.minimize('${id}')" class="minimize" title="Minimize"></a>
                    </div>
                    <h4>${state.title}</h4>
                </header>
                <main id="${id}-content">${content}</main>
                <footer>
                    <div class="size-controls">
                        <div class="resizers">
                            ${locked? '':`<div class="expand left sw" draggable="true" ondragstart="modal.expand.start(event,'sw')" ondrag="modal.expand.isDragging(event)" ondragend="modal.expand.end(event)" ></div>`}
                            ${locked? '':`<div class="expand right se" draggable="true" ondragstart="modal.expand.start(event,'se')" ondrag="modal.expand.isDragging(event)" ondragend="modal.expand.end(event)"></div>`}
                        </div>
                    </div>
                </footer>
            </div>
        `
    },
    render: {
        calc: {
            coords: (x,y,w,h) => {
                Object.keys(modal.state).forEach((key,i) => {
                    if(!modal.state[key].locked) {
                        if(x && y && w && h) {
                            modal.state[key] = {
                                ...modal.state[key],
                                coords: {
                                    x,
                                    y,
                                    w,
                                    h
                                }
                            }
                        }
                    }
                    modal.zIndex.list.push(key)
                })
            }
        },
        draw:(calc) => {
            if(calc) modal.render.calc.coords();
            const html = [];
            Object.keys(modal.state).forEach((id) => {
                const coords = modal.state[id].isMaximized? modal.toggle.maximizeCoords : modal.state[id].coords
                const {locked} = modal.state[id];

                const height = modal.state[id].isMinimized?  modal.minimum.title: coords.h;
                if(coords.y + height > window.innerHeight - 20) {
                    let culpritY = window.innerHeight - 20 - coords.y
                    if(culpritY < modal.minimum.h || locked) {
                        coords.y = modal.state[id].y = window.innerHeight - 20 - height;
                    } else {
                        coords.h = modal.state[id].h = window.innerHeight - 20 - coords.y;
                    }
                }
                if(coords.x + coords.w > window.innerWidth - bounds.sidebar) {
                    let culpritX = window.innerWidth - bounds.sidebar - coords.x;
                    if(culpritX < modal.minimum.w || locked) {
                        coords.x = modal.state[id].x = window.innerWidth - bounds.sidebar - coords.w;
                    } else {
                        coords.w = modal.state[id].w = window.innerWidth - bounds.sidebar - coords.x;
                    }
                }
                const tpl = modal.template(id,coords);
                html.push(tpl)
            })
            document.querySelector("#workspace").innerHTML = html.join("");
        },
        expand:(cmd,x,y,w,h) => {
            const dom = document.querySelector("#expand-marker");
            dom.style.display = 'none'
            if(cmd == 'rem') return;
            dom.style.display = 'block'
            dom.style.left = x+"px"
            dom.style.top = y+"px"
            dom.style.width = w+"px"
            dom.style.height = h+"px"
        }
    },
    zIndex: {
        list: [],
        toFront: (id) => {
            const index = modal.zIndex.list.indexOf(id)
            modal.zIndex.list.unshift(modal.zIndex.list.splice(index,1)[0])
            if(!modal.drag.state.isDragging) {
                modal.zIndex.list.forEach((key,i) => {
                    document.querySelector('#'+key).style.zIndex = modal.zIndex.list.length - i;
                })
            }
        }
    },
    drag: {
        state: {},
        start: (e) => {
            if(e.currentTarget == e.target) {
                const id = e.currentTarget.id;
                modal.zIndex.toFront(id)
                e.currentTarget.style.opacity = 0.01
                modal.drag.state = {
                    id,
                    origin: {
                        originX: e.clientX,
                        originY: e.clientY
                    },
                    isDragging: true
                }
            }
        },
        end: (e) => {
            if(e.currentTarget == e.target) {
                menu.startedDocument = 4;
                const id = modal.drag.state.id;
                const {originX,originY} = modal.drag.state.origin;
                const {clientX, clientY} = e;
                let {x,y} = modal.state[id].coords;
                const newCoords = {
                    ...modal.state[id].coords,
                    x: x+(clientX-originX),
                    y: y+(clientY-originY)
                }
                if(newCoords.x < 0) newCoords.x = 0;
                if(newCoords.y < 20) newCoords.y = 20;
                modal.state[id].coords = newCoords
                
                modal.drag.state = {};
                modal.render.draw()
                e.currentTarget.style.opacity = 1;
                menu.boot();
            }
        }
    },
    expand: {
        getModal:(target) => {
            let walker = target.parentNode;
            while(!walker.classList.contains("md-form")) {
                walker = walker.parentNode;
            }
            return walker;
        },
        start: (e, from) => {
            const dom = modal.expand.getModal(e.currentTarget);
            const id = dom.id;
            modal.zIndex.toFront(id)
            
            modal.expand.state = {
                id,
                from,
                origin: {
                    originW: e.clientX,
                    originH: e.clientY
                },
                isExpanding: true
            }

        },
        isDragging: (e) => {
            const {id,from} = modal.expand.state;
            const {originW,originH} = modal.expand.state.origin;
            const {clientX, clientY} = e;
            let {x,y,w,h} = modal.state[id].coords;

            switch(from) {
                case 'se': {
                    w += clientX - originW
                    h += clientY - originH
                    break;
                }
                case 'sw': {
                    x += clientX - originW
                    h += clientY - originH
                    w -= clientX - originW
                    break;
                }
                case 'ne':{
                    y += clientY - originH
                    h -= clientY - originH
                    w += clientX - originW
                    break;
                }
            }
            let nextState = {x,y,w,h};

            document.querySelector("#expand-marker").style.display = 'none';
            Object.keys(nextState).forEach(key => {
                if(nextState[key] < modal.minimum[key]) nextState[key] = modal.minimum[key]
            });
            if(clientX>0 && clientY>0) modal.expand.state.new = nextState;
            
            return modal.render.expand("draw",x,y,w,h)
        },
        end: (e) => {
            menu.startedDocument = 4;
            const id = modal.expand.state.id;
            modal.render.expand("rem")
            modal.state[id].coords = modal.expand.state.new;
            modal.expand.state = {};
            modal.render.draw()
            menu.boot();
        }
    },
    toggle: {
        maximizeCoords: {
            x:0,
            y:20,
            w: window.innerWidth - bounds.sidebar,
            h: window.innerHeight-5
        },
        minimize: (id) => {
            modal.state[id].isMinimized = !modal.state[id].isMinimized
            delete modal.state[id].isMaximized
            modal.render.draw(false);
        },
        maximize: (id) => {
            Object.keys(modal.state)
            modal.state[id].isMaximized = !modal.state[id].isMaximized
            delete modal.state[id].isMinimized
            modal.render.draw(false);
        } 
    },
    boot:() => {
        modal.render.draw(true)
        window.addEventListener("resize", function() {
            clearInterval(modal.timers.resize)
            if(menu.startedDocument)
            modal.timers.resize = setTimeout(() => {
                modal.render.draw(true)
            },250);
        })
    },
}