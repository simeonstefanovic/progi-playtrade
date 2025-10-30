import React, { useState } from "react";
import "./Profile.css";

export default function Profile() {
  const [activeSection, setActiveSection] = useState("your-info");

  // 📦 korisnički podaci
  const [userData, setUserData] = useState({
    firstName: "Nikola",
    lastName: "Di Giusto",
    email: "nikola@example.com",
    city: "Rijeka",
  });

  // 📦 redeem code state
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemMessage, setRedeemMessage] = useState("");

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newPayment, setNewPayment] = useState({ name: "", number: "", cvv: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert("Promjene spremljene:\n" + JSON.stringify(userData, null, 2));
  };

  const handleRedeem = () => {
    const codePattern = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;
    if (codePattern.test(redeemCode.trim())) {
      setRedeemMessage("✅ Kod uspješno unesen!");
      setRedeemCode("");
    } else {
      setRedeemMessage("❌ Uneseni kod nije ispravan. Format: XXXX-XXXX-XXXX-XXXX");
    }
  };

  const handleLink = (service) => {
    let url = "";
    switch (service) {
      case "whatsapp": url = "https://web.whatsapp.com/"; break;
      case "facebook": url = "https://facebook.com/"; break;
      case "x": url = "https://x.com/"; break;
      case "instagram": url = "https://instagram.com/"; break;
      default: url = "#";
    }
    window.open(url, "_blank");
  };

  const handlePaymentInputChange = (e) => {
  const { name, value } = e.target;
  setNewPayment((prev) => ({ ...prev, [name]: value }));
};

const handleAddPaymentMethod = () => {
  // Jednostavna provjera valjanosti (dodatno može se proširiti)
  if (
    newPayment.name.trim() &&
    /^[0-9]{16}$/.test(newPayment.number) &&
    /^[0-9]{3}$/.test(newPayment.cvv)
  ) {
    setPaymentMethods((prev) => [...prev, newPayment]);
    setNewPayment({ name: "", number: "", cvv: "" });
  } else {
    alert("Molim te unesi ispravan naziv, broj kartice (16 znamenki) i CVV (3 znamenke)!");
  }
};

  // 🔹 sadržaj sekcija
  const renderContent = () => {
    switch (activeSection) {
      case "your-info":
        return (
          <form className="info-form" onSubmit={(e) => e.preventDefault()}>
            <label>
              Ime:
              <input
                type="text"
                name="firstName"
                value={userData.firstName}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Prezime:
              <input
                type="text"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Email:
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Mjesto prebivališta:
              <input
                type="text"
                name="city"
                value={userData.city}
                onChange={handleInputChange}
              />
            </label>

            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
          </form>
        );

      case "security":
        return <p>Ovdje će biti postavke sigurnosti (promjena lozinke itd.).</p>;

      case "profile":
        return <p>Prikaz profila korisnika.</p>;

      case "payment":
  return (
    <div className="payment-method-section">
      <h2>Payment Methods</h2>
      <ul className="payment-method-list">
        {paymentMethods.map((pm, idx) => (
          <li key={idx}>
            <b>{pm.name}:</b> {pm.number} / CVV: {pm.cvv}
          </li>
        ))}
      </ul>
      <div className="payment-method-form">
        <input
          type="text"
          name="name"
          value={newPayment.name}
          onChange={handlePaymentInputChange}
          placeholder="Card name (npr. Visa)"
        />
        <input
          type="text"
          name="number"
          value={newPayment.number}
          onChange={handlePaymentInputChange}
          placeholder="Card number (16 znamenki)"
          maxLength={16}
        />
        <input
          type="text"
          name="cvv"
          value={newPayment.cvv}
          onChange={handlePaymentInputChange}
          placeholder="CVV (3 znamenke)"
          maxLength={3}
        />
        <button className="add-payment-btn" onClick={handleAddPaymentMethod}>
          Add Payment Method
        </button>
      </div>
    </div>
  );

      case "redeem":
        return (
          <div className="redeem-section">
            <p>Unesi svoj kod za aktivaciju ponude ili kredita:</p>
            <div className="redeem-input-row">
              <input
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
              />
              <button className="redeem-btn" onClick={handleRedeem}>
                Unesi
              </button>
            </div>
            {redeemMessage && (
              <p
                className="redeem-message"
                style={{
                  color: redeemMessage.startsWith("✅") ? "green" : "red",
                }}
              >
                {redeemMessage}
              </p>
            )}
          </div>
        );

      case "linked":
        return (
          <div className="linked-services">
            <h2>Povezani servisi</h2>
            <div className="service-row">
              <span className="icon whatsapp-icon"></span>
              <span>WhatsApp</span>
              <button className="connect-btn" onClick={() => handleLink("whatsapp")}>Poveži</button>
            </div>
            <div className="service-row">
              <span className="icon facebook-icon"></span>
              <span>Facebook</span>
              <button className="connect-btn" onClick={() => handleLink("facebook")}>Poveži</button>
            </div>
            <div className="service-row">
              <span className="icon x-icon"></span>
              <span>X (Twitter)</span>
              <button className="connect-btn" onClick={() => handleLink("x")}>Poveži</button>
            </div>
            <div className="service-row">
              <span className="icon instagram-icon"></span>
              <span>Instagram</span>
              <button className="connect-btn" onClick={() => handleLink("instagram")}>Poveži</button>
            </div>
          </div>
        );

      case "transactions":
        return <p>Povijest transakcija.</p>;

      default:
        return <p>Odaberi kategoriju s desne strane.</p>;
    }
  };

  return (
    <div className="profile-container">
      <aside className="sidebar right">
        <div className="sidebar-section">
          <h3>Account</h3>
          <ul>
            <li
              className={activeSection === "your-info" ? "active" : ""}
              onClick={() => setActiveSection("your-info")}
            >
              Your Information
            </li>
            <li
              className={activeSection === "security" ? "active" : ""}
              onClick={() => setActiveSection("security")}
            >
              Security
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>Other</h3>
          <ul>
            <li
              className={activeSection === "profile" ? "active" : ""}
              onClick={() => setActiveSection("profile")}
            >
              Profile
            </li>
            <li
              className={activeSection === "payment" ? "active" : ""}
              onClick={() => setActiveSection("payment")}
            >
              Payment Methods
            </li>
            <li
              className={activeSection === "redeem" ? "active" : ""}
              onClick={() => setActiveSection("redeem")}
            >
              Redeem Code
            </li>
            <li
              className={activeSection === "linked" ? "active" : ""}
              onClick={() => setActiveSection("linked")}
            >
              Linked Services
            </li>
            <li
              className={activeSection === "transactions" ? "active" : ""}
              onClick={() => setActiveSection("transactions")}
            >
              Transaction History
            </li>
          </ul>
        </div>

        <button className="signout-btn">Sign Out</button>
      </aside>

      <main className="profile-content">
        <h1>
          {activeSection
            .replace("-", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}
        </h1>
        <div className="content-box">{renderContent()}</div>
      </main>
    </div>
  );
}
