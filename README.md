# 👑 GoniBot V3 - Gelişmiş Discord Ekosistemi

> **"Sıradan bir bot değil; Ekonomi, RPG, Savaş ve Yönetimi birleştiren yaşayan bir simülasyon."**

![Version](https://img.shields.io/badge/Version-3.5.0-blue.svg) ![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg) ![Discord.js](https://img.shields.io/badge/Discord.js-v14-purple.svg) ![Database](https://img.shields.io/badge/DB-CroxyDB-yellow.svg)

## 📖 Hakkında

**GoniBot**, sunucunuzu bir devlet gibi yönetmenizi sağlayan; içerisinde dinamik borsa, klan savaşları, görsel karşılama sistemleri ve yapay zeka barındıran devasa bir altyapıdır.

Tüm sistemler **Slash Commands (/)**, **Butonlar** ve **Modallar** ile modern bir arayüzde çalışır.

---

## 🚀 Öne Çıkan Özellikler

### 📈 Wall Street Ekonomisi (Dinamik Borsa)
Gerçek hayat simülasyonu! Fiyatlar sabit değildir; kullanıcılar alım yaptıkça fiyat artar, satış yaptıkça düşer.
- **Varlıklar:** `Bitcoin (BTC)`, `Dolar (USD)`, `Altın (GLD)`, `GoniHisse (GNI)`.
- **Komutlar:** `/borsa` (Portföy), `/al`, `/sat`.
- **Mekanik:** Her 1 dakikada bir piyasa dalgalanır. Balina oyuncular piyasayı manipüle edebilir.

### ⚔️ RPG ve Savaş Sistemi
- **Klanlar:** `/klan kur` ile kendi ordunu kur.
- **İşgal:** `/isgal` ile kanalları ele geçir ve oraya yazanlardan vergi topla.
- **Dünya Boss'u:** Belirli aralıklarla çıkan canavara tüm sunucu saldırır.
- **PvP:** `/duello` ile bahisli ve yetenekli (Saldır/İyileş) savaşlar.
- **Gelişim:** `/avla` ile XP kas, `/envanter` diz, `/reenkarne` ile tanrılaş.

### 🎨 Görsel Sistemler (Canvas)
- **Hoş Geldin Kartı:** Sunucuya girenleri **Pro-Bot tarzı**, isme özel, şeffaf ve şık bir resimle karşılar (`/hosgeldin-ayarla`).
- **Level Kartı:** Seviye atlayan kullanıcılara özel anime tarzı görsel kart atar.
- **Borsa Kartı:** Cüzdan durumunu kredi kartı tasarımında gösterir.

### 🛡️ Yönetim ve Güvenlik
- **Panel:** `/panel` ile tek tıkla korumaları (Küfür, Reklam, Link) açıp kapatın.
- **Moderatör Rolü:** `/mod-rol-ayarla` ile yetkisi olmayan ama güvenilir üyelere botu kullandırma izni verin.
- **Anti-Raid:** Hızlı kanal silenleri otomatik banlar.
- **Loglama:** Silinen/Düzenlenen mesajları ve ses hareketlerini kaydeder.

### ⚙️ Gelişmiş Sistemler
- **Ticket (Destek):** `/ticket-kur`. Butonlu seçim, konuşma geçmişini `.txt` olarak kaydetme özelliği.
- **Öneri Kutusu:** `/oneri-kutusu-kur`. Form (Modal) doldurarak yönetime gizli mesaj atma.
- **Oto-Cevap:** `/oto-cevap`. Botun belirli kelimelere ne tepki vereceğini öğretin.
- **Global Chat:** `/global-kur`. Farklı sunucuları birbirine bağlayın.

### 🎲 Eğlence ve Sosyal
- **Yapay Zeka:** `/hayal-et` (Resim çizer), `/biyografi` (Profil ayarlar).
- **Kumar:** `/kasa-ac` (Lootbox), `/slots`, `/blackjack` (Kart oyunu), `/rus-ruleti`.
- **İlişki:** `/evlen`, `/ship` (Aşk ölçer).
- **Diğer:** `/jumbo` (Emoji büyüt), `/afk`, `/itiraf`.

---

## 🛠️ Kurulum Rehberi

### 1. Gereksinimler
- [Node.js](https://nodejs.org/) (v18 veya üzeri önerilir)
- Bir Discord Bot Tokeni

### 2. İndirme ve Modüller
Terminali proje klasöründe açın ve kurulumu başlatın:

```bash
npm install