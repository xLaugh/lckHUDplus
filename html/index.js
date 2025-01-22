let data = {
    health: 0,
    shield: 0,
    eat: 0,
    water: 0,
}

let isDraggingEnabled = false;
let positions = JSON.parse(localStorage.getItem('hudPositions')) || {};
let selectedElements = new Set();
let defaultPositions = {
    0: { x: '16vw', y: '92vh' },
    1: { x: '20vw', y: '92vh' },
    2: { x: '24vw', y: '92vh' },
    3: { x: '28vw', y: '92vh' }
};
let positionsHistory = [];
let currentHistoryIndex = -1;
const MAX_HISTORY = 50;

function initPositions() {
    const elements = document.querySelectorAll('.hud-base');
    elements.forEach((el, index) => {
        if (positions[index]) {
            el.style.left = positions[index].x;
            el.style.top = positions[index].y;
        } else {
            el.style.left = defaultPositions[index].x;
            el.style.top = defaultPositions[index].y;
        }
        
        const isActive = localStorage.getItem(`hudActive_${index}`);
        if (isActive === 'false') {
            el.classList.add('disabled');
            el.setAttribute('data-active', 'false');
        }
    });
}

window.addEventListener('load', initPositions);

function resetPositions() {
    positions = JSON.parse(JSON.stringify(defaultPositions));
    localStorage.setItem('hudPositions', JSON.stringify(positions));
    
    const elements = document.querySelectorAll('.hud-base');
    elements.forEach((el, index) => {
        el.style.left = defaultPositions[index].x;
        el.style.top = defaultPositions[index].y;
        
        el.classList.remove('disabled');
        el.setAttribute('data-active', 'true');
        localStorage.removeItem(`hudActive_${index}`);
    });
    
    saveToHistory();
}

function enableDragging() {
    document.querySelector('.edit-buttons').style.display = 'flex';
    positionsHistory = [JSON.stringify(positions)];
    currentHistoryIndex = 0;
    
    const elements = document.querySelectorAll('.hud-base');
    elements.forEach((el, index) => {
        el.classList.add('draggable');
        
        if (el.style.display === 'none') {
            el.style.display = 'block';
        }
        
        el.removeEventListener('mousedown', el.mouseDownHandler);
        
        el.mouseDownHandler = function(e) {
            if (e.target.classList.contains('toggle-button')) {
                const isActive = el.getAttribute('data-active') !== 'false';
                el.classList.toggle('disabled');
                el.setAttribute('data-active', !isActive);
                localStorage.setItem(`hudActive_${index}`, !isActive);
                return;
            }

            if (!isDraggingEnabled) return;

            if (e.shiftKey) {
                e.preventDefault();
                el.classList.toggle('selected');
                if (el.classList.contains('selected')) {
                    selectedElements.add(el);
                } else {
                    selectedElements.delete(el);
                }
                return;
            }

            if (!e.shiftKey && !el.classList.contains('selected')) {
                selectedElements.clear();
                document.querySelectorAll('.hud-base.selected').forEach(element => {
                    element.classList.remove('selected');
                });
            }

            if (!selectedElements.has(el)) {
                selectedElements.add(el);
                el.classList.add('selected');
            }

            let startX = e.clientX;
            let startY = e.clientY;
            
            let initialPositions = new Map();
            selectedElements.forEach(element => {
                initialPositions.set(element, {
                    x: parseFloat(element.style.left),
                    y: parseFloat(element.style.top)
                });
            });

            function onMouseMove(e) {
                const deltaX = (e.clientX - startX) / window.innerWidth * 100;
                const deltaY = (e.clientY - startY) / window.innerHeight * 100;

                selectedElements.forEach(element => {
                    const initial = initialPositions.get(element);
                    element.style.left = (initial.x + deltaX) + 'vw';
                    element.style.top = (initial.y + deltaY) + 'vh';
                    
                    const elementIndex = Array.from(elements).indexOf(element);
                    positions[elementIndex] = {
                        x: element.style.left,
                        y: element.style.top
                    };
                });
                
                localStorage.setItem('hudPositions', JSON.stringify(positions));
            }

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                saveToHistory();
            });
        };

        el.addEventListener('mousedown', el.mouseDownHandler);
    });
}

