let data = {
    health: 0,
    shield: 0,
    eat: 0,
    water: 0,
}
window.addEventListener("message", data => {
    let event = data.data
    if(event.action === "setdata") {
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

        if(data.health !== count.health) {
            health.style.transition = `width 400ms linear`;
            health.style.width = `${count.health}%`
            data.health = count.health
        }
        if(data.shield !== count.shield) {
            shield.style.transition = `width 400ms linear`;
            shield.style.width = `${count.shield}%`
            data.shield = count.shield
        }
        if(data.water !== count.water) {
            water.style.transition = `width 400ms linear`;
            water.style.width = `${count.water}%`
            data.water = count.water
        }
        if(data.eat !== count.eat) {
            eat.style.transition = `width 400ms linear`;
            eat.style.width = `${count.eat}%`
            data.eat = count.eat
        }
    }
})