// ----------------------------------------------------
// 1. الدوال المساعدة لتحويل الألوان (Hex to HSL والعكس)
// ----------------------------------------------------

function hexToHsl(hex) {
    let r = parseInt(hex.substring(1, 3), 16) / 255;
    let g = parseInt(hex.substring(3, 5), 16) / 255;
    let b = parseInt(hex.substring(5, 7), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// ----------------------------------------------------
// 2. الدالة الأساسية لتوليد اللوحة (تشمل منطق أنواع اللوحات)
// ----------------------------------------------------

function generatePalette() {
    const baseColorHex = document.getElementById('baseColor').value;
    const schemeType = document.getElementById('schemeType').value; 
    
    let [baseH, baseS, baseL] = hexToHsl(baseColorHex);

    let generatedHues = []; 
    let colorAdjustments = []; 

    // أ. تحديد درجات الألوان (Hues) بناءً على النظام المختار
    if (schemeType === 'complementary') {
        // الألوان المُكمّلة: نحتاج درجتين (0 و 180)
        generatedHues = [baseH, (baseH + 180) % 360];
    } else if (schemeType === 'analogous') {
        // الألوان المتشابهة: نحتاج ثلاث درجات (-30, 0, +30)
        generatedHues = [
            (baseH - 30 + 360) % 360, 
            baseH,                     
            (baseH + 30) % 360         
        ];
    } else { // Monochromatic (Default)
        // الألوان الأحادية اللون: نحتاج درجة واحدة فقط
        generatedHues = [baseH];
    }

    // القيم التي نستخدمها لـ L و S لملء 5 مربعات (تضمن التباين)
    const lValues = [85, 65, 50, 40, 30]; 
    const sValues = [75, 85, 95, 80, 70]; 
    
    const numHues = generatedHues.length;
    let hueIndex = 0;

    for (let i = 0; i < 5; i++) {
        // نستخدم عامل القسمة % numHues لضمان التدوير بين درجات اللون المتاحة (1 أو 2 أو 3)
        const currentHue = generatedHues[hueIndex % numHues]; 
        
        colorAdjustments.push({
            h: currentHue,
            s: sValues[i],
            l: lValues[i]
        });
        
        hueIndex++;
    }


    const colorBoxes = document.querySelectorAll('.color-box');
    
    // تطبيق الألوان الجديدة على المربعات
    colorAdjustments.forEach((adjustment, index) => {
        let newL = Math.min(100, Math.max(0, adjustment.l));
        let newS = Math.min(100, Math.max(0, adjustment.s));

        const newColorHex = hslToHex(adjustment.h, newS, newL);
        
        colorBoxes[index].style.backgroundColor = newColorHex;
        colorBoxes[index].textContent = newColorHex; 
        colorBoxes[index].style.color = newL > 60 ? 'black' : 'white'; 
    });

    document.getElementById('message').textContent = `تم توليد لوحة ألوان من نوع ${schemeType}.`;
}

// ----------------------------------------------------
// 3. دالة النسخ إلى الحافظة (Clipboard)
// ----------------------------------------------------
function copyColor(event) {
    const colorCode = event.target.textContent; 

    if (colorCode.startsWith('#')) {
        navigator.clipboard.writeText(colorCode).then(() => {
            document.getElementById('message').textContent = `تم نسخ ${colorCode} إلى الحافظة! ✅`;
            setTimeout(() => {
                document.getElementById('message').textContent = '';
            }, 1500);
        }).catch(err => {
            console.error('فشل في النسخ:', err);
            document.getElementById('message').textContent = 'فشل النسخ، يرجى المحاولة يدوياً.';
        });
    }
}

// ----------------------------------------------------
// 4. ربط دالة النسخ بالمربعات وتشغيل التوليد الأولي
// ----------------------------------------------------
document.querySelectorAll('.color-box').forEach(box => {
    box.addEventListener('click', copyColor);
});

// تشغيل دالة التوليد تلقائياً عند تحميل الصفحة
generatePalette();