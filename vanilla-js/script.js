/**
 * script.js - Sistem Navigasi & Operasional Smart Home IoT
 * Berisi Logika Web Speech API (Voice Control), Koneksi Firebase Realtime Database (Modular SDK),
 * Realtime Clock, Notifikasi, Logging Konsol, dan Simulasi Sensor Slider.
 * 
 * Mudah dipelajari oleh mahasiswa Ilmu Komputer / Teknik Elektro.
 */

// Mengimpor koneksi database dari file firebase-config.js
import { db } from "./firebase-config.js";
import { ref, onValue, set, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// -- DOM Elements (Menghubungkan Elemen HTML ke JS) --
const tempValEl = document.getElementById("temp-value");
const humValEl = document.getElementById("hum-value");
const preloaderEl = document.getElementById("preloader");
const clockEl = document.getElementById("time-string");
const connDotEl = document.getElementById("conn-dot");
const connTextEl = document.getElementById("conn-text");
const toastEl = document.getElementById("toast-notif");
const toastMsgEl = document.getElementById("toast-msg");
const consoleBoxEl = document.getElementById("console-box");

// Elements Microphone (Voice Command)
const micWrapperEl = document.getElementById("mic-wrapper");
const transcriptTextEl = document.getElementById("transcript-text");

// Elemen Slider Simulasi Sensor
const tempSliderEl = document.getElementById("slider-temp");
const humSliderEl = document.getElementById("slider-hum");
const tempSliderValEl = document.getElementById("slider-temp-val");
const humSliderValEl = document.getElementById("slider-hum-val");

// Objek untuk merujuk ke elemen tombol ON/OFF Relay
const relays = {
    relay1: {
        item: document.getElementById("relay-item-1"),
        btnOn: document.getElementById("btn-on-1"),
        btnOff: document.getElementById("btn-off-1"),
        status: document.getElementById("status-text-1")
    },
    relay2: {
        item: document.getElementById("relay-item-2"),
        btnOn: document.getElementById("btn-on-2"),
        btnOff: document.getElementById("btn-off-2"),
        status: document.getElementById("status-text-2")
    },
    relay3: {
        item: document.getElementById("relay-item-3"),
        btnOn: document.getElementById("btn-on-3"),
        btnOff: document.getElementById("btn-off-3"),
        status: document.getElementById("status-text-3")
    },
    relay4: {
        item: document.getElementById("relay-item-4"),
        btnOn: document.getElementById("btn-on-4"),
        btnOff: document.getElementById("btn-off-4"),
        status: document.getElementById("status-text-4")
    }
};

// -- FUNGSI PENOLONG (HELPER FUNCTIONS) --

// 1. Tampilkan Jam Realtime (Indonesian Format)
function updateClock() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    clockEl.textContent = now.toLocaleTimeString('id-ID', timeOptions) + " WIB";
}
setInterval(updateClock, 1000);
updateClock();

// 2. Tampilkan Notifikasi Toast
function showToast(message) {
    toastMsgEl.textContent = message;
    toastEl.classList.add("show");
    setTimeout(() => {
        toastEl.classList.remove("show");
    }, 3000);
}

// 3. Tambahkan Log ke Box Konsol Virtual
function addLog(message, type = "info") {
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    const line = document.createElement("div");
    line.className = "log-line";
    line.innerHTML = `
        <span class="log-time">[${time}]</span>
        <span class="log-tag">SYSTEM:</span>
        <span class="log-msg ${type}">${message}</span>
    `;
    consoleBoxEl.appendChild(line);
    // Auto scroll ke bawah log baru
    consoleBoxEl.scrollTop = consoleBoxEl.scrollHeight;
}

// -- INTEGRASI INTERAKTIF FIREBASE REALTIME DATABASE --

// 1. Cek Koneksi Klien ke server Firebase (Menggunakan Jalur Spesial /.info/connected milik Firebase)
const connectedRef = ref(db, ".info/connected");
onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
        connDotEl.classList.add("connected");
        connTextEl.textContent = "TERHUBUNG (FIREBASE)";
        addLog("Sukses terhubung dengan Firebase Realtime Database.", "success");
    } else {
        connDotEl.classList.remove("connected");
        connTextEl.textContent = "TERPUTUS";
        addLog("Koneksi ke Firebase terputus. Silakan periksa jaringan Anda.", "error");
    }
});

// 2. Memantau Sensor secara Realtime dari Firebase
const sensorRef = ref(db, "sensor");
let firstLoad = true;

