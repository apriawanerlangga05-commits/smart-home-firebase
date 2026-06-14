export const vanillaCode = {
  indexHtml: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Home IoT Dashboard - Monitoring & Kontrol</title>
    <!-- Menautkan stylesheet eksternal style.css -->
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- 1. PRELOADER LOADING ANIMATION -->
    <div id="preloader" class="preloader">
        <div class="spinner"></div>
        <p style="margin-top: 15px; color: var(--text-secondary); font-family: 'Inter', sans-serif; font-size: 0.9rem; letter-spacing: 0.05em;">
            MENGHUBUNGKAN KE SERVER IOT...
        </p>
    </div>

    <!-- 2. NOTIFIKASI TOAST (SENSITIF STATE RELAY) -->
    <div id="toast-notif" class="notification-toast">
        <!-- Icon info dari SVG -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-cyan)"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span id="toast-msg">Lampu berhasil diperbarui!</span>
    </div>

    <!-- MAIN CONTAINER -->
    <div class="dashboard-container">
        
        <!-- HEADER DASHBOARD -->
        <header>
            <div class="header-brand">
                <h1>
                    <!-- Icon Smart Home (SVG) -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-cyan)"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    Smart Home IoT
                </h1>
                <p>Dashboard Monitoring & Kontrol berbasis Firebase Realtime Database</p>
            </div>
            
            <div class="system-status">
                <!-- Status Koneksi Firebase -->
                <div class="conn-indicator">
                    <span id="conn-dot" class="status-dot"></span>
                    <span id="conn-text">MENGHUBUNGKAN...</span>
                </div>
                <!-- Waktu Realtime Client -->
                <div class="realtime-clock">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span id="time-string">00:00:00 WIB</span>
                </div>
            </div>
        </header>

        <!-- LAYOUT GRID UTAMA -->
        <div class="grid-container">
            
            <!-- ====== 1. DASHBOARD MONITORING SENSOR ====== -->
            <div class="monitoring-section">
                
                <!-- Card Suhu -->
                <div class="dashboard-card sensor-card temp-card">
                    <div class="sensor-header">
                        <span>SUHU REALTIME</span>
                        <div class="sensor-icon-wrapper">
                            <!-- Icon Termometer (SVG) -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
                        </div>
                    </div>
                    <div class="sensor-body">
                        <span id="temp-value" class="sensor-value">--</span>
                        <span class="sensor-unit">°C</span>
                    </div>
                </div>

                <!-- Card Kelembaban -->
                <div class="dashboard-card sensor-card hum-card">
                    <div class="sensor-header">
                        <span>KELEMBABAN REALTIME</span>
                        <div class="sensor-icon-wrapper">
                            <!-- Icon Droplet (SVG) -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                        </div>
                    </div>
                    <div class="sensor-body">
                        <span id="hum-value" class="sensor-value">--</span>
                        <span class="sensor-unit">% RH</span>
                    </div>
                </div>

            </div>

            <!-- ====== 2. KONTROL RELAY / SAKLAR LAMPU ====== -->
            <div class="dashboard-card relay-section">
                <div class="section-head">
                    <h3 class="section-title">Kontrol Aktuator Relay</h3>
                    <span class="relay-status-pill" style="background: rgba(6, 182, 212, 0.1); color: var(--accent-cyan);">4 Saklar Relay</span>
                </div>

                <!-- Grid 4 Relay -->
                <div class="relay-grid">
                    
                    <!-- Relay 1 (Lampu Teras) -->
                    <div id="relay-item-1" class="relay-item">
                        <div class="relay-item-header">
                            <div class="relay-info">
                                <h4>Lampu Teras (Relay 1)</h4>
                                <span id="status-text-1">Status: OFF</span>
                            </div>
                            <!-- Icon Bohlam (SVG) -->
                            <svg class="bulb-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/></svg>
                        </div>
                        <div class="relay-controls">
                            <button id="btn-on-1" class="control-btn btn-on">ON</button>
                            <button id="btn-off-1" class="control-btn btn-off active">OFF</button>
                        </div>
                    </div>

                    <!-- Relay 2 (Lampu Keluarga) -->
                    <div id="relay-item-2" class="relay-item">
                        <div class="relay-item-header">
                            <div class="relay-info">
                                <h4>Lampu Keluarga (Relay 2)</h4>
                                <span id="status-text-2">Status: OFF</span>
                            </div>
                            <svg class="bulb-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/></svg>
                        </div>
                        <div class="relay-controls">
                            <button id="btn-on-2" class="control-btn btn-on">ON</button>
                            <button id="btn-off-2" class="control-btn btn-off active">OFF</button>
                        </div>
                    </div>

                    <!-- Relay 3 (Lampu Utama) -->
                    <div id="relay-item-3" class="relay-item">
                        <div class="relay-item-header">
                            <div class="relay-info">
                                <h4>Lampu Kamar (Relay 3)</h4>
                                <span id="status-text-3">Status: OFF</span>
                            </div>
                            <svg class="bulb-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/></svg>
                        </div>
                        <div class="relay-controls">
                            <button id="btn-on-3" class="control-btn btn-on">ON</button>
                            <button id="btn-off-3" class="control-btn btn-off active">OFF</button>
                        </div>
                    </div>

                    <!-- Relay 4 (Pompa Air / Sanyo) -->
                    <div id="relay-item-4" class="relay-item">
                        <div class="relay-item-header">
                            <div class="relay-info">
                                <h4>Sanyo Pompa (Relay 4)</h4>
                                <span id="status-text-4">Status: OFF</span>
                            </div>
                            <svg class="bulb-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/></svg>
                        </div>
                        <div class="relay-controls">
                            <button id="btn-on-4" class="control-btn btn-on">ON</button>
                            <button id="btn-off-4" class="control-btn btn-off active">OFF</button>
                        </div>
                    </div>

                </div>
            </div>

            <!-- ====== 3. VOICE COMMAND (WEB SPEECH API) ====== -->
            <div class="dashboard-card voice-section">
                <div class="voice-container">
                    
                    <!-- Tombol Mic Interaktif -->
                    <div id="mic-wrapper" class="mic-wrapper">
                        <div class="pulse-ring"></div>
                        <button class="mic-btn">
                            <!-- Icon Mic (SVG) -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                        </button>
                    </div>

                    <!-- Teks Hasil Suara -->
                    <div class="voice-display">
                        <h3>Kontrol Suara AI (Voice Command)</h3>
                        <div class="transcript-box">
                            <span id="transcript-text" class="transcript-text">Klik ikon mikrofon untuk berbicara perintah suara...</span>
                        </div>
                        <div class="voice-hint">
                            <span>💡 Perintah: "Nyalakan lampu 1"</span>
                            <span>💡 "Matikan lampu 2"</span>
                            <span>💡 "Nyalakan semua lampu"</span>
                            <span>💡 "Matikan semua lampu"</span>
                        </div>
                    </div>

                </div>
            </div>

            <!-- ====== 4. SIMULATOR SENSOR (SLIDER) ====== -->
            <div class="dashboard-card simulator-section">
                <div class="section-head" style="margin-bottom: 10px;">
                    <h3 class="section-title" style="color: var(--accent-cyan)">Simulator Penguji Sensor IoT</h3>
                    <span class="relay-status-pill" style="background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald);">Mode Simulasi Aktif</span>
                </div>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">
                    Geser slider untuk mensimulasikan data suhu dan kelembaban tanpa perangkat keras ESP32. Perubahan akan langsung disinkronkan ke Firebase dan dialirkan kembali ke monitor realtime di atas.
                </p>

                <div class="simulator-controls">
                    <!-- Slider Temperatur -->
                    <div class="control-group">
                        <label>
                            <span>Simulasi Suhu Udara</span>
                            <span><b id="slider-temp-val">28</b> °C</span>
                        </label>
                        <input type="range" id="slider-temp" min="0" max="60" value="28">
                    </div>

                    <!-- Slider Kelembaban -->
                    <div class="control-group">
                        <label>
                            <span>Simulasi Kelembaban</span>
                            <span><b id="slider-hum-val">65</b> % RH</span>
                        </label>
                        <input type="range" id="slider-hum" min="10" max="100" value="65">
                    </div>
                </div>
            </div>

            <!-- ====== 5. CONSOLE LOGS AKTIVITAS IOT ====== -->
            <div class="dashboard-card logs-section">
                <div class="section-head" style="margin-bottom: 12px;">
                    <h3 class="section-title">Log Aktivitas Sistem</h3>
                    <span class="relay-status-pill" style="background: rgba(255, 255, 255, 0.05);">Daftar Log Aktif</span>
                </div>
                <div id="console-box" class="console-box">
                    <div class="log-line">
                        <span class="log-time">[SYSTEM]</span>
                        <span class="log-tag">INITIALIZING:</span>
                        <span class="log-msg font-semibold">Memuat sistem dashboard IoT...</span>
                    </div>
                </div>
            </div>

        </div>

        <!-- FOOTER -->
        <footer>
            <p>Implementasi Pembelajaran IoT & Rekayasa Perangkat Lunak Mahasiswa</p>
            <p style="margin-top:6px; font-size: 0.75rem; color: rgba(255,255,255,0.25)">
                Terhubung ke <span style="color: var(--accent-cyan)">smart-home-c7386</span> via Firebase Web SDK v10.12.2
            </p>
        </footer>

    </div>

    <!-- Script Utama (Mengaktifkan seluruh backend Firebase dan Voice Input) -->
    <script type="module" src="script.js"></script>
