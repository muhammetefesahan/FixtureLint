# ⚽ FixtureLint

![Benim fikstür denetçim için hazırladığım temsili kapak](kapak.png)

## Benim aklıma ne geldi?

Ben bugün X'in dünya listesine baktım. Futbol takımları ve maçlar saatler boyunca en üst sıralardaydı. Arsenal, Brighton, Tottenham ve oyuncu adları çok konuşuluyordu. Ben GitHub'ın günlük Trending sayfasına da baktım. Orada Cloudflare'ın çok adımlı güvenlik denetimi yapan projesi, görünen listede 3.162 günlük yıldızla en üstteydi.

Ben bu iki şeyi yan yana koydum. “Bir fikstürü de kod gibi yayından önce denetlesem?” dedim. Sonra **FixtureLint** yaptım. Ben bununla küçük turnuvaların maç listesindeki hataları başlangıç düdüğünden önce buluyorum.

Ben Reddit'in bugünkü dünya listesini doğrulayamadım. Elimdeki sayfa güncel değildi. Bu yüzden ben Reddit'te en popüler konu budur demiyorum.

## Ben neyi çözüyorum?

Ben bir okul, mahalle veya amatör turnuva hazırlarken aynı takımı iki maça birden yazabilirim. Aynı sahaya iki maç koyabilirim. Bir takımı dinlenmeden tekrar oynatabilirim. Bunlar küçük tabloda kolayca gözden kaçıyor.

Ben CSV maç listesini FixtureLint'e yapıştırıyorum. Ben bir düğmeye basıyorum. FixtureLint bana hangi maç numaralarında sorun olduğunu söylüyor. Ben raporu kopyalıyor veya geçerli maçları yeniden CSV olarak indiriyorum.

## Ben hemen nasıl denerim?

Ben bu repoyu indiriyorum. Sonra klasörde şu komutu çalıştırıyorum:

```sh
python3 -m http.server 4188 --bind 127.0.0.1
```

Ben tarayıcıda `http://127.0.0.1:4188` adresini açıyorum. Ben **Örnek fikstür** düğmesine basıyorum. Hataları hemen görüyorum.

Benim CSV başlığım böyle olmalı:

```csv
date,time,home,away,venue,duration
2026-09-20,10:00,Mavi SK,Sarı FK,Saha 1,90
```

`duration` bana maçın kaç dakika sürdüğünü söylüyor.

## Ben neleri denetliyorum?

- Ben eksik sütunları ve boş alanları buluyorum.
- Ben olmayan tarihleri ve yanlış saatleri buluyorum.
- Ben 1–600 dakika dışındaki süreleri reddediyorum.
- Ben bir takımın kendisiyle oynadığı satırı buluyorum.
- Ben aynı anda iki maçta görünen takımı buluyorum.
- Ben aynı anda iki maça ayrılan sahayı buluyorum.
- Ben aynı eşleşmenin aynı saatte tekrar yazılmasını buluyorum. Ev ve deplasman sırası ters olsa da görüyorum.
- Ben saha için istediğim hazırlık payı yoksa uyarıyorum.
- Ben takım için istediğim dinlenme süresi yoksa uyarıyorum.
- Ben bulguları kritik hata ve uyarı diye ayırıyorum.
- Ben zaman çizelgesini saat sırasına koyuyorum.
- Ben raporu kopyalıyor ve geçerli maçları CSV olarak indirebiliyorum.

## Ben veriyi nereye gönderiyorum?

Ben hiçbir yere göndermiyorum. FixtureLint'te ağ isteği yok. Ben IP adresi, konum, hesap, çerez, cihaz bilgisi veya kullanım kaydı toplamıyorum. Ben analitik araç kullanmıyorum. Ben `localStorage` veya `sessionStorage` içine fikstür yazmıyorum.

