/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * App.tsx - Smart Home IoT Dashboard (React Custom Workspace)
 * Menampilkan Dashboard Interaktif Realtime yang Tersambung ke Firebase Realtime Database,
 * Memfasilitasi Simulasi Sensor, Pengenalan Suara Berbasis Web Speech API,
 * Serta Panel Eksplorasi Kode Sumber Lengkap (HTML, CSS, JS, ESP32) bagi Mahasiswa.
 */

import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "./firebase-config";
import { ref, onValue, set, update } from "firebase/database";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import AuthScreen from "./components/AuthScreen";
import SensorDial from "./components/SensorDial";
import RelaySwitch from "./components/RelaySwitch";
import VoiceVisualizer from "./components/VoiceVisualizer";
import { 
  Sun, 
  Droplet, 
  Power, 
  Mic, 
  MicOff, 
  Clock, 
  Database, 
  Wifi, 
  WifiOff, 
  Terminal, 
  Sliders, 
  Code, 
  BookOpen, 
  FileCode, 
  Folder, 
  Play, 
  ArrowRight, 
  Cpu, 
  Copy, 
  Check,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Info,
  Flame,
  Snowflake,
  Thermometer,
  LogOut,
  Search,
  Bell,
  Settings,
  Plus,
  Tv,
  Monitor,
  User as UserIcon,
  Camera,
  Award,
  Compass,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RelayState, SensorState, LogEntry } from "./types";

