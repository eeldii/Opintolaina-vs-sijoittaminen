# Opintolaina vai sijoittaminen?

## Viimeistellyt vuosivalinnat ja lukukentät (16.11.2026)

Käyttöliittymän vuosihaarukka on **2000–2026** molemmissa tuottotavoissa. Myöhempiä vuosia ei luetella edes estettyinä. Historiallisen tuoton kuukausirajaus noudattaa yhä aineistoa; oma tuotto sallii myös vuoden 2026 viimeiset kuukaudet. Tämä korvaa aiemman maininnan tulevien vuosien valitsemisesta.

Lukukentät ryhmittelevät kokonaisosan välilyönnein kirjoitettaessa, säilyttäen desimaalit ja kohdistimen paikan. Tyhjä kenttä tulkitaan laskennassa nollaksi ja täytetään näkyvästi luvulla 0 kentästä poistuttaessa tai laskennan lähetyksessä. Kenttä saa olla tyhjä muokkauksen aikana, jotta arvon korvaaminen onnistuu normaalisti. Pilkku toimii desimaalierottimena; syötetty piste muunnetaan pilkuksi. Muotoilu ei pyöristä syötteen tarkkuutta.

## Aloitusvuoden rajaus ja värit (16.11.2026)

Laskurin aikaisin sallittu aloitusvuosi on **2000** sekä historiallisessa että oman vuosituoton tilassa. Kuukausi- ja vuosivalinnat, oletusjakso, palautus ja koko jakson painike noudattavat tätä rajaa. Historiallinen oletusjakso on nyt tammikuu 2000–syyskuu 2026. Vanhempi lähdeaineisto säilytetään vain laskentamoottorin tarkistuksia varten, eikä sitä voi valita laskurin käyttöliittymästä. Tämä rajaus korvaa jäljempänä mainitut aiemmat koko historian oletukset.

Tausta pysyy täysin mustana. Vihreä katkoviiva erottaa erissä maksamisen ja punainen yhtenäinen viiva heti lyhentämisen; vastaavat tunnisteet ja loppuarvot käyttävät samoja värejä. Nettovarallisuuden erotus korostetaan vaaleankeltaisella.

## Uudet valinnat (15.11.2026)

Tämä osio täydentää ja tarvittaessa korvaa aiempia määrittelyjä. Kenttien otsikoissa käytetään sanoja Opintovelka, Alkusäästöt ja Yhteinen kuukausierä ilman muuttujakirjaimia.

- Aloitus- ja päättymisajalle valitaan erikseen kuukausi ja vuosi. Historiallisessa tilassa valinnat rajataan aineistoon; omalla tuotolla voidaan käyttää myös tulevia vuosia. Enimmäisjakso on 200 vuotta ja päättymisen on oltava aloituksen jälkeen.
- Tuottotapa on joko historiallinen S&P 500 -sarja tai käyttäjän oma efektiivinen vuosituotto. Oma kuukausituotto on `(1 + vuosituotto)^(1/12) − 1`. Syöte annetaan prosentteina, myös negatiivisena, mutta sen on oltava yli −100 %. Se on jatkuvien sijoituskulujen jälkeinen oletus ennen henkilöveroja. Historiatuottoa ja omaa tuottoa ei summata tai yhdistetä.
- Oletusskenaario pysyy ennallaan: laina on jo käytetty, joten vain erilliset säästöt ovat käytettävissä.
- Valinnaisessa **Myös opintolaina sijoitetaan** -skenaariossa nostettu lainasumma on edelleen rahana käytettävissä. Avaava yhteinen kassa = säästöt + laina ja yhteinen velka = laina. Heti maksava käyttää kassaa velan kuittaamiseen ja sijoittaa ylijäämän; erissä maksava sijoittaa yhteisen kassan ja lyhentää lainaa yhteisellä kuukausierällä. Lainarahaa lisätään kerran molemmille, eikä vain sijoittavalle anneta ylimääräistä varallisuutta. Esimerkiksi 600 € säästöillä ja 1 000 € lainalla molempien lähtönetto on 600 €: heti maksavan salkku 600 € ja velka 0 €, sijoittavan salkku 1 600 € ja velka 1 000 € ennen kuluja.
- Valinta toimii sekä historiallisella että omalla tuotolla. Lainaerät, kulut, viimeisen maksun ylijäämä, veroarvio ja sijoitusten kuukausittainen tapahtumajärjestys pysyvät samoina. Lainan korkojen vähennystä ei oleteta myöskään sijoitusskenaariossa; tämä on rajattu laskentaoletus eikä henkilökohtainen kannanotto velan käyttötarkoituksen verokohteluun. Kela-hyvitystä ei lasketa uudelleen eikä myöhempiä lainanostoja mallinneta.

