from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time, random

import sys
import io


sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from selenium.webdriver.support.ui import Select


# KONFIGURACIJA

URL = "https://test.bloodlust-rp.com"
PASSWORD = "Test123!"

rnd = random.randint(1000, 9999)
EMAIL = f"selenium_test_{rnd}@test.com"

LOGIN_SELECTOR  = "//a[normalize-space()='Login'] | //button[normalize-space()='Login']"
SIGNUP_SELECTOR = "//a[normalize-space()='Sign Up'] | //button[normalize-space()='Sign Up']"

options = Options()
options.add_argument("--start-maximized")

driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 10)

try:
    # 1. OTVORI HOME PAGE
    driver.get(URL)

    wait.until(EC.text_to_be_present_in_element(
        (By.TAG_NAME, "body"), "Play Trade"
    ))

    print("Početna stranica učitana")

    # 2. HEADER + HERO
    assert "Početna" in driver.page_source
    assert "Login" in driver.page_source
    assert "Sign Up" in driver.page_source
    assert "Dobrodošli u Play Trade" in driver.page_source

    print("Header i hero sekcija OK")

    # 5. FILTER TEŽINE (DROPDOWN)
    tezina_filter = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//*[contains(text(),'Sve težine')]")
    ))
    tezina_filter.click()

    options_expected = ["Sve težine", "Lagano", "Srednje", "Teško"]

    for option in options_expected:
        wait.until(EC.presence_of_element_located(
            (By.XPATH, f"//*[normalize-space()='{option}']")
        ))

    print("Dropdown težine sadrži sve opcije")

    driver.find_element(
        By.XPATH, "//*[normalize-space()='Lagano']"
    ).click()

    print("Odabrana težina: Lagano")

    # 6. MIN / MAX IGRAČA
    min_players = driver.find_element(
        By.XPATH, "//input[@type='number' and @value='1']"
    )
    max_players = driver.find_element(
        By.XPATH, "//input[@type='number' and @value='6']"
    )

    min_players.clear()
    min_players.send_keys("3")

    max_players.clear()
    max_players.send_keys("4")

    print("Min / Max igrača postavljeni")

    # 1. HOME PAGE
    driver.get(URL)

    wait.until(EC.text_to_be_present_in_element(
        (By.TAG_NAME, "body"), "Play Trade"
    ))

    wait.until(EC.element_to_be_clickable((By.XPATH, LOGIN_SELECTOR)))
    wait.until(EC.element_to_be_clickable((By.XPATH, SIGNUP_SELECTOR)))

    print("Home page ima Login i Sign Up gumbe")

    # 2. SIGN UP STRANICA
    driver.find_element(By.XPATH, SIGNUP_SELECTOR).click()

    wait.until(EC.text_to_be_present_in_element(
        (By.TAG_NAME, "body"), "Kreirajte novi račun"
    ))

    print("Sign Up stranica učitana")

    # 4. REGISTRACIJA
    email_input = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//input[@placeholder='primjer@email.com']")
    ))
    email_input.send_keys(EMAIL)

    password_fields = driver.find_elements(
        By.XPATH, "//input[@type='password']"
    )

    password_fields[0].send_keys(PASSWORD)
    password_fields[1].send_keys(PASSWORD)

    driver.find_element(
        By.XPATH, "//button[contains(.,'Registriraj se')]"
    ).click()

    time.sleep(3)

    assert "Profil" in driver.page_source or "Logout" in driver.page_source
    print(f"Sign Up uspješan ({EMAIL})")

    # 5. LOGOUT
    logout_elements = driver.find_elements(
        By.XPATH,
        "//*[contains(normalize-space(),'Logout')] | "
        "//*[contains(normalize-space(),'Odjava')]"
    )

    if len(logout_elements) > 0:
        driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            logout_elements[0]
        )
        logout_elements[0].click()
        time.sleep(2)
        print("Logout izvršen")
    else:
        print("Logout nije pronađen – preskačem (validno stanje)")

    # 6. LOGIN S NOVIM KORISNIKOM
    driver.find_element(By.XPATH, LOGIN_SELECTOR).click()

    wait.until(EC.text_to_be_present_in_element(
        (By.TAG_NAME, "body"), "Prijavite se u svoj račun"
    ))

    driver.find_element(
        By.XPATH, "//input[@placeholder='primjer@email.com']"
    ).send_keys(EMAIL)

    driver.find_element(
        By.XPATH, "//input[@type='password']"
    ).send_keys(PASSWORD)

    driver.find_element(
        By.XPATH, "//button[contains(.,'Prijavi se')]"
    ).click()

    time.sleep(3)

    assert "Profil" in driver.page_source or "Logout" in driver.page_source
    print("Login uspješan")

    print("SIGN UP + LOGIN TEST USPJEŠNO ZAVRŠEN")
    
    # 7. PROFIL STRANICA
    wait.until(EC.text_to_be_present_in_element(
        (By.TAG_NAME, "body"), "Novi korisnik"
    ))

    assert "Zagreb" in driver.page_source
    assert "Moje igre" in driver.page_source
    assert "Lista želja" in driver.page_source
    assert "Moje zamjene" in driver.page_source

    print("Profil stranica učitana i osnovni elementi postoje")

    edit_profile_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(.,'Uredi Profil')] | //a[contains(.,'Uredi Profil')]")
    ))
    edit_profile_btn.click()
    
    # 8. UREDI PROFIL
    wait.until(EC.text_to_be_present_in_element(
        (By.TAG_NAME, "body"), "Postavke Profila"
    ))
    print("Postavke profila otvorene")

    # EDIT MAP
    lokacija_link = wait.until(EC.element_to_be_clickable((
        By.XPATH, "//a[contains(.,'Postavi lokaciju')]"
    )))
    lokacija_link.click()
    
    wait.until(EC.text_to_be_present_in_element(
        (By.TAG_NAME, "body"), "Promijeni lokaciju"
    ))
    print("EditMap stranica otvorena")
    
    wait.until(EC.presence_of_element_located((
        By.CLASS_NAME, "leaflet-container"
    )))
    print("Mapa učitana")
    
    map_container = driver.find_element(
        By.CLASS_NAME, "leaflet-container"
    )
    
    actions = ActionChains(driver)
    actions.move_to_element_with_offset(map_container, 150, 150).click().perform()
    time.sleep(1)
    print("Klik na mapu izvršen")
    
    confirm_location_btn = wait.until(EC.element_to_be_clickable((
        By.XPATH, "//button[contains(.,'Potvrdi novu lokaciju')]"
    )))
    confirm_location_btn.click()
    time.sleep(2)

    try:
        alert = wait.until(EC.alert_is_present())
        alert.accept()
        print("Alert prihvaćen: Slika je spremljena")
    except:
        print("Alert nije pronađen (validno stanje)")
    
    time.sleep(2)
    
    wait.until(EC.text_to_be_present_in_element(
        (By.TAG_NAME, "body"), "Postavke Profila"
    ))
    print("EditMap test uspješan – vraćeno na EditProfile")

    # EDIT PHOTO
    camera_link = wait.until(EC.element_to_be_clickable((
        By.XPATH, "//a[contains(@class,'bg-accent-600')]"
    )))
    camera_link.click()
    
    wait.until(EC.text_to_be_present_in_element(
        (By.TAG_NAME, "body"), "Promijeni profilnu sliku"
    ))
    print("EditPhoto stranica otvorena")

    import os
    test_image_path = os.path.abspath("test_image.png")
    
    # (1x1 pixel PNG)
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0bIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    
    with open(test_image_path, "wb") as f:
        f.write(png_data)
    
    file_input = driver.find_element(
        By.XPATH, "//input[@type='file']"
    )
    file_input.send_keys(test_image_path)
    time.sleep(1)
    print("Slika učitana")
    
    confirm_photo_btn = wait.until(EC.element_to_be_clickable((
        By.XPATH, "//button[contains(.,'Potvrdi novu sliku')]"
    )))
    confirm_photo_btn.click()
    time.sleep(1)

    try:
        alert = wait.until(EC.alert_is_present())
        alert.accept()
        print("Alert prihvaćen: Slika je spremljena")
    except:
        print("Alert nije pronađen (validno stanje)")
    
    time.sleep(2)
    
    wait.until(EC.text_to_be_present_in_element(
        (By.TAG_NAME, "body"), "Postavke Profila"
    ))
    print("EditPhoto test uspješan – vraćeno na EditProfile")
    
    # Čišćenje test slike
    if os.path.exists(test_image_path):
        os.remove(test_image_path)

    # EDIT PROFILE PODACI

    ime_input = wait.until(EC.presence_of_element_located((
        By.XPATH, "//*[normalize-space()='Ime i prezime']/following::input[1]"
    )))

    opis_textarea = wait.until(EC.presence_of_element_located((
        By.XPATH, "//*[normalize-space()='O meni']/following::textarea[1]"
    )))

    ime_input.clear()
    ime_input.send_keys("Test Korisnik Selenium")

    opis_textarea.clear()
    opis_textarea.send_keys("Ovo je Selenium test opisa profila. Testiranje uređivanja.")

    print("Podaci uneseni u profil")


    interesi_input = wait.until(EC.presence_of_element_located((
        By.XPATH, "//input[@placeholder='Dodaj interes...']"
    )))
    
    interesi_input.send_keys("Strateške igre")
    dodaj_interes_btn = driver.find_element(
        By.XPATH, "//button[contains(.,'Dodaj')]"
    )
    dodaj_interes_btn.click()
    time.sleep(1)

    assert "Strateške igre" in driver.page_source
    print("Interes 'Strateške igre' dodan")

    interesi_input.send_keys("Igre s kartama")
    dodaj_interes_btn.click()
    time.sleep(1)

    assert "Igre s kartama" in driver.page_source
    print("Interes 'Igre s kartama' dodan")
    
    remove_buttons = driver.find_elements(
        By.XPATH, "//button[contains(@class,'text-brand-400')]"
    )
    
    if len(remove_buttons) > 0:
        remove_buttons[0].click()
        time.sleep(1)
        print("Interes uklonjen")
    

    save_btn = wait.until(EC.element_to_be_clickable((
        By.XPATH, "//button[contains(.,'Spremi promjene')]"
    )))
    save_btn.click()

    time.sleep(2)
    print("Sve promjene spremljene na profilu")
    
    print("EDIT PROFILE TESTOVI USPJEŠNO ZAVRŠENI")
    
    # DODAJ NOVU IGRU – OTVARANJE FORME

    dodaj_igru_btn = wait.until(EC.element_to_be_clickable((
        By.XPATH,
        "//*[self::button or self::a][contains(normalize-space(.), 'Dodaj novu igru')]"
    )))
    driver.execute_script("arguments[0].click();", dodaj_igru_btn)

    wait.until(EC.presence_of_element_located((
        By.XPATH,
        "//*[contains(normalize-space(.), 'Objavi novu igru')]"
    )))

    print("Forma 'Objavi novu igru' otvorena")
    
    naziv_input = wait.until(EC.presence_of_element_located((
        By.XPATH,
        "//input[@placeholder='Npr. Cluedo']"
    )))
    naziv_input.clear()
    naziv_input.send_keys("Terraforming Mars")

    print("Naziv igre unesen")
    
    zanr_input = wait.until(EC.presence_of_element_located((
        By.XPATH,
        "//input[@placeholder='Npr. strateška igra, igra s kartama']"
    )))
    zanr_input.clear()
    zanr_input.send_keys("Strateška, engine-building")

    print("Žanr unesen")
    
    izdavac_input = wait.until(EC.presence_of_element_located((
        By.XPATH,
        "//input[@placeholder='Npr. Hasbro, Stonemaier Games']"
    )))
    izdavac_input.clear()
    izdavac_input.send_keys("FryxGames")

    print("Izdavač unesen")
    
    godina_input = wait.until(EC.presence_of_element_located((
        By.XPATH,
        "//input[@placeholder='Npr. 1993']"
    )))
    godina_input.clear()
    godina_input.send_keys("2016")

    print("Godina izdanja unesena")
    
    broj_igraca_input = wait.until(EC.presence_of_element_located((
        By.XPATH,
        "//input[@placeholder='Npr. 2-4']"
    )))
    broj_igraca_input.clear()
    broj_igraca_input.send_keys("1-5")

    print("Broj igrača unesen")
    
    vrijeme_input = wait.until(EC.presence_of_element_located((
        By.XPATH,
        "//input[@placeholder='Npr. 60-90 min']"
    )))
    vrijeme_input.clear()
    vrijeme_input.send_keys("90-120 min")

    print("Vrijeme igranja uneseno")
    
    opis_textarea = wait.until(EC.presence_of_element_located((
        By.XPATH,
        "//textarea[contains(@placeholder, 'Npr. Svi dijelovi')]"
    )))
    opis_textarea.clear()
    opis_textarea.send_keys(
        "Svi dijelovi su kompletni, kutija blago oštećena na rubovima."
    )

    print("Dodatni opis unesen")

    ocuvanost_select_el = wait.until(EC.presence_of_element_located((
        By.XPATH,
        "//label[contains(normalize-space(.), 'Ocjena očuvanosti')]/following::select[1]"
    )))

    ocuvanost_select = Select(ocuvanost_select_el)

    ocuvanost_select.select_by_visible_text("4 (Odlično)")

    print("Ocjena očuvanosti odabrana")
    
    tezina_select_el = wait.until(EC.presence_of_element_located((
        By.XPATH,
        "//label[contains(normalize-space(.), 'Procjena težine')]/following::select[1]"
    )))

    tezina_select = Select(tezina_select_el)

    tezina_select.select_by_visible_text("Srednje")

    print("Procjena težine odabrana")
    
    objavi_igru_btn = wait.until(EC.element_to_be_clickable((
        By.XPATH, "//button[contains(.,'Objavi oglas')]"
    )))
    objavi_igru_btn.click()
    time.sleep(2)
    
    print("Igra objavljena")
    
    try:
        alert = wait.until(EC.alert_is_present())
        alert.accept()
        print("Alert prihvaćen: Igra je objavljena")
    except:
        print("Alert nije pronađen (validno stanje)")
    
    time.sleep(2)
    
    wait.until(EC.text_to_be_present_in_element(
        (By.TAG_NAME, "body"), "Moje igre"
    ))
    
    assert "Terraforming Mars" in driver.page_source
    print("Igra 'Terraforming Mars' pronađena u listi korisnikovih igara")
    
    print("DODAJ NOVU IGRU TEST USPJEŠAN")
    

    print("SVI TESTOVI USPJEŠNO ZAVRŠENI")


except Exception as e:
    print("GREŠKA U TESTU")
    print(e)

finally:
    time.sleep(3)
    driver.quit()
