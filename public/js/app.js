const socket = io()

const inputForm = document.querySelector('form')
//const sport = document.querySelector('#sport')
const HomeName = document.querySelector('#HomeName')
const HomeColor = document.querySelector('#HomeColor')
const HomeScore = document.querySelector('#HomeScore')
const AwayName = document.querySelector('#AwayName')
const AwayColor = document.querySelector('#AwayColor')
const AwayScore = document.querySelector('#AwayScore')
const CountUp = document.querySelector('#clock_countup')
const CountDown = document.querySelector('#clock_countdown')
const SetPeriod = document.querySelector('#SetPeriod')

const Football = document.querySelector('#sport_football')
const Soccer = document.querySelector('#sport_soccer')
const Basketball = document.querySelector('#sport_basketball')
const XC = document.querySelector('#sport_xc')

const Period1 = document.querySelector('#period_one')
const Period2 = document.querySelector('#period_two')
const Period3 = document.querySelector('#period_three')
const Period4 = document.querySelector('#period_four')

function DoSocketEmit(command) {
    socket.emit(command, [
        {
            //"sport": sport.value
            "sport": (Football.checked ? "Football" : Basketball.checked ? "Basketball" : Soccer.checked ? "Soccer" : XC.checked ? "XC" : "unknown")
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
            "UpDown": (CountUp.checked ? "up" : CountDown.checked ? "down" : "unknown"),
            "SetPeriod": (Period1.checked ? "Q1" : Period2.checked ? "Q2" : Period3.checked ? "Q3" : "Q4")
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
document.querySelector("#Period").addEventListener('click', (e) => {
    e.preventDefault()
    DoSocketEmit('setperiod')
})