## Päivitys: historiallinen x / a / y -vertailu (15.11.2026)

Tämä osio korvaa alla olevan aiemman käyttöliittymä- ja vakiotuottomallin siltä osin kuin ne poikkeavat siitä. Laskenta käyttää edelleen yhteistä kuukausimoottoria ja samoja jäljempänä kuvattuja vero- ja tapahtumajärjestyksen sääntöjä.

- Molemmilla on alussa sama itse valittu alkusäästö **x**, opintovelka **a** ja kuukausittainen kokonaiserä **y**. Velkaa ei koskaan lisätä kassaan tai sijoituksiin. Alkutilanne on velan nostamisen ja käyttämisen jälkeen: a on jäljellä oleva velka ja x siitä erillinen säästö. Kela-hyvitystä ei lasketa uudelleen.
- **Lyhennä lainaa heti:** käytä x velkaan enintään velan määrään asti (mahdollinen alkulyhennyksen kulu vähennetään samasta kassasta). Jos säästöt ylittävät velan, sijoita ylijäämä. Maksa jäljellä olevaa lainaa yhteisellä y:llä kuukausittain ja siirrä y sijoituksiin velattomuuden jälkeen.
- **Sijoita ja maksa laina erissä:** sijoita vain x heti. Maksa a:ta samalla y:llä kuukausittain. Älä sijoita opintolainaa. Lainan loputtua sijoita koko y.
- y sisältää korot, lyhennyksen ja mahdollisen kuukausittaisen pankkikulun. Ei erillistä suurempaa kuukausibudjettia. Viimeisen lainamaksun ylijäämä sijoitetaan heti samassa kuussa. Nykyisessä käyttöliittymässä y on vakio molemmille; muuttuvaa korkoa tai muuttuvaa maksuerää ei mallinneta.
- Tuotto tulee pakatusta historiallisesta S&P 500 / S&P Composite **hintaindeksistä**, kaavalla `r[t] = P[t] / P[t−1] − 1`. Sama r[t] koskee kummankin kuukauden alussa omistamaa salkkua. Kuukauden lopun uudet sijoitukset saavat ensimmäisen tuottonsa seuraavassa kuussa.
- Oletuksena **koko saatavilla oleva historia: 1871-01–2026-09**, 1 869 kuukausihavaintoa ja 1 868 kuukausituottoa. Aloituskuukausi on päivä 0; viimeinen tuotto päättymiskuukaudelta. Ajankohdat valitaan aineistosta, eikä puuttuvia kuukausia toisteta tai ennusteta. Päivämäärät ovat kuukausien ensimmäisiä päiviä ja edustavat kuukausihavaintoja, eivät tarkkoja toteutuneita ostopäiviä.
- **Rajaukset näkyviin:** osingot eivät sisälly tuottoon. DataHubin uudemmasta hintajatkeesta puuttuvat osingot, joten niitä ei keksitä eikä yhdistetä huomaamatta erilaiseen tuottosarjaan. USD-tuottoprosentteja sovelletaan euromääriin ilman EUR/USD-muutosta. Tulos ei ole suomalaisen sijoittajan euromääräisen rahaston toteutunut kokonaistuotto. Ennen vuotta 1957 kyseessä ovat edeltäjäindeksit. Vanha osa perustuu kuukausikeskiarvoihin. Nykyisiä vero- ja laina-oletuksia käytetään hypoteettisesti koko historiassa; tulos ei kuvaa menneitä suomalaisia sääntöjä. Inflaatiota ei huomioida.
- Lähteet, tarkistettu/ladattu 15.11.2026: [DataHub](https://datahub.io/core/s-and-p-500), [alkuperäinen Shiller-sarja](https://www.econ.yale.edu/~shiller/data.htm), [FRED-hintajatke](https://fred.stlouisfed.org/series/SP500). DataHubin aineisto on julkaistu ODC-PDDL-1.0-lisenssillä. Alkuperäinen ladattu CSV ja SHA-256-tiiviste säilytetään projektissa. Laskuri ei hae tietoja käytön aikana.
- Vakiotuottomoottori säilyy erillisiä tarkistustestejä varten. Käyttöliittymän nollatuottoinen esimerkki on erikseen merkitty testitilaksi, jossa sekä tuottosarja että myyntivero ovat nollia.

## Aiempi määrittely ja tarkistetut Suomen säännöt

Tuote- ja laskentamäärittely · 15.11.2026

## Tarkoitus ja rajaus

Suomenkielinen laskuri vertaa kahta tapaa käyttää sama alkukassa ja kuukausibudjetti säännöllisen pankkilainan takaisinmaksun alkaessa. Näytä kummallekin velka, sijoitusten arvo, sijoitettu raha, maksetut korot ja kulut, velattomuuspäivä sekä **nettovarallisuus myynnin ja verojen jälkeen** yhteisenä vertailupäivänä. Näytä myös strategioiden erotus ja kuukausittainen tarkistustaulukko. Käytä euroja ja suomalaista lukumuotoa.

Käyttöliittymän aloituslause:

> Vertailu alkaa opintolainan säännöllisen takaisinmaksun alkaessa, ja mahdollinen Kelan opintolainahyvitys on jo käsitelty ja huomioitu pankin ilmoittamassa jäljellä olevassa lainasaldossa.

Lainasaldo tarkoittaa velkaa pankille, ei käyttötilin saldoa. Alkukassa on erillinen, aidosti käytettävissä oleva rahamäärä; käyttäjän tarvitsema hätävara jätetään sen ulkopuolelle. Hyvitystä ei lisätä kassaan eikä vähennetä velasta uudelleen. Molemmilla strategioilla on sama lähtöpäivä, velka, kassa, kuukausibudjetti, vertailuaika ja sijoituskohde.

Ensiversio on nimelliseuroihin perustuva kuukausimalli: tavallinen pankissa oleva opintolaina ja kasvuosuuksinen rahasto tavallisessa verotuksessa. Ei uusia lainanostoja, opiskeluajan pääomitusta, korkoavustusta, vanhaa opintolainavähennystä, osakesäästötiliä, inflaatiota tai sijoitusten väliaikaisia myyntejä. Tällaisia etuuksia saavalle tulos ei sellaisenaan sovellu. Tuotto on oletus, ei lupaus; myös negatiivinen tuotto sallitaan.

## Referenssin molemmat Python-skriptit

Luettu 15.11.2026: [Pay_Loan_Now.py](https://github.com/losingloonies/Student-Loan-vs-Investing/blob/main/Pay_Loan_Now.py) ja [Pay_Loan_Slowly.py](https://github.com/losingloonies/Student-Loan-vs-Investing/blob/main/Pay_Loan_Slowly.py), main-haara.

- **Pay_Loan_Now.py:** vähentää 117 687:n velasta heti koko 75 000:n kassan. Maksaa jäljelle jäävää velkaa 622 kuukaudessa ja sijoittaa myöhemmin vapautuvat maksut spy.csv:n Value-sarjan suhteessa. Laskee velka-, sijoitus- ja nettovarallisuushistorian mutta tallentaa vain sijoituskäyrän kuvaksi.
- **Pay_Loan_Slowly.py:** sijoittaa 75 000 heti samaan sarjaan, lyhentää alkuperäistä velkaa 622 kuukaudessa ja aloittaa lisäsijoitukset velan maksamisen jälkeen. Piirtää kolme historiakäyrää.

Molemmat käyttävät aineiston viimeisiä 20 vuotta. Muuttuja `worst_return` ei valitse huonointa jaksoa: ensimmäisen skriptin sitä etsivää funktiota ei kutsuta. Maksut tehdään ensimmäisellä aineistorivillä kuukauden vaihduttua, eivät ennalta sovittuna pankkipäivänä.

Suomalaista vertailua vääristävät nollakorkoinen laina, puuttuvat pankki- ja sijoituskulut sekä verot ja dollarimerkintäinen SPY-vertailu ilman EUR-valuuttakäsittelyä. Koodi ei selvitä, sisältääkö Value osingot; sarjaa ei voi sen perusteella kutsua kokonaistuotoksi. Yksi jälkikäteen valittu historiallinen jakso ei ole tuottoennuste. Kela-tilannetta ei määritellä. Kuukausibudjetti ja pankin maksuerä ovat sama kovakoodattu luku, joten pankkierän ylittävää kuukausisijoitusta ei voi verrata.

Lisäksi nopean maksun skripti sijoittaa loppuerän kuukaudessa virheellisesti kokonaisen 622:n erän todellisen ylijäämän sijasta. Hidas skripti antaa velkasaldon mennä positiiviseksi ja pitää ylityksen kasvamattomana varallisuutena. Ensimmäinen skripti ei myöskään käsittele oikein alkukassaa, joka ylittää koko velan. Näitä ratkaisuja ei siirretä laskuriin.

## Tarkistetut Suomen säännöt

Kaikki alla olevat lähteet tarkistettu **15.11.2026**. Tarkistuspäivä ja linkit näkyvät myös laskurin lähdetiedoissa. Nykyiset verosäännöt pidetään tulevaisuuden laskennassa ennallaan oletuksena.

| Lähde | Laskuriin vaikuttava tieto |
| --- | --- |
| [Kela: Opintolainahyvitys](https://www.kela.fi/opintolainahyvitys) | Hyvitys maksetaan yleensä pankille lainan lyhennykseksi ja on veroton. Opiskeluaikana tai valmistumislukukaudella tehty lyhennys voi pienentää hyvitystä. Tämä vertailu alkaa vasta hyvityksen käsittelyn jälkeen. |
| [Kela: Opintolaina korkeakoulussa](https://www.kela.fi/opintolaina-korkeakoulussa) | Varsinainen takaisinmaksu alkaa yleensä 1–2 vuotta opintotuen päättymisestä; maksuaikataulu sovitaan pankin kanssa. Käyttäjä antaa omat pankkiehtonsa, ei yleistä suomalaista vakioerää tai korkoa. |
| [Vero: Vähennykset pääomatuloista](https://www.vero.fi/henkiloasiakkaat/vahennykset/mita-voi-vahentaa/vahennykset-paaomatuloista/) | Tavallisen opintolainan korkoja eikä velkapääoman lyhennyksiä vähennetä verotuksessa. Laskuri ei lisää korkojen verohyötyä. Tulonhankkimisvelaksi käsiteltävä velka edellyttää erillistä tarkastelua. |
| [Vero: Sijoitusrahasto-osuudet](https://vero.fi/henkiloasiakkaat/omaisuus/sijoitukset/sijoitusrahastoosuude/) | Kasvuosuuden vero syntyy myynnissä. Voitosta vähennetään todellinen hankintahinta ja myyntikulut tai vaihtoehtoisesti hankintameno-olettama: alle 10 vuoden omistukselle 20 %, vähintään 10 vuoden omistukselle 40 % myyntihinnasta. Olettaman lisäksi ei vähennetä hankintahintaa tai kuluja. |
| [Vero: Pääomatulot](https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tulot/paaomatulot/) | Verokanta on 30 % 30 000 euroon asti ja 34 % ylimenevästä osasta. Raja koskee vuoden pääomatulojen yhteismäärää. |
| [Vero: Osakkeiden myynti](https://vero.fi/henkiloasiakkaat/omaisuus/sijoitukset/osakkeiden_myynt/) | Pienten luovutusten voitto on verovapaa, jos vuoden huomioon otettavat myyntihinnat ovat yhteensä enintään 1 000 euroa. Luovutustappio voi vähentää pääomatuloja ja siirtyä viidelle seuraavalle vuodelle; se ei ole automaattinen käteispalautus. |

## Syötteet

| Suomenkielinen kenttä | Merkitys |
| --- | --- |
| Aloituspäivä; vertailuaika (kk) | Päivä 0 ja kokonaiset kuukaudet N ≥ 0. Vertailupäivä on N kuukausipäivää myöhemmin. |
| Lainasaldo (€), D₀ | Pankin velkasaldo hyvityksen ja aiempien pääomitusten jälkeen; vähintään 0. Aloitushetkellä ei oleteta erillistä maksamatonta korkoa. |
| Käytettävissä oleva alkukassa (€), C | Vähintään 0; ei olemassa olevaa sijoitussalkkua. |
| Kuukausibudjetti (€), B | Yhteinen summa lainaan, pankin kuukausikuluun ja sijoituksiin; vähintään 0. |
| Lainan vuosikorko (%), i | Muokattava nimellinen kokonaiskorko, sisältää viitekoron ja marginaalin; ei sisällä erillisiä kuluja. Vakio laskentajakson ajan, vähintään 0. |
| Pankin kuukausierä (€), P | Muokattava sovittu korkoa ja pääomaa sisältävä kokonaiserä, ei pelkkä pääoman lyhennys; erillinen tilinhoitokulu ei sisälly. |
| Odotettu vuosituotto kulujen jälkeen (%), R | Muokattava efektiivinen vuosituotto ennen henkilöveroja, R > −100 %. Rahaston jatkuvat kulut sisältyvät jo tähän lukuun. |
| Lainan kuukausikulu (€), f; alkulyhennyksen kertakulu (€), E | Pankin ilmoittamat kulut; oletuksena 0. Kuukausikulu peritään vain kuukaudelta, jonka alussa on velkaa. E koskee vain strategian A päivän 0 lyhennystä. |
| Merkintäpalkkio (%), b; lunastuspalkkio (%), s | Yhteiset sijoituskulut, oletuksena 0. Välillä 0–alle 100 %. |
| Muut verotettavat pääomatulot vertailuvuonna (€), O | Vähintään 0, oletuksena 0; sama molemmille. Nettomäärä ennen tämän salkun myyntiä. |

Ensiversiossa ei ole muita luovutuksia tai aiempia luovutustappioita vertailuvuonna. Tämä verorajaus näkyy tuloksen vieressä. Jos pankki veloittaa erillisiä kuukausittaisten lisälyhennysten maksuja tai käyttää muuttuvaa maksuerää, malli ei sellaisenaan vastaa sopimusta. Malli edellyttää, että lisälyhennykset lyhentävät laina-aikaa ja P säilyy samana. Kaikki esitäytetyt korko-, tuotto- ja kululuvut merkitään **esimerkkioletuksiksi**, ei pankkitarjouksiksi tai Suomen vakioehdoiksi.

## Laskenta ja tapahtumajärjestys

Merkitään A = **Lyhennä lainaa heti**, B-strategia = **Sijoita ja maksa laina erissä**. Kuukausikorko on `r = i / 12` ja sijoitusten kuukausituotto `g = (1 + R)^(1/12) − 1`; prosentit muunnetaan desimaaleiksi. Tämä on kuukausiarvio, ei pankin päiväkohtainen korkolaskelma. Ensimmäinen kuukausitapahtuma on kuukausi aloituksesta; puuttuva kuukaudenpäivä korvataan kuukauden viimeisellä päivällä.

**Päivä 0:** A maksaa `q₀ = min(D₀, C − E)`, kun D₀ > 0 ja C > E. Vähennä q₀ velasta ja E kassasta; sijoita jäljelle jäävä `C − E − q₀`. Muulloin q₀ = 0, kertakulua ei peritä ja koko C sijoitetaan. B-strategia sijoittaa koko C ja pitää koko velan. Ei kuukausibudjettia, korkoa tai tuottoa päivänä 0. Kulut voivat tehdä päivän 0 nettovarallisuuksista erilaiset, vaikka lähtövarat ovat samat.

**Kuukaudet 1…N, kummallekin erikseen:**

1. Kasvata vanhojen sijoituserien arvoa kertoimella `1 + g`.
2. Laske korko `I = D × r` kuukauden alun velasta ja maksettava velka `H = D + I`. Varaa f, jos D > 0; muuten kulu on 0.
3. Tuo käytettäväksi täsmälleen B euroa. A maksaa `q = min(H, B − f)`. B-strategia maksaa `q = min(H, P)`. Velaton strategia maksaa q = 0 ilman lainakuluja.
4. Uusi velka on `H − q`, aina vähintään 0. Sijoitukseen jää `X = B − f − q` samassa kuussa. Viimeinen lainamaksu on vain todellinen H, ei koko P tai B; ylijäämä sijoitetaan heti. Seuraavasta kuusta alkaen velaton strategia sijoittaa koko B:n.
5. Kun X > 0, merkintäpalkkio on `bX`, sijoituksen uusi arvo `X(1 − b)` ja erän verotuksellinen hankintameno X. Uusi erä ei saa tämän kuun tuottoa. Sama ostosääntö koskee päivän 0 sijoitusta. Älä vähennä rahaston jatkuvia kuluja toistamiseen.

Laske ilman kuukausittaista senttipyöristystä; pyöristä vain esitettävät eurot kahteen desimaaliin. Erittele kuukausitaulukossa korko, pääoman lyhennys `q − I`, pankkikulu, sijoitusmaksu, sijoituskulu ja loppusaldot.

**Riittämätön budjetti:** jos velkaa on jäljellä ja `B < min(P, H) + f`, keskeytä vertailu ennen kyseisen kuun tapahtumia. Näytä: **“Kuukausibudjetti ei riitä pankin maksuerään ja kuluihin. Tarvitset tässä kuussa vähintään {summa} €, eli {vajaus} € lisää. Muuta budjettia tai pankin kanssa sovittua maksuerää.”** Näytä kyseinen kuukausi, älä voittajaa tai valmista lopputulosta. Älä rahoita vajetta sijoitusmyynnillä, lisävelalla tai pienentämällä maksuerää automaattisesti. Jos `P ≤ I` tavallisessa, ei viimeisessä maksukuussa, pyydä korjaamaan maksuerä: laina ei lyhene. Velan jääminen vertailupäivälle on muuten sallittua ja näkyy nettovarallisuudessa.

## Nettovarallisuus, jos kaikki sijoitukset myytäisiin

Vertailupäivä on viimeisen kuukausitapahtuman jälkeen. Merkitään V = sijoitusten markkina-arvo, S = sV = lunastuspalkkio ja D = jäljellä oleva velka. Arvostuksessa vähennetään myynnin vero heti, vaikka vero maksettaisiin myöhemmin. Velkaa ei oleteta maksettavan ennenaikaisesti vertailupäivänä.

Pidä jokaisen ostoksen päivä, hankintameno Kⱼ ja myyntiarvo Vⱼ tallessa. Kohdista S erille niiden arvojen suhteessa. Erän verotettava tulos on pienempi seuraavista: `Vⱼ − Kⱼ − Sⱼ` tai `Vⱼ × (1 − hⱼ)`, missä hⱼ = 20 % / 40 % todellisen omistusajan perusteella. Älä laske kaikkia myöhempiä kuukausiostoja ensimmäisen oston ikäisiksi. Summaa erien tulokset G:ksi.

Jos V ≤ 1 000 € eikä muita luovutuksia ole, voitosta ei lasketa veroa. Muuten `G⁺ = max(0, G)` ja:

`F(x) = 0,30 × min(x, 30 000) + 0,34 × max(0, x − 30 000)`

`T = F(O + G⁺) − F(O)`

Tappiolle ei kirjata tässä rajatussa mallissa välitöntä verohyötyä, vaikka sen voisi henkilökohtaisessa verotuksessa hyödyntää. Näytä tappio ja tämä rajaus erikseen; tulos on tällöin varovainen arvio. Vero ei kohdistu koko sijoitusarvoon tai sijoitettuun pääomaan.

**Nettovarallisuus = V − S − T − D.** Mahdollinen erillinen yhteinen hätävara ei kuulu vertailuun. Näytä myös veroton välisumma V − D, jotta veron vaikutus on tarkistettavissa.

## Pieni käsin tarkistettava esimerkki

**Vain laskennan esimerkkioletuksia:** aloitus 15.11.2026, vertailu 15.5.2027 eli 6 kuukautta; velka 2 000 €, alkukassa 1 000 €, yhteinen budjetti 600 €/kk, sovittu pankkierä 500 €/kk. Lainan nimelliskorko 12 %/v eli 1 %/kk. Sijoituksen efektiivinen vuosituotto `(1,01^12 − 1) × 100 % ≈ 12,6825 %` eli myös 1 %/kk. Kaikki kulut 0, muut pääomatulot ja luovutukset 0. Korkeat prosentit on valittu käsinlaskun helpottamiseksi.

Taulukon arvot ovat tapahtumien jälkeen; välivaiheita ei pyöristetä. Nettovarallisuus sisältää hypoteettisen myynnin veron kullakin päivällä, mutta salkkua ei oikeasti myydä kesken vertailun.

| Hetki | A: velka | A: sijoitukset | A: nettovarallisuus | B-strategia: velka | B-strategia: sijoitukset | B-strategia: nettovarallisuus |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Päivä 0, 15.11.2026 | 1 000,00 | 0,00 | −1 000,00 | 2 000,00 | 1 000,00 | −1 000,00 |
| Kk 2, 15.1.2027: A velaton | 0,00 | 185,90 | 185,90 | 1 035,20 | 1 221,10 | 179,57 |
| Kk 5, 15.4.2027: B-strategia velaton | 0,00 | 2 009,59 | 2 002,49 | 0,00 | 2 009,59 | 1 991,26 |
| Kk 6, 15.5.2027: vertailupäivä | 0,00 | 2 629,69 | **2 616,55** | 0,00 | 2 629,69 | **2 605,33** |

Tarkistuslaskut:

- **Päivä 0:** A käyttää 1 000 € velkaan, joten velkaa jää 1 000 €. B-strategia sijoittaa 1 000 € ja velkaa jää 2 000 €. Molempien lähtönetto on `1 000 − 2 000 = −1 000 €`.
- **A, kk 1–2:** `1 000 × 1,01 − 600 = 410` velkaa. Seuraavan kuun loppuerä `410 × 1,01 = 414,10`; sijoitukseen jää `600 − 414,10 = 185,90`. Kk 3–6 sijoitetaan 600 €/kk.
- **B-strategia, kk 1–2:** velka `2 000 × 1,01 − 500 = 1 520`, sitten `1 520 × 1,01 − 500 = 1 035,20`. Salkku `1 000 × 1,01 + 100 = 1 110`, sitten `1 110 × 1,01 + 100 = 1 221,10`. Hankintameno on `1 000 + 100 + 100 = 1 200`; vero `21,10 × 30 % = 6,33`; netto `1 221,10 − 6,33 − 1 035,20 = 179,57`.
- **B-strategian loppuerä:** kk 3 velka `1 035,20 × 1,01 − 500 = 545,552`; kk 4 `545,552 × 1,01 − 500 = 51,00752`; kk 5 maksetaan vain `51,00752 × 1,01 = 51,5175952`. Sijoitukseen jää `600 − 51,5175952 = 548,4824048`. Salkku kk 4 on `1 221,10 × 1,01² + 100 × 1,01 + 100 = 1 446,64411`; kk 5 se on `1 446,64411 × 1,01 + 548,4824048 = 2 009,5929559`.
- **A:n salkku kk 5:** `185,90 × 1,01³ + 600 × (1,01² + 1,01 + 1) = 2 009,5929559`. Kummankin salkku kk 6: `2 009,5929559 × 1,01 + 600 = 2 629,688885459`.
- **Loppuverot:** A:n hankintameno `185,90 + 4 × 600 = 2 585,90`, voitto `43,788885459`, vero `13,1366656377`. B-strategian hankintameno `1 000 + 4 × 100 + 548,4824048 + 600 = 2 548,4824048`, voitto `81,206480659`, vero `24,3619441977`. Todelliset hankintamenot ovat tässä olettamaa edullisemmat; loppumyynnit ylittävät 1 000 €.
- **Lopputulos:** A `2 629,688885459 − 13,1366656377 = 2 616,5522198213 €`; B-strategia `2 629,688885459 − 24,3619441977 = 2 605,3269412613 €`. A:n etu on **11,23 € verojen jälkeen**. Ennen veroja tulos on tasan: yhtä suuret kuukausikorot ja -tuotot tekevät tästä myös hyödyllisen laskennan tarkistusesimerkin.