Ben sayfada `connect-src 'none'` kuralını kullanıyorum. Uygulamanın ağ bağlantısı açmasını kapatıyorum. Benim yapıştırdığım takım ve saha adları yalnızca açık sayfanın belleğinde duruyor. Ben sayfayı kapatınca uygulama bunları saklamıyor.

## Ben nasıl yaptım?

| Dosya | Ben bunu niye koydum? |
| --- | --- |
| `index.html` | Ben giriş, sonuç ve zaman çizelgesini gösteriyorum. |
| `style.css` | Ben masaüstü ve telefon düzenini hazırlıyorum. |
| `core.js` | Ben CSV'yi okuyor ve denetim kurallarını çalıştırıyorum. |
| `app.js` | Ben düğmeleri, raporu ve CSV indirmeyi çalıştırıyorum. |
| `test.js` | Ben zor örnekleri otomatik kontrol ediyorum. |

Ben dış paket kullanmadım. Benim uygulamam düz HTML, CSS ve JavaScript ile çalışıyor.

## Ben neleri test ettim?

Ben 20 otomatik test çalıştırdım. Hepsi geçti.

```sh
node test.js
```

Ben tırnaklı CSV, virgüllü takım adı, eksik başlık, olmayan takvim günü, yanlış saat, yanlış süre, kendiyle maç, takım çakışması, saha çakışması, hazırlık payı, dinlenme süresi, ters yazılmış kopya maç ve CSV dışa aktarmayı denedim.

Ben uygulamayı gerçek tarayıcıda da denedim. Örnek fikstürde 5 kritik hata ve 2 uyarı gördüm. Raporu kopyaladım. Ben 390 piksel telefon genişliğinde yatay taşma olmadığını kontrol ettim. Sayfanın yüklediği JavaScript ve CSS kaynaklarının yalnızca kendi yerel adresinden geldiğini gördüm.

## Benim sınırlarım

Ben maçların gerçek dünyada oynanıp oynanmadığını bilmiyorum. Ben takım ve saha adlarını yazıldığı gibi karşılaştırıyorum; küçük ve büyük harfi önemsemiyorum ama yazım hatasını tahmin etmiyorum. Ben yolculuk süresini, hakem programını, hava durumunu ve oyuncu kadrosunu kontrol etmiyorum. Ben saat dilimi çevirmiyorum. Ben bitiş saatini başlangıç ve süreyle hesaplıyorum.

Benim “yayına hazır” sözüm yalnızca kritik denetim kurallarında hata bulmadığım anlamına geliyor. Son kararı organizatör veriyor.

## Ben bugünkü veriyi nasıl okudum?

- Ben GitHub'ın **Trending / Today** sayfasını 19 Eylül 2026 günü kontrol ettim. `cloudflare/security-audit-skill` için “3,162 stars today” yazısını gördüm. Bu, GitHub'ın görünür Trending listesidir; tüm GitHub için kesin kayan 24 saat sıralaması diye sunmuyorum: https://github.com/trending?since=daily
- Ben Trends24'ün dünya geneli X zaman çizelgesini kontrol ettim. 19 Eylül 2026 boyunca Arsenal, Brighton, Tottenham, oyuncular ve maç etiketleri üst sıralarda tekrarlandı. Bu üçüncü taraf bir izleyicidir; resmi X ölçümü değildir: https://trends24.in/
- Ben Reddit'in günlük popüler sayfasını kontrol etmeye çalıştım. Elimdeki web kopyası iki hafta eskiydi. Ben onu bugünkü kanıt olarak kullanmadım: https://www.reddit.com/r/popular/top/?t=day

Ben kapak görselini yapay zekâ yardımıyla hazırladım. Bu görsel temsili bir kapaktır; gerçek uygulama ekranı değildir.

## Ben sonra ne ekleyebilirim?

- [ ] Ben hakem çakışması için isteğe bağlı bir sütun ekleyebilirim.
- [ ] Ben sahalar arası yolculuk süresini kullanıcı kuralıyla ekleyebilirim.
- [ ] Ben bulguların yazdırılabilir raporunu hazırlayabilirim.

