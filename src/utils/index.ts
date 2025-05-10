export const isValidLang = (lang: string) => /^[a-z]{2,3}(-[A-Z]{2})?$/.test(lang);
export const getTitle = {
    'en':{
        p8: {
            title: ["Top 3 Harmonies: "],
            labels: [
                "Moon Trine Venus",
                "Sun Conjunct Mars",
                "Mercury Sextile Jupiter"
            ],
            match:"Cosmic Match:",
            info_labels: [
                "Daily Signal",
                "Micro Booster",
                "Strength Line"
            ]
        },
        p9:{
            title:["Top 3 Friction Points"],
            labels:[
                "Mercury Square Mars",
                "Moon Opposite Saturn",
                "Venus Square Uranus"
            ]
        },
        p10: {
            title:["7-Day Action Plan"],
            intro:"One small step each day can <b>shift the course of a relationship.</b> Use this<br /> weekly plan to build habits that reinforce your connection,soften friction,<br /> and deepen emotional intimacy."
        },
        p11: {
            title:["Your Growth Forecast: The Year Ahead"],
        }
    },
    'uk':{
        p8: {
            title: ["Топ 3 гармонії: "],
            labels: [
                "Місяць у трині до Венери",
                "Сонце в з'єднанні з Марсом",
                "Меркурій секстиль Юпітер"
            ],
            match: "Космічний матч:",
            info_labels: [
                "Щоденний сигнал",
                "Мікро-підсилювач",
                "Лінія сили"
            ]
        },
        p9: {
            title: ["Топ-3 точки тертя"],
            labels: [
                "Меркурій у квадраті до Марса",
                "Місяць в опозиції до Сатурна",
                "Венера у квадраті до Урана"
            ]
        },
        p10: {
            title: ["7-денний план дій"],
            intro:"Один маленький крок щодня може <b>змінити хід стосунків.</b> Використовуйте цей<br /> щотижневий план, щоб сформувати звички, які зміцнюють ваш зв’язок, пом’якшують тертя<br /> та поглиблюють емоційну близькість."
        },
        p11: {
            title: ["Ваш прогноз зростання: наступний рік"],
        }
        
    }
}