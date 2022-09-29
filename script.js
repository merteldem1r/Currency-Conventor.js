const api_key = "6af7fe3489934b5f3bfe8c4e";
const api_url = `https://v6.exchangerate-api.com/v6/${api_key}`
const findInputs = document.querySelectorAll(".find-input");
const selectOptions = document.querySelectorAll("#options");
const currencyInput = document.getElementById("currencyInput");
const currentAmount = document.getElementById("currentAmount");
const resultInput = document.getElementById("resultInput");
const resultAmount = document.getElementById("resultAmount");
const replaceBtn = document.querySelector("#replaceBtn");


// load all currencies 
fetch(api_url + "/codes")
    .then(res => res.json())
    .then(data => {
        console.log(data);
        const items = data.supported_codes;
        loadCurrencies(data.supported_codes);
    });

// puting loaded currencies into option elements
function loadCurrencies(currencies) {
    let html = "";
    for (let cur of currencies) {
        let option = `
            <option id="option">${cur[0]}</option> 
        `;
        html += option;
    }

    selectOptions.forEach(item => {
        item.insertAdjacentHTML("beforeend", html);

        // changing currency selecting input when option was clicked
        item.addEventListener('input', () => {
            item.parentElement.firstElementChild.value = item.value;
            currency();
        });
    });
}

// currency calculate
async function currency() {
    try {
        if (currencyInput.value != "" && resultInput.value != "") {

            // get currency information from api
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${api_key}/latest/${currencyInput.value}`);
            const data = await response.json();

            // to calculate
            let result = String(resultInput.value);
            let curent = Number(currentAmount.value);
            let conversion = data.conversion_rates;

            calculate(curent, result, conversion);
        } else if (currencyInput.value == "" && resultInput.value == "") {
            resultAmount.value = "";
            throw new Error("* Please select currency correctly");
        }
    } catch (err) {

        if (err.message == "Failed to fetch" || err.message.includes("Cannot read properties of undefined")) {
            error("* Incorrect currency");
            return;
        }
        error(err.message);
    }
}

// writing on currency select inputs 
findInputs.forEach(item => {
    const tooltip = item.parentElement.parentElement.querySelector("#currency-tooltip");


    item.addEventListener('input', () => {
        tooltip.classList.add("active");
        tooltip.innerHTML = "";
        let html = "";

        for (let k of selectOptions[0]) {

            // equalization input and select element value while writing
            item.value = item.value.toUpperCase();
            if (item.value == k.textContent) {
                item.nextElementSibling.value = item.value;
                currency();
            } else if (item.value.length < 3) item.nextElementSibling.value = "";

            // show currency tooltip while writing
            if (item.value.length == 3 || item.value.length == 0 || !isNaN(Number(item.value))) {
                tooltip.classList.remove("active");
            }

            // create option to tooltip
            if ((item.value.length == 1 && k.textContent[0] == item.value) || item.value.length > 1 && k.textContent.includes(item.value)) {
                let option = `
                    <span>${k.textContent}</span>
                `;
                html += option;
            }
        }
        tooltip.innerHTML = html;

        // select option from tooltip 
        if (tooltip.classList.contains("active")) {
            const options = tooltip.querySelectorAll("span");
            options.forEach(opt => {
                opt.addEventListener('click', () => {
                    item.value = opt.textContent;
                    item.nextElementSibling.value = opt.textContent;
                    currency();
                });
            });
        }
    });

    // close tooltip
    window.addEventListener('click', (e) => {
        if (e.target != tooltip) tooltip.classList.remove("active");
    });
});


// writing on current amount input
currentAmount.addEventListener('input', () => {
    if (currentAmount.value[0] == 0) {
        currentAmount.value = "";
    }

    currency();
});

// calculation
function calculate(curent, result, conversion) {

    if (currentAmount.value >= 0) {
        resultAmount.value = (curent * conversion[result]).toFixed(3);
    } else resultAmount.value = "";

    if (isNaN(resultAmount.value)) error("* Incorrect currency");
}

// replace currencies 
replaceBtn.addEventListener('click', () => {
    const beforeCur = currencyInput.value;

    currencyInput.value = resultInput.value;
    currencyInput.nextElementSibling.value = currencyInput.value;

    resultInput.value = beforeCur;
    resultInput.nextElementSibling.value = beforeCur;

    currency();
});

// error messages
function error(msg) {
    let error = document.querySelector(".error")
    error.innerHTML = `${msg}`
    resultAmount.value = ""

    // if exchange api request quota expired close the interface 
    if (error.textContent == "Exchange API request quota expired") {
        currentAmount.setAttribute('disabled', 'disabled');
        currencyInput.setAttribute('disabled', 'disabled');
        resultInput.setAttribute('disabled', 'disabled');
        replaceBtn.style.pointerEvents = "none";
        return;
    }

    // clear message
    setTimeout(() => {
        error.innerHTML = "";
    }, 3000)
}