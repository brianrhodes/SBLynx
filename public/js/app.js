const socket = io()

const inputForm = document.querySelector('form')
const layout = document.querySelector('#layout')
const HomeName = document.querySelector('#HomeName')
const HomeScore = document.querySelector('#HomeScore')
const AwayName = document.querySelector('#AwayName')
const AwayScore = document.querySelector('#AwayScore')

document.querySelector('#send').addEventListener('click', (e) => {
    e.preventDefault()
    
    socket.emit('data', [
        {
            "layout": layout.value
        },
        {
            "team": HomeName.value,
            "score": HomeScore.value
        }, 
        {
            "team": AwayName.value,
            "score": AwayScore.value
        },
        {
            "time": ClockTime.value        }
    ])
})

document.querySelector("#StartTime").addEventListener('click', () => {
    socket.emit('startclock')
})

document.querySelector("#StopTime").addEventListener('click', () => {
    socket.emit('stopclock')
})

document.querySelector("#SetTime").addEventListener('click', () => {
    socket.emit('setclock', [
        {
            "time": ClockTime.value
        }
    ])
})