function disableDragging() {
    document.querySelector('.edit-buttons').style.display = 'none';
    isDraggingEnabled = false;
    selectedElements.clear();
    document.querySelectorAll('.hud-base').forEach(el => {
        el.classList.remove('draggable');
        el.classList.remove('selected');
        el.removeEventListener('mousedown', el.mouseDownHandler);
        
        if (el.getAttribute('data-active') === 'false') {
            el.style.display = 'none';
        }
    });
}

window.addEventListener("message", data => {
    let event = data.data
    if (event.action === "setdata") {
        document.querySelectorAll('.hud-base').forEach((el, index) => {
            if (el.getAttribute('data-active') === 'false' && !isDraggingEnabled) {
                el.style.display = 'none';
            }
            if (el.getAttribute('data-active') === 'false') {
                el.querySelector('.inner-bar').style.width = '0%';
            }
        });
        let health = document.getElementById("health")
        let shield = document.getElementById("shield")
        let water = document.getElementById("water")
        let eat = document.getElementById("eat")
        let count = {
            health: event.health - 100,
            shield: event.shield,
            eat: event.eat,
            water: event.water,
        }

        if (count.health < 0) count.health = 0
        if (count.shield < 0) count.shield = 0
        if (count.water < 0) count.water = 0
        if (count.eat < 0) count.eat = 0

        if (data.health !== count.health) {
            health.style.transition = `width 400ms linear`;
            health.style.width = `${count.health}%`
            data.health = count.health
        }
        if (data.shield !== count.shield) {
            shield.style.transition = `width 400ms linear`;
            shield.style.width = `${count.shield}%`
            data.shield = count.shield
        }
        if (data.water !== count.water) {
            water.style.transition = `width 400ms linear`;
            water.style.width = `${count.water}%`
            data.water = count.water
        }
        if (data.eat !== count.eat) {
            eat.style.transition = `width 400ms linear`;
            eat.style.width = `${count.eat}%`
            data.eat = count.eat
        }
    } else if (event.action === "showHUD") {
        document.querySelector(".bar").style.display = "flex"
    } else if (event.action === "hideHUD") {
        document.querySelector(".bar").style.display = "none"
    } else if (event.action === "resetPositions") {
        resetPositions();
    } else if (event.action === "enableDragging") {
        isDraggingEnabled = true;
        enableDragging();
    } else if (event.action === "disableDragging") {
        disableDragging();
    }
})

function saveToHistory() {
    if (currentHistoryIndex < positionsHistory.length - 1) {
        positionsHistory = positionsHistory.slice(0, currentHistoryIndex + 1);
    }
    
    positionsHistory.push(JSON.stringify(positions));
    currentHistoryIndex++;
    
    if (positionsHistory.length > MAX_HISTORY) {
        positionsHistory.shift();
        currentHistoryIndex--;
    }
}

function undo() {
    if (currentHistoryIndex > 0) {
        currentHistoryIndex--;
        positions = JSON.parse(positionsHistory[currentHistoryIndex]);
        localStorage.setItem('hudPositions', JSON.stringify(positions));
        
        const elements = document.querySelectorAll('.hud-base');
        elements.forEach((el, index) => {
            if (positions[index]) {
                el.style.left = positions[index].x;
                el.style.top = positions[index].y;
            }
        });
    }
}

document.addEventListener('keydown', function(e) {
    if (isDraggingEnabled && e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('confirmButton').addEventListener('click', function() {
        fetch(`https://${GetParentResourceName()}/closeEdit`, {
            method: 'POST',
            body: JSON.stringify({ action: 'closeEdit' })
        });
    });

    document.getElementById('resetButton').addEventListener('click', function() {
        resetPositions();
    });
});