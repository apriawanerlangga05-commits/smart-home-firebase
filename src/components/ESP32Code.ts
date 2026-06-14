export const esp32ArduinoCode = `/**
 * Firmware ESP32 - Smart Home IoT dengan Firebase Realtime Database
 * Deskripsi: Membaca status 4 Relay dan menulis data sensor (Temperature & Humidity)
 * Library Pendukung: 
 *   - Firebase ESP Client (oleh Mobizt) -> Install lewat Library Manager
 *   - DHT sensor library (oleh Adafruit)
 */

#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// Menyertakan pembantu token dan penandatanganan protokol Firebase
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

// 1. ISI DENGAN CREDENTIALS WIFI ANDA
#define WIFI_SSID "NAMA_WIFI_ANDA"
#define WIFI_PASSWORD "PASSWORD_WIFI_ANDA"

// 2. ISI DENGAN CONFIGURASI FIREBASE REALTIME DATABASE
#define API_KEY "AIzaSyBxZXSKQ5fAibifE-ESKtJT9_EEb4Oufd4"
#define DATABASE_URL "https://smart-home-c7386-default-rtdb.asia-southeast1.firebasedatabase.app"

// 3. DEFINISI PIN PERANGKAT (ESP32 DevKit V1)
#define RELAY_PIN_1 12  // GPIO12 -> Relay 1
#define RELAY_PIN_2 13  // GPIO13 -> Relay 2
#define RELAY_PIN_3 14  // GPIO14 -> Relay 3
#define RELAY_PIN_4 27  // GPIO27 -> Relay 4

#define DHTPINS 4       // GPIO4 -> Pin Data Sensor DHT11/DHT22 (Jika ada)

// Definisikan Objek Firebase
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;

// Variabel status awal sensor simulasi
float temperatureSim = 26.5;
float humiditySim = 60.0;

void setup() {
  Serial.begin(115200);

  // Konfigurasi Pin Relay sebagai OUTPUT
  pinMode(RELAY_PIN_1, OUTPUT);
  pinMode(RELAY_PIN_2, OUTPUT);
  pinMode(RELAY_PIN_3, OUTPUT);
  pinMode(RELAY_PIN_4, OUTPUT);

  // Matikan semua relay di awal (aktif LOW atau aktif HIGH disesuaikan)
  // Umumnya modul relay aktif LOW (diberi HIGH untuk mati)
  digitalWrite(RELAY_PIN_1, HIGH);
  digitalWrite(RELAY_PIN_2, HIGH);
  digitalWrite(RELAY_PIN_3, HIGH);
  digitalWrite(RELAY_PIN_4, HIGH);

  // Mulai menyambungkan ke Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Menghubungkan ke Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Terhubung ke IP: ");
  Serial.println(WiFi.localIP());

  // Konfigurasi API Key dan URL Realtime Database
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Sign up sebagai pengguna anonim jika diperlukan keamanan database
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Registrasi Firebase Anonim Berhasil");
    signupOK = true;
  } else {
    Serial.printf("Registrasi Firebase Gagal: %s\\n", config.signer.signupError.message.c_str());
  }

  // Assign token callback helper
  config.token_status_callback = tokenStatusCallback; 

  // Inisialisasi Firebase dengan konfigurasi diatas
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // Pastikan koneksi Firebase siap & akun terdaftar
  if (Firebase.ready() && signupOK) {

    // ==========================================
    // SEGMEN 1: MEMBACA INTEGRASI STATUS RELAY
    // ==========================================
    
    // Membaca Relay 1
    if (Firebase.RTDB.getInt(&fbdo, "/relay/relay1")) {
      if (fbdo.dataType() == "int") {
        int r1 = fbdo.intData();
        // r1 = 1 artinya ON (aktifkan relay dengan logika LOW), r1 = 0 artinya OFF (beri HIGH)
        digitalWrite(RELAY_PIN_1, r1 == 1 ? LOW : HIGH);
        Serial.printf("Relay 1: %s\\n", r1 == 1 ? "ON" : "OFF");
      }
    } else {
      Serial.println("Gagal membaca Relay 1: " + fbdo.errorReason());
    }

    // Membaca Relay 2
    if (Firebase.RTDB.getInt(&fbdo, "/relay/relay2")) {
      if (fbdo.dataType() == "int") {
        int r2 = fbdo.intData();
        digitalWrite(RELAY_PIN_2, r2 == 1 ? LOW : HIGH);
      }
    }

    // Membaca Relay 3
    if (Firebase.RTDB.getInt(&fbdo, "/relay/relay3")) {
      if (fbdo.dataType() == "int") {
        int r3 = fbdo.intData();
        digitalWrite(RELAY_PIN_3, r3 == 1 ? LOW : HIGH);
      }
    }

    // Membaca Relay 4
    if (Firebase.RTDB.getInt(&fbdo, "/relay/relay4")) {
      if (fbdo.dataType() == "int") {
        int r4 = fbdo.intData();
        digitalWrite(RELAY_PIN_4, r4 == 1 ? LOW : HIGH);
      }
    }

    // ==========================================
    // SEGMEN 2: MENULIS DATA SENSOR SETIAP 5 DETIK
    // ==========================================
    if (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0) {
      sendDataPrevMillis = millis();

      // Opsional: Ganti bagian ini dengan pembacaan sensor DHT11/dht.readTemperature() asli
      // Simulasi fluktuasi naik turun suhu kecil
      temperatureSim += (random(-5, 6) / 10.0);
      if(temperatureSim < 20) temperatureSim = 20;
      if(temperatureSim > 40) temperatureSim = 40;

      humiditySim += (random(-8, 9) / 10.0);
      if(humiditySim < 40) humiditySim = 40;
      if(humiditySim > 95) humiditySim = 95;

      // Menulis nilai Suhu ke Firebase RTDB
      if (Firebase.RTDB.setFloat(&fbdo, "/sensor/temperature", temperatureSim)) {
        Serial.printf("Suhu Berhasil Dikirim: %.1f °C\\n", temperatureSim);
      } else {
        Serial.println("Gagal Mengirim Suhu: " + fbdo.errorReason());
      }

      // Menulis nilai Kelembaban ke Firebase RTDB
      if (Firebase.RTDB.setFloat(&fbdo, "/sensor/humidity", humiditySim)) {
        Serial.printf("Kelembaban Berhasil Dikirim: %.1f %%\\n", humiditySim);
      } else {
        Serial.println("Gagal Mengirim Kelembaban: " + fbdo.errorReason());
      }
    }
  }

  // Delay kecil untuk stabilitas siklus ESP32
  delay(100); 
}
`;