</body>
</html>`,
  styleCss: `/*
 * style.css - Styling Sistem Smart Home IoT Dashboard
 * Desain: Futuristic Dark Mode, Glassmorphism, Glowing Effects, dan Responsive Layout
 * Sangat cocok untuk materi perkuliahan/proyek mahasiswa IoT.
 */

/* Mengimpor Google Fonts: Inter untuk teks umum dan JetBrains Mono untuk status/data */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

/* Reset dasar & Variabel Global */
:root {
    --bg-gradient-start: #0a0d16;
    --bg-gradient-end: #121625;
    --card-bg: rgba(22, 28, 45, 0.45);
    --card-border: rgba(255, 255, 255, 0.06);
    --text-primary: #f3f4f6;
    --text-secondary: #9ca3af;
    --accent-blue: #3b82f6;
    --accent-cyan: #06b6d4;
    --accent-emerald: #10b981;
    --accent-red: #ef4444;
    --font-main: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --glow-shadow-emerald: 0 0 15px rgba(16, 185, 129, 0.4);
    --glow-shadow-cyan: 0 0 15px rgba(6, 182, 212, 0.4);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-main);
    background: linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end));
    color: var(--text-primary);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
}

/* Animasi Bintang/Partikel Latar Belakang Halus */
body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
        radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
        radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px);
    background-size: 550px 550px, 350px 350px;
    background-position: 0 0, 40px 60px;
    opacity: 0.04;
    z-index: -1;
    pointer-events: none;
}

