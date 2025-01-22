local data = {
    eat = 0,
    water = 0,
}
local isHudVisible = true
local isDragging = false

RegisterCommand("huddisplay", function()
    isHudVisible = not isHudVisible
    if isHudVisible then
        SendNUIMessage({ action = "showHUD" })
    else
        SendNUIMessage({ action = "hideHUD" })
    end
end, false)

RegisterCommand("edithud", function()
    isDragging = not isDragging
    
    if isDragging then
        SetNuiFocus(true, true)
        SendNUIMessage({ action = "enableDragging" })
    else
        SetNuiFocus(false, false)
        SendNUIMessage({ action = "disableDragging" })
    end
end, false)

RegisterCommand("resethud", function()
    SendNUIMessage({ action = "resetPositions" })
end, false)

RegisterNUICallback('closeEdit', function(data, cb)
    isDragging = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = "disableDragging" })
    cb('ok')
end)

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

        if isHudVisible then
            SendNUIMessage({
                action = "setdata",
                health = GetEntityHealth(PlayerPedId()),
                shield = GetPedArmour(PlayerPedId()),
                eat = data.eat,
                water = data.water,
            })
        end

        Wait(500)
    end
end)