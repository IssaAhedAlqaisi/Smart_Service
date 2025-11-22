// تبديل بين "طاقة منزلك" و "طاقة تنقلك"
const toggleButtons = document.querySelectorAll(".toggle-btn");
const panels = document.querySelectorAll(".energy-panel");

toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        toggleButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const target = btn.getAttribute("data-target");
        panels.forEach((panel) => {
            if (panel.id === target) {
                panel.classList.add("active");
            } else {
                panel.classList.remove("active");
            }
        });
    });
});

// محاكي الطاقة
const simForm = document.getElementById("sim-form");
const homeConsumptionEl = document.getElementById("home-consumption");
const carConsumptionEl = document.getElementById("car-consumption");
const totalConsumptionEl = document.getElementById("total-consumption");
const savingPercentEl = document.getElementById("saving-percent");
const simRecommendation = document.getElementById("sim-recommendation");

if (simForm) {
    simForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const ac = Number(document.getElementById("ac-kwh").value) || 0;
        const fridge = Number(document.getElementById("fridge-kwh").value) || 0;
        const washer = Number(document.getElementById("washer-kwh").value) || 0;
        const other = Number(document.getElementById("other-kwh").value) || 0;

        const homeTotal = ac + fridge + washer + other;

        const km = Number(document.getElementById("car-km").value) || 0;
        // نفترض استهلاك 0.15 kWh لكل كيلومتر (15 kWh لكل 100 كم تقريباً)
        const carTotal = +(km * 0.15).toFixed(1);

        const total = +(homeTotal + carTotal).toFixed(1);

        homeConsumptionEl.textContent = `${homeTotal.toFixed(1)} kWh`;
        carConsumptionEl.textContent = `${carTotal.toFixed(1)} kWh`;
        totalConsumptionEl.textContent = `${total.toFixed(1)} kWh`;

        // توفير تقريبي بين 15% و 22% حسب الاستهلاك
        let saving = 18;
        if (total > 900) saving = 22;
        else if (total < 500) saving = 15;

        savingPercentEl.textContent = `حتى ${saving}%`;

        simRecommendation.textContent =
            "بناءً على استهلاكك التقديري، نوصي بمزيج من أجهزة موفرة للطاقة مع شاحن منزلي ذكي. " +
            "تواصل مع Smart Service للحصول على دراسة تفصيلية لاستهلاكك وخطة توفير مخصّصة.";
    });
}

// كونفيجريتور الشحن
const chargerTypeGroup = document.getElementById("charger-type-group");
const summaryType = document.getElementById("summary-type");
const summaryBase = document.getElementById("summary-base");
const summaryExtra = document.getElementById("summary-extra");
const summaryTotal = document.getElementById("summary-total");

function formatPrice(num) {
    return num.toLocaleString("ar-SA") + " ر.س";
}

function updateConfigurator() {
    const activeTypeBtn = chargerTypeGroup.querySelector(".option-btn.active");
    const basePrice = Number(activeTypeBtn.getAttribute("data-price")) || 0;

    let extras = 0;
    const checkboxes = document.querySelectorAll(".checkbox-row input[type='checkbox']");
    checkboxes.forEach((cb) => {
        if (cb.checked) {
            extras += Number(cb.getAttribute("data-extra")) || 0;
        }
    });

    const total = basePrice + extras;

    // نص نوع الشاحن
    summaryType.textContent = activeTypeBtn.textContent.trim();
    summaryBase.textContent = formatPrice(basePrice);
    summaryExtra.textContent = formatPrice(extras);
    summaryTotal.textContent = formatPrice(total);
}

if (chargerTypeGroup) {
    chargerTypeGroup.addEventListener("click", (e) => {
        const btn = e.target.closest(".option-btn");
        if (!btn) return;

        chargerTypeGroup.querySelectorAll(".option-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        updateConfigurator();
    });
}

const configCheckboxes = document.querySelectorAll(".checkbox-row input[type='checkbox']");
configCheckboxes.forEach((cb) => {
    cb.addEventListener("change", updateConfigurator);
});

// تشغيل مبدئي
updateConfigurator();