/* Loader saat web pertama kali dibuka */
.preloader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #0a0d16;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 0.5s ease;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(6, 182, 212, 0.1);
    border-radius: 50%;
    border-top-color: var(--accent-cyan);
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Container utama dashboard */
.dashboard-container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 20px;
    flex: 1;
}

/* Header Dashboard */
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--card-border);
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 15px;
}

.header-brand h1 {
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    background: linear-gradient(to right, #ffffff, #9ca3af);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    gap: 10px;
}

.header-brand p {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-top: 4px;
}

.system-status {
    display: flex;
    align-items: center;
    gap: 15px;
}

/* Indikator Firebase */
.conn-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.04);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-family: var(--font-mono);
    border: 1px solid var(--card-border);
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--accent-red);
}

.status-dot.connected {
    background-color: var(--accent-emerald);
    box-shadow: 0 0 8px var(--accent-emerald);
}

/* Realtime Clock */
.realtime-clock {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(6, 182, 212, 0.08);
    color: var(--accent-cyan);
    padding: 6px 12px;
    border-radius: 20px;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    font-weight: 500;
    border: 1px solid rgba(6, 182, 212, 0.15);
}

/* Notifikasi Log Mengambang */
.notification-toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #111827;
    border-left: 4px solid var(--accent-cyan);
    color: var(--text-primary);
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    gap: 10px;
    transform: translateY(150%);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1000;
}

.notification-toast.show {
    transform: translateY(0);
}

/* Layout Grid Dashboard */
.grid-container {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 20px;
}

/* Sub-card styling */
.dashboard-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 24px;
    backdrop-filter: blur(8px);
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.dashboard-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.12);
}

/* 1. Dashboard Monitoring (Suhu & Kelembaban) */
.monitoring-section {
    grid-column: span 5;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.sensor-card {
    background: linear-gradient(145deg, rgba(22, 28, 45, 0.6), rgba(15, 19, 32, 0.6));
    border: 1px solid var(--card-border);
    position: relative;
    overflow: hidden;
}

.sensor-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
}

.temp-card::after {
    background: linear-gradient(to bottom, #f97316, #ef4444);
}

.hum-card::after {
    background: linear-gradient(to bottom, #3b82f6, #06b6d4);
}

.sensor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
}

.sensor-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.temp-card .sensor-icon-wrapper {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.hum-card .sensor-icon-wrapper {
    background: rgba(6, 182, 212, 0.1);
    color: #06b6d4;
}

.sensor-body {
    margin-top: 15px;
    display: flex;
    align-items: baseline;
    gap: 6px;
}

.sensor-value {
    font-size: 2.5rem;
    font-family: var(--font-mono);
    font-weight: 700;
}

.sensor-unit {
    font-size: 1.2rem;
    color: var(--text-secondary);
}

/* 2. Kontrol Relay (Grid 4 Relay dalam 1 Card Besar) */
.relay-section {
    grid-column: span 7;
}

.section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-title {
    font-size: 1.15rem;
    font-weight: 600;
    letter-spacing: -0.015em;
    color: #ffffff;
}

.relay-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.relay-item {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.04);
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 140px;
    transition: all 0.25s ease;
}

.relay-item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.relay-info h4 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #ffffff;
}

