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
    return num.toLocaleString("ar-JO") + " دينار";
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

// قسم الكاميرا (يستخدم في قسم "افتح الكاميرا" و "مخطط منزلك الذكي")
const startCamBtn = document.getElementById("start-camera");
const stopCamBtn = document.getElementById("stop-camera");
const startPlannerCamBtn = document.getElementById("start-planner-camera");
const stopPlannerCamBtn = document.getElementById("stop-planner-camera");

const mainVideoEl = document.getElementById("camera-video");
const plannerVideoEl = document.getElementById("planner-video");
const cameraMsg = document.getElementById("camera-message");
const overlayTextEl = document.getElementById("ar-overlay-text");

let cameraStream = null;
let analysisInterval = null;

// كانفس مخفية لتحليل الفريم (لقسم "افتح الكاميرا" فقط)
const analysisCanvas = document.createElement("canvas");
const analysisCtx = analysisCanvas.getContext("2d");
analysisCanvas.width = 160;
analysisCanvas.height = 120;

function attachStreamToVideos() {
    if (!cameraStream) return;
    if (mainVideoEl) {
        mainVideoEl.srcObject = cameraStream;
        mainVideoEl.play().catch(() => {});
    }
    if (plannerVideoEl) {
        plannerVideoEl.srcObject = cameraStream;
        plannerVideoEl.play().catch(() => {});
    }
}

function analyzeFrame() {
    // نستخدم فيديو "افتح الكاميرا" للتحليل، لو موجود
    const videoSource = mainVideoEl || plannerVideoEl;
    if (!videoSource || videoSource.readyState < 2 || !analysisCtx || !overlayTextEl) return;

    try {
        analysisCtx.drawImage(videoSource, 0, 0, analysisCanvas.width, analysisCanvas.height);
        const frame = analysisCtx.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height).data;

        let totalBrightness = 0;
        const pixelCount = frame.length / 4;

        for (let i = 0; i < frame.length; i += 4) {
            const r = frame[i];
            const g = frame[i + 1];
            const b = frame[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += lum;
        }
        const avgBrightness = totalBrightness / pixelCount;

        let varSum = 0;
        let sampleCount = 0;
        for (let i = 0; i < frame.length; i += 40 * 4) {
            const r = frame[i];
            const g = frame[i + 1];
            const b = frame[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            varSum += Math.abs(lum - avgBrightness);
            sampleCount++;
        }
        const avgVar = sampleCount ? varSum / sampleCount : 0;

        let suggestion = "مكان عام جيد لأجهزة الطاقة الذكية.";

        if (avgBrightness > 175 && avgVar > 18) {
            suggestion = "يبدو مكان خارجي مضيء 🌞 مناسب لألواح شمسية أو موقف شحن سيارة.";
        } else if (avgBrightness > 140 && avgVar < 16) {
            suggestion = "واضح أنه جدار مضيء 🧱 مكان ممتاز لتركيب شاحن جداري أو لوحة تحكم.";
        } else if (avgBrightness < 85) {
            suggestion = "الإضاءة هنا ضعيفة 💡 حاول تختار مكان أفتح أو زِد الإضاءة قبل التركيب.";
        } else {
            suggestion = "يبدو مكان داخلي مناسب لأجهزة مثل تكييف أو ثلاجة ذكية.";
        }

        overlayTextEl.textContent = suggestion;
    } catch (err) {
        console.error(err);
    }
}

async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (cameraMsg) {
            cameraMsg.textContent = "المتصفح لا يدعم فتح الكاميرا. جرّب متصفح أحدث مثل Chrome أو Edge.";
        }
        return;
    }

    try {
        if (!cameraStream) {
            if (cameraMsg) {
                cameraMsg.textContent = "جاري طلب صلاحية الكاميرا...";
            }

            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment"
                }
            });
        }

        attachStreamToVideos();

        if (cameraMsg) {
            cameraMsg.textContent = "وجّه الكاميرا نحو المكان اللي تفكر تركّب فيه الشاحن أو الجهاز.";
        }
        if (overlayTextEl) {
            overlayTextEl.textContent = "جاري تحليل المشهد… ثبّت يدك شوي 👍";
        }

        if (analysisInterval) clearInterval(analysisInterval);
        analysisInterval = setInterval(analyzeFrame, 1200);

    } catch (err) {
        console.error(err);
        if (cameraMsg) {
            cameraMsg.textContent = "ما قدرنا نفتح الكاميرا. تأكد من السماح بالوصول في إعدادات المتصفح.";
        }
        if (overlayTextEl) {
            overlayTextEl.textContent = "لم يتم فتح الكاميرا.";
        }
    }
}

function stopCamera() {
    if (analysisInterval) {
        clearInterval(analysisInterval);
        analysisInterval = null;
    }

    if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
    }

    if (mainVideoEl) {
        mainVideoEl.srcObject = null;
    }
    if (plannerVideoEl) {
        plannerVideoEl.srcObject = null;
    }

    if (cameraMsg) {
        cameraMsg.textContent = "تم إيقاف الكاميرا. يمكنك تشغيلها مرة أخرى في أي وقت.";
    }
    if (overlayTextEl) {
        overlayTextEl.textContent = "هنا ممكن يركب الشاحن 👇";
    }
}

// أزرار قسم "افتح الكاميرا"
if (startCamBtn) {
    startCamBtn.addEventListener("click", startCamera);
}
if (stopCamBtn) {
    stopCamBtn.addEventListener("click", stopCamera);
}

// أزرار قسم "مخطط منزلك الذكي"
if (startPlannerCamBtn) {
    startPlannerCamBtn.addEventListener("click", startCamera);
}
if (stopPlannerCamBtn) {
    stopPlannerCamBtn.addEventListener("click", stopCamera);
}
