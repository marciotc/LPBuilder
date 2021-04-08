
const isFullscreen = () => {
    if (document.fullscreenElement && document.fullscreenElement.nodeName == 'HTML') {
        return true;
    }
    return false;
}
window.menu = {
    startedDocument:0,
    fullScreen: false,
    items: [
        {
            title: 'Arquivo',
            menus: [
                { 
                    title: 'Novo',
                    condition: () => menu.startedDocument < 1,
                    cmd : () => {
                        menu.startedDocument = 1;
                        modal.state = {
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
                        }
                        modal.boot()
                        menu.render.draw()
                    } 
                },
                { title: 'Salvar como rascunho', condition: () => menu.startedDocument > 0},
                { title: 'separator'},
                { title: 'Publicar', condition: () => menu.startedDocument > 0 },
                { title: 'separator'},
                { 
                    title: 'Fechar', condition: () => menu.startedDocument > 0,
                    cmd: () => {
                        document.getElementById("workspace").innerHTML = ''
                        menu.startedDocument = 0;
                        menu.render.draw();
                    }
                },
            ]
        },
        {
            title: 'Ordenar',
            menus: [
                { title: 'Padrão', 
                    condition: () => menu.startedDocument > 0,
                    checked: () => menu.startedDocument == 1,
                    cmd: () => {
                        menu.startedDocument = 1;
                        modal.state = {
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
                        }
                        if(!modal.zIndex.list.length) modal.zIndex.list = Object.keys(modal.state)
                        modal.render.draw();
                        menu.render.draw();
                    }
                },
                { title: 'Web', 
                    condition: () => menu.startedDocument > 0,
                    checked: () => menu.startedDocument == 2,
                    cmd: () => {
                        menu.startedDocument = 2;
                        modal.state = {
                            "preview-modal": {
                                title: 'Web',
                                coords:{
                                    x: 0,
                                    y: 20,
                                    w: window.innerWidth - bounds.sidebar,
                                    h: 600
                                }
                            },
                            "mobile-modal": {
                                title: 'Mobile',
                                locked:true,
                                coords:{
                                    x: 0,
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
                                    w: window.innerWidth - bounds.sidebar,
                                    h: window.innerHeight - 20 - 600
                                }
                            }
                        }
                        if(!modal.zIndex.list.length) modal.zIndex.list = Object.keys(modal.state)
                        modal.zIndex.list = ["preview-modal", "code-modal","mobile-modal"]
                        modal.render.draw();
                        menu.render.draw();
                    }
                },
                { title: 'Mobile', 
                    condition: () => menu.startedDocument > 0,
                    checked: () => menu.startedDocument == 3,
                    cmd: () => {
                        menu.startedDocument = 3;
                        const w = window.innerWidth - 375 - 250;
                        modal.state = {
                            "preview-modal": {
                                title: 'Web',
                                coords:{
                                    x: 385,
                                    y: 20,
                                    w: w - 11,
                                    h: window.innerHeight - 55
                                },
                                isMinimized: true,
                            },
                            "mobile-modal": {
                                title: 'Mobile',
                                locked:true,
                                coords:{
                                    x: 0,
                                    y: 20,
                                    w: 375,
                                    h: 812
                                }
                            },
                            "code-modal": {
                                title: 'Code',
                                coords:{
                                    x: 385,
                                    y: 35,
                                    w: w - 11,
                                    h: window.innerHeight - 55
                                }
                            }
                        }
                        if(!modal.zIndex.list.length) modal.zIndex.list = Object.keys(modal.state)
                        modal.render.draw();
                        menu.render.draw();
                    }
                }
            ]
        },
        {
            title: 'Janela',
            menus: [
                {
                    title: 'Tela cheia',
                    checked: isFullscreen,
                    cmd: () => { 
                        if(!isFullscreen()) {
                            document.querySelector("html").requestFullscreen({ navigationUI: "show" })
                        } else {
                            document.exitFullscreen()
                        }
                    }
                }
            ]
        }
    ],
    dom: document.getElementById("system-menu"),
    template:{
        item:(i) => {
            const item = menu.items[i]
            const menuaction = `menu.actions.select(event)`
            const arrItem = [`<li onclick="${menuaction}" onmousedown="${menuaction}">${item.title}`]
            if(item.menus) {
                const arrSubitems = [`<ul>`]
                item.menus.forEach((each,j) => {
                    if(each.title == 'separator') {
                        arrSubitems.push(`<li class="menu-separator"></li>`)
                    } else {
                        const isEnabled = !each.condition || each.condition && each.condition();
                        const subaction = `menu.actions.execute(event,${i},${j})`
                        const kind = isEnabled? `onmouseup="${subaction}" onclick="${subaction}"`:'class="disabled"'
                        if(!each.checked) return arrSubitems.push(`<li ${kind}>${each.title}</li>`)
                        const isChecked = isEnabled && (each.checked && each.checked())
                        console.log(each,isChecked)
                        const checkedImg = menu.startedDocument>0 || each.title == 'Tela cheia'? isChecked? 'submenu-checked':'submenu-unchecked':'submenu-unchecked-disabled'
                        arrSubitems.push(`<li ${kind}><img src="/img/${checkedImg}.svg">${each.title}</li>`)
                    }
                })
                arrSubitems.push(`</ul>`);
                arrItem.push(arrSubitems.join(""))
            }
            arrItem.push('</li>')
            return arrItem.join('');
        }
    },
    actions: {
        select: (ev) => {
            menu.actions.close();
            document.getElementById('menu-placeholder').style.display = "block";
            const selected = ev.currentTarget;
            selected.querySelector("ul").style.display = 'flex';
        },
        close: (e) => {
            document.getElementById('menu-placeholder').style.display = "none";
            Array.from(document.querySelectorAll('nav ul ul')).forEach(dom => {
                dom.style.display = 'none'
            })
        },
        execute: (ev,...args) => {
            if(menu.isExecuting) return;
            const [menuIndex,itemIndex] = args;
            const item = menu.items[menuIndex].menus[itemIndex];
            const el = ev.currentTarget;
            menu.isExecuting = true;
            menu.render.blink(el,() => {
                item.cmd && item.cmd()
                menu.actions.close();
                menu.isExecuting = false;
            })
        }
    },
    render:{
        draw: () => {
            const list = ["<nav><ul>"]
            menu.items.forEach((_,i) => {
                list.push(menu.template.item(i))
            })
            const mouseaction = `menu.actions.close(event)`
            list.push(`</ul></nav><div id='menu-placeholder' onclick='${mouseaction}' mouseup="${mouseaction}"></div>`)
            menu.dom.innerHTML = list.join("")
        },
        blink:(target,callback) => {
            let blinkSwitcher = 0;
            let blinkInterval = setInterval(() => {
                target.className = blinkSwitcher?'normal':'';
                blinkSwitcher = blinkSwitcher? 0 : 1;
            },50);
            setTimeout(() => {
                clearInterval(blinkInterval)
                callback();
            },300)
        }
    },
    boot: () => {
        menu.render.draw();
    }
}

document.addEventListener("DOMContentLoaded", function() {  
    menu.boot();
    document.addEventListener('fullscreenchange', (event) => {
        menu.render.draw();
    });
})