onValue(sensorRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const temperature = data.temperature !== undefined ? data.temperature : 0;
        const humidity = data.humidity !== undefined ? data.humidity : 0;

        // Update di monitor dashboard
        tempValEl.textContent = temperature;
        humValEl.textContent = humidity;

        // Update nilai slider simulator agar singkron jika diubah perangkat lain
        tempSliderEl.value = temperature;
        tempSliderValEl.textContent = temperature;
        humSliderEl.value = humidity;
        humSliderValEl.textContent = humidity;

        addLog(`Sensor Update: Suhu ${temperature}°C, Kelembaban ${humidity}%`, "info");
        
        // Matikan loading screen saat data pertama diterima
        if (firstLoad) {
            preloaderEl.style.opacity = "0";
            setTimeout(() => {
                preloaderEl.style.display = "none";
            }, 500);
            firstLoad = false;
        }
    } else {
        // Jika sensor di Firebase kosong, kita inisialisasi dengan data default
        initDatabase();
    }
}, (error) => {
    addLog(`Gagal membaca data dari Firebase: ${error.message}`, "error");
});

// 3. Memantau & Mengendalikan Relay secara Realtime dari Firebase
const relayRef = ref(db, "relay");
onValue(relayRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // Membaca status untuk 4 Relay (0 = Mati, 1 = Hidup)
        for (let i = 1; i <= 4; i++) {
            const rKey = `relay${i}`;
            const state = data[rKey];
            const relayItem = relays[rKey];

            if (state === 1) {
                // Konfigurasi visual relay AKTIF
                relayItem.item.classList.add("active");
                relayItem.btnOn.classList.add("active");
                relayItem.btnOff.classList.remove("active");
                relayItem.status.textContent = "Status: ON (AKTIF)";
            } else {
                // Konfigurasi visual relay MATI
                relayItem.item.classList.remove("active");
                relayItem.btnOn.classList.remove("active");
                relayItem.btnOff.classList.add("active");
                relayItem.status.textContent = "Status: OFF";
            }
        }
    }
});

// Inisialisasi struktur database kosong (Jika database baru dibuat dan kosong)
function initDatabase() {
    addLog("Inisialisasi database awal di Firebase...", "info");
    const initialData = {
        relay: {
            relay1: 0,
            relay2: 0,
            relay3: 0,
            relay4: 0
        },
        sensor: {
            temperature: 28,
            humidity: 65
        }
    };
    set(ref(db, "/"), initialData)
        .then(() => {
            addLog("Berhasil inisialisasi skema awal IoT di Firebase.", "success");
        })
        .catch(err => {
            addLog("Gagal inisialisasi awal: " + err.message, "error");
        });
}

// 4. Tambahkan Interaksi Klik Tombol Relay (Merubah Data di Firebase)
function setRelayState(relayId, stateValue) {
    const targetRef = ref(db, `relay/relay${relayId}`);
    set(targetRef, stateValue)
        .then(() => {
            showToast(`Lampu ${relayId} berhasil di${stateValue === 1 ? 'nyalakan' : 'matikan'}!`);
            addLog(`Merubah Lampu ${relayId} ke status ${stateValue === 1 ? 'ON' : 'OFF'}`, "success");
        })
        .catch((err) => {
            addLog(`Error memperbarui relay: ${err.message}`, "error");
        });
}

// Menghubungkan fungsi klik tombol fisik/tampilan di web
for (let i = 1; i <= 4; i++) {
    const rKey = `relay${i}`;
    relays[rKey].btnOn.addEventListener("click", () => setRelayState(i, 1));
    relays[rKey].btnOff.addEventListener("click", () => setRelayState(i, 0));
}

