// خَلّي الصفحة دائماً تبدأ من الأعلى عند الفتح
if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
    window.scrollTo(0, 0);
});

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
        // نفترض 0.15 kWh لكل كيلومتر
        const carTotal = +(km * 0.15).toFixed(1);

        const total = +(homeTotal + carTotal).toFixed(1);

        homeConsumptionEl.textContent = `${homeTotal.toFixed(1)} kWh`;
        carConsumptionEl.textContent = `${carTotal.toFixed(1)} kWh`;
        totalConsumptionEl.textContent = `${total.toFixed(1)} kWh`;

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
    if (!chargerTypeGroup) return;

    const activeTypeBtn = chargerTypeGroup.querySelector(".option-btn.active");
    if (!activeTypeBtn) return;

    const basePrice = Number(activeTypeBtn.getAttribute("data-price")) || 0;

    let extras = 0;
    const checkboxes = document.querySelectorAll(".checkbox-row input[type='checkbox']");
    checkboxes.forEach((cb) => {
        if (cb.checked) {
            extras += Number(cb.getAttribute("data-extra")) || 0;
        }
    });

    const total = basePrice + extras;

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

// تشغيل مبدئي للكونفيجريتور
updateConfigurator();

// قسم الكاميرا
const startCamBtn = document.getElementById("start-camera");
const stopCamBtn = document.getElementById("stop-camera");
const videoEl = document.getElementById("camera-video");
const cameraMsg = document.getElementById("camera-message");

let cameraStream = null;

async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (cameraMsg) {
            cameraMsg.textContent = "المتصفح لا يدعم فتح الكاميرا. جرّب متصفح أحدث مثل Chrome أو Edge.";
        }
        return;
    }

    try {
        cameraMsg.textContent = "جاري طلب صلاحية الكاميرا...";
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment" // الكاميرا الخلفية على الجوال إن أمكن
            }
        });
        if (videoEl) {
            videoEl.srcObject = cameraStream;
            videoEl.play();
        }
        cameraMsg.textContent = "وجّه الكاميرا نحو الجدار أو الموقف اللي تفكر تركّب فيه الشاحن.";
    } catch (err) {
        console.error(err);
        if (cameraMsg) {
            cameraMsg.textContent = "ما قدرنا نفتح الكاميرا. تأكد من السماح بالوصول في إعدادات المتصفح.";
        }
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
    }
    if (videoEl) {
        videoEl.srcObject = null;
    }
    if (cameraMsg) {
        cameraMsg.textContent = "تم إيقاف الكاميرا. يمكنك تشغيلها مرة أخرى في أي وقت.";
    }
}

if (startCamBtn) {
    startCamBtn.addEventListener("click", startCamera);
}
if (stopCamBtn) {
    stopCamBtn.addEventListener("click", stopCamera);
}