export default function App() {
  // --- AUTH SHIELD STATES ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // --- USER PROFILE STATES ---
  const [profileName, setProfileName] = useState<string>("erlan123");
  const [profileImage, setProfileImage] = useState<string>("/src/assets/images/user_profile_erlan_1781435819317.jpg");
  const [userUploadedPhoto, setUserUploadedPhoto] = useState<string | null>(() => {
    const saved = localStorage.getItem("iot_user_custom_upload");
    return saved || null;
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        setUserUploadedPhoto(base64String);
        if (currentUser) {
          localStorage.setItem(`iot_profile_image_${currentUser.uid}`, base64String);
          localStorage.setItem(`iot_user_custom_upload_${currentUser.uid}`, base64String);
          set(ref(db, `users/${currentUser.uid}/profile/image`), base64String);
        } else {
          localStorage.setItem("iot_profile_image", base64String);
          localStorage.setItem("iot_user_custom_upload", base64String);
        }
        triggerToast("Foto profil berhasil diganti!");
        addLog("Foto profil diunggah dari penyimpanan lokal", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // --- STATE SYSTEM ---
  const [temperature, setTemperature] = useState<number>(28);
  const [humidity, setHumidity] = useState<number>(65);
  const [relays, setRelays] = useState<RelayState>({
    relay1: 0,
    relay2: 0,
    relay3: 0,
    relay4: 0
  });
  
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>("00:00:00 WIB");
  const [transcript, setTranscript] = useState<string>("Klik ikon mikrofon untuk berbicara perintah suara...");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour12: false }),
      message: "Sistem IoT Smart Home berhasil diinisialisasi.",
      type: "success"
    }
  ]);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronise authentication state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Synchronise current user profile distinctly from Realtime Database & local cache
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      const savedName = localStorage.getItem("iot_profile_name") || "erlan123";
      const savedImage = localStorage.getItem("iot_profile_image") || "/src/assets/images/user_profile_erlan_1781435819317.jpg";
      const savedCustom = localStorage.getItem("iot_user_custom_upload");
      setProfileName(savedName);
      setProfileImage(savedImage);
      if (savedCustom) {
        setUserUploadedPhoto(savedCustom);
      }
      return;
    }

    const localUserKeyName = `iot_profile_name_${currentUser.uid}`;
    const localUserKeyImg = `iot_profile_image_${currentUser.uid}`;
    const localUserKeyCustomUpload = `iot_user_custom_upload_${currentUser.uid}`;
    const userCachedName = localStorage.getItem(localUserKeyName) || currentUser.displayName || "Pengguna";
    const userCachedImg = localStorage.getItem(localUserKeyImg) || currentUser.photoURL || "/src/assets/images/user_profile_erlan_1781435819317.jpg";
    const savedCustom = localStorage.getItem(localUserKeyCustomUpload);
    
    setProfileName(userCachedName);
    setProfileImage(userCachedImg);
    if (savedCustom) {
      setUserUploadedPhoto(savedCustom);
    } else if (userCachedImg.startsWith("data:image/") || (userCachedImg.startsWith("http") && !userCachedImg.includes("images.unsplash.com"))) {
      setUserUploadedPhoto(userCachedImg);
      localStorage.setItem(localUserKeyCustomUpload, userCachedImg);
    }

    const profileRef = ref(db, `users/${currentUser.uid}/profile`);
    const unsubscribeProfile = onValue(profileRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.name) {
          setProfileName(data.name);
          localStorage.setItem(localUserKeyName, data.name);
        }
        if (data.image) {
          setProfileImage(data.image);
          localStorage.setItem(localUserKeyImg, data.image);
          if (data.image.startsWith("data:image/") || (data.image.startsWith("http") && !data.image.includes("images.unsplash.com"))) {
            setUserUploadedPhoto(data.image);
            localStorage.setItem(localUserKeyCustomUpload, data.image);
          }
        }
      } else {
        set(profileRef, {
          name: userCachedName,
          image: userCachedImg
        });
      }
    });

    return () => {
      unsubscribeProfile();
    };
  }, [currentUser, authLoading]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      addLog("Pengguna keluar dari sesi (Sign Out).", "info");
      triggerToast("Sesi keluar berhasil!");
    } catch (err: any) {
      addLog("Gagal keluar dari sesi: " + err.message, "error");
    }
  };

  const [activeMode, setActiveMode] = useState<number | null>(null);
  const modeIntervalRef = useRef<any>(null);
  const modeTimeoutRefs = useRef<any[]>([]);

  // --- VOICE ALERTS PROFILE STATES & THRESHOLDS ---
  const [tempAlertEnabled, setTempAlertEnabled] = useState<boolean>(true);
  const [tempThreshold, setTempThreshold] = useState<number>(32);
  const [tempThresholdLow, setTempThresholdLow] = useState<number>(20);
  const [snoozeTempAlert, setSnoozeTempAlert] = useState<boolean>(false);
  const [tempAlertTimeLeft, setTempAlertTimeLeft] = useState<number>(5);
  const [humAlertEnabled, setHumAlertEnabled] = useState<boolean>(true);
  const [humThresholdHigh, setHumThresholdHigh] = useState<number>(80);
  const [humThresholdLow, setHumThresholdLow] = useState<number>(40);

  const lastAlertSpeechRef = useRef<{ temp: number; hum: number }>({ temp: 0, hum: 0 });
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const isMutedForSpeechRef = useRef<boolean>(false);

  const activeModeRef = useRef<number | null>(null);
  const temperatureRef = useRef<number>(28);
  const humidityRef = useRef<number>(65);

  const consoleContainerRef = useRef<HTMLDivElement>(null);

  // --- AUDIO VOICE NOTIFICATION UTILITY (SPEECH SYNTHESIS) ---
  const speakNotification = (text: string, callback?: () => void) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 1.1; // Slightly faster for natural rhythm
      utterance.pitch = 1.0;

      // Find an Indonesian voice automatically
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith("id") || v.lang.includes("ID"));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      utterance.onstart = () => {
        isMutedForSpeechRef.current = true;
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (e) {}
        }
      };

      const handleSpeechEnd = () => {
        isMutedForSpeechRef.current = false;
        if (callback) callback();
        // Wait 400ms to allow audio synthesis to fully clear, then resume mic if enabled
        setTimeout(() => {
          if (isListeningRef.current && !isMutedForSpeechRef.current && !window.speechSynthesis.speaking) {
            startActualRecognition();
          }
        }, 400);
      };

      utterance.onend = handleSpeechEnd;
      utterance.onerror = handleSpeechEnd;

      window.speechSynthesis.speak(utterance);
    } else {
      if (callback) callback();
    }
  };

  // Sinkronisasi ref agar selalu menyimpan state terupdate guna menghindari stale closure pada pengenal suara (Speech Recognition)
  useEffect(() => {
    activeModeRef.current = activeMode;
  }, [activeMode]);

  useEffect(() => {
    temperatureRef.current = temperature;
  }, [temperature]);

  useEffect(() => {
    humidityRef.current = humidity;
  }, [humidity]);

  // Cleanup auto-combination loops on unmount
  useEffect(() => {
    return () => {
      if (modeIntervalRef.current) clearInterval(modeIntervalRef.current);
      modeTimeoutRefs.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // --- COMBINATION LIGHT MODES SCHEMES ---
  const clearActiveModes = () => {
    setActiveMode(null);
    activeModeRef.current = null;
    if (modeIntervalRef.current) {
      clearInterval(modeIntervalRef.current);
      modeIntervalRef.current = null;
    }
    modeTimeoutRefs.current.forEach(t => clearTimeout(t));
    modeTimeoutRefs.current = [];
  };

  // Mode 1: Patroli Malam (Running Chaser)
  const startMode1 = () => {
    clearActiveModes();
    setActiveMode(1);
    addLog("Meluncurkan Mode Kombinasi 1: Patroli Malam.", "success");
    speakNotification("Memulai mode kombinasi satu. Lampu patroli malam aktif.");

    let step = 0;
    const runStep = () => {
      const cycles = [
        { relay1: 1, relay2: 0, relay3: 0, relay4: 0 }, // Lamp 1 ON
        { relay1: 0, relay2: 1, relay3: 0, relay4: 0 }, // Lamp 2 ON
        { relay1: 0, relay2: 0, relay3: 1, relay4: 0 }, // Lamp 3 ON
        { relay1: 0, relay2: 0, relay3: 0, relay4: 1 }, // Lamp 4 ON
        { relay1: 1, relay2: 0, relay3: 1, relay4: 0 }, // Lamp 1 & 3 ON (alternate)
        { relay1: 0, relay2: 1, relay3: 0, relay4: 1 }, // Lamp 2 & 4 ON (alternate)
        { relay1: 1, relay2: 1, relay3: 1, relay4: 1 }, // All ON
        { relay1: 0, relay2: 0, relay3: 0, relay4: 0 }, // All OFF
      ];
      const targetState = cycles[step % cycles.length];
      step++;

      update(ref(db, "relay"), targetState)
        .catch(err => addLog("Gagal sinkron Mode 1: " + err.message, "error"));
    };

    runStep();
    modeIntervalRef.current = setInterval(runStep, 1000);
  };

  // Mode 2: Pesta Disko Strobe (Fast alternate toggle)
  const startMode2 = () => {
    clearActiveModes();
    setActiveMode(2);
    addLog("Meluncurkan Mode Kombinasi 2: Pesta Disko Strobe.", "success");
    speakNotification("Memulai mode kombinasi dua. Lampu disko pesta diaktifkan.");

    let step = 0;
    const runStep = () => {
      const cycles = [
        { relay1: 1, relay2: 0, relay3: 1, relay4: 0 }, // Ganjil ON
        { relay1: 0, relay2: 1, relay3: 0, relay4: 1 }, // Genap ON
        { relay1: 1, relay2: 1, relay3: 0, relay4: 0 }, // Bagian depan ON
        { relay1: 0, relay2: 0, relay3: 1, relay4: 1 }, // Bagian belakang ON
        { relay1: 1, relay2: 0, relay3: 0, relay4: 1 }, // Menyebar luar
        { relay1: 0, relay2: 1, relay3: 1, relay4: 0 }, // Menyebar dalam
      ];
      const targetState = cycles[step % cycles.length];
      step++;

      update(ref(db, "relay"), targetState)
        .catch(err => addLog("Gagal sinkron Mode 2: " + err.message, "error"));
    };

    runStep();
    modeIntervalRef.current = setInterval(runStep, 500); // Fast strobe 500ms
  };

  // Hentikan Mode
  const stopMode = () => {
    // Selalu bersihkan loop / interval aktif terlebih dahulu untuk memutus perulangan
    const wasActive = activeModeRef.current !== null;
    clearActiveModes();

    if (wasActive) {
      addLog("Mode kombinasi otomatis dihentikan.", "info");
      speakNotification("Mode kombinasi dihentikan.");
    } else {
      addLog("Menghentikan sistem dan mematikan semua relay.", "info");
      speakNotification("Mode dihentikan. Semua relay dinonaktifkan.");
    }

    // Kembalikan semua relay ke kondisi OFF aman
    const resetState = { relay1: 0, relay2: 0, relay3: 0, relay4: 0 };
    update(ref(db, "relay"), resetState)
      .catch(err => addLog("Gagal mereset relay: " + err.message, "error"));
  };

  // --- HELPER UNTUK MENAMBAH LOG TELEMETRI ---
  const addLog = (message: string, type: LogEntry['type'] = "info") => {
    const timestamp = new Date().toLocaleTimeString("id-ID", { hour12: false });
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Auto scroll logs
  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTo({
        top: consoleContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [logs]);

  // --- JAM DIGITAL REALTIME ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      setCurrentTime(`${timeStr} WIB`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- DETEKSI AMBANG BATAS & PERINGATAN SUARA ---
  useEffect(() => {
    const now = Date.now();
    
    // Check Temperature Alert
    if (tempAlertEnabled) {
      if (temperature > tempThreshold) {
        // Cooldown of 15 seconds to prevent continuous trigger spam
        if (now - lastAlertSpeechRef.current.temp > 15000) {
          lastAlertSpeechRef.current.temp = now;
          const warningText = `Peringatan! Suhu ruangan terlalu tinggi, mencapai ${temperature} derajat Celcius. Mohon nyalakan pendingin ruangan.`;
          speakNotification(warningText);
          addLog(`[ALARM SUARA] Suhu ${temperature}°C melewati batas atas ${tempThreshold}°C.`, "warning");
          triggerToast(`⚠️ Alarm Suhu Tinggi: ${temperature}°C!`);
        }
      } else if (temperature < tempThresholdLow) {
        // Cooldown of 15 seconds
        if (now - lastAlertSpeechRef.current.temp > 15000) {
          lastAlertSpeechRef.current.temp = now;
          const warningText = `Peringatan! Suhu ruangan terlalu dingin, mencapai ${temperature} derajat Celcius. Mohon matikan pendingin atau nyalakan pemanas.`;
          speakNotification(warningText);
          addLog(`[ALARM SUARA] Suhu ${temperature}°C berada di bawah batas bawah ${tempThresholdLow}°C.`, "warning");
          triggerToast(`⚠️ Alarm Suhu Rendah: ${temperature}°C!`);
        }
      }
    }

    // Check Humidity Alert (High / Low)
    if (humAlertEnabled) {
      if (humidity > humThresholdHigh) {
        if (now - lastAlertSpeechRef.current.hum > 15000) {
          lastAlertSpeechRef.current.hum = now;
          const warningText = `Peringatan! Kelembaban udara terlalu tinggi, mencapai ${humidity} persen.`;
          speakNotification(warningText);
          addLog(`[ALARM SUARA] Kelembaban ${humidity}% melewati batas tinggi ${humThresholdHigh}%.`, "warning");
          triggerToast(`⚠️ Alarm Kelembaban Tinggi: ${humidity}%!`);
        }
      } else if (humidity < humThresholdLow) {
        if (now - lastAlertSpeechRef.current.hum > 15000) {
          lastAlertSpeechRef.current.hum = now;
          const warningText = `Peringatan! Kelembaban udara terlalu kering, yaitu ${humidity} persen.`;
          speakNotification(warningText);
          addLog(`[ALARM SUARA] Kelembaban ${humidity}% berada di bawah batas minimum ${humThresholdLow}%.`, "warning");
          triggerToast(`⚠️ Alarm Kelembaban Rendah: ${humidity}%!`);
        }
      }
    }
  }, [temperature, humidity, tempAlertEnabled, tempThreshold, tempThresholdLow, humAlertEnabled, humThresholdHigh, humThresholdLow]);

  // Auto snooze critical temperature alert after 5 seconds to keep dashboard accessible
  useEffect(() => {
    const isCritical = tempAlertEnabled && (temperature > tempThreshold || temperature < tempThresholdLow);
    if (isCritical) {
      setSnoozeTempAlert(false);
      setTempAlertTimeLeft(5);
      
      const interval = setInterval(() => {
        setTempAlertTimeLeft(prev => {
          if (prev <= 1) {
            setSnoozeTempAlert(true);
            addLog(`Alarm suhu kritis (${temperature}°C) disembunyikan otomatis untuk menjaga kelancaran monitoring.`, "info");
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setSnoozeTempAlert(false);
    }
  }, [temperature, tempThreshold, tempThresholdLow, tempAlertEnabled]);

  // --- SINKRONISASI REALTIME DATABASE FIREBASE ---
  useEffect(() => {
    // 1. Monitor Status Koneksi Firebase (.info/connected)
    const connectedRef = ref(db, ".info/connected");
    const unsubscribeConn = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        setFirebaseConnected(true);
        addLog("Terhubung langsung dengan Firebase Realtime Database.", "success");
        setIsLoading(false);
      } else {
        setFirebaseConnected(false);
        addLog("Koneksi Firebase terputus. Menggunakan data lokal offline...", "warning");
      }
    });

    // 2. Monitor Sensor (Suhu & Kelembaban)
    const sensorRef = ref(db, "sensor");
    const unsubscribeSensor = onValue(sensorRef, (snap) => {
      const data = snap.val() as SensorState | null;
      if (data) {
        setTemperature(data.temperature ?? 0);
        setHumidity(data.humidity ?? 0);
        addLog(`Sensor Sinkron: Suhu ${data.temperature}°C | Hum ${data.humidity}%`, "info");
      } else {
        // Jika skema kosong, buat skema awal
        addLog("Database kosong. Melakukan inisialisasi awal skema IoT...", "info");
        seedInitialSchema();
      }
    }, (error) => {
      addLog(`Kesalahan membaca sensor: ${error.message}`, "error");
    });

    // 3. Monitor Status 4 Relay
    const relayRef = ref(db, "relay");
    const unsubscribeRelay = onValue(relayRef, (snap) => {
      const data = snap.val() as RelayState | null;
      if (data) {
        setRelays({
          relay1: data.relay1 ?? 0,
          relay2: data.relay2 ?? 0,
          relay3: data.relay3 ?? 0,
          relay4: data.relay4 ?? 0
        });
      }
    }, (error) => {
      addLog(`Kesalahan membaca relay: ${error.message}`, "error");
    });

    return () => {
      unsubscribeConn();
      unsubscribeSensor();
      unsubscribeRelay();
    };
  }, []);

  // Inisialisasi Database Jika Kosong
  const seedInitialSchema = () => {
    const defaultData = {
      relay: { relay1: 0, relay2: 0, relay3: 0, relay4: 0 },
      sensor: { temperature: 28, humidity: 65 }
    };
    set(ref(db, "/"), defaultData)
      .then(() => addLog("Skema awal berhasil didaftarkan di Firebase Realtime Database.", "success"))
      .catch((err) => addLog("Gagal menyemai skema awal: " + err.message, "error"));
  };

  // --- KOTROL AKTUATOR RELAY ---
  const toggleRelay = (relayId: 1 | 2 | 3 | 4, val: number) => {
    // Jika sedang dalam mode kombinasi, matikan otomatis agar tidak bentrok
    if (activeMode !== null) {
      clearActiveModes();
      addLog("Mengambil alih kontrol manual. Mode kombinasi otomatis dinonaktifkan.", "info");
    }

    set(ref(db, `relay/relay${relayId}`), val)
      .then(() => {
        const textLabel = `Lampu ${relayId}`;
        const speechLabel = `Lampu ${relayId === 1 ? "satu" : relayId === 2 ? "dua" : relayId === 3 ? "tiga" : "empat"}`;
        const actionLabel = val === 1 ? "dinyalakan" : "dimatikan";

        triggerToast(`${textLabel} di${val === 1 ? "aktifkan" : "matikan"}!`);
        addLog(`Merubah ${textLabel} -> ${val === 1 ? "ON" : "OFF"}.`, "success");
        speakNotification(`${speechLabel} ${actionLabel}.`);
      })
      .catch((err) => {
        addLog(`Gagal mengirim sinyal relay: ${err.message}`, "error");
      });
  };

  // --- SIMULATOR SENSOR SLIDER HANDLER ---
  const handleTempSimulate = (val: number) => {
    setTemperature(val);
    set(ref(db, "sensor/temperature"), val)
      .catch((err) => addLog("Gagal sinkron temperatur: " + err.message, "error"));
  };

  const handleHumSimulate = (val: number) => {
    setHumidity(val);
    set(ref(db, "sensor/humidity"), val)
      .catch((err) => addLog("Gagal sinkron kelembaban: " + err.message, "error"));
  };

  // --- DYNAMIC TOAST SYSTEM ---
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // --- VOICE SPEECH COMMAND CONTROLLER ---
  const startActualRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !isListeningRef.current) return;

    if (!recognitionRef.current) {
      try {
        const rec = new SpeechRecognition();
        rec.lang = "id-ID"; // Set to Indonesian
        rec.interimResults = false;
        rec.maxAlternatives = 2; // Memberikan alternatif untuk akurasi pemrosesan lanjut jika diperlukan
        rec.continuous = false; // Mode 'false' jauh lebih responsif, stabil, & tidak gampang timeout/stuck di Chrome

        rec.onstart = () => {
          setIsListening(true);
          isListeningRef.current = true;
          setTranscript("Asisten suara aktif. Silakan beri perintah...");
          addLog("Mikrofon aktif. Mendengarkan perintah suara...", "info");
        };

        rec.onend = () => {
          // Restart secara mandiri bila masih aktif & sedang tidak bersuara (TTS aktif)
          if (isListeningRef.current && !isMutedForSpeechRef.current && !window.speechSynthesis.speaking) {
            try {
              rec.start();
            } catch (e) {
              // Sudah berjalan atau dalam proses memulai kembali
            }
          } else if (!isListeningRef.current) {
            setIsListening(false);
          }
        };

        rec.onerror = (e: any) => {
          if (e.error !== "aborted" && e.error !== "no-speech") {
            addLog(`Kesalahan pencatatan suara: ${e.error}`, "error");
            setTranscript(`Kesalahan mic: ${e.error}. Menyambung ulang...`);
          }
        };

        rec.onresult = (event: any) => {
          const lastIndex = event.results.length - 1;
          const text: string = event.results[lastIndex][0].transcript;
          setTranscript(`"${text}"`);
          addLog(`Suara didengar: "${text}"`, "voice");
          processVoiceCommand(text);
        };

        recognitionRef.current = rec;
      } catch (err: any) {
        addLog("Gagal mengaktifkan mikrofon: " + err.message, "error");
      }
    }

    try {
      recognitionRef.current.start();
    } catch (e) {
      // Sudah berjalan
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListeningRef.current) {
      isListeningRef.current = false;
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Gagal menjeda asisten suara:", e);
        }
      }
      addLog("Asisten kontrol suara dinonaktifkan.", "info");
      speakNotification("Asisten suara mati.");
      return;
    }

    // Toggle on status
    setIsListening(true);
    isListeningRef.current = true;

    // Speak announcement first, then start capturing once speaking finishes
    speakNotification("Asisten suara aktif. Silakan ucapkan perintah.", () => {
      if (isListeningRef.current) {
        startActualRecognition();
      }
    });
  };

  // Memparse Perintah Suara Bahasa Indonesia dengan Toleransi Tinggi
  const processVoiceCommand = (rawCmd: string) => {
    // Normalisasi input suara: hilangkan tanda baca, spasi ganda, dan ubah ke huruf kecil
    const cmd = rawCmd.toLowerCase().trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ");

    addLog(`Memproses suara (normal): "${cmd}"`, "info");
    let recognized = false;

    // Deteksi intensitas kata kunci penonaktifan (Turn Off / Stop)
    const wantOff = 
      cmd.includes("matikan") || 
      cmd.includes("mati") || 
      cmd.includes("padamkan") || 
      cmd.includes("padam") || 
      cmd.includes("hentikan") || 
      cmd.includes("stop") || 
      cmd.includes("off") || 
      cmd.includes("nonaktifkan") || 
      cmd.includes("kembali ke manual") ||
      cmd.includes("batal") ||
      cmd.includes("selesai") ||
      cmd.includes("reset");

    // Deteksi intensitas kata kunci pengaktifan (Turn On / Start)
    const wantOn = 
      cmd.includes("nyalakan") || 
      cmd.includes("nyala") || 
      cmd.includes("hidupkan") || 
      cmd.includes("hidup") || 
      cmd.includes("aktifkan") || 
      cmd.includes("on") ||
      cmd.includes("jalankan") ||
      cmd.includes("mulai") ||
      cmd.includes("start");

    // Pencocokan sinyal stop mode yang kokoh & akurat (Mencegah overlapping dengan perintah lampu tunggal)
    const isStopMode = 
      wantOff && (
        cmd.includes("mode") ||
        cmd.includes("kombinasi") ||
        cmd.includes("sekuens") ||
        cmd.includes("sekuen") ||
        cmd.includes("patroli") ||
        cmd.includes("disko") ||
        cmd.includes("pesta") ||
        cmd.includes("strobe")
      ) ||
      cmd === "stop" ||
      cmd === "matikan" ||
      cmd === "off" ||
      cmd === "reset" ||
      cmd === "selesai" ||
      cmd.includes("reset lampu") ||
      cmd.includes("reset relay") ||
      cmd.includes("mode off") ||
      cmd.includes("kombinasi off") ||
      cmd.includes("sekuens off") ||
      cmd.includes("sekuen off");

    // Pencocokan Mode 1 (Patroli Malam) - Hanya jika ada kata kunci mode/kombinasi/sekuen/patroli dan TIDAK sedang mematikan
    const isMode1 = !wantOff && (
      cmd.includes("mode satu") || 
      cmd.includes("mode 1") || 
      cmd.includes("model satu") || 
      cmd.includes("model 1") || 
      cmd.includes("modeh satu") ||
      cmd.includes("modeh 1") ||
      cmd.includes("kombinasi satu") || 
      cmd.includes("kombinasi 1") ||
      cmd.includes("sekuens satu") ||
      cmd.includes("sekuens 1") ||
      cmd.includes("sekuen satu") ||
      cmd.includes("sekuen 1") ||
      cmd.includes("patroli malam") ||
      cmd.includes("patroli")
    );

    // Pencocokan Mode 2 (Pesta Disko Strobe) - Hanya jika ada kata kunci mode/kombinasi/sekuen/disko/pesta dan TIDAK sedang mematikan
    const isMode2 = !wantOff && (
      cmd.includes("mode dua") || 
      cmd.includes("mode 2") || 
      cmd.includes("model dua") || 
      cmd.includes("model 2") || 
      cmd.includes("modeh dua") ||
      cmd.includes("modeh 2") ||
      cmd.includes("kombinasi dua") || 
      cmd.includes("kombinasi 2") ||
      cmd.includes("sekuens dua") ||
      cmd.includes("sekuens 2") ||
      cmd.includes("sekuen dua") ||
      cmd.includes("sekuen 2") ||
      cmd.includes("pesta disko") ||
      cmd.includes("strobe") ||
      cmd.includes("disko") ||
      cmd.includes("pesta")
    );

    const isSensorCheck = 
      cmd.includes("cek sensor") || 
      cmd.includes("status sensor") || 
      cmd.includes("baca sensor") || 
      cmd.includes("laporan sensor") || 
      cmd.includes("kondisi sensor") ||
      cmd.includes("cek suhu") || 
      cmd.includes("berapa suhu") || 
      cmd.includes("cek kelembaban") || 
      cmd.includes("berapa kelembaban") || 
      cmd.includes("cek kondisi") ||
      cmd.includes("status ruangan") ||
      cmd.includes("bagaimana suhu") ||
      cmd.includes("bagaimana kelembaban") ||
      cmd.includes("cek temperatur") ||
      cmd.includes("berapa temperatur");

    const isSpecialCmd = isMode1 || isMode2 || isStopMode || isSensorCheck;

    if (!isSpecialCmd && activeModeRef.current !== null) {
      clearActiveModes();
    }

    // Penanganan Perintah Suara Global / Semua Lampu
    if (cmd.includes("nyalakan semua lampu") || cmd.includes("hidupkan semua") || cmd.includes("nyalakan semua")) {
      const updates = { "relay1": 1, "relay2": 1, "relay3": 1, "relay4": 1 };
      update(ref(db, "relay"), updates)
        .then(() => {
          triggerToast("Menyalakan semua lampu!");
          addLog("Voice Command: Mengaktifkan semua lampu sekaligus.", "success");
          speakNotification("Menyalakan semua lampu.");
        });
      recognized = true;
    } 
    else if (cmd.includes("matikan semua lampu") || cmd.includes("padamkan semua") || cmd.includes("matikan semua")) {
      const updates = { "relay1": 0, "relay2": 0, "relay3": 0, "relay4": 0 };
      update(ref(db, "relay"), updates)
        .then(() => {
          triggerToast("Mematikan semua lampu!");
          addLog("Voice Command: Memadamkan seluruh lampu.", "success");
          speakNotification("Mematikan semua lampu.");
        });
      recognized = true;
    }
    // Eksekusi Berdasarkan Evaluasi Tertinggi
    else if (isMode1) {
      startMode1();
      recognized = true;
    }
    else if (isMode2) {
      startMode2();
      recognized = true;
    }
    else if (isStopMode) {
      stopMode();
      recognized = true;
    }
    else if (isSensorCheck) {
      const sensorSpeech = `Laporan status sensor. Suhu saat ini adalah ${temperatureRef.current} derajat Celcius, dan kelembaban udara sebesar ${humidityRef.current} persen.`;
      triggerToast(`Suhu: ${temperatureRef.current}°C, Kelembaban: ${humidityRef.current}%`);
      addLog(`Voice Command: Cek status sensor -> Suhu ${temperatureRef.current}°C, Kelembaban ${humidityRef.current}%`, "success");
      speakNotification(sensorSpeech);
      recognized = true;
    }
    else {
      // Deteksi spesifik untuk relay 1-4 dengan kamus variasi ucapan lokal (toleran tingkat tinggi)
      const relayMapping = [
        { 
          id: 1 as 1, 
          name: "lampu satu", 
          keywords: ["lampu 1", "lampu satu", "lampu kesatu", "model 1", "model satu", "relay 1", "relay satu", "teras", "belakang", "depan", "nomor satu", "nomor 1", "lampu tumpu", "satu", "1"] 
        },
        { 
          id: 2 as 2, 
          name: "lampu dua", 
          keywords: ["lampu 2", "lampu dua", "lampu kedua", "model 2", "model dua", "relay 2", "relay dua", "keluarga", "tengah", "nomor dua", "nomor 2", "dua", "2"] 
        },
        { 
          id: 3 as 3, 
          name: "lampu tiga", 
          keywords: ["lampu 3", "lampu tiga", "lampu ketiga", "model 3", "model tiga", "relay 3", "relay tiga", "kamar", "tidur", "nomor tiga", "nomor 3", "tiga", "3"] 
        },
        { 
          id: 4 as 4, 
          name: "lampu empat", 
          keywords: ["lampu 4", "lampu empat", "lampu keempat", "relay 4", "relay empat", "pompa", "sanyo", "air", "mesin air", "nomor empat", "nomor 4", "empat", "4"] 
        }
      ];

      if (wantOn || wantOff) {
        const targetValue = wantOn ? 1 : 0;
        for (const map of relayMapping) {
          for (const keyword of map.keywords) {
            if (cmd.includes(keyword)) {
              toggleRelay(map.id, targetValue);
              recognized = true;
              break;
            }
          }
          if (recognized) break;
        }
      }
    }

    if (!recognized) {
      triggerToast("Perintah suara tidak dikenali.");
      addLog(`Voice command tidak cocok dengan parameter IoT: "${cmd}"`, "warning");
      speakNotification("Perintah tidak dimengerti.");
    }
  };

  const isTempCritical = tempAlertEnabled && (temperature > tempThreshold || temperature < tempThresholdLow);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center font-sans selection:bg-cyan-500 selection:text-slate-900 relative">
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
          <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest animate-pulse">Menghubungkan Sesi Aman...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-[#080517] text-gray-100 flex flex-col font-sans selection:bg-purple-500 selection:text-slate-900 relative">
      
      {/* Background radial soft light blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* --- ELEGANT FULL-SCREEN WARNING OVERLAY FOR CRITICAL TEMPERATURE --- */}
      <AnimatePresence>
        {isTempCritical && !snoozeTempAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 28, stiffness: 380 }}
              className={`bg-[#130f30] border ${temperature > tempThreshold ? 'border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.15)]' : 'border-purple-500/30 shadow-[0_0_50px_rgba(139,92,246,0.15)]'} rounded-[28px] p-6 sm:p-8 max-w-md w-full text-center relative overflow-hidden backdrop-blur-2xl`}
            >
              {/* Countdown Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-900 overflow-hidden">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: `${(tempAlertTimeLeft / 5) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                  className={`h-full bg-gradient-to-r ${temperature > tempThreshold ? 'from-rose-500 to-orange-500' : 'from-purple-500 to-indigo-500'}`}
                />
              </div>

              {/* Glowing backlights */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 ${temperature > tempThreshold ? 'bg-rose-500/10' : 'bg-purple-500/10'} rounded-full blur-3xl pointer-events-none -translate-y-12 animate-pulse`} />

              {/* Glowing Hazard Circle with Dynamic Icons */}
              <div className="flex justify-center mb-6 mt-2">
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className={`absolute inset-0 ${temperature > tempThreshold ? 'bg-rose-500/15' : 'bg-purple-500/15'} rounded-full blur-md`}
                  />
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center relative z-10 border ${temperature > tempThreshold ? 'bg-rose-500/20 border-rose-500/45 text-rose-400' : 'bg-purple-500/20 border-purple-500/45 text-purple-300'}`}>
                    {temperature > tempThreshold ? (
                      <Flame className="w-8 h-8 animate-pulse text-rose-400" />
                    ) : (
                      <Snowflake className="w-8 h-8 animate-spin text-purple-300" style={{ animationDuration: '10s' }} />
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Status */}
              <div className="mb-4">
                <span className={`text-[9px] uppercase font-mono tracking-widest px-3 py-1 border rounded-full font-bold inline-block ${temperature > tempThreshold ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' : 'bg-purple-500/10 border-purple-500/25 text-purple-300'}`}>
                  PERINGATAN SUHU {temperature > tempThreshold ? 'OVERHEAT' : 'EXTREM DINGIN'}
                </span>
              </div>
              
              <h2 className="text-lg font-bold text-white tracking-tight mb-2">
                {temperature > tempThreshold ? "Suhu Ruangan Terlalu Panas!" : "Suhu Ruangan Terlalu Dingin!"}
              </h2>

              <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto mb-6">
                Terdeteksi suhu ruangan saat ini adalah <strong className={`font-mono font-bold px-2 py-0.5 rounded border ${temperature > tempThreshold ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-300'}`}>{temperature} °C</strong>, melampaui kondisi aman Anda yaitu <span className="text-gray-300 font-semibold">{tempThresholdLow}°C s/d {tempThreshold}°C</span>.
              </p>

              {/* Suggested Action Bar */}
              <div className="bg-[#0b0821] border border-[#251c5a]/60 p-4 rounded-2xl mb-6 text-left shadow-inner">
                <div className="flex items-center gap-1.5 mb-1 text-[9px] font-semibold text-gray-500 font-mono tracking-wider uppercase">
                  <Thermometer className="w-3.5 h-3.5 text-gray-400" />
                  <span>Rekomendasi Tindakan:</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  {temperature > tempThreshold ? (
                    "Suasana terlampau panas. Pastikan ventilasi udara terbuka, atau fungsikan Kipas Angin / AC ruangan untuk menurunkan tingkat panas."
                  ) : (
                    "Suasana dingin ekstrem. Harap nonaktifkan AC atau fungsikan perangkat penghangat guna menjaga sirkulasi suhu optimal."
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <button 
                  onClick={() => setSnoozeTempAlert(true)}
                  className={`flex-1 font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-md ${temperature > tempThreshold ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-955/20' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-955/20'}`}
                >
                  Tutup ({tempAlertTimeLeft}s)
                </button>
                <button 
                  onClick={() => {
                    if (temperature > tempThreshold) {
                      setTempThreshold(temperature + 3);
                    } else if (temperature < tempThresholdLow) {
                      setTempThresholdLow(temperature - 3);
                    }
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-gray-300 hover:text-white border border-gray-800/80 font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                >
                  Sesuaikan Ambang
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FLOATING NOTIFICATION SYSTEM (TOAST) --- */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#130f30] border border-orange-500/30 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-sm font-medium tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DASHBOARD HEADER --- */}
      <header className="border-b border-[#211a52]/40 bg-[#0c091f]/85 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
              <Sun className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Smart Home IoT Hub 
                <span className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full font-mono font-medium">LIVE PREVIEW</span>
              </h1>
              <p className="text-xs text-violet-300/40 mt-0.5">Firebase Realtime Database & Voice Control Workspace</p>
            </div>
          </div>
        </div>

        {/* Mockup Premium controls: Profile action */}
        <div className="flex items-center flex-wrap gap-3.5 w-full sm:w-auto justify-end">

          {/* User Profile Badge */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-[#130f30] border border-[#251c5a]/60 pl-2 pr-3.5 py-1.5 rounded-full text-xs font-mono">
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 focus:outline-none group active:scale-95 transition-all text-left cursor-pointer"
                title="Buka Pengaturan Profil"
              >
                {profileImage ? (
                  <img referrerPolicy="no-referrer" src={profileImage} alt="Avatar" className="w-[18px] h-[18px] rounded-full border border-purple-500/50 group-hover:border-purple-400 transition-colors object-cover" />
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <UserIcon className="w-2.5 h-2.5 text-purple-300" />
                  </div>
                )}
                <span className="text-gray-300 font-bold max-w-[120px] truncate group-hover:text-purple-400 transition-colors">
                  {profileName}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="ml-2 pl-2 border-l border-[#2e236b] text-gray-500 hover:text-red-400 cursor-pointer transition-all focus:outline-none"
                title="Keluar (Sign Out)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Connection Indicator */}
          <div className="flex items-center gap-2 bg-[#130f30] border border-[#251c5a]/60 px-3.5 py-1.5 rounded-full text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${firebaseConnected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" : "bg-red-400 animate-pulse"}`} />
            <span className="text-gray-300 font-medium">
              {firebaseConnected ? "RTDB CONNECTED" : "OFFLINE MODE"}
            </span>
          </div>

          {/* Clock Widget */}
          <div className="flex items-center gap-1.5 bg-purple-500/5 border border-purple-500/20 text-purple-300 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium shadow-[0_0_15px_rgba(139,92,246,0.05)]">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentTime}</span>
          </div>
        </div>
      </header>

      {/* --- MAIN GRID CONTAINER --- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10 font-sans">
        
        {/* TOP SYSTEM METRICS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#130f30]/80 border border-[#251c5a]/60 rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-violet-300/40 tracking-wider">Sumber Sinkronisasi</p>
              <h4 className="text-xs font-bold text-white uppercase tracking-tight">
                {firebaseConnected ? "Firebase RTDB Secure" : "Mode Offline Lokal"}
              </h4>
            </div>
          </div>

          <div className="bg-[#130f30]/80 border border-[#251c5a]/60 rounded-2xl p-4 flex items-center gap-4 hover:border-emerald-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-violet-300/40 tracking-wider">Engine Simulasi</p>
              <h4 className="text-xs font-bold text-white uppercase tracking-tight">Active Core v2.4 (Virtual)</h4>
            </div>
          </div>

          <div className="bg-[#130f30]/80 border border-[#251c5a]/60 rounded-2xl p-4 flex items-center gap-4 hover:border-orange-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-[#251c5a]/60 border-orange-500/20 flex items-center justify-center text-orange-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-violet-300/40 tracking-wider">Mode Sekuensial</p>
              <h4 className="text-xs font-bold text-white uppercase tracking-tight">
                {activeMode ? `Skenario ${activeMode} Aktif` : "Standby/Manual"}
              </h4>
            </div>
          </div>
        </div>

        {/* ASYMMETRIC BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= LEFT ZONE (7 COLS) ================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* WELCOME HOME PANEL WITH PHOTO AND NAME ONLY */}
            <div className="bg-[#130f30]/80 border border-[#251c5a]/60 rounded-[28px] p-6 sm:p-8 shadow-[0_15px_40px_rgba(12,9,31,0.5)] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Decorative radial card lights */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex-1 space-y-2 text-center sm:text-left z-10">
                <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 font-bold">PROFIL PENGGUNA</span>
                <h2 className="text-2xl sm:text-3.5xl font-extrabold text-white tracking-tight">
                  Welcome home, <span className="text-purple-350">{profileName}</span>!
                </h2>
                <p className="text-[11px] text-violet-300/40">Sistem Pintar IoT aktif dan dipantau oleh admin.</p>
              </div>

              {/* Dynamic Profile Image Wrapper */}
              <div 
                onClick={() => setIsProfileModalOpen(true)}
                className="p-1 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.25)] shrink-0 flex items-center justify-center relative cursor-pointer active:scale-95 transition-all group z-10"
                title="Saling Klik Untuk Ganti Foto Profil"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#130f30] overflow-hidden bg-slate-900 relative">
                  <img 
                    src={profileImage} 
                    alt="Current Avatar" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-white font-bold">UBAH</span>
                  </div>
                </div>
                {/* Dynamic live status pulse indicator */}
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#130f30] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
            </div>

          </div>

          {/* ================= RIGHT ZONE (5 COLS) ================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* ROOMS CONTROLLER CONTAINER */}
            <div className="bg-[#130f30]/80 border border-[#251c5a]/60 rounded-[28px] p-6 shadow-[0_15px_40px_rgba(12,9,31,0.5)]">
              <div className="flex justify-between items-center mb-6 border-b border-[#251c5a]/50 pb-3">
                <div>
                  <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-1">Kontrol Lampu</h3>
                  <p className="text-[10px] text-violet-300/40 font-mono">Relay 1 - 4</p>
                </div>
                <span className="text-[9px] bg-purple-500/5 text-purple-300 border border-purple-500/15 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wide">ONLINE</span>
              </div>

              {/* Switches interactive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RelaySwitch
                  title="Lampu 1"
                  relayNum={1}
                  value={relays.relay1}
                  icon={Sun}
                  colorType="orange"
                  description="Kontrol Relay Lampu 1"
                  deviceText="Relay Lampu 1"
                  onToggle={toggleRelay}
                />
                <RelaySwitch
                  title="Lampu 2"
                  relayNum={2}
                  value={relays.relay2}
                  icon={Sun}
                  colorType="purple"
                  description="Kontrol Relay Lampu 2"
                  deviceText="Relay Lampu 2"
                  onToggle={toggleRelay}
                />
                <RelaySwitch
                  title="Lampu 3"
                  relayNum={3}
                  value={relays.relay3}
                  icon={Sun}
                  colorType="cyan"
                  description="Kontrol Relay Lampu 3"
                  deviceText="Relay Lampu 3"
                  onToggle={toggleRelay}
                />
                <RelaySwitch
                  title="Lampu 4"
                  relayNum={4}
                  value={relays.relay4}
                  icon={Sun}
                  colorType="emerald"
                  description="Kontrol Relay Lampu 4"
                  deviceText="Relay Lampu 4"
                  onToggle={toggleRelay}
                />
              </div>
            </div>

            {/* DYNAMIC SCENARIO SMART SCENES MODULE */}
            <div className="bg-[#130f30]/80 border border-[#251c5a]/60 rounded-[28px] p-5 sm:p-6 shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#251c5a]/50">
                <div>
                  <h3 className="font-bold text-white text-xs tracking-wide uppercase">Skenario Patroli & Disko</h3>
                  <p className="text-[9.5px] text-violet-300/40 mt-1 leading-relaxed">Uji respon sinkronisasi berulangan cepat otomatis</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button 
                  onClick={startMode1}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                    activeMode === 1 
                      ? "bg-purple-500/10 border-purple-500/40 text-purple-300" 
                      : "bg-[#171141] border-[#251c5a]/60 hover:border-purple-500/30"
                  }`}
                >
                  <span className="text-[8px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-1 py-0.2 rounded font-mono mb-1 inline-block">PATROLI</span>
                  <h4 className="text-[9.5px] font-bold text-white truncate">1. Patroli</h4>
                </button>

                <button 
                  onClick={startMode2}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                    activeMode === 2 
                      ? "bg-orange-500/10 border-orange-500/40 text-orange-300" 
                      : "bg-[#171141] border-[#251c5a]/60 hover:border-orange-500/30"
                  }`}
                >
                  <span className="text-[8px] bg-orange-500/15 text-orange-400 border border-orange-500/30 px-1 py-0.2 rounded font-mono mb-1 inline-block">DISKO</span>
                  <h4 className="text-[9.5px] font-bold text-white truncate">2. Strobe</h4>
                </button>

                <button 
                  onClick={stopMode}
                  disabled={activeMode === null}
                  className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                    activeMode === null 
                      ? "bg-[#130f30]/40 border-slate-900/40 opacity-40 cursor-not-allowed" 
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-wide font-mono mb-1 inline-block text-rose-400">Padamkan</span>
                  <h4 className="text-[9.5px] font-bold text-white truncate">Hentikan</h4>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* --- EXPANDABLE ADVANCED CORE MODULES (SENSORS RANGE, VOICE, TELEMETRY) --- */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* SENSOR MONITORING & THRESHOLDS PANEL (7 COLS) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* VOICE COMMAND COMPANION MODULE */}
            <VoiceVisualizer
              isListening={isListening}
              transcript={transcript}
              toggleSpeechRecognition={toggleSpeechRecognition}
            />



          </div>

          {/* TELEMETRY CONSOLE LOGGER TERMINAL & CALIBRATED DIALS (5 COLS) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* CALIBRATED MULTIPURPOSE RADIAL METRICS */}
            <div className="bg-[#130f30]/80 border border-[#251c5a]/60 rounded-[28px] p-5 shadow-lg space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-violet-300/70 border-b border-[#251c5a]/40 pb-2 flex items-center justify-between">
                <span>temperature</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <SensorDial
                  title="SUHU RUANGAN"
                  value={temperature}
                  unit="°C"
                  status={temperature > 32 ? "Panas ekstrem" : temperature < 20 ? "Dingin" : "Normal"}
                  statusColor={temperature > 32 ? "rose" : temperature < 20 ? "sky" : "emerald"}
                  max={50}
                  icon={Sun}
                  gradientId="tempProgressGrad"
                  gradientColors={{ stop1: "#a78bfa", stop2: "#f97316" }}
                />

                <SensorDial
                  title="KELEMBABAN UDARA"
                  value={humidity}
                  unit="% RH"
                  status={humidity > 80 ? "Sangat Lembab" : humidity < 40 ? "Kering" : "Ideal"}
                  statusColor={humidity > 80 ? "blue" : humidity < 40 ? "amber" : "teal"}
                  max={100}
                  icon={Droplet}
                  gradientId="humProgressGrad"
                  gradientColors={{ stop1: "#a78bfa", stop2: "#a78bfa" }}
                />
              </div>
            </div>

            {/* TELEMETRY CONSOLE LOGGER TERMINAL */}
            <div className="bg-[#0b0821] border border-[#251c5a]/60 rounded-[28px] p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#251c5a]/50">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-orange-400" />
                  <h3 className="font-bold text-violet-300/60 text-xs font-mono lowercase">terminal_telemetry_logs</h3>
                </div>
                <button 
                  onClick={() => setLogs([])}
                  className="text-[9.5px] text-violet-300/40 hover:text-white hover:underline transition-colors cursor-pointer font-semibold uppercase tracking-wider font-mono bg-[#171141] px-2 py-0.5 rounded border border-[#271d64]"
                >
                  Clear Console
                </button>
              </div>
              
              <div ref={consoleContainerRef} className="h-44 overflow-y-auto font-mono text-[10px] space-y-1.5 bg-black/45 p-3 rounded-xl border border-gray-950 selection:bg-gray-800 selection:text-white scroll-smooth pb-1 text-left">
                {logs.length === 0 ? (
                  <p className="text-gray-600 text-center py-6 block w-full select-none">SYSTEM STANDBY - MENUNGGU TELEMETRI AKTIF</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex gap-2 items-start leading-relaxed border-b border-gray-950/10 pb-1">
                      <span className="text-purple-400 select-none">[{log.timestamp}]</span>
                      <span className="text-violet-300/30 select-none font-bold">INFO:</span>
                      <span className={`flex-1 ${
                         log.type === "success" ? "text-emerald-400" :
                         log.type === "error" ? "text-rose-450" :
                         log.type === "warning" ? "text-orange-400" :
                         log.type === "voice" ? "text-purple-300 font-medium" : "text-gray-300"
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* --- ELEGANT PROFILE SETTINGS MODAL --- */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#130f30]/95 border border-[#4c35b5]/40 rounded-[32px] p-6 max-w-sm w-full relative overflow-hidden shadow-[0_25px_60px_rgba(76,53,181,0.25)]"
            >
              {/* Radial gradient background light */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -translate-y-12 translate-x-12" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none translate-y-12 -translate-x-12" />

              {/* Close Button */}
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1b1544] border border-[#2b216c]/60 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/50 transition-all cursor-pointer select-none active:scale-90 z-20"
              >
                ✕
              </button>

              {/* Header Title */}
              <div className="text-center mb-6">
                <span className="text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-widest">
                  Pengaturan Profil
                </span>
                <h3 className="text-base font-extrabold text-white mt-2 tracking-tight">Kustomisasi Profil</h3>
                <p className="text-[10px] text-violet-300/40">Ganti foto profil dan nama pengguna Anda</p>
              </div>

              {/* Core Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => document.getElementById("profile-file-input")?.click()}
                  title="Klik untuk unggah foto baru dari perangkat Anda"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-indigo-505 rounded-full blur-[8px] opacity-75 group-hover:opacity-100 transition-opacity animate-pulse duration-1000" />
                  <div className="relative w-24 h-24 rounded-full border-4 border-[#130f30] overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center">
                    <img
                      src={profileImage}
                      alt="Profile Avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform group-hover:scale-115 duration-550"
                    />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white/80 mb-0.5" />
                      <span className="text-[8px] uppercase font-mono tracking-wider text-white font-bold">Upload</span>
                    </div>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input 
                  id="profile-file-input"
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden" 
                />

                <div className="flex gap-2 mt-3.5">
                  <button 
                    onClick={() => document.getElementById("profile-file-input")?.click()}
                    className="px-3 py-1.5 bg-[#171141] hover:bg-[#1f1754] border border-[#2f2372]/60 hover:border-purple-500/50 rounded-full text-[9px] font-bold text-purple-300 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-purple-400" />
                    UNGGAH LOKAL
                  </button>
                </div>
              </div>

              {/* Preset Avatars Selection Row */}
              <div className="bg-[#0b0821] border border-[#251c5a]/65 p-3.5 rounded-2xl mb-5 text-center">
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-purple-300 block mb-2">
                  🎨 Galeri Preset Cepat
                </span>
                <div className="flex items-center justify-center gap-2.5">
                  {[
                    {
                      name: "Unggahan Saya",
                      src: userUploadedPhoto,
                      isUploadSlot: true,
                      isEmpty: !userUploadedPhoto
                    },
                    {
                      name: "Neon Tech",
                      src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80"
                    },
                    {
                      name: "Astronaut",
                      src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=120&h=120&q=80"
                    },
                    {
                      name: "Cyber Grid",
                      src: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=120&h=120&q=80"
                    },
                    {
                      name: "Hacker Room",
                      src: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=120&h=120&q=80"
                    }
                  ].map((preset, index) => {
                    if (preset.isUploadSlot) {
                      if (preset.isEmpty) {
                        return (
                          <button
                            key={index}
                            onClick={() => document.getElementById("profile-file-input")?.click()}
                            className="w-10 h-10 rounded-full border-2 border-dashed border-[#2f2372] hover:border-purple-500/50 hover:bg-[#1a144e] transition-all flex flex-col items-center justify-center text-center text-violet-350/50 hover:text-white cursor-pointer shrink-0 bg-[#0a071c]"
                            title="Belum ada unggahan. Klik untuk unggah!"
                          >
                            <Plus className="w-3.5 h-3.5 text-purple-400 mb-0.5 animate-pulse" />
                            <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tight">Kustom</span>
                          </button>
                        );
                      } else {
                        const isSelected = profileImage === preset.src;
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              if (preset.src) {
                                setProfileImage(preset.src);
                                if (currentUser) {
                                  localStorage.setItem(`iot_profile_image_${currentUser.uid}`, preset.src);
                                  set(ref(db, `users/${currentUser.uid}/profile/image`), preset.src);
                                } else {
                                  localStorage.setItem("iot_profile_image", preset.src);
                                }
                                triggerToast("Kembali menggunakan foto unggahan Anda!");
                                addLog("Mengaktifkan kembali foto unggahan user", "info");
                              }
                            }}
                            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 active:scale-90 relative shrink-0 ${isSelected ? "border-purple-400 scale-105 shadow-[0_0_10px_rgba(139,92,246,0.6)]" : "border-[#2f2372] opacity-65 hover:opacity-100"}`}
                            title="Foto Unggahan Saya"
                          >
                            <img 
                              src={preset.src!} 
                              alt="Unggahan Saya"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute top-0 left-0 bg-purple-600 text-[6.5px] text-white px-1 leading-none rounded-br-md font-mono font-bold scale-95 uppercase">Milikku</div>
                            {isSelected && (
                              <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                <span className="text-[7px] text-white font-extrabold px-0.5 bg-purple-600/80 rounded">✔</span>
                              </div>
                            )}
                          </button>
                        );
                      }
                    }

                    const isSelected = profileImage === preset.src;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setProfileImage(preset.src);
                          if (currentUser) {
                            localStorage.setItem(`iot_profile_image_${currentUser.uid}`, preset.src);
                            set(ref(db, `users/${currentUser.uid}/profile/image`), preset.src);
                          } else {
                            localStorage.setItem("iot_profile_image", preset.src);
                          }
                          triggerToast(`Foto profil diganti ke ${preset.name}!`);
                          addLog(`Foto profil diganti ke preset: ${preset.name}`, "info");
                        }}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 active:scale-90 relative shrink-0 ${isSelected ? "border-purple-400 scale-105 shadow-[0_0_10px_rgba(139,92,246,0.6)]" : "border-[#2f2372] opacity-65 hover:opacity-100"}`}
                        title={preset.name}
                      >
                        <img 
                          src={preset.src} 
                          alt={preset.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                            <span className="text-[7px] text-white font-extrabold px-0.5 bg-purple-600/80 rounded">✔</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-purple-300/55 mb-1.5 font-bold">
                    Nama Profile (Username)
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setProfileName(newName);
                      if (currentUser) {
                        localStorage.setItem(`iot_profile_name_${currentUser.uid}`, newName);
                        set(ref(db, `users/${currentUser.uid}/profile/name`), newName);
                      } else {
                        localStorage.setItem("iot_profile_name", newName);
                      }
                    }}
                    placeholder="Masukkan nama profil..."
                    className="w-full bg-[#0a071d]/90 text-white placeholder-gray-650 border border-[#2c2174] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl py-2.5 px-4 text-xs focus:outline-none transition-all font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-purple-300/55 mb-1.5 font-bold">
                    Saluran URL Foto Profil
                  </label>
                  <input
                    type="text"
                    value={profileImage}
                    onChange={(e) => {
                      const newImg = e.target.value;
                      setProfileImage(newImg);
                      if (currentUser) {
                        localStorage.setItem(`iot_profile_image_${currentUser.uid}`, newImg);
                        set(ref(db, `users/${currentUser.uid}/profile/image`), newImg);
                      } else {
                        localStorage.setItem("iot_profile_image", newImg);
                      }
                    }}
                    placeholder="Atau tempel URL gambar di sini..."
                    className="w-full bg-[#0a071d]/90 text-gray-300 placeholder-gray-650 border border-[#2c2174] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl py-2.5 px-4 text-[10px] focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Action Button to Close / Save */}
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  triggerToast("Perubahan profil berhasil disimpan!");
                  addLog(`Profil diperbarui: Nama "${profileName}"`, "success");
                }}
                className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center select-none border border-transparent"
              >
                Simpan & Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SITE FOOTER --- */}
      <footer className="border-t border-[#211a52]/40 bg-[#060413] py-6 px-6 text-center text-xs text-violet-300/30">
        <p>© 2026 Smart Home IoT Project Workspace. Desain Akademis Mahasiswa Teknik & RPL.</p>
        <p className="mt-2 text-[11px]">
          Powered by Google Gemini 3.5 & Google AI Studio Build.
        </p>
      </footer>

    </div>
  );
}