// -- FITUR VOICE COMMAND MEMAKAI WEB SPEECH API --
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    addLog("Web Speech API tidak didukung di browser ini. Gunakan Google Chrome/Edge.", "error");
    transcriptTextEl.textContent = "Browser tidak mendukung Voice Command ! Silakan ganti ke Google Chrome.";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID"; // Set suara masukan ke Bahasa Indonesia
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Klik icon mic untuk mengaktifkan
    micWrapperEl.addEventListener("click", () => {
        if (micWrapperEl.classList.contains("listening")) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    recognition.onstart = () => {
        micWrapperEl.classList.add("listening");
        transcriptTextEl.textContent = "Mendengarkan suara Anda... (Katakan: 'Nyalakan lampu 1')";
        transcriptTextEl.classList.remove("recognized");
        addLog("Mikrofon aktif. Silakan bicara...", "info");
    };

    recognition.onend = () => {
        micWrapperEl.classList.remove("listening");
    };

    recognition.onerror = (event) => {
        micWrapperEl.classList.remove("listening");
        transcriptTextEl.textContent = `Kesalahan mic: ${event.error}. Tekan mikrofon untuk mencoba kembali.`;
        addLog("Terjadi error pada mikrofon: " + event.error, "error");
    };

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        transcriptTextEl.textContent = `"${text}"`;
        transcriptTextEl.classList.add("recognized");
        addLog(`Suara dikenali: "${text}"`, "voice");

        // Proses perintah suara (Bahasa Indonesia)
        prosesPerintahSuara(text.toLowerCase());
    };
}

// Fungsi Parse kalimat dari Voice Command
function prosesPerintahSuara(perintah) {
    let dikenali = false;
    
    // Kamus Kecocokan Perintah
    if (perintah.includes("nyalakan semua lampu") || perintah.includes("hidupkan semua") || perintah.includes("nyalakan semua")) {
        const updates = { "relay1": 1, "relay2": 1, "relay3": 1, "relay4": 1 };
        update(ref(db, "relay"), updates)
            .then(() => {
                showToast("Menyalakan semua lampu!");
                addLog("Voice Command: Semua lampu berhasil diaktifkan", "success");
            });
        dikenali = true;
    } 
    else if (perintah.includes("matikan semua lampu") || perintah.includes("padamkan semua") || perintah.includes("matikan semua")) {
        const updates = { "relay1": 0, "relay2": 0, "relay3": 0, "relay4": 0 };
        update(ref(db, "relay"), updates)
            .then(() => {
                showToast("Mematikan semua lampu!");
                addLog("Voice Command: Semua lampu dinonaktifkan", "success");
            });
        dikenali = true;
    }
    else {
        // Deteksi spesifik saklar lampu individu (contoh: "nyalakan lampu satu" atau "turn on lamp 1")
        const relayMapping = [
            { ids: [1], keywords: ["lampu 1", "lampu satu", "lampu kesatu", "relay 1", "relay satu"] },
            { ids: [2], keywords: ["lampu 2", "lampu dua", "lampu kedua", "relay 2", "relay dua"] },
            { ids: [3], keywords: ["lampu 3", "lampu tiga", "lampu ketiga", "relay 3", "relay tiga"] },
            { ids: [4], keywords: ["lampu 4", "lampu empat", "lampu keempat", "relay 4", "relay empat"] }
        ];

        let actionOn = perintah.includes("nyalakan") || perintah.includes("hidupkan") || perintah.includes("aktifkan") || perintah.includes("on");
        let actionOff = perintah.includes("matikan") || perintah.includes("padamkan") || perintah.includes("off");

        if (actionOn || actionOff) {
            const targetVal = actionOn ? 1 : 0;
            
            for (const map of relayMapping) {
                for (const keyword of map.keywords) {
                    if (perintah.includes(keyword)) {
                        setRelayState(map.ids[0], targetVal);
                        dikenali = true;
                        break;
                    }
                }
                if (dikenali) break;
            }
        }
    }

    if (!dikenali) {
        showToast("Perintah suara tidak dikenali.");
        addLog(`Perintah suara "${perintah}" tidak cocok dengan instruksi apa pun.`, "error");
    }
}


// -- SIMULATOR SENSOR (SLIDER CONTROL) --

// Handler perubahan Slider Suhu
tempSliderEl.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    tempSliderValEl.textContent = val;
});

// Ketika slider dilepaskan, perbarui data Firebase Realtime Database
tempSliderEl.addEventListener("change", (e) => {
    const val = parseInt(e.target.value);
    set(ref(db, "sensor/temperature"), val)
        .then(() => {
            addLog(`Simulator: Menyetel Suhu ke ${val}°C`, "success");
        });
});

// Handler perubahan Slider Kelembaban
humSliderEl.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    humSliderValEl.textContent = val;
});

// Ketika slider dilepaskan, perbarui data Firebase
humSliderEl.addEventListener("change", (e) => {
    const val = parseInt(e.target.value);
    set(ref(db, "sensor/humidity"), val)
        .then(() => {
            addLog(`Simulator: Menyetel Kelembaban ke ${val}%`, "success");
        });
});