.relay-info span {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

/* Lampu Bulat SVG Glow Effect */
.bulb-icon {
    width: 32px;
    height: 32px;
    color: var(--text-secondary);
    transition: all 0.3s ease;
}

/* Modifikasi ketika status relay ON */
.relay-item.active {
    background: rgba(6, 182, 212, 0.05);
    border-color: rgba(6, 182, 212, 0.3);
    box-shadow: 0 4px 20px -2px rgba(6, 182, 212, 0.15);
}

.relay-item.active .bulb-icon {
    color: #eab308;
    filter: drop-shadow(0 0 8px rgba(234, 179, 8, 0.7));
}

.relay-status-pill {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-family: var(--font-mono);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
    font-weight: 500;
}

.relay-item.active .relay-status-pill {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
}

/* Tombol Kontrol Dual ON/OFF */
.relay-controls {
    display: flex;
    gap: 8px;
    margin-top: 15px;
}

.control-btn {
    flex: 1;
    border: none;
    outline: none;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.03);
    color: var(--text-secondary);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.2s ease;
}

.control-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
}

.control-btn.btn-on.active {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border-color: transparent;
    box-shadow: var(--glow-shadow-emerald);
}

.control-btn.btn-off.active {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border-color: transparent;
}

/* 3. Voice Control Panel (Web Speech API) */
.voice-section {
    grid-column: span 12;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: radial-gradient(circle at top right, rgba(6, 182, 212, 0.07), transparent 60%), var(--card-bg);
}

.voice-container {
    display: flex;
    align-items: center;
    gap: 30px;
    width: 100%;
}

.mic-wrapper {
    flex-shrink: 0;
    position: relative;
    cursor: pointer;
}

.mic-btn {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    border: none;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: var(--glow-shadow-cyan);
    z-index: 2;
    position: relative;
    transition: all 0.2s ease;
}

.mic-btn:hover {
    transform: scale(1.04);
}

.mic-btn:active {
    transform: scale(0.96);
}

.mic-wrapper.listening .mic-btn {
    background: linear-gradient(135deg, #f43f5e, #e11d48);
    box-shadow: 0 0 20px rgba(225, 29, 72, 0.6);
}

/* Gelombang Radar Pulsa Pengenalan Suara */
.pulse-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(6, 182, 212, 0.3);
    pointer-events: none;
    z-index: 1;
}

.mic-wrapper.listening .pulse-ring {
    animation: pulseMic 1.5s infinite ease-out;
    background: rgba(225, 29, 72, 0.3);
}

@keyframes pulseMic {
    0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.8;
    }
    100% {
        transform: translate(-50%, -50%) scale(1.8);
        opacity: 0;
    }
}

.voice-display {
    flex: 1;
}

.voice-display h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 5px;
}

.transcript-box {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--card-border);
    border-radius: 8px;
    padding: 12px 16px;
    color: var(--text-secondary);
    min-height: 48px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
}

.transcript-text.recognized {
    color: #ffffff;
    font-weight: 500;
}

.voice-hint {
    font-size: 0.75rem;
    color: var(--accent-cyan);
    margin-top: 8px;
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.voice-hint span {
    background: rgba(6, 182, 212, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
}

/* Logging Aktivitas IoT di Dashboard */
.logs-section {
    grid-column: span 12;
}

.console-box {
    background: rgba(10, 13, 22, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 15px;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    max-height: 180px;
    overflow-y: auto;
}

.console-box::-webkit-scrollbar {
    width: 6px;
}

.console-box::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
}

.log-line {
    margin-bottom: 8px;
    display: flex;
    gap: 10px;
    color: var(--text-secondary);
}

.log-time {
    color: var(--accent-cyan);
}

.log-tag {
    color: var(--text-primary);
    font-weight: bold;
}

.log-msg.success { color: var(--accent-emerald); }
.log-msg.error { color: var(--accent-red); }
.log-msg.info { color: #f59e0b; }

/* Simulator Sensor (Khusus untuk Pengujian Mahasiswa Tanpa Perangkat ESP32 Fisik) */
.simulator-section {
    grid-column: span 12;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.2) 100%);
    border: 1px solid rgba(6, 182, 212, 0.15);
}

.simulator-controls {
    display: flex;
    gap: 30px;
    align-items: center;
    margin-top: 15px;
    flex-wrap: wrap;
}

.control-group {
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.control-group label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    display: flex;
    justify-content: space-between;
}

.control-group input[type="range"] {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    outline: none;
}

.control-group input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent-cyan);
    cursor: pointer;
    box-shadow: var(--glow-shadow-cyan);
}

