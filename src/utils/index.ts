export const isValidLang = (lang: string) => /^[a-z]{2,3}(-[A-Z]{2})?$/.test(lang);
export const getTitle = {
    'en':{
        tit:["Key Aspects Overview for", "and"],
        ks:"Key Strengths",
        pc:"Potential Challenges",
        br:"Balance & Recommendations",
        tk:"Key Takeaway:",
        p9:{
            title:["Detailed Planetary Interactions"]
        },
        p10: {
            title:["Detailed Planetary Interactions"]
        },
        p11: {
            title:["Practical Recommendations and Conclusions"],
            bond:"Practical Steps to Strengthen Your Bond",
            overall:"Overall Summary"
        }
    },
    'uk':{
        tit: ["Огляд ключових аспектів для", "та"],
        ks: "Ключові сильні сторони",
        pc: "Можливі виклики",
        br: "Баланс та Рекомендації",
        tk: "Ключовий висновок:",
        p9: {
            title: ["Детальні планетарні взаємодії"]
        },
        p10: {
            title: ["Детальні планетарні взаємодії"]
        },
        p11: {
            title: ["Практичні рекомендації та висновки"],
            bond: "Практичні кроки для зміцнення вашого зв’язку",
            overall: "Загальний підсумок"
        }
        
    }
}