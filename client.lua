local data = {
    eat = 0,
    water = 0,
}
Citizen.CreateThread(function()
    while true do
        TriggerEvent('esx_status:getStatus', 'thirst', function(status)
            if status then
                data.water = (status.val / 10000)
            end
        end)
        TriggerEvent('esx_status:getStatus', 'hunger', function(status)
            if status then
                data.eat = (status.val / 10000)
            end
        end)

        SendNUIMessage({
            action = "setdata",
            health = GetEntityHealth(PlayerPedId()),
            shield = GetPedArmour(PlayerPedId()),
            eat = data.eat,
            water = data.water,
        })

        Wait(500)
    end
end)