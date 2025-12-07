// خَلّي الصفحة دائماً تبدأ من الأعلى عند الفتح
if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
    window.scrollTo(0, 0);
});

// =======================
// شاشة البداية - الشحن
// =======================
const chargeOverlay = document.getElementById("charge-overlay");
const chargeButton = document.getElementById("charge-button");
const chargeStatus = document.getElementById("charge-status");
const chargeDots = document.querySelectorAll(".charge-dot");

let chargeLevel = 0; // من 0 إلى 6
let chargeInterval = null;
let isCharging = false;

function updateChargeDots(level) {
    chargeDots.forEach((dot, index) => {
        if (index < level) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

function finishCharging() {
    clearInterval(chargeInterval);
    chargeInterval = null;
    isCharging = false;

    if (chargeStatus) {
        chargeStatus.textContent = "تم الشحن ✅ جاري الدخول للموقع...";
    }

    setTimeout(() => {
        if (chargeOverlay) {
            chargeOverlay.classList.add("hidden");
        }
    }, 600);
}

function startCharging(event) {
    event.preventDefault();
    if (!chargeOverlay || isCharging) return;

    isCharging = true;
    chargeLevel = 0;
    updateChargeDots(0);

    if (chargeStatus) {
        chargeStatus.textContent = "جاري الشحن... استمر بالضغط";
    }

    chargeInterval = setInterval(() => {
        chargeLevel++;
        if (chargeLevel > 6) chargeLevel = 6;
        updateChargeDots(chargeLevel);

        if (chargeLevel >= 6) {
            finishCharging();
        }
    }, 350);
}

function stopCharging() {
    if (!isCharging) return;
    isCharging = false;

    clearInterval(chargeInterval);
    chargeInterval = null;

    if (chargeLevel < 6) {
        chargeLevel = 0;
        updateChargeDots(0);
        if (chargeStatus) {
            chargeStatus.textContent = "اضغط واستمر حتى يكتمل الشحن ويفتح الموقع";
        }
    }
}

if (chargeButton && chargeOverlay) {
    chargeButton.addEventListener("mousedown", startCharging);
    window.addEventListener("mouseup", stopCharging);

    chargeButton.addEventListener("touchstart", startCharging);
    window.addEventListener("touchend", stopCharging);
}

// =======================
// تبديل التبويبات (أقسام / خدمات)
// =======================
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

// =======================
// حاسبة الصيانة التقديرية
// =======================
const simForm = document.getElementById("sim-form");
const homeConsumptionEl = document.getElementById("home-consumption");
const carConsumptionEl = document.getElementById("car-consumption");
const totalConsumptionEl = document.getElementById("total-consumption");
const savingPercentEl = document.getElementById("saving-percent");
const simRecommendation = document.getElementById("sim-recommendation");

function formatPrice(num) {
    return num.toLocaleString("ar-JO") + " دينار";
}

if (simForm) {
    simForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const acCount = Number(document.getElementById("ac-count").value) || 0;
        const applianceCount = Number(document.getElementById("appliance-count").value) || 0;
        const plumbingCount = Number(document.getElementById("plumbing-count").value) || 0;
        const itCount = Number(document.getElementById("it-count").value) || 0;
        const visitFactor = Number(document.getElementById("visit-type").value) || 1;

        let inspection = 10;
        inspection += acCount * 2;
        inspection += applianceCount * 1.5;
        inspection += plumbingCount * 3;
        inspection += itCount * 2;

        let repair =
            acCount * 8 +
            applianceCount * 10 +
            plumbingCount * 12 +
            itCount * 9;

        inspection *= visitFactor;
        repair *= visitFactor;

        const total = inspection + repair;

        homeConsumptionEl.textContent = formatPrice(Number(inspection.toFixed(0)));
        carConsumptionEl.textContent = formatPrice(Number(repair.toFixed(0)));
        totalConsumptionEl.textContent = formatPrice(Number(total.toFixed(0)));

        let saving = 18;
        if (total > 200) saving = 25;
        else if (total < 80) saving = 12;

        savingPercentEl.textContent = `حتى ${saving}%`;

        simRecommendation.textContent =
            "هذا تقدير مبدئي فقط. بعد زيارة الفني وتشخيص العطل بشكل دقيق، " +
            "يتم تأكيد السعر النهائي. ننصحك بالاشتراك في عقد صيانة لتقليل التكاليف على المدى الطويل.";
    });
}

// =======================
// كونفيجريتور باقات الصيانة
// =======================
const chargerTypeGroup = document.getElementById("charger-type-group");
const summaryType = document.getElementById("summary-type");
const summaryBase = document.getElementById("summary-base");
const summaryExtra = document.getElementById("summary-extra");
const summaryTotal = document.getElementById("summary-total");

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

        chargerTypeGroup
            .querySelectorAll(".option-btn")
            .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        updateConfigurator();
    });
}

