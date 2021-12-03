const socket = io()

const inputForm = document.querySelector('form')
const layout = document.querySelector('#layout')
const HomeName = document.querySelector('#HomeName')
const HomeColor = document.querySelector('#HomeColor')
const HomeScore = document.querySelector('#HomeScore')
const AwayName = document.querySelector('#AwayName')
const AwayColor = document.querySelector('#AwayColor')
const AwayScore = document.querySelector('#AwayScore')
const CountUp = document.querySelector('#clock_countup')
const CountDown = document.querySelector('#clock_countdown')

function DoSocketEmit(command) {
    socket.emit(command, [
        {
            "layout": layout.value
        },
        {
            "team": HomeName.value,
			"color": HomeColor.value,
            "score": HomeScore.value
        }, 
        {
            "team": AwayName.value,
			"color": AwayColor.value,
            "score": AwayScore.value
        },
        {
            "SetTime": ClockTime.value,     
            "CurrentTime": "00:00",     
            "UpDown": (CountUp.checked ? "up" : "down")
        }
    ])
}
document.querySelector('#send').addEventListener('click', (e) => {
    e.preventDefault()
    DoSocketEmit('send')
})
document.querySelector('#clear').addEventListener('click', (e) => {
    e.preventDefault()
    DoSocketEmit('clear')
})

document.querySelector('#save').addEventListener('click', (e) => {
    e.preventDefault()
    DoSocketEmit('save')
    location.reload()
})


document.querySelector("#StartTime").addEventListener('click', (e) => {
    e.preventDefault()
    DoSocketEmit('startclock')
})

document.querySelector("#StopTime").addEventListener('click', (e) => {
    e.preventDefault()
    DoSocketEmit('stopclock')
})

document.querySelector("#SetTime").addEventListener('click', (e) => {
    e.preventDefault()
    DoSocketEmit('setclock')
})