/* Footer Aplikasi */
footer {
    text-align: center;
    padding: 30px 20px;
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-top: 40px;
    border-top: 1px solid var(--card-border);
}

footer a {
    color: var(--accent-cyan);
    text-decoration: none;
}

/* Responsive Grid untuk Tablet & Mobile */
@media screen and (max-width: 900px) {
    .monitoring-section {
        grid-column: span 12;
        flex-direction: row;
    }
    .monitoring-section .sensor-card {
        flex: 1;
    }
    .relay-section {
        grid-column: span 12;
    }
}

@media screen and (max-width: 600px) {
    .monitoring-section {
        flex-direction: column;
    }
    .relay-grid {
        grid-template-columns: 1fr;
    }
    header {
        flex-direction: column;
        align-items: flex-start;
    }
    .system-status {
        width: 100%;
        justify-content: space-between;
    }
    .voice-container {
        flex-direction: column;
        text-align: center;
    }
}
`,
  scriptJs: `/**
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
    line.innerHTML = \`
        <span class="log-time">[\${time}]</span>
        <span class="log-tag">SYSTEM:</span>
        <span class="log-msg \${type}">\${message}</span>
    \`;
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

        addLog(\`Sensor Update: Suhu \${temperature}°C, Kelembaban \${humidity}%\`, "info");
        
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
    addLog(\`Gagal membaca data dari Firebase: \${error.message}\`, "error");
});

// 3. Memantau & Mengendalikan Relay secara Realtime dari Firebase
const relayRef = ref(db, "relay");
onValue(relayRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // Membaca status untuk 4 Relay (0 = Mati, 1 = Hidup)
        for (let i = 1; i <= 4; i++) {
            const rKey = \`relay\${i}\`;
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
    const targetRef = ref(db, \`relay/relay\${relayId}\`);
    set(targetRef, stateValue)
        .then(() => {
            showToast(\`Lampu \${relayId} berhasil di\${stateValue === 1 ? 'nyalakan' : 'matikan'}!\`);
            addLog(\`Merubah Lampu \${relayId} ke status \${stateValue === 1 ? 'ON' : 'OFF'}\`, "success");
        })
        .catch((err) => {
            addLog(\`Error memperbarui relay: \${err.message}\`, "error");
        });
}

// Menghubungkan fungsi klik tombol fisik/tampilan di web
for (let i = 1; i <= 4; i++) {
    const rKey = \`relay\${i}\`;
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
        transcriptTextEl.textContent = \`Kesalahan mic: \${event.error}. Tekan mikrofon untuk mencoba kembali.\`;
        addLog("Terjadi error pada mikrofon: " + event.error, "error");
    };

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        transcriptTextEl.textContent = \`"\${text}"\`;
        transcriptTextEl.classList.add("recognized");
        addLog(\`Suara dikenali: "\${text}"\`, "voice");

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
        addLog(\`Perintah suara "\${perintah}" tidak cocok dengan instruksi apa pun.\`, "error");
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
            addLog(\`Simulator: Menyetel Suhu ke \${val}°C\`, "success");
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
            addLog(\`Simulator: Menyetel Kelembaban ke \${val}%\`, "success");
        });
});`,
  firebaseConfigJs: `/**
 * firebase-config.js
 * Konfigurasi Firebase untuk terhubung ke Firebase Realtime Database.
 * Menggunakan Firebase Web Modular SDK v10.12.2 yang diimpor langsung via CDN.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxZXSKQ5fAibifE-ESKtJT9_EEb4Oufd4",
  authDomain: "smart-home-c7386.firebaseapp.com",
  databaseURL: "https://smart-home-c7386-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-home-c7386",
  storageBucket: "smart-home-c7386.firebasestorage.app",
  messagingSenderId: "536884628078",
  appId: "1:536884628078:web:c0c8597a940a06a34bf47f"
};

// Inisialisasi Aplikasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Realtime Database
const db = getDatabase(app);

// Ekspor objek db agar bisa digunakan di script.js
export { db };`
};