const configCheckboxes = document.querySelectorAll(".checkbox-row input[type='checkbox']");
configCheckboxes.forEach((cb) => {
    cb.addEventListener("change", updateConfigurator);
});

updateConfigurator();

// =======================
// قسم الكاميرا
// =======================
const startCamBtn = document.getElementById("start-camera");
const stopCamBtn = document.getElementById("stop-camera");
const takePhotoBtn = document.getElementById("take-photo");
const sendEmailBtn = document.getElementById("send-email");

const mainVideoEl = document.getElementById("camera-video");
const cameraMsg = document.getElementById("camera-message");
const overlayTextEl = document.getElementById("ar-overlay-text");

const snapshotCanvas = document.getElementById("snapshot-canvas");
const snapshotCtx = snapshotCanvas ? snapshotCanvas.getContext("2d") : null;
const snapshotContainer = document.getElementById("snapshot-container");
const snapshotImg = document.getElementById("snapshot-img");

let cameraStream = null;
let analysisInterval = null;
let lastSnapshotFilename = "";

// كانفس صغيرة لتحليل الفريم
const analysisCanvas = document.createElement("canvas");
const analysisCtx = analysisCanvas.getContext("2d");
analysisCanvas.width = 160;
analysisCanvas.height = 120;

function attachStreamToVideo() {
    if (!cameraStream || !mainVideoEl) return;
    mainVideoEl.srcObject = cameraStream;
    mainVideoEl.play().catch(() => {});
}

function analyzeFrame() {
    if (!mainVideoEl || mainVideoEl.readyState < 2 || !analysisCtx || !overlayTextEl) return;

    try {
        analysisCtx.drawImage(
            mainVideoEl,
            0,
            0,
            analysisCanvas.width,
            analysisCanvas.height
        );
        const frame = analysisCtx.getImageData(
            0,
            0,
            analysisCanvas.width,
            analysisCanvas.height
        ).data;

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

        let suggestion = "صوّر مكان العطل أو الجهاز بوضوح.";

        if (avgBrightness > 175 && avgVar > 18) {
            suggestion =
                "يبدو أنك في مكان خارجي أو مضيء 🌞 ممتاز لتصوير المكيفات الخارجية أو الألواح الشمسية.";
        } else if (avgBrightness > 140 && avgVar < 16) {
            suggestion =
                "يبدو جدار أو سطح ثابت 🧱 ركّز على مكان العطل أو أقرب فيشة كهرباء أو تمديدات.";
        } else if (avgBrightness < 85) {
            suggestion =
                "الإضاءة هنا ضعيفة 💡 حاول تشغّل ضوء إضافي أو تقرّب أكثر من مكان العطل.";
        } else {
            suggestion =
                "مكان داخلي مناسب 👍 صوّر الجهاز المتعطّل أو منطقة التسريب من أكثر من زاوية.";
        }

        overlayTextEl.textContent = suggestion;
    } catch (err) {
        console.error(err);
    }
}

async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (cameraMsg) {
            cameraMsg.textContent =
                "المتصفح لا يدعم فتح الكاميرا. جرّب متصفح أحدث مثل Chrome أو Edge.";
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
                    facingMode: "environment",
                },
            });
        }

        attachStreamToVideo();

        if (cameraMsg) {
            cameraMsg.textContent =
                "وجّه الكاميرا نحو مكان العطل أو الجهاز وتأكد أنه ظاهر في منتصف الشاشة.";
        }
        if (overlayTextEl) {
            overlayTextEl.textContent = "جاري تحليل المشهد… ثبّت يدك شوي 👍";
        }

        if (analysisInterval) clearInterval(analysisInterval);
        analysisInterval = setInterval(analyzeFrame, 1200);
    } catch (err) {
        console.error(err);
        if (cameraMsg) {
            cameraMsg.textContent =
                "ما قدرنا نفتح الكاميرا. تأكد من السماح بالوصول في إعدادات المتصفح.";
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

    if (cameraMsg) {
        cameraMsg.textContent = "تم إيقاف الكاميرا. يمكنك تشغيلها مرة أخرى في أي وقت.";
    }
    if (overlayTextEl) {
        overlayTextEl.textContent = "صوّر مكان العطل أو الجهاز بوضوح 👇";
    }
}

// التقاط صورة من الكاميرا
function takeSnapshot() {
    if (!mainVideoEl || !snapshotCanvas || !snapshotCtx) return;
    if (mainVideoEl.readyState < 2) return;

    snapshotCanvas.width = mainVideoEl.videoWidth || 640;
    snapshotCanvas.height = mainVideoEl.videoHeight || 480;

    snapshotCtx.drawImage(mainVideoEl, 0, 0, snapshotCanvas.width, snapshotCanvas.height);

    const dataUrl = snapshotCanvas.toDataURL("image/png");

    if (snapshotImg && snapshotContainer) {
        snapshotImg.src = dataUrl;
        snapshotContainer.style.display = "block";
    }

    const now = new Date();
    const ts =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        "-" +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0") +
        String(now.getSeconds()).padStart(2, "0");

    lastSnapshotFilename = `smart-service-issue-${ts}.png`;

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = lastSnapshotFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (cameraMsg) {
        cameraMsg.textContent =
            `تم التقاط الصورة وحفظها باسم ${lastSnapshotFilename}، يمكنك الآن إرسالها على الإيميل.`;
    }

    if (sendEmailBtn) {
        sendEmailBtn.disabled = false;
    }
}

// فتح إيميل جديد مع تعبئة العنوان والنص
function openEmailWithSnapshot() {
    const to = "Saleh-Abuali-531@hotmail.com";
    const subject = encodeURIComponent("صورة جهاز / مكان عطل - Smart Service");
    const body = encodeURIComponent(
        "السلام عليكم,\n\n" +
        "أرسل لكم صورة لجهاز أو مكان عطل يحتاج صيانة / تركيب:\n\n" +
        "- يرجى إرفاق ملف الصورة المحفوظة على جهازك باسم: " +
        (lastSnapshotFilename || "smart-service-issue.png") +
        "\n\n" +
        "الاسم:\n" +
        "رقم الهاتف:\n" +
        "عنوان الموقع:\n" +
        "وصف مختصر للمشكلة:\n\n" +
        "شكراً لكم."
    );

    const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
}

// أزرار قسم الكاميرا
if (startCamBtn) {
    startCamBtn.addEventListener("click", startCamera);
}
if (stopCamBtn) {
    stopCamBtn.addEventListener("click", stopCamera);
}
if (takePhotoBtn) {
    takePhotoBtn.addEventListener("click", takeSnapshot);
}
if (sendEmailBtn) {
    sendEmailBtn.addEventListener("click", openEmailWithSnapshot);
}